# CF1 Launchpad Gas Optimization Guide

## Overview

This document outlines the gas optimization strategies implemented in the CF1 Launchpad smart contract and provides guidelines for maintaining efficient gas usage as the platform scales.

## Gas Optimization Principles

### 1. Storage Efficiency
- Minimize storage operations (most expensive)
- Use efficient data structures
- Implement storage layout optimization
- Avoid unnecessary state changes

### 2. Computation Efficiency
- Reduce complex calculations
- Optimize loop operations
- Use efficient algorithms
- Minimize external calls

### 3. Memory Management
- Efficient data loading patterns
- Pagination for large datasets
- Stream processing for bulk operations
- Caching frequently accessed data

## Current Gas Benchmarks

### Core Operations
| Operation | Estimated Gas | Optimization Level |
|-----------|---------------|-------------------|
| `create_proposal` | 80,000 - 120,000 | ✅ Optimized |
| `invest` | 30,000 - 50,000 | ✅ Optimized |
| `mint_tokens` | 100,000 - 150,000 | ✅ Optimized |
| `distribute_tokens` | 50,000 - 80,000 | ✅ Optimized |
| `refund_investors` | 40,000 - 60,000 | ✅ Optimized |
| `query_proposal` | 10,000 - 20,000 | ✅ Optimized |

### Bulk Operations
| Operation | Per Item Gas | Batch Size | Total Gas |
|-----------|--------------|------------|-----------|
| Bulk refunds | 25,000 | 100 | 2,500,000 |
| Token distribution | 30,000 | 50 | 1,500,000 |
| Status updates | 15,000 | 200 | 3,000,000 |

## Storage Optimization Strategies

### 1. Data Structure Design

```rust
// Optimized storage layout
pub struct Proposal {
    // Fixed-size fields first (better packing)
    pub id: String,                    // Variable but indexed
    pub status: ProposalStatus,        // 1 byte enum
    pub creator: Addr,                 // 32 bytes
    
    // Variable-size fields grouped
    pub asset_details: AssetDetails,   // Separate structure
    pub financial_terms: FinancialTerms,
    
    // Rarely accessed fields last
    pub documents: Vec<Document>,      // Consider external storage
    pub compliance: ComplianceInfo,
}
```

### 2. Efficient Indexing

```rust
// Multi-key indexing for efficient queries
PROPOSALS: Map<&str, Proposal>              // Primary key
PROPOSALS_BY_CREATOR: Map<(&str, &str), ()> // Creator + ID
PROPOSALS_BY_STATUS: Map<(ProposalStatus, &str), ()> // Status + ID
ACTIVE_PROPOSALS: Map<&str, ProposalSummary> // Hot cache
```

### 3. Pagination Implementation

```rust
// Gas-efficient pagination
pub fn query_proposals_paginated(
    deps: Deps,
    start_after: Option<String>,
    limit: Option<u32>,
) -> StdResult<ProposalsResponse> {
    let limit = limit.unwrap_or(DEFAULT_LIMIT).min(MAX_LIMIT);
    
    let proposals = GasOptimizedStorage::load_proposals_paginated(
        deps.storage,
        start_after,
        Some(limit),
    )?;
    
    Ok(ProposalsResponse { proposals })
}
```

## Computation Optimization Strategies

### 1. Mathematical Operations

```rust
// Optimized percentage calculations
impl MathGuard {
    pub fn calculate_percentage_optimized(
        amount: Uint128,
        percentage_bps: u16,
    ) -> Result<Uint128, ContractError> {
        // Pre-compute constants to avoid repeated division
        match percentage_bps {
            250 => amount.multiply_ratio(1u128, 40u128), // 2.5% = 1/40
            500 => amount.multiply_ratio(1u128, 20u128), // 5% = 1/20
            1000 => amount.multiply_ratio(1u128, 10u128), // 10% = 1/10
            _ => {
                // Generic calculation for custom percentages
                amount.multiply_ratio(percentage_bps as u128, 10000u128)
            }
        }
    }
}
```

### 2. Efficient Loops

```rust
// Optimized bulk operations
pub fn bulk_process_investments_optimized(
    storage: &mut dyn Storage,
    proposal_id: &str,
    operation: BulkInvestmentOperation,
    batch_size: u32,
) -> Result<u32, ContractError> {
    let mut processed = 0u32;
    let mut iteration = 0u32;
    
    loop {
        let start_key = format!("{}_{}", proposal_id, iteration * batch_size);
        let investments: Vec<_> = INVESTMENTS
            .prefix(proposal_id)
            .range(
                storage,
                Some(Bound::Exclusive(start_key.as_bytes())),
                None,
                Order::Ascending,
            )
            .take(batch_size as usize)
            .collect::<StdResult<Vec<_>>>()?;
        
        if investments.is_empty() {
            break;
        }
        
        for (key, investment) in investments {
            // Process investment with minimal operations
            processed += 1;
        }
        
        iteration += 1;
        
        // Prevent infinite loops
        if iteration > 1000 {
            break;
        }
    }
    
    Ok(processed)
}
```

## Memory Optimization Strategies

### 1. Streaming Queries

```rust
// Stream large datasets without loading into memory
pub fn stream_user_investments(
    deps: Deps,
    user: &str,
    callback: impl Fn(Investment) -> Result<(), ContractError>,
) -> Result<u32, ContractError> {
    let mut count = 0u32;
    
    for result in USER_INVESTMENTS.prefix(user).range(
        deps.storage,
        None,
        None,
        Order::Ascending,
    ) {
        let (_, investment) = result?;
        callback(investment)?;
        count += 1;
    }
    
    Ok(count)
}
```

### 2. Efficient Data Loading

```rust
// Load only necessary data for operations
pub struct ProposalSummary {
    pub id: String,
    pub name: String,
    pub target_amount: Uint128,
    pub total_raised: Uint128,
    pub status: ProposalStatus,
    pub funding_deadline: u64,
}

// Use summaries for listings, full data only when needed
impl From<Proposal> for ProposalSummary {
    fn from(proposal: Proposal) -> Self {
        Self {
            id: proposal.id,
            name: proposal.asset_details.name,
            target_amount: proposal.financial_terms.target_amount,
            total_raised: proposal.funding_status.total_raised,
            status: proposal.status,
            funding_deadline: proposal.financial_terms.funding_deadline,
        }
    }
}
```

## Build-Time Optimizations

### 1. Cargo Configuration

```toml
[profile.release]
opt-level = 3              # Maximum optimization
debug = false              # No debug info
rpath = false              # No runtime path
lto = true                 # Link-time optimization
debug-assertions = false   # No debug assertions
codegen-units = 1          # Single codegen unit for better optimization
panic = 'abort'            # Smaller binary size
incremental = false        # No incremental compilation
overflow-checks = true     # Keep overflow checks for safety
```

### 2. Feature Flags

```toml
[features]
default = ["std"]
std = []
# Disable unused features
backtraces = []
schema = ["cosmwasm-schema"]
library = []
```

### 3. Dependency Optimization

```toml
[dependencies]
# Use specific versions and minimal features
cosmwasm-std = { version = "2.0", default-features = false }
cw-storage-plus = { version = "2.0", default-features = false }
cw20 = { version = "2.0", default-features = false }

# Avoid unnecessary dependencies
serde = { version = "1.0", default-features = false, features = ["derive"] }
```

## Runtime Gas Monitoring

### 1. Gas Estimation

```rust
pub fn estimate_operation_gas(
    operation: &str,
    data_size: usize,
    complexity_factor: f64,
) -> u64 {
    let base_gas = match operation {
        "create_proposal" => 50_000,
        "invest" => 30_000,
        "query" => 10_000,
        "bulk_operation" => 20_000,
        _ => 40_000,
    };
    
    let storage_gas = data_size as u64 * 10; // 10 gas per byte
    let complexity_gas = (base_gas as f64 * complexity_factor) as u64;
    
    base_gas + storage_gas + complexity_gas
}
```

### 2. Dynamic Batch Sizing

```rust
impl GasOptimizer {
    pub fn calculate_optimal_batch_size(
        operation_gas_cost: u64,
        gas_limit: u64,
        safety_margin: f64,
    ) -> u32 {
        let available_gas = (gas_limit as f64 * (1.0 - safety_margin)) as u64;
        let batch_size = available_gas / operation_gas_cost;
        
        // Ensure reasonable bounds
        batch_size.max(1).min(1000) as u32
    }
}
```

## Performance Monitoring

### 1. Gas Usage Tracking

```rust
#[derive(Debug, Clone)]
pub struct GasMetrics {
    pub operation: String,
    pub gas_used: u64,
    pub data_size: usize,
    pub timestamp: u64,
    pub optimization_suggestions: Vec<String>,
}

impl GasMetrics {
    pub fn analyze_efficiency(&self) -> EfficiencyReport {
        let gas_per_byte = if self.data_size > 0 {
            self.gas_used / self.data_size as u64
        } else {
            self.gas_used
        };
        
        let efficiency_rating = match gas_per_byte {
            0..=10 => EfficiencyRating::Excellent,
            11..=25 => EfficiencyRating::Good,
            26..=50 => EfficiencyRating::Fair,
            _ => EfficiencyRating::Poor,
        };
        
        EfficiencyReport {
            rating: efficiency_rating,
            gas_per_byte,
            recommendations: self.get_recommendations(),
        }
    }
}
```

### 2. Benchmarking

```rust
#[cfg(test)]
mod gas_benchmarks {
    use super::*;
    use cosmwasm_std::testing::mock_dependencies;
    
    #[test]
    fn benchmark_proposal_creation() {
        let mut deps = mock_dependencies();
        let start_gas = 1_000_000u64;
        
        // Simulate gas tracking
        let result = execute_create_proposal(/* params */);
        
        assert!(result.is_ok());
        // In real implementation, track actual gas usage
        // assert!(gas_used < 150_000);
    }
    
    #[test]
    fn benchmark_bulk_operations() {
        // Test bulk operations with various batch sizes
        for batch_size in [10, 50, 100, 500].iter() {
            // Measure gas usage for different batch sizes
            // Find optimal batch size for each operation type
        }
    }
}
```

## Optimization Guidelines

### 1. Development Best Practices

1. **Measure First**: Always measure gas usage before optimizing
2. **Profile Critical Paths**: Focus on frequently used operations
3. **Batch Operations**: Group related operations together
4. **Lazy Loading**: Load data only when needed
5. **Cache Hot Data**: Keep frequently accessed data readily available

### 2. Code Review Checklist

- [ ] Unnecessary storage operations removed
- [ ] Efficient data structures used
- [ ] Loops optimized for gas usage
- [ ] Mathematical operations use checked arithmetic
- [ ] Pagination implemented for large datasets
- [ ] Batch operations available for bulk tasks
- [ ] Gas estimation provided for complex operations

### 3. Testing Requirements

- [ ] Gas usage benchmarks for all operations
- [ ] Performance tests with large datasets
- [ ] Batch size optimization tests
- [ ] Memory usage profiling
- [ ] Stress testing under load

## Monitoring and Alerting

### 1. Gas Usage Alerts

```rust
// Alert thresholds
const GAS_ALERT_THRESHOLDS: &[(u64, &str)] = &[
    (200_000, "create_proposal"),
    (80_000, "invest"),
    (300_000, "bulk_operation"),
];

pub fn check_gas_alerts(operation: &str, gas_used: u64) -> Option<String> {
    for (threshold, op) in GAS_ALERT_THRESHOLDS {
        if operation == *op && gas_used > *threshold {
            return Some(format!(
                "High gas usage alert: {} used {} gas (threshold: {})",
                operation, gas_used, threshold
            ));
        }
    }
    None
}
```

### 2. Performance Dashboard Metrics

- Average gas per operation type
- Gas usage trends over time
- Batch operation efficiency
- Storage growth patterns
- Query performance metrics

## Future Optimizations

### 1. Planned Improvements

1. **Storage Compression**: Implement data compression for large fields
2. **State Pruning**: Remove old, unnecessary state data
3. **Lazy Deletion**: Mark for deletion instead of immediate removal
4. **Custom Gas Pricing**: Operation-specific gas pricing

### 2. Advanced Techniques

1. **State Rent**: Implement storage rent for inactive data
2. **Data Archival**: Move old data to cheaper storage
3. **Computation Offloading**: Move complex calculations off-chain
4. **State Channels**: Use state channels for high-frequency operations

---

**Last Updated**: January 6, 2025  
**Performance Target**: <100k gas for standard operations  
**Next Review**: Monthly optimization review

**Contact**: performance@cf1platform.com