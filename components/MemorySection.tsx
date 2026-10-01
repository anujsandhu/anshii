"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Bookmark, Calendar, CheckCircle2, Lock, Sparkles, Brain, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";
import { birthdayData } from "@/data/birthday";

interface MemorySectionProps {
  isLocked: boolean;
  onUnlockBuild: () => void;
  buildUnlocked: boolean;
}

interface MatchCard {
  id: number;
  label: string;
  icon: string;
}

const INITIAL_PAIRS: MatchCard[] = [
  { id: 1, label: "Coffee", icon: "☕" },
  { id: 2, label: "Code", icon: "💻" },
  { id: 3, label: "Cake", icon: "🎂" },
  { id: 4, label: "Coffee", icon: "☕" },
  { id: 5, label: "Code", icon: "💻" },
  { id: 6, label: "Cake", icon: "🎂" },
];

export default function MemorySection({
  isLocked,
  onUnlockBuild,
  buildUnlocked,
}: MemorySectionProps) {
  const [cards, setCards] = useState<MatchCard[]>(() =>
    [...INITIAL_PAIRS].sort(() => Math.random() - 0.5)
  );
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [taskDone, setTaskDone] = useState(buildUnlocked);

  const timelineItems = birthdayData.timeline;

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
        if (nextMatched.length === cards.length && !taskDone) {
          setTaskDone(true);
          onUnlockBuild();
          try {
            confetti({
              particleCount: 50,
              spread: 75,
              origin: { y: 0.6 },
              colors: ["#fda4af", "#bbf7d0", "#bae6fd", "#fed7aa"],
            });
          } catch {}
        }
      } else {
        setTimeout(() => {
          setFlipped([]);
        }, 750);
      }
    }
  };

  const handleResetGame = () => {
    setCards([...INITIAL_PAIRS].sort(() => Math.random() - 0.5));
    setFlipped([]);
    setMatched([]);
  };

  if (isLocked) {
    return (
      <section className="py-16 px-4 max-w-4xl mx-auto text-center select-none">
        <div className="p-8 rounded-3xl bg-[#f5ede4] border border-[#e3d3c4] max-w-md mx-auto space-y-2">
          <div className="w-10 h-10 rounded-full bg-[#ebdcd0] flex items-center justify-center mx-auto text-[#786457]">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-handwriting text-2xl font-bold text-[#4a3528]">
            Memories Section Locked
          </h3>
          <p className="text-xs text-[#786457] font-sans">
            Choose a soundtrack in the mixtape above to unlock this memory chapter! 🎵
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 px-4 sm:px-6 max-w-4xl mx-auto select-none">
      {/* Background Soft Glow */}
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-tr from-[#fed7aa]/20 via-[#fbcfe8]/20 to-transparent rounded-full blur-[130px] pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fef3c7] border border-[#fde68a] text-[#92400e] font-sans text-xs mb-3 shadow-2xs">
          <Bookmark className="w-3.5 h-3.5 text-[#d97706]" />
          <span>Scrapbook Journal</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold font-handwriting text-[#3f2e24]">
          Moments Along the Way
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[#6b5546] max-w-lg mx-auto font-sans">
          A few chapters from our college memories, late nights, and laughter on the path to 19.
        </p>
      </div>

      {/* Scrapbook Milestone Entries */}
      <div className="space-y-8 relative before:absolute before:inset-0 before:left-5 sm:before:left-8 before:w-0.5 before:bg-[#e8ded1]">
        {timelineItems.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="relative pl-12 sm:pl-16 group"
          >
            {/* Flower Node Marker */}
            <div className="absolute left-2 sm:left-5 top-1.5 w-7 h-7 rounded-full bg-[#fffdfa] border-2 border-[#fda4af] flex items-center justify-center text-xs shadow-xs group-hover:scale-115 transition-transform">
              🌸
            </div>

            {/* Scrapbook Entry Card */}
            <div className="paper-card p-6 sm:p-7 rounded-3xl border border-[#ebdcd0] hover:border-[#fda4af] transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="font-handwriting text-2xl font-bold text-[#be185d]">
                  Chapter 0{item.step}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-[#8c7465] font-sans">
                  <Calendar className="w-3.5 h-3.5 text-[#fda4af]" />
                  <span>{item.date}</span>
                </div>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-[#3f2e24] font-sans mb-1.5">
                {item.title}
              </h3>
              <p className="text-sm text-[#5a4435] font-sans leading-relaxed">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Task 05: 3-Pair Memory Match Game */}
      <div className="mt-14 max-w-md mx-auto paper-card-warm p-6 rounded-3xl border border-[#ebdcd0] text-center shadow-md">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fdf2f4] border border-[#fbcfe8] text-[#be185d] font-sans text-xs mb-2">
          <Brain className="w-3.5 h-3.5" />
          <span>Mini Challenge // Task 05</span>
        </div>

        <h4 className="font-handwriting text-2xl font-bold text-[#3f2e24]">
          3-Pair Memory Match
        </h4>
        <p className="text-xs text-[#786457] font-sans mt-0.5 mb-4">
          Match the 3 essential college birthday pairs (Coffee, Code, Cake):
        </p>

        {/* 3x2 Mini Card Grid */}
        <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
          {cards.map((card, index) => {
            const isFlipped = flipped.includes(index) || matched.includes(index);
            const isMatched = matched.includes(index);

            return (
              <motion.button
                key={index}
                onClick={() => handleCardClick(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`h-20 rounded-2xl border text-2xl flex items-center justify-center transition-all cursor-pointer ${
                  isMatched
                    ? "bg-[#ecfdf5] border-[#10b981] text-[#065f46]"
                    : isFlipped
                    ? "bg-[#fdf2f4] border-[#f43f5e]"
                    : "bg-white border-[#ebdcd0] hover:border-[#fda4af] text-[#b49e91]"
                }`}
              >
                {isFlipped ? card.icon : "✨"}
              </motion.button>
            );
          })}
        </div>

        {/* Task 05 Feedback */}
        <div className="mt-4">
          {taskDone ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-3.5 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] flex flex-col items-center gap-1 text-[#065f46]"
            >
              <div className="flex items-center gap-1.5 font-sans font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                <span>TASK 05 COMPLETE ✓</span>
              </div>
              <p className="text-xs font-sans text-[#047857]">
                &ldquo;Congratulations! You did absolutely nothing productive 😂&rdquo;
              </p>
              <span className="text-[11px] text-[#059669] font-sans mt-0.5 font-medium">
                CS Birthday Patch & Letter Unlocked Below ↓
              </span>
            </motion.div>
          ) : (
            <span className="text-[11px] text-[#8c7465] font-sans">
              (Match all 3 pairs to proceed!)
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
