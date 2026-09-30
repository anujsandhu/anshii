"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Sliders } from "lucide-react";
import confetti from "canvas-confetti";
import { birthdayData } from "@/data/birthday";

interface BirthdayModeChoiceProps {
  onSelectMode?: (mode: string) => void;
}

export default function BirthdayModeChoice({ onSelectMode }: BirthdayModeChoiceProps) {
  const options = birthdayData.birthdayMode.options;
  type ModeId = (typeof options)[number]["id"];

  const [selectedMode, setSelectedMode] = useState<ModeId | null>(null);

  const handleSelect = (modeId: ModeId) => {
    setSelectedMode(modeId);
    if (onSelectMode) onSelectMode(modeId);

    try {
      confetti({
        particleCount: modeId === "cake" ? 50 : 35,
        spread: 60,
        origin: { y: 0.65 },
        colors:
          modeId === "chaos"
            ? ["#f59e0b", "#ef4444", "#8b5cf6"]
            : modeId === "sleep"
            ? ["#10b981", "#06b6d4", "#3b82f6"]
            : ["#ec4899", "#f59e0b", "#fbbf24"],
      });
    } catch {}
  };

  const currentOption = options.find((opt) => opt.id === selectedMode);

  return (
    <div className="relative py-12 px-4 max-w-2xl mx-auto text-center select-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-300 font-mono text-xs mb-3">
          <Sliders className="w-3.5 h-3.5 text-violet-400" />
          <span>TASK 03 // BIRTHDAY_DECISION</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-white font-sans mb-1">
          {birthdayData.birthdayMode.title}
        </h3>

        <p className="text-xs sm:text-sm text-zinc-400 font-sans mb-6">
          {birthdayData.birthdayMode.subtitle}
        </p>

        {/* 3 Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {options.map((opt) => {
            const isSelected = selectedMode === opt.id;
            return (
              <motion.button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`p-4 rounded-2xl border font-mono text-sm font-semibold transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                  isSelected
                    ? "bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/20"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300 hover:text-white"
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span>[ {opt.label} ]</span>
              </motion.button>
            );
          })}
        </div>

        {/* Reaction Card */}
        <AnimatePresence mode="wait">
          {currentOption && (
            <motion.div
              key={currentOption.id}
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mt-6 pt-5 border-t border-white/10 text-left bg-black/30 p-4 rounded-2xl border border-white/5 flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="font-mono text-xs text-amber-400 font-bold">
                  System Reaction: &ldquo;{currentOption.response}&rdquo;
                </div>
                <p className="font-sans text-xs sm:text-sm text-zinc-200">
                  {currentOption.reactionDetail}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
