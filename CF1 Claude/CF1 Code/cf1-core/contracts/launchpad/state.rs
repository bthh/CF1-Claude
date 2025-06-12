use cosmwasm_std::{Addr, Uint128};
use cw_storage_plus::{Item, Map};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Config {
    pub admin: Addr,
    pub platform_fee_bps: u16, // basis points (e.g., 250 = 2.5%)
    pub min_funding_period_days: u64,
    pub max_funding_period_days: u64,
    pub lockup_period_seconds: u64, // 12 months in seconds
    pub cw20_code_id: u64, // Code ID for CW20 token instantiation
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Proposal {
    pub id: String,
    pub creator: Addr,
    pub asset_details: AssetDetails,
    pub financial_terms: FinancialTerms,
    pub funding_status: FundingStatus,
    pub documents: Vec<Document>,
    pub compliance: ComplianceInfo,
    pub timestamps: Timestamps,
    pub status: ProposalStatus,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct AssetDetails {
    pub name: String,
    pub asset_type: String,
    pub category: String,
    pub location: String,
    pub description: String,
    pub full_description: String,
    pub risk_factors: Vec<String>,
    pub highlights: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct FinancialTerms {
    pub target_amount: Uint128,
    pub token_price: Uint128,
    pub total_shares: u64,
    pub minimum_investment: Uint128,
    pub expected_apy: String,
    pub funding_deadline: u64, // Unix timestamp
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct FundingStatus {
    pub raised_amount: Uint128,
    pub investor_count: u64,
    pub is_funded: bool,
    pub tokens_minted: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Document {
    pub name: String,
    pub doc_type: String,
    pub size: String,
    pub hash: Option<String>, // IPFS hash or other content verification
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct ComplianceInfo {
    pub kyc_required: bool,
    pub accredited_only: bool,
    pub max_investors: Option<u64>,
    pub compliance_notes: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Timestamps {
    pub created_at: u64,
    pub updated_at: u64,
    pub funding_deadline: u64,
    pub lockup_end: Option<u64>, // Set after successful funding
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub enum ProposalStatus {
    Active,      // Accepting investments
    Funded,      // Goal reached, tokens can be minted
    Completed,   // Tokens minted and distributed
    Failed,      // Deadline passed without reaching goal
    Cancelled,   // Cancelled by creator before funding
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Investment {
    pub investor: Addr,
    pub proposal_id: String,
    pub amount: Uint128,
    pub shares: u64,
    pub timestamp: u64,
    pub status: InvestmentStatus,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub enum InvestmentStatus {
    Pending,    // In escrow, awaiting funding completion
    Completed,  // Tokens distributed
    Refunded,   // Investment refunded due to funding failure
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Creator {
    pub addr: Addr,
    pub name: String,
    pub total_raised: Uint128,
    pub successful_proposals: u64,
    pub total_proposals: u64,
    pub established: u64, // Unix timestamp
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct CreatorStats {
    pub rating: String,      // Calculated from success rate
    pub success_rate: u16,   // Percentage (0-100)
    pub total_raised: String, // Formatted string for UI
}

// Storage keys
pub const CONFIG: Item<Config> = Item::new("config");
pub const PROPOSALS: Map<String, Proposal> = Map::new("proposals");
pub const INVESTMENTS: Map<(String, &Addr), Investment> = Map::new("investments");
pub const PROPOSAL_INVESTMENTS: Map<String, Vec<Addr>> = Map::new("proposal_investments");
pub const USER_INVESTMENTS: Map<&Addr, Vec<String>> = Map::new("user_investments");
pub const CREATORS: Map<&Addr, Creator> = Map::new("creators");
pub const PROPOSAL_COUNT: Item<u64> = Item::new("proposal_count");
pub const TOKEN_CONTRACTS: Map<String, Addr> = Map::new("token_contracts"); // proposal_id -> token contract address
pub const PENDING_TOKEN_REPLY: Item<String> = Item::new("pending_token_reply"); // Stores proposal_id during token instantiation
pub const CREATOR_PROPOSAL_COUNT: Map<&Addr, u32> = Map::new("creator_proposal_count"); // Track proposals per creator
pub const PROPOSAL_INVESTOR_COUNT: Map<String, u32> = Map::new("proposal_investor_count"); // Track investors per proposal

// Helper functions for proposal ID generation
pub fn generate_proposal_id(count: u64) -> String {
    format!("proposal_{}", count)
}

// Constants matching business rules from CLAUDE.md
pub const MIN_FUNDING_PERIOD_DAYS: u64 = 7;
pub const MAX_FUNDING_PERIOD_DAYS: u64 = 120;
pub const LOCKUP_PERIOD_SECONDS: u64 = 365 * 24 * 60 * 60; // 12 months
pub const DEFAULT_PLATFORM_FEE_BPS: u16 = 250; // 2.5%