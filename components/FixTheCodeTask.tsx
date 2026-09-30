"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, CheckCircle2, XCircle, Sparkles, Terminal } from "lucide-react";
import confetti from "canvas-confetti";

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
          particleCount: 45,
          spread: 60,
          origin: { y: 0.65 },
          colors: ["#10b981", "#06b6d4", "#f59e0b"],
        });
      } catch {}
    } else if (val === 18) {
      setErrorMsg("Error: 18 is deprecated as of Oct 28, 2026. Try 19!");
    } else {
      setErrorMsg("Error: 20 is scheduled for next year! Stay on 19 for now.");
    }
  };

  return (
    <div className="py-6 px-4 max-w-xl mx-auto text-center select-none">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-panel p-5 sm:p-6 rounded-3xl border border-violet-500/25 shadow-xl relative overflow-hidden flex flex-col items-center justify-center space-y-3"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-300 font-mono text-[11px]">
          <Code2 className="w-3 h-3 text-violet-400" />
          <span>TASK 04 // CODE_CHALLENGE</span>
        </div>

        <div>
          <h4 className="text-base sm:text-lg font-bold text-white font-sans">
            Debug the Birthday Code
          </h4>
          <p className="text-xs sm:text-sm text-zinc-400 font-sans mt-0.5">
            The compiler found a version discrepancy. Select the correct value:
          </p>
        </div>

        {/* Code Snippet Box */}
        <div className="w-full max-w-xs p-3.5 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs sm:text-sm text-left">
          <div className="text-zinc-500 text-[11px]">// birthday.ts</div>
          <div className="text-zinc-300 mt-1">
            <span className="text-violet-400">const</span>{" "}
            <span className="text-cyan-300">birthday</span>:{" "}
            <span className="text-amber-400">number</span> ={" "}
            <span
              className={`font-bold px-1.5 py-0.5 rounded ${
                selectedAge === 19
                  ? "bg-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/20 text-rose-300 line-through"
              }`}
            >
              {selectedAge || 18}
            </span>
            ;
          </div>
        </div>

        {/* Choice Buttons */}
        {selectedAge !== 19 ? (
          <div className="flex items-center gap-3 pt-1">
            {[18, 19, 20].map((val) => (
              <button
                key={val}
                onClick={() => handleSelect(val)}
                className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 hover:text-white font-mono text-sm font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                [ {val} ]
              </button>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Compilation successful. Version updated → 19.0 ✨</span>
          </motion.div>
        )}

        {/* Error message */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] font-mono text-amber-300 flex items-center gap-1.5"
          >
            <XCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
