"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAccount } from 'wagmi';

// Utility for Roman Numerals
const toRoman = (num) => {
  const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
  return roman[num] || "";
};

export default function Onboarding() {
  const router = useRouter();
  const { address: evmAddress } = useAccount();
  const [step, setStep] = useState(0);
  const [hoveredOption, setHoveredOption] = useState(null);
  const [answers, setAnswers] = useState({});

  const steps = [
    {
      title: "Identity",
      question: "How do you present yourself to the world?",
      options: ["Man", "Woman", "Non-Binary", "Genderqueer", "Transgender", "Agender", "Fluid", "Prefer not to say"],
      key: "identity"
    },
    {
      title: "Seeking",
      question: "Who are you seeking in this gallery?",
      options: ["Men", "Women", "Non-Binary / Fluid", "Everything and Everyone", "Just looking for Art"],
      key: "seeking"
    },
    {
      title: "Intention",
      question: "What kind of connection brings you here?",
      options: [
        "A shared journey (Long-term)",
        "A spark of inspiration (Casual)",
        "Creative companionship (Friendship)",
      ],
      key: "intention"
    },
    {
      title: "Philosophy",
      question: "Do you believe art should provoke discomfort or provide solace?",
      options: [
        "Provoke discomfort",
        "Provide solace",
        "A delicate balance of both",
      ],
      key: "philosophy"
    },
    {
      title: "Value",
      question: "When creating or collecting, what holds more value to you?",
      options: [
        "The emotional process",
        "The final aesthetic result",
        "The concept behind the piece",
      ],
      key: "value"
    },
    {
      title: "Resilience",
      question: "In a brutal bear market, what is your instinct?",
      options: [
        "Take a break and disconnect",
        "Keep creating/collecting quietly",
        "Double down and build louder",
      ],
      key: "resilience"
    },
    {
      title: "Connection",
      question: "How do you best show appreciation for someone in the community?",
      options: [
        "Collecting their work",
        "Giving them a shoutout on X",
        "Sending a private message of encouragement",
        "Collaborating with them",
      ],
      key: "connection"
    },
    {
      title: "The Algorithm",
      question: "Connect your X account to allow our AI to understand your semantic depth. We never post or sell your data.",
      options: [
        "Connect X Account",
        "Skip for now"
      ],
      key: "twitter",
      isSpecial: true
    },
  ];

  const handleNext = async (option) => {
    const currentKey = steps[step].key;
    const newAnswers = { ...answers, [currentKey]: option };
    setAnswers(newAnswers);
    setHoveredOption(null);

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      await saveOnboarding(newAnswers);
      router.push("/discover");
    }
  };

  const saveOnboarding = async (finalAnswers) => {
    try {
      let address = evmAddress;
      
      // If no EVM address, check for Tezos
      if (!address) {
        const { getActiveAccount } = await import('@/lib/tezos');
        const account = await getActiveAccount();
        if (account) address = account.address;
      }
      
      if (address) {
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: address,
            onboarding_answers: finalAnswers
          })
        });

        if (!response.ok) {
          throw new Error("Could not persist onboarding");
        }
      }
    } catch {
      // Intentionally ignore to avoid blocking navigation.
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full relative z-10">
      <div className="bg-noise" />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="w-full flex justify-between items-start absolute top-8 md:top-12 px-8 md:px-12 z-20"
      >
        <h2 className="font-editorial text-2xl tracking-widest text-white/80">TASTE</h2>
        <div className="text-micro text-white/50 mt-1">
          {toRoman(step)} / {toRoman(steps.length - 1)}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="flex flex-col items-center w-full max-w-2xl px-8 mt-24 md:mt-32"
        >
          <span className="text-micro text-[#D4AF37] mb-8">
            {steps[step].title}
          </span>
          <h1 className="font-editorial text-4xl md:text-6xl text-center mb-16 leading-tight text-white font-light">
            {steps[step].question}
          </h1>

          <div className="flex flex-col gap-6 w-full items-center">
            {steps[step].options.map((option, idx) => {
              const isConnectButton = steps[step].isSpecial && idx === 0;
              const isHovered = hoveredOption === idx;
              const isOtherHovered = hoveredOption !== null && hoveredOption !== idx;

              if (isConnectButton) {
                return (
                  <button
                    key={idx}
                    onClick={() => handleNext(option)}
                    className="flex items-center gap-4 border border-white/20 px-8 py-4 text-sm tracking-widest uppercase hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all duration-500"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.96H5.078z"></path>
                    </svg>
                    {option}
                  </button>
                )
              }

              return (
                <motion.button
                  key={idx}
                  onMouseEnter={() => setHoveredOption(idx)}
                  onMouseLeave={() => setHoveredOption(null)}
                  onClick={() => handleNext(option)}
                  className={`text-lg md:text-xl font-sans font-light tracking-wide transition-all duration-700 ${
                    isOtherHovered ? "opacity-20 blur-[2px]" : "opacity-100"
                  } ${isHovered ? "text-[#D4AF37] scale-105" : "text-white/70"}`}
                >
                  {option}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
