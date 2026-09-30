"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Trophy, RotateCcw, Target } from "lucide-react";
import confetti from "canvas-confetti";
import { birthdayData } from "@/data/birthday";

export default function StarCatcherMiniGame() {
  const [caughtStars, setCaughtStars] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const starPositions = [
    { id: 1, top: "20%", left: "15%", delay: 0 },
    { id: 2, top: "25%", left: "75%", delay: 0.2 },
    { id: 3, top: "60%", left: "30%", delay: 0.4 },
    { id: 4, top: "65%", left: "80%", delay: 0.6 },
    { id: 5, top: "45%", left: "50%", delay: 0.8 },
  ];

  const handleCatch = (id: number) => {
    if (caughtStars.includes(id)) return;

    const next = [...caughtStars, id];
    setCaughtStars(next);

    if (next.length === starPositions.length) {
      setIsCompleted(true);
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#fbbf24", "#f59e0b", "#06b6d4"],
        });
      } catch {}
    }
  };

  const handleReset = () => {
    setCaughtStars([]);
    setIsCompleted(false);
  };

  return (
    <div className="relative py-12 px-4 max-w-2xl mx-auto text-center select-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-300 font-mono text-xs mb-3">
          <Target className="w-3.5 h-3.5 text-amber-400" />
          <span>MINI-GAME // SPEED_CALIBRATION</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-white font-sans mb-1">
          {birthdayData.starCatcher.title}
        </h3>

        <p className="text-xs sm:text-sm text-zinc-400 font-sans mb-4">
          {birthdayData.starCatcher.subtitle}
        </p>

        {/* Counter */}
        <div className="font-mono text-xs text-amber-300 mb-4 flex items-center justify-center gap-1.5">
          <span>Sparks caught:</span>
          <span className="font-bold text-sm bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30">
            {caughtStars.length} / {starPositions.length}
          </span>
        </div>

        {/* Game Arena */}
        <div className="relative w-full h-56 sm:h-64 rounded-2xl bg-black/40 border border-white/10 overflow-hidden">
          <div className="absolute inset-0 bg-dot-matrix opacity-30" />

          {!isCompleted ? (
            starPositions.map((star) => {
              const isCaught = caughtStars.includes(star.id);
              if (isCaught) return null;

              return (
                <motion.button
                  key={star.id}
                  onClick={() => handleCatch(star.id)}
                  style={{ top: star.top, left: star.left }}
                  animate={{
                    y: [-6, 6, -6],
                    scale: [1, 1.15, 1],
                  }}
                  transition={{
                    duration: 2 + star.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  whileTap={{ scale: 0.8 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 p-3 rounded-full bg-amber-500/20 hover:bg-amber-500/40 border border-amber-400/50 text-amber-300 shadow-lg shadow-amber-500/30 cursor-pointer group transition-colors"
                  aria-label="Catch spark"
                >
                  <Sparkles className="w-6 h-6 animate-pulse text-amber-300 group-hover:scale-125 transition-transform" />
                </motion.button>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-emerald-950/20"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center mb-3 shadow-lg">
                <Trophy className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-base sm:text-lg mb-1">
                Reflexes Calibrated!
              </h4>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-xs font-sans">
                {birthdayData.starCatcher.winMessage}
              </p>
              <button
                onClick={handleReset}
                className="mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Play again</span>
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
