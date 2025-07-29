use cosmwasm_schema::{cw_serde, QueryResponses};
use cosmwasm_std::{Addr, Uint128};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::state::{
    AssetDetails, ComplianceInfo, Creator, Document, FinancialTerms, Investment, Proposal,
    ProposalStatus,
};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InstantiateMsg {
    pub admin: Option<String>,
    pub platform_fee_bps: Option<u16>,
    pub cw20_code_id: u64,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    // Proposal Management
    CreateProposal {
        asset_details: AssetDetails,
        financial_terms: FinancialTerms,
        documents: Vec<Document>,
        compliance: ComplianceInfo,
    },
    UpdateProposal {
        proposal_id: String,
        asset_details: Option<AssetDetails>,
        documents: Option<Vec<Document>>,
    },
    CancelProposal {
        proposal_id: String,
    },

    // Investment Management
    Invest {
        proposal_id: String,
    },
    RefundInvestors {
        proposal_id: String,
    },

    // Token Management (post-funding)
    MintTokens {
        proposal_id: String,
    },
    DistributeTokens {
        proposal_id: String,
    },

    // Admin Functions
    UpdateConfig {
        admin: Option<String>,
        platform_fee_bps: Option<u16>,
        min_funding_period_days: Option<u64>,
        max_funding_period_days: Option<u64>,
        cw20_code_id: Option<u64>,
    },
    ProcessExpiredProposals {},
    ProcessExpiredLockups {},

    // Rate limit management (admin only)
    UpdateRateLimitConfig {
        window_seconds: Option<u64>,
        max_operations: Option<u32>,
        enabled: Option<bool>,
    },
    UpdateOperationLimit {
        operation: String,
        max_per_window: u32,
        window_seconds: u64,
    },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema, QueryResponses)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    // Configuration
    #[returns(crate::state::Config)]
    Config {},

    // Proposal queries
    #[returns(ProposalResponse)]
    Proposal { proposal_id: String },
    #[returns(ProposalsResponse)]
    ProposalsByCreator {
        creator: String,
        start_after: Option<String>,
        limit: Option<u32>,
    },
    #[returns(ProposalsResponse)]
    ProposalsByStatus {
        status: ProposalStatus,
        start_after: Option<String>,
        limit: Option<u32>,
    },
    #[returns(ProposalsResponse)]
    AllProposals {
        start_after: Option<String>,
        limit: Option<u32>,
    },

    // Investment queries
    #[returns(InvestmentResponse)]
    Investment {
        proposal_id: String,
        investor: String,
    },
    #[returns(InvestmentsResponse)]
    InvestmentsByProposal {
        proposal_id: String,
        start_after: Option<String>,
        limit: Option<u32>,
    },
    #[returns(InvestmentsResponse)]
    InvestmentsByUser {
        user: String,
        start_after: Option<String>,
        limit: Option<u32>,
    },

    // Creator queries
    #[returns(CreatorResponse)]
    Creator { creator: String },
    #[returns(CreatorStats)]
    CreatorStats { creator: String },

    // Analytics queries
    #[returns(Uint128)]
    TotalValueLocked {},
    #[returns(PlatformStats)]
    PlatformStats {},

    // Portfolio queries
    #[returns(InvestmentsResponse)]
    UserPortfolio {
        user: String,
        start_after: Option<String>,
        limit: Option<u32>,
    },
    #[returns(InvestmentResponse)]
    PortfolioPerformance { user: String },

    // Rate limit queries
    #[returns(String)]
    RateLimitStatus { user: String, operation: String },
    #[returns(String)]
    RateLimitConfig {},

    // Lockup queries
    #[returns(String)]
    LockupInfo { proposal_id: String },
    #[returns(String)]
    LockupStatus { proposal_id: String },

    // Compliance queries
    #[returns(String)]
    ComplianceReport { proposal_id: String },
    #[returns(String)]
    PlatformComplianceReport {},

    // Governance queries
    #[returns(String)]
    GovernanceInfo { proposal_id: String },
    #[returns(String)]
    UserVotingPower { proposal_id: String, user: String },
    #[returns(String)]
    UserGovernanceProposals { user: String },
    #[returns(String)]
    GovernanceSetupData { proposal_id: String },
}

// Response types
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct ProposalResponse {
    pub proposal: Proposal,
    pub funding_progress: FundingProgress,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct FundingProgress {
    pub raised_percentage: u64,
    pub days_remaining: i64,
    pub investors_count: u64,
    pub shares_sold: u64,
    pub shares_remaining: u64,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct ProposalsResponse {
    pub proposals: Vec<ProposalResponse>,
    pub total_count: u64,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InvestmentResponse {
    pub investment: Investment,
    pub proposal_title: String,
    pub current_value: Uint128, // Current estimated value
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InvestmentsResponse {
    pub investments: Vec<InvestmentResponse>,
    pub total_invested: Uint128,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct CreatorResponse {
    pub creator: Creator,
    pub stats: CreatorStats,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct CreatorStats {
    pub rating: String,
    pub success_rate: u16,
    pub total_raised_formatted: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct PlatformStats {
    pub total_proposals: u64,
    pub active_proposals: u64,
    pub total_raised: Uint128,
    pub total_investors: u64,
    pub successful_proposals: u64,
}

// Migration message
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct MigrateMsg {}
