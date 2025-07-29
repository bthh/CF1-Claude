use cosmwasm_std::{Addr, Deps, DepsMut, StdResult, Uint128};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::state::{ProposalStatus, PROPOSALS, TOKEN_CONTRACTS};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct GovernanceInfo {
    pub proposal_id: String,
    pub token_address: Option<Addr>,
    pub governance_active: bool,
    pub voting_power_total: u64,
    pub can_create_proposals: bool,
    pub min_voting_threshold: u64,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct VotingPowerInfo {
    pub user: Addr,
    pub proposal_id: String,
    pub token_balance: u64,
    pub voting_power: u64,
    pub can_vote: bool,
    pub lockup_status: String,
}

/// Get governance information for a proposal
pub fn get_governance_info(deps: Deps, proposal_id: &str) -> StdResult<GovernanceInfo> {
    let proposal = PROPOSALS.load(deps.storage, proposal_id.to_string())?;

    // Check if governance is active (only for completed proposals with distributed tokens)
    let governance_active = matches!(proposal.status, ProposalStatus::Completed);

    // Get token contract address if tokens are minted
    let token_address = if proposal.funding_status.tokens_minted {
        TOKEN_CONTRACTS.may_load(deps.storage, proposal_id.to_string())?
    } else {
        None
    };

    // Calculate total voting power (total distributed tokens)
    let voting_power_total = if governance_active {
        proposal.financial_terms.total_shares
    } else {
        0
    };

    // Minimum threshold for proposal creation (e.g., 1% of total supply)
    let min_voting_threshold = voting_power_total / 100; // 1%

    Ok(GovernanceInfo {
        proposal_id: proposal_id.to_string(),
        token_address,
        governance_active,
        voting_power_total,
        can_create_proposals: governance_active,
        min_voting_threshold,
    })
}

/// Get voting power information for a user on a specific proposal
pub fn get_user_voting_power(
    deps: Deps,
    proposal_id: &str,
    user: &Addr,
) -> StdResult<VotingPowerInfo> {
    let proposal = PROPOSALS.load(deps.storage, proposal_id.to_string())?;

    // Get user's investment to determine their token holdings
    let investment =
        crate::state::INVESTMENTS.may_load(deps.storage, (proposal_id.to_string(), user))?;

    let (token_balance, voting_power, can_vote) = if let Some(inv) = investment {
        // User has tokens from investment
        let balance = inv.shares;

        // Voting power equals token balance for asset-level governance
        let voting_power = balance;

        // Can vote if proposal governance is active and tokens are distributed
        let can_vote = matches!(proposal.status, ProposalStatus::Completed)
            && matches!(inv.status, crate::state::InvestmentStatus::Completed);

        (balance, voting_power, can_vote)
    } else {
        // User has no tokens for this proposal
        (0, 0, false)
    };

    let lockup_status = if proposal.timestamps.lockup_end.is_some() {
        if matches!(proposal.status, ProposalStatus::Completed) {
            "Lockup expired - governance active".to_string()
        } else {
            "In lockup period".to_string()
        }
    } else {
        "No lockup set".to_string()
    };

    Ok(VotingPowerInfo {
        user: user.clone(),
        proposal_id: proposal_id.to_string(),
        token_balance,
        voting_power,
        can_vote,
        lockup_status,
    })
}

/// Check if a user can create governance proposals for an asset
pub fn can_create_governance_proposal(
    deps: Deps,
    proposal_id: &str,
    user: &Addr,
) -> StdResult<bool> {
    let governance_info = get_governance_info(deps, proposal_id)?;
    let user_voting_power = get_user_voting_power(deps, proposal_id, user)?;

    Ok(governance_info.governance_active
        && user_voting_power.can_vote
        && user_voting_power.voting_power >= governance_info.min_voting_threshold)
}

/// Get all governance-eligible proposals for a user
pub fn get_user_governance_proposals(deps: Deps, user: &Addr) -> StdResult<Vec<GovernanceInfo>> {
    let mut governance_proposals = Vec::new();

    // Get all user investments
    if let Some(proposal_ids) = crate::state::USER_INVESTMENTS.may_load(deps.storage, user)? {
        for proposal_id in proposal_ids {
            let voting_power = get_user_voting_power(deps, &proposal_id, user)?;

            // Only include if user can vote
            if voting_power.can_vote {
                let governance_info = get_governance_info(deps, &proposal_id)?;
                governance_proposals.push(governance_info);
            }
        }
    }

    Ok(governance_proposals)
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct GovernanceIntegrationHooks {
    pub on_proposal_funded: String,
    pub on_tokens_distributed: String,
    pub on_lockup_expired: String,
}

/// Integration hooks for governance module
/// These would be called by external governance contracts
pub fn get_governance_hooks() -> GovernanceIntegrationHooks {
    GovernanceIntegrationHooks {
        on_proposal_funded: "notify_governance_proposal_funded".to_string(),
        on_tokens_distributed: "notify_governance_tokens_distributed".to_string(),
        on_lockup_expired: "notify_governance_lockup_expired".to_string(),
    }
}

/// Prepare governance setup data for external governance contract
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct GovernanceSetupData {
    pub asset_id: String,
    pub asset_name: String,
    pub token_contract: Addr,
    pub total_supply: u64,
    pub creator: Addr,
    pub shareholders: Vec<ShareholderInfo>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct ShareholderInfo {
    pub address: Addr,
    pub shares: u64,
    pub percentage: String,
}

/// Generate governance setup data when tokens are distributed
pub fn generate_governance_setup_data(
    deps: Deps,
    proposal_id: &str,
) -> StdResult<GovernanceSetupData> {
    let proposal = PROPOSALS.load(deps.storage, proposal_id.to_string())?;
    let token_contract = TOKEN_CONTRACTS.load(deps.storage, proposal_id.to_string())?;

    let mut shareholders = Vec::new();
    let total_supply = proposal.financial_terms.total_shares;

    // Get all shareholders
    for item in crate::state::INVESTMENTS
        .prefix(proposal_id.to_string())
        .range(deps.storage, None, None, cosmwasm_std::Order::Ascending)
    {
        let (shareholder_addr, investment) = item?;

        if matches!(investment.status, crate::state::InvestmentStatus::Completed) {
            let percentage = if total_supply > 0 {
                format!(
                    "{:.2}%",
                    (investment.shares as f64 / total_supply as f64) * 100.0
                )
            } else {
                "0.00%".to_string()
            };

            shareholders.push(ShareholderInfo {
                address: shareholder_addr,
                shares: investment.shares,
                percentage,
            });
        }
    }

    Ok(GovernanceSetupData {
        asset_id: proposal_id.to_string(),
        asset_name: proposal.asset_details.name,
        token_contract,
        total_supply,
        creator: proposal.creator,
        shareholders,
    })
}
