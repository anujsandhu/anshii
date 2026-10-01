"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Code2, CheckCircle2, Sparkles, Terminal, Lock } from "lucide-react";
import confetti from "canvas-confetti";

interface BirthdayBuildProps {
  isLocked: boolean;
  onUnlockLetter: () => void;
  letterUnlocked: boolean;
}

export default function BirthdayBuild({
  isLocked,
  onUnlockLetter,
  letterUnlocked,
}: BirthdayBuildProps) {
  const [patched, setPatched] = useState(letterUnlocked);

  const handleRunPatch = () => {
    if (patched) return;
    setPatched(true);
    onUnlockLetter();
    try {
      confetti({
        particleCount: 50,
        spread: 75,
        origin: { y: 0.6 },
        colors: ["#10b981", "#38bdf8", "#fda4af", "#fbbf24"],
      });
    } catch {}
  };

  if (isLocked) {
    return (
      <section className="py-12 px-4 max-w-2xl mx-auto text-center select-none">
        <div className="p-8 rounded-3xl bg-[#f5ede4] border border-[#e3d3c4] space-y-2">
          <div className="w-10 h-10 rounded-full bg-[#ebdcd0] flex items-center justify-center mx-auto text-[#786457]">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-handwriting text-2xl font-bold text-[#4a3528]">
            CS Easter Egg Locked
          </h3>
          <p className="text-xs text-[#786457] font-sans">
            Complete the 3-pair memory match above to unlock the developer patch! 💻
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 max-w-2xl mx-auto select-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="paper-card-warm rounded-3xl p-6 sm:p-8 border border-[#ebdcd0] shadow-md relative text-center"
      >
        <div className="washi-tape-blue" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ecfeff] border border-[#a5f3fc] text-[#0e7490] font-mono text-[11px] mb-3">
          <Code2 className="w-3.5 h-3.5" />
          <span>CS EASTER EGG // ANUJ & ANSHIKA &apos;26</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-bold font-handwriting text-[#3f2e24]">
          Birthday v19.0 Hotfix
        </h3>
        <p className="text-xs sm:text-sm text-[#786457] font-sans mt-0.5 mb-5">
          Because we&apos;re both Computer Science students, someone had to write a script for Year 19:
        </p>

        {/* Clean, cute mini code block */}
        <div className="text-left font-mono text-xs sm:text-sm p-4 sm:p-5 rounded-2xl bg-[#2d221c] text-[#f5efe6] shadow-inner space-y-1.5 border border-[#4a372e]">
          <div className="text-[#a0897a]">// birthday_patch_2026.ts</div>
          <div>
            <span className="text-[#f472b6]">let</span> age: <span className="text-[#38bdf8]">number</span> = <span className="text-[#fbbf24]">18</span>;
          </div>
          <div>
            age<span className="text-[#f43f5e]">++</span>; <span className="text-[#a0897a]">// Increment to year 19</span>
          </div>
          <div className="pt-2 text-[#4ade80] flex items-center gap-2">
            <span>&gt;</span>
            <span>Build Status: 100% SUCCESSFUL</span>
          </div>
          <div className="text-[#fed7aa]">
            &gt; Anshika is officially 19 now.
          </div>
          <div className="text-[#94a3b8] italic text-[11px] pt-1">
            // &ldquo;No bugs detected. Somehow.&rdquo;
          </div>
        </div>

        {/* Interactive Patch Button */}
        <div className="mt-6">
          {!patched ? (
            <button
              onClick={handleRunPatch}
              className="px-6 py-2.5 rounded-xl bg-[#bae6fd] hover:bg-[#7dd3fc] text-[#0369a1] font-mono font-bold text-xs shadow-xs transition-all cursor-pointer btn-cute inline-flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0284c7]" />
              <span>[ RUN PATCH: 18 → 19 ]</span>
            </button>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-3.5 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] inline-flex flex-col items-center gap-1 text-[#065f46]"
            >
              <div className="flex items-center gap-1.5 font-sans font-semibold text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                <span>18 → 19 SUCCESSFULLY PATCHED ✓</span>
              </div>
              <p className="text-xs font-sans text-[#047857]">
                &ldquo;Zero warnings. Infinite memory allocated for good vibes.&rdquo;
              </p>
              <span className="text-[11px] text-[#059669] font-sans mt-0.5 font-medium">
                Handwritten Letter Unlocked Below ↓
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
