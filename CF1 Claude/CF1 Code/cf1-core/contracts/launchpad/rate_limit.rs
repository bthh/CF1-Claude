use cosmwasm_std::{Addr, Storage, Env, StdResult, StdError};
use cw_storage_plus::{Map, Item};
use serde::{Deserialize, Serialize};
use crate::error::ContractError;

/// Rate limit configuration
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct RateLimitConfig {
    /// Time window in seconds
    pub window_seconds: u64,
    /// Maximum operations per window
    pub max_operations: u32,
    /// Enable/disable rate limiting
    pub enabled: bool,
    /// Operations to exclude from rate limiting (admin operations)
    pub excluded_operations: Vec<String>,
}

impl Default for RateLimitConfig {
    fn default() -> Self {
        Self {
            window_seconds: 3600, // 1 hour
            max_operations: 100,
            enabled: true,
            excluded_operations: vec![
                "query".to_string(),
                "admin_update".to_string(),
            ],
        }
    }
}

/// User operation tracking
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct UserOperations {
    /// Window start timestamp
    pub window_start: u64,
    /// Number of operations in current window
    pub operation_count: u32,
    /// Last operation timestamp
    pub last_operation: u64,
}

/// Operation-specific rate limits
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct OperationLimit {
    pub operation: String,
    pub max_per_window: u32,
    pub window_seconds: u64,
}

// Storage keys
pub const RATE_LIMIT_CONFIG: Item<RateLimitConfig> = Item::new("rate_limit_config");
pub const USER_OPERATIONS: Map<(&Addr, &str), UserOperations> = Map::new("user_operations");
pub const OPERATION_LIMITS: Map<&str, OperationLimit> = Map::new("operation_limits");

/// Rate limiter implementation
pub struct RateLimiter;

impl RateLimiter {
    /// Initialize rate limiting with default configuration
    pub fn initialize(storage: &mut dyn Storage) -> StdResult<()> {
        let config = RateLimitConfig::default();
        RATE_LIMIT_CONFIG.save(storage, &config)?;
        
        // Set operation-specific limits
        let operation_limits = vec![
            OperationLimit {
                operation: "create_proposal".to_string(),
                max_per_window: 5,
                window_seconds: 86400, // 24 hours
            },
            OperationLimit {
                operation: "invest".to_string(),
                max_per_window: 50,
                window_seconds: 3600, // 1 hour
            },
            OperationLimit {
                operation: "update_proposal".to_string(),
                max_per_window: 20,
                window_seconds: 3600, // 1 hour
            },
            OperationLimit {
                operation: "mint_tokens".to_string(),
                max_per_window: 10,
                window_seconds: 86400, // 24 hours
            },
        ];
        
        for limit in operation_limits {
            OPERATION_LIMITS.save(storage, &limit.operation, &limit)?;
        }
        
        Ok(())
    }
    
    /// Check if user has exceeded rate limit
    pub fn check_rate_limit(
        storage: &dyn Storage,
        user: &Addr,
        operation: &str,
        env: &Env,
    ) -> Result<(), ContractError> {
        // Load rate limit configuration
        let config = RATE_LIMIT_CONFIG.load(storage)?;
        
        // Skip if rate limiting is disabled
        if !config.enabled {
            return Ok(());
        }
        
        // Skip excluded operations
        if config.excluded_operations.contains(&operation.to_string()) {
            return Ok(());
        }
        
        let current_time = env.block.time.seconds();
        
        // Check operation-specific limits first
        if let Ok(op_limit) = OPERATION_LIMITS.load(storage, operation) {
            return Self::check_operation_limit(
                storage,
                user,
                operation,
                current_time,
                op_limit.max_per_window,
                op_limit.window_seconds,
            );
        }
        
        // Fall back to global limits
        Self::check_operation_limit(
            storage,
            user,
            operation,
            current_time,
            config.max_operations,
            config.window_seconds,
        )
    }
    
    /// Check operation-specific rate limit
    fn check_operation_limit(
        storage: &dyn Storage,
        user: &Addr,
        operation: &str,
        current_time: u64,
        max_operations: u32,
        window_seconds: u64,
    ) -> Result<(), ContractError> {
        let key = (user, operation);
        
        match USER_OPERATIONS.may_load(storage, key)? {
            Some(mut user_ops) => {
                // Check if we're still in the same window
                if current_time < user_ops.window_start + window_seconds {
                    // Same window - check count
                    if user_ops.operation_count >= max_operations {
                        return Err(ContractError::RateLimitExceeded {
                            operation: operation.to_string(),
                            limit: max_operations,
                            window_seconds,
                        });
                    }
                    // Increment count
                    user_ops.operation_count += 1;
                    user_ops.last_operation = current_time;
                } else {
                    // New window - reset
                    user_ops.window_start = current_time;
                    user_ops.operation_count = 1;
                    user_ops.last_operation = current_time;
                }
                
                USER_OPERATIONS.save(storage, key, &user_ops)?;
            }
            None => {
                // First operation for this user
                let user_ops = UserOperations {
                    window_start: current_time,
                    operation_count: 1,
                    last_operation: current_time,
                };
                USER_OPERATIONS.save(storage, key, &user_ops)?;
            }
        }
        
        Ok(())
    }
    
    /// Record an operation (updates rate limit counters)
    pub fn record_operation(
        storage: &mut dyn Storage,
        user: &Addr,
        operation: &str,
        env: &Env,
    ) -> Result<(), ContractError> {
        // Check rate limit first
        Self::check_rate_limit(storage, user, operation, env)?;
        
        // Operation is allowed and has been recorded
        Ok(())
    }
    
    /// Update rate limit configuration (admin only)
    pub fn update_config(
        storage: &mut dyn Storage,
        window_seconds: Option<u64>,
        max_operations: Option<u32>,
        enabled: Option<bool>,
    ) -> StdResult<()> {
        let mut config = RATE_LIMIT_CONFIG.load(storage)?;
        
        if let Some(window) = window_seconds {
            config.window_seconds = window;
        }
        if let Some(max) = max_operations {
            config.max_operations = max;
        }
        if let Some(enabled) = enabled {
            config.enabled = enabled;
        }
        
        RATE_LIMIT_CONFIG.save(storage, &config)?;
        Ok(())
    }
    
    /// Update operation-specific limit (admin only)
    pub fn update_operation_limit(
        storage: &mut dyn Storage,
        operation: &str,
        max_per_window: u32,
        window_seconds: u64,
    ) -> StdResult<()> {
        let limit = OperationLimit {
            operation: operation.to_string(),
            max_per_window,
            window_seconds,
        };
        
        OPERATION_LIMITS.save(storage, operation, &limit)?;
        Ok(())
    }
    
    /// Get user's current rate limit status
    pub fn get_user_status(
        storage: &dyn Storage,
        user: &Addr,
        operation: &str,
        env: &Env,
    ) -> StdResult<(u32, u32, u64)> {
        let current_time = env.block.time.seconds();
        let key = (user, operation);
        
        // Get the applicable limit
        let (max_operations, window_seconds) = if let Ok(op_limit) = OPERATION_LIMITS.load(storage, operation) {
            (op_limit.max_per_window, op_limit.window_seconds)
        } else {
            let config = RATE_LIMIT_CONFIG.load(storage)?;
            (config.max_operations, config.window_seconds)
        };
        
        match USER_OPERATIONS.may_load(storage, key)? {
            Some(user_ops) => {
                if current_time < user_ops.window_start + window_seconds {
                    // Still in the same window
                    let remaining = max_operations.saturating_sub(user_ops.operation_count);
                    let window_end = user_ops.window_start + window_seconds;
                    Ok((user_ops.operation_count, remaining, window_end))
                } else {
                    // New window
                    Ok((0, max_operations, current_time + window_seconds))
                }
            }
            None => {
                // No operations yet
                Ok((0, max_operations, current_time + window_seconds))
            }
        }
    }
    
    /// Clean up old rate limit data (maintenance function)
    pub fn cleanup_old_data(
        storage: &mut dyn Storage,
        env: &Env,
        max_age_seconds: u64,
    ) -> StdResult<u32> {
        let current_time = env.block.time.seconds();
        let cutoff_time = current_time.saturating_sub(max_age_seconds);
        let mut cleaned = 0u32;
        
        // This would require iterating through all USER_OPERATIONS entries
        // In a real implementation, you'd use pagination and batch processing
        // For now, we'll return 0 as a placeholder
        
        Ok(cleaned)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use cosmwasm_std::testing::{mock_env, MockStorage};
    
    #[test]
    fn test_rate_limit_initialization() {
        let mut storage = MockStorage::new();
        
        // Initialize rate limiting
        RateLimiter::initialize(&mut storage).unwrap();
        
        // Check config was saved
        let config = RATE_LIMIT_CONFIG.load(&storage).unwrap();
        assert_eq!(config.window_seconds, 3600);
        assert_eq!(config.max_operations, 100);
        assert!(config.enabled);
        
        // Check operation limits were saved
        let create_limit = OPERATION_LIMITS.load(&storage, "create_proposal").unwrap();
        assert_eq!(create_limit.max_per_window, 5);
        assert_eq!(create_limit.window_seconds, 86400);
    }
    
    #[test]
    fn test_rate_limit_enforcement() {
        let mut storage = MockStorage::new();
        let env = mock_env();
        let user = Addr::unchecked("user1");
        
        RateLimiter::initialize(&mut storage).unwrap();
        
        // Update invest limit to something testable
        RateLimiter::update_operation_limit(&mut storage, "invest", 3, 3600).unwrap();
        
        // First 3 operations should succeed
        for i in 0..3 {
            RateLimiter::record_operation(&mut storage, &user, "invest", &env).unwrap();
        }
        
        // 4th operation should fail
        let result = RateLimiter::record_operation(&mut storage, &user, "invest", &env);
        assert!(result.is_err());
        
        // Check error type
        match result.unwrap_err() {
            ContractError::RateLimitExceeded { operation, limit, window_seconds } => {
                assert_eq!(operation, "invest");
                assert_eq!(limit, 3);
                assert_eq!(window_seconds, 3600);
            }
            _ => panic!("Wrong error type"),
        }
    }
    
    #[test]
    fn test_window_reset() {
        let mut storage = MockStorage::new();
        let mut env = mock_env();
        let user = Addr::unchecked("user1");
        
        RateLimiter::initialize(&mut storage).unwrap();
        RateLimiter::update_operation_limit(&mut storage, "test_op", 2, 1000).unwrap();
        
        // Use up the limit
        RateLimiter::record_operation(&mut storage, &user, "test_op", &env).unwrap();
        RateLimiter::record_operation(&mut storage, &user, "test_op", &env).unwrap();
        
        // Should fail
        assert!(RateLimiter::record_operation(&mut storage, &user, "test_op", &env).is_err());
        
        // Move time forward past the window
        env.block.time = env.block.time.plus_seconds(1001);
        
        // Should succeed in new window
        assert!(RateLimiter::record_operation(&mut storage, &user, "test_op", &env).is_ok());
    }
    
    #[test]
    fn test_get_user_status() {
        let mut storage = MockStorage::new();
        let env = mock_env();
        let user = Addr::unchecked("user1");
        
        RateLimiter::initialize(&mut storage).unwrap();
        RateLimiter::update_operation_limit(&mut storage, "test_op", 5, 3600).unwrap();
        
        // Check initial status
        let (used, remaining, window_end) = RateLimiter::get_user_status(&storage, &user, "test_op", &env).unwrap();
        assert_eq!(used, 0);
        assert_eq!(remaining, 5);
        
        // Do some operations
        RateLimiter::record_operation(&mut storage, &user, "test_op", &env).unwrap();
        RateLimiter::record_operation(&mut storage, &user, "test_op", &env).unwrap();
        
        // Check updated status
        let (used, remaining, window_end) = RateLimiter::get_user_status(&storage, &user, "test_op", &env).unwrap();
        assert_eq!(used, 2);
        assert_eq!(remaining, 3);
    }
}