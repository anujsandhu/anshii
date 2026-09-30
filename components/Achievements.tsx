"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles, Check, ChevronDown, ChevronUp, Lock, X } from "lucide-react";

export interface AchievementItem {
  id: string;
  title: string;
  desc: string;
  unlocked: boolean;
}

interface AchievementsProps {
  unlockedList: string[]; // array of unlocked achievement IDs
}

export const ALL_ACHIEVEMENTS: Array<{ id: string; title: string; desc: string }> = [
  { id: "curious", title: "Officially Curious", desc: "Clicked your first hidden interaction." },
  { id: "mode", title: "Runtime Decider", desc: "Configured your Year 19 birthday mode." },
  { id: "stars", title: "Lightning Reflexes", desc: "Caught all 5 floating birthday sparks." },
  { id: "debugger", title: "Hotfix Engineer", desc: "Resolved all 4 birthday hotfixes." },
  { id: "easter_egg", title: "Root Privilege", desc: "Unlocked the secret developer CLI." },
];

export default function Achievements({ unlockedList }: AchievementsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const unlockedCount = ALL_ACHIEVEMENTS.filter((a) => unlockedList.includes(a.id)).length;
  const total = ALL_ACHIEVEMENTS.length;

  return (
    <>
      {/* Floating Pill on top/bottom left */}
      <div className="fixed top-16 left-4 z-40">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-[#0d131f]/90 backdrop-blur-xl shadow-lg font-mono text-xs text-amber-300 hover:text-white transition-all cursor-pointer"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Surprises:</span>
          <span className="font-bold text-white bg-amber-500/20 px-1.5 py-0.5 rounded text-[10px]">
            {unlockedCount}/{total}
          </span>
        </motion.button>
      </div>

      {/* Drawer Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-28 left-4 z-50 w-72 sm:w-80 rounded-2xl border border-white/10 bg-[#0d131f]/95 backdrop-blur-2xl p-4 shadow-2xl space-y-3 font-mono text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Exploration Badges
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {ALL_ACHIEVEMENTS.map((a) => {
                const isUnlocked = unlockedList.includes(a.id);
                return (
                  <div
                    key={a.id}
                    className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-colors ${
                      isUnlocked
                        ? "bg-amber-500/10 border-amber-500/30 text-zinc-100"
                        : "bg-black/30 border-white/5 text-zinc-500"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isUnlocked
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-zinc-800 text-zinc-600"
                      }`}
                    >
                      {isUnlocked ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Lock className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <div
                        className={`font-semibold text-xs ${
                          isUnlocked ? "text-amber-300" : "text-zinc-400"
                        }`}
                      >
                        {a.title}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-sans leading-tight mt-0.5">
                        {isUnlocked ? a.desc : "Locked — explore the site to reveal"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {unlockedCount === total && (
              <div className="pt-2 text-center text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                🎉 All 5 surprises discovered! You mastered the build!
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
