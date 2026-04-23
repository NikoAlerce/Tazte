"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { getProfiles } from "@/lib/supabase";
import { getConnectedWalletAddress, shortAddress } from "@/lib/walletSession";

export default function Matches() {
  const { address: evmAddress } = useAccount();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    async function loadMatches() {
      try {
        const walletAddress = await getConnectedWalletAddress(evmAddress);
        const profiles = await getProfiles();

        const nextMatches = profiles
          .filter((profile) => profile.wallet_address !== walletAddress)
          .slice(0, 10)
          .map((profile, index) => ({
            id: profile.id,
            name: shortAddress(profile.wallet_address),
            lastMessage: `Shared archetype potential: ${profile.archetype || "The Enigma"}`,
            time: "Recently",
            unread: index % 2 === 0,
            image: `https://api.dicebear.com/7.x/shapes/svg?seed=${profile.wallet_address || profile.id}`,
          }));

        setMatches(nextMatches);
      } catch {
        setError("Could not load encounters.");
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, [evmAddress]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20, filter: "blur(5px)" },
    visible: { 
      opacity: 1, 
      x: 0, 
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: "easeOut" } 
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-full p-6 pt-16 pb-32 z-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex justify-between items-center mb-12 px-4"
      >
        <h2 className="font-cursive text-3xl taste-gradient-text">Taste</h2>
        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Encounters</span>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full flex flex-col gap-4"
      >
        {loading && <p className="text-xs text-gray-400">Loading encounters...</p>}
        {error && <p className="text-xs text-red-300">{error}</p>}
        {!loading && !error && matches.length === 0 && (
          <p className="text-xs text-gray-400">No encounters yet. Complete onboarding to improve matching.</p>
        )}
        {matches.map((match) => (
          <motion.div
            key={match.id}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-5 p-5 rounded-3xl glass-panel border border-white/5 hover:border-[#e2c083]/30 transition-all cursor-pointer group"
          >
            <div
              className="w-14 h-14 rounded-full bg-cover bg-center border border-white/10 group-hover:border-[#e2c083] transition-colors shadow-lg"
              style={{ backgroundImage: `url(${match.image})` }}
            />
            <div className="flex-grow">
              <div className="flex justify-between items-baseline mb-1.5">
                <h3 className="font-serif text-xl text-white tracking-wide drop-shadow-sm">{match.name}</h3>
                <span className="text-[9px] text-gray-500 font-sans tracking-[0.1em]">{match.time}</span>
              </div>
              <p className={`font-sans text-xs truncate ${match.unread ? "text-[#e2c083] font-light" : "text-gray-400 font-light"}`}>
                {match.lastMessage}
              </p>
            </div>
            {match.unread && (
              <div className="w-2 h-2 rounded-full bg-[#e2c083] shadow-[0_0_10px_rgba(226,192,131,0.5)]" />
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
