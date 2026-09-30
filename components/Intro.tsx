"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Sparkles, ChevronRight, Play, Cpu, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import { birthdayData } from "@/data/birthday";

interface IntroProps {
  onEnter: () => void;
}

export default function Intro({ onEnter }: IntroProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [bootComplete, setBootComplete] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  const bootLines = birthdayData.intro.bootLines;

  // Gentle synthesized terminal blip sound effect
  const playTerminalBeep = useCallback((freq = 520) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio not allowed yet or not supported
    }
  }, []);

  useEffect(() => {
    if (currentIndex < bootLines.length) {
      const delay = currentIndex === 0 ? 350 : currentIndex === 4 ? 600 : 380;
      const timer = setTimeout(() => {
        setLines((prev) => [...prev, bootLines[currentIndex]]);
        const nextProgress = Math.round(((currentIndex + 1) / bootLines.length) * 100);
        setProgress(nextProgress);
        playTerminalBeep(440 + currentIndex * 60);
        setCurrentIndex((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      const readyTimer = setTimeout(() => {
        setBootComplete(true);
        playTerminalBeep(880);
      }, 400);
      return () => clearTimeout(readyTimer);
    }
  }, [currentIndex, bootLines, playTerminalBeep]);

  const handleEnterClick = () => {
    setIsEntering(true);
    // Subtle particle burst upon enter
    try {
      confetti({
        particleCount: 45,
        spread: 70,
        origin: { y: 0.5 },
        colors: ["#06b6d4", "#f59e0b", "#8b5cf6", "#10b981"],
      });
    } catch {}

    setTimeout(() => {
      onEnter();
    }, 600);
  };

  const handleSkip = () => {
    setLines(bootLines);
    setProgress(100);
    setBootComplete(true);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(14px)" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#07090e] px-4 overflow-hidden"
    >
      {/* Background Matrix/Grid with gentle glowing radial gradient */}
      <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[110px] pointer-events-none" />

      <div className="relative w-full max-w-xl mx-auto z-10">
        {/* Terminal Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-white/10 bg-[#0d131f]/95 backdrop-blur-2xl shadow-2xl overflow-hidden"
        >
          {/* Mac-style Window Top Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#090d16]/90 select-none">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-600/40" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600/40" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600/40" />
              <span className="ml-3 text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                anshika.exe — bash — 80x24
              </span>
            </div>
            {!bootComplete && (
              <button
                onClick={handleSkip}
                className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                [skip boot]
              </button>
            )}
          </div>

          {/* Terminal Body */}
          <div className="p-6 font-mono text-xs sm:text-sm min-h-[340px] flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="text-zinc-500 text-xs flex items-center gap-1.5 pb-2 border-b border-white/5">
                <span className="text-emerald-400">anuj@workstation</span>
                <span className="text-zinc-600">:</span>
                <span className="text-cyan-400">~/special-builds</span>
                <span className="text-zinc-600">$</span>
                <span className="text-zinc-300">./anshika.exe --birthday-mode</span>
              </div>

              {/* Progress bar indicator */}
              <div className="py-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-cyan-400" />
                    Booting runtime environment...
                  </span>
                  <span className="text-cyan-400 font-semibold">{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-500 rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "easeOut", duration: 0.2 }}
                  />
                </div>
              </div>

              {/* Boot Output Lines */}
              <div className="space-y-1.5 pt-2">
                {lines.map((line, idx) => {
                  const isStatus = line.includes("Birthday detected: 19");
                  const isReady = line.includes("System ready.");
                  const isSurprise = line.includes("Loading surprise...");
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`flex items-start gap-2 ${
                        isStatus
                          ? "text-amber-400 font-semibold py-1 text-sm sm:text-base"
                          : isReady
                          ? "text-emerald-400 font-semibold"
                          : isSurprise
                          ? "text-violet-300 font-medium"
                          : "text-zinc-300"
                      }`}
                    >
                      <span>{line}</span>
                      {isStatus && <Sparkles className="w-4 h-4 text-amber-400 inline shrink-0 animate-pulse" />}
                      {isReady && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline shrink-0" />}
                    </motion.div>
                  );
                })}

                {!bootComplete && (
                  <div className="flex items-center gap-1 text-cyan-400 pt-1">
                    <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse" />
                  </div>
                )}
              </div>
            </div>

            {/* Ready & Enter Button Sequence */}
            <AnimatePresence>
              {bootComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="mt-6 pt-5 border-t border-white/10 flex flex-col items-center justify-center text-center space-y-3"
                >
                  <div className="text-zinc-400 text-xs sm:text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>{birthdayData.intro.readyPrompt}</span>
                  </div>

                  <motion.button
                    onClick={handleEnterClick}
                    disabled={isEntering}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative group w-full sm:w-auto px-8 py-3.5 rounded-xl font-mono text-sm font-medium text-white overflow-hidden shadow-xl transition-all duration-300 cursor-pointer"
                  >
                    {/* Glowing button gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-indigo-600 to-amber-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.3),transparent_70%)]" />
                    <div className="absolute inset-0 border border-white/20 rounded-xl" />

                    <span className="relative z-10 flex items-center justify-center gap-2.5">
                      <Play className="w-4 h-4 fill-white text-white group-hover:translate-x-0.5 transition-transform" />
                      <span>{birthdayData.intro.enterButtonText}</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </motion.button>

                  <p className="text-[11px] font-mono text-zinc-500">
                    (Starts audio & initializes interactive layers)
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer subtle tag */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center font-mono text-[11px] text-zinc-600 mt-4"
        >
          Designed & coded by {birthdayData.recipient.creatorName} for {birthdayData.recipient.name} • 2026
        </motion.p>
      </div>
    </motion.div>
  );
}
