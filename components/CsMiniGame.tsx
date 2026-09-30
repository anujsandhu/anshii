"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bug, CheckCircle2, Wrench, Sparkles, AlertCircle, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";
import { birthdayData } from "@/data/birthday";

export default function CsMiniGame() {
  const [fixedBugs, setFixedBugs] = useState<Record<string, boolean>>({});

  const bugs = birthdayData.debugMiniGame.bugs;
  const fixedCount = Object.keys(fixedBugs).length;
  const allFixed = fixedCount === bugs.length;

  const handleFixBug = (id: string) => {
    setFixedBugs((prev) => {
      const next = { ...prev, [id]: true };
      if (Object.keys(next).length === bugs.length) {
        // Trigger subtle confetti when all bugs are resolved
        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#10b981", "#06b6d4", "#f59e0b"],
          });
        } catch {}
      }
      return next;
    });
  };

  return (
    <section id="debugger" className="relative py-16 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 font-mono text-xs mb-3"
        >
          <Bug className="w-3.5 h-3.5 text-emerald-400" />
          <span>CS HOTFIX // RUNTIME_PATCHES</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white"
        >
          {birthdayData.debugMiniGame.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-md mx-auto font-sans"
        >
          {birthdayData.debugMiniGame.subtitle}
        </motion.p>

        {/* Progress Tracker */}
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-900/80 border border-white/10 font-mono text-xs text-zinc-300">
          {allFixed ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              All 4 issues resolved! Build v19.0 is 100% stable.
            </span>
          ) : (
            <span>
              Patches applied:{" "}
              <strong className="text-emerald-400">{fixedCount}</strong> / {bugs.length}
            </span>
          )}
        </div>
      </div>

      {/* Bug Cards List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {bugs.map((item, idx) => {
          const isFixed = !!fixedBugs[item.id];

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className={`rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between ${
                isFixed
                  ? "bg-emerald-950/20 border-emerald-500/30 shadow-lg shadow-emerald-950/30"
                  : "glass-panel border-white/10 hover:border-amber-500/30"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`font-mono text-xs px-2.5 py-0.5 rounded-md font-semibold ${
                      isFixed
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {item.bugNumber}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
                    {isFixed ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Action Needed
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold text-white text-sm sm:text-base mb-1 font-sans">
                  {item.title}
                </h3>

                <p className="text-xs font-mono text-zinc-400 mt-1">
                  {isFixed ? (
                    <span className="text-emerald-300 font-medium">
                      ✓ {item.fixedDetail}
                    </span>
                  ) : (
                    <span className="text-zinc-500">
                      Exception: Unhandled lifecycle event detected.
                    </span>
                  )}
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                {isFixed ? (
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Patch applied
                  </span>
                ) : (
                  <button
                    onClick={() => handleFixBug(item.id)}
                    className="w-full py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Wrench className="w-3.5 h-3.5 text-amber-300" />
                    <span>[ {item.fixLabel} ]</span>
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
