"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Laugh, Sparkles, HelpCircle, Heart } from "lucide-react";
import confetti from "canvas-confetti";
import { birthdayData } from "@/data/birthday";

export default function InteractiveSecretButton() {
  const [clickStep, setClickStep] = useState(0);
  const [showReward, setShowReward] = useState(false);

  const steps = birthdayData.secretButton.steps;

  const handleClick = () => {
    if (clickStep < steps.length) {
      setClickStep(clickStep + 1);
    } else {
      setShowReward(true);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"],
        });
      } catch {}
    }
  };

  const currentLabel =
    clickStep === 0
      ? birthdayData.secretButton.initialLabel
      : clickStep <= steps.length
      ? steps[clickStep - 1].buttonText
      : "You found the secret! 🎉";

  const currentDialogue =
    clickStep > 0 && clickStep <= steps.length
      ? steps[clickStep - 1].dialogue
      : null;

  return (
    <div className="relative py-12 px-4 max-w-xl mx-auto text-center select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span className="font-mono text-xs text-zinc-400 tracking-wider">
            INTERACTIVE MICRO-EXPERIENCE
          </span>
        </div>

        {/* Dynamic button with playful warning */}
        {!showReward ? (
          <div className="space-y-4">
            <motion.button
              key={clickStep}
              onClick={handleClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3.5 rounded-2xl font-mono text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer shadow-xl ${
                clickStep === 0
                  ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40"
                  : clickStep === 1
                  ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40"
                  : clickStep === 2
                  ? "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40"
                  : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
              }`}
            >
              <span>{currentLabel}</span>
            </motion.button>

            {currentDialogue && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-mono text-zinc-300 italic"
              >
                &ldquo;{currentDialogue}&rdquo;
              </motion.p>
            )}

            <p className="text-[11px] font-mono text-zinc-500">
              (Anuj left this button unmonitored... click at your own risk)
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>

            <h4 className="text-base sm:text-lg font-bold text-white font-sans">
              Curiosity Rewarded!
            </h4>

            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans px-2">
              {birthdayData.secretButton.reward}
            </p>

            <button
              onClick={() => {
                setShowReward(false);
                setClickStep(0);
              }}
              className="mt-4 text-[11px] font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              [reset button]
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
