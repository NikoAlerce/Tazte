"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import WalletConnection from "@/components/WalletConnection";

export default function Splash() {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.8, delayChildren: 1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, filter: "blur(20px)" },
    visible: { 
      opacity: 1, 
      filter: "blur(0px)",
      transition: { duration: 2.5, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full relative z-10">
      <div className="bg-noise" />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center z-10 w-full"
      >
        <motion.h1 
          variants={itemVariants}
          className="font-editorial text-[6rem] leading-none text-white font-light tracking-tight mb-2"
        >
          Taste
        </motion.h1>
        
        <motion.p 
          variants={itemVariants}
          className="text-micro text-gray-500 mb-24"
        >
          High-Fidelity Connections
        </motion.p>

        <motion.div variants={itemVariants} className="mb-12">
          <WalletConnection />
        </motion.div>

        <motion.div variants={itemVariants}>
          <button 
            onClick={() => router.push("/onboarding")}
            className="text-micro text-gray-400 hover:text-white transition-colors tracking-[0.4em]"
          >
            Enter the Gallery →
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
