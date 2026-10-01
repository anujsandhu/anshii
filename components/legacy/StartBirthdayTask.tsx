"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, Gift } from "lucide-react";
import confetti from "canvas-confetti";
import { Wildflower } from "@/components/flowers/FlowerSvg";

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
        particleCount: 60,
        spread: 75,
        origin: { y: 0.6 },
        colors: ["#f59e0b", "#fda4af", "#c084fc", "#38bdf8", "#fef3c7"],
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
          <Gift className="w-3.5 h-3.5 text-amber-300" />
          <span>Your First Birthday Task</span>
        </div>

        <div>
          <h4 className="text-lg sm:text-xl font-bold text-white font-sans">
            Ready to Begin?
          </h4>
          <p className="text-xs sm:text-sm text-zinc-300 font-sans mt-1">
            Tap the button to officially start your 19th birthday journey:
          </p>
        </div>

        {!clicked ? (
          <motion.button
            onClick={handleStart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-1 px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 text-white font-sans text-sm font-bold shadow-xl shadow-amber-500/20 hover:shadow-amber-500/35 transition-all cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>[ START ]</span>
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-1 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-emerald-950/40 border border-emerald-400/40 text-emerald-300 font-sans text-xs sm:text-sm font-semibold shadow-lg"
          >
            <motion.div
              initial={{ scale: 0, rotate: -25 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 14 }}
            >
              <Wildflower size={22} color="#d8b4fe" accentColor="#c084fc" />
            </motion.div>
            <span>Birthday officially started! Enjoy every moment ✨</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
