// CF1 Frontend - Testnet Configuration
// This file contains testnet-specific configurations and utilities

import type { ChainInfo } from "@keplr-wallet/types";

// Neutron testnet chain configuration for Keplr
export const NEUTRON_TESTNET_CHAIN_INFO: ChainInfo = {
  chainId: "pion-1",
  chainName: "Neutron Testnet",
  rpc: "https://rpc-falcron.pion-1.ntrn.tech",
  rest: "https://rest-falcron.pion-1.ntrn.tech",
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: "neutron",
    bech32PrefixAccPub: "neutronpub",
    bech32PrefixValAddr: "neutronvaloper",
    bech32PrefixValPub: "neutronvaloperpub",
    bech32PrefixConsAddr: "neutronvalcons",
    bech32PrefixConsPub: "neutronvalconspub",
  },
  currencies: [
    {
      coinDenom: "NTRN",
      coinMinimalDenom: "untrn",
      coinDecimals: 6,
      coinGeckoId: "neutron-3",
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "NTRN",
      coinMinimalDenom: "untrn",
      coinDecimals: 6,
      gasPriceStep: {
        low: 0.005,
        average: 0.0053,
        high: 0.01,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: "NTRN",
    coinMinimalDenom: "untrn",
    coinDecimals: 6,
  },
  coinType: 118,
  features: ["cosmwasm", "ibc-transfer", "ibc-go"],
};

// Alternative RPC endpoints for failover
export const NEUTRON_TESTNET_RPC_ENDPOINTS = [
  "https://rpc-falcron.pion-1.ntrn.tech",
  "https://neutron-testnet-rpc.polkachu.com",
  "https://neutron-testnet-rpc.ibs.team",
];

// Alternative REST endpoints for failover
export const NEUTRON_TESTNET_REST_ENDPOINTS = [
  "https://rest-falcron.pion-1.ntrn.tech",
  "https://neutron-testnet-api.polkachu.com",
  "https://neutron-testnet-api.ibs.team",
];

// Testnet configuration
export const TESTNET_CONFIG = {
  network: "testnet" as const,
  chainId: "pion-1",
  chainName: "Neutron Testnet",
  isTestnet: true,

  // RPC configuration
  rpc: {
    primary: NEUTRON_TESTNET_RPC_ENDPOINTS[0],
    fallbacks: NEUTRON_TESTNET_RPC_ENDPOINTS.slice(1),
  },

  // REST configuration
  rest: {
    primary: NEUTRON_TESTNET_REST_ENDPOINTS[0],
    fallbacks: NEUTRON_TESTNET_REST_ENDPOINTS.slice(1),
  },

  // Gas configuration
  gas: {
    price: "0.0053untrn",
    adjustment: 1.3,
    denom: "untrn",
  },

  // Token configuration
  nativeToken: {
    denom: "untrn",
    decimals: 6,
    symbol: "NTRN",
    name: "Neutron",
  },

  // Explorer configuration
  explorer: {
    name: "Celatone",
    url: "https://neutron.celat.one/pion-1",
    txUrl: "https://neutron.celat.one/pion-1/txs",
    addressUrl: "https://neutron.celat.one/pion-1/accounts",
  },

  // Faucet information
  faucet: {
    name: "Neutron Discord Faucet",
    url: "https://discord.gg/neutronorg",
    instructions: "Join #testnet-faucet channel and use !faucet <address>",
    channel: "#testnet-faucet",
  },

  // Contract deployment configuration
  contracts: {
    // Will be populated after deployment
    launchpad: import.meta.env.VITE_LAUNCHPAD_CONTRACT_ADDRESS || "",
    cw20CodeId: import.meta.env.VITE_CW20_CODE_ID || "",
  },

  // Feature flags for testnet
  features: {
    trading: true,
    staking: true,
    lending: true,
    amm: true,
    governance: true,
    aiAssistant: false, // Disabled for testnet to save API costs
    analytics: false,   // Disabled for testnet
  },

  // Development settings
  development: {
    enableMockData: import.meta.env.VITE_ENABLE_MOCK_DATA === "true",
    enableDevTools: import.meta.env.VITE_ENABLE_DEV_TOOLS === "true",
    logLevel: (import.meta.env.VITE_LOG_LEVEL as "debug" | "info" | "warn" | "error") || "debug",
    enableQueryDevtools: import.meta.env.VITE_ENABLE_QUERY_DEVTOOLS === "true",
  },
};

// Wallet configuration for testnet
export const TESTNET_WALLET_CONFIG = {
  autoConnect: false, // Don't auto-connect on testnet
  supportedWallets: ["keplr", "leap", "cosmostation"],
  chainInfo: NEUTRON_TESTNET_CHAIN_INFO,
};

// Network health check endpoints
export const TESTNET_HEALTH_ENDPOINTS = {
  rpc: NEUTRON_TESTNET_RPC_ENDPOINTS.map(endpoint => ({
    url: endpoint,
    healthPath: "/health",
  })),
  rest: NEUTRON_TESTNET_REST_ENDPOINTS.map(endpoint => ({
    url: endpoint,
    healthPath: "/node_info",
  })),
};

// Utility functions for testnet
export const testnetUtils = {
  // Check if we're running on testnet
  isTestnet: () => import.meta.env.VITE_NETWORK === "testnet" || import.meta.env.VITE_ENABLE_TESTNET === "true",

  // Get contract address with fallback
  getContractAddress: (contractName: keyof typeof TESTNET_CONFIG.contracts) => {
    const address = TESTNET_CONFIG.contracts[contractName];
    if (!address) {
      console.warn(`Contract address for ${contractName} not configured for testnet`);
    }
    return address;
  },

  // Format amounts for testnet display
  formatAmount: (amount: string | number, decimals: number = 6): string => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return "0";

    const formatted = (numAmount / Math.pow(10, decimals)).toFixed(6);
    return parseFloat(formatted).toString(); // Remove trailing zeros
  },

  // Parse amounts for testnet transactions
  parseAmount: (amount: string, decimals: number = 6): string => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return "0";

    return Math.floor(numAmount * Math.pow(10, decimals)).toString();
  },

  // Get faucet instructions
  getFaucetInstructions: (address: string) => ({
    ...TESTNET_CONFIG.faucet,
    command: `!faucet ${address}`,
    fullInstructions: [
      "1. Join the Neutron Discord server",
      "2. Navigate to the #testnet-faucet channel",
      `3. Send the command: !faucet ${address}`,
      "4. Wait for the bot to process your request",
      "5. Check your wallet balance after a few minutes",
    ],
  }),

  // Check if contracts are deployed
  areContractsDeployed: () => {
    return Object.values(TESTNET_CONFIG.contracts).some(address => address && address.length > 0);
  },

  // Get deployment status
  getDeploymentStatus: () => {
    const contracts = TESTNET_CONFIG.contracts;
    return {
      launchpad: !!contracts.launchpad,
      cw20CodeId: !!contracts.cw20CodeId,
      allDeployed: !!contracts.launchpad && !!contracts.cw20CodeId,
    };
  },
};

// Export default testnet configuration
export default TESTNET_CONFIG;