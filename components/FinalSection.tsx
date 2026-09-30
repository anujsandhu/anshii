"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Sparkles, Heart, Terminal } from "lucide-react";
import confetti from "canvas-confetti";
import { birthdayData } from "@/data/birthday";

interface FinalSectionProps {
  onReplay: () => void;
  onOpenEasterEgg?: () => void;
}

export default function FinalSection({ onReplay, onOpenEasterEgg }: FinalSectionProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleReveal = () => {
    setIsRevealed(true);
    try {
      confetti({
        particleCount: 80,
        spread: 85,
        origin: { y: 0.6 },
        colors: ["#f59e0b", "#fda4af", "#c084fc", "#38bdf8", "#fef3c7", "#ffffff"],
      });
    } catch {}
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 90,
        origin: { y: 0.65 },
        colors: ["#f59e0b", "#fda4af", "#c084fc", "#38bdf8", "#fef3c7", "#ffffff"],
      });
    } catch {}
  };

  return (
    <footer className="relative min-h-[96vh] flex flex-col justify-center items-center px-4 sm:px-6 py-28 overflow-hidden text-center select-none">
      {/* Dark Cinematic Background with Golden & Pastel Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] sm:w-[750px] h-[360px] sm:h-[750px] bg-gradient-to-tr from-amber-500/15 via-rose-500/15 via-purple-600/15 to-amber-300/10 rounded-full blur-[160px] pointer-events-none animate-soft-pulse" />
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-rose-500/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Pre-reveal prompt */}
        {!isRevealed ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full max-w-md p-8 sm:p-10 rounded-3xl playful-birthday-card border border-amber-400/30 shadow-2xl space-y-4 text-center"
          >
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-amber-400/30 bg-amber-500/15 text-amber-200 font-sans text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>The Grand Finale</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white font-sans">
              One Last Moment
            </h3>

            <p className="text-sm text-zinc-300 font-sans leading-relaxed">
              Before you wrap up exploring this little corner of the internet...
            </p>

            <motion.button
              onClick={handleReveal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-3 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 text-white font-sans text-sm font-bold shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all cursor-pointer flex items-center gap-2 mx-auto"
            >
              <Sparkles className="w-4 h-4 fill-white" />
              <span>[ OPEN FINAL SURPRISE ✨ ]</span>
            </motion.button>
          </motion.div>
        ) : (
          /* Breathtaking Sincere Birthday Reveal */
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            {/* Subtle Floating Polaroid Keepsakes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex items-center justify-center -space-x-4 sm:-space-x-6 mb-10"
            >
              <div className="w-20 sm:w-28 h-24 sm:h-32 rounded-xl overflow-hidden border-2 border-white/80 shadow-2xl -rotate-6 transform hover:rotate-0 hover:scale-110 hover:z-20 transition-all duration-300">
                <Image
                  src="/photos/photo1.jpg"
                  alt="Memory 1"
                  width={112}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-24 sm:w-32 h-28 sm:h-36 rounded-xl overflow-hidden border-2 border-white/90 shadow-2xl rotate-2 transform hover:rotate-0 hover:scale-110 hover:z-20 transition-all duration-300 z-10">
                <Image
                  src="/photos/photo4.jpg"
                  alt="Memory 2"
                  width={128}
                  height={144}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-20 sm:w-28 h-24 sm:h-32 rounded-xl overflow-hidden border-2 border-white/80 shadow-2xl rotate-8 transform hover:rotate-0 hover:scale-110 hover:z-20 transition-all duration-300">
                <Image
                  src="/photos/photo5.jpg"
                  alt="Memory 3"
                  width={112}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            {/* Conversational Pause Text */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-sm sm:text-base text-zinc-300 font-sans max-w-lg mb-6 leading-relaxed"
            >
              &ldquo;{birthdayData.interstitials.preFinal.main} {birthdayData.interstitials.preFinal.followUp}&rdquo;
            </motion.p>

            {/* Grand Birthday Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] text-white font-sans"
            >
              <span className="block text-white">Happy 19th Birthday,</span>
              <span className="bg-gradient-to-r from-amber-200 via-rose-300 via-purple-300 to-amber-200 bg-clip-text text-transparent animate-gradient-text text-glow-gold">
                Anshika.
              </span>
            </motion.h2>

            {/* Here's to 19 */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.95 }}
              className="mt-6 text-2xl sm:text-3xl font-semibold text-amber-200 font-sans"
            >
              {birthdayData.final.celebrateLine}
            </motion.p>

            {/* Warm Personal Signoff */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.15 }}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/[0.04] border border-white/10 text-sm text-zinc-300 font-sans"
            >
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/40" />
              <span>With appreciation, <strong>Anuj</strong></span>
              <span className="text-zinc-600">•</span>
              <span className="text-xs text-zinc-400">28 October 2026</span>
            </motion.div>

            {/* Action Buttons: Celebrate & Replay */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.35 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-4"
            >
              <button
                onClick={triggerCelebration}
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 hover:from-amber-300 hover:to-purple-300 text-white font-sans text-sm font-bold shadow-xl shadow-amber-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-4 h-4 fill-white" />
                <span>Celebrate Again ✨</span>
              </button>

              <button
                onClick={onReplay}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-zinc-200 hover:text-white font-sans text-sm font-semibold transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
              >
                <RotateCcw className="w-4 h-4 text-amber-300" />
                <span>{birthdayData.final.replayText}</span>
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Footer info & Subtle Easter Egg Link */}
        <div className="mt-20 pt-8 border-t border-white/5 w-full flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-3 font-sans">
          <div className="flex items-center gap-2">
            <span>Built by Anuj for Anshika</span>
            <span>•</span>
            <span>Computer Science &apos;26</span>
          </div>

          {onOpenEasterEgg && (
            <button
              onClick={onOpenEasterEgg}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-amber-300 transition-colors cursor-pointer font-mono text-[11px]"
              title="Click or press ↑ ↑ ↓ ↓ ← → ← →"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>~/secret-cli (or Konami Code)</span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
