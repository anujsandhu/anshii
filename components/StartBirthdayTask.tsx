"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, Flag } from "lucide-react";
import confetti from "canvas-confetti";

interface StartBirthdayTaskProps {
  onComplete: () => void;
  isCompleted: boolean;
}

export default function StartBirthdayTask({
  onComplete,
  isCompleted,
}: StartBirthdayTaskProps) {
  const [clicked, setClicked] = useState(isCompleted);

  const handleStart = () => {
    if (clicked) return;
    setClicked(true);
    onComplete();
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f59e0b", "#06b6d4", "#8b5cf6", "#10b981"],
      });
    } catch {}
  };

  return (
    <div className="py-6 px-4 max-w-xl mx-auto text-center select-none">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-panel p-5 sm:p-6 rounded-3xl border border-cyan-500/25 shadow-xl relative overflow-hidden flex flex-col items-center justify-center space-y-3"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 font-mono text-[11px]">
          <Flag className="w-3 h-3 text-cyan-400" />
          <span>TASK 01 // INITIALIZATION</span>
        </div>

        <div>
          <h4 className="text-base sm:text-lg font-bold text-white font-sans">
            First Task: Official Launch
          </h4>
          <p className="text-xs sm:text-sm text-zinc-400 font-sans mt-0.5">
            Tap the button below to officially initiate your 19th birthday runtime:
          </p>
        </div>

        {!clicked ? (
          <motion.button
            onClick={handleStart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-500 text-white font-mono text-xs sm:text-sm font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>[ START MY BIRTHDAY ]</span>
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Birthday officially started! (Quest progress: +1)</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
