"use client";

import { getActiveAccount } from "@/lib/tezos";

export async function getConnectedWalletAddress(evmAddress) {
  if (evmAddress) {
    return evmAddress;
  }

  const account = await getActiveAccount();
  if (account?.address) {
    return account.address;
  }

  if (typeof window !== "undefined") {
    return localStorage.getItem("taste_wallet_address");
  }

  return null;
}

export function shortAddress(address) {
  if (!address) {
    return "Not connected";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
