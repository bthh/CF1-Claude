use cosmwasm_std::{Deps, DepsMut, Env, MessageInfo, Response, StdResult, Uint128, Addr};
use cw20::Cw20ExecuteMsg;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::error::ContractError;
use crate::state::{PROPOSALS, TOKEN_CONTRACTS, ProposalStatus};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct LockupInfo {
    pub proposal_id: String,
    pub token_address: Addr,
    pub lockup_start: u64,
    pub lockup_end: u64,
    pub is_active: bool,
}

/// Check if tokens are still in lockup period
pub fn is_in_lockup_period(
    deps: Deps,
    env: Env,
    proposal_id: &str,
) -> StdResult<bool> {
    let proposal = PROPOSALS.load(deps.storage, proposal_id)?;
    
    if let Some(lockup_end) = proposal.timestamps.lockup_end {
        Ok(env.block.time.seconds() < lockup_end)
    } else {
        // If no lockup end set, assume still in lockup
        Ok(true)
    }
}

/// Get lockup information for a proposal
pub fn get_lockup_info(
    deps: Deps,
    env: Env,
    proposal_id: &str,
) -> StdResult<LockupInfo> {
    let proposal = PROPOSALS.load(deps.storage, proposal_id)?;
    let token_address = TOKEN_CONTRACTS.load(deps.storage, proposal_id)?;
    
    let lockup_end = proposal.timestamps.lockup_end.unwrap_or(0);
    let is_active = env.block.time.seconds() < lockup_end;
    
    Ok(LockupInfo {
        proposal_id: proposal_id.to_string(),
        token_address,
        lockup_start: proposal.timestamps.created_at,
        lockup_end,
        is_active,
    })
}

/// Validate that a transfer is allowed (not in lockup)
pub fn validate_transfer_allowed(
    deps: Deps,
    env: Env,
    proposal_id: &str,
) -> Result<(), ContractError> {
    if is_in_lockup_period(deps, env, proposal_id)? {
        return Err(ContractError::TokensInLockup {});
    }
    Ok(())
}

/// Get remaining lockup time in seconds
pub fn get_remaining_lockup_time(
    deps: Deps,
    env: Env,
    proposal_id: &str,
) -> StdResult<u64> {
    let proposal = PROPOSALS.load(deps.storage, proposal_id)?;
    
    if let Some(lockup_end) = proposal.timestamps.lockup_end {
        let current_time = env.block.time.seconds();
        if current_time < lockup_end {
            Ok(lockup_end - current_time)
        } else {
            Ok(0)
        }
    } else {
        // If no lockup end set, return max time (proposal not funded yet)
        Ok(u64::MAX)
    }
}

/// Check if lockup period has expired for all proposals and update status
pub fn process_expired_lockups(
    deps: DepsMut,
    env: Env,
    _info: MessageInfo,
) -> Result<Response, ContractError> {
    let current_time = env.block.time.seconds();
    let mut processed_count = 0u64;
    let mut unlocked_proposals = Vec::new();
    
    // Iterate through funded proposals to check for expired lockups
    for item in PROPOSALS.range(deps.storage, None, None, cosmwasm_std::Order::Ascending) {
        let (proposal_id, mut proposal) = item?;
        
        // Only process funded proposals with active lockups
        if proposal.status == ProposalStatus::Funded {
            if let Some(lockup_end) = proposal.timestamps.lockup_end {
                if current_time >= lockup_end {
                    // Lockup period has expired, mark as completed
                    proposal.status = ProposalStatus::Completed;
                    proposal.timestamps.updated_at = current_time;
                    PROPOSALS.save(deps.storage, &proposal_id, &proposal)?;
                    
                    unlocked_proposals.push(proposal_id.clone());
                    processed_count += 1;
                }
            }
        }
    }
    
    let mut response = Response::new()
        .add_attribute("method", "process_expired_lockups")
        .add_attribute("processed_count", processed_count.to_string());
    
    if !unlocked_proposals.is_empty() {
        response = response.add_attribute("unlocked_proposals", unlocked_proposals.join(","));
    }
    
    Ok(response)
}

/// Calculate lockup progress as percentage (0-100)
pub fn get_lockup_progress(
    deps: Deps,
    env: Env,
    proposal_id: &str,
) -> StdResult<u64> {
    let proposal = PROPOSALS.load(deps.storage, proposal_id)?;
    
    if let Some(lockup_end) = proposal.timestamps.lockup_end {
        let lockup_start = proposal.timestamps.created_at;
        let current_time = env.block.time.seconds();
        
        if current_time >= lockup_end {
            return Ok(100);
        }
        
        if current_time <= lockup_start {
            return Ok(0);
        }
        
        let total_duration = lockup_end - lockup_start;
        let elapsed = current_time - lockup_start;
        
        Ok((elapsed * 100) / total_duration)
    } else {
        // No lockup end set, assume 0% progress
        Ok(0)
    }
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct LockupStatus {
    pub is_locked: bool,
    pub lockup_end: Option<u64>,
    pub remaining_seconds: u64,
    pub progress_percentage: u64,
}

/// Get comprehensive lockup status for a proposal
pub fn get_lockup_status(
    deps: Deps,
    env: Env,
    proposal_id: &str,
) -> StdResult<LockupStatus> {
    let is_locked = is_in_lockup_period(deps, env, proposal_id)?;
    let remaining_seconds = get_remaining_lockup_time(deps, env, proposal_id)?;
    let progress_percentage = get_lockup_progress(deps, env, proposal_id)?;
    
    let proposal = PROPOSALS.load(deps.storage, proposal_id)?;
    
    Ok(LockupStatus {
        is_locked,
        lockup_end: proposal.timestamps.lockup_end,
        remaining_seconds,
        progress_percentage,
    })
}