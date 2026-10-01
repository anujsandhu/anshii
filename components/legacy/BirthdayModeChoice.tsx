"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart } from "lucide-react";
import confetti from "canvas-confetti";
import { birthdayData } from "@/data/birthday";

interface BirthdayModeChoiceProps {
  onSelectMode?: (mode: string) => void;
}

export default function BirthdayModeChoice({ onSelectMode }: BirthdayModeChoiceProps) {
  const options = [
    {
      id: "cake",
      label: "CAKE",
      emoji: "🍰",
      color: "from-pink-500/20 to-rose-500/20 border-rose-400/40 text-rose-200",
      activeBg: "bg-rose-500/30 border-rose-300 text-white shadow-rose-500/30",
      response: "Correct. Obviously.",
      detail: "Cake mode confirmed: Maximum sweetness, memorable laughs, and zero caloric accountability.",
    },
    {
      id: "chaos",
      label: "CHAOS",
      emoji: "⚡",
      color: "from-amber-500/20 to-orange-500/20 border-amber-400/40 text-amber-200",
      activeBg: "bg-amber-500/30 border-amber-300 text-white shadow-amber-500/30",
      response: "I expected this.",
      detail: "Chaos mode initiated: Loud laughs, spontaneous adventures, and coding breakthroughs.",
    },
    {
      id: "peace",
      label: "PEACE",
      emoji: "🕊️",
      color: "from-sky-500/20 to-indigo-500/20 border-sky-400/40 text-sky-200",
      activeBg: "bg-sky-500/30 border-sky-300 text-white shadow-sky-500/30",
      response: "Valid and well-deserved.",
      detail: "Peace mode activated: Do-not-disturb on, cozy drinks, and zero stress allowed.",
    },
  ];

  type ModeId = (typeof options)[number]["id"];
  const [selectedMode, setSelectedMode] = useState<ModeId | null>(null);

  const handleSelect = (modeId: ModeId) => {
    setSelectedMode(modeId);
    if (onSelectMode) onSelectMode(modeId);

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.65 },
        colors:
          modeId === "chaos"
            ? ["#f59e0b", "#ef4444", "#8b5cf6"]
            : modeId === "peace"
            ? ["#38bdf8", "#818cf8", "#34d399"]
            : ["#fda4af", "#f43f5e", "#fbbf24"],
      });
    } catch {}
  };

  const currentOption = options.find((opt) => opt.id === selectedMode);

  return (
    <div className="relative py-10 px-4 max-w-2xl mx-auto text-center select-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="playful-birthday-card p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden border border-rose-300/25"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-rose-300/30 bg-rose-500/15 text-rose-200 font-sans text-xs mb-3">
          <Sparkles className="w-3.5 h-3.5 text-rose-300" />
          <span>Interactive Mood Picker</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-white font-sans mb-1">
          Choose Today&apos;s Mood
        </h3>

        <p className="text-xs sm:text-sm text-zinc-300 font-sans mb-6">
          What vibe are you setting for your 19th birthday?
        </p>

        {/* 3 Playful Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {options.map((opt) => {
            const isSelected = selectedMode === opt.id;
            return (
              <motion.button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-4 rounded-2xl border font-sans text-sm font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-2 shadow-lg ${
                  isSelected
                    ? opt.activeBg
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-zinc-200 hover:text-white"
                }`}
              >
                <span className="text-3xl filter drop-shadow">{opt.emoji}</span>
                <span className="tracking-wide">[ {opt.label} ]</span>
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
              className="mt-6 pt-5 border-t border-white/10 text-left bg-black/40 p-4 rounded-2xl border border-white/10 flex items-start gap-3 shadow-inner"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="font-sans text-xs text-amber-300 font-bold">
                  &ldquo;{currentOption.response}&rdquo;
                </div>
                <p className="font-sans text-xs sm:text-sm text-zinc-200 leading-snug">
                  {currentOption.detail}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
