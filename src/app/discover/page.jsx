"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ProfileGallery from "@/components/ProfileGallery";

export default function Discover() {
  const [profiles, setProfiles] = useState([
    {
      id: 1,
      name: "Marcus",
      role: "The Visionary",
      quote: "Code is poetry, the blockchain is the canvas where algorithms breathe.",
      tags: ["Artist", "Generative Art", "Loyal Collector", "Teia Origin"],
      archetype: "The Visionary",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    },
    {
      id: 2,
      name: "Elena",
      role: "The Grand Patron",
      quote: "Seeking light in the generative darkness. I collect what moves the soul.",
      tags: ["Collector", "High-Value Holding", "Curation Maven"],
      archetype: "The Grand Patron",
      image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2800&auto=format&fit=crop",
    },
    {
      id: 3,
      name: "Camille",
      role: "The Curator",
      quote: "The silence between the notes is where my art lives. Stillness is a luxury.",
      tags: ["Curator", "Deep Searcher", "Emerging Artist"],
      archetype: "The Curator",
      image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?q=80&w=2800&auto=format&fit=crop",
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < profiles.length) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const isFinished = currentIndex >= profiles.length;

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
