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
      eventHandlers: {
        PERMISSION_REQUEST_SUCCESS: (data) => {
          console.log('Permission granted:', data);
        },
      },
    });
  }
  return wallet;
};

export const connectWallet = async () => {
  const walletInstance = getWallet();
  await walletInstance.requestPermissions();
  const address = await walletInstance.getPKH();
  return address;
};

export const disconnectWallet = async () => {
  const walletInstance = getWallet();
  await walletInstance.clearActiveAccount();
};

export const getActiveAccount = async () => {
  const walletInstance = getWallet();
  const activeAccount = await walletInstance.client.getActiveAccount();
  return activeAccount;
};

export { Tezos };
