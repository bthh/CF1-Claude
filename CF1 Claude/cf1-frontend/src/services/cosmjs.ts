import { SigningCosmWasmClient, CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { GasPrice } from "@cosmjs/stargate";
import type { Keplr } from "@keplr-wallet/types";

// Neutron testnet configuration
const NEUTRON_TESTNET_CONFIG = {
  chainId: import.meta.env.VITE_CHAIN_ID || "pion-1",
  chainName: import.meta.env.VITE_CHAIN_NAME || "Neutron Testnet",
  rpc: import.meta.env.VITE_RPC_URL || "https://rpc-falcron.pion-1.ntrn.tech",
  rest: import.meta.env.VITE_REST_URL || "https://rest-falcron.pion-1.ntrn.tech",
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
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "NTRN",
      coinMinimalDenom: "untrn",
      coinDecimals: 6,
      gasPriceStep: {
        low: 0.01,
        average: 0.025,
        high: 0.04,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: "NTRN",
    coinMinimalDenom: "untrn",
    coinDecimals: 6,
  },
};

// Contract addresses (to be set after deployment)
export const CF1_LAUNCHPAD_CONTRACT = import.meta.env.VITE_LAUNCHPAD_CONTRACT_ADDRESS || "";

// Gas configuration
const GAS_PRICES = GasPrice.fromString("0.025untrn");

interface CosmJSConfig {
  chainId: string;
  rpcEndpoint: string;
  gasPrice: GasPrice;
  contractAddress: string;
}

export class CF1CosmJSClient {
  private client: SigningCosmWasmClient | null = null;
  private signer: string = "";
  private demoMode: boolean = false;
  private config: CosmJSConfig;
  
  constructor(config: CosmJSConfig = {
    chainId: NEUTRON_TESTNET_CONFIG.chainId,
    rpcEndpoint: NEUTRON_TESTNET_CONFIG.rpc,
    gasPrice: GAS_PRICES,
    contractAddress: CF1_LAUNCHPAD_CONTRACT,
  }) {
    this.config = config;
    // Enable demo mode if contract address is missing or demo
    this.demoMode = !config.contractAddress || 
                   config.contractAddress.includes('demo') || 
                   import.meta.env.VITE_ENABLE_MOCK_DATA === 'true';
    
    if (this.demoMode) {
      console.warn('CosmJS running in demo mode - real blockchain interactions disabled');
    }
  }

  async connectWallet(): Promise<string> {
    // Return existing connection if already connected
    if (this.isConnected()) {
      console.log("Wallet already connected:", this.signer);
      return this.signer;
    }
    
    // Demo mode fallback
    if (this.demoMode) {
      this.signer = "neutron1demo2user3address4for5testing6purposes7890abc";
      console.log("Demo mode: Using mock wallet address:", this.signer);
      return this.signer;
    }

    if (!window.keplr) {
      throw new Error("Keplr wallet not found. Please install Keplr extension.");
    }

    try {
      // Add Neutron testnet to Keplr if not exists
      await window.keplr.experimentalSuggestChain(NEUTRON_TESTNET_CONFIG);
      
      // Enable the chain
      await window.keplr.enable(this.config.chainId);
      
      // Get offline signer
      const offlineSigner = window.keplr.getOfflineSigner(this.config.chainId);
      
      // Create client
      this.client = await SigningCosmWasmClient.connectWithSigner(
        this.config.rpcEndpoint,
        offlineSigner,
        {
          gasPrice: this.config.gasPrice,
        }
      );

      // Get user address
      const accounts = await offlineSigner.getAccounts();
      this.signer = accounts[0].address;
      
      return this.signer;
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  }

  async disconnectWallet(): Promise<void> {
    this.client = null;
    this.signer = "";
  }

  getAddress(): string {
    return this.signer;
  }

  isConnected(): boolean {
    return this.demoMode ? this.signer !== "" : this.client !== null && this.signer !== "";
  }

  isDemoMode(): boolean {
    return this.demoMode;
  }

  private requireConnection(): void {
    if (this.demoMode) {
      if (!this.signer) {
        throw new Error("Demo wallet not connected. Please connect your wallet first.");
      }
      return;
    }
    
    if (!this.client || !this.signer) {
      throw new Error("Wallet not connected. Please connect your wallet first.");
    }
  }

  // Proposal Management
  async createProposal(params: {
    assetDetails: any;
    financialTerms: any;
    documents: any[];
    compliance: any;
  }) {
    this.requireConnection();
    
    const msg = {
      create_proposal: {
        asset_details: params.assetDetails,
        financial_terms: params.financialTerms,
        documents: params.documents,
        compliance: params.compliance,
      },
    };

    return await this.client!.execute(
      this.signer,
      this.config.contractAddress,
      msg,
      "auto"
    );
  }

  async updateProposal(params: {
    proposalId: string;
    assetDetails?: any;
    documents?: any[];
  }) {
    this.requireConnection();
    
    const msg = {
      update_proposal: {
        proposal_id: params.proposalId,
        asset_details: params.assetDetails || null,
        documents: params.documents || null,
      },
    };

    return await this.client!.execute(
      this.signer,
      this.config.contractAddress,
      msg,
      "auto"
    );
  }

  async cancelProposal(proposalId: string) {
    this.requireConnection();
    
    const msg = {
      cancel_proposal: {
        proposal_id: proposalId,
      },
    };

    return await this.client!.execute(
      this.signer,
      this.config.contractAddress,
      msg,
      "auto"
    );
  }

  // Investment Functions
  async invest(proposalId: string, amount: string) {
    this.requireConnection();
    
    // Demo mode simulation
    if (this.demoMode) {
      console.log(`Demo mode: Simulating investment of ${amount} untrn in proposal ${proposalId}`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate transaction time
      
      return {
        transactionHash: `demo_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        gasWanted: "200000",
        gasUsed: "180000",
        height: Math.floor(Math.random() * 1000000) + 5000000,
        events: [],
        logs: [{
          msg_index: 0,
          log: "",
          events: [{
            type: "wasm",
            attributes: [
              { key: "action", value: "invest" },
              { key: "proposal_id", value: proposalId },
              { key: "amount", value: amount },
              { key: "investor", value: this.signer }
            ]
          }]
        }]
      };
    }
    
    const msg = {
      invest: {
        proposal_id: proposalId,
      },
    };

    const funds = [{ denom: "untrn", amount }];

    return await this.client!.execute(
      this.signer,
      this.config.contractAddress,
      msg,
      "auto",
      undefined,
      funds
    );
  }

  // Token Management (Admin functions)
  async mintTokens(proposalId: string) {
    this.requireConnection();
    
    const msg = {
      mint_tokens: {
        proposal_id: proposalId,
      },
    };

    return await this.client!.execute(
      this.signer,
      this.config.contractAddress,
      msg,
      "auto"
    );
  }

  async distributeTokens(proposalId: string) {
    this.requireConnection();
    
    const msg = {
      distribute_tokens: {
        proposal_id: proposalId,
      },
    };

    return await this.client!.execute(
      this.signer,
      this.config.contractAddress,
      msg,
      "auto"
    );
  }

  async refundInvestors(proposalId: string) {
    this.requireConnection();
    
    const msg = {
      refund_investors: {
        proposal_id: proposalId,
      },
    };

    return await this.client!.execute(
      this.signer,
      this.config.contractAddress,
      msg,
      "auto"
    );
  }

  // Query Functions
  async queryProposal(proposalId: string) {
    let queryClient: CosmWasmClient | SigningCosmWasmClient;
    
    if (this.client) {
      queryClient = this.client;
    } else {
      // Create query-only client
      queryClient = await CosmWasmClient.connect(this.config.rpcEndpoint);
    }
    
    return await queryClient.queryContractSmart(this.config.contractAddress, {
      proposal: { proposal_id: proposalId },
    });
  }

  async queryAllProposals(startAfter?: string, limit?: number) {
    let queryClient: CosmWasmClient | SigningCosmWasmClient;
    
    if (this.client) {
      queryClient = this.client;
    } else {
      // Create query-only client
      queryClient = await CosmWasmClient.connect(this.config.rpcEndpoint);
    }
    
    return await queryClient.queryContractSmart(this.config.contractAddress, {
      all_proposals: {
        start_after: startAfter || null,
        limit: limit || 30,
      },
    });
  }

  async queryProposalsByCreator(creator: string, startAfter?: string, limit?: number) {
    let queryClient: CosmWasmClient | SigningCosmWasmClient;
    
    if (this.client) {
      queryClient = this.client;
    } else {
      // Create query-only client
      queryClient = await CosmWasmClient.connect(this.config.rpcEndpoint);
    }
    
    return await queryClient.queryContractSmart(this.config.contractAddress, {
      proposals_by_creator: {
        creator,
        start_after: startAfter || null,
        limit: limit || 30,
      },
    });
  }

  async queryProposalsByStatus(status: string, startAfter?: string, limit?: number) {
    let queryClient: CosmWasmClient | SigningCosmWasmClient;
    
    if (this.client) {
      queryClient = this.client;
    } else {
      // Create query-only client
      queryClient = await CosmWasmClient.connect(this.config.rpcEndpoint);
    }
    
    return await queryClient.queryContractSmart(this.config.contractAddress, {
      proposals_by_status: {
        status,
        start_after: startAfter || null,
        limit: limit || 30,
      },
    });
  }

  async queryUserInvestments(user: string, startAfter?: string, limit?: number) {
    let queryClient: CosmWasmClient | SigningCosmWasmClient;
    
    if (this.client) {
      queryClient = this.client;
    } else {
      // Create query-only client
      queryClient = await CosmWasmClient.connect(this.config.rpcEndpoint);
    }
    
    return await queryClient.queryContractSmart(this.config.contractAddress, {
      investments_by_user: {
        user,
        start_after: startAfter || null,
        limit: limit || 30,
      },
    });
  }

  async queryUserPortfolio(user: string, startAfter?: string, limit?: number) {
    let queryClient: CosmWasmClient | SigningCosmWasmClient;
    
    if (this.client) {
      queryClient = this.client;
    } else {
      // Create query-only client
      queryClient = await CosmWasmClient.connect(this.config.rpcEndpoint);
    }
    
    return await queryClient.queryContractSmart(this.config.contractAddress, {
      user_portfolio: {
        user,
        start_after: startAfter || null,
        limit: limit || 30,
      },
    });
  }

  async queryPortfolioPerformance(user: string) {
    let queryClient: CosmWasmClient | SigningCosmWasmClient;
    
    if (this.client) {
      queryClient = this.client;
    } else {
      // Create query-only client
      queryClient = await CosmWasmClient.connect(this.config.rpcEndpoint);
    }
    
    return await queryClient.queryContractSmart(this.config.contractAddress, {
      portfolio_performance: { user },
    });
  }

  async queryCreator(creator: string) {
    let queryClient: CosmWasmClient | SigningCosmWasmClient;
    
    if (this.client) {
      queryClient = this.client;
    } else {
      // Create query-only client
      queryClient = await CosmWasmClient.connect(this.config.rpcEndpoint);
    }
    
    return await queryClient.queryContractSmart(this.config.contractAddress, {
      creator: { creator },
    });
  }

  async queryPlatformStats() {
    let queryClient: CosmWasmClient | SigningCosmWasmClient;
    
    if (this.client) {
      queryClient = this.client;
    } else {
      // Create query-only client
      queryClient = await CosmWasmClient.connect(this.config.rpcEndpoint);
    }
    
    return await queryClient.queryContractSmart(this.config.contractAddress, {
      platform_stats: {},
    });
  }

  async queryLockupStatus(proposalId: string) {
    let queryClient: CosmWasmClient | SigningCosmWasmClient;
    
    if (this.client) {
      queryClient = this.client;
    } else {
      // Create query-only client
      queryClient = await CosmWasmClient.connect(this.config.rpcEndpoint);
    }
    
    return await queryClient.queryContractSmart(this.config.contractAddress, {
      lockup_status: { proposal_id: proposalId },
    });
  }

  async queryComplianceReport(proposalId: string) {
    let queryClient: CosmWasmClient | SigningCosmWasmClient;
    
    if (this.client) {
      queryClient = this.client;
    } else {
      // Create query-only client
      queryClient = await CosmWasmClient.connect(this.config.rpcEndpoint);
    }
    
    return await queryClient.queryContractSmart(this.config.contractAddress, {
      compliance_report: { proposal_id: proposalId },
    });
  }

  async queryGovernanceInfo(proposalId: string) {
    let queryClient: CosmWasmClient | SigningCosmWasmClient;
    
    if (this.client) {
      queryClient = this.client;
    } else {
      // Create query-only client
      queryClient = await CosmWasmClient.connect(this.config.rpcEndpoint);
    }
    
    return await queryClient.queryContractSmart(this.config.contractAddress, {
      governance_info: { proposal_id: proposalId },
    });
  }

  // Utility functions
  async getBalance(address?: string): Promise<string> {
    const userAddress = address || this.signer;
    if (!userAddress) {
      throw new Error("No address provided and wallet not connected");
    }

    // Demo mode fallback
    if (this.demoMode) {
      // Return a realistic demo balance
      return (Math.floor(Math.random() * 50000000) + 10000000).toString(); // 10-60 NTRN
    }

    let queryClient: CosmWasmClient | SigningCosmWasmClient;
    
    if (this.client) {
      queryClient = this.client;
    } else {
      // Create query-only client
      queryClient = await CosmWasmClient.connect(this.config.rpcEndpoint);
    }

    const balance = await queryClient.getBalance(userAddress, "untrn");
    return balance.amount;
  }

  formatAmount(amount: string, decimals: number = 6): string {
    const num = parseInt(amount) / Math.pow(10, decimals);
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  parseAmount(amount: string, decimals: number = 6): string {
    const num = parseFloat(amount) * Math.pow(10, decimals);
    return Math.floor(num).toString();
  }

  // Trading Functions (Order Book)
  async placeOrder(params: {
    tokenId: string;
    orderType: 'market' | 'limit' | 'stop_loss';
    side: 'buy' | 'sell';
    price?: string;
    amount: string;
    stopPrice?: string;
  }) {
    this.requireConnection();
    
    // Demo mode simulation
    if (this.demoMode) {
      console.log(`Demo mode: Placing ${params.side} order for ${params.amount} tokens`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        transactionHash: `demo_order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        orderId: `order_${Date.now()}`,
        gasWanted: "150000",
        gasUsed: "135000",
        height: Math.floor(Math.random() * 1000000) + 5000000,
        events: [],
        logs: [{
          msg_index: 0,
          log: "",
          events: [{
            type: "wasm",
            attributes: [
              { key: "action", value: "place_order" },
              { key: "order_id", value: `order_${Date.now()}` },
              { key: "token_id", value: params.tokenId },
              { key: "side", value: params.side },
              { key: "amount", value: params.amount }
            ]
          }]
        }]
      };
    }
    
    const msg = {
      place_order: {
        token_id: params.tokenId,
        order_type: params.orderType,
        side: params.side,
        price: params.price || null,
        amount: params.amount,
        stop_price: params.stopPrice || null,
      },
    };

    return await this.client!.execute(
      this.signer,
      this.config.contractAddress,
      msg,
      "auto"
    );
  }

  async cancelOrder(orderId: string) {
    this.requireConnection();
    
    // Demo mode simulation
    if (this.demoMode) {
      console.log(`Demo mode: Cancelling order ${orderId}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        transactionHash: `demo_cancel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        gasWanted: "100000",
        gasUsed: "85000",
        height: Math.floor(Math.random() * 1000000) + 5000000,
        events: [],
        logs: [{
          msg_index: 0,
          log: "",
          events: [{
            type: "wasm",
            attributes: [
              { key: "action", value: "cancel_order" },
              { key: "order_id", value: orderId }
            ]
          }]
        }]
      };
    }
    
    const msg = {
      cancel_order: {
        order_id: orderId,
      },
    };

    return await this.client!.execute(
      this.signer,
      this.config.contractAddress,
      msg,
      "auto"
    );
  }

  // AMM Functions (Liquidity Pools)
  async addLiquidity(poolId: string, amountA: string, amountB: string) {
    this.requireConnection();
    
    // Demo mode simulation
    if (this.demoMode) {
      console.log(`Demo mode: Adding liquidity to pool ${poolId} - ${amountA}/${amountB}`);
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      return {
        transactionHash: `demo_add_liq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        lpTokens: Math.floor(Math.random() * 1000 + 500).toString(),
        gasWanted: "300000",
        gasUsed: "275000",
        height: Math.floor(Math.random() * 1000000) + 5000000,
        events: [],
        logs: [{
          msg_index: 0,
          log: "",
          events: [{
            type: "wasm",
            attributes: [
              { key: "action", value: "add_liquidity" },
              { key: "pool_id", value: poolId },
              { key: "amount_a", value: amountA },
              { key: "amount_b", value: amountB }
            ]
          }]
        }]
      };
    }
    
    const msg = {
      add_liquidity: {
        pool_id: poolId,
        amount_a: amountA,
        amount_b: amountB,
      },
    };

    return await this.client!.execute(
      this.signer,
      this.config.contractAddress,
      msg,
      "auto"
    );
  }

  async removeLiquidity(poolId: string, lpAmount: string) {
    this.requireConnection();
    
    // Demo mode simulation
    if (this.demoMode) {
      console.log(`Demo mode: Removing ${lpAmount} LP tokens from pool ${poolId}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        transactionHash: `demo_rem_liq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amountA: Math.floor(Math.random() * 500 + 100).toString(),
        amountB: Math.floor(Math.random() * 500 + 100).toString(),
        gasWanted: "250000",
        gasUsed: "230000",
        height: Math.floor(Math.random() * 1000000) + 5000000,
        events: [],
        logs: [{
          msg_index: 0,
          log: "",
          events: [{
            type: "wasm",
            attributes: [
              { key: "action", value: "remove_liquidity" },
              { key: "pool_id", value: poolId },
              { key: "lp_amount", value: lpAmount }
            ]
          }]
        }]
      };
    }
    
    const msg = {
      remove_liquidity: {
        pool_id: poolId,
        lp_amount: lpAmount,
      },
    };

    return await this.client!.execute(
      this.signer,
      this.config.contractAddress,
      msg,
      "auto"
    );
  }

  async swap(poolId: string, tokenIn: string, amountIn: string) {
    this.requireConnection();
    
    // Demo mode simulation
    if (this.demoMode) {
      console.log(`Demo mode: Swapping ${amountIn} ${tokenIn} in pool ${poolId}`);
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      const amountOut = Math.floor(parseFloat(amountIn) * (0.95 + Math.random() * 0.1)).toString(); // ~95-105% conversion
      
      return {
        transactionHash: `demo_swap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amountOut,
        gasWanted: "200000",
        gasUsed: "185000",
        height: Math.floor(Math.random() * 1000000) + 5000000,
        events: [],
        logs: [{
          msg_index: 0,
          log: "",
          events: [{
            type: "wasm",
            attributes: [
              { key: "action", value: "swap" },
              { key: "pool_id", value: poolId },
              { key: "token_in", value: tokenIn },
              { key: "amount_in", value: amountIn },
              { key: "amount_out", value: amountOut }
            ]
          }]
        }]
      };
    }
    
    const msg = {
      swap: {
        pool_id: poolId,
        token_in: tokenIn,
        amount_in: amountIn,
      },
    };

    return await this.client!.execute(
      this.signer,
      this.config.contractAddress,
      msg,
      "auto"
    );
  }

  // Staking Functions
  async stake(poolId: string, amount: string, lockPeriod?: number) {
    this.requireConnection();
    
    // Demo mode simulation
    if (this.demoMode) {
      console.log(`Demo mode: Staking ${amount} tokens in pool ${poolId}${lockPeriod ? ` for ${lockPeriod} days` : ''}`);
      await new Promise(resolve => setTimeout(resolve, 2200));
      
      return {
        transactionHash: `demo_stake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        stakeId: `stake_${Date.now()}`,
        gasWanted: "180000",
        gasUsed: "165000",
        height: Math.floor(Math.random() * 1000000) + 5000000,
        events: [],
        logs: [{
          msg_index: 0,
          log: "",
          events: [{
            type: "wasm",
            attributes: [
              { key: "action", value: "stake" },
              { key: "pool_id", value: poolId },
              { key: "amount", value: amount },
              { key: "lock_period", value: lockPeriod?.toString() || "0" }
            ]
          }]
        }]
      };
    }
    
    const msg = {
      stake: {
        pool_id: poolId,
        amount,
        lock_period: lockPeriod || null,
      },
    };

    return await this.client!.execute(
      this.signer,
      this.config.contractAddress,
      msg,
      "auto"
    );
  }

  async unstake(poolId: string, amount: string) {
    this.requireConnection();
    
    // Demo mode simulation
    if (this.demoMode) {
      console.log(`Demo mode: Unstaking ${amount} tokens from pool ${poolId}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        transactionHash: `demo_unstake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        gasWanted: "160000",
        gasUsed: "145000",
        height: Math.floor(Math.random() * 1000000) + 5000000,
        events: [],
        logs: [{
          msg_index: 0,
          log: "",
          events: [{
            type: "wasm",
            attributes: [
              { key: "action", value: "unstake" },
              { key: "pool_id", value: poolId },
              { key: "amount", value: amount }
            ]
          }]
        }]
      };
    }
    
    const msg = {
      unstake: {
        pool_id: poolId,
        amount,
      },
    };

    return await this.client!.execute(
      this.signer,
      this.config.contractAddress,
      msg,
      "auto"
    );
  }

  async claimRewards(poolId: string) {
    this.requireConnection();
    
    // Demo mode simulation
    if (this.demoMode) {
      console.log(`Demo mode: Claiming rewards from pool ${poolId}`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const rewardAmount = (Math.random() * 50 + 10).toFixed(2); // 10-60 reward tokens
      
      return {
        transactionHash: `demo_claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        rewardAmount,
        gasWanted: "120000",
        gasUsed: "105000",
        height: Math.floor(Math.random() * 1000000) + 5000000,
        events: [],
        logs: [{
          msg_index: 0,
          log: "",
          events: [{
            type: "wasm",
            attributes: [
              { key: "action", value: "claim_rewards" },
              { key: "pool_id", value: poolId },
              { key: "reward_amount", value: rewardAmount }
            ]
          }]
        }]
      };
    }
    
    const msg = {
      claim_rewards: {
        pool_id: poolId,
      },
    };

    return await this.client!.execute(
      this.signer,
      this.config.contractAddress,
      msg,
      "auto"
    );
  }

  // Lending Functions
  async createLendingPool(poolId: string, assetDenom: string) {
    this.requireConnection();
    
    // Demo mode simulation
    if (this.demoMode) {
      console.log(`Demo mode: Creating lending pool ${poolId} for ${assetDenom}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        transactionHash: `demo_pool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        gasWanted: "200000",
        gasUsed: "185000",
        height: Math.floor(Math.random() * 1000000) + 5000000,
        events: [],
        logs: [{
          msg_index: 0,
          log: "",
          events: [{
            type: "wasm",
            attributes: [
              { key: "action", value: "create_lending_pool" },
              { key: "pool_id", value: poolId },
              { key: "asset_denom", value: assetDenom }
            ]
          }]
        }]
      };
    }
    
    const msg = {
      create_lending_pool: {
        pool_id: poolId,
        asset_denom: assetDenom,
      },
    };

    return await this.client!.execute(
      this.signer,
      this.config.contractAddress,
      msg,
      "auto"
    );
  }

  async supplyToPool(poolId: string, amount: string) {
    this.requireConnection();
    
    // Demo mode simulation
    if (this.demoMode) {
      console.log(`Demo mode: Supplying ${amount} to pool ${poolId}`);
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      return {
        transactionHash: `demo_supply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        shares: Math.floor(Math.random() * 1000 + 500).toString(),
        gasWanted: "250000",
        gasUsed: "230000",
        height: Math.floor(Math.random() * 1000000) + 5000000,
        events: [],
        logs: [{
          msg_index: 0,
          log: "",
          events: [{
            type: "wasm",
            attributes: [
              { key: "action", value: "supply_to_pool" },
              { key: "pool_id", value: poolId },
              { key: "amount", value: amount }
            ]
          }]
        }]
      };
    }
    
    const msg = {
      supply_to_pool: {
        pool_id: poolId,
      },
    };

    const funds = [{ denom: "untrn", amount }];

    return await this.client!.execute(
      this.signer,
      this.config.contractAddress,
      msg,
      "auto",
      undefined,
      funds
    );
  }

  async borrowFromPool(poolId: string, borrowAmount: string) {
    this.requireConnection();
    
    // Demo mode simulation
    if (this.demoMode) {
      console.log(`Demo mode: Borrowing ${borrowAmount} from pool ${poolId}`);
      await new Promise(resolve => setTimeout(resolve, 2200));
      
      const healthFactor = (Math.random() * 3 + 1).toFixed(2); // 1.0-4.0 health factor
      
      return {
        transactionHash: `demo_borrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        healthFactor,
        gasWanted: "300000",
        gasUsed: "275000",
        height: Math.floor(Math.random() * 1000000) + 5000000,
        events: [],
        logs: [{
          msg_index: 0,
          log: "",
          events: [{
            type: "wasm",
            attributes: [
              { key: "action", value: "borrow_from_pool" },
              { key: "pool_id", value: poolId },
              { key: "amount", value: borrowAmount },
              { key: "health_factor", value: healthFactor }
            ]
          }]
        }]
      };
    }
    
    const msg = {
      borrow_from_pool: {
        pool_id: poolId,
        borrow_amount: borrowAmount,
      },
    };

    return await this.client!.execute(
      this.signer,
      this.config.contractAddress,
      msg,
      "auto"
    );
  }

  async repayLoan(poolId: string, repayAmount: string) {
    this.requireConnection();
    
    // Demo mode simulation
    if (this.demoMode) {
      console.log(`Demo mode: Repaying ${repayAmount} to pool ${poolId}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const remainingDebt = Math.max(0, Math.floor(Math.random() * 500)).toString();
      
      return {
        transactionHash: `demo_repay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        remainingDebt,
        gasWanted: "250000",
        gasUsed: "230000",
        height: Math.floor(Math.random() * 1000000) + 5000000,
        events: [],
        logs: [{
          msg_index: 0,
          log: "",
          events: [{
            type: "wasm",
            attributes: [
              { key: "action", value: "repay_loan" },
              { key: "pool_id", value: poolId },
              { key: "amount", value: repayAmount },
              { key: "remaining_debt", value: remainingDebt }
            ]
          }]
        }]
      };
    }
    
    const msg = {
      repay_loan: {
        pool_id: poolId,
        repay_amount: repayAmount,
      },
    };

    const funds = [{ denom: "untrn", amount: repayAmount }];

    return await this.client!.execute(
      this.signer,
      this.config.contractAddress,
      msg,
      "auto",
      undefined,
      funds
    );
  }

  async depositCollateral(poolId: string, tokenAddress: string, tokenId: string, amount: string) {
    this.requireConnection();
    
    // Demo mode simulation
    if (this.demoMode) {
      console.log(`Demo mode: Depositing collateral ${amount} ${tokenId} for pool ${poolId}`);
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const healthFactor = (Math.random() * 2 + 2).toFixed(2); // 2.0-4.0 health factor
      
      return {
        transactionHash: `demo_collateral_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        healthFactor,
        gasWanted: "350000",
        gasUsed: "320000",
        height: Math.floor(Math.random() * 1000000) + 5000000,
        events: [],
        logs: [{
          msg_index: 0,
          log: "",
          events: [{
            type: "wasm",
            attributes: [
              { key: "action", value: "deposit_collateral" },
              { key: "pool_id", value: poolId },
              { key: "token_address", value: tokenAddress },
              { key: "token_id", value: tokenId },
              { key: "amount", value: amount },
              { key: "health_factor", value: healthFactor }
            ]
          }]
        }]
      };
    }
    
    const msg = {
      deposit_collateral: {
        pool_id: poolId,
        token_address: tokenAddress,
        token_id: tokenId,
        amount,
      },
    };

    return await this.client!.execute(
      this.signer,
      this.config.contractAddress,
      msg,
      "auto"
    );
  }

  async liquidatePosition(borrower: string, poolId: string) {
    this.requireConnection();
    
    // Demo mode simulation
    if (this.demoMode) {
      console.log(`Demo mode: Liquidating position for ${borrower} in pool ${poolId}`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const debtCleared = Math.floor(Math.random() * 1000 + 500).toString();
      const liquidationBonus = "5"; // 5% bonus
      
      return {
        transactionHash: `demo_liquidate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        debtCleared,
        liquidationBonus,
        gasWanted: "400000",
        gasUsed: "375000",
        height: Math.floor(Math.random() * 1000000) + 5000000,
        events: [],
        logs: [{
          msg_index: 0,
          log: "",
          events: [{
            type: "wasm",
            attributes: [
              { key: "action", value: "liquidate_position" },
              { key: "borrower", value: borrower },
              { key: "pool_id", value: poolId },
              { key: "debt_cleared", value: debtCleared },
              { key: "liquidation_bonus", value: liquidationBonus }
            ]
          }]
        }]
      };
    }
    
    const msg = {
      liquidate_position: {
        borrower,
        pool_id: poolId,
      },
    };

    return await this.client!.execute(
      this.signer,
      this.config.contractAddress,
      msg,
      "auto"
    );
  }

  async queryLaunchpadProposals(status?: string, startAfter?: string, limit?: number) {
    // In demo mode, return mock data
    if (this.demoMode) {
      return {
        proposals: [
          { id: "1", title: "Green Energy Project", status: "active", funded_amount: 750000, goal: 1000000 },
          { id: "2", title: "Tech Startup Fund", status: "funded", funded_amount: 2000000, goal: 2000000 }
        ]
      };
    }

    let queryClient: CosmWasmClient | SigningCosmWasmClient;
    
    if (this.client) {
      queryClient = this.client;
    } else {
      // Create query-only client
      queryClient = await CosmWasmClient.connect(this.config.rpcEndpoint);
    }
    
    return await queryClient.queryContractSmart(this.config.contractAddress, {
      launchpad_proposals: { 
        status,
        start_after: startAfter,
        limit: limit || 10
      }
    });
  }
}

// Global client instance
export const cosmjsClient = new CF1CosmJSClient();

// Keplr wallet detection
declare global {
  interface Window {
    keplr?: Keplr;
  }
}