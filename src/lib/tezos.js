import { BeaconWallet } from '@taquito/beacon-wallet';
import { TezosToolkit } from '@taquito/taquito';

const RPC_URL = process.env.NEXT_PUBLIC_TEZOS_RPC || 'https://mainnet.api.tez.ie';
const Tezos = new TezosToolkit(RPC_URL);

let wallet;

export const getWallet = () => {
  if (typeof window === 'undefined') return null;
  if (!wallet) {
    wallet = new BeaconWallet({
      name: 'Taste',
      preferredNetwork: 'mainnet',
    });
  }
  return wallet;
};

export const connectWallet = async () => {
  try {
    const walletInstance = getWallet();
    if (!walletInstance) {
      throw new Error("Wallet unavailable");
    }
    // Force a clear of any previous stale permissions
    await walletInstance.client.clearActiveAccount();
    
    await walletInstance.requestPermissions();
    
    const address = await walletInstance.getPKH();
    return address;
  } catch (error) {
    throw error;
  }
};

export const disconnectWallet = async () => {
  const walletInstance = getWallet();
  if (!walletInstance) return;
  await walletInstance.clearActiveAccount();
};

export const getActiveAccount = async () => {
  const walletInstance = getWallet();
  if (!walletInstance) return null;
  const activeAccount = await walletInstance.client.getActiveAccount();
  return activeAccount;
};

export { Tezos };
