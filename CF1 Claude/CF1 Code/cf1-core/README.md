# CF1 Launchpad Smart Contract

Enterprise-grade blockchain platform for Real-World Asset (RWA) tokenization with launchpad, governance, marketplace, and compliance modules.

## Overview

CF1 is a comprehensive platform for tokenizing real-world assets with full regulatory compliance (SEC Regulation CF). The launchpad smart contract handles proposal creation, investment processing, token minting, and distribution with built-in 12-month lockup periods.

## Features

### Core Functionality
- ✅ **Proposal Management** - Create, update, and manage tokenization proposals
- ✅ **Investment Processing** - Native coin escrow with automatic refunds
- ✅ **Token Lifecycle** - CW20 token minting and distribution
- ✅ **12-Month Lockup** - Regulatory compliance with automatic enforcement
- ✅ **Compliance Reporting** - SEC Regulation CF compliance tracking
- ✅ **Governance Integration** - Asset-level governance preparation

### Business Rules
- **Funding Period**: 7-120 days (configurable)
- **Token Standard**: CW20 (not NFTs)
- **Lockup Period**: 12 months mandatory after funding
- **Platform Fee**: 2.5% (configurable)
- **Escrow System**: Full refunds if funding fails
- **No Token Minting**: Until funding goal is reached

## Quick Start

### Prerequisites
- Rust 1.70+
- `wasm32-unknown-unknown` target
- Neutron testnet access
- Neutrond binary

### Build

```bash
# Clone repository
git clone https://github.com/bthh/CF1-Claude
cd CF1-Claude/CF1\ Code/cf1-core

# Build optimized WASM
./scripts/build.sh

# Run tests
./scripts/test.sh
```

### Deploy

```bash
# Set up wallet (replace with your wallet name)
export WALLET_NAME=my-wallet

# Deploy to Neutron testnet
./scripts/deploy.sh

# Test deployment
./scripts/test-deployment.sh
```

## Contract Architecture

### State Structure
```rust
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
```

### Key Operations

#### Create Proposal
```rust
ExecuteMsg::CreateProposal {
    asset_details: AssetDetails,
    financial_terms: FinancialTerms,
    documents: Vec<Document>,
    compliance: ComplianceInfo,
}
```

#### Invest
```rust
ExecuteMsg::Invest {
    proposal_id: String,
}
// Send funds with the message
```

#### Query Proposal
```rust
QueryMsg::Proposal {
    proposal_id: String,
}
```

## API Reference

### Execute Messages

| Message | Description | Permissions |
|---------|-------------|-------------|
| `CreateProposal` | Create new tokenization proposal | Anyone |
| `UpdateProposal` | Update existing proposal | Creator only |
| `CancelProposal` | Cancel active proposal | Creator/Admin |
| `Invest` | Invest in a proposal | Anyone |
| `MintTokens` | Mint CW20 tokens (post-funding) | Creator/Admin |
| `DistributeTokens` | Distribute tokens to investors | Creator/Admin |
| `RefundInvestors` | Refund failed proposal investments | Creator/Admin |

### Query Messages

| Query | Description | Returns |
|-------|-------------|---------|
| `Proposal` | Get proposal details | `ProposalResponse` |
| `AllProposals` | List all proposals | `ProposalsResponse` |
| `ProposalsByCreator` | Get creator's proposals | `ProposalsResponse` |
| `UserPortfolio` | Get user's investments | `InvestmentsResponse` |
| `PlatformStats` | Platform statistics | `PlatformStats` |
| `LockupStatus` | Token lockup information | `LockupStatus` |
| `ComplianceReport` | Regulatory compliance data | `ComplianceReport` |

## Testing

### Unit Tests
```bash
cargo test tests:: --lib
```

### Integration Tests
```bash
cargo test integration_tests:: --lib
```

### End-to-End Testing
```bash
# Deploy to testnet
./scripts/deploy.sh

# Run deployment tests
./scripts/test-deployment.sh
```

## Frontend Integration

### CosmJS Setup
```typescript
import { CF1CosmJSClient } from './services/cosmjs';

const client = new CF1CosmJSClient({
  chainId: 'pion-1',
  rpcEndpoint: 'https://rpc-palvus.pion-1.ntrn.tech',
  gasPrice: GasPrice.fromString('0.025untrn'),
  contractAddress: 'neutron1...',
});

// Connect wallet
await client.connectWallet();

// Create proposal
await client.createProposal({
  assetDetails,
  financialTerms,
  documents,
  compliance,
});

// Invest
await client.invest(proposalId, amount);
```

### React Hooks
```typescript
import { useCosmJS, useProposal } from './hooks/useCosmJS';

const { connect, invest, queryProposal } = useCosmJS();
const { proposal, loading } = useProposal(proposalId);
```

## Configuration

### Environment Variables
```bash
# Contract addresses
REACT_APP_LAUNCHPAD_CONTRACT=neutron1...
REACT_APP_CHAIN_ID=pion-1
REACT_APP_RPC_ENDPOINT=https://rpc-palvus.pion-1.ntrn.tech

# Feature flags
REACT_APP_ENABLE_GOVERNANCE=true
REACT_APP_ENABLE_MARKETPLACE=false
```

### Contract Config
```rust
pub struct Config {
    pub admin: Addr,
    pub platform_fee_bps: u16,        // 250 = 2.5%
    pub min_funding_period_days: u64,  // 7 days
    pub max_funding_period_days: u64,  // 120 days
    pub lockup_period_seconds: u64,    // 12 months
}
```

## Security Considerations

### Access Control
- Proposal creators can update/cancel their proposals
- Only admin can process expired proposals
- Investment validation prevents overselling
- Lockup period enforcement prevents early trading

### Fund Safety
- Native coin escrow until funding completion
- Automatic refunds for failed proposals
- Platform fee deducted from successful funding
- No token minting until goal reached

### Compliance
- SEC Regulation CF compliance tracking
- KYC/AML integration points
- Maximum investor limits
- Comprehensive audit trails

## Gas Optimization

### Efficient Storage
- Paginated queries for large datasets
- Optimized state structure
- Minimal storage operations

### Build Optimization
```toml
[profile.release]
opt-level = 3
debug = false
rpath = false
lto = true
debug-assertions = false
codegen-units = 1
panic = 'abort'
incremental = false
overflow-checks = true
```

---

**Built with ❤️ for the future of RWA tokenization**