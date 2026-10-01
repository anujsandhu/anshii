"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star, Sparkles, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import { DaisyFlower, TulipFlower } from "@/components/flowers/FlowerSvg";

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
        particleCount: 50,
        spread: 70,
        origin: { y: 0.65 },
        colors: ["#fbbf24", "#f59e0b", "#fda4af", "#c084fc"],
      });
    } catch {}
  };

  return (
    <div className="py-6 px-4 max-w-xl mx-auto text-center select-none">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="playful-birthday-card p-6 sm:p-7 rounded-3xl shadow-xl relative overflow-hidden flex flex-col items-center justify-center space-y-3.5 border border-amber-400/25"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-400/30 bg-amber-500/15 text-amber-200 font-sans text-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Little Birthday Challenge</span>
        </div>

        <div>
          <h4 className="text-lg sm:text-xl font-bold text-white font-sans">
            Find the Hidden Star
          </h4>
          <p className="text-xs sm:text-sm text-zinc-300 font-sans mt-1">
            There&apos;s a secret lucky star floating somewhere inside this frame:
          </p>
        </div>

        {/* Discovery Arena */}
        <div className="relative w-full h-28 rounded-2xl bg-gradient-to-r from-[#141a2e] via-[#1b1c3a] to-[#17142b] border border-white/10 overflow-hidden flex items-center justify-center shadow-inner">
          {!discovered ? (
            <>
              <button
                onClick={handleStarClick}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-zinc-300 hover:text-white font-sans text-xs transition-all cursor-pointer"
              >
                [ FIND IT ]
              </button>

              {/* Twinkling hidden star */}
              <motion.button
                onClick={handleStarClick}
                animate={{
                  scale: [0.85, 1.25, 0.85],
                  rotate: [0, 45, 0],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                whileTap={{ scale: 0.8 }}
                className="absolute right-8 top-6 p-2 rounded-full hover:bg-amber-400/20 text-amber-300 transition-colors cursor-pointer"
                title="You found me!"
                aria-label="Hidden Lucky Star"
              >
                <Star className="w-6 h-6 fill-amber-300 text-amber-200 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
              </motion.button>
            </>
          ) : (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-emerald-950/40 font-sans text-sm text-emerald-300 font-semibold relative overflow-hidden"
            >
              {/* Star exploding into tiny flowers effect */}
              <div className="flex items-center gap-2">
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <DaisyFlower size={26} color="#fffbeb" accentColor="#fef08a" />
                </motion.div>
                <span>Star exploded into tiny flowers! ✨</span>
                <motion.div
                  initial={{ scale: 0, rotate: 45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                >
                  <TulipFlower size={26} color="#fda4af" accentColor="#f43f5e" />
                </motion.div>
              </div>
              <span className="text-[11px] text-zinc-400 font-normal">Lucky star collected for Year 19</span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
