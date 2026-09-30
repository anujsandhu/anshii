"use client";

import React from "react";
import { motion } from "framer-motion";
import { RotateCcw, Heart, Sparkles, Code2, Terminal } from "lucide-react";
import confetti from "canvas-confetti";
import { birthdayData } from "@/data/birthday";

interface FinalSectionProps {
  onReplay: () => void;
  onOpenEasterEgg?: () => void;
}

export default function FinalSection({ onReplay, onOpenEasterEgg }: FinalSectionProps) {
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.7 },
        colors: ["#f59e0b", "#06b6d4", "#8b5cf6", "#10b981", "#ffffff"],
      });
    } catch {}
  };

  return (
    <footer className="relative min-h-[85vh] flex flex-col justify-center items-center px-4 sm:px-6 py-24 overflow-hidden text-center select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[650px] h-[340px] sm:h-[650px] bg-gradient-to-b from-amber-500/10 via-cyan-500/10 to-violet-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
        {/* Intro prompt */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-mono text-xs sm:text-sm text-cyan-400 tracking-wider uppercase mb-6 flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          {birthdayData.final.introText}
        </motion.p>

        {/* Big Birthday Headline */}
        <motion.h2
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-tight"
        >
          {birthdayData.final.headline}
        </motion.h2>

        {/* Here's to 19 */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-6 text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-amber-300 via-rose-300 to-cyan-300 bg-clip-text text-transparent"
        >
          {birthdayData.final.celebrateLine}
        </motion.p>

        {/* Signature */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 font-mono text-sm sm:text-base text-zinc-400 flex items-center gap-2"
        >
          <span>{birthdayData.final.signature}</span>
          <span className="text-zinc-600">•</span>
          <span className="text-xs text-zinc-500">28.10.2026</span>
        </motion.div>

        {/* Action Buttons: Replay & Celebrate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <button
            onClick={onReplay}
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 text-zinc-200 hover:text-white font-mono text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer shadow-lg"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span>{birthdayData.final.replayText}</span>
          </button>

          <button
            onClick={triggerCelebration}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-cyan-500/20 hover:from-amber-500/30 hover:to-cyan-500/30 border border-amber-500/30 text-amber-200 font-mono text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Celebrate ✨</span>
          </button>
        </motion.div>

        {/* Subtle Easter Egg Hint in footer */}
        <div className="mt-16 pt-8 border-t border-white/5 w-full flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-zinc-600 gap-3">
          <div className="flex items-center gap-1.5">
            <span>Built by Anuj for Anshika</span>
            <span>•</span>
            <span>Computer Science '26</span>
          </div>

          {onOpenEasterEgg && (
            <button
              onClick={onOpenEasterEgg}
              className="flex items-center gap-1.5 text-zinc-600 hover:text-cyan-400 transition-colors cursor-pointer"
              title="Click for developer CLI"
            >
              <Terminal className="w-3 h-3" />
              <span>~/secret-cli</span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
