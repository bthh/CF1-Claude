use cosmwasm_std::{
    entry_point, to_json_binary, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdResult, Uint128,
    Addr, CosmosMsg, BankMsg, Coin, Timestamp, WasmMsg, SubMsg, ReplyOn,
};
use cw2::set_contract_version;
use cw20_base::msg::InstantiateMsg as Cw20InstantiateMsg;
use cw20::{Cw20ExecuteMsg, MinterResponse};

use crate::error::ContractError;
use crate::msg::{ExecuteMsg, InstantiateMsg, QueryMsg};
use crate::state::{
    Config, Proposal, ProposalStatus, Investment, InvestmentStatus, Creator, Timestamps,
    CONFIG, PROPOSALS, INVESTMENTS, PROPOSAL_INVESTMENTS, USER_INVESTMENTS, CREATORS, PROPOSAL_COUNT, TOKEN_CONTRACTS, PENDING_TOKEN_REPLY,
    CREATOR_PROPOSAL_COUNT, PROPOSAL_INVESTOR_COUNT,
    MIN_FUNDING_PERIOD_DAYS, MAX_FUNDING_PERIOD_DAYS, DEFAULT_PLATFORM_FEE_BPS, generate_proposal_id,
};

mod error;
mod msg;
mod state;
mod helpers;
mod lockup;
mod compliance;
mod governance;
mod security;
mod gas_optimization;
mod rate_limit;

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
        .add_attribute("method", "instantiate")
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
        } => execute_create_proposal(deps, env, info, asset_details, financial_terms, documents, compliance),
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
        } => execute_update_config(deps, info, admin, platform_fee_bps, min_funding_period_days, max_funding_period_days, cw20_code_id),
        ExecuteMsg::ProcessExpiredProposals {} => execute_process_expired_proposals(deps, env, info),
        ExecuteMsg::ProcessExpiredLockups {} => lockup::process_expired_lockups(deps, env, info),
        ExecuteMsg::UpdateRateLimitConfig { window_seconds, max_operations, enabled } => {
            execute_update_rate_limit_config(deps, info, window_seconds, max_operations, enabled)
        }
        ExecuteMsg::UpdateOperationLimit { operation, max_per_window, window_seconds } => {
            execute_update_operation_limit(deps, info, operation, max_per_window, window_seconds)
        }
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
    let creator_count = CREATOR_PROPOSAL_COUNT.may_load(deps.storage, &info.sender)?
        .unwrap_or(0);
    const MAX_PROPOSALS_PER_CREATOR: u32 = 10;
    if creator_count >= MAX_PROPOSALS_PER_CREATOR {
        return Err(ContractError::MaxProposalsExceeded { max: MAX_PROPOSALS_PER_CREATOR });
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
            funding_deadline: financial_terms.funding_deadline,
            lockup_end: None,
        },
        status: ProposalStatus::Active,
    };

    // Save proposal and update count
    PROPOSALS.save(deps.storage, &proposal_id, &proposal)?;
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

    Ok(Response::new()
        .add_attribute("method", "create_proposal")
        .add_attribute("proposal_id", proposal_id)
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
    let mut proposal = PROPOSALS.load(deps.storage, &proposal_id)?;
    
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
    
    PROPOSALS.save(deps.storage, &proposal_id, &proposal)?;

    Ok(Response::new()
        .add_attribute("method", "update_proposal")
        .add_attribute("proposal_id", proposal_id))
}

fn execute_cancel_proposal(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    proposal_id: String,
) -> Result<Response, ContractError> {
    let mut proposal = PROPOSALS.load(deps.storage, &proposal_id)?;
    
    // Only creator or admin can cancel
    let config = CONFIG.load(deps.storage)?;
    if proposal.creator != info.sender && config.admin != info.sender {
        return Err(ContractError::Unauthorized {});
    }
    
    // Can only cancel active proposals
    if proposal.status != ProposalStatus::Active {
        return Err(ContractError::ProposalNotActive {});
    }

    proposal.status = ProposalStatus::Cancelled;
    PROPOSALS.save(deps.storage, &proposal_id, &proposal)?;

    // TODO: Refund any existing investments
    
    Ok(Response::new()
        .add_attribute("method", "cancel_proposal")
        .add_attribute("proposal_id", proposal_id))
}

// Placeholder functions for remaining execute functions
fn execute_invest(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    proposal_id: String,
) -> Result<Response, ContractError> {
    // Check rate limit
    rate_limit::RateLimiter::record_operation(deps.storage, &info.sender, "invest", &env)?;
    
    let mut proposal = PROPOSALS.load(deps.storage, &proposal_id)?;
    
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
    let investment_amount = info.funds.iter()
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
    
    // Check if investment exceeds available shares
    let current_shares_sold = calculate_current_shares_sold(&proposal);
    if current_shares_sold + shares > proposal.financial_terms.total_shares {
        return Err(ContractError::InvestmentExceedsAvailable {});
    }
    
    // Check investor limit
    const MAX_INVESTORS_PER_PROPOSAL: u32 = 500;
    let investor_count = PROPOSAL_INVESTOR_COUNT.may_load(deps.storage, &proposal_id)?
        .unwrap_or(proposal.funding_status.investor_count as u32);
    
    // Only check if this is a new investor
    let investment_key = (&proposal_id, &info.sender);
    if !INVESTMENTS.has(deps.storage, investment_key) && investor_count >= MAX_INVESTORS_PER_PROPOSAL {
        return Err(ContractError::MaxInvestorsExceeded { max: MAX_INVESTORS_PER_PROPOSAL });
    }
    
    // Create or update investment
    let investment_key = (&proposal_id, &info.sender);
    let current_time = env.block.time.seconds();
    
    if INVESTMENTS.has(deps.storage, investment_key) {
        // Update existing investment
        INVESTMENTS.update(deps.storage, investment_key, |existing| -> Result<_, ContractError> {
            let mut investment = existing.unwrap();
            investment.amount += investment_amount;
            investment.shares += shares;
            investment.timestamp = current_time;
            Ok(investment)
        })?;
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
        
        INVESTMENTS.save(deps.storage, investment_key, &investment)?;
        
        // Add to proposal investors list
        PROPOSAL_INVESTMENTS.update(deps.storage, &proposal_id, |investors| -> StdResult<_> {
            let mut investors = investors.unwrap_or_default();
            if !investors.contains(&info.sender) {
                investors.push(info.sender.clone());
                proposal.funding_status.investor_count += 1;
            }
            Ok(investors)
        })?;
        
        // Add to user investments list
        USER_INVESTMENTS.update(deps.storage, &info.sender, |proposals| -> StdResult<_> {
            let mut proposals = proposals.unwrap_or_default();
            if !proposals.contains(&proposal_id) {
                proposals.push(proposal_id.clone());
            }
            Ok(proposals)
        })?;
    }
    
    // Update proposal funding status
    proposal.funding_status.raised_amount += investment_amount;
    
    // Check if funding goal is reached
    if proposal.funding_status.raised_amount >= proposal.financial_terms.target_amount {
        proposal.funding_status.is_funded = true;
        proposal.status = ProposalStatus::Funded;
        
        // Set lockup end time (12 months after funding completion)
        let config = CONFIG.load(deps.storage)?;
        proposal.timestamps.lockup_end = Some(current_time + config.lockup_period_seconds);
        
        // Update creator stats
        CREATORS.update(deps.storage, &proposal.creator, |creator| -> StdResult<_> {
            let mut creator = creator.unwrap();
            creator.total_raised += proposal.funding_status.raised_amount;
            creator.successful_proposals += 1;
            Ok(creator)
        })?;
    }
    
    proposal.timestamps.updated_at = current_time;
    PROPOSALS.save(deps.storage, &proposal_id, &proposal)?;
    
    let mut response = Response::new()
        .add_attribute("method", "invest")
        .add_attribute("investor", info.sender.as_str())
        .add_attribute("proposal_id", &proposal_id)
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
    let mut proposal = PROPOSALS.load(deps.storage, &proposal_id)?;
    let config = CONFIG.load(deps.storage)?;
    
    // Only admin or creator can trigger refunds
    if info.sender != proposal.creator && info.sender != config.admin {
        return Err(ContractError::Unauthorized {});
    }
    
    // Can only refund if proposal failed or was cancelled
    match proposal.status {
        ProposalStatus::Failed | ProposalStatus::Cancelled => {},
        ProposalStatus::Active => {
            // Check if deadline has passed
            if env.block.time.seconds() <= proposal.financial_terms.funding_deadline {
                return Err(ContractError::FundingDeadlinePassed {});
            }
            // Mark as failed since deadline passed without funding
            proposal.status = ProposalStatus::Failed;
        },
        _ => return Err(ContractError::ProposalNotActive {}),
    }
    
    // Get all investors for this proposal
    let investors = PROPOSAL_INVESTMENTS.may_load(deps.storage, &proposal_id)?
        .unwrap_or_default();
    
    if investors.is_empty() {
        return Err(ContractError::NoInvestmentsToRefund {});
    }
    
    let mut refund_messages = Vec::new();
    let mut total_refunded = Uint128::zero();
    let mut refunded_count = 0u64;
    
    // Process refunds for each investor
    for investor in investors {
        if let Ok(mut investment) = INVESTMENTS.load(deps.storage, (&proposal_id, &investor)) {
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
                INVESTMENTS.save(deps.storage, (&proposal_id, &investor), &investment)?;
                
                total_refunded += refund_amount;
                refunded_count += 1;
            }
        }
    }
    
    if refund_messages.is_empty() {
        return Err(ContractError::NoInvestmentsToRefund {});
    }
    
    // Update proposal funding status
    proposal.funding_status.raised_amount = Uint128::zero();
    proposal.timestamps.updated_at = env.block.time.seconds();
    PROPOSALS.save(deps.storage, &proposal_id, &proposal)?;
    
    Ok(Response::new()
        .add_messages(refund_messages)
        .add_attribute("method", "refund_investors")
        .add_attribute("proposal_id", proposal_id)
        .add_attribute("total_refunded", total_refunded.to_string())
        .add_attribute("investors_refunded", refunded_count.to_string()))
}

fn execute_mint_tokens(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    proposal_id: String,
) -> Result<Response, ContractError> {
    // Check rate limit
    rate_limit::RateLimiter::record_operation(deps.storage, &info.sender, "mint_tokens", &env)?;
    
    let mut proposal = PROPOSALS.load(deps.storage, &proposal_id)?;
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
        }.into(),
        gas_limit: None,
        reply_on: ReplyOn::Success,
    };
    
    // Mark tokens as minted in proposal
    proposal.funding_status.tokens_minted = true;
    proposal.timestamps.updated_at = env.block.time.seconds();
    PROPOSALS.save(deps.storage, &proposal_id, &proposal)?;
    
    Ok(Response::new()
        .add_submessage(instantiate_submsg)
        .add_attribute("method", "mint_tokens")
        .add_attribute("proposal_id", proposal_id)
        .add_attribute("total_shares", proposal.financial_terms.total_shares.to_string()))
}

fn execute_distribute_tokens(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    proposal_id: String,
) -> Result<Response, ContractError> {
    let mut proposal = PROPOSALS.load(deps.storage, &proposal_id)?;
    let config = CONFIG.load(deps.storage)?;
    
    // Only admin or creator can distribute tokens
    if info.sender != proposal.creator && info.sender != config.admin {
        return Err(ContractError::Unauthorized {});
    }
    
    // Tokens must be minted before distribution
    if !proposal.funding_status.tokens_minted {
        return Err(ContractError::TokensNotMinted {});
    }
    
    // Check that proposal is funded
    if !proposal.funding_status.is_funded {
        return Err(ContractError::ProposalNotFunded {});
    }
    
    // Get token contract address
    let token_address = TOKEN_CONTRACTS.load(deps.storage, &proposal_id)?;
    
    // Get all investors for this proposal
    let investors = PROPOSAL_INVESTMENTS.may_load(deps.storage, &proposal_id)?
        .unwrap_or_default();
    
    if investors.is_empty() {
        return Err(ContractError::NoInvestmentsToRefund {});
    }
    
    let mut mint_messages = Vec::new();
    let mut total_distributed = 0u64;
    let mut distributed_count = 0u64;
    
    // Mint tokens to each investor based on their investment
    for investor in investors {
        if let Ok(mut investment) = INVESTMENTS.load(deps.storage, (&proposal_id, &investor)) {
            // Only distribute to pending investments
            if investment.status == InvestmentStatus::Pending {
                let shares_to_mint = investment.shares;
                
                // Create mint message for investor
                let mint_msg = Cw20ExecuteMsg::Mint {
                    recipient: investor.to_string(),
                    amount: Uint128::from(shares_to_mint),
                };
                
                let cosmos_msg = cosmwasm_std::WasmMsg::Execute {
                    contract_addr: token_address.to_string(),
                    msg: to_json_binary(&mint_msg)?,
                    funds: vec![],
                };
                
                mint_messages.push(cosmos_msg.into());
                
                // Update investment status to completed
                investment.status = InvestmentStatus::Completed;
                INVESTMENTS.save(deps.storage, (&proposal_id, &investor), &investment)?;
                
                total_distributed += shares_to_mint;
                distributed_count += 1;
            }
        }
    }
    
    if mint_messages.is_empty() {
        return Err(ContractError::NoInvestmentsToRefund {});
    }
    
    // Update proposal status to completed (tokens distributed)
    proposal.status = ProposalStatus::Completed;
    proposal.timestamps.updated_at = env.block.time.seconds();
    PROPOSALS.save(deps.storage, &proposal_id, &proposal)?;
    
    // Release funds to creator (minus platform fee)
    let platform_fee = (proposal.funding_status.raised_amount.u128() * config.platform_fee_bps as u128) / 10000;
    let creator_amount = proposal.funding_status.raised_amount.u128() - platform_fee;
    
    let mut response_messages = mint_messages;
    
    // Send funds to creator
    if creator_amount > 0 {
        let creator_payout = cosmwasm_std::BankMsg::Send {
            to_address: proposal.creator.to_string(),
            amount: vec![Coin {
                denom: "untrn".to_string(),
                amount: Uint128::from(creator_amount),
            }],
        };
        response_messages.push(creator_payout.into());
    }
    
    // Send platform fee to admin
    if platform_fee > 0 {
        let admin_fee = cosmwasm_std::BankMsg::Send {
            to_address: config.admin.to_string(),
            amount: vec![Coin {
                denom: "untrn".to_string(),
                amount: Uint128::from(platform_fee),
            }],
        };
        response_messages.push(admin_fee.into());
    }
    
    Ok(Response::new()
        .add_messages(response_messages)
        .add_attribute("method", "distribute_tokens")
        .add_attribute("proposal_id", proposal_id)
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

    Ok(Response::new()
        .add_attribute("method", "update_config"))
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
    
    // Iterate through all active proposals to check for expired ones
    for item in PROPOSALS.range(deps.storage, None, None, cosmwasm_std::Order::Ascending) {
        let (proposal_id, mut proposal) = item?;
        
        // Only process active proposals that have expired
        if proposal.status == ProposalStatus::Active && 
           current_time > proposal.financial_terms.funding_deadline &&
           !proposal.funding_status.is_funded {
            
            // Mark proposal as failed
            proposal.status = ProposalStatus::Failed;
            proposal.timestamps.updated_at = current_time;
            PROPOSALS.save(deps.storage, &proposal_id, &proposal)?;
            
            failed_proposals.push(proposal_id.clone());
            processed_count += 1;
            
            // Auto-trigger refunds for failed proposals
            let investors = PROPOSAL_INVESTMENTS.may_load(deps.storage, &proposal_id)?
                .unwrap_or_default();
            
            for investor in investors {
                if let Ok(mut investment) = INVESTMENTS.load(deps.storage, (&proposal_id, &investor)) {
                    if investment.status == InvestmentStatus::Pending {
                        investment.status = InvestmentStatus::Refunded;
                        INVESTMENTS.save(deps.storage, (&proposal_id, &investor), &investment)?;
                    }
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
        _ => Err(ContractError::Std(cosmwasm_std::StdError::generic_err("Unknown reply ID"))),
    }
}

fn handle_token_instantiate_reply(
    deps: DepsMut,
    env: Env,
    msg: cosmwasm_std::Reply,
) -> Result<Response, ContractError> {
    // Parse the instantiate result to get the token contract address
    let res = cosmwasm_std::parse_reply_instantiate_data(msg)?;
    let token_addr = deps.api.addr_validate(&res.contract_address)?;
    
    // Retrieve the proposal ID we stored before the submessage
    let proposal_id = PENDING_TOKEN_REPLY.load(deps.storage)?;
    
    // Store the token contract address for this proposal
    TOKEN_CONTRACTS.save(deps.storage, &proposal_id, &token_addr)?;
    
    // Load the proposal to update its status
    let mut proposal = PROPOSALS.load(deps.storage, &proposal_id)?;
    
    // Set the lockup end timestamp (12 months from now)
    proposal.timestamps.lockup_end = Some(env.block.time.seconds() + crate::state::LOCKUP_PERIOD_SECONDS);
    proposal.timestamps.updated_at = env.block.time.seconds();
    
    // Update proposal status to indicate tokens are ready for distribution
    PROPOSALS.save(deps.storage, &proposal_id, &proposal)?;
    
    // Clean up the temporary storage
    PENDING_TOKEN_REPLY.remove(deps.storage);
    
    Ok(Response::new()
        .add_attribute("method", "token_instantiated")
        .add_attribute("proposal_id", proposal_id)
        .add_attribute("token_address", token_addr.to_string()))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::Config {} => to_json_binary(&query_config(deps)?),
        QueryMsg::Proposal { proposal_id } => to_json_binary(&query_proposal(deps, proposal_id)?),
        QueryMsg::ProposalsByCreator { creator, start_after, limit } => {
            to_json_binary(&query_proposals_by_creator(deps, creator, start_after, limit)?)
        }
        QueryMsg::ProposalsByStatus { status, start_after, limit } => {
            to_json_binary(&query_proposals_by_status(deps, status, start_after, limit)?)
        }
        QueryMsg::AllProposals { start_after, limit } => {
            to_json_binary(&query_all_proposals(deps, start_after, limit)?)
        }
        QueryMsg::Investment { proposal_id, investor } => {
            to_json_binary(&query_investment(deps, proposal_id, investor)?)
        }
        QueryMsg::InvestmentsByProposal { proposal_id, start_after, limit } => {
            to_json_binary(&query_investments_by_proposal(deps, proposal_id, start_after, limit)?)
        }
        QueryMsg::InvestmentsByUser { user, start_after, limit } => {
            to_json_binary(&query_investments_by_user(deps, user, start_after, limit)?)
        }
        QueryMsg::Creator { creator } => to_json_binary(&query_creator(deps, creator)?),
        QueryMsg::CreatorStats { creator } => to_json_binary(&query_creator_stats(deps, creator)?),
        QueryMsg::TotalValueLocked {} => to_json_binary(&query_total_value_locked(deps)?),
        QueryMsg::PlatformStats {} => to_json_binary(&query_platform_stats(deps)?),
        QueryMsg::UserPortfolio { user, start_after, limit } => {
            to_json_binary(&query_user_portfolio(deps, user, start_after, limit)?)
        }
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
    }
}

// Query function implementations
fn query_config(deps: Deps) -> StdResult<Config> {
    CONFIG.load(deps.storage)
}

fn query_proposal(deps: Deps, proposal_id: String) -> StdResult<crate::msg::ProposalResponse> {
    let proposal = PROPOSALS.load(deps.storage, &proposal_id)?;
    
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
    let limit = limit.unwrap_or(30).min(100) as usize;
    
    let proposals: Vec<_> = PROPOSALS
        .range(deps.storage, None, None, cosmwasm_std::Order::Descending)
        .filter(|item| {
            if let Ok((_, proposal)) = item {
                proposal.creator == creator_addr
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

    Ok(crate::msg::ProposalsResponse {
        proposals,
        total_count: proposals.len() as u64,
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

    Ok(crate::msg::ProposalsResponse {
        proposals,
        total_count: proposals.len() as u64,
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

    Ok(crate::msg::ProposalsResponse {
        proposals,
        total_count: proposals.len() as u64,
    })
}

fn query_investment(
    deps: Deps,
    proposal_id: String,
    investor: String,
) -> StdResult<crate::msg::InvestmentResponse> {
    let investor_addr = deps.api.addr_validate(&investor)?;
    let investment = INVESTMENTS.load(deps.storage, (&proposal_id, &investor_addr))?;
    let proposal = PROPOSALS.load(deps.storage, &proposal_id)?;
    
    Ok(crate::msg::InvestmentResponse {
        investment,
        proposal_title: proposal.asset_details.name,
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
    let proposal = PROPOSALS.load(deps.storage, &proposal_id)?;
    
    let investments: Vec<_> = INVESTMENTS
        .prefix(&proposal_id)
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
            let proposal = PROPOSALS.load(deps.storage, &proposal_id)?;
            Ok(crate::msg::InvestmentResponse {
                current_value: calculate_current_investment_value(&investment, &proposal),
                proposal_title: proposal.asset_details.name,
                investment,
            })
        })
        .collect::<StdResult<Vec<_>>>()?;

    let total_invested: Uint128 = user_investments.iter().map(|inv| inv.investment.amount).sum();

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
    let mut total_proposals = 0u64;
    let mut active_proposals = 0u64;
    let mut successful_proposals = 0u64;
    let mut total_raised = Uint128::zero();
    let mut total_investors = 0u64;

    for item in PROPOSALS.range(deps.storage, None, None, cosmwasm_std::Order::Ascending) {
        let (_, proposal) = item?;
        total_proposals += 1;
        total_raised += proposal.funding_status.raised_amount;
        total_investors += proposal.funding_status.investor_count;
        
        match proposal.status {
            ProposalStatus::Active => active_proposals += 1,
            ProposalStatus::Completed => successful_proposals += 1,
            _ => {}
        }
    }

    Ok(crate::msg::PlatformStats {
        total_proposals,
        active_proposals,
        total_raised,
        total_investors,
        successful_proposals,
    })
}

// Helper functions
fn calculate_funding_progress(proposal: &Proposal) -> crate::msg::FundingProgress {
    let raised_percentage = if proposal.financial_terms.target_amount.is_zero() {
        0u64
    } else {
        (proposal.funding_status.raised_amount.u128() * 100 / proposal.financial_terms.target_amount.u128()) as u64
    };

    let shares_sold = if proposal.financial_terms.token_price.is_zero() {
        0u64
    } else {
        (proposal.funding_status.raised_amount.u128() / proposal.financial_terms.token_price.u128()) as u64
    };
    
    let shares_remaining = proposal.financial_terms.total_shares.saturating_sub(shares_sold);

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
    if proposal.financial_terms.token_price.is_zero() {
        return Err(ContractError::InvalidTokenPrice {});
    }
    
    let shares = investment_amount.u128() / proposal.financial_terms.token_price.u128();
    
    if shares == 0 {
        return Err(ContractError::InvalidSharesCalculation {});
    }
    
    Ok(shares as u64)
}

fn calculate_current_shares_sold(proposal: &Proposal) -> u64 {
    if proposal.financial_terms.token_price.is_zero() {
        return 0;
    }
    
    (proposal.funding_status.raised_amount.u128() / proposal.financial_terms.token_price.u128()) as u64
}

fn calculate_remaining_shares(proposal: &Proposal) -> u64 {
    let shares_sold = calculate_current_shares_sold(proposal);
    proposal.financial_terms.total_shares.saturating_sub(shares_sold)
}

fn calculate_maximum_investment(proposal: &Proposal) -> Uint128 {
    let remaining_shares = calculate_remaining_shares(proposal);
    Uint128::from(remaining_shares as u128) * proposal.financial_terms.token_price
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
fn query_lockup_info(
    deps: Deps,
    env: Env,
    proposal_id: String,
) -> StdResult<lockup::LockupInfo> {
    lockup::get_lockup_info(deps, env, &proposal_id)
}

fn query_lockup_status(
    deps: Deps,
    env: Env,
    proposal_id: String,
) -> StdResult<lockup::LockupStatus> {
    lockup::get_lockup_status(deps, env, &proposal_id)
}

// Compliance query functions
fn query_compliance_report(
    deps: Deps,
    proposal_id: String,
) -> StdResult<compliance::ComplianceReport> {
    compliance::generate_proposal_compliance_report(deps, &proposal_id)
}

fn query_platform_compliance_report(
    deps: Deps,
) -> StdResult<compliance::PlatformComplianceReport> {
    compliance::generate_platform_compliance_report(deps)
}

// Governance query functions
fn query_governance_info(
    deps: Deps,
    proposal_id: String,
) -> StdResult<governance::GovernanceInfo> {
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
    
    rate_limit::RateLimiter::update_config(
        deps.storage,
        window_seconds,
        max_operations,
        enabled,
    )?;
    
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