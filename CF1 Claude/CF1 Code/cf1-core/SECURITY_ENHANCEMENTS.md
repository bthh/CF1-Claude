# Security Enhancements for CF1 Launchpad

## Overview
This document outlines the comprehensive security enhancements implemented in the CF1 Launchpad smart contract to ensure safe operation on mainnet.

## 1. Rate Limiting System

### Implementation
- **Module**: `rate_limit.rs` - Complete rate limiting infrastructure
- **Storage**: Tracks operations per user per time window
- **Flexibility**: Configurable per-operation limits

### Features
- **Global Rate Limits**: Default 100 operations per hour
- **Operation-Specific Limits**:
  - `create_proposal`: 5 per 24 hours
  - `invest`: 50 per hour
  - `update_proposal`: 20 per hour
  - `mint_tokens`: 10 per 24 hours

### Usage
```rust
// Automatically enforced on all critical operations
rate_limit::RateLimiter::record_operation(deps.storage, &info.sender, "operation_name", &env)?;
```

### Admin Controls
```json
// Update global rate limit config
{
  "update_rate_limit_config": {
    "window_seconds": 3600,
    "max_operations": 100,
    "enabled": true
  }
}

// Update specific operation limit
{
  "update_operation_limit": {
    "operation": "invest",
    "max_per_window": 50,
    "window_seconds": 3600
  }
}
```

## 2. Access Control Enhancements

### Creator Limits
- **Max Proposals per Creator**: 10 active proposals
- **Enforcement**: Checked during proposal creation
- **Storage**: `CREATOR_PROPOSAL_COUNT` map

### Investor Limits
- **Max Investors per Proposal**: 500 investors
- **Enforcement**: Checked during investment
- **Storage**: `PROPOSAL_INVESTOR_COUNT` map

### Enhanced Permissions
- **Proposal Updates**: Only creator or admin
- **Token Minting**: Only creator or admin after funding
- **Config Updates**: Admin only
- **Rate Limit Management**: Admin only

## 3. Input Validation & Sanitization

### Security Module Functions
- `InputValidator::validate_proposal_inputs()` - Comprehensive proposal validation
- `InputValidator::validate_investment_amount()` - Investment amount validation
- `InputValidator::sanitize_string_input()` - XSS/injection protection

### Validation Rules
- Asset names: 1-100 characters, no control characters
- Target amounts: Must be > 0
- Token prices: Must be > 0
- Funding deadlines: Must be future dates, max 120 days
- Investment amounts: Between min and max limits

## 4. Mathematical Safety

### Safe Math Operations
```rust
MathGuard::safe_add(a, b)    // Overflow protection
MathGuard::safe_sub(a, b)    // Underflow protection
MathGuard::safe_mul(a, b)    // Overflow protection
MathGuard::safe_div(a, b)    // Division by zero protection
MathGuard::calculate_percentage(amount, bps)  // Safe percentage calculation
```

### Investment Calculations
- All share calculations use safe math
- Platform fee calculations protected against overflow
- Token distribution calculations verified

## 5. State Management Security

### Atomic Operations
- Token minting uses `PENDING_TOKEN_REPLY` for atomic state tracking
- Investment updates are atomic with proper rollback
- Proposal status transitions are validated

### Reentrancy Protection
- CosmWasm's execution model prevents reentrancy
- Additional checks in `ReentrancyGuard` for critical operations
- State updates before external calls

## 6. Event Logging

### Security Events
```rust
SecurityLogger::log_security_event(
    "rate_limit_exceeded",
    &user_addr,
    "Investment attempt blocked"
)
```

### Tracked Events
- Rate limit violations
- Unauthorized access attempts
- Failed validations
- Admin actions

## 7. Query Security

### Rate Limit Status Query
```json
{
  "rate_limit_status": {
    "user": "neutron1...",
    "operation": "invest"
  }
}
```

Returns:
- Operations used in current window
- Operations remaining
- Window end timestamp

## 8. Error Handling

### Enhanced Error Types
- `RateLimitExceeded`: Includes operation, limit, and window
- `MaxProposalsExceeded`: Shows limit
- `MaxInvestorsExceeded`: Shows limit
- `InvalidInput`: Includes field and detailed message

## 9. Configuration

### Security Limits (Defaults)
```rust
SecurityLimits {
    max_proposals_per_creator: 10,
    min_investment_amount: Uint128::new(1_000_000), // 1 NTRN
    max_investment_amount: Uint128::new(1_000_000_000_000), // 1M NTRN
    max_investors_per_proposal: 500,
    rate_limit_window_seconds: 3600,
    max_operations_per_window: 100,
}
```

## 10. Testing

### Security Test Coverage
- Rate limit enforcement tests
- Access control validation tests
- Input validation edge cases
- Math overflow/underflow tests
- Concurrent operation tests

## Deployment Checklist

1. **Pre-Deployment**
   - [ ] Review all rate limits for production values
   - [ ] Verify admin address configuration
   - [ ] Test all security features on testnet
   - [ ] Run security audit

2. **Post-Deployment**
   - [ ] Monitor rate limit violations
   - [ ] Track security events
   - [ ] Adjust limits based on usage patterns
   - [ ] Regular security reviews

## Best Practices

1. **Rate Limits**: Start conservative, relax based on legitimate usage
2. **Monitoring**: Set up alerts for security events
3. **Updates**: Keep operation limits configurable for quick response
4. **Documentation**: Maintain clear docs on all limits for users

## Emergency Procedures

1. **Under Attack**:
   - Disable specific operations via rate limits
   - Set operation limit to 0 to pause functionality
   - Use admin functions to increase restrictions

2. **Recovery**:
   - Analyze attack patterns
   - Update limits to prevent future attacks
   - Re-enable operations gradually

## Future Enhancements

1. **IP-based rate limiting** (requires off-chain infrastructure)
2. **Dynamic rate limits** based on user reputation
3. **Multi-sig admin** for critical operations
4. **Time-locked admin actions** for transparency