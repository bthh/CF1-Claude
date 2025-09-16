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
    pub cw20_code_id: u64,          // Code ID for CW20 token instantiation
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

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, JsonSchema)]
pub enum ProposalStatus {
    Active,    // Accepting investments
    Funded,    // Goal reached, tokens can be minted
    Completed, // Tokens minted and distributed
    Failed,    // Deadline passed without reaching goal
    Cancelled, // Cancelled by creator before funding
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
    Pending,   // In escrow, awaiting funding completion
    Completed, // Tokens distributed
    Refunded,  // Investment refunded due to funding failure
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
    pub rating: String,       // Calculated from success rate
    pub success_rate: u16,    // Percentage (0-100)
    pub total_raised: String, // Formatted string for UI
}

// Storage keys - Optimized for gas efficiency
pub const CONFIG: Item<Config> = Item::new("config");

// Hot data - frequently accessed
pub const PROPOSALS: Map<String, Proposal> = Map::new("proposals");
pub const PROPOSAL_COUNT: Item<u64> = Item::new("proposal_count");
pub const PROPOSAL_HOT_DATA: Map<String, ProposalHotData> = Map::new("proposal_hot"); // Gas-optimized hot data

// Investment data - optimized storage pattern
pub const INVESTMENTS: Map<(String, &Addr), Investment> = Map::new("investments");
pub const INVESTMENT_INDEX: Map<&Addr, Vec<String>> = Map::new("inv_idx"); // User -> Proposal IDs (compressed)
pub const PROPOSAL_STATS: Map<String, ProposalStats> = Map::new("prop_stats"); // Aggregated data

// Creator data
pub const CREATORS: Map<&Addr, Creator> = Map::new("creators");
pub const CREATOR_STATS: Map<&Addr, CreatorCompactStats> = Map::new("creator_stats"); // Compressed stats

// Token and contract management
pub const TOKEN_CONTRACTS: Map<String, Addr> = Map::new("token_contracts");
pub const PENDING_TOKEN_REPLY: Item<String> = Item::new("pending_token_reply");

// Indexed data for efficient queries
pub const ACTIVE_PROPOSALS: Map<u64, String> = Map::new("active_idx"); // timestamp -> proposal_id
pub const FUNDED_PROPOSALS: Map<u64, String> = Map::new("funded_idx"); // timestamp -> proposal_id
pub const CREATOR_PROPOSAL_INDEX: Map<(&Addr, u64), String> = Map::new("creator_idx"); // (creator, timestamp) -> proposal_id
pub const CREATOR_PROPOSAL_COUNT: Map<&Addr, u32> = Map::new("creator_count"); // creator -> proposal count
pub const USER_INVESTMENTS: Map<&Addr, Vec<String>> = Map::new("user_inv"); // user -> proposal_ids
pub const PROPOSAL_INVESTMENTS: Map<String, Vec<Addr>> = Map::new("prop_inv"); // proposal_id -> investors
pub const PROPOSAL_INVESTOR_COUNT: Map<String, u32> = Map::new("prop_inv_count"); // proposal_id -> count

// Gas-optimized data structures for hot path operations
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct ProposalHotData {
    pub status: ProposalStatus,
    pub target_amount: Uint128,
    pub raised_amount: Uint128,
    pub investor_count: u32,
    pub funding_deadline: u64,
    pub creator: Addr,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct ProposalStats {
    pub total_investment: Uint128,
    pub investor_count: u32,
    pub last_investment_time: u64,
    pub shares_sold: u64,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct CreatorCompactStats {
    pub total_raised: Uint128,
    pub success_count: u16,
    pub total_count: u16,
    pub last_active: u64,
}

// Helper functions for proposal ID generation
pub fn generate_proposal_id(count: u64) -> String {
    format!("p{}", count) // Shorter IDs for gas efficiency
}

// Gas-efficient data access patterns
pub fn get_proposal_hot_data(storage: &dyn cosmwasm_std::Storage, proposal_id: &str) -> cosmwasm_std::StdResult<ProposalHotData> {
    PROPOSAL_HOT_DATA.load(storage, proposal_id.to_string())
}

pub fn update_proposal_stats(storage: &mut dyn cosmwasm_std::Storage, proposal_id: &str, investment_amount: Uint128) -> cosmwasm_std::StdResult<()> {
    PROPOSAL_STATS.update(storage, proposal_id.to_string(), |stats| -> cosmwasm_std::StdResult<ProposalStats> {
        let mut stats = stats.unwrap_or(ProposalStats {
            total_investment: Uint128::zero(),
            investor_count: 0,
            last_investment_time: 0,
            shares_sold: 0,
        });
        stats.total_investment += investment_amount;
        stats.investor_count += 1;
        Ok(stats)
    })?;
    Ok(())
}

// Constants matching business rules from CLAUDE.md
pub const MIN_FUNDING_PERIOD_DAYS: u64 = 7;
pub const MAX_FUNDING_PERIOD_DAYS: u64 = 120;
pub const LOCKUP_PERIOD_SECONDS: u64 = 365 * 24 * 60 * 60; // 12 months
pub const DEFAULT_PLATFORM_FEE_BPS: u16 = 250; // 2.5%
