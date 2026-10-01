"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles, CheckCircle2, Lock, Copy, Check } from "lucide-react";
import confetti from "canvas-confetti";
import { FloralCorner } from "@/components/flowers/FloralFrame";
import { TulipFlower, Wildflower, PetalSvg } from "@/components/flowers/FlowerSvg";

interface LetterSectionProps {
  isLocked: boolean;
  onUnlockFinal: () => void;
  finalUnlocked: boolean;
}

export default function LetterSection({
  isLocked,
  onUnlockFinal,
  finalUnlocked,
}: LetterSectionProps) {
  const [copied, setCopied] = useState(false);
  const [taskDone, setTaskDone] = useState(finalUnlocked);

  const letterText = `Dear Anshika,

Happy 19th Birthday.

I could have just sent you a standard birthday text, but building something handcrafted specifically for you felt so much more fitting.

I really appreciate having you around — from the late-night study sessions and laughing at broken code to all the spontaneous conversations and quiet moments between the chaos of college. You bring a warmth and genuine spark that makes every day brighter.

I hope year 19 is extraordinarily kind to you. I hope it brings you peace of mind, exciting opportunities, good people, and endless reasons to smile.

Have an unforgettable 19th.

— Anuj
28 October 2026`;

  const handleCopy = () => {
    navigator.clipboard.writeText(letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUnlockFinal = () => {
    if (taskDone) return;
    setTaskDone(true);
    onUnlockFinal();
    try {
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#fda4af", "#fbcfe8", "#d8b4fe", "#bae6fd"],
      });
    } catch {}
  };

  if (isLocked) {
    return (
      <section id="letter" className="py-16 px-4 max-w-3xl mx-auto text-center select-none">
        <div className="p-8 rounded-3xl bg-[#f5ede4] border border-[#e3d3c4] max-w-md mx-auto space-y-2">
          <div className="w-10 h-10 rounded-full bg-[#ebdcd0] flex items-center justify-center mx-auto text-[#786457]">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-handwriting text-2xl font-bold text-[#4a3528]">
            Letter Section Locked
          </h3>
          <p className="text-xs text-[#786457] font-sans">
            Run the 18 → 19 patch above to unlock your birthday letter! 💻
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="letter" className="relative py-20 px-4 sm:px-6 max-w-3xl mx-auto select-none">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-[#fbcfe8]/25 via-[#fed7aa]/20 to-[#d8b4fe]/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fdf2f4] border border-[#fbcfe8] text-[#be185d] font-sans text-xs mb-3 shadow-2xs">
          <span>💌</span>
          <span>A Handwritten Note</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold font-handwriting text-[#3f2e24]">
          A Note for Anshika
        </h2>
        <p className="mt-2 text-sm text-[#786457] font-sans">
          A few honest thoughts on your 19th birthday.
        </p>
      </div>

      {/* Folded Stationery Paper Card */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="paper-card-warm rounded-3xl p-8 sm:p-12 relative shadow-xl border border-[#ebdcd0] overflow-hidden"
      >
        <div className="washi-tape-pink" />

        {/* Botanical Corner Flourishes */}
        <FloralCorner
          className="absolute top-2 left-2 pointer-events-none opacity-60 z-10"
          size={36}
          color="#86efac"
          flowerColor="#fda4af"
        />
        <FloralCorner
          className="absolute bottom-2 right-2 pointer-events-none opacity-60 rotate-180 z-10"
          size={36}
          color="#86efac"
          flowerColor="#d8b4fe"
        />

        {/* Top Paper Header: Postage Stamp & Date */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#ebdcd0]">
          <div className="flex items-center gap-2 text-xs font-handwriting text-xl text-[#786457]">
            <span>To: Anshika</span>
            <span>•</span>
            <span>October 28, 2026</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-sans text-[#786457] hover:text-[#3f2e24] bg-[#f5ede4] hover:bg-[#ebdcd0] border border-[#e3d3c4] transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#10b981]" />
                <span className="text-[#065f46] font-medium">Saved!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#8c7465]" />
                <span>Save letter</span>
              </>
            )}
          </button>
        </div>

        {/* Letter Body: Warm, personal, slightly romantic, genuine */}
        <div className="space-y-5 text-[#3f2e24] font-sans text-base sm:text-lg leading-relaxed">
          <p className="font-handwriting text-3xl font-bold text-[#be185d]">
            Dear Anshika,
          </p>

          <p>
            Happy 19th Birthday.
          </p>

          <p>
            I could have just sent you a standard birthday text, but building something handcrafted specifically for you felt so much more fitting.
          </p>

          <p>
            I really appreciate having you around — from the late-night study sessions and laughing at broken code to all the spontaneous conversations and quiet moments between the chaos of college. You bring a warmth and genuine spark that makes every day brighter.
          </p>

          <p>
            I hope year 19 is extraordinarily kind to you. I hope it brings you peace of mind, exciting opportunities, good people, and endless reasons to smile.
          </p>

          <p className="pt-2 font-handwriting text-2xl text-[#be185d]">
            Have an unforgettable 19th.
          </p>

          {/* Sincere Signature */}
          <div className="pt-4 border-t border-[#ebdcd0] flex items-center justify-between">
            <div>
              <span className="font-handwriting text-3xl font-bold text-[#3f2e24] block">
                — Anuj
              </span>
              <span className="text-xs text-[#8c7465] font-sans">
                28 October 2026
              </span>
            </div>

            <div className="w-10 h-10 rounded-full bg-[#fdf2f4] flex items-center justify-center text-lg">
              🌸
            </div>
          </div>
        </div>

        {/* Final Unlock Trigger Button */}
        <div className="mt-10 pt-6 border-t border-[#ebdcd0] text-center">
          {!taskDone ? (
            <button
              onClick={handleUnlockFinal}
              className="px-8 py-3.5 rounded-2xl bg-[#fda4af] hover:bg-[#fb7185] text-[#4c0519] font-sans font-bold text-sm shadow-md transition-all cursor-pointer btn-cute inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-[#be185d] text-[#be185d]" />
              <span>[ UNLOCK THE FINAL SURPRISE ✨ ]</span>
            </button>
          ) : (
            <div className="p-3.5 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] inline-flex items-center gap-2 text-[#065f46] text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
              <span>Grand Finale Unlocked Below ↓</span>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
