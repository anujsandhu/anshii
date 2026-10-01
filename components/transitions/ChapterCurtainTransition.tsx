"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, ArrowDown } from "lucide-react";
import { FrameMeta } from "../ScrapbookPager";

interface ChapterCurtainTransitionProps {
  show: boolean;
  targetFrame: FrameMeta | null;
  onTransitionEnd: () => void;
}

export default function ChapterCurtainTransition({
  show,
  targetFrame,
  onTransitionEnd,
}: ChapterCurtainTransitionProps) {
  useEffect(() => {
    if (show) {
      // Entire transition lifecycle lasts ~1.3s before dissolving into next frame
      const timer = setTimeout(() => {
        onTransitionEnd();
      }, 1300);
      return () => clearTimeout(timer);
    }
  }, [show, onTransitionEnd]);

  if (!targetFrame) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="chapter-curtain"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[#fff5f5] via-[#faf7f2] to-[#fff0f3] select-none p-4 overflow-hidden pointer-events-auto"
        >
          {/* Subtle paper dot texture */}
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#e5d7c5 1.5px, transparent 1.5px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Floating animated floral petals in background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[
              { top: "15%", left: "10%", delay: 0.1, size: "text-3xl", emoji: "🌸" },
              { top: "25%", right: "12%", delay: 0.2, size: "text-4xl", emoji: "🌷" },
              { bottom: "20%", left: "15%", delay: 0.3, size: "text-2xl", emoji: "✨" },
              { bottom: "30%", right: "18%", delay: 0.15, size: "text-3xl", emoji: "🌼" },
              { top: "60%", left: "8%", delay: 0.25, size: "text-3xl", emoji: "🌻" },
              { top: "10%", right: "30%", delay: 0.35, size: "text-2xl", emoji: "🌺" },
            ].map((p, i) => (
              <motion.div
                key={i}
                initial={{ y: 40, opacity: 0, scale: 0.6 }}
                animate={{
                  y: [40, -10, 0],
                  opacity: [0, 0.8, 0.7],
                  scale: 1,
                  rotate: [0, (i % 2 === 0 ? 25 : -25)],
                }}
                transition={{
                  delay: p.delay,
                  duration: 0.9,
                  ease: "easeOut",
                }}
                className={`absolute ${p.size}`}
                style={{ top: p.top, left: p.left, right: p.right, bottom: p.bottom }}
              >
                {p.emoji}
              </motion.div>
            ))}
          </div>

          {/* Center Chapter Card */}
          <motion.div
            initial={{ scale: 0.86, y: 25, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 1.05, opacity: 0 }}
            transition={{
              delay: 0.15,
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative bg-white/95 backdrop-blur-md rounded-3xl border-2 border-[#ebdcd0] shadow-[0_25px_60px_rgba(244,63,94,0.18)] p-8 sm:p-10 max-w-sm sm:max-w-md w-full text-center flex flex-col items-center"
          >
            {/* Top Washi Tape */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-44 h-6 bg-gradient-to-r from-[#fda4af]/80 via-[#fbcfe8]/90 to-[#fed7aa]/80 shadow-xs rotate-[-1deg] border-y border-white/60 flex items-center justify-center">
              <span className="text-[10px] font-sans font-bold tracking-widest text-[#881337] uppercase">
                ✦ CHAPTER UNLOCKED ✦
              </span>
            </div>

            {/* Big Flower Icon Emblem */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="mt-2 text-5xl sm:text-6xl mb-3 filter drop-shadow-sm select-none"
            >
              {targetFrame.flowerName}
            </motion.div>

            {/* Chapter Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff0f3] border border-[#fbcfe8] text-[#be185d] font-sans text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#fb7185]" />
              <span>Chapter {targetFrame.chapter} of 09</span>
            </div>

            {/* Target Chapter Title */}
            <h2 className="font-serif italic text-3xl sm:text-4xl font-bold text-[#3f2e24] leading-tight mb-2">
              {targetFrame.title}
            </h2>

            {/* Vibe / Subtext */}
            <p className="font-sans text-xs sm:text-sm text-[#786457] font-medium max-w-xs mb-5">
              {targetFrame.vibe}
            </p>

            {/* Animated Loading Shimmer Bar */}
            <div className="w-48 h-2 bg-[#f3eae2] rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.1, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-[#fda4af] via-[#fb7185] to-[#f43f5e] rounded-full"
              />
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-sans font-semibold text-[#8c7465] mt-2.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
              <span>Entering chapter now...</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
