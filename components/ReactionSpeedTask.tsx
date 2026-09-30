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
          particleCount: 45,
          spread: 70,
          origin: { y: 0.65 },
          colors: ["#38bdf8", "#f59e0b", "#10b981", "#fda4af"],
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
        className="playful-birthday-card p-6 sm:p-7 rounded-3xl shadow-xl relative overflow-hidden flex flex-col items-center justify-center space-y-3.5 border border-emerald-400/25"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-400/30 bg-emerald-500/15 text-emerald-200 font-sans text-xs">
          <Zap className="w-3.5 h-3.5 text-emerald-300" />
          <span>Quick Reaction Test</span>
        </div>

        <div>
          <h4 className="text-lg sm:text-xl font-bold text-white font-sans">
            Test Your Reflexes
          </h4>
          <p className="text-xs sm:text-sm text-zinc-300 font-sans mt-1">
            Tap the button as fast as you can the moment it flashes green!
          </p>
        </div>

        {/* Reaction Arena Button */}
        {gameState === "idle" && (
          <button
            onClick={startTest}
            className="px-7 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-sans text-sm font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
          >
            [ Start Reflex Test ]
          </button>
        )}

        {gameState === "waiting" && (
          <motion.button
            onClick={handleClickButton}
            className="w-full max-w-xs py-4 rounded-2xl bg-rose-950/40 border border-rose-400/40 text-rose-200 font-sans text-sm font-bold animate-pulse cursor-pointer shadow-lg"
          >
            Wait for green... Don&apos;t click!
          </motion.button>
        )}

        {gameState === "ready" && (
          <motion.button
            onClick={handleClickButton}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1.05 }}
            className="w-full max-w-xs py-4 rounded-2xl bg-emerald-400 text-zinc-950 font-sans text-lg font-black shadow-xl shadow-emerald-500/50 cursor-pointer animate-bounce"
          >
            ⚡ TAP NOW! ⚡
          </motion.button>
        )}

        {gameState === "clicked" && reactionTime !== null && (
          <div className="space-y-2 pt-1">
            <div className="font-sans text-sm font-bold text-emerald-300 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Reaction speed: {reactionTime.toFixed(3)}s</span>
            </div>
            <p className="font-sans text-xs text-zinc-300 italic">
              &ldquo;{getResponse(reactionTime)}&rdquo;
            </p>
            <button
              onClick={startTest}
              className="mt-2 inline-flex items-center gap-1 text-xs font-sans text-zinc-400 hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try again</span>
            </button>
          </div>
        )}

        {tooEarly && (
          <p className="text-xs font-sans text-amber-300">
            A bit too eager! Wait until it turns bright green.
          </p>
        )}
      </motion.div>
    </div>
  );
}
