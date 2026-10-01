"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, CheckCircle2, Sparkles, Heart } from "lucide-react";
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
        particleCount: 50,
        spread: 70,
        origin: { y: 0.65 },
        colors: ["#f59e0b", "#fda4af", "#c084fc", "#38bdf8"],
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
          <span>Birthday Wishlist</span>
        </div>

        <div>
          <h4 className="text-lg sm:text-xl font-bold text-white font-sans">
            Complete the Sentence
          </h4>
          <p className="text-base sm:text-lg text-amber-300 font-semibold font-sans mt-1">
            &ldquo;{birthdayData.sentenceCompletion.prompt}&rdquo;
          </p>
        </div>

        {/* 4 Choices */}
        <div className="grid grid-cols-2 gap-3 w-full pt-1">
          {options.map((opt, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <motion.button
                key={opt.text}
                onClick={() => handleSelect(idx)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`py-3 px-3 rounded-2xl border font-sans text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-md ${
                  isSelected
                    ? "bg-amber-500/30 border-amber-300 text-white shadow-amber-500/20"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-zinc-200 hover:text-white"
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
            className="text-xs font-sans text-emerald-300 flex items-center justify-center gap-1.5 pt-1 font-medium"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>&ldquo;{options[selectedIdx].response}&rdquo;</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
