"use client";

import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: "Gallery", path: "/discover" },
    { label: "Encounters", path: "/matches" },
    { label: "Aura", path: "/profile" },
  ];

  // Don't show nav on splash or onboarding
  if (pathname === "/" || pathname === "/onboarding") return null;

  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 w-full p-6 z-50 flex justify-center pointer-events-none"
    >
      <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-[#2a2a2a] rounded-full px-8 py-4 flex gap-8 pointer-events-auto shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`font-sans text-xs tracking-[0.15em] uppercase transition-colors duration-300 ${
                isActive ? "text-[#cfaa70]" : "text-gray-500 hover:text-white"
              }`}
            >
              {item.label}
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="w-1 h-1 bg-[#cfaa70] rounded-full mx-auto mt-1"
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
