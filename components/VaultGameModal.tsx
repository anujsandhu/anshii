"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Trophy,
  X,
  Key,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Lock,
  Unlock,
  HelpCircle,
  Flame,
  ArrowRight,
} from "lucide-react";
import confetti from "canvas-confetti";

interface VaultGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VaultGameModal({ isOpen, onClose }: VaultGameModalProps) {
  const [currentLevel, setCurrentLevel] = useState<1 | 2 | 3 | 4>(1);

  // Level 1: Dial Combination (Target: 28 - 10 - 26)
  const [dial1, setDial1] = useState(20);
  const [dial2, setDial2] = useState(5);
  const [dial3, setDial3] = useState(20);
  const [level1Success, setLevel1Success] = useState(false);

  // Level 2: Catch the Runaway Key
  const [keyCatches, setKeyCatches] = useState(0);
  const [keyPosition, setKeyPosition] = useState({ x: 0, y: 0 });
  const [keyQuote, setKeyQuote] = useState("Catch me! 🏃‍♂️");
  const arenaRef = useRef<HTMLDivElement>(null);

  // Level 3: Trivia
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSuccess, setQuizSuccess] = useState(false);

  // Level 4: Interactive Canvas Scratchcard
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scratchedPercent, setScratchedPercent] = useState(0);
  const isScratchingRef = useRef(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentLevel(1);
      setDial1(20);
      setDial2(5);
      setDial3(20);
      setLevel1Success(false);
      setKeyCatches(0);
      setSelectedAnswer(null);
      setQuizSuccess(false);
      setScratchedPercent(0);
    }
  }, [isOpen]);

  // Check Level 1 combo
  useEffect(() => {
    if (dial1 === 28 && dial2 === 10 && dial3 === 26) {
      setLevel1Success(true);
      try {
        confetti({
          particleCount: 25,
          spread: 50,
          origin: { y: 0.6 },
          colors: ["#fda4af", "#fb7185", "#fed7aa"],
        });
      } catch {}
      setTimeout(() => {
        setCurrentLevel(2);
      }, 900);
    }
  }, [dial1, dial2, dial3]);

  // Move Runaway Key randomly
  const moveKey = () => {
    if (!arenaRef.current) return;
    const bounds = arenaRef.current.getBoundingClientRect();
    const maxX = Math.max(20, bounds.width - 70);
    const maxY = Math.max(20, bounds.height - 70);
    const newX = Math.floor(Math.random() * maxX) - maxX / 2;
    const newY = Math.floor(Math.random() * maxY) - maxY / 2;

    const quotes = [
      "Too slow! 😂",
      "Almost had me! 🙈",
      "Whoosh! 💨",
      "Keep trying! ✨",
      "Nice reflexes! 👀",
    ];
    setKeyQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    setKeyPosition({ x: newX, y: newY });
  };

  const handleKeyCatch = () => {
    const nextCatches = keyCatches + 1;
    setKeyCatches(nextCatches);
    try {
      confetti({
        particleCount: 20,
        spread: 40,
        colors: ["#fbbf24", "#f43f5e", "#fda4af"],
      });
    } catch {}

    if (nextCatches >= 3) {
      setTimeout(() => {
        setCurrentLevel(3);
      }, 700);
    } else {
      moveKey();
    }
  };

  // Level 3 Quiz selection
  const handleSelectQuiz = (idx: number) => {
    setSelectedAnswer(idx);
    setQuizSuccess(true);
    try {
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#fda4af", "#f43f5e", "#fed7aa", "#fbcfe8", "#38bdf8"],
      });
    } catch {}
    setTimeout(() => {
      setCurrentLevel(4);
    }, 1100);
  };

  // Initialize Canvas Scratchcard
  useEffect(() => {
    if (currentLevel !== 4) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw luxury gold foil coating
    const w = canvas.width;
    const h = canvas.height;
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#d4af37");
    grad.addColorStop(0.3, "#fef08a");
    grad.addColorStop(0.5, "#eab308");
    grad.addColorStop(0.8, "#fef9c3");
    grad.addColorStop(1, "#ca8a04");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Decorative stamp pattern on foil
    ctx.fillStyle = "rgba(113, 63, 18, 0.25)";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✨ SCRATCH HERE WITH LOVE ✨", w / 2, h / 2 - 8);
    ctx.font = "11px sans-serif";
    ctx.fillText("To reveal Anuj's secret note", w / 2, h / 2 + 12);
  }, [currentLevel]);

  // Scratch action
  const handleScratch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2, false);
    ctx.fill();

    setScratchedPercent((prev) => Math.min(100, prev + 3));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 26 }}
          className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#fffefc] via-[#fffbf7] to-[#fff4f6] border-2 border-[#fbcfe8] shadow-[0_25px_70px_rgba(244,63,94,0.25)] p-5 sm:p-7 text-center overflow-hidden"
        >
          {/* Decorative Corner Washi Tapes */}
          <div
            className="absolute -top-3.5 left-8 w-20 h-5 bg-[#fed7aa]/90 shadow-2xs rotate-[-3deg] pointer-events-none rounded-xs"
            style={{ clipPath: "polygon(0 0, 100% 0, 95% 50%, 100% 100%, 0 100%, 5% 50%)" }}
          />
          <div
            className="absolute -top-3.5 right-8 w-20 h-5 bg-[#fbcfe8]/90 shadow-2xs rotate-[3deg] pointer-events-none rounded-xs"
            style={{ clipPath: "polygon(0 0, 100% 0, 95% 50%, 100% 100%, 0 100%, 5% 50%)" }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 hover:bg-[#fff0f3] border border-[#fbcfe8] text-[#be185d] flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Title & Level Indicator */}
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <span className="text-xl">🔐</span>
            <span className="text-xs font-sans font-bold uppercase tracking-widest text-[#be185d]">
              Vault Crack Challenge
            </span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#3f2e24] mb-1">
            {currentLevel === 1 && "Stage 1: The Date Lock Dial ⏳"}
            {currentLevel === 2 && "Stage 2: Catch The Golden Key! 🗝️"}
            {currentLevel === 3 && "Stage 3: Identity Verification 🔍"}
            {currentLevel === 4 && "Stage 4: Master Heist Trophy 🏆"}
          </h2>

          <p className="font-sans text-xs text-[#786457] mb-4">
            {currentLevel === 1 && "Dial the secret 3-part code: [Day] - [Month] - [Year]"}
            {currentLevel === 2 && "Catch the runaway key 3 times before it escapes!"}
            {currentLevel === 3 && "Answer the security clearance question truthfully"}
            {currentLevel === 4 && "Congratulations! Scratch off your reward below"}
          </p>

          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-2 mb-5">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentLevel === step
                    ? "w-7 bg-[#f43f5e]"
                    : currentLevel > step
                    ? "w-3 bg-[#22c55e]"
                    : "w-3 bg-[#e5e7eb]"
                }`}
              />
            ))}
          </div>

          {/* ── LEVEL 1: COMBINATION DIAL ────────────────────────────────────── */}
          {currentLevel === 1 && (
            <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#ebdcd0] mb-4">
              <div className="flex items-center justify-center gap-3 sm:gap-4 my-3">
                {/* Dial 1: Day */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-sans font-bold text-[#786457] uppercase mb-1">
                    Day
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setDial1((p) => Math.max(1, p - 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-[#ebdcd0] text-[#786457] font-bold text-sm hover:bg-[#fff0f3] active:scale-90"
                    >
                      -
                    </button>
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-serif font-extrabold border-2 transition-colors ${
                        dial1 === 28
                          ? "bg-[#ecfdf5] border-[#22c55e] text-[#15803d]"
                          : "bg-white border-[#ebdcd0] text-[#3f2e24]"
                      }`}
                    >
                      {dial1}
                    </div>
                    <button
                      onClick={() => setDial1((p) => Math.min(31, p + 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-[#ebdcd0] text-[#786457] font-bold text-sm hover:bg-[#fff0f3] active:scale-90"
                    >
                      +
                    </button>
                  </div>
                </div>

                <span className="font-serif text-2xl font-bold text-[#9ca3af] mt-4">•</span>

                {/* Dial 2: Month */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-sans font-bold text-[#786457] uppercase mb-1">
                    Month
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setDial2((p) => Math.max(1, p - 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-[#ebdcd0] text-[#786457] font-bold text-sm hover:bg-[#fff0f3] active:scale-90"
                    >
                      -
                    </button>
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-serif font-extrabold border-2 transition-colors ${
                        dial2 === 10
                          ? "bg-[#ecfdf5] border-[#22c55e] text-[#15803d]"
                          : "bg-white border-[#ebdcd0] text-[#3f2e24]"
                      }`}
                    >
                      {dial2}
                    </div>
                    <button
                      onClick={() => setDial2((p) => Math.min(12, p + 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-[#ebdcd0] text-[#786457] font-bold text-sm hover:bg-[#fff0f3] active:scale-90"
                    >
                      +
                    </button>
                  </div>
                </div>

                <span className="font-serif text-2xl font-bold text-[#9ca3af] mt-4">•</span>

                {/* Dial 3: Year */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-sans font-bold text-[#786457] uppercase mb-1">
                    Year
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setDial3((p) => Math.max(20, p - 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-[#ebdcd0] text-[#786457] font-bold text-sm hover:bg-[#fff0f3] active:scale-90"
                    >
                      -
                    </button>
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-serif font-extrabold border-2 transition-colors ${
                        dial3 === 26
                          ? "bg-[#ecfdf5] border-[#22c55e] text-[#15803d]"
                          : "bg-white border-[#ebdcd0] text-[#3f2e24]"
                      }`}
                    >
                      {dial3}
                    </div>
                    <button
                      onClick={() => setDial3((p) => Math.min(30, p + 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-[#ebdcd0] text-[#786457] font-bold text-sm hover:bg-[#fff0f3] active:scale-90"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {level1Success ? (
                <div className="text-xs font-bold text-[#15803d] flex items-center justify-center gap-1.5 mt-2 animate-bounce">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                  <span>DIAL CODE CRACKED! Advancing...</span>
                </div>
              ) : (
                <div className="text-[11px] text-[#9ca3af] font-sans italic mt-2">
                  💡 Hint: Look at the unlocked date on the countdown card! (Day • Month • Year)
                </div>
              )}
            </div>
          )}

          {/* ── LEVEL 2: RUNAWAY KEY ─────────────────────────────────────────── */}
          {currentLevel === 2 && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs font-sans font-bold text-[#786457] mb-2 px-1">
                <span>Catches: {keyCatches} / 3</span>
                <span className="text-[#be185d]">{keyQuote}</span>
              </div>

              <div
                ref={arenaRef}
                className="relative w-full h-44 rounded-2xl bg-[#faf7f2] border-2 border-dashed border-[#fbcfe8] flex items-center justify-center overflow-hidden cursor-crosshair"
              >
                <motion.button
                  animate={{ x: keyPosition.x, y: keyPosition.y }}
                  transition={{ type: "spring", stiffness: 450, damping: 18 }}
                  onMouseEnter={moveKey}
                  onTouchStart={moveKey}
                  onClick={handleKeyCatch}
                  className="p-3 rounded-full bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-white shadow-lg border-2 border-white flex items-center justify-center cursor-pointer active:scale-90 hover:scale-110"
                >
                  <Key className="w-6 h-6 animate-pulse" />
                </motion.button>
              </div>

              <p className="text-[11px] text-[#9ca3af] font-sans mt-2">
                Catch the golden key before it darts away! 🏃‍♂️💨
              </p>
            </div>
          )}

          {/* ── LEVEL 3: SECURITY QUIZ ───────────────────────────────────────── */}
          {currentLevel === 3 && (
            <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#ebdcd0] mb-4 text-left">
              <span className="text-[11px] font-sans font-bold text-[#be185d] uppercase tracking-wider block mb-1">
                Security Question:
              </span>
              <p className="font-serif text-sm sm:text-base font-bold text-[#3f2e24] mb-3">
                Who has zero patience and is currently trying to break into this vault early?
              </p>

              <div className="space-y-2">
                {[
                  "A) An unauthorized Russian hacker 💻",
                  "B) A rogue AI robot 🤖",
                  "C) Anshika with zero patience 😂",
                  "D) Definitely Anshika 🌷",
                ].map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectQuiz(idx)}
                    className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm font-sans font-medium transition-all cursor-pointer ${
                      selectedAnswer === idx
                        ? "bg-[#ecfdf5] border-[#22c55e] text-[#15803d] font-bold shadow-xs"
                        : "bg-white hover:bg-[#fff0f3] border-[#ebdcd0] text-[#3f2e24]"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {quizSuccess && (
                <div className="mt-3 text-xs font-bold text-[#15803d] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                  <span>IDENTITY CONFIRMED! Master Snooper Detected! 😂</span>
                </div>
              )}
            </div>
          )}

          {/* ── LEVEL 4: MASTER HEIST TROPHY & GOLD SCRATCHCARD ──────────────── */}
          {currentLevel === 4 && (
            <div className="mb-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#fef3c7] via-[#fffbeb] to-[#fef3c7] border-2 border-[#fcd34d] mb-4 text-center shadow-xs">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#f59e0b] text-white mb-2 shadow-md">
                  <Trophy className="w-6 h-6 animate-bounce" />
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#78350f]">
                  VIP SNOOPER DIPLOMA 🥇
                </h3>
                <p className="text-xs font-sans text-[#92400e] leading-relaxed max-w-sm mx-auto">
                  Congratulations Anshika! You defeated all 3 security challenges! <br />
                  <span className="font-bold text-[#b45309]">
                    Reward: Zero early access, because October 28 is locked in stone! 😂
                  </span>
                </p>
              </div>

              {/* Interactive Canvas Scratchcard */}
              <div className="relative w-full max-w-sm mx-auto h-28 rounded-2xl overflow-hidden border-2 border-[#d4af37] shadow-md flex items-center justify-center bg-[#fff0f3]">
                {/* Secret Note underneath */}
                <div className="absolute inset-0 p-3 flex flex-col items-center justify-center text-center font-handwriting text-base sm:text-lg text-[#be185d] leading-snug">
                  <span>&ldquo;You really beat all the games to peek early? 😂</span>
                  <span className="font-bold">You&apos;re the cutest! October 28 will be so worth it, promise! ❤️&rdquo;</span>
                  <span className="text-xs font-sans font-bold text-[#9ca3af] mt-1">- Anuj</span>
                </div>

                {/* Canvas Foil Overlay */}
                <canvas
                  ref={canvasRef}
                  width={340}
                  height={112}
                  onMouseMove={(e) => {
                    if (e.buttons === 1) handleScratch(e);
                  }}
                  onTouchMove={handleScratch}
                  className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-10"
                />
              </div>

              <p className="text-[11px] text-[#786457] font-sans mt-2">
                Rub with mouse or touch to scratch off the golden foil! 🎫✨
              </p>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {currentLevel === 4 ? (
              <button
                onClick={onClose}
                className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-[#fda4af] via-[#fb7185] to-[#f43f5e] hover:brightness-110 text-white font-sans font-bold text-sm shadow-md transition-all active:scale-98 cursor-pointer"
              >
                Phew, Back to Countdown 🌷
              </button>
            ) : (
              <button
                onClick={onClose}
                className="text-xs font-sans text-[#786457] hover:text-[#be185d] py-1.5 transition-colors cursor-pointer"
              >
                Exit Game & Return
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
