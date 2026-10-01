"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowLeft, Sparkles } from "lucide-react";

interface LockedSkipTransitionProps {
  show: boolean;
  onClose: () => void;
  currentFrameIndex: number;
  chapterTitle: string;
  taskHint?: string;
  customMessage?: string;
}

const LOCKED_TITLES = [
  "Nuh-uh, madam! 👀",
  "Hold on, Anshika! 🙈",
  "No skipping ahead! 🌷",
  "Wait a second! ✨",
  "Locked for now! 🔒",
];

const DEFAULT_TASK_HINTS: Record<number, string> = {
  0: "Pick 'Yes' or 'Obviously' to start your scrapbook! ✨",
  1: "Tap the blooming flower button to mark your attendance! 🌸",
  2: "Find and collect the secret heart sticker on the polaroids! 💖",
  3: "Select your favorite birthday mixtape soundtrack! 🎵",
  4: "Answer the web development CS quiz question! 💻",
  5: "Scratch the card to reveal the hidden surprise! 🎟️",
  6: "Read through the letter to unlock the grand finale! 💌",
  7: "Grand finale unlocked! 🌸",
};

export default function LockedSkipTransition({
  show,
  onClose,
  currentFrameIndex,
  chapterTitle,
  taskHint,
  customMessage,
}: LockedSkipTransitionProps) {
  const [headline, setHeadline] = useState(LOCKED_TITLES[0]);

  useEffect(() => {
    if (show) {
      setHeadline(
        LOCKED_TITLES[Math.floor(Math.random() * LOCKED_TITLES.length)]
      );

      // Auto-dismiss after 2.6 seconds (strictly 2 to 3 sec display)
      const timer = setTimeout(() => {
        onClose();
      }, 2600);

      // Subtle mobile haptic vibration
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([40, 60, 40]);
      }

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const activeHint =
    taskHint ||
    DEFAULT_TASK_HINTS[currentFrameIndex] ||
    "Complete this task to unlock the next chapter!";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2b1e17]/50 backdrop-blur-md select-none cursor-pointer"
        >
          {/* Animated Locked Card Container - overflow-visible ensures washi tape is not clipped */}
          <motion.div
            initial={{ scale: 0.88, y: 24, rotate: -1.5 }}
            animate={{
              scale: 1,
              y: 0,
              rotate: 0,
              transition: {
                type: "spring",
                damping: 20,
                stiffness: 300,
              },
            }}
            exit={{ scale: 0.9, y: -16, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm sm:max-w-md bg-[#fffdfa] rounded-3xl border-2 border-[#fecdd3] shadow-[0_25px_60px_rgba(244,63,94,0.22)] pt-8 pb-6 px-6 sm:px-8 flex flex-col items-center text-center cursor-default overflow-visible"
          >
            {/* Top Washi Tape Warning - Centered & Overhanging with zero clipping */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-44 h-7 bg-gradient-to-r from-[#fda4af] via-[#fb7185] to-[#f43f5e] shadow-md -rotate-[1deg] flex items-center justify-center border-y border-white/70 rounded-xs z-20">
              <span className="text-[10px] font-sans font-extrabold tracking-widest text-white uppercase drop-shadow-xs">
                ✦ CHAPTER LOCKED ✦
              </span>
            </div>

            {/* Subtle Scrapbook Corner Stickers with balanced padding */}
            <span className="absolute top-3.5 left-4 text-sm opacity-40 select-none pointer-events-none">🌸</span>
            <span className="absolute top-3.5 right-4 text-sm opacity-40 select-none pointer-events-none">🌷</span>
            <span className="absolute bottom-3.5 left-4 text-sm opacity-35 select-none pointer-events-none">✨</span>
            <span className="absolute bottom-3.5 right-4 text-sm opacity-35 select-none pointer-events-none">🔒</span>

            {/* Animated Wobbling Padlock Badge */}
            <motion.div
              animate={{
                rotate: [0, -8, 8, -5, 5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                repeatDelay: 1.8,
                ease: "easeInOut",
              }}
              className="mt-1 w-16 h-16 rounded-2xl bg-gradient-to-b from-[#fff1f2] to-[#ffe4e6] border-2 border-[#fecdd3] flex items-center justify-center text-[#e11d48] shadow-[0_4px_14px_rgba(244,63,94,0.12)] mb-3"
            >
              <Lock className="w-7 h-7" />
            </motion.div>

            {/* Playful Heading */}
            <h2 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#881337] leading-tight px-1">
              {headline}
            </h2>

            {/* Custom or randomized message */}
            <p className="font-handwriting text-lg sm:text-xl text-[#5c4033] mt-1 mb-3.5">
              {customMessage || "Pehle task toh karo ji 🌷"}
            </p>

            {/* Current Chapter Task Box with refined alignment & badge */}
            <div className="w-full p-4 sm:p-4.5 rounded-2xl bg-[#fff8f6] border border-[#fbcfe8] text-center my-1 shadow-2xs">
              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-0.5 rounded-full bg-[#fdf2f4] border border-[#fecdd3] text-[10px] font-sans font-bold uppercase tracking-wider text-[#be185d] mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#fb7185]" />
                <span>To unlock next chapter:</span>
              </div>
              <p className="text-xs sm:text-sm font-sans font-semibold text-[#4a3528] leading-relaxed max-w-[280px] sm:max-w-xs mx-auto">
                {activeHint}
              </p>
            </div>

            {/* Dismiss / Return Button */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-3.5 w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#fda4af] to-[#fb7185] hover:from-[#fb7185] hover:to-[#f43f5e] text-[#4c0519] hover:text-white font-sans font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer btn-cute active:scale-[0.98]"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span>Okay fine, let me do the task! 🌸</span>
            </motion.button>

            <span className="text-[11px] text-[#a89080] font-sans mt-2.5">
              Tap anywhere to return to {chapterTitle}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
