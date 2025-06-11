import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { GasPrice } from "@cosmjs/stargate";
import { Keplr } from "@keplr-wallet/types";

// Neutron testnet configuration
const NEUTRON_TESTNET_CONFIG = {
  chainId: "pion-1",
  chainName: "Neutron Testnet",
  rpc: "https://rpc-palvus.pion-1.ntrn.tech",
  rest: "https://rest-palvus.pion-1.ntrn.tech",
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
export const CF1_LAUNCHPAD_CONTRACT = process.env.REACT_APP_LAUNCHPAD_CONTRACT || "";

// Gas configuration
const GAS_PRICES = GasPrice.fromString("0.025untrn");

export interface CosmJSConfig {
  chainId: string;
  rpcEndpoint: string;
  gasPrice: GasPrice;
  contractAddress: string;
}

export class CF1CosmJSClient {
  private client: SigningCosmWasmClient | null = null;
  private signer: string = "";
  
  constructor(
    private config: CosmJSConfig = {
      chainId: NEUTRON_TESTNET_CONFIG.chainId,
      rpcEndpoint: NEUTRON_TESTNET_CONFIG.rpc,
      gasPrice: GAS_PRICES,
      contractAddress: CF1_LAUNCHPAD_CONTRACT,
    }
  ) {}

  async connectWallet(): Promise<string> {
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
    return this.client !== null && this.signer !== "";
  }

  private requireConnection(): void {
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
    if (!this.client) {
      // Create query-only client
      this.client = await SigningCosmWasmClient.connect(this.config.rpcEndpoint);
    }
    
    return await this.client.queryContractSmart(this.config.contractAddress, {
      proposal: { proposal_id: proposalId },
    });
  }

  async queryAllProposals(startAfter?: string, limit?: number) {
    if (!this.client) {
      this.client = await SigningCosmWasmClient.connect(this.config.rpcEndpoint);
    }
    
    return await this.client.queryContractSmart(this.config.contractAddress, {
      all_proposals: {
        start_after: startAfter || null,
        limit: limit || 30,
      },
    });
  }

  async queryProposalsByCreator(creator: string, startAfter?: string, limit?: number) {
    if (!this.client) {
      this.client = await SigningCosmWasmClient.connect(this.config.rpcEndpoint);
    }
    
    return await this.client.queryContractSmart(this.config.contractAddress, {
      proposals_by_creator: {
        creator,
        start_after: startAfter || null,
        limit: limit || 30,
      },
    });
  }

  async queryProposalsByStatus(status: string, startAfter?: string, limit?: number) {
    if (!this.client) {
      this.client = await SigningCosmWasmClient.connect(this.config.rpcEndpoint);
    }
    
    return await this.client.queryContractSmart(this.config.contractAddress, {
      proposals_by_status: {
        status,
        start_after: startAfter || null,
        limit: limit || 30,
      },
    });
  }

  async queryUserInvestments(user: string, startAfter?: string, limit?: number) {
    if (!this.client) {
      this.client = await SigningCosmWasmClient.connect(this.config.rpcEndpoint);
    }
    
    return await this.client.queryContractSmart(this.config.contractAddress, {
      investments_by_user: {
        user,
        start_after: startAfter || null,
        limit: limit || 30,
      },
    });
  }

  async queryUserPortfolio(user: string, startAfter?: string, limit?: number) {
    if (!this.client) {
      this.client = await SigningCosmWasmClient.connect(this.config.rpcEndpoint);
    }
    
    return await this.client.queryContractSmart(this.config.contractAddress, {
      user_portfolio: {
        user,
        start_after: startAfter || null,
        limit: limit || 30,
      },
    });
  }

  async queryPortfolioPerformance(user: string) {
    if (!this.client) {
      this.client = await SigningCosmWasmClient.connect(this.config.rpcEndpoint);
    }
    
    return await this.client.queryContractSmart(this.config.contractAddress, {
      portfolio_performance: { user },
    });
  }

  async queryCreator(creator: string) {
    if (!this.client) {
      this.client = await SigningCosmWasmClient.connect(this.config.rpcEndpoint);
    }
    
    return await this.client.queryContractSmart(this.config.contractAddress, {
      creator: { creator },
    });
  }

  async queryPlatformStats() {
    if (!this.client) {
      this.client = await SigningCosmWasmClient.connect(this.config.rpcEndpoint);
    }
    
    return await this.client.queryContractSmart(this.config.contractAddress, {
      platform_stats: {},
    });
  }

  async queryLockupStatus(proposalId: string) {
    if (!this.client) {
      this.client = await SigningCosmWasmClient.connect(this.config.rpcEndpoint);
    }
    
    return await this.client.queryContractSmart(this.config.contractAddress, {
      lockup_status: { proposal_id: proposalId },
    });
  }

  async queryComplianceReport(proposalId: string) {
    if (!this.client) {
      this.client = await SigningCosmWasmClient.connect(this.config.rpcEndpoint);
    }
    
    return await this.client.queryContractSmart(this.config.contractAddress, {
      compliance_report: { proposal_id: proposalId },
    });
  }

  async queryGovernanceInfo(proposalId: string) {
    if (!this.client) {
      this.client = await SigningCosmWasmClient.connect(this.config.rpcEndpoint);
    }
    
    return await this.client.queryContractSmart(this.config.contractAddress, {
      governance_info: { proposal_id: proposalId },
    });
  }

  // Utility functions
  async getBalance(address?: string): Promise<string> {
    if (!this.client) {
      this.client = await SigningCosmWasmClient.connect(this.config.rpcEndpoint);
    }
    
    const userAddress = address || this.signer;
    if (!userAddress) {
      throw new Error("No address provided and wallet not connected");
    }

    const balance = await this.client.getBalance(userAddress, "untrn");
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