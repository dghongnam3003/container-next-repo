"use client";

import { WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';

export default function WalletButtons() {
  return (
    <div className="flex gap-4 items-center">
      <WalletMultiButton />
      <WalletDisconnectButton />
    </div>
  );
}
