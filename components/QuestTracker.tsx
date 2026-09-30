"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, Square, Trophy, Sparkles, X, ChevronDown, ChevronUp } from "lucide-react";
import confetti from "canvas-confetti";
import { birthdayData } from "@/data/birthday";

interface QuestTrackerProps {
  completedTasks: string[];
}

export default function QuestTracker({ completedTasks }: QuestTrackerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const tasks = birthdayData.quest.tasks;
  const completedCount = tasks.filter((t) => completedTasks.includes(t.id)).length;
  const total = tasks.length;
  const isAllDone = completedCount === total;

  return (
    <>
      {/* Floating Pill on top-left */}
      <div className="fixed top-16 left-4 z-40">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-xl shadow-xl font-mono text-xs transition-all cursor-pointer ${
            isAllDone
              ? "border-emerald-500/50 bg-emerald-950/90 text-emerald-300"
              : "border-amber-500/30 bg-[#0d131f]/95 text-amber-300 hover:text-white"
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold hidden sm:inline">BIRTHDAY QUEST:</span>
          <span className="font-bold text-white bg-amber-500/20 px-1.5 py-0.5 rounded text-[10px]">
            {completedCount} / {total}
          </span>
          {isOpen ? <ChevronUp className="w-3 h-3 text-zinc-400" /> : <ChevronDown className="w-3 h-3 text-zinc-400" />}
        </motion.button>
      </div>

      {/* Quest Drawer Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-28 left-4 z-50 w-72 sm:w-84 rounded-3xl border border-white/10 bg-[#0d131f]/95 backdrop-blur-2xl p-4 sm:p-5 shadow-2xl space-y-3 font-mono text-xs max-h-[75vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-bold text-zinc-200 flex items-center gap-1.5 text-xs sm:text-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Birthday Quest Checklist
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-zinc-400 font-sans leading-tight">
              Small optional tasks to explore throughout the page. Complete them at your own pace!
            </p>

            {/* Checklist Items */}
            <div className="space-y-2 pt-1">
              {tasks.map((task) => {
                const done = completedTasks.includes(task.id);
                return (
                  <div
                    key={task.id}
                    className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-colors ${
                      done
                        ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
                        : "bg-black/30 border-white/5 text-zinc-400"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {done ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-600" />
                      )}
                    </div>
                    <div>
                      <div className={`font-semibold text-xs ${done ? "text-emerald-300" : "text-zinc-300"}`}>
                        {task.title}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-sans mt-0.5 leading-tight">
                        {task.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 100% Completion Payoff */}
            {isAllDone && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-emerald-500/20 border border-amber-400/40 text-center space-y-1.5"
              >
                <div className="font-bold text-amber-300 text-xs flex items-center justify-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  100% BIRTHDAY EXPLORER
                </div>
                <p className="text-[11px] text-zinc-200 font-sans whitespace-pre-line leading-relaxed">
                  {birthdayData.quest.allCompletedMessage}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
