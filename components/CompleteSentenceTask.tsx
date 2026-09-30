"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, CheckCircle2, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { birthdayData } from "@/data/birthday";

interface CompleteSentenceTaskProps {
  onComplete: () => void;
  isCompleted: boolean;
}

export default function CompleteSentenceTask({
  onComplete,
  isCompleted,
}: CompleteSentenceTaskProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(isCompleted ? 3 : null);

  const options = birthdayData.sentenceCompletion.options;

  const handleSelect = (idx: number) => {
    setSelectedIdx(idx);
    onComplete();
    try {
      confetti({
        particleCount: 40,
        spread: 65,
        origin: { y: 0.65 },
        colors: ["#f59e0b", "#ec4899", "#8b5cf6"],
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
          <HelpCircle className="w-3 h-3 text-amber-400" />
          <span>TASK 07 // FILL_IN_THE_BLANK</span>
        </div>

        <div>
          <h4 className="text-base sm:text-lg font-bold text-white font-sans">
            Complete the Sentence
          </h4>
          <p className="text-sm sm:text-base text-amber-300 font-semibold font-sans mt-1">
            &ldquo;{birthdayData.sentenceCompletion.prompt}&rdquo;
          </p>
        </div>

        {/* 4 Choices */}
        <div className="grid grid-cols-2 gap-2.5 w-full pt-1">
          {options.map((opt, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <motion.button
                key={opt.text}
                onClick={() => handleSelect(idx)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`py-2.5 px-3 rounded-2xl border font-mono text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-500/20 border-amber-400 text-amber-200 shadow-md shadow-amber-500/20"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300"
                }`}
              >
                [ {opt.text} ]
              </motion.button>
            );
          })}
        </div>

        {selectedIdx !== null && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 pt-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>&ldquo;{options[selectedIdx].response}&rdquo;</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
