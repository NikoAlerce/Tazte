"use client";

import { getActiveAccount } from "@/lib/tezos";

export async function getConnectedWalletAddress(evmAddress) {
  if (evmAddress) {
    return evmAddress;
  }

  const account = await getActiveAccount();
  return account?.address || null;
}

export function shortAddress(address) {
  if (!address) {
    return "Not connected";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
