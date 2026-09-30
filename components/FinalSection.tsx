"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Sparkles, Terminal, Cpu, CheckCircle2, Heart } from "lucide-react";
import confetti from "canvas-confetti";
import { birthdayData } from "@/data/birthday";

interface FinalSectionProps {
  onReplay: () => void;
  onOpenEasterEgg?: () => void;
}

export default function FinalSection({ onReplay, onOpenEasterEgg }: FinalSectionProps) {
  const [isReady, setIsReady] = useState(false);
  const [compilingStep, setCompilingStep] = useState(0);
  const [isCompiled, setIsCompiled] = useState(false);
  const [hasTriggeredCompilation, setHasTriggeredCompilation] = useState(false);

  const steps = birthdayData.final.compilingSteps;

  const startCompilationSequence = () => {
    setIsReady(true);
    if (hasTriggeredCompilation) return;
    setHasTriggeredCompilation(true);

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setCompilingStep(idx);
        if (idx === steps.length - 1) {
          setTimeout(() => {
            setIsCompiled(true);
            try {
              confetti({
                particleCount: 75,
                spread: 80,
                origin: { y: 0.65 },
                colors: ["#f59e0b", "#06b6d4", "#8b5cf6", "#10b981", "#ffffff"],
              });
            } catch {}
          }, 350);
        }
      }, (idx + 1) * 450);
    });
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 65,
        spread: 85,
        origin: { y: 0.7 },
        colors: ["#f59e0b", "#06b6d4", "#8b5cf6", "#10b981", "#ffffff"],
      });
    } catch {}
  };

  return (
    <footer className="relative min-h-[94vh] flex flex-col justify-center items-center px-4 sm:px-6 py-24 overflow-hidden text-center select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[680px] h-[340px] sm:h-[680px] bg-gradient-to-b from-amber-500/10 via-cyan-500/10 to-violet-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
        {/* Final Task Step: [ READY ] */}
        {!isReady ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#090d16]/95 border border-cyan-500/30 shadow-2xl backdrop-blur-2xl space-y-4 text-center"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 font-mono text-[11px]">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>FINAL TASK // THE_FINALE</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white font-sans">
              One final task.
            </h3>

            <p className="text-xs sm:text-sm text-zinc-400 font-sans">
              Before you continue to the final birthday moment...
            </p>

            <motion.button
              onClick={startCompilationSequence}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-500 text-white font-mono text-sm font-bold shadow-xl shadow-cyan-500/20 cursor-pointer"
            >
              [ READY ]
            </motion.button>
          </motion.div>
        ) : !isCompiled ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#090d16]/95 border border-cyan-500/30 shadow-2xl backdrop-blur-2xl space-y-4"
          >
            <div className="text-center font-mono text-xs text-amber-300 font-semibold mb-2">
              &ldquo;Okay. That&apos;s enough playing.&rdquo;
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                <Cpu className="w-3.5 h-3.5" />
                {birthdayData.final.compilingHeadline}
              </span>
              <span className="text-amber-400 font-bold">
                {steps[compilingStep]?.percent || 10}%
              </span>
            </div>

            {/* Step progress bar */}
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-400 rounded-full"
                animate={{ width: `${steps[compilingStep]?.percent || 10}%` }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </div>

            <div className="text-xs font-mono text-zinc-400 flex items-center justify-center gap-2 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>{steps[compilingStep]?.status || "Initializing..."}</span>
            </div>
          </motion.div>
        ) : (
          /* Compiled Final Surprise Reveal: Transitioning from Playful to Sincere */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            {/* Playful-to-Personal Pause Text */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8 p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm max-w-md mx-auto"
            >
              <div className="text-xs font-mono text-zinc-400">
                &ldquo;{birthdayData.interstitials.preFinal.main}&rdquo;
              </div>
              <div className="text-xs font-mono text-amber-300 font-semibold mt-1">
                &ldquo;{birthdayData.interstitials.preFinal.followUp}&rdquo;
              </div>
            </motion.div>

            {/* Status indicator */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 font-mono text-xs mb-6"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>COMPILATION SUCCESSFUL // ZERO ERRORS</span>
            </motion.div>

            {/* Big Birthday Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-tight"
            >
              {birthdayData.final.headline}
            </motion.h2>

            {/* Here's to 19 */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65 }}
              className="mt-6 text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-amber-300 via-rose-300 to-cyan-300 bg-clip-text text-transparent"
            >
              {birthdayData.final.celebrateLine}
            </motion.p>

            {/* Signature */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.85 }}
              className="mt-8 font-mono text-sm sm:text-base text-zinc-400 flex items-center gap-2"
            >
              <span>{birthdayData.final.signature}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-xs text-zinc-500">28.10.2026</span>
            </motion.div>

            {/* Action Buttons: Replay & Celebrate */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.05 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-4"
            >
              <button
                onClick={onReplay}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 text-zinc-200 hover:text-white font-mono text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                <span>{birthdayData.final.replayText}</span>
              </button>

              <button
                onClick={triggerCelebration}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-cyan-500/20 hover:from-amber-500/30 hover:to-cyan-500/30 border border-amber-500/30 text-amber-200 font-mono text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Celebrate ✨</span>
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Footer info & Easter Egg Hint */}
        <div className="mt-16 pt-8 border-t border-white/5 w-full flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-zinc-400 gap-3">
          <div className="flex items-center gap-1.5">
            <span>Built with care by Anuj for Anshika</span>
            <span>•</span>
            <span>Computer Science &apos;26</span>
          </div>

          {onOpenEasterEgg && (
            <button
              onClick={onOpenEasterEgg}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-cyan-400 transition-colors cursor-pointer"
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
