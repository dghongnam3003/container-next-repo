"use client";

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useGemsfunActions } from '@/hooks/useGemsfunActions';

export default function GemsfunTrading() {
  const { connected } = useWallet();
  const {
    client,
    currentMint,
    currentCreator,
    isLoading,
    error,
    createCoin,
    buyCoinWithSol,
    setCurrentToken,
    clearError
  } = useGemsfunActions();

  // Form states
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [metadataUri, setMetadataUri] = useState('');
  const [solAmount, setSolAmount] = useState('0.01');
  const [manualMint, setManualMint] = useState('');
  const [manualCreator, setManualCreator] = useState('');

  const handleCreateCoin = async () => {
    if (!tokenName || !tokenSymbol || !metadataUri) {
      alert('Please fill in all token details');
      return;
    }

    try {
      clearError(); // Clear any previous errors
      console.log('🚀 Starting token creation...', {
        name: tokenName,
        symbol: tokenSymbol,
        uri: metadataUri,
        walletConnected: connected,
        clientAvailable: !!client
      });

      const result = await createCoin({
        name: tokenName,
        symbol: tokenSymbol,
        uri: metadataUri,
        aiGenerated: false,
        createCreatorRevenuePool: true
      });
      
      alert(`Token created successfully!\nMint: ${result.mint}\nTx: ${result.signature}`);
      
      // Clear form
      setTokenName('');
      setTokenSymbol('');
      setMetadataUri('');
    } catch (err) {
      console.error('❌ Create coin error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      alert(`Failed to create token: ${errorMessage}`);
    }
  };

  const handleBuyCoin = async () => {
    if (!solAmount || parseFloat(solAmount) <= 0) {
      alert('Please enter a valid SOL amount');
      return;
    }

    try {
      const { BN } = await import('bn.js');
      const signature = await buyCoinWithSol({
        solAmount: new BN(Math.floor(parseFloat(solAmount) * 1e9)), // Convert to lamports
        slippage: 500, // 5% slippage
        marketCapIndex: 1
      });
      
      alert(`Tokens bought successfully!\nTx: ${signature}`);
    } catch (err) {
      console.error('Buy coin error:', err);
    }
  };

  const handleSetToken = () => {
    if (!manualMint || !manualCreator) {
      alert('Please enter both mint and creator addresses');
      return;
    }
    
    setCurrentToken(manualMint, manualCreator);
    alert('Token set successfully!');
  };

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Connect Your Wallet</h2>
        <p className="text-gray-600">Please connect your wallet to use Gems.fun trading features</p>
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gems.fun Trading</h1>
        <WalletMultiButton />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700">Transaction in progress... Please wait.</p>
        </div>
      )}

      {/* new Token Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Token</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Token Name
            </label>
            <input
              type="text"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="My Token"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Symbol
            </label>
            <input
              type="text"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="MTK"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Metadata URI
            </label>
            <input
              type="text"
              value={metadataUri}
              onChange={(e) => setMetadataUri(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/metadata.json"
            />
          </div>
        </div>
        <button
          onClick={handleCreateCoin}
          disabled={isLoading || !client}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          new Token
        </button>
      </div>

      {/* Current Token Info */}
      {currentMint && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">Current Token</h3>
          <p className="text-sm text-green-700">
            <strong>Mint:</strong> {currentMint}
          </p>
          <p className="text-sm text-green-700">
            <strong>Creator:</strong> {currentCreator}
          </p>
        </div>
      )}

      {/* Set Token Manually */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Select Existing Token</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Token Mint Address
            </label>
            <input
              type="text"
              value={manualMint}
              onChange={(e) => setManualMint(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Token mint public key"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Creator Address
            </label>
            <input
              type="text"
              value={manualCreator}
              onChange={(e) => setManualCreator(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Creator public key"
            />
          </div>
        </div>
        <button
          onClick={handleSetToken}
          disabled={isLoading}
          className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Set Token
        </button>
      </div>

      {/* Buy Section */}
      {currentMint && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-800">Buy Tokens</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SOL Amount
            </label>
            <input
              type="number"
              step="0.001"
              value={solAmount}
              onChange={(e) => setSolAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0.01"
            />
          </div>
          <button
            onClick={handleBuyCoin}
            disabled={isLoading || !client}
            className="w-full bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Buy Tokens
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Slippage: 5% | Market Cap: 42k SOL
          </p>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">How to Use</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>1. new Token:</strong> Fill in token details and click "new Token"</p>
          <p><strong>2. Buy Tokens:</strong> Enter SOL amount and click "Buy Tokens"</p>
          <p><strong>3. Manual Selection:</strong> Enter existing token mint and creator addresses</p>
        </div>
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> This uses devnet by default. Make sure your wallet is connected to devnet.
          </p>
        </div>
      </div>
    </div>
  );
}