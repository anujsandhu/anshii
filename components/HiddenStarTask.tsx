"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Sparkles, CheckCircle2, Search } from "lucide-react";
import confetti from "canvas-confetti";

interface HiddenStarTaskProps {
  onFound: () => void;
  isFound: boolean;
}

export default function HiddenStarTask({ onFound, isFound }: HiddenStarTaskProps) {
  const [discovered, setDiscovered] = useState(isFound);

  const handleStarClick = () => {
    if (discovered) return;
    setDiscovered(true);
    onFound();
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#fbbf24", "#f59e0b", "#38bdf8"],
      });
    } catch {}
  };

  return (
    <div className="py-6 px-4 max-w-xl mx-auto text-center select-none">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-panel p-5 sm:p-6 rounded-3xl border border-amber-500/25 shadow-xl relative overflow-hidden flex flex-col items-center justify-center space-y-3"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-300 font-mono text-[11px]">
          <Search className="w-3 h-3 text-amber-400" />
          <span>TASK 02 // HIDDEN_OBJECT</span>
        </div>

        <div>
          <h4 className="text-base sm:text-lg font-bold text-white font-sans">
            Observation Challenge
          </h4>
          <p className="text-xs sm:text-sm text-zinc-400 font-sans mt-0.5">
            &ldquo;There&apos;s something hidden here... Find it.&rdquo;
          </p>
        </div>

        {/* Discovery Arena */}
        <div className="relative w-full h-24 rounded-2xl bg-black/40 border border-white/5 overflow-hidden flex items-center justify-center">
          <div className="text-[11px] font-mono text-zinc-600">
            {discovered ? "Object retrieved" : "Scanning sector for anomalies..."}
          </div>

          {!discovered ? (
            <motion.button
              onClick={handleStarClick}
              animate={{
                scale: [0.9, 1.2, 0.9],
                rotate: [0, 45, 0],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              whileTap={{ scale: 0.8 }}
              className="absolute right-6 top-5 p-2 rounded-full bg-amber-500/10 hover:bg-amber-500/30 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              title="A tiny hidden star!"
              aria-label="Hidden Star"
            >
              <Star className="w-5 h-5 fill-amber-400/80 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            </motion.button>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center gap-2 bg-emerald-950/30 font-mono text-xs text-emerald-300 font-semibold"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Found it! Explorer Mode: ON ✨</span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
