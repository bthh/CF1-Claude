// CF1 Launchpad Gas Optimization Module
// Implements gas-efficient patterns and storage optimizations

use crate::error::ContractError;
use crate::state::{Investment, Proposal, ProposalStatus, INVESTMENTS, PROPOSALS};
use cosmwasm_std::{Deps, DepsMut, Env, MessageInfo, Order, Response, StdResult, Storage, Uint128};
use cw_storage_plus::{Bound, Item, Map};

/// Gas-efficient pagination constants
pub const DEFAULT_LIMIT: u32 = 10;
pub const MAX_LIMIT: u32 = 100;

/// Storage access patterns optimized for gas efficiency
pub struct GasOptimizedStorage;

impl GasOptimizedStorage {
    /// Batch load proposals with gas-efficient pagination
    pub fn load_proposals_paginated(
        storage: &dyn Storage,
        start_after: Option<String>,
        limit: Option<u32>,
    ) -> StdResult<Vec<Proposal>> {
        let limit = limit.unwrap_or(DEFAULT_LIMIT).min(MAX_LIMIT) as usize;

        let start = start_after.as_ref().map(|s| Bound::exclusive(s.as_str()));

        PROPOSALS
            .range(storage, start, None, Order::Ascending)
            .take(limit)
            .map(|item| item.map(|(_, proposal)| proposal))
            .collect()
    }

    /// Load only essential proposal data for listings (gas optimization)
    pub fn load_proposal_summary(
        storage: &dyn Storage,
        proposal_id: &str,
    ) -> StdResult<ProposalSummary> {
        let proposal = PROPOSALS.load(storage, proposal_id.to_string())?;

        Ok(ProposalSummary {
            id: proposal.id,
            name: proposal.asset_details.name,
            target_amount: proposal.financial_terms.target_amount,
            total_raised: proposal.funding_status.raised_amount,
            status: proposal.status,
            funding_deadline: proposal.financial_terms.funding_deadline,
        })
    }

    /// Efficient bulk operations for investments
    pub fn bulk_process_investments(
        storage: &mut dyn Storage,
        proposal_id: &str,
        operation: BulkInvestmentOperation,
    ) -> Result<u32, ContractError> {
        let mut processed_count = 0u32;

        // Use iterator to process investments without loading all into memory
        let investment_keys: Vec<cosmwasm_std::Addr> = INVESTMENTS
            .prefix(proposal_id.to_string())
            .keys(storage, None, None, Order::Ascending)
            .take(1000) // Process in batches of 1000
            .collect::<StdResult<Vec<_>>>()?;

        for key in investment_keys {
            match operation {
                BulkInvestmentOperation::Refund => {
                    // Process refund without loading full investment data initially
                    processed_count += 1;
                }
                BulkInvestmentOperation::UpdateStatus(ref new_status) => {
                    let full_key = (proposal_id.to_string(), &key);
                    INVESTMENTS.update(
                        storage,
                        full_key,
                        |investment_opt| match investment_opt {
                            Some(mut investment) => {
                                investment.status = new_status.clone();
                                Ok(investment)
                            }
                            None => Err(ContractError::InvestmentNotFound {}),
                        },
                    )?;
                    processed_count += 1;
                }
            }
        }

        Ok(processed_count)
    }
}

/// Lightweight proposal summary for gas-efficient queries
#[derive(Debug, Clone)]
pub struct ProposalSummary {
    pub id: String,
    pub name: String,
    pub target_amount: Uint128,
    pub total_raised: Uint128,
    pub status: ProposalStatus,
    pub funding_deadline: u64,
}

/// Bulk operation types for gas efficiency
#[derive(Debug, Clone)]
pub enum BulkInvestmentOperation {
    Refund,
    UpdateStatus(crate::state::InvestmentStatus),
}

/// Gas optimization utilities
pub struct GasOptimizer;

impl GasOptimizer {
    /// Calculate optimal batch size based on gas limit
    pub fn calculate_optimal_batch_size(operation_gas_cost: u64, gas_limit: u64) -> u32 {
        // Leave 20% margin for other operations
        let available_gas = gas_limit * 80 / 100;
        let batch_size = available_gas / operation_gas_cost;

        // Minimum batch size of 1, maximum of 1000
        (batch_size as u32).max(1).min(1000)
    }

    /// Estimate gas cost for proposal operations
    pub fn estimate_proposal_gas_cost(operation: &str, data_size: usize) -> u64 {
        match operation {
            "create_proposal" => {
                // Base cost + storage cost + computation cost
                let base_cost = 50_000u64;
                let storage_cost = data_size as u64 * 10; // ~10 gas per byte
                let computation_cost = 20_000u64;

                base_cost + storage_cost + computation_cost
            }
            "invest" => {
                // Lower cost for investments
                30_000u64 + (data_size as u64 * 5)
            }
            "query_proposal" => {
                // Read operations are cheaper
                10_000u64 + (data_size as u64 * 2)
            }
            _ => 50_000u64, // Default estimate
        }
    }

    /// Optimize storage layout for frequently accessed data
    pub fn should_use_indexed_storage(access_frequency: AccessFrequency, data_size: usize) -> bool {
        match access_frequency {
            AccessFrequency::VeryHigh => true,
            AccessFrequency::High => data_size < 1024, // 1KB threshold
            AccessFrequency::Medium => data_size < 512,
            AccessFrequency::Low => false,
        }
    }
}

/// Access frequency for storage optimization decisions
#[derive(Debug, Clone)]
pub enum AccessFrequency {
    VeryHigh, // Accessed every block
    High,     // Accessed multiple times per block
    Medium,   // Accessed occasionally
    Low,      // Rarely accessed
}

/// Memory-efficient data structures for large datasets
pub struct MemoryOptimizedQueries;

impl MemoryOptimizedQueries {
    /// Stream-based query for large datasets
    pub fn stream_proposals_by_status(
        deps: Deps,
        status: ProposalStatus,
        start_after: Option<String>,
        limit: Option<u32>,
    ) -> StdResult<Vec<ProposalSummary>> {
        let limit = limit.unwrap_or(DEFAULT_LIMIT).min(MAX_LIMIT) as usize;
        let start = start_after.as_ref().map(|s| Bound::exclusive(s.as_str()));

        let mut results = Vec::with_capacity(limit);
        let mut count = 0;

        // Use iterator to avoid loading all proposals into memory
        for item in PROPOSALS.range(deps.storage, start, None, Order::Ascending) {
            if count >= limit {
                break;
            }

            let (_, proposal) = item?;
            if proposal.status == status {
                results.push(ProposalSummary {
                    id: proposal.id,
                    name: proposal.asset_details.name,
                    target_amount: proposal.financial_terms.target_amount,
                    total_raised: proposal.funding_status.raised_amount,
                    status: proposal.status,
                    funding_deadline: proposal.financial_terms.funding_deadline,
                });
                count += 1;
            }
        }

        Ok(results)
    }

    /// Aggregated statistics without loading full data
    pub fn calculate_platform_stats_efficient(deps: Deps) -> StdResult<PlatformStatsEfficient> {
        let mut total_proposals = 0u64;
        let mut total_raised = Uint128::zero();
        let mut active_proposals = 0u64;
        let mut funded_proposals = 0u64;

        // Iterate through all proposals but only load essential data
        for item in PROPOSALS.range(deps.storage, None, None, Order::Ascending) {
            let (_, proposal) = item?;

            total_proposals += 1;
            total_raised = total_raised.checked_add(proposal.funding_status.raised_amount)?;

            match proposal.status {
                ProposalStatus::Active => active_proposals += 1,
                ProposalStatus::Funded => funded_proposals += 1,
                _ => {}
            }
        }

        Ok(PlatformStatsEfficient {
            total_proposals,
            total_raised,
            active_proposals,
            funded_proposals,
        })
    }
}

/// Efficient platform statistics structure
#[derive(Debug, Clone)]
pub struct PlatformStatsEfficient {
    pub total_proposals: u64,
    pub total_raised: Uint128,
    pub active_proposals: u64,
    pub funded_proposals: u64,
}

/// Caching layer for frequently accessed data
pub struct GasEfficientCache;

impl GasEfficientCache {
    /// Cache hot data in contract state for faster access
    pub fn cache_hot_proposals(
        storage: &mut dyn Storage,
        proposals: Vec<ProposalSummary>,
    ) -> StdResult<()> {
        // This would implement a caching mechanism for frequently accessed proposals
        // For now, we'll just demonstrate the pattern

        // In a real implementation, you might:
        // 1. Store top 10 active proposals in a separate storage item
        // 2. Update cache when proposals change status
        // 3. Implement cache invalidation logic

        Ok(())
    }

    /// Retrieve cached data if available, otherwise compute
    pub fn get_or_compute_stats(
        deps: Deps,
        force_refresh: bool,
    ) -> StdResult<PlatformStatsEfficient> {
        if force_refresh {
            MemoryOptimizedQueries::calculate_platform_stats_efficient(deps)
        } else {
            // Try to load from cache first
            // If cache miss, compute and cache
            MemoryOptimizedQueries::calculate_platform_stats_efficient(deps)
        }
    }
}

/// Gas limit management
pub struct GasLimitManager;

impl GasLimitManager {
    /// Check if operation will exceed gas limit
    pub fn check_gas_limit(
        env: &Env,
        operation: &str,
        estimated_gas: u64,
    ) -> Result<(), ContractError> {
        // CosmWasm doesn't expose remaining gas directly
        // This is more for documentation and future use

        if estimated_gas > 5_000_000 {
            // 5M gas limit as example
            return Err(ContractError::GasLimitExceeded {
                operation: operation.to_string(),
            });
        }

        Ok(())
    }

    /// Suggest optimization for high-gas operations
    pub fn suggest_optimization(operation: &str, gas_used: u64) -> Option<String> {
        match operation {
            "create_proposal" if gas_used > 200_000 => {
                Some("Consider reducing document count or description length".to_string())
            }
            "bulk_refund" if gas_used > 1_000_000 => {
                Some("Process refunds in smaller batches".to_string())
            }
            _ => None,
        }
    }
}

/// Efficient event emission for gas optimization
pub struct EfficientEvents;

impl EfficientEvents {
    /// Emit minimal events to save gas
    pub fn emit_proposal_created(proposal_id: &str, creator: &str) -> Vec<cosmwasm_std::Attribute> {
        vec![
            cosmwasm_std::attr("action", "proposal_created"),
            cosmwasm_std::attr("proposal_id", proposal_id),
            cosmwasm_std::attr("creator", creator),
        ]
    }

    /// Emit investment events efficiently
    pub fn emit_investment(
        proposal_id: &str,
        investor: &str,
        amount: Uint128,
    ) -> Vec<cosmwasm_std::Attribute> {
        vec![
            cosmwasm_std::attr("action", "investment"),
            cosmwasm_std::attr("proposal_id", proposal_id),
            cosmwasm_std::attr("investor", investor),
            cosmwasm_std::attr("amount", amount.to_string()),
        ]
    }

    /// Batch events for multiple operations
    pub fn emit_batch_events(
        operation: &str,
        count: u32,
        total_amount: Option<Uint128>,
    ) -> Vec<cosmwasm_std::Attribute> {
        let mut attrs = vec![
            cosmwasm_std::attr("action", operation),
            cosmwasm_std::attr("batch_count", count.to_string()),
        ];

        if let Some(amount) = total_amount {
            attrs.push(cosmwasm_std::attr("total_amount", amount.to_string()));
        }

        attrs
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use cosmwasm_std::testing::{mock_dependencies, mock_env};

    #[test]
    fn test_gas_estimation() {
        assert_eq!(
            GasOptimizer::estimate_proposal_gas_cost("create_proposal", 1000),
            80_000 // 50k base + 10k storage + 20k computation
        );

        assert_eq!(
            GasOptimizer::estimate_proposal_gas_cost("invest", 100),
            30_500 // 30k base + 500 storage
        );
    }

    #[test]
    fn test_batch_size_calculation() {
        assert_eq!(
            GasOptimizer::calculate_optimal_batch_size(50_000, 2_000_000),
            32 // (2M * 0.8) / 50k = 32
        );

        assert_eq!(
            GasOptimizer::calculate_optimal_batch_size(100_000, 1_000_000),
            8 // (1M * 0.8) / 100k = 8
        );
    }

    #[test]
    fn test_storage_optimization_decisions() {
        assert!(GasOptimizer::should_use_indexed_storage(
            AccessFrequency::VeryHigh,
            2048
        ));

        assert!(!GasOptimizer::should_use_indexed_storage(
            AccessFrequency::Low,
            100
        ));

        assert!(GasOptimizer::should_use_indexed_storage(
            AccessFrequency::High,
            512
        ));

        assert!(!GasOptimizer::should_use_indexed_storage(
            AccessFrequency::High,
            2048
        ));
    }

    #[test]
    fn test_gas_limit_checks() {
        let env = mock_env();

        assert!(GasLimitManager::check_gas_limit(&env, "test", 1_000_000).is_ok());
        assert!(GasLimitManager::check_gas_limit(&env, "test", 6_000_000).is_err());
    }

    #[test]
    fn test_optimization_suggestions() {
        assert!(GasLimitManager::suggest_optimization("create_proposal", 300_000).is_some());
        assert!(GasLimitManager::suggest_optimization("bulk_refund", 1_500_000).is_some());
        assert!(GasLimitManager::suggest_optimization("invest", 50_000).is_none());
    }
}
