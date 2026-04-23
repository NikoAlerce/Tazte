"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ProfileGallery from "@/components/ProfileGallery";
import { getProfiles } from "@/lib/supabase";

export default function Discover() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfiles() {
      try {
        const data = await getProfiles();
        const mappedProfiles = data.map((p) => ({
          id: p.id,
          name: p.wallet_address?.slice(0, 6) || "anon",
          role: p.archetype || "The Enigma",
          quote: "Collecting memories on the chain...",
          tags: [p.last_layer || "Universal", "Collector"],
          archetype: p.archetype || "The Enigma",
          image: `https://api.dicebear.com/7.x/shapes/svg?seed=${p.wallet_address || p.id}`,
        }));
        setProfiles(mappedProfiles);
      } catch {
        setError("Could not load profiles right now.");
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    }
    loadProfiles();
  }, []);

  const handleNext = () => {
    if (currentIndex < profiles.length) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const isFinished = currentIndex >= profiles.length && !loading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <p className="font-editorial text-2xl text-white/50 animate-pulse">Scanning the Art Sphere...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black px-8 text-center">
        <p className="font-editorial text-2xl text-white/70">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full min-h-screen relative z-10">
      <div className="bg-noise" />
      
      {/* Blurred background reflecting the current profile's vibe, but much darker */}
      {!isFinished && (
        <motion.div 
          key={`bg-${currentIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
          className="fixed inset-0 bg-cover bg-center blur-[120px] z-[-1] pointer-events-none transform scale-110"
          style={{ backgroundImage: `url(${profiles[currentIndex].image})` }}
        />
      )}

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="fixed top-0 w-full max-w-md flex justify-between items-start pt-12 px-8 z-20"
      >
        <h2 className="font-editorial text-2xl tracking-widest text-white/80">TASTE</h2>
        <div className="flex flex-col items-end">
          <span className="text-micro text-[#D4AF37] mb-1">
            Discovery
          </span>
          <span className="text-micro text-gray-500">
            {profiles.length - currentIndex} Left
          </span>
        </div>
      </motion.div>

      {/* Profile Container */}
      <div className="w-full relative flex-grow flex flex-col items-center justify-start">
        <AnimatePresence mode="wait">
          {!isFinished ? (
            <ProfileGallery 
              key={profiles[currentIndex].id} 
              profile={profiles[currentIndex]} 
              onNext={handleNext} 
            />
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ duration: 2 }}
              className="flex flex-col items-center justify-center text-center h-screen px-12"
            >
              <h3 className="font-editorial text-4xl text-white mb-8 tracking-tight">The Gallery is Empty</h3>
              <p className="text-micro text-gray-500 leading-loose">
                You have viewed all curated essences for today.<br/><br/>
                True connections require patience.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global Action Buttons - Guaranteed Viewport Fixed */}
      {!isFinished && (
        <div className="fixed bottom-[120px] left-0 w-full flex justify-center gap-4 items-center z-[9999] pointer-events-none">
          <button 
            onClick={handleNext}
            className="text-micro text-gray-400 hover:text-white transition-colors py-4 px-8 bg-black/80 backdrop-blur-md rounded-full shadow-[0_0_20px_rgba(0,0,0,0.8)] border border-white/10 pointer-events-auto"
          >
            Pass
          </button>
          
          <button 
            onClick={handleNext}
            className="text-micro text-[#D4AF37] border border-[#D4AF37]/50 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 px-10 py-4 transition-all duration-500 bg-black/90 backdrop-blur-md shadow-[0_0_30px_rgba(212,175,55,0.2)] rounded-full pointer-events-auto"
          >
            Send Invite
          </button>
        </div>
      )}

    </div>
  );
}
