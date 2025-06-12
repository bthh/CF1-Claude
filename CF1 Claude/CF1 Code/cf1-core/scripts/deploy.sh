#!/bin/bash

# CF1 Launchpad Deployment Script for Neutron Testnet
set -e

# Configuration
NEUTRON_TESTNET_RPC="https://rpc-palvus.pion-1.ntrn.tech"
NEUTRON_TESTNET_CHAIN_ID="pion-1"
NEUTROND_BINARY="neutrond"
WASM_FILE="artifacts/cf1_core.wasm"
GAS_PRICE="0.025untrn"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 CF1 Launchpad Deployment Script${NC}"
echo "=================================="

# Check if neutrond is installed
if ! command -v $NEUTROND_BINARY &> /dev/null; then
    echo -e "${RED}❌ $NEUTROND_BINARY not found. Please install Neutron binary.${NC}"
    echo "Installation guide: https://docs.neutron.org/neutron/build-and-run/install"
    exit 1
fi

# Check if WASM file exists
if [ ! -f "$WASM_FILE" ]; then
    echo -e "${YELLOW}⚠️  WASM file not found. Building contract...${NC}"
    ./scripts/build.sh
    
    if [ ! -f "$WASM_FILE" ]; then
        echo -e "${RED}❌ Failed to build WASM file${NC}"
        exit 1
    fi
fi

# Check WASM file size
WASM_SIZE=$(wc -c < "$WASM_FILE")
WASM_SIZE_KB=$((WASM_SIZE / 1024))

echo -e "${BLUE}📦 WASM file size: ${WASM_SIZE_KB}KB${NC}"

if [ $WASM_SIZE_KB -gt 800 ]; then
    echo -e "${YELLOW}⚠️  WASM file is large (${WASM_SIZE_KB}KB). Consider optimizing.${NC}"
fi

# Check if wallet is configured
echo -e "${BLUE}🔐 Checking wallet configuration...${NC}"

WALLET_NAME=${WALLET_NAME:-"cf1-deployer"}
if ! $NEUTROND_BINARY keys show $WALLET_NAME &> /dev/null; then
    echo -e "${RED}❌ Wallet '$WALLET_NAME' not found.${NC}"
    echo "Please create a wallet first:"
    echo "  $NEUTROND_BINARY keys add $WALLET_NAME"
    echo "Or set WALLET_NAME environment variable to use existing wallet."
    exit 1
fi

DEPLOYER_ADDRESS=$($NEUTROND_BINARY keys show $WALLET_NAME -a)
echo -e "${GREEN}✅ Using deployer address: $DEPLOYER_ADDRESS${NC}"

# Check balance
echo -e "${BLUE}💰 Checking balance...${NC}"
BALANCE=$($NEUTROND_BINARY query bank balances $DEPLOYER_ADDRESS --node $NEUTRON_TESTNET_RPC --chain-id $NEUTRON_TESTNET_CHAIN_ID --output json | jq -r '.balances[] | select(.denom=="untrn") | .amount')

if [ -z "$BALANCE" ] || [ "$BALANCE" = "null" ]; then
    BALANCE="0"
fi

BALANCE_NTRN=$((BALANCE / 1000000))
echo -e "${GREEN}💰 Balance: ${BALANCE_NTRN} NTRN${NC}"

if [ $BALANCE_NTRN -lt 10 ]; then
    echo -e "${RED}❌ Insufficient balance. Need at least 10 NTRN for deployment.${NC}"
    echo "Get testnet tokens from: https://docs.neutron.org/neutron/faucet"
    exit 1
fi

# Store the contract
echo -e "${BLUE}📤 Storing contract on Neutron testnet...${NC}"

STORE_TX=$($NEUTROND_BINARY tx wasm store $WASM_FILE \
    --from $WALLET_NAME \
    --node $NEUTRON_TESTNET_RPC \
    --chain-id $NEUTRON_TESTNET_CHAIN_ID \
    --gas-prices $GAS_PRICE \
    --gas auto \
    --gas-adjustment 1.3 \
    --broadcast-mode sync \
    --yes \
    --output json)

STORE_TX_HASH=$(echo $STORE_TX | jq -r '.txhash')
echo -e "${YELLOW}📋 Store transaction hash: $STORE_TX_HASH${NC}"

# Wait for transaction to be processed
echo -e "${BLUE}⏳ Waiting for transaction to be processed...${NC}"
sleep 10

# Get code ID
CODE_ID=$($NEUTROND_BINARY query tx $STORE_TX_HASH --node $NEUTRON_TESTNET_RPC --chain-id $NEUTRON_TESTNET_CHAIN_ID --output json | jq -r '.events[] | select(.type=="store_code") | .attributes[] | select(.key=="code_id") | .value')

if [ -z "$CODE_ID" ] || [ "$CODE_ID" = "null" ]; then
    echo -e "${RED}❌ Failed to get code ID from transaction${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Contract stored with code ID: $CODE_ID${NC}"

# Deploy CW20 base contract first (if not already deployed)
echo -e "${BLUE}📤 Deploying CW20 base contract...${NC}"
echo -e "${YELLOW}Note: In production, use an already deployed CW20 contract code ID${NC}"

# For testnet, we'll use a placeholder CW20 code ID
# In production, this should be the actual CW20 base contract code ID on Neutron
CW20_CODE_ID=${CW20_CODE_ID:-1}  # Override with environment variable if available

echo -e "${GREEN}Using CW20 code ID: $CW20_CODE_ID${NC}"

# Prepare instantiate message
INSTANTIATE_MSG="{
  \"admin\": null,
  \"platform_fee_bps\": 250,
  \"cw20_code_id\": $CW20_CODE_ID
}"

echo -e "${BLUE}🔧 Instantiating contract...${NC}"

# Instantiate the contract
INSTANTIATE_TX=$($NEUTROND_BINARY tx wasm instantiate $CODE_ID "$INSTANTIATE_MSG" \
    --from $WALLET_NAME \
    --label "CF1-Launchpad-v1" \
    --node $NEUTRON_TESTNET_RPC \
    --chain-id $NEUTRON_TESTNET_CHAIN_ID \
    --gas-prices $GAS_PRICE \
    --gas auto \
    --gas-adjustment 1.3 \
    --broadcast-mode sync \
    --yes \
    --output json)

INSTANTIATE_TX_HASH=$(echo $INSTANTIATE_TX | jq -r '.txhash')
echo -e "${YELLOW}📋 Instantiate transaction hash: $INSTANTIATE_TX_HASH${NC}"

# Wait for transaction to be processed
echo -e "${BLUE}⏳ Waiting for instantiation to complete...${NC}"
sleep 10

# Get contract address
CONTRACT_ADDRESS=$($NEUTROND_BINARY query tx $INSTANTIATE_TX_HASH --node $NEUTRON_TESTNET_RPC --chain-id $NEUTRON_TESTNET_CHAIN_ID --output json | jq -r '.events[] | select(.type=="instantiate") | .attributes[] | select(.key=="_contract_address") | .value')

if [ -z "$CONTRACT_ADDRESS" ] || [ "$CONTRACT_ADDRESS" = "null" ]; then
    echo -e "${RED}❌ Failed to get contract address from transaction${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Contract instantiated at address: $CONTRACT_ADDRESS${NC}"

# Verify deployment
echo -e "${BLUE}🔍 Verifying deployment...${NC}"

CONFIG_QUERY='{"config":{}}'
CONFIG_RESULT=$($NEUTROND_BINARY query wasm contract-state smart $CONTRACT_ADDRESS "$CONFIG_QUERY" --node $NEUTRON_TESTNET_RPC --chain-id $NEUTRON_TESTNET_CHAIN_ID --output json)

if echo $CONFIG_RESULT | jq -e '.data' > /dev/null; then
    echo -e "${GREEN}✅ Contract verification successful${NC}"
else
    echo -e "${RED}❌ Contract verification failed${NC}"
    exit 1
fi

# Save deployment info
DEPLOYMENT_INFO="{
  \"chain_id\": \"$NEUTRON_TESTNET_CHAIN_ID\",
  \"rpc_endpoint\": \"$NEUTRON_TESTNET_RPC\",
  \"code_id\": $CODE_ID,
  \"contract_address\": \"$CONTRACT_ADDRESS\",
  \"deployer_address\": \"$DEPLOYER_ADDRESS\",
  \"deployment_date\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
  \"store_tx_hash\": \"$STORE_TX_HASH\",
  \"instantiate_tx_hash\": \"$INSTANTIATE_TX_HASH\",
  \"wasm_file\": \"$WASM_FILE\",
  \"wasm_size_kb\": $WASM_SIZE_KB
}"

echo "$DEPLOYMENT_INFO" > deployment.json

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo "=================================="
echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo "  Chain ID: $NEUTRON_TESTNET_CHAIN_ID"
echo "  Code ID: $CODE_ID"
echo "  Contract Address: $CONTRACT_ADDRESS"
echo "  Deployer: $DEPLOYER_ADDRESS"
echo "  WASM Size: ${WASM_SIZE_KB}KB"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Update frontend .env file with contract address:"
echo "   REACT_APP_LAUNCHPAD_CONTRACT=$CONTRACT_ADDRESS"
echo ""
echo "2. Test the deployment:"
echo "   ./scripts/test-deployment.sh $CONTRACT_ADDRESS"
echo ""
echo "3. Deploy governance and marketplace contracts (if needed)"
echo ""
echo -e "${BLUE}💾 Deployment info saved to deployment.json${NC}"

# Create environment file for frontend
cat > .env.deployment << EOF
# CF1 Deployment Configuration
REACT_APP_LAUNCHPAD_CONTRACT=$CONTRACT_ADDRESS
REACT_APP_CHAIN_ID=$NEUTRON_TESTNET_CHAIN_ID
REACT_APP_RPC_ENDPOINT=$NEUTRON_TESTNET_RPC
REACT_APP_CODE_ID=$CODE_ID
EOF

echo -e "${GREEN}📄 Frontend environment file created: .env.deployment${NC}"
echo -e "${YELLOW}   Copy this to cf1-frontend/.env${NC}"