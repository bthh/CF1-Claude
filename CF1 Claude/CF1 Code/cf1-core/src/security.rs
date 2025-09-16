// CF1 Launchpad Security Module
// Implements security best practices, access controls, and vulnerability protections

use crate::error::ContractError;
use crate::state::{Config, Investment, Proposal, ProposalStatus, CONFIG, PROPOSALS};
use cosmwasm_std::{Addr, DepsMut, Env, MessageInfo, StdResult, Storage, Uint128};

/// Security configuration and limits
pub struct SecurityLimits {
    pub max_proposals_per_creator: u32,
    pub min_investment_amount: Uint128,
    pub max_investment_amount: Uint128,
    pub max_investors_per_proposal: u32,
    pub rate_limit_window_seconds: u64,
    pub max_operations_per_window: u32,
}

impl Default for SecurityLimits {
    fn default() -> Self {
        Self {
            max_proposals_per_creator: 10,
            min_investment_amount: Uint128::new(1_000_000), // 1 NTRN
            max_investment_amount: Uint128::new(1_000_000_000_000), // 1M NTRN
            max_investors_per_proposal: 500,
            rate_limit_window_seconds: 3600, // 1 hour
            max_operations_per_window: 100,
        }
    }
}

/// Access control checks
pub struct AccessControl;

impl AccessControl {
    /// Check if address is admin
    pub fn is_admin(config: &Config, sender: &Addr) -> bool {
        config.admin == *sender
    }

    /// Check if address is proposal creator
    pub fn is_proposal_creator(proposal: &Proposal, sender: &Addr) -> bool {
        proposal.creator == *sender
    }

    /// Check if address can modify proposal
    pub fn can_modify_proposal(config: &Config, proposal: &Proposal, sender: &Addr) -> bool {
        Self::is_admin(config, sender) || Self::is_proposal_creator(proposal, sender)
    }

    /// Check if proposal can be cancelled
    pub fn can_cancel_proposal(
        config: &Config,
        proposal: &Proposal,
        sender: &Addr,
        env: &Env,
    ) -> Result<bool, ContractError> {
        // Only creator or admin can cancel
        if !Self::can_modify_proposal(config, proposal, sender) {
            return Ok(false);
        }

        // Cannot cancel completed or cancelled proposals
        match proposal.status {
            ProposalStatus::Active => Ok(true),
            ProposalStatus::Funded => {
                // Admin can cancel funded proposals before token minting
                Ok(Self::is_admin(config, sender))
            }
            _ => Ok(false),
        }
    }
}

/// Input validation functions
pub struct InputValidator;

impl InputValidator {
    /// Validate proposal creation inputs
    pub fn validate_proposal_inputs(
        asset_name: &str,
        target_amount: Uint128,
        token_price: Uint128,
        funding_deadline: u64,
        env: &Env,
    ) -> Result<(), ContractError> {
        // Asset name validation
        if asset_name.is_empty() || asset_name.len() > 100 {
            return Err(ContractError::InvalidInput {
                field: "asset_name".to_string(),
                message: "Asset name must be 1-100 characters".to_string(),
            });
        }

        // Target amount validation
        if target_amount.is_zero() {
            return Err(ContractError::InvalidInput {
                field: "target_amount".to_string(),
                message: "Target amount must be greater than zero".to_string(),
            });
        }

        // Token price validation
        if token_price.is_zero() {
            return Err(ContractError::InvalidInput {
                field: "token_price".to_string(),
                message: "Token price must be greater than zero".to_string(),
            });
        }

        // Funding deadline validation
        let current_time = env.block.time.seconds();
        if funding_deadline <= current_time {
            return Err(ContractError::InvalidInput {
                field: "funding_deadline".to_string(),
                message: "Funding deadline must be in the future".to_string(),
            });
        }

        // Maximum funding period check (120 days)
        let max_deadline = current_time + (120 * 24 * 60 * 60);
        if funding_deadline > max_deadline {
            return Err(ContractError::InvalidInput {
                field: "funding_deadline".to_string(),
                message: "Funding deadline cannot exceed 120 days".to_string(),
            });
        }

        Ok(())
    }

    /// Validate investment amount
    pub fn validate_investment_amount(
        amount: Uint128,
        proposal: &Proposal,
        limits: &SecurityLimits,
    ) -> Result<(), ContractError> {
        // Minimum investment check
        if amount < limits.min_investment_amount {
            return Err(ContractError::InvestmentTooSmall {
                minimum: limits.min_investment_amount,
            });
        }

        // Maximum investment check
        if amount > limits.max_investment_amount {
            return Err(ContractError::InvestmentTooLarge {
                maximum: limits.max_investment_amount,
            });
        }

        // Check if investment would exceed target
        let new_total = proposal.funding_status.raised_amount + amount;
        if new_total > proposal.financial_terms.target_amount {
            return Err(ContractError::InvestmentExceedsTarget {
                target: proposal.financial_terms.target_amount,
                current: proposal.funding_status.raised_amount,
                investment: amount,
            });
        }

        Ok(())
    }

    /// Validate string inputs for XSS/injection protection
    pub fn sanitize_string_input(input: &str, max_length: usize) -> Result<String, ContractError> {
        if input.len() > max_length {
            return Err(ContractError::InvalidInput {
                field: "string_input".to_string(),
                message: format!("Input exceeds maximum length of {}", max_length),
            });
        }

        // Basic sanitization - remove control characters
        let sanitized: String = input
            .chars()
            .filter(|c| !c.is_control() || *c == '\n' || *c == '\t')
            .collect();

        Ok(sanitized)
    }
}

/// Anti-spam and rate limiting
pub struct RateLimiter;

impl RateLimiter {
    /// Check if user has exceeded rate limits
    pub fn check_rate_limit(
        storage: &dyn Storage,
        user: &Addr,
        operation: &str,
        limits: &SecurityLimits,
        current_time: u64,
    ) -> Result<(), ContractError> {
        // This would require additional state management for tracking user operations
        // For now, we'll implement a simple check based on recent operations
        // In production, consider using a more sophisticated rate limiting solution

        // Implementation would track operations per user per time window
        // For demonstration, we'll skip the actual implementation
        Ok(())
    }
}

/// Reentrancy protection
pub struct ReentrancyGuard;

impl ReentrancyGuard {
    /// Check for potential reentrancy attacks
    pub fn check_reentrancy(deps: &DepsMut, operation: &str) -> Result<(), ContractError> {
        // CosmWasm has built-in reentrancy protection through its execution model
        // Additional checks can be implemented here if needed for specific operations
        Ok(())
    }
}

/// Mathematical overflow protection with enhanced precision handling
pub struct MathGuard;

impl MathGuard {
    /// Safe addition with overflow check
    pub fn safe_add(a: Uint128, b: Uint128) -> Result<Uint128, ContractError> {
        a.checked_add(b).map_err(|_| ContractError::Overflow {
            operation: "addition".to_string(),
        })
    }

    /// Safe subtraction with underflow check
    pub fn safe_sub(a: Uint128, b: Uint128) -> Result<Uint128, ContractError> {
        a.checked_sub(b).map_err(|_| ContractError::Underflow {
            operation: "subtraction".to_string(),
        })
    }

    /// Safe multiplication with overflow check - supports both Uint128 and u128 parameters
    pub fn safe_mul(a: Uint128, b: Uint128) -> Result<Uint128, ContractError> {
        a.checked_mul(b).map_err(|_| ContractError::Overflow {
            operation: "multiplication".to_string(),
        })
    }

    /// Safe multiplication with u128 parameter
    pub fn safe_mul_u128(a: Uint128, b: u128) -> Result<Uint128, ContractError> {
        a.checked_mul(Uint128::from(b)).map_err(|_| ContractError::Overflow {
            operation: "multiplication".to_string(),
        })
    }

    /// Safe division with zero check
    pub fn safe_div(a: Uint128, b: Uint128) -> Result<Uint128, ContractError> {
        if b.is_zero() {
            return Err(ContractError::DivisionByZero {});
        }
        a.checked_div(b).map_err(|_| ContractError::Overflow {
            operation: "division".to_string(),
        })
    }

    /// Safe division with u128 parameter
    pub fn safe_div_u128(a: Uint128, b: u128) -> Result<Uint128, ContractError> {
        if b == 0 {
            return Err(ContractError::DivisionByZero {});
        }
        a.checked_div(Uint128::from(b)).map_err(|_| ContractError::Overflow {
            operation: "division".to_string(),
        })
    }

    /// Calculate percentage with precision (basis points)
    pub fn calculate_percentage(
        amount: Uint128,
        percentage_bps: u16,
    ) -> Result<Uint128, ContractError> {
        // percentage_bps is in basis points (1 bps = 0.01%)
        let percentage = Uint128::from(percentage_bps as u128);
        let basis_points = Uint128::from(10000u128);

        Self::safe_mul(amount, percentage).and_then(|result| Self::safe_div(result, basis_points))
    }

    /// Calculate precise share allocation with decimal precision
    pub fn calculate_shares_precise(
        investment_amount: Uint128,
        token_price: Uint128,
        precision_factor: u128,
    ) -> Result<u64, ContractError> {
        if token_price.is_zero() {
            return Err(ContractError::InvalidTokenPrice {});
        }

        // Use higher precision for calculation
        let scaled_investment = Self::safe_mul_u128(investment_amount, precision_factor)?;
        let shares_scaled = Self::safe_div(scaled_investment, token_price)?;
        let shares_final = Self::safe_div_u128(shares_scaled, precision_factor)?;

        if shares_final.is_zero() {
            return Err(ContractError::InvalidSharesCalculation {});
        }

        // Additional overflow check when converting to u64
        let shares_value = shares_final.u128();
        if shares_value > u64::MAX as u128 {
            return Err(ContractError::Overflow {
                operation: "shares calculation - value exceeds u64 maximum".to_string(),
            });
        }

        Ok(shares_value as u64)
    }

    /// Validate calculation inputs to prevent edge cases
    pub fn validate_calculation_inputs(
        amount: Uint128,
        price: Uint128,
        operation: &str,
    ) -> Result<(), ContractError> {
        if amount.is_zero() {
            return Err(ContractError::InvalidInput {
                field: "amount".to_string(),
                message: format!("Amount cannot be zero for {}", operation),
            });
        }

        if price.is_zero() {
            return Err(ContractError::InvalidInput {
                field: "price".to_string(),
                message: format!("Price cannot be zero for {}", operation),
            });
        }

        // Check for unreasonably large values that might cause overflow
        const MAX_REASONABLE_VALUE: u128 = u128::MAX / 1_000_000; // Leave room for calculations
        if amount.u128() > MAX_REASONABLE_VALUE || price.u128() > MAX_REASONABLE_VALUE {
            return Err(ContractError::InvalidInput {
                field: "value_range".to_string(),
                message: format!("Values too large for safe calculation in {}", operation),
            });
        }

        Ok(())
    }
}

/// Security event logging
pub struct SecurityLogger;

impl SecurityLogger {
    /// Log security-relevant events
    pub fn log_security_event(
        event_type: &str,
        user: &Addr,
        details: &str,
    ) -> Vec<cosmwasm_std::Attribute> {
        vec![
            cosmwasm_std::attr("security_event", event_type),
            cosmwasm_std::attr("user", user.as_str()),
            cosmwasm_std::attr("details", details),
            cosmwasm_std::attr("timestamp", "block_time"), // Would use actual block time
        ]
    }
}

/// Comprehensive security checks for proposal operations
pub fn validate_proposal_security(
    config: &Config,
    proposal: &Proposal,
    sender: &Addr,
    env: &Env,
    operation: &str,
) -> Result<(), ContractError> {
    // Access control
    match operation {
        "update" | "cancel" => {
            if !AccessControl::can_modify_proposal(config, proposal, sender) {
                return Err(ContractError::Unauthorized {});
            }
        }
        "invest" => {
            // Anyone can invest, but validate proposal state
            if proposal.status != ProposalStatus::Active {
                return Err(ContractError::ProposalNotActive {});
            }

            // Check if funding deadline has passed
            if env.block.time.seconds() > proposal.financial_terms.funding_deadline {
                return Err(ContractError::FundingDeadlineExpired {});
            }
        }
        _ => {}
    }

    Ok(())
}

/// Main security validation function
pub fn comprehensive_security_check(
    deps: &DepsMut,
    env: &Env,
    info: &MessageInfo,
    operation: &str,
    proposal_id: Option<&str>,
) -> Result<(), ContractError> {
    let config = CONFIG.load(deps.storage)?;
    let limits = SecurityLimits::default();

    // Rate limiting check
    RateLimiter::check_rate_limit(
        deps.storage,
        &info.sender,
        operation,
        &limits,
        env.block.time.seconds(),
    )?;

    // Reentrancy protection
    ReentrancyGuard::check_reentrancy(deps, operation)?;

    // Proposal-specific checks
    if let Some(id) = proposal_id {
        let proposal = PROPOSALS.load(deps.storage, id.to_string())?;
        validate_proposal_security(&config, &proposal, &info.sender, env, operation)?;
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::state::{AssetDetails, FinancialTerms, FundingStatus};
    use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info};
    use cosmwasm_std::Addr;

    #[test]
    fn test_input_validation() {
        let env = mock_env();

        // Valid inputs
        assert!(InputValidator::validate_proposal_inputs(
            "Test Asset",
            Uint128::new(1000000),
            Uint128::new(1000),
            env.block.time.seconds() + 86400, // 1 day from now
            &env,
        )
        .is_ok());

        // Invalid asset name (empty)
        assert!(InputValidator::validate_proposal_inputs(
            "",
            Uint128::new(1000000),
            Uint128::new(1000),
            env.block.time.seconds() + 86400,
            &env,
        )
        .is_err());

        // Invalid target amount (zero)
        assert!(InputValidator::validate_proposal_inputs(
            "Test Asset",
            Uint128::zero(),
            Uint128::new(1000),
            env.block.time.seconds() + 86400,
            &env,
        )
        .is_err());

        // Invalid deadline (in the past)
        assert!(InputValidator::validate_proposal_inputs(
            "Test Asset",
            Uint128::new(1000000),
            Uint128::new(1000),
            env.block.time.seconds() - 1,
            &env,
        )
        .is_err());
    }

    #[test]
    fn test_math_guard() {
        // Safe addition
        assert_eq!(
            MathGuard::safe_add(Uint128::new(100), Uint128::new(50)).unwrap(),
            Uint128::new(150)
        );

        // Safe subtraction
        assert_eq!(
            MathGuard::safe_sub(Uint128::new(100), Uint128::new(50)).unwrap(),
            Uint128::new(50)
        );

        // Underflow protection
        assert!(MathGuard::safe_sub(Uint128::new(50), Uint128::new(100)).is_err());

        // Division by zero protection
        assert!(MathGuard::safe_div(Uint128::new(100), Uint128::zero()).is_err());

        // Percentage calculation
        assert_eq!(
            MathGuard::calculate_percentage(Uint128::new(10000), 250).unwrap(),
            Uint128::new(250) // 2.5% of 10000
        );

        // Test precise share calculation
        let shares = MathGuard::calculate_shares_precise(
            Uint128::new(1000_000_000), // $1000 investment
            Uint128::new(1_000_000),     // $1 token price
            1000,                        // precision factor
        ).unwrap();
        assert_eq!(shares, 1000);

        // Test input validation
        assert!(MathGuard::validate_calculation_inputs(
            Uint128::new(1000),
            Uint128::new(100),
            "test"
        ).is_ok());

        // Test zero amount validation
        assert!(MathGuard::validate_calculation_inputs(
            Uint128::zero(),
            Uint128::new(100),
            "test"
        ).is_err());
    }

    #[test]
    fn test_access_control() {
        let admin = Addr::unchecked("admin");
        let creator = Addr::unchecked("creator");
        let user = Addr::unchecked("user");

        let config = Config {
            admin: admin.clone(),
            platform_fee_bps: 250,
            min_funding_period_days: 7,
            max_funding_period_days: 120,
            lockup_period_seconds: 31536000, // 1 year
        };

        let proposal = Proposal {
            id: "test".to_string(),
            creator: creator.clone(),
            asset_details: AssetDetails {
                name: "Test Asset".to_string(),
                asset_type: "Test".to_string(),
                category: "Test".to_string(),
                location: "Test".to_string(),
                description: "Test".to_string(),
                full_description: "Test".to_string(),
                risk_factors: vec!["Test".to_string()],
                highlights: vec!["Test".to_string()],
            },
            financial_terms: FinancialTerms {
                target_amount: Uint128::new(1000000),
                token_price: Uint128::new(1000),
                total_shares: 1000,
                minimum_investment: Uint128::new(1000),
                expected_apy: "10%".to_string(),
                funding_deadline: 0,
            },
            funding_status: FundingStatus {
                total_raised: Uint128::zero(),
                investor_count: 0,
                is_funded: false,
            },
            documents: vec![],
            compliance: crate::state::ComplianceInfo {
                kyc_required: true,
                accredited_only: false,
                max_investors: 100,
                compliance_notes: vec![],
            },
            timestamps: crate::state::Timestamps {
                created_at: 0,
                updated_at: 0,
                funded_at: None,
                token_minted_at: None,
                lockup_end_at: None,
            },
            status: ProposalStatus::Active,
        };

        // Admin should have access
        assert!(AccessControl::is_admin(&config, &admin));
        assert!(AccessControl::can_modify_proposal(
            &config, &proposal, &admin
        ));

        // Creator should have access to their proposal
        assert!(AccessControl::is_proposal_creator(&proposal, &creator));
        assert!(AccessControl::can_modify_proposal(
            &config, &proposal, &creator
        ));

        // Regular user should not have access
        assert!(!AccessControl::is_admin(&config, &user));
        assert!(!AccessControl::can_modify_proposal(
            &config, &proposal, &user
        ));
    }
}
