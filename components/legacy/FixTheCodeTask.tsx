"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Sparkles, Cake } from "lucide-react";
import confetti from "canvas-confetti";
import { TulipFlower } from "@/components/flowers/FlowerSvg";

interface FixTheCodeTaskProps {
  onComplete: () => void;
  isCompleted: boolean;
}

export default function FixTheCodeTask({ onComplete, isCompleted }: FixTheCodeTaskProps) {
  const [selectedAge, setSelectedAge] = useState<number | null>(isCompleted ? 19 : null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelect = (val: number) => {
    if (val === 19) {
      setSelectedAge(19);
      setErrorMsg(null);
      onComplete();
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.65 },
          colors: ["#10b981", "#38bdf8", "#f59e0b", "#fda4af"],
        });
      } catch {}
    } else if (val === 18) {
      setErrorMsg("18 was great, but officially retired today. Try 19!");
    } else {
      setErrorMsg("Don't rush to 20 yet! Savor 19 first.");
    }
  };

  return (
    <div className="py-6 px-4 max-w-xl mx-auto text-center select-none">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="playful-birthday-card p-6 sm:p-7 rounded-3xl shadow-xl relative overflow-hidden flex flex-col items-center justify-center space-y-3.5 border border-purple-400/25"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-400/30 bg-purple-500/15 text-purple-200 font-sans text-xs">
          <Cake className="w-3.5 h-3.5 text-purple-300" />
          <span>Birthday Math Check</span>
        </div>

        <div>
          <h4 className="text-lg sm:text-xl font-bold text-white font-sans">
            Verify the New Age
          </h4>
          <p className="text-xs sm:text-sm text-zinc-300 font-sans mt-1">
            As of October 28, select Anshika&apos;s official new chapter:
          </p>
        </div>

        {/* Choice Buttons */}
        {selectedAge !== 19 ? (
          <div className="flex items-center gap-3 pt-1">
            {[18, 19, 20].map((val) => (
              <motion.button
                key={val}
                onClick={() => handleSelect(val)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-sans text-base font-bold transition-all cursor-pointer shadow-md"
              >
                [ {val} ]
              </motion.button>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-emerald-950/40 border border-emerald-400/40 text-emerald-300 font-sans text-sm font-semibold shadow-lg"
          >
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 15 }}
            >
              <TulipFlower size={28} color="#fda4af" accentColor="#f43f5e" />
            </motion.div>
            <span>Age verified: A flower bloomed for Year 19! ✨</span>
          </motion.div>
        )}

        {/* Playful hint message */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-sans text-amber-300 flex items-center gap-1.5 pt-1"
          >
            <XCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
