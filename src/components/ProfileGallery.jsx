"use client";

import { motion } from "framer-motion";

export default function ProfileGallery({ profile, onNext }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="w-full max-w-md mx-auto min-h-screen flex flex-col relative"
    >
      {/* Edge-to-Edge Hero Image Section */}
      <div className="absolute top-0 left-0 w-full h-[60vh] z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${profile.image})` }}
        />
        {/* Brutalist Gradient fading into pure black */}
        <div className="absolute inset-0 brutalist-gradient-bottom" />
      </div>

      {/* Content Section */}
      <div className="relative z-10 w-full px-8 pt-[45vh] pb-32 flex flex-col items-center text-center">
        
        <div className="mb-16">
          <h2 className="font-editorial text-5xl md:text-6xl mb-4 text-white font-light tracking-tight">{profile.name}</h2>
          <div className="flex flex-col items-center gap-1">
            <span className="text-micro text-[#D4AF37] opacity-60">Archetype</span>
            <p className="font-serif italic text-2xl text-white tracking-wide">
              {profile.archetype}
            </p>
          </div>
        </div>

        <div className="mb-16 max-w-sm">
          <p className="font-editorial text-3xl text-gray-300 leading-tight">
            "{profile.quote}"
          </p>
        </div>

        <div className="mb-20 w-full flex flex-col items-center">
          <h3 className="text-micro text-gray-600 mb-6">Aura Signature</h3>
          <div className="flex flex-col gap-3 items-center">
            {profile.tags.map((tag, idx) => (
              <span 
                key={idx}
                className="text-sm font-sans tracking-widest uppercase text-white/50 border-b border-white/10 pb-1"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

      </div>

    </motion.div>
  );
}
