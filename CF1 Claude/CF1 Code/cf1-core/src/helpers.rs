use crate::msg::{InvestmentResponse, InvestmentsResponse};
use crate::state::{Investment, Proposal, INVESTMENTS, PROPOSALS};
use cosmwasm_std::{Addr, Deps, StdResult, Uint128};

/// Get all investments for a specific user across all proposals
pub fn get_user_portfolio(
    deps: Deps,
    user: &Addr,
    start_after: Option<String>,
    limit: Option<u32>,
) -> StdResult<InvestmentsResponse> {
    let limit = limit.unwrap_or(30).min(100) as usize;

    let user_investments: Vec<_> = INVESTMENTS
        .range(deps.storage, None, None, cosmwasm_std::Order::Ascending)
        .filter(|item| {
            if let Ok(((_, addr), _)) = item {
                addr == user
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
            let proposal = PROPOSALS.load(deps.storage, proposal_id)?;
            Ok(InvestmentResponse {
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

    Ok(InvestmentsResponse {
        investments: user_investments,
        total_invested,
    })
}

/// Calculate portfolio performance metrics for a user
pub fn get_portfolio_performance(deps: Deps, user: &Addr) -> StdResult<PortfolioPerformance> {
    let user_investments: Vec<_> = INVESTMENTS
        .range(deps.storage, None, None, cosmwasm_std::Order::Ascending)
        .filter(|item| {
            if let Ok(((_, addr), _)) = item {
                addr == user
            } else {
                false
            }
        })
        .map(|item| {
            let ((proposal_id, _), investment) = item?;
            let proposal = PROPOSALS.load(deps.storage, proposal_id)?;
            Ok((investment, proposal))
        })
        .collect::<StdResult<Vec<_>>>()?;

    let mut total_invested = Uint128::zero();
    let mut total_current_value = Uint128::zero();
    let mut active_investments = 0u32;
    let mut completed_investments = 0u32;

    for (investment, proposal) in user_investments {
        total_invested += investment.amount;
        total_current_value += calculate_current_investment_value(&investment, &proposal);

        match proposal.status {
            crate::state::ProposalStatus::Active | crate::state::ProposalStatus::Funded => {
                active_investments += 1;
            }
            crate::state::ProposalStatus::Completed => {
                completed_investments += 1;
            }
            _ => {}
        }
    }

    let total_return = if !total_invested.is_zero() {
        let return_amount = total_current_value.saturating_sub(total_invested);
        ((return_amount.u128() * 10000) / total_invested.u128()) as i32 // Basis points
    } else {
        0i32
    };

    Ok(PortfolioPerformance {
        total_invested,
        total_current_value,
        total_return_bps: total_return,
        active_investments,
        completed_investments,
    })
}

/// Helper function to calculate current investment value
fn calculate_current_investment_value(investment: &Investment, proposal: &Proposal) -> Uint128 {
    // For now, return the original investment amount
    // In production, this would calculate current market value based on:
    // - Asset performance
    // - Market conditions
    // - Time elapsed
    // - Dividend distributions
    match proposal.status {
        crate::state::ProposalStatus::Completed => {
            // Could apply appreciation/depreciation here
            investment.amount
        }
        crate::state::ProposalStatus::Failed | crate::state::ProposalStatus::Cancelled => {
            Uint128::zero()
        }
        _ => investment.amount,
    }
}

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct PortfolioPerformance {
    pub total_invested: Uint128,
    pub total_current_value: Uint128,
    pub total_return_bps: i32, // Return in basis points (100 bps = 1%)
    pub active_investments: u32,
    pub completed_investments: u32,
}
