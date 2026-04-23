"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { connectWallet, disconnectWallet as disconnectTezos, getActiveAccount } from '@/lib/tezos';
import { analyzeCollectorArchetype } from '@/lib/tzkt';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function WalletConnection() {
  const router = useRouter();
  const [tezosAddress, setTezosAddress] = useState(null);
  const [isTezosConnecting, setIsTezosConnecting] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [connectionError, setConnectionError] = useState("");
  const [evmConnectRequested, setEvmConnectRequested] = useState(false);
  
  // EVM / Etherlink
  const { address: evmAddress, isConnected: isEvmConnected } = useAccount();
  const { connect: connectEvm } = useConnect();
  const { disconnect: disconnectEvm } = useDisconnect();

  const runAnalysis = useCallback(async (address, layer = 'tezos') => {
    try {
      localStorage.setItem("taste_wallet_address", address);
      const data = await analyzeCollectorArchetype(address);
      setAnalysis(data);
      
      // Persist to Supabase and check profile status
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          archetype: data.primaryArchetype,
          layer
        })
      });

      if (!response.ok) {
        throw new Error("Failed to persist profile");
      }

      const { profile } = await response.json();

      // Smart Redirection
      setTimeout(() => {
        if (profile?.onboarding_answers) {
          router.push('/discover');
        } else {
          router.push('/onboarding');
        }
      }, 2000); // Give them 2 seconds to see their archetype

    } catch {
      setAnalysis({ primaryArchetype: 'The Enigma' });
    }
  }, [router]);

  const checkTezos = useCallback(async () => {
    const account = await getActiveAccount();
    if (account) {
      setTezosAddress(account.address);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkTezos();
      if (evmConnectRequested && isEvmConnected && evmAddress) {
        runAnalysis(evmAddress, 'etherlink');
        setEvmConnectRequested(false);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [checkTezos, evmConnectRequested, isEvmConnected, evmAddress, runAnalysis]);

  const handleTezosConnect = async () => {
    try {
      setIsTezosConnecting(true);
      setConnectionError("");

      const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Permission request timed out")), 45000);
      });

      const addr = await Promise.race([connectWallet(), timeout]);
      setTezosAddress(addr);
      // Non-blocking analysis
      runAnalysis(addr);
    } catch {
      setConnectionError("No pudimos confirmar permisos en Kukai. Cerrala y volve a tocar Connect Beacon.");
    } finally {
      setIsTezosConnecting(false);
    }
  };

  const handleTezosDisconnect = async () => {
    await disconnectTezos();
    localStorage.removeItem("taste_wallet_address");
    setTezosAddress(null);
    setAnalysis(null);
    setConnectionError("");
  };

  const handleEvmDisconnect = () => {
    disconnectEvm();
    localStorage.removeItem("taste_wallet_address");
    setAnalysis(null);
    setConnectionError("");
    setEvmConnectRequested(false);
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="flex gap-8">
        {/* Tezos Connection */}
        <div className="flex flex-col items-center">
          <span className="text-micro text-gray-500 mb-2">Tezos L1</span>
          {tezosAddress ? (
            <button onClick={handleTezosDisconnect} className="taste-button text-gold-500">
              {tezosAddress.slice(0, 6)}...{tezosAddress.slice(-4)}
            </button>
          ) : (
            <button 
              onClick={handleTezosConnect} 
              disabled={isTezosConnecting}
              className="taste-button"
            >
              {isTezosConnecting ? 'Connecting...' : 'Connect Beacon'}
            </button>
          )}
        </div>

        {/* Etherlink Connection */}
        <div className="flex flex-col items-center">
          <span className="text-micro text-gray-500 mb-2">Etherlink L2</span>
          {isEvmConnected ? (
            <button onClick={handleEvmDisconnect} className="taste-button text-gold-500">
              {evmAddress.slice(0, 6)}...{evmAddress.slice(-4)}
            </button>
          ) : (
            <button 
              onClick={() => {
                setConnectionError("");
                setEvmConnectRequested(true);
                connectEvm({ connector: injected() });
              }}
              className="taste-button"
            >
              Connect EVM
            </button>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {connectionError && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-micro text-red-300 mt-3 text-center max-w-xs"
          >
            {connectionError}
          </motion.p>
        )}
        {analysis && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-1 mt-4"
          >
            <p className="text-micro text-accent-gold">Archetype Detected</p>
            <p className="font-serif italic text-xl text-white">{analysis.primaryArchetype}</p>
          </motion.div>
        )}
        {(tezosAddress || isEvmConnected) && !analysis && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-micro text-gray-400 mt-4 animate-pulse"
          >
            Analyzing Art Vectors...
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
