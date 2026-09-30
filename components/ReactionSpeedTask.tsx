"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Timer, Zap, CheckCircle2, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";
import { birthdayData } from "@/data/birthday";

interface ReactionSpeedTaskProps {
  onComplete: () => void;
  isCompleted: boolean;
}

export default function ReactionSpeedTask({
  onComplete,
  isCompleted,
}: ReactionSpeedTaskProps) {
  const [gameState, setGameState] = useState<"idle" | "waiting" | "ready" | "clicked">(
    isCompleted ? "clicked" : "idle"
  );
  const [reactionTime, setReactionTime] = useState<number | null>(isCompleted ? 0.38 : null);
  const [tooEarly, setTooEarly] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startTest = () => {
    setTooEarly(false);
    setGameState("waiting");

    const delay = 1200 + Math.random() * 1600;
    timerRef.current = setTimeout(() => {
      startTimeRef.current = Date.now();
      setGameState("ready");
    }, delay);
  };

  const handleClickButton = () => {
    if (gameState === "waiting") {
      if (timerRef.current) clearTimeout(timerRef.current);
      setTooEarly(true);
      setGameState("idle");
    } else if (gameState === "ready") {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setReactionTime(elapsed);
      setGameState("clicked");
      onComplete();
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.65 },
          colors: ["#38bdf8", "#f59e0b", "#10b981"],
        });
      } catch {}
    }
  };

  const getResponse = (time: number) => {
    if (time < 0.5) return birthdayData.reactionTest.responses.fast;
    if (time <= 1.0) return birthdayData.reactionTest.responses.medium;
    return birthdayData.reactionTest.responses.slow;
  };

  return (
    <div className="py-6 px-4 max-w-xl mx-auto text-center select-none">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-panel p-5 sm:p-6 rounded-3xl border border-emerald-500/25 shadow-xl relative overflow-hidden flex flex-col items-center justify-center space-y-3"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 font-mono text-[11px]">
          <Timer className="w-3 h-3 text-emerald-400" />
          <span>TASK 06 // REFLEX_TEST</span>
        </div>

        <div>
          <h4 className="text-base sm:text-lg font-bold text-white font-sans">
            Mini Reaction Test
          </h4>
          <p className="text-xs sm:text-sm text-zinc-400 font-sans mt-0.5">
            Tap the button as fast as you can the moment it turns green!
          </p>
        </div>

        {/* Reaction Arena Button */}
        {gameState === "idle" && (
          <button
            onClick={startTest}
            className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs sm:text-sm font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
          >
            [ Start Reflex Test ]
          </button>
        )}

        {gameState === "waiting" && (
          <motion.button
            onClick={handleClickButton}
            className="w-full max-w-xs py-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 font-mono text-sm font-bold animate-pulse cursor-pointer shadow-lg"
          >
            Don&apos;t click yet...
          </motion.button>
        )}

        {gameState === "ready" && (
          <motion.button
            onClick={handleClickButton}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1.05 }}
            className="w-full max-w-xs py-4 rounded-2xl bg-emerald-500 text-black font-mono text-lg font-extrabold shadow-xl shadow-emerald-500/40 cursor-pointer animate-bounce"
          >
            ⚡ NOW! TAP! ⚡
          </motion.button>
        )}

        {gameState === "clicked" && reactionTime !== null && (
          <div className="space-y-2 pt-1">
            <div className="font-mono text-sm font-bold text-emerald-400 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Reaction time: {reactionTime.toFixed(3)}s</span>
            </div>
            <p className="font-sans text-xs text-zinc-300 italic">
              &ldquo;{getResponse(reactionTime)}&rdquo;
            </p>
            <button
              onClick={startTest}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {tooEarly && (
          <p className="text-[11px] font-mono text-amber-300">
            Too eager! Wait until it flashes green and says NOW!
          </p>
        )}
      </motion.div>
    </div>
  );
}
