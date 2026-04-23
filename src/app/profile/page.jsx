"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAccount, useDisconnect } from "wagmi";
import { getProfileByAddress } from "@/lib/supabase";
import { getConnectedWalletAddress, shortAddress } from "@/lib/walletSession";
import { disconnectWallet as disconnectTezos } from "@/lib/tezos";

export default function Profile() {
  const { address: evmAddress } = useAccount();
  const { disconnect: disconnectEvm } = useDisconnect();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const walletAddress = await getConnectedWalletAddress(evmAddress);
        if (!walletAddress) {
          setError("Connect your wallet to view your aura.");
          setLoading(false);
          return;
        }

        const data = await getProfileByAddress(walletAddress);
        setProfile(data);
      } catch {
        setError("Could not load your profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [evmAddress]);

  const auraLine = profile?.onboarding_answers?.intention || "A spark of inspiration";

  const handleDisconnect = async () => {
    disconnectEvm();
    await disconnectTezos();
    localStorage.removeItem("taste_wallet_address");
    window.location.href = "/";
  };

  return (
    <div className="flex flex-col items-center w-full h-full p-6 pt-16 pb-32 overflow-y-auto z-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex justify-between items-center mb-16 px-4"
      >
        <h2 className="font-cursive text-3xl taste-gradient-text">Taste</h2>
        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Your Aura</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full flex flex-col items-center"
      >
        {/* Dynamic Aura Orb */}
        <div className="relative w-40 h-40 mb-10 flex items-center justify-center">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 90, 180, 270, 360]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#e2c083] to-[#4a3615] opacity-20 blur-[30px]"
          />
          <div className="absolute inset-2 rounded-full glass-panel border border-[#e2c083]/40 flex items-center justify-center z-10">
            <span className="font-cursive text-5xl text-[#e2c083] drop-shadow-lg">Me</span>
          </div>
        </div>

        <h1 className="font-serif text-3xl text-white mb-2 tracking-wide">
          {loading ? "Loading..." : shortAddress(profile?.wallet_address || evmAddress)}
        </h1>
        <p className="font-sans text-sm text-gray-400 mb-12 italic font-light">&quot;{auraLine}&quot;</p>
        {error && <p className="text-xs text-red-300 mb-8">{error}</p>}

        {/* Stats / Aura traits */}
        <div className="w-full grid grid-cols-2 gap-4 mb-10 px-2">
          <motion.div whileHover={{ scale: 1.05 }} className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center border border-white/5">
            <span className="text-3xl mb-3">🌙</span>
            <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#e2c083]">
              {profile?.archetype || "The Enigma"}
            </span>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center border border-white/5">
            <span className="text-3xl mb-3">💎</span>
            <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#e2c083]">
              {profile?.last_layer || "Universal"}
            </span>
          </motion.div>
        </div>

        <button className="w-full taste-button mb-6">Edit Intentions</button>
        <button
          onClick={handleDisconnect}
          className="font-sans text-[10px] uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors pb-10"
        >
          Disconnect Wallet
        </button>
      </motion.div>
    </div>
  );
}
