# Token Minting Reply Handler Update

## Overview
This update completes the token minting reply handler implementation and removes the hardcoded CW20 code ID, making the contract production-ready for token instantiation.

## Changes Made

### 1. State Management Updates (`state.rs`)
- Added `cw20_code_id` field to the `Config` struct to store the CW20 contract code ID
- Added `PENDING_TOKEN_REPLY` storage item to track proposal IDs during token instantiation

### 2. Message Updates (`msg.rs`)
- Updated `InstantiateMsg` to require `cw20_code_id` parameter
- Updated `UpdateConfig` execute message to allow updating the CW20 code ID

### 3. Contract Logic Updates (`lib.rs`)
- **Instantiate Function**: Now stores the provided CW20 code ID in config
- **Execute Mint Tokens**: 
  - Retrieves CW20 code ID from config instead of using hardcoded value
  - Stores proposal ID in `PENDING_TOKEN_REPLY` before submessage execution
- **Reply Handler**: 
  - Added `env` parameter to access block time
  - Retrieves proposal ID from `PENDING_TOKEN_REPLY` storage
  - Stores token contract address in `TOKEN_CONTRACTS` map
  - Sets lockup end timestamp (12 months from minting)
  - Cleans up temporary storage after successful processing
- **Update Config**: Added support for updating CW20 code ID

### 4. Test Updates
- Updated all test instantiation calls to include `cw20_code_id` parameter
- Tests now properly simulate CW20 contract deployment

### 5. Deployment Script Updates
- Modified `deploy.sh` to accept CW20_CODE_ID environment variable
- Added instructions for deploying with proper CW20 code ID
- Updated instantiate message to include the CW20 code ID

## Usage

### Deploying the Contract
```bash
# Deploy with specific CW20 code ID
CW20_CODE_ID=123 ./scripts/deploy.sh

# Or set a default in your environment
export CW20_CODE_ID=123
./scripts/deploy.sh
```

### Updating CW20 Code ID
The admin can update the CW20 code ID after deployment:
```json
{
  "update_config": {
    "cw20_code_id": 456
  }
}
```

## Token Minting Flow

1. **Proposal Funded**: When a proposal reaches its funding goal
2. **Mint Tokens Called**: Admin/creator calls `mint_tokens` with proposal ID
3. **Pre-Reply Setup**: Contract stores proposal ID in `PENDING_TOKEN_REPLY`
4. **CW20 Instantiation**: Submessage sent to instantiate CW20 token
5. **Reply Handler**: 
   - Retrieves token address from reply
   - Associates token with proposal via `TOKEN_CONTRACTS` map
   - Sets 12-month lockup period
   - Cleans up temporary storage
6. **Distribution Ready**: Tokens can now be distributed to investors

## Security Considerations

- Only admin can update the CW20 code ID
- Proposal ID is stored atomically before token creation to prevent race conditions
- Reply handler validates all data and cleans up temporary storage
- Token contract address is permanently associated with proposal

## Migration Notes

For existing deployments:
1. Deploy a CW20 base contract and note its code ID
2. Update the launchpad contract config with the CW20 code ID
3. All new token minting will use the configured code ID

## Future Improvements

- Add support for custom token parameters per proposal
- Implement token metadata standards
- Add migration path for existing proposals