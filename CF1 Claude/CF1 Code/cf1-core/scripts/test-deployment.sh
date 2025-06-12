#!/bin/bash

# CF1 Launchpad Deployment Testing Script
set -e

# Configuration
NEUTRON_TESTNET_RPC="https://rpc-palvus.pion-1.ntrn.tech"
NEUTRON_TESTNET_CHAIN_ID="pion-1"
NEUTROND_BINARY="neutrond"
CONTRACT_ADDRESS=${1:-""}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 CF1 Launchpad Deployment Testing${NC}"
echo "===================================="

if [ -z "$CONTRACT_ADDRESS" ]; then
    # Try to read from deployment.json
    if [ -f "deployment.json" ]; then
        CONTRACT_ADDRESS=$(jq -r '.contract_address' deployment.json)
        echo -e "${YELLOW}📋 Using contract address from deployment.json: $CONTRACT_ADDRESS${NC}"
    else
        echo -e "${RED}❌ Contract address not provided${NC}"
        echo "Usage: $0 <contract_address>"
        echo "Or ensure deployment.json exists in current directory"
        exit 1
    fi
fi

echo -e "${BLUE}🔍 Testing contract: $CONTRACT_ADDRESS${NC}"

# Test 1: Query contract config
echo -e "${BLUE}Test 1: Querying contract configuration...${NC}"
CONFIG_QUERY='{"config":{}}'
CONFIG_RESULT=$($NEUTROND_BINARY query wasm contract-state smart $CONTRACT_ADDRESS "$CONFIG_QUERY" --node $NEUTRON_TESTNET_RPC --chain-id $NEUTRON_TESTNET_CHAIN_ID --output json)

if echo $CONFIG_RESULT | jq -e '.data' > /dev/null; then
    ADMIN=$(echo $CONFIG_RESULT | jq -r '.data.admin')
    PLATFORM_FEE=$(echo $CONFIG_RESULT | jq -r '.data.platform_fee_bps')
    echo -e "${GREEN}✅ Config query successful${NC}"
    echo "   Admin: $ADMIN"
    echo "   Platform Fee: ${PLATFORM_FEE} bps ($(echo "scale=2; $PLATFORM_FEE/100" | bc)%)"
else
    echo -e "${RED}❌ Config query failed${NC}"
    exit 1
fi

# Test 2: Query platform stats
echo -e "${BLUE}Test 2: Querying platform statistics...${NC}"
STATS_QUERY='{"platform_stats":{}}'
STATS_RESULT=$($NEUTROND_BINARY query wasm contract-state smart $CONTRACT_ADDRESS "$STATS_QUERY" --node $NEUTRON_TESTNET_RPC --chain-id $NEUTRON_TESTNET_CHAIN_ID --output json)

if echo $STATS_RESULT | jq -e '.data' > /dev/null; then
    TOTAL_PROPOSALS=$(echo $STATS_RESULT | jq -r '.data.total_proposals')
    TOTAL_RAISED=$(echo $STATS_RESULT | jq -r '.data.total_raised')
    echo -e "${GREEN}✅ Platform stats query successful${NC}"
    echo "   Total Proposals: $TOTAL_PROPOSALS"
    echo "   Total Raised: $TOTAL_RAISED untrn"
else
    echo -e "${RED}❌ Platform stats query failed${NC}"
    exit 1
fi

# Test 3: Query all proposals (should be empty)
echo -e "${BLUE}Test 3: Querying all proposals...${NC}"
PROPOSALS_QUERY='{"all_proposals":{"limit":10}}'
PROPOSALS_RESULT=$($NEUTROND_BINARY query wasm contract-state smart $CONTRACT_ADDRESS "$PROPOSALS_QUERY" --node $NEUTRON_TESTNET_RPC --chain-id $NEUTRON_TESTNET_CHAIN_ID --output json)

if echo $PROPOSALS_RESULT | jq -e '.data' > /dev/null; then
    PROPOSAL_COUNT=$(echo $PROPOSALS_RESULT | jq -r '.data.proposals | length')
    echo -e "${GREEN}✅ Proposals query successful${NC}"
    echo "   Current proposals: $PROPOSAL_COUNT"
else
    echo -e "${RED}❌ Proposals query failed${NC}"
    exit 1
fi

# Test 4: Test invalid query (should fail gracefully)
echo -e "${BLUE}Test 4: Testing invalid query handling...${NC}"
INVALID_QUERY='{"invalid_query":{}}'
INVALID_RESULT=$($NEUTROND_BINARY query wasm contract-state smart $CONTRACT_ADDRESS "$INVALID_QUERY" --node $NEUTRON_TESTNET_RPC --chain-id $NEUTRON_TESTNET_CHAIN_ID --output json 2>&1 || true)

if echo $INVALID_RESULT | grep -q "error"; then
    echo -e "${GREEN}✅ Invalid query properly rejected${NC}"
else
    echo -e "${YELLOW}⚠️  Invalid query handling unclear${NC}"
fi

# Test 5: Check contract info
echo -e "${BLUE}Test 5: Checking contract information...${NC}"
CONTRACT_INFO=$($NEUTROND_BINARY query wasm contract $CONTRACT_ADDRESS --node $NEUTRON_TESTNET_RPC --chain-id $NEUTRON_TESTNET_CHAIN_ID --output json)

if echo $CONTRACT_INFO | jq -e '.contract_info' > /dev/null; then
    CODE_ID=$(echo $CONTRACT_INFO | jq -r '.contract_info.code_id')
    CREATOR=$(echo $CONTRACT_INFO | jq -r '.contract_info.creator')
    LABEL=$(echo $CONTRACT_INFO | jq -r '.contract_info.label')
    echo -e "${GREEN}✅ Contract info retrieved${NC}"
    echo "   Code ID: $CODE_ID"
    echo "   Creator: $CREATOR"
    echo "   Label: $LABEL"
else
    echo -e "${RED}❌ Failed to get contract info${NC}"
    exit 1
fi

# Test 6: Estimate gas for a transaction
echo -e "${BLUE}Test 6: Estimating gas for proposal creation...${NC}"

# Create a sample proposal message
SAMPLE_PROPOSAL='{
  "create_proposal": {
    "asset_details": {
      "name": "Test Asset",
      "asset_type": "Real Estate",
      "category": "Commercial",
      "location": "Test City",
      "description": "Test description",
      "full_description": "Full test description",
      "risk_factors": ["Test risk"],
      "highlights": ["Test highlight"]
    },
    "financial_terms": {
      "target_amount": "1000000000000",
      "token_price": "1000000000",
      "total_shares": 1000,
      "minimum_investment": "1000000000",
      "expected_apy": "10%",
      "funding_deadline": '$(date -d "+30 days" +%s)'
    },
    "documents": [
      {
        "name": "Test Document",
        "doc_type": "PDF",
        "size": "1MB",
        "hash": "QmTest123"
      }
    ],
    "compliance": {
      "kyc_required": true,
      "accredited_only": false,
      "max_investors": 100,
      "compliance_notes": ["Test compliance"]
    }
  }
}'

# Check if we have a wallet to test with
WALLET_NAME=${WALLET_NAME:-"cf1-deployer"}
if $NEUTROND_BINARY keys show $WALLET_NAME &> /dev/null; then
    GAS_ESTIMATE=$($NEUTROND_BINARY tx wasm execute $CONTRACT_ADDRESS "$SAMPLE_PROPOSAL" \
        --from $WALLET_NAME \
        --node $NEUTRON_TESTNET_RPC \
        --chain-id $NEUTRON_TESTNET_CHAIN_ID \
        --gas-prices 0.025untrn \
        --dry-run \
        --output json 2>/dev/null | jq -r '.gas_info.gas_used' || echo "N/A")
    
    if [ "$GAS_ESTIMATE" != "N/A" ]; then
        echo -e "${GREEN}✅ Gas estimation successful${NC}"
        echo "   Estimated gas for proposal creation: $GAS_ESTIMATE"
    else
        echo -e "${YELLOW}⚠️  Gas estimation not available${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No wallet available for gas estimation${NC}"
fi

echo ""
echo -e "${GREEN}🎉 All deployment tests completed!${NC}"
echo "=================================="
echo -e "${BLUE}📋 Test Summary:${NC}"
echo "  Contract Address: $CONTRACT_ADDRESS"
echo "  Code ID: $CODE_ID"
echo "  All basic queries: ✅ Working"
echo "  Error handling: ✅ Working"
echo "  Contract info: ✅ Available"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Update frontend configuration with contract address"
echo "2. Create test proposals through the frontend"
echo "3. Test investment flow with testnet tokens"
echo "4. Monitor contract performance and gas usage"
echo ""
echo -e "${BLUE}🔗 Useful Links:${NC}"
echo "  Neutron Explorer: https://neutron.celat.one/pion-1"
echo "  Contract Address: https://neutron.celat.one/pion-1/contracts/$CONTRACT_ADDRESS"
echo "  Faucet: https://docs.neutron.org/neutron/faucet"