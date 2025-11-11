"use client";

import React, { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  UnsafeBurnerWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

// Default styles for the react-ui package. App can override these in globals.css if desired.
import "@solana/wallet-adapter-react-ui/styles.css";

type Props = {
  children: React.ReactNode;
};

export default function SolanaWalletProvider({ children }: Props) {
  // Allow overriding via env: NEXT_PUBLIC_SOLANA_NETWORK = 'mainnet-beta' | 'testnet' | 'devnet'
  const network = useMemo(() => {
    const env = process.env.NEXT_PUBLIC_SOLANA_NETWORK;
    if (env === "mainnet-beta") return WalletAdapterNetwork.Mainnet;
    if (env === "testnet") return WalletAdapterNetwork.Testnet;
    return WalletAdapterNetwork.Devnet;
  }, []);

  // Allow a custom RPC via NEXT_PUBLIC_SOLANA_RPC otherwise use the cluster api url
  const endpoint = useMemo(() => {
    return process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl(network);
  }, [network]);

  const wallets = useMemo(
    () => [
      // Common browser/mobile wallets.
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      // Unsafe burner for local/dev only
      new UnsafeBurnerWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}