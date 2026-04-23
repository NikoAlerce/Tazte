import { useState, useEffect } from 'react';
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
  
  // EVM / Etherlink
  const { address: evmAddress, isConnected: isEvmConnected } = useAccount();
  const { connect: connectEvm } = useConnect();
  const { disconnect: disconnectEvm } = useDisconnect();

  useEffect(() => {
    checkTezos();
    if (isEvmConnected && evmAddress) {
      runAnalysis(evmAddress, 'etherlink');
    }
  }, [isEvmConnected, evmAddress]);

  const checkTezos = async () => {
    const account = await getActiveAccount();
    if (account) {
      setTezosAddress(account.address);
      runAnalysis(account.address);
    }
  };

  const runAnalysis = async (address, layer = 'tezos') => {
    try {
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

      const { profile } = await response.json();

      // Smart Redirection
      setTimeout(() => {
        if (profile?.onboarding_answers) {
          router.push('/discover');
        } else {
          router.push('/onboarding');
        }
      }, 2000); // Give them 2 seconds to see their archetype

    } catch (err) {
      console.error('Analysis or Save failed', err);
      setAnalysis({ primaryArchetype: 'The Enigma' });
    }
  };

  const handleTezosConnect = async () => {
    try {
      setIsTezosConnecting(true);
      const addr = await connectWallet();
      setTezosAddress(addr);
      // Non-blocking analysis
      runAnalysis(addr);
    } catch (err) {
      console.error('Tezos connection failed', err);
      setIsTezosConnecting(false);
    }
  };

  const handleTezosDisconnect = async () => {
    await disconnectTezos();
    setTezosAddress(null);
    setAnalysis(null);
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
            <button onClick={() => disconnectEvm()} className="taste-button text-gold-500">
              {evmAddress.slice(0, 6)}...{evmAddress.slice(-4)}
            </button>
          ) : (
            <button 
              onClick={() => connectEvm({ connector: injected() })} 
              className="taste-button"
            >
              Connect EVM
            </button>
          )}
        </div>
      </div>
      
      <AnimatePresence>
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
