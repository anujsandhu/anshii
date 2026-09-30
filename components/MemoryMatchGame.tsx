"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, CheckCircle2, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";

interface Card {
  id: number;
  icon: string;
  label: string;
}

const INITIAL_CARDS: Card[] = [
  { id: 1, icon: "☕", label: "Coffee" },
  { id: 2, icon: "💻", label: "Code" },
  { id: 3, icon: "🎂", label: "Cake" },
  { id: 4, icon: "☕", label: "Coffee" },
  { id: 5, icon: "💻", label: "Code" },
  { id: 6, icon: "🎂", label: "Cake" },
];

export default function MemoryMatchGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [isWon, setIsWon] = useState(false);

  useEffect(() => {
    // Shuffle cards
    setCards([...INITIAL_CARDS].sort(() => Math.random() - 0.5));
  }, []);

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) {
      return;
    }

    const nextFlipped = [...flipped, index];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      const [first, second] = nextFlipped;
      if (cards[first].icon === cards[second].icon) {
        const nextMatched = [...matched, first, second];
        setMatched(nextMatched);
        setFlipped([]);
        if (nextMatched.length === cards.length) {
          setIsWon(true);
          try {
            confetti({
              particleCount: 45,
              spread: 65,
              origin: { y: 0.65 },
              colors: ["#06b6d4", "#f59e0b", "#10b981"],
            });
          } catch {}
        }
      } else {
        setTimeout(() => {
          setFlipped([]);
        }, 800);
      }
    }
  };

  const handleReset = () => {
    setCards([...INITIAL_CARDS].sort(() => Math.random() - 0.5));
    setFlipped([]);
    setMatched([]);
    setIsWon(false);
  };

  return (
    <div className="py-6 px-4 max-w-xl mx-auto text-center select-none">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-panel p-5 sm:p-6 rounded-3xl border border-pink-500/25 shadow-xl relative overflow-hidden flex flex-col items-center justify-center space-y-3"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-pink-500/20 bg-pink-500/10 text-pink-300 font-mono text-[11px]">
          <Brain className="w-3 h-3 text-pink-400" />
          <span>MINI-GAME // MEMORY_ALLOCATION</span>
        </div>

        <div>
          <h4 className="text-base sm:text-lg font-bold text-white font-sans">
            3-Pair Memory Match
          </h4>
          <p className="text-xs sm:text-sm text-zinc-400 font-sans mt-0.5">
            Match the 3 essential CS student birthday pairs:
          </p>
        </div>

        {/* 6 Cards Grid (3x2) */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-xs pt-1">
          {cards.map((card, index) => {
            const isCardFlipped = flipped.includes(index) || matched.includes(index);
            const isCardMatched = matched.includes(index);

            return (
              <motion.button
                key={index}
                onClick={() => handleCardClick(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`h-20 rounded-2xl border text-2xl font-mono flex items-center justify-center transition-all cursor-pointer ${
                  isCardMatched
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-200"
                    : isCardFlipped
                    ? "bg-cyan-500/20 border-cyan-400 text-white"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-zinc-500"
                }`}
              >
                {isCardFlipped ? card.icon : "?"}
              </motion.button>
            );
          })}
        </div>

        {isWon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-1.5 pt-2"
          >
            <div className="text-xs sm:text-sm font-mono text-emerald-400 font-bold flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Memory compiled successfully! (3/3 matched)</span>
            </div>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Play again</span>
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
