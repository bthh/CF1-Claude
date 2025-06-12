use cosmwasm_std::{StdError, Uint128};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("Unauthorized")]
    Unauthorized {},

    #[error("Proposal not found")]
    ProposalNotFound {},

    #[error("Proposal is not active")]
    ProposalNotActive {},

    #[error("Investment not found")]
    InvestmentNotFound {},

    #[error("Creator not found")]
    CreatorNotFound {},

    #[error("Funding period too short")]
    FundingPeriodTooShort {},

    #[error("Funding period too long")]
    FundingPeriodTooLong {},

    #[error("Invalid target amount")]
    InvalidTargetAmount {},

    #[error("Invalid token price")]
    InvalidTokenPrice {},

    #[error("Invalid total shares")]
    InvalidTotalShares {},

    #[error("Invalid platform fee (maximum 100%)")]
    InvalidPlatformFee {},

    #[error("Investment amount below minimum")]
    InvestmentBelowMinimum {},

    #[error("Investment amount exceeds available shares")]
    InvestmentExceedsAvailable {},

    #[error("Proposal funding deadline has passed")]
    FundingDeadlinePassed {},

    #[error("Funding deadline has expired")]
    FundingDeadlineExpired {},

    #[error("Proposal is not funded")]
    ProposalNotFunded {},

    #[error("Tokens already minted for this proposal")]
    TokensAlreadyMinted {},

    #[error("Tokens not yet minted for this proposal")]
    TokensNotMinted {},

    #[error("Insufficient funds sent")]
    InsufficientFunds {},

    #[error("Function not implemented")]
    NotImplemented {},

    #[error("Invalid shares calculation")]
    InvalidSharesCalculation {},

    #[error("Proposal already funded")]
    ProposalAlreadyFunded {},

    #[error("No investments to refund")]
    NoInvestmentsToRefund {},

    #[error("Refund failed")]
    RefundFailed {},

    #[error("Tokens are still in lockup period")]
    TokensInLockup {},

    // Security-related errors
    #[error("Investment too small, minimum: {minimum}")]
    InvestmentTooSmall { minimum: Uint128 },

    #[error("Investment too large, maximum: {maximum}")]
    InvestmentTooLarge { maximum: Uint128 },

    #[error("Investment exceeds target: target={target}, current={current}, investment={investment}")]
    InvestmentExceedsTarget {
        target: Uint128,
        current: Uint128,
        investment: Uint128,
    },

    #[error("Invalid input for field {field}: {message}")]
    InvalidInput { field: String, message: String },

    #[error("Mathematical overflow in {operation}")]
    Overflow { operation: String },

    #[error("Mathematical underflow in {operation}")]
    Underflow { operation: String },

    #[error("Division by zero")]
    DivisionByZero {},

    #[error("Rate limit exceeded for operation: {operation} (limit: {limit} per {window_seconds}s)")]
    RateLimitExceeded { 
        operation: String,
        limit: u32,
        window_seconds: u64,
    },

    #[error("Maximum proposals per creator exceeded: {max}")]
    MaxProposalsExceeded { max: u32 },

    #[error("Maximum investors per proposal exceeded: {max}")]
    MaxInvestorsExceeded { max: u32 },

    #[error("Reentrancy detected in operation: {operation}")]
    ReentrancyDetected { operation: String },

    #[error("Gas limit exceeded for operation: {operation}")]
    GasLimitExceeded { operation: String },

    #[error("Contract migration not allowed")]
    MigrationNotAllowed {},

    #[error("Feature not enabled: {feature}")]
    FeatureNotEnabled { feature: String },
}