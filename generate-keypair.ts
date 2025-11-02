import { Keypair } from '@solana/web3.js';
import base58 from "bs58";
import * as fs from 'fs';

const PRIVATE_KEY = "336KTMANc2ryER7G8tQcmuMXT4Ba4h6nXRUkbd22SMpzrBckWDoSRKCJf3ZMVQTLgFE6YPAA8vBPaFEF1zaMhN6G"; // Private key from phantom
const PUBLIC_KEY = "8CiWsXaMLYh8AMt9w4B4eiDjnTHa828SToceVsERqxez"; // Fill with your address to verify
const secret = base58.decode(PRIVATE_KEY);

// Check if the pk is correct 
const pair = Keypair.fromSecretKey(secret);

if (pair.publicKey.toString() == PUBLIC_KEY) {
  fs.writeFileSync(
    'private_key.json',
    JSON.stringify(Array.from(secret))
  );
}
