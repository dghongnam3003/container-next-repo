"use client";

import { useState, useMemo, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { 
  PumpClient,
  type CreateCoinParams, 
  type BuyCoinParams, 
  type SellCoinParams, 
  type BuyCoinWithSolParams 
} from '@/lib/gemsfunClient';

interface UseGemsfunActionsReturn {
  client: PumpClient | null;
  currentMint: string;
  currentCreator: string;
  isLoading: boolean;
  error: string | null;
  createCoin: (params: Omit<CreateCoinParams, 'marketCapIndex'>) => Promise<{ mint: string; creator: string; signature: string }>;
  buyCoinWithSol: (params: Omit<BuyCoinWithSolParams, 'mint' | 'creator'>) => Promise<string>;
  buyCoin: (params: Omit<BuyCoinParams, 'mint' | 'creator'>) => Promise<string>;
  sellCoin: (params: Omit<SellCoinParams, 'mint' | 'creator'>) => Promise<string>;
  setCurrentToken: (mint: string, creator: string) => void;
  clearError: () => void;
}

export function useGemsfunActions(): UseGemsfunActionsReturn {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [currentMint, setCurrentMint] = useState('');
  const [currentCreator, setCurrentCreator] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = useMemo(() => {
    if (!wallet.publicKey || !wallet.connected || !connection) return null;
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return new PumpClient(wallet as any, {
        rpcUrl: connection.rpcEndpoint,
        commitment: 'confirmed'
      });
    } catch (err) {
      console.error('Failed to create PumpClient:', err);
      return null;
    }
  }, [wallet, connection]);

  const createCoin = useCallback(async (params: Omit<CreateCoinParams, 'marketCapIndex'>) => {
    if (!client || !wallet.connected || !wallet.signTransaction) {
      throw new Error('Wallet not connected or client not available');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await client.createCoin({
        ...params,
        marketCapIndex: 1 // Default to 42k market cap
      });
      
      // Simulate transaction first
      const simulation = await client.simulateTransaction(result.transaction);
      if (!simulation.success) {
        throw new Error(`Transaction simulation failed: ${simulation.error}`);
      }

      const signedTx = await wallet.signTransaction(result.transaction);
      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: true,
        maxRetries: 3
      });
      
      await connection.confirmTransaction(signature, 'confirmed');
      
      const mint = result.mint.publicKey.toBase58();
      const creator = wallet.publicKey!.toBase58();
      
      setCurrentMint(mint);
      setCurrentCreator(creator);
      
      return { mint, creator, signature };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create coin';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [client, wallet, connection]);

  const buyCoinWithSol = useCallback(async (params: Omit<BuyCoinWithSolParams, 'mint' | 'creator'>) => {
    if (!client || !currentMint || !currentCreator || !wallet.signTransaction) {
      throw new Error('No coin selected or wallet not connected');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const tx = await client.buyCoinWithSol({
        ...params,
        mint: new PublicKey(currentMint),
        creator: new PublicKey(currentCreator),
        marketCapIndex: 1
      });
      
      // Simulate transaction first
      const simulation = await client.simulateTransaction(tx);
      if (!simulation.success) {
        throw new Error(`Transaction simulation failed: ${simulation.error}`);
      }
      
      const signedTx = await wallet.signTransaction(tx);
      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: true,
        maxRetries: 3
      });
      
      await connection.confirmTransaction(signature, 'confirmed');
      return signature;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to buy coin';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [client, currentMint, currentCreator, wallet, connection]);

  const buyCoin = useCallback(async (params: Omit<BuyCoinParams, 'mint' | 'creator'>) => {
    if (!client || !currentMint || !currentCreator || !wallet.signTransaction) {
      throw new Error('No coin selected or wallet not connected');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const tx = await client.buyCoin({
        ...params,
        mint: new PublicKey(currentMint),
        creator: new PublicKey(currentCreator),
        marketCapIndex: 1
      });
      
      // Simulate transaction first
      const simulation = await client.simulateTransaction(tx);
      if (!simulation.success) {
        throw new Error(`Transaction simulation failed: ${simulation.error}`);
      }
      
      const signedTx = await wallet.signTransaction(tx);
      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: true,
        maxRetries: 3
      });
      
      await connection.confirmTransaction(signature, 'confirmed');
      return signature;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to buy coin';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [client, currentMint, currentCreator, wallet, connection]);

  const sellCoin = useCallback(async (params: Omit<SellCoinParams, 'mint' | 'creator'>) => {
    if (!client || !currentMint || !currentCreator || !wallet.signTransaction) {
      throw new Error('No coin selected or wallet not connected');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const tx = await client.sellCoin({
        ...params,
        mint: new PublicKey(currentMint),
        creator: new PublicKey(currentCreator),
        marketCapIndex: 1
      });
      
      // Simulate transaction first
      const simulation = await client.simulateTransaction(tx);
      if (!simulation.success) {
        throw new Error(`Transaction simulation failed: ${simulation.error}`);
      }
      
      const signedTx = await wallet.signTransaction(tx);
      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: true,
        maxRetries: 3
      });
      
      await connection.confirmTransaction(signature, 'confirmed');
      return signature;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to sell coin';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [client, currentMint, currentCreator, wallet, connection]);

  const setCurrentToken = useCallback((mint: string, creator: string) => {
    setCurrentMint(mint);
    setCurrentCreator(creator);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    client,
    currentMint,
    currentCreator,
    isLoading,
    error,
    createCoin,
    buyCoinWithSol,
    buyCoin,
    sellCoin,
    setCurrentToken,
    clearError
  };
}
