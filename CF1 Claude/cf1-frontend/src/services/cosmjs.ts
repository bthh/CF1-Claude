import { SigningCosmWasmClient, CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { GasPrice } from "@cosmjs/stargate";
import type { Keplr } from "@keplr-wallet/types";

// Neutron testnet configuration
const NEUTRON_TESTNET_CONFIG = {
  chainId: import.meta.env.VITE_CHAIN_ID || "pion-1",
  chainName: import.meta.env.VITE_CHAIN_NAME || "Neutron Testnet",
  rpc: import.meta.env.VITE_RPC_URL || "https://rpc-palvus.pion-1.ntrn.tech",
  rest: import.meta.env.VITE_REST_URL || "https://rest-palvus.pion-1.ntrn.tech",
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
}

// Global client instance
export const cosmjsClient = new CF1CosmJSClient();

// Keplr wallet detection
declare global {
  interface Window {
    keplr?: Keplr;
  }
}