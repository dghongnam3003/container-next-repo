"use client";

// Wrapper for @gems.fun/sdk that works with Turbopack
import { Connection, PublicKey, VersionedTransaction, Keypair } from '@solana/web3.js';

// Use number type instead of BN for now to avoid import issues
export interface CreateCoinParams {
  marketCapIndex: number;
  name: string;
  symbol: string;
  uri: string;
  aiGenerated?: boolean;
  mint?: Keypair;
  createCreatorRevenuePool?: boolean;
}

export interface CreateCoinResult {
  transaction: VersionedTransaction;
  mint: Keypair;
}

export interface BuyCoinParams {
  mint: PublicKey;
  marketCapIndex: number;
  tokenAmount: number; // Changed from BN to number
  maxSolCost: number;  // Changed from BN to number
  creator: PublicKey;
  referralFee?: number;
  referral?: PublicKey;
}

export interface BuyCoinWithSolParams {
  mint: PublicKey;
  marketCapIndex: number;
  solAmount: number;   // Changed from BN to number
  slippage?: number;
  creator: PublicKey;
  referralFee?: number;
  referral?: PublicKey;
}

export interface PumpClientConfig {
  rpcUrl?: string;
  commitment?: 'processed' | 'confirmed' | 'finalized';
}

export interface Wallet {
  publicKey: PublicKey | null;
  signTransaction?: <T extends VersionedTransaction>(transaction: T) => Promise<T>;
  signAllTransactions?: <T extends VersionedTransaction>(transactions: T[]) => Promise<T[]>;
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
  payer?: Keypair; // Added for Anchor compatibility
}

// Dynamic import wrapper
class PumpClientWrapper {
  private _client: unknown = null;
  private _initialized = false;
  public connection: Connection;
  public wallet: Wallet;

  constructor(wallet: Wallet, config: PumpClientConfig = {}) {
    this.wallet = wallet;
    this.connection = new Connection(
      config.rpcUrl || 'https://api.devnet.solana.com',
      config.commitment || 'confirmed'
    );
  }

  private async ensureClient() {
    if (this._initialized) return this._client;

    try {
      console.log('🔄 Loading Gems.fun SDK (ES Module build)...');
      
      // Import the SDK - should work properly now with ES modules
      const { PumpClient } = await import('@gems.fun/sdk');
      
      if (!PumpClient) {
        throw new Error('PumpClient not found in SDK exports');
      }
      
      console.log('✅ PumpClient imported successfully');
      
      // Create client instance
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this._client = new PumpClient(this.wallet as any, {
        rpcUrl: this.connection.rpcEndpoint,
        commitment: 'confirmed'
      });
      
      this._initialized = true;
      console.log('✅ Gems.fun SDK initialized successfully');
      return this._client;
    } catch (error) {
      console.error('❌ Failed to load @gems.fun/sdk:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('SDK Error Details:', {
        error: errorMessage,
        wallet: !!this.wallet,
        walletPublicKey: this.wallet?.publicKey?.toString(),
        rpcUrl: this.connection.rpcEndpoint
      });
      
      // Return a mock client to prevent app crashes
      this._client = {
        createCoin: () => Promise.reject(new Error(`SDK unavailable: ${errorMessage}`)),
        buyCoinWithSol: () => Promise.reject(new Error(`SDK unavailable: ${errorMessage}`))
      };
      this._initialized = true;
      return this._client;
    }
  }

  async simulateTransaction(transaction: VersionedTransaction): Promise<{
    success: boolean;
    error?: string;
    logs?: string[];
  }> {
    try {
      const client = await this.ensureClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (client as any).simulateTransaction(transaction);
    } catch (error) {
      console.error('Simulation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Simulation failed'
      };
    }
  }

  async createCoin(params: CreateCoinParams): Promise<CreateCoinResult> {
    const client = await this.ensureClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (client as any).createCoin(params);
  }

  async buyCoin(params: BuyCoinParams): Promise<VersionedTransaction> {
    const client = await this.ensureClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (client as any).buyCoin(params);
  }

  async buyCoinWithSol(params: BuyCoinWithSolParams): Promise<VersionedTransaction> {
    const client = await this.ensureClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (client as any).buyCoinWithSol(params);
  }

  async getGlobalAccount() {
    const client = await this.ensureClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (client as any).getGlobalAccount();
  }

  async getMarketCapAccount(marketCapIndex: number) {
    const client = await this.ensureClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (client as any).getMarketCapAccount(marketCapIndex);
  }

  async getBondingCurveAccount(mint: PublicKey) {
    const client = await this.ensureClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (client as any).getBondingCurveAccount(mint);
  }

  async getCreatorRevenuePoolAccount(mint: PublicKey, creator: PublicKey) {
    const client = await this.ensureClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (client as any).getCreatorRevenuePoolAccount(mint, creator);
  }
}

export { PumpClientWrapper as PumpClient };