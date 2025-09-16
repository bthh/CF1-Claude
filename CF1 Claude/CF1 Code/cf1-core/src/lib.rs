use cosmwasm_std::{
    entry_point, to_json_binary, Addr, BankMsg, Binary, Coin, CosmosMsg, Deps, DepsMut, Env,
    MessageInfo, ReplyOn, Response, StdResult, SubMsg, SubMsgResult, Timestamp, Uint128, WasmMsg,
};
use cw2::set_contract_version;
use cw20::{Cw20ExecuteMsg, MinterResponse};
use cw20_base::msg::InstantiateMsg as Cw20InstantiateMsg;

use crate::error::ContractError;
use crate::msg::{ExecuteMsg, InstantiateMsg, QueryMsg};
use crate::security::{MathGuard, ReentrancyGuard};
use crate::state::{
    generate_proposal_id, Config, Creator, Investment, InvestmentStatus, Proposal, ProposalStatus,
    Timestamps, CONFIG, CREATORS, CREATOR_PROPOSAL_COUNT, DEFAULT_PLATFORM_FEE_BPS, INVESTMENTS,
    MAX_FUNDING_PERIOD_DAYS, MIN_FUNDING_PERIOD_DAYS, PENDING_TOKEN_REPLY, PROPOSALS,
    PROPOSAL_COUNT, PROPOSAL_INVESTMENTS, PROPOSAL_INVESTOR_COUNT, TOKEN_CONTRACTS,
    USER_INVESTMENTS,
};

mod compliance;
pub mod error;
mod gas_optimization;
mod gas_monitor;
mod governance;
mod helpers;
mod lockup;
pub mod msg;
mod oracle;
mod rate_limit;
mod security;
pub mod state;

#[cfg(test)]
mod tests;

#[cfg(test)]
mod integration_tests;

const CONTRACT_NAME: &str = "cf1-launchpad";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

// Reply IDs for submessages
const REPLY_INSTANTIATE_TOKEN: u64 = 1;

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    let admin = msg
        .admin
        .map(|s| deps.api.addr_validate(&s))
        .transpose()?
        .unwrap_or_else(|| info.sender.clone());

    let config = Config {
        admin,
        platform_fee_bps: msg.platform_fee_bps.unwrap_or(DEFAULT_PLATFORM_FEE_BPS),
        min_funding_period_days: MIN_FUNDING_PERIOD_DAYS,
        max_funding_period_days: MAX_FUNDING_PERIOD_DAYS,
        lockup_period_seconds: crate::state::LOCKUP_PERIOD_SECONDS,
        cw20_code_id: msg.cw20_code_id,
    };

    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;
    CONFIG.save(deps.storage, &config)?;
    PROPOSAL_COUNT.save(deps.storage, &0u64)?;

    // Initialize rate limiting
    rate_limit::RateLimiter::initialize(deps.storage)?;

    Ok(Response::new()
        .add_attribute("action", "init")
        .add_attribute("admin", config.admin))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::CreateProposal {
            asset_details,
            financial_terms,
            documents,
            compliance,
        } => execute_create_proposal(
            deps,
            env,
            info,
            asset_details,
            financial_terms,
            documents,
            compliance,
        ),
        ExecuteMsg::UpdateProposal {
            proposal_id,
            asset_details,
            documents,
        } => execute_update_proposal(deps, env, info, proposal_id, asset_details, documents),
        ExecuteMsg::CancelProposal { proposal_id } => {
            execute_cancel_proposal(deps, env, info, proposal_id)
        }
        ExecuteMsg::Invest { proposal_id } => execute_invest(deps, env, info, proposal_id),
        ExecuteMsg::RefundInvestors { proposal_id } => {
            execute_refund_investors(deps, env, info, proposal_id)
        }
        ExecuteMsg::MintTokens { proposal_id } => execute_mint_tokens(deps, env, info, proposal_id),
        ExecuteMsg::DistributeTokens { proposal_id } => {
            execute_distribute_tokens(deps, env, info, proposal_id)
        }
        ExecuteMsg::UpdateConfig {
            admin,
            platform_fee_bps,
            min_funding_period_days,
            max_funding_period_days,
            cw20_code_id,
        } => execute_update_config(
            deps,
            info,
            admin,
            platform_fee_bps,
            min_funding_period_days,
            max_funding_period_days,
            cw20_code_id,
        ),
        ExecuteMsg::ProcessExpiredProposals {} => {
            execute_process_expired_proposals(deps, env, info)
        }
        ExecuteMsg::ProcessExpiredLockups {} => lockup::process_expired_lockups(deps, &env, info),
        ExecuteMsg::UpdateRateLimitConfig {
            window_seconds,
            max_operations,
            enabled,
        } => execute_update_rate_limit_config(deps, info, window_seconds, max_operations, enabled),
        ExecuteMsg::UpdateOperationLimit {
            operation,
            max_per_window,
            window_seconds,
        } => execute_update_operation_limit(deps, info, operation, max_per_window, window_seconds),
    }
}

fn execute_create_proposal(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    asset_details: crate::state::AssetDetails,
    financial_terms: crate::state::FinancialTerms,
    documents: Vec<crate::state::Document>,
    compliance: crate::state::ComplianceInfo,
) -> Result<Response, ContractError> {
    // Check rate limit
    rate_limit::RateLimiter::record_operation(deps.storage, &info.sender, "create_proposal", &env)?;

    let config = CONFIG.load(deps.storage)?;

    // Check creator proposal limit
    let creator_count = CREATOR_PROPOSAL_COUNT
        .may_load(deps.storage, &info.sender)?
        .unwrap_or(0);
    const MAX_PROPOSALS_PER_CREATOR: u32 = 10;
    if creator_count >= MAX_PROPOSALS_PER_CREATOR {
        return Err(ContractError::MaxProposalsExceeded {
            max: MAX_PROPOSALS_PER_CREATOR,
        });
    }

    // Validate funding period
    let current_time = env.block.time.seconds();
    let funding_duration_days = (financial_terms.funding_deadline - current_time) / (24 * 60 * 60);

    if funding_duration_days < config.min_funding_period_days {
        return Err(ContractError::FundingPeriodTooShort {});
    }
    if funding_duration_days > config.max_funding_period_days {
        return Err(ContractError::FundingPeriodTooLong {});
    }

    // Validate financial terms
    if financial_terms.target_amount.is_zero() {
        return Err(ContractError::InvalidTargetAmount {});
    }
    if financial_terms.token_price.is_zero() {
        return Err(ContractError::InvalidTokenPrice {});
    }
    if financial_terms.total_shares == 0 {
        return Err(ContractError::InvalidTotalShares {});
    }

    // Generate proposal ID
    let mut count = PROPOSAL_COUNT.load(deps.storage)?;
    count += 1;
    let proposal_id = generate_proposal_id(count);
    let funding_deadline = financial_terms.funding_deadline;

    // Create proposal
    let proposal = Proposal {
        id: proposal_id.clone(),
        creator: info.sender.clone(),
        asset_details,
        financial_terms,
        funding_status: crate::state::FundingStatus {
            raised_amount: Uint128::zero(),
            investor_count: 0,
            is_funded: false,
            tokens_minted: false,
        },
        documents,
        compliance,
        timestamps: Timestamps {
            created_at: current_time,
            updated_at: current_time,
            funding_deadline,
            lockup_end: None,
        },
        status: ProposalStatus::Active,
    };

    // Save proposal and update count
    PROPOSALS.save(deps.storage, proposal_id.clone(), &proposal)?;
    PROPOSAL_COUNT.save(deps.storage, &count)?;

    // Update creator proposal count
    CREATOR_PROPOSAL_COUNT.update(deps.storage, &info.sender, |count| -> StdResult<_> {
        Ok(count.unwrap_or(0) + 1)
    })?;

    // Initialize creator if not exists
    if !CREATORS.has(deps.storage, &info.sender) {
        let creator = Creator {
            addr: info.sender.clone(),
            name: "".to_string(), // Can be updated later
            total_raised: Uint128::zero(),
            successful_proposals: 0,
            total_proposals: 1,
            established: current_time,
        };
        CREATORS.save(deps.storage, &info.sender, &creator)?;
    } else {
        CREATORS.update(deps.storage, &info.sender, |creator| -> StdResult<_> {
            let mut creator = creator.unwrap();
            creator.total_proposals += 1;
            Ok(creator)
        })?;
    }

    // Save hot data for efficient access
    let hot_data = crate::state::ProposalHotData {
        status: ProposalStatus::Active,
        target_amount: proposal.financial_terms.target_amount,
        raised_amount: Uint128::zero(),
        investor_count: 0,
        funding_deadline,
        creator: info.sender.clone(),
    };
    crate::state::PROPOSAL_HOT_DATA.save(deps.storage, proposal_id.clone(), &hot_data)?;

    // Add to active proposals index
    crate::state::ACTIVE_PROPOSALS.save(deps.storage, current_time, &proposal_id)?;

    // Add to creator index
    crate::state::CREATOR_PROPOSAL_INDEX.save(deps.storage, (&info.sender, current_time), &proposal_id)?;

    Ok(Response::new()
        .add_attribute("action", "create")
        .add_attribute("id", &proposal_id)
        .add_attribute("creator", info.sender))
}

fn execute_update_proposal(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    proposal_id: String,
    asset_details: Option<crate::state::AssetDetails>,
    documents: Option<Vec<crate::state::Document>>,
) -> Result<Response, ContractError> {
    let mut proposal = PROPOSALS.load(deps.storage, proposal_id.clone())?;

    // Only creator can update
    if proposal.creator != info.sender {
        return Err(ContractError::Unauthorized {});
    }

    // Can only update active proposals
    if proposal.status != ProposalStatus::Active {
        return Err(ContractError::ProposalNotActive {});
    }

    // Update fields if provided
    if let Some(details) = asset_details {
        proposal.asset_details = details;
    }
    if let Some(docs) = documents {
        proposal.documents = docs;
    }

    proposal.timestamps.updated_at = env.block.time.seconds();

    PROPOSALS.save(deps.storage, proposal_id.clone(), &proposal)?;

    Ok(Response::new()
        .add_attribute("action", "update")
        .add_attribute("id", &proposal_id))
}

fn execute_cancel_proposal(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    proposal_id: String,
) -> Result<Response, ContractError> {
    let mut proposal = PROPOSALS.load(deps.storage, proposal_id.clone())?;

    // Only creator or admin can cancel
    let config = CONFIG.load(deps.storage)?;
    if proposal.creator != info.sender && config.admin != info.sender {
        return Err(ContractError::Unauthorized {});
    }

    // Can only cancel active proposals
    if proposal.status != ProposalStatus::Active {
        return Err(ContractError::ProposalNotActive {});
    }

    // Validate state transition before updating
    validate_proposal_state_transition(proposal.status, ProposalStatus::Cancelled, &proposal, &env)?;
    proposal.status = ProposalStatus::Cancelled;
    PROPOSALS.save(deps.storage, proposal_id.clone(), &proposal)?;

    // TODO: Refund any existing investments

    // Update hot data
    crate::state::PROPOSAL_HOT_DATA.update(deps.storage, proposal_id.clone(), |hot_data| -> Result<_, ContractError> {
        let mut data = hot_data.unwrap();
        data.status = ProposalStatus::Cancelled;
        Ok(data)
    })?;

    Ok(Response::new()
        .add_attribute("action", "cancel")
        .add_attribute("id", &proposal_id))
}

// Placeholder functions for remaining execute functions
fn execute_invest(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    proposal_id: String,
) -> Result<Response, ContractError> {
    // Reentrancy protection
    ReentrancyGuard::check_reentrancy(&deps, "invest")?;

    // Check rate limit
    rate_limit::RateLimiter::record_operation(deps.storage, &info.sender, "invest", &env)?;

    let mut proposal = PROPOSALS.load(deps.storage, proposal_id.clone())?;

    // Validate proposal is active
    if proposal.status != ProposalStatus::Active {
        return Err(ContractError::ProposalNotActive {});
    }

    // Check if funding deadline has passed
    if env.block.time.seconds() > proposal.financial_terms.funding_deadline {
        return Err(ContractError::FundingDeadlinePassed {});
    }

    // Check if proposal is already funded
    if proposal.funding_status.is_funded {
        return Err(ContractError::ProposalAlreadyFunded {});
    }

    // Validate investment amount
    let investment_amount = info
        .funds
        .iter()
        .find(|coin| coin.denom == "untrn") // Neutron native token
        .map(|coin| coin.amount)
        .unwrap_or_else(|| Uint128::zero());

    if investment_amount.is_zero() {
        return Err(ContractError::InsufficientFunds {});
    }

    if investment_amount < proposal.financial_terms.minimum_investment {
        return Err(ContractError::InvestmentBelowMinimum {});
    }

    // Calculate shares
    let shares = calculate_shares(&proposal, investment_amount)?;

    // Check if investment exceeds available shares - use safe addition
    let current_shares_sold = calculate_current_shares_sold(&proposal);
    let total_shares_after_investment = current_shares_sold.saturating_add(shares);
    if total_shares_after_investment > proposal.financial_terms.total_shares {
        return Err(ContractError::InvestmentExceedsAvailable {});
    }

    // Check investor limit
    const MAX_INVESTORS_PER_PROPOSAL: u32 = 500;
    let investor_count = PROPOSAL_INVESTOR_COUNT
        .may_load(deps.storage, proposal_id.clone())?
        .unwrap_or(proposal.funding_status.investor_count as u32);

    // Only check if this is a new investor
    let investment_key = (proposal_id.clone(), &info.sender);
    if !INVESTMENTS.has(deps.storage, investment_key)
        && investor_count >= MAX_INVESTORS_PER_PROPOSAL
    {
        return Err(ContractError::MaxInvestorsExceeded {
            max: MAX_INVESTORS_PER_PROPOSAL,
        });
    }

    // Create or update investment
    let investment_key = (proposal_id.clone(), &info.sender);
    let current_time = env.block.time.seconds();

    if INVESTMENTS.has(deps.storage, investment_key.clone()) {
        // Update existing investment - use safe arithmetic
        INVESTMENTS.update(
            deps.storage,
            investment_key.clone(),
            |existing| -> Result<_, ContractError> {
                let mut investment = existing.unwrap();
                // Use safe addition to prevent overflow
                investment.amount = MathGuard::safe_add(investment.amount, investment_amount)?;
                investment.shares = investment.shares.saturating_add(shares);
                investment.timestamp = current_time;
                Ok(investment)
            },
        )?;
    } else {
        // Create new investment
        let investment = Investment {
            investor: info.sender.clone(),
            proposal_id: proposal_id.clone(),
            amount: investment_amount,
            shares,
            timestamp: current_time,
            status: InvestmentStatus::Pending,
        };

        INVESTMENTS.save(deps.storage, investment_key.clone(), &investment)?;

        // Add to proposal investors list
        PROPOSAL_INVESTMENTS.update(
            deps.storage,
            proposal_id.clone(),
            |investors| -> StdResult<_> {
                let mut investors = investors.unwrap_or_default();
                if !investors.contains(&info.sender) {
                    investors.push(info.sender.clone());
                    proposal.funding_status.investor_count += 1;
                }
                Ok(investors)
            },
        )?;

        // Add to user investments list
        USER_INVESTMENTS.update(deps.storage, &info.sender, |proposals| -> StdResult<_> {
            let mut proposals = proposals.unwrap_or_default();
            if !proposals.contains(&proposal_id) {
                proposals.push(proposal_id.clone());
            }
            Ok(proposals)
        })?;
    }

    // Update proposal funding status - use safe addition
    proposal.funding_status.raised_amount = MathGuard::safe_add(proposal.funding_status.raised_amount, investment_amount)?;

    // Check if funding goal is reached
    if proposal.funding_status.raised_amount >= proposal.financial_terms.target_amount {
        proposal.funding_status.is_funded = true;

        // Validate state transition before updating
        validate_proposal_state_transition(proposal.status, ProposalStatus::Funded, &proposal, &env)?;
        proposal.status = ProposalStatus::Funded;

        // Set lockup end time (12 months after funding completion)
        let config = CONFIG.load(deps.storage)?;
        proposal.timestamps.lockup_end = Some(current_time + config.lockup_period_seconds);

        // Update creator stats efficiently with hot data
        crate::state::CREATOR_STATS.update(deps.storage, &proposal.creator, |stats| -> Result<_, ContractError> {
            let mut stats = stats.unwrap_or(crate::state::CreatorCompactStats {
                total_raised: Uint128::zero(),
                success_count: 0,
                total_count: 0,
                last_active: current_time,
            });
            stats.total_raised = MathGuard::safe_add(stats.total_raised, proposal.funding_status.raised_amount)?;
            stats.success_count += 1;
            stats.last_active = current_time;
            Ok(stats)
        })?;

        // Also update legacy creator data
        CREATORS.update(deps.storage, &proposal.creator, |creator| -> Result<_, ContractError> {
            let mut creator = creator.unwrap();
            creator.total_raised = MathGuard::safe_add(creator.total_raised, proposal.funding_status.raised_amount)?;
            creator.successful_proposals = creator.successful_proposals.saturating_add(1);
            Ok(creator)
        })?;
    }

    proposal.timestamps.updated_at = current_time;
    PROPOSALS.save(deps.storage, proposal_id.clone(), &proposal)?;

    let mut response = Response::new()
        .add_attributes(crate::gas_optimization::EfficientEvents::emit_investment(
            &proposal_id,
            info.sender.as_str(),
            investment_amount,
        ))
        .add_attribute("amount", investment_amount.to_string())
        .add_attribute("shares", shares.to_string());

    if proposal.funding_status.is_funded {
        response = response.add_attribute("funding_completed", "true");
    }

    Ok(response)
}

fn execute_refund_investors(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    proposal_id: String,
) -> Result<Response, ContractError> {
    // Reentrancy protection
    ReentrancyGuard::check_reentrancy(&deps, "refund_investors")?;

    let mut proposal = PROPOSALS.load(deps.storage, proposal_id.clone())?;
    let config = CONFIG.load(deps.storage)?;

    // Only admin or creator can trigger refunds
    if info.sender != proposal.creator && info.sender != config.admin {
        return Err(ContractError::Unauthorized {});
    }

    // Can only refund if proposal failed or was cancelled
    match proposal.status {
        ProposalStatus::Failed | ProposalStatus::Cancelled => {}
        ProposalStatus::Active => {
            // Check if deadline has passed
            if env.block.time.seconds() <= proposal.financial_terms.funding_deadline {
                return Err(ContractError::FundingDeadlinePassed {});
            }
            // Validate state transition before updating
            validate_proposal_state_transition(proposal.status, ProposalStatus::Failed, &proposal, &env)?;
            // Mark as failed since deadline passed without funding
            proposal.status = ProposalStatus::Failed;
        }
        _ => return Err(ContractError::ProposalNotActive {}),
    }

    // Get all investors for this proposal
    let investors = PROPOSAL_INVESTMENTS
        .may_load(deps.storage, proposal_id.clone())?
        .unwrap_or_default();

    if investors.is_empty() {
        return Err(ContractError::NoInvestmentsToRefund {});
    }

    let mut refund_messages = Vec::new();
    let mut total_refunded = Uint128::zero();
    let mut refunded_count = 0u64;

    // Process refunds for each investor
    for investor in investors {
        if let Ok(mut investment) = INVESTMENTS.load(deps.storage, (proposal_id.clone(), &investor))
        {
            // Only refund pending investments
            if investment.status == InvestmentStatus::Pending {
                let refund_amount = investment.amount;

                // Create bank message to refund investor
                let refund_msg = CosmosMsg::Bank(BankMsg::Send {
                    to_address: investor.to_string(),
                    amount: vec![Coin {
                        denom: "untrn".to_string(),
                        amount: refund_amount,
                    }],
                });

                refund_messages.push(refund_msg);

                // Update investment status
                investment.status = InvestmentStatus::Refunded;
                INVESTMENTS.save(deps.storage, (proposal_id.clone(), &investor), &investment)?;

                total_refunded = MathGuard::safe_add(total_refunded, refund_amount)?;
                refunded_count = refunded_count.saturating_add(1);
            }
        }
    }

    if refund_messages.is_empty() {
        return Err(ContractError::NoInvestmentsToRefund {});
    }

    // Update proposal funding status
    proposal.funding_status.raised_amount = Uint128::zero();
    proposal.timestamps.updated_at = env.block.time.seconds();
    PROPOSALS.save(deps.storage, proposal_id.clone(), &proposal)?;

    Ok(Response::new()
        .add_messages(refund_messages)
        .add_attribute("method", "refund_investors")
        .add_attribute("proposal_id", &proposal_id)
        .add_attribute("total_refunded", total_refunded.to_string())
        .add_attribute("investors_refunded", refunded_count.to_string()))
}

fn execute_mint_tokens(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    proposal_id: String,
) -> Result<Response, ContractError> {
    // Reentrancy protection
    ReentrancyGuard::check_reentrancy(&deps, "mint_tokens")?;

    // Check rate limit
    rate_limit::RateLimiter::record_operation(deps.storage, &info.sender, "mint_tokens", &env)?;

    let mut proposal = PROPOSALS.load(deps.storage, proposal_id.clone())?;
    let config = CONFIG.load(deps.storage)?;

    // Only admin or creator can mint tokens
    if info.sender != proposal.creator && info.sender != config.admin {
        return Err(ContractError::Unauthorized {});
    }

    // Proposal must be funded to mint tokens
    if !proposal.funding_status.is_funded {
        return Err(ContractError::ProposalNotFunded {});
    }

    // Tokens can only be minted once
    if proposal.funding_status.tokens_minted {
        return Err(ContractError::TokensAlreadyMinted {});
    }

    // Check that proposal status is Funded
    if proposal.status != ProposalStatus::Funded {
        return Err(ContractError::ProposalNotFunded {});
    }

    // Create token name and symbol based on proposal
    let token_name = format!("{} Token", proposal.asset_details.name);
    let token_symbol = format!("{}T", proposal.id.to_uppercase().replace("_", ""));

    // Create CW20 token instantiate message
    let token_instantiate_msg = Cw20InstantiateMsg {
        name: token_name,
        symbol: token_symbol,
        decimals: 6,
        initial_balances: vec![], // Will mint to this contract initially
        mint: Some(MinterResponse {
            minter: env.contract.address.to_string(),
            cap: Some(Uint128::from(proposal.financial_terms.total_shares)),
        }),
        marketing: None,
    };

    // Get CW20 code ID from config
    let config = CONFIG.load(deps.storage)?;

    // Store the proposal ID for the reply handler
    PENDING_TOKEN_REPLY.save(deps.storage, &proposal_id)?;

    // Create submessage to instantiate CW20 token
    let instantiate_submsg = SubMsg {
        id: REPLY_INSTANTIATE_TOKEN,
        msg: WasmMsg::Instantiate {
            code_id: config.cw20_code_id,
            msg: to_json_binary(&token_instantiate_msg)?,
            funds: vec![],
            label: format!("CF1 Token for {}", proposal.id),
            admin: Some(env.contract.address.to_string()),
        }
        .into(),
        gas_limit: None,
        reply_on: ReplyOn::Success,
        payload: cosmwasm_std::Binary::default(),
    };

    // Mark tokens as minted in proposal
    proposal.funding_status.tokens_minted = true;
    proposal.timestamps.updated_at = env.block.time.seconds();
    PROPOSALS.save(deps.storage, proposal_id.clone(), &proposal)?;

    Ok(Response::new()
        .add_submessage(instantiate_submsg)
        .add_attribute("method", "mint_tokens")
        .add_attribute("proposal_id", &proposal_id)
        .add_attribute(
            "total_shares",
            proposal.financial_terms.total_shares.to_string(),
        ))
}

fn execute_distribute_tokens(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    proposal_id: String,
) -> Result<Response, ContractError> {
    // Reentrancy protection
    ReentrancyGuard::check_reentrancy(&deps, "distribute_tokens")?;

    let mut proposal = PROPOSALS.load(deps.storage, proposal_id.clone())?;
    let config = CONFIG.load(deps.storage)?;

    // Enhanced access control - only admin or creator can distribute tokens
    if info.sender != proposal.creator && info.sender != config.admin {
        return Err(ContractError::Unauthorized {});
    }

    // Additional state validation for security
    // Proposal must be in the correct status
    if proposal.status != ProposalStatus::Funded {
        return Err(ContractError::ProposalNotFunded {});
    }

    // Tokens must be minted before distribution
    if !proposal.funding_status.tokens_minted {
        return Err(ContractError::TokensNotMinted {});
    }

    // Check that proposal is funded
    if !proposal.funding_status.is_funded {
        return Err(ContractError::ProposalNotFunded {});
    }

    // Validate that funding amount is non-zero
    if proposal.funding_status.raised_amount.is_zero() {
        return Err(ContractError::InvalidInput {
            field: "raised_amount".to_string(),
            message: "Cannot distribute tokens with zero funding".to_string(),
        });
    }

    // Ensure we haven't already distributed tokens (prevent double distribution)
    if proposal.status == ProposalStatus::Completed {
        return Err(ContractError::InvalidInput {
            field: "proposal_status".to_string(),
            message: "Tokens have already been distributed".to_string(),
        });
    }

    // Get token contract address
    let token_address = TOKEN_CONTRACTS.load(deps.storage, proposal_id.clone())?;

    // Get all investors for this proposal
    let investors = PROPOSAL_INVESTMENTS
        .may_load(deps.storage, proposal_id.clone())?
        .unwrap_or_default();

    if investors.is_empty() {
        return Err(ContractError::NoInvestmentsToRefund {});
    }

    // Phase 1: Validate all investments and prepare operations (atomic preparation)
    let mut pending_distributions = Vec::new();
    let mut total_distributed = 0u64;
    let mut distributed_count = 0u64;

    // Collect all valid investments that need token distribution
    for investor in &investors {
        if let Ok(investment) = INVESTMENTS.load(deps.storage, (proposal_id.clone(), investor)) {
            // Only distribute to pending investments
            if investment.status == InvestmentStatus::Pending {
                let shares_to_mint = investment.shares;

                // Validate shares are non-zero
                if shares_to_mint == 0 {
                    return Err(ContractError::InvalidInput {
                        field: "shares".to_string(),
                        message: "Cannot mint zero shares".to_string(),
                    });
                }

                pending_distributions.push((investor.clone(), investment, shares_to_mint));
                total_distributed = total_distributed.saturating_add(shares_to_mint);
                distributed_count = distributed_count.saturating_add(1);
            }
        }
    }

    if pending_distributions.is_empty() {
        return Err(ContractError::NoInvestmentsToRefund {});
    }

    // Phase 2: Create all messages (atomic message preparation)
    let mut mint_messages: Vec<CosmosMsg> = Vec::new();

    for (investor, _, shares_to_mint) in &pending_distributions {
        // Create mint message for investor
        let mint_msg = Cw20ExecuteMsg::Mint {
            recipient: investor.to_string(),
            amount: Uint128::from(*shares_to_mint),
        };

        let cosmos_msg = cosmwasm_std::WasmMsg::Execute {
            contract_addr: token_address.to_string(),
            msg: to_json_binary(&mint_msg)?,
            funds: vec![],
        };

        mint_messages.push(cosmos_msg.into());
    }

    // Phase 3: Update all investment statuses atomically
    for (investor, mut investment, _) in pending_distributions {
        investment.status = InvestmentStatus::Completed;
        INVESTMENTS.save(deps.storage, (proposal_id.clone(), &investor), &investment)?;
    }

    // Update proposal status to completed (tokens distributed)
    // Validate state transition before updating
    validate_proposal_state_transition(proposal.status, ProposalStatus::Completed, &proposal, &env)?;
    proposal.status = ProposalStatus::Completed;
    proposal.timestamps.updated_at = env.block.time.seconds();
    PROPOSALS.save(deps.storage, proposal_id.clone(), &proposal)?;

    // Release funds to creator (minus platform fee) - use safe arithmetic
    let platform_fee = MathGuard::calculate_percentage(proposal.funding_status.raised_amount, config.platform_fee_bps)?;
    let creator_amount = MathGuard::safe_sub(proposal.funding_status.raised_amount, platform_fee)?;

    let mut response_messages = mint_messages;

    // Send funds to creator
    if !creator_amount.is_zero() {
        let creator_payout = cosmwasm_std::BankMsg::Send {
            to_address: proposal.creator.to_string(),
            amount: vec![Coin {
                denom: "untrn".to_string(),
                amount: creator_amount,
            }],
        };
        response_messages.push(creator_payout.into());
    }

    // Send platform fee to admin
    if !platform_fee.is_zero() {
        let admin_fee = cosmwasm_std::BankMsg::Send {
            to_address: config.admin.to_string(),
            amount: vec![Coin {
                denom: "untrn".to_string(),
                amount: platform_fee,
            }],
        };
        response_messages.push(admin_fee.into());
    }

    Ok(Response::new()
        .add_messages(response_messages)
        .add_attribute("method", "distribute_tokens")
        .add_attribute("proposal_id", &proposal_id)
        .add_attribute("total_distributed", total_distributed.to_string())
        .add_attribute("investors_count", distributed_count.to_string())
        .add_attribute("creator_payout", creator_amount.to_string())
        .add_attribute("platform_fee", platform_fee.to_string()))
}

fn execute_update_config(
    deps: DepsMut,
    info: MessageInfo,
    admin: Option<String>,
    platform_fee_bps: Option<u16>,
    min_funding_period_days: Option<u64>,
    max_funding_period_days: Option<u64>,
    cw20_code_id: Option<u64>,
) -> Result<Response, ContractError> {
    let mut config = CONFIG.load(deps.storage)?;

    // Only admin can update config
    if config.admin != info.sender {
        return Err(ContractError::Unauthorized {});
    }

    if let Some(admin) = admin {
        config.admin = deps.api.addr_validate(&admin)?;
    }
    if let Some(fee) = platform_fee_bps {
        if fee > 10000 {
            return Err(ContractError::InvalidPlatformFee {});
        }
        config.platform_fee_bps = fee;
    }
    if let Some(min_days) = min_funding_period_days {
        config.min_funding_period_days = min_days;
    }
    if let Some(max_days) = max_funding_period_days {
        config.max_funding_period_days = max_days;
    }
    if let Some(code_id) = cw20_code_id {
        config.cw20_code_id = code_id;
    }

    CONFIG.save(deps.storage, &config)?;

    Ok(Response::new().add_attribute("method", "update_config"))
}

fn execute_process_expired_proposals(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
) -> Result<Response, ContractError> {
    let config = CONFIG.load(deps.storage)?;

    // Only admin can process expired proposals (could be automated via cron)
    if info.sender != config.admin {
        return Err(ContractError::Unauthorized {});
    }

    let current_time = env.block.time.seconds();
    let mut processed_count = 0u64;
    let mut failed_proposals = Vec::new();

    // First, collect all proposals that need processing
    let proposals_to_process: Vec<(String, Proposal)> = PROPOSALS
        .range(deps.storage, None, None, cosmwasm_std::Order::Ascending)
        .filter_map(|item| {
            if let Ok((proposal_id, proposal)) = item {
                if proposal.status == ProposalStatus::Active
                    && current_time > proposal.financial_terms.funding_deadline
                    && !proposal.funding_status.is_funded
                {
                    return Some((proposal_id, proposal));
                }
            }
            None
        })
        .collect();

    // Now process the collected proposals
    for (proposal_id, mut proposal) in proposals_to_process {
        // Validate state transition before updating
        validate_proposal_state_transition(proposal.status, ProposalStatus::Failed, &proposal, &env)?;

        // Mark proposal as failed
        proposal.status = ProposalStatus::Failed;
        proposal.timestamps.updated_at = current_time;
        PROPOSALS.save(deps.storage, proposal_id.clone(), &proposal)?;

        failed_proposals.push(proposal_id.clone());
        processed_count += 1;

        // Auto-trigger refunds for failed proposals
        let investors = PROPOSAL_INVESTMENTS
            .may_load(deps.storage, proposal_id.clone())?
            .unwrap_or_default();

        for investor in investors {
            if let Ok(mut investment) =
                INVESTMENTS.load(deps.storage, (proposal_id.clone(), &investor))
            {
                if investment.status == InvestmentStatus::Pending {
                    investment.status = InvestmentStatus::Refunded;
                    INVESTMENTS.save(
                        deps.storage,
                        (proposal_id.clone(), &investor),
                        &investment,
                    )?;
                }
            }
        }
    }

    let mut response = Response::new()
        .add_attribute("method", "process_expired_proposals")
        .add_attribute("processed_count", processed_count.to_string());

    if !failed_proposals.is_empty() {
        response = response.add_attribute("failed_proposals", failed_proposals.join(","));
    }

    Ok(response)
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn reply(deps: DepsMut, env: Env, msg: cosmwasm_std::Reply) -> Result<Response, ContractError> {
    match msg.id {
        REPLY_INSTANTIATE_TOKEN => handle_token_instantiate_reply(deps, env, msg),
        _ => Err(ContractError::Std(cosmwasm_std::StdError::generic_err(
            "Unknown reply ID",
        ))),
    }
}

fn handle_token_instantiate_reply(
    deps: DepsMut,
    env: Env,
    msg: cosmwasm_std::Reply,
) -> Result<Response, ContractError> {
    // Parse the instantiate result to get the token contract address
    let contract_address = match msg.result {
        SubMsgResult::Ok(res) => {
            // Extract contract address from events
            res.events
                .iter()
                .flat_map(|event| event.attributes.iter())
                .find(|attr| attr.key == "_contract_address")
                .map(|attr| attr.value.clone())
                .ok_or_else(|| ContractError::ReplyParseFailed {
                    message: "Contract address not found in reply".to_string(),
                })?
        }
        SubMsgResult::Err(err) => {
            return Err(ContractError::ReplyParseFailed {
                message: format!("Submessage failed: {}", err),
            });
        }
    };
    let token_addr = deps.api.addr_validate(&contract_address)?;

    // Retrieve the proposal ID we stored before the submessage
    let proposal_id = PENDING_TOKEN_REPLY.load(deps.storage)?;

    // Store the token contract address for this proposal
    TOKEN_CONTRACTS.save(deps.storage, proposal_id.clone(), &token_addr)?;

    // Load the proposal to update its status
    let mut proposal = PROPOSALS.load(deps.storage, proposal_id.clone())?;

    // Set the lockup end timestamp (12 months from now)
    proposal.timestamps.lockup_end =
        Some(env.block.time.seconds() + crate::state::LOCKUP_PERIOD_SECONDS);
    proposal.timestamps.updated_at = env.block.time.seconds();

    // Update proposal status to indicate tokens are ready for distribution
    PROPOSALS.save(deps.storage, proposal_id.clone(), &proposal)?;

    // Clean up the temporary storage
    PENDING_TOKEN_REPLY.remove(deps.storage);

    Ok(Response::new()
        .add_attribute("method", "token_instantiated")
        .add_attribute("proposal_id", &proposal_id)
        .add_attribute("token_address", token_addr.to_string()))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::Config {} => to_json_binary(&query_config(deps)?),
        QueryMsg::Proposal { proposal_id } => to_json_binary(&query_proposal(deps, proposal_id)?),
        QueryMsg::ProposalsByCreator {
            creator,
            start_after,
            limit,
        } => to_json_binary(&query_proposals_by_creator(
            deps,
            creator,
            start_after,
            limit,
        )?),
        QueryMsg::ProposalsByStatus {
            status,
            start_after,
            limit,
        } => to_json_binary(&query_proposals_by_status(
            deps,
            status,
            start_after,
            limit,
        )?),
        QueryMsg::AllProposals { start_after, limit } => {
            to_json_binary(&query_all_proposals(deps, start_after, limit)?)
        }
        QueryMsg::Investment {
            proposal_id,
            investor,
        } => to_json_binary(&query_investment(deps, proposal_id, investor)?),
        QueryMsg::InvestmentsByProposal {
            proposal_id,
            start_after,
            limit,
        } => to_json_binary(&query_investments_by_proposal(
            deps,
            proposal_id,
            start_after,
            limit,
        )?),
        QueryMsg::InvestmentsByUser {
            user,
            start_after,
            limit,
        } => to_json_binary(&query_investments_by_user(deps, user, start_after, limit)?),
        QueryMsg::Creator { creator } => to_json_binary(&query_creator(deps, creator)?),
        QueryMsg::CreatorStats { creator } => to_json_binary(&query_creator_stats(deps, creator)?),
        QueryMsg::TotalValueLocked {} => to_json_binary(&query_total_value_locked(deps)?),
        QueryMsg::PlatformStats {} => to_json_binary(&query_platform_stats(deps)?),
        QueryMsg::UserPortfolio {
            user,
            start_after,
            limit,
        } => to_json_binary(&query_user_portfolio(deps, user, start_after, limit)?),
        QueryMsg::PortfolioPerformance { user } => {
            to_json_binary(&query_portfolio_performance(deps, user)?)
        }
        QueryMsg::LockupInfo { proposal_id } => {
            to_json_binary(&query_lockup_info(deps, env, proposal_id)?)
        }
        QueryMsg::LockupStatus { proposal_id } => {
            to_json_binary(&query_lockup_status(deps, env, proposal_id)?)
        }
        QueryMsg::ComplianceReport { proposal_id } => {
            to_json_binary(&query_compliance_report(deps, proposal_id)?)
        }
        QueryMsg::PlatformComplianceReport {} => {
            to_json_binary(&query_platform_compliance_report(deps)?)
        }
        QueryMsg::GovernanceInfo { proposal_id } => {
            to_json_binary(&query_governance_info(deps, proposal_id)?)
        }
        QueryMsg::UserVotingPower { proposal_id, user } => {
            to_json_binary(&query_user_voting_power(deps, proposal_id, user)?)
        }
        QueryMsg::UserGovernanceProposals { user } => {
            to_json_binary(&query_user_governance_proposals(deps, user)?)
        }
        QueryMsg::GovernanceSetupData { proposal_id } => {
            to_json_binary(&query_governance_setup_data(deps, proposal_id)?)
        }
        QueryMsg::RateLimitStatus { user, operation } => to_json_binary(
            &crate::rate_limit::query_rate_limit_status(deps, user, operation)?,
        ),
        QueryMsg::RateLimitConfig {} => {
            to_json_binary(&crate::rate_limit::query_rate_limit_config(deps)?)
        }
    }
}

// Query function implementations
fn query_config(deps: Deps) -> StdResult<Config> {
    CONFIG.load(deps.storage)
}

fn query_proposal(deps: Deps, proposal_id: String) -> StdResult<crate::msg::ProposalResponse> {
    // Load hot data first for gas efficiency
    let hot_data = crate::state::get_proposal_hot_data(deps.storage, &proposal_id)?;

    // If we only need basic info, we can return early with hot data
    // For full proposal details, load the complete proposal
    let proposal = PROPOSALS.load(deps.storage, proposal_id.clone())?;

    let funding_progress = calculate_funding_progress(&proposal);

    Ok(crate::msg::ProposalResponse {
        proposal,
        funding_progress,
    })
}

fn query_proposals_by_creator(
    deps: Deps,
    creator: String,
    start_after: Option<String>,
    limit: Option<u32>,
) -> StdResult<crate::msg::ProposalsResponse> {
    let creator_addr = deps.api.addr_validate(&creator)?;
    let limit = limit.unwrap_or(crate::gas_optimization::DEFAULT_LIMIT).min(crate::gas_optimization::MAX_LIMIT) as usize;

    // Use indexed storage for gas efficiency
    let start_bound = start_after.map(|s| {
        s.parse::<u64>().unwrap_or(0)
    });

    let mut proposals = Vec::with_capacity(limit);
    let mut count = 0;

    // Iterate through creator index (gas efficient)
    for item in crate::state::CREATOR_PROPOSAL_INDEX
        .prefix(&creator_addr)
        .range(deps.storage, None, None, cosmwasm_std::Order::Descending)
    {
        if count >= limit {
            break;
        }

        let (timestamp, proposal_id) = item?;

        // Skip if before start_after
        if let Some(start) = start_bound {
            if timestamp <= start {
                continue;
            }
        }

        // Load hot data first
        if let Ok(hot_data) = crate::state::get_proposal_hot_data(deps.storage, &proposal_id) {
            // Only load full proposal if needed
            if let Ok(proposal) = PROPOSALS.load(deps.storage, proposal_id) {
                let funding_progress = calculate_funding_progress(&proposal);
                proposals.push(crate::msg::ProposalResponse {
                    proposal,
                    funding_progress,
                });
                count += 1;
            }
        }
    }

    Ok(crate::msg::ProposalsResponse {
        proposals,
        total_count: count as u64,
    })
}

fn query_proposals_by_status(
    deps: Deps,
    status: ProposalStatus,
    start_after: Option<String>,
    limit: Option<u32>,
) -> StdResult<crate::msg::ProposalsResponse> {
    let limit = limit.unwrap_or(30).min(100) as usize;

    let proposals: Vec<_> = PROPOSALS
        .range(deps.storage, None, None, cosmwasm_std::Order::Descending)
        .filter(|item| {
            if let Ok((_, proposal)) = item {
                proposal.status == status
            } else {
                false
            }
        })
        .skip_while(|item| {
            if let Some(start_after) = &start_after {
                if let Ok((key, _)) = item {
                    key <= start_after
                } else {
                    false
                }
            } else {
                false
            }
        })
        .take(limit)
        .map(|item| {
            let (_, proposal) = item?;
            let funding_progress = calculate_funding_progress(&proposal);
            Ok(crate::msg::ProposalResponse {
                proposal,
                funding_progress,
            })
        })
        .collect::<StdResult<Vec<_>>>()?;

    let total_count = proposals.len() as u64;
    Ok(crate::msg::ProposalsResponse {
        proposals,
        total_count,
    })
}

fn query_all_proposals(
    deps: Deps,
    start_after: Option<String>,
    limit: Option<u32>,
) -> StdResult<crate::msg::ProposalsResponse> {
    let limit = limit.unwrap_or(30).min(100) as usize;

    let proposals: Vec<_> = PROPOSALS
        .range(deps.storage, None, None, cosmwasm_std::Order::Descending)
        .skip_while(|item| {
            if let Some(start_after) = &start_after {
                if let Ok((key, _)) = item {
                    key <= start_after
                } else {
                    false
                }
            } else {
                false
            }
        })
        .take(limit)
        .map(|item| {
            let (_, proposal) = item?;
            let funding_progress = calculate_funding_progress(&proposal);
            Ok(crate::msg::ProposalResponse {
                proposal,
                funding_progress,
            })
        })
        .collect::<StdResult<Vec<_>>>()?;

    let total_count = proposals.len() as u64;
    Ok(crate::msg::ProposalsResponse {
        proposals,
        total_count,
    })
}

fn query_investment(
    deps: Deps,
    proposal_id: String,
    investor: String,
) -> StdResult<crate::msg::InvestmentResponse> {
    let investor_addr = deps.api.addr_validate(&investor)?;
    let investment = INVESTMENTS.load(deps.storage, (proposal_id.clone(), &investor_addr))?;
    let proposal = PROPOSALS.load(deps.storage, proposal_id.clone())?;

    Ok(crate::msg::InvestmentResponse {
        investment: investment.clone(),
        proposal_title: proposal.asset_details.name.clone(),
        current_value: calculate_current_investment_value(&investment, &proposal),
    })
}

fn query_investments_by_proposal(
    deps: Deps,
    proposal_id: String,
    start_after: Option<String>,
    limit: Option<u32>,
) -> StdResult<crate::msg::InvestmentsResponse> {
    let limit = limit.unwrap_or(30).min(100) as usize;
    let proposal = PROPOSALS.load(deps.storage, proposal_id.clone())?;

    let investments: Vec<_> = INVESTMENTS
        .prefix(proposal_id.clone())
        .range(deps.storage, None, None, cosmwasm_std::Order::Ascending)
        .skip_while(|item| {
            if let Some(start_after) = &start_after {
                if let Ok((addr, _)) = item {
                    addr.as_str() <= start_after
                } else {
                    false
                }
            } else {
                false
            }
        })
        .take(limit)
        .map(|item| {
            let (_, investment) = item?;
            Ok(crate::msg::InvestmentResponse {
                current_value: calculate_current_investment_value(&investment, &proposal),
                proposal_title: proposal.asset_details.name.clone(),
                investment,
            })
        })
        .collect::<StdResult<Vec<_>>>()?;

    let total_invested: Uint128 = investments.iter().map(|inv| inv.investment.amount).sum();

    Ok(crate::msg::InvestmentsResponse {
        investments,
        total_invested,
    })
}

fn query_investments_by_user(
    deps: Deps,
    user: String,
    start_after: Option<String>,
    limit: Option<u32>,
) -> StdResult<crate::msg::InvestmentsResponse> {
    let user_addr = deps.api.addr_validate(&user)?;
    let limit = limit.unwrap_or(30).min(100) as usize;

    // Get user's proposal IDs (this would be more efficient with proper indexing)
    let user_investments: Vec<_> = INVESTMENTS
        .range(deps.storage, None, None, cosmwasm_std::Order::Ascending)
        .filter(|item| {
            if let Ok(((_, addr), _)) = item {
                addr == &user_addr
            } else {
                false
            }
        })
        .skip_while(|item| {
            if let Some(start_after) = &start_after {
                if let Ok(((proposal_id, _), _)) = item {
                    proposal_id <= start_after
                } else {
                    false
                }
            } else {
                false
            }
        })
        .take(limit)
        .map(|item| {
            let ((proposal_id, _), investment) = item?;
            let proposal = PROPOSALS.load(deps.storage, proposal_id.clone())?;
            Ok(crate::msg::InvestmentResponse {
                current_value: calculate_current_investment_value(&investment, &proposal),
                proposal_title: proposal.asset_details.name,
                investment,
            })
        })
        .collect::<StdResult<Vec<_>>>()?;

    let total_invested: Uint128 = user_investments
        .iter()
        .map(|inv| inv.investment.amount)
        .sum();

    Ok(crate::msg::InvestmentsResponse {
        investments: user_investments,
        total_invested,
    })
}

fn query_creator(deps: Deps, creator: String) -> StdResult<crate::msg::CreatorResponse> {
    let creator_addr = deps.api.addr_validate(&creator)?;
    let creator = CREATORS.load(deps.storage, &creator_addr)?;
    let stats = calculate_creator_stats(&creator);

    Ok(crate::msg::CreatorResponse { creator, stats })
}

fn query_creator_stats(deps: Deps, creator: String) -> StdResult<crate::msg::CreatorStats> {
    let creator_addr = deps.api.addr_validate(&creator)?;
    let creator = CREATORS.load(deps.storage, &creator_addr)?;

    Ok(calculate_creator_stats(&creator))
}

fn query_total_value_locked(deps: Deps) -> StdResult<Uint128> {
    let mut total: Uint128 = Uint128::zero();

    for item in PROPOSALS.range(deps.storage, None, None, cosmwasm_std::Order::Ascending) {
        let (_, proposal) = item?;
        total += proposal.funding_status.raised_amount;
    }

    Ok(total)
}

fn query_platform_stats(deps: Deps) -> StdResult<crate::msg::PlatformStats> {
    // Use gas-efficient calculation from gas_optimization module
    let efficient_stats = crate::gas_optimization::MemoryOptimizedQueries::calculate_platform_stats_efficient(deps)?;

    Ok(crate::msg::PlatformStats {
        total_proposals: efficient_stats.total_proposals,
        active_proposals: efficient_stats.active_proposals,
        total_raised: efficient_stats.total_raised,
        total_investors: 0, // Calculate separately if needed
        successful_proposals: efficient_stats.funded_proposals,
    })
}

// Helper functions
fn calculate_funding_progress(proposal: &Proposal) -> crate::msg::FundingProgress {
    let raised_percentage = if proposal.financial_terms.target_amount.is_zero() {
        0u64
    } else {
        (proposal.funding_status.raised_amount.u128() * 100
            / proposal.financial_terms.target_amount.u128()) as u64
    };

    let shares_sold = if proposal.financial_terms.token_price.is_zero() {
        0u64
    } else {
        (proposal.funding_status.raised_amount.u128() / proposal.financial_terms.token_price.u128())
            as u64
    };

    let shares_remaining = proposal
        .financial_terms
        .total_shares
        .saturating_sub(shares_sold);

    // Calculate days remaining using current time
    let current_time = 1640995200u64; // Placeholder - in real usage, this would come from env.block.time
    let days_remaining = if proposal.timestamps.funding_deadline > current_time {
        ((proposal.timestamps.funding_deadline - current_time) / (24 * 60 * 60)) as i64
    } else {
        0i64
    };

    crate::msg::FundingProgress {
        raised_percentage,
        days_remaining,
        investors_count: proposal.funding_status.investor_count,
        shares_sold,
        shares_remaining,
    }
}

fn calculate_current_investment_value(investment: &Investment, _proposal: &Proposal) -> Uint128 {
    // For now, return the original investment amount
    // In production, this would calculate current market value
    investment.amount
}

fn calculate_creator_stats(creator: &Creator) -> crate::msg::CreatorStats {
    let success_rate = if creator.total_proposals == 0 {
        0u16
    } else {
        ((creator.successful_proposals * 100) / creator.total_proposals) as u16
    };

    let rating = match success_rate {
        90..=100 => "5.0".to_string(),
        80..=89 => "4.5".to_string(),
        70..=79 => "4.0".to_string(),
        60..=69 => "3.5".to_string(),
        50..=59 => "3.0".to_string(),
        _ => "2.5".to_string(),
    };

    crate::msg::CreatorStats {
        rating,
        success_rate,
        total_raised_formatted: format!("${}", creator.total_raised),
    }
}

// Investment calculation functions
fn calculate_shares(proposal: &Proposal, investment_amount: Uint128) -> Result<u64, ContractError> {
    // Validate inputs first
    MathGuard::validate_calculation_inputs(
        investment_amount,
        proposal.financial_terms.token_price,
        "share calculation"
    )?;

    // Use high-precision calculation with a precision factor of 1000 for better accuracy
    const PRECISION_FACTOR: u128 = 1000;

    MathGuard::calculate_shares_precise(
        investment_amount,
        proposal.financial_terms.token_price,
        PRECISION_FACTOR,
    )
}

fn calculate_current_shares_sold(proposal: &Proposal) -> u64 {
    if proposal.financial_terms.token_price.is_zero() {
        return 0;
    }

    // Use safe division to prevent overflow attacks
    match MathGuard::safe_div(proposal.funding_status.raised_amount, proposal.financial_terms.token_price) {
        Ok(shares_u128) => {
            let shares_value = shares_u128.u128();
            // Check for overflow when converting to u64
            if shares_value > u64::MAX as u128 {
                // Return maximum possible shares if overflow would occur
                u64::MAX
            } else {
                shares_value as u64
            }
        }
        Err(_) => 0, // Return 0 if division fails (shouldn't happen due to zero check above)
    }
}

fn calculate_remaining_shares(proposal: &Proposal) -> u64 {
    let shares_sold = calculate_current_shares_sold(proposal);
    proposal
        .financial_terms
        .total_shares
        .saturating_sub(shares_sold)
}

fn calculate_maximum_investment(proposal: &Proposal) -> Uint128 {
    let remaining_shares = calculate_remaining_shares(proposal);
    let remaining_shares_u128 = Uint128::from(remaining_shares as u128);

    // Use safe multiplication to prevent overflow attacks
    match MathGuard::safe_mul(remaining_shares_u128, proposal.financial_terms.token_price) {
        Ok(max_investment) => max_investment,
        Err(_) => Uint128::MAX, // Return maximum if overflow would occur
    }
}

// Portfolio query functions
fn query_user_portfolio(
    deps: Deps,
    user: String,
    start_after: Option<String>,
    limit: Option<u32>,
) -> StdResult<crate::msg::InvestmentsResponse> {
    let user_addr = deps.api.addr_validate(&user)?;
    helpers::get_user_portfolio(deps, &user_addr, start_after, limit)
}

fn query_portfolio_performance(
    deps: Deps,
    user: String,
) -> StdResult<helpers::PortfolioPerformance> {
    let user_addr = deps.api.addr_validate(&user)?;
    helpers::get_portfolio_performance(deps, &user_addr)
}

// Lockup query functions
fn query_lockup_info(deps: Deps, env: Env, proposal_id: String) -> StdResult<lockup::LockupInfo> {
    lockup::get_lockup_info(deps, &env, &proposal_id)
}

fn query_lockup_status(
    deps: Deps,
    env: Env,
    proposal_id: String,
) -> StdResult<lockup::LockupStatus> {
    lockup::get_lockup_status(deps, &env, &proposal_id)
}

// Compliance query functions
fn query_compliance_report(
    deps: Deps,
    proposal_id: String,
) -> StdResult<compliance::ComplianceReport> {
    compliance::generate_proposal_compliance_report(deps, &proposal_id)
}

fn query_platform_compliance_report(deps: Deps) -> StdResult<compliance::PlatformComplianceReport> {
    compliance::generate_platform_compliance_report(deps)
}

// Governance query functions
fn query_governance_info(deps: Deps, proposal_id: String) -> StdResult<governance::GovernanceInfo> {
    governance::get_governance_info(deps, &proposal_id)
}

fn query_user_voting_power(
    deps: Deps,
    proposal_id: String,
    user: String,
) -> StdResult<governance::VotingPowerInfo> {
    let user_addr = deps.api.addr_validate(&user)?;
    governance::get_user_voting_power(deps, &proposal_id, &user_addr)
}

fn query_user_governance_proposals(
    deps: Deps,
    user: String,
) -> StdResult<Vec<governance::GovernanceInfo>> {
    let user_addr = deps.api.addr_validate(&user)?;
    governance::get_user_governance_proposals(deps, &user_addr)
}

fn query_governance_setup_data(
    deps: Deps,
    proposal_id: String,
) -> StdResult<governance::GovernanceSetupData> {
    governance::generate_governance_setup_data(deps, &proposal_id)
}

// State transition validation
fn validate_proposal_state_transition(
    current_status: ProposalStatus,
    new_status: ProposalStatus,
    proposal: &Proposal,
    env: &Env,
) -> Result<(), ContractError> {
    match (current_status, new_status) {
        // Active proposals can transition to Funded, Failed, or Cancelled
        (ProposalStatus::Active, ProposalStatus::Funded) => {
            // Must meet funding requirements
            if !proposal.funding_status.is_funded {
                return Err(ContractError::InvalidInput {
                    field: "funding_status".to_string(),
                    message: "Proposal must be funded to transition to Funded status".to_string(),
                });
            }
        }
        (ProposalStatus::Active, ProposalStatus::Failed) => {
            // Can only fail if deadline passed without funding
            if env.block.time.seconds() <= proposal.financial_terms.funding_deadline {
                return Err(ContractError::InvalidInput {
                    field: "deadline".to_string(),
                    message: "Cannot mark as failed before deadline".to_string(),
                });
            }
        }
        (ProposalStatus::Active, ProposalStatus::Cancelled) => {
            // Can be cancelled by admin or creator
            // Additional validation would happen in access control
        }

        // Funded proposals can only transition to Completed
        (ProposalStatus::Funded, ProposalStatus::Completed) => {
            // Must have tokens minted and distributed
            if !proposal.funding_status.tokens_minted {
                return Err(ContractError::InvalidInput {
                    field: "tokens_minted".to_string(),
                    message: "Tokens must be minted before completion".to_string(),
                });
            }
        }

        // Failed and Cancelled proposals cannot transition to other states
        (ProposalStatus::Failed, _) | (ProposalStatus::Cancelled, _) => {
            return Err(ContractError::InvalidInput {
                field: "status_transition".to_string(),
                message: "Cannot transition from terminal state".to_string(),
            });
        }

        // Completed proposals cannot transition to other states
        (ProposalStatus::Completed, _) => {
            return Err(ContractError::InvalidInput {
                field: "status_transition".to_string(),
                message: "Cannot transition from completed state".to_string(),
            });
        }

        // Any other transition is invalid
        _ => {
            return Err(ContractError::InvalidInput {
                field: "status_transition".to_string(),
                message: format!("Invalid transition from {:?} to {:?}", current_status, new_status),
            });
        }
    }

    Ok(())
}

// Rate limit management functions
fn execute_update_rate_limit_config(
    deps: DepsMut,
    info: MessageInfo,
    window_seconds: Option<u64>,
    max_operations: Option<u32>,
    enabled: Option<bool>,
) -> Result<Response, ContractError> {
    let config = CONFIG.load(deps.storage)?;

    // Only admin can update rate limit config
    if config.admin != info.sender {
        return Err(ContractError::Unauthorized {});
    }

    rate_limit::RateLimiter::update_config(deps.storage, window_seconds, max_operations, enabled)?;

    Ok(Response::new()
        .add_attribute("method", "update_rate_limit_config")
        .add_attribute("admin", info.sender))
}

fn execute_update_operation_limit(
    deps: DepsMut,
    info: MessageInfo,
    operation: String,
    max_per_window: u32,
    window_seconds: u64,
) -> Result<Response, ContractError> {
    let config = CONFIG.load(deps.storage)?;

    // Only admin can update operation limits
    if config.admin != info.sender {
        return Err(ContractError::Unauthorized {});
    }

    rate_limit::RateLimiter::update_operation_limit(
        deps.storage,
        &operation,
        max_per_window,
        window_seconds,
    )?;

    Ok(Response::new()
        .add_attribute("method", "update_operation_limit")
        .add_attribute("operation", operation)
        .add_attribute("max_per_window", max_per_window.to_string())
        .add_attribute("window_seconds", window_seconds.to_string()))
}
