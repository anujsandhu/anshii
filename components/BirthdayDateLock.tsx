"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import {
  calculateTimeRemaining,
  UNLOCK_TIMESTAMP_MS,
  DATE_DISPLAY,
  TIMEZONE_DISPLAY,
  getRandomAttemptMessage,
  CountdownTimeRemaining,
} from "@/lib/dateLock";

interface BirthdayDateLockProps {
  onUnlock?: () => void;
  initialServerTime?: number;
}

export default function BirthdayDateLock({
  onUnlock,
  initialServerTime,
}: BirthdayDateLockProps) {
  // Authoritative clock skew between server and client device
  // (serverTime - clientDateNow)
  const clockSkewRef = useRef<number>(
    initialServerTime ? initialServerTime - Date.now() : 0
  );

  const [timeRemaining, setTimeRemaining] = useState<CountdownTimeRemaining>(() => {
    const effectiveNow = Date.now() + clockSkewRef.current;
    return calculateTimeRemaining(effectiveNow);
  });

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockStep, setUnlockStep] = useState<0 | 1 | 2 | 3>(0);
  const [attemptMessage, setAttemptMessage] = useState<string | null>(null);
  const [lockWiggle, setLockWiggle] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check prefers-reduced-motion
  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Sync clock authoritative from /api/date-lock on mount and periodically
  const syncServerTime = useCallback(async () => {
    try {
      const startFetch = Date.now();
      const res = await fetch("/api/date-lock", { cache: "no-store" });
      const endFetch = Date.now();
      const latency = (endFetch - startFetch) / 2;

      if (res.ok) {
        const data = await res.json();
        if (data.serverTime) {
          // Calibrate clock skew accounting for half network roundtrip
          const calibratedServerTime = data.serverTime + latency;
          clockSkewRef.current = calibratedServerTime - endFetch;

          const updated = calculateTimeRemaining(calibratedServerTime);
          setTimeRemaining(updated);

          if (updated.isUnlocked) {
            handleUnlockSequence();
          }
        }
      }
    } catch {
      // Fallback gracefully maintains previous skew
    }
  }, []);

  useEffect(() => {
    syncServerTime();
    // Re-sync every 60 seconds to prevent clock drift or device tampering
    const syncInterval = setInterval(syncServerTime, 60000);
    return () => clearInterval(syncInterval);
  }, [syncServerTime]);

  // Main countdown interval (every 1000ms)
  useEffect(() => {
    if (isUnlocked) return;

    const timer = setInterval(() => {
      const currentServerTime = Date.now() + clockSkewRef.current;
      const updated = calculateTimeRemaining(currentServerTime);
      setTimeRemaining(updated);

      if (updated.isUnlocked) {
        clearInterval(timer);
        handleUnlockSequence();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isUnlocked]);

  // Unlock sequence animation
  const handleUnlockSequence = () => {
    setIsUnlocked(true);
    setUnlockStep(1); // "Okay..."

    setTimeout(() => {
      setUnlockStep(2); // "Your wait is over. 👀"
    }, 1200);

    setTimeout(() => {
      setUnlockStep(3); // 🔓 "THE DOOR IS OPEN"
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.5 },
          colors: ["#fda4af", "#fbcfe8", "#f43f5e", "#fed7aa", "#fff1f2"],
        });
      } catch {}
    }, 2400);

    // Transition smoothly to the password page
    setTimeout(() => {
      if (onUnlock) {
        onUnlock();
      }
    }, 4200);
  };

  // Playful interaction on clicking lock or cards
  const triggerAttemptInteraction = () => {
    if (isUnlocked) return;

    setLockWiggle(true);
    setTimeout(() => setLockWiggle(false), 500);

    const msg = getRandomAttemptMessage();
    setAttemptMessage(msg);

    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(() => {
      setAttemptMessage(null);
    }, 3200);
  };

  // Floating background petals configuration
  const PETALS = [
    { id: 1, left: "8%", top: "14%", delay: 0, duration: 7, size: 18, rotate: 20 },
    { id: 2, left: "88%", top: "18%", delay: 1.5, duration: 8, size: 22, rotate: -35 },
    { id: 3, left: "15%", top: "78%", delay: 0.8, duration: 7.5, size: 20, rotate: 45 },
    { id: 4, left: "82%", top: "82%", delay: 2.2, duration: 9, size: 16, rotate: -15 },
    { id: 5, left: "4%", top: "45%", delay: 3, duration: 8.5, size: 15, rotate: 60 },
    { id: 6, left: "92%", top: "52%", delay: 1.2, duration: 7.2, size: 19, rotate: -50 },
  ];

  const formatNumber = (num: number) => String(num).padStart(2, "0");

  return (
    <div
      className="relative min-h-[100dvh] w-screen flex flex-col justify-between items-center bg-[#FAF7F2] text-[#3F2E24] overflow-hidden select-none p-4 sm:p-6"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 30%, rgba(253, 164, 175, 0.12) 0%, transparent 65%),
                          radial-gradient(circle at 80% 80%, rgba(254, 215, 170, 0.10) 0%, transparent 55%)`,
      }}
    >
      {/* ── TOP HEADER (Minimalist, no nav leakage) ─────────────────────────── */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between z-20 py-2 sm:py-3">
        <div className="flex items-center gap-2">
          <span className="font-serif italic text-sm sm:text-base font-medium text-[#786457] tracking-tight">
            Anshika&apos;s 19th
          </span>
        </div>

        <button
          onClick={triggerAttemptInteraction}
          title="Birthday vault status: Locked"
          aria-label="Birthday lock status"
          className="w-8 h-8 rounded-full bg-white/80 border border-[#F7C8D0] shadow-2xs flex items-center justify-center text-sm cursor-pointer hover:bg-white hover:scale-105 active:scale-95 transition-all"
        >
          <span className="text-sm">🔒</span>
        </button>
      </header>

      {/* ── FLOATING PETALS (Disabled if prefers-reduced-motion) ─────────────── */}
      {mounted && !prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {PETALS.map((petal) => (
            <motion.div
              key={petal.id}
              className="absolute opacity-40 text-[#FDA4AF]"
              style={{
                left: petal.left,
                top: petal.top,
                fontSize: `${petal.size}px`,
              }}
              animate={{
                y: [0, -18, 0],
                rotate: [petal.rotate, petal.rotate + 15, petal.rotate],
                opacity: [0.35, 0.55, 0.35],
              }}
              transition={{
                duration: petal.duration,
                repeat: Infinity,
                delay: petal.delay,
                ease: "easeInOut",
              }}
            >
              🌸
            </motion.div>
          ))}
        </div>
      )}

      {/* ── MAIN CENTERPIECE CARD ────────────────────────────────────────────── */}
      <main className="relative z-10 w-full max-w-[520px] mx-auto my-auto flex flex-col items-center">
        {/* Subtle Playful Attempt Toast / Speech Bubble */}
        <AnimatePresence>
          {attemptMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mb-3 px-4 py-2 rounded-2xl bg-[#4A3832] text-[#FFFDF9] text-xs sm:text-sm font-sans font-medium shadow-lg border border-[#F4A9B8]/40 flex items-center gap-2 z-30"
            >
              <span>{attemptMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Card */}
        <motion.div
          animate={lockWiggle ? { x: [-6, 6, -5, 5, -2, 2, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="relative w-full rounded-3xl bg-[#FFFDF9] border-2 border-[#EBDCD0] shadow-[0_18px_45px_rgba(74,56,50,0.06)] p-6 sm:p-9 text-center overflow-hidden"
        >
          {/* Top Decorative Washi Tape */}
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#FED7AA]/80 border-b border-[#FDBA74]/50 shadow-2xs rotate-[-1.5deg] pointer-events-none rounded-xs"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 97% 50%, 100% 100%, 0 100%, 3% 50%)",
            }}
          />

          {/* Stamp Badge Top Right */}
          <div className="absolute top-4 right-4 sm:top-5 sm:right-5 px-2.5 py-1 rounded-md border border-dashed border-[#F4A9B8] bg-[#FFF0F3]/60 text-[10px] font-sans font-bold text-[#BE185D] rotate-2 tracking-wider">
            OCT 28 &apos;26
          </div>

          {/* Main Top Flower */}
          <div className="text-3xl sm:text-4xl mb-2.5 select-none animate-bounce-gentle">
            🌷
          </div>

          {/* Badge: "Something is waiting..." */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F3] border border-[#FBCFE8] text-[11px] sm:text-xs font-sans font-semibold text-[#BE185D] mb-3.5 shadow-2xs">
            <Sparkles className="w-3 h-3 text-[#F43F5E]" />
            <span>Something is waiting...</span>
          </div>

          {/* Main Heading: "Not yet. 👀" */}
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3F2E24] tracking-tight leading-tight mb-2">
            Not yet. 👀
          </h1>

          {/* Subtitle: "You found the door a little early." */}
          <p className="font-sans text-xs sm:text-sm text-[#786457] font-medium leading-relaxed">
            You found the door a little early.
          </p>

          {/* Then: "Come back on 28 October." */}
          <p className="font-sans text-xs sm:text-sm text-[#BE185D] font-semibold mt-0.5 mb-6">
            Come back on 28 October.
          </p>

          {/* ── COUNTDOWN TIMER CARDS ────────────────────────────────────────── */}
          <div className="my-3 sm:my-5">
            {/* Desktop: 4 cards in row | Mobile: 2x2 grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 max-w-md mx-auto">
              {/* DAYS */}
              <div
                onClick={triggerAttemptInteraction}
                className="group cursor-pointer rounded-2xl bg-[#FAF7F2] border border-[#EBDCD0] hover:border-[#FDA4AF] transition-all p-3 sm:p-3.5 flex flex-col items-center justify-center shadow-2xs hover:shadow-xs active:scale-95"
              >
                <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#3F2E24] tracking-tight leading-none mb-1">
                  {formatNumber(timeRemaining.days)}
                </span>
                <span className="font-sans text-[10px] sm:text-[11px] font-bold text-[#927E76] uppercase tracking-wider">
                  DAYS
                </span>
              </div>

              {/* HOURS */}
              <div
                onClick={triggerAttemptInteraction}
                className="group cursor-pointer rounded-2xl bg-[#FAF7F2] border border-[#EBDCD0] hover:border-[#FDA4AF] transition-all p-3 sm:p-3.5 flex flex-col items-center justify-center shadow-2xs hover:shadow-xs active:scale-95"
              >
                <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#3F2E24] tracking-tight leading-none mb-1">
                  {formatNumber(timeRemaining.hours)}
                </span>
                <span className="font-sans text-[10px] sm:text-[11px] font-bold text-[#927E76] uppercase tracking-wider">
                  HOURS
                </span>
              </div>

              {/* MINUTES */}
              <div
                onClick={triggerAttemptInteraction}
                className="group cursor-pointer rounded-2xl bg-[#FAF7F2] border border-[#EBDCD0] hover:border-[#FDA4AF] transition-all p-3 sm:p-3.5 flex flex-col items-center justify-center shadow-2xs hover:shadow-xs active:scale-95"
              >
                <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#3F2E24] tracking-tight leading-none mb-1">
                  {formatNumber(timeRemaining.minutes)}
                </span>
                <span className="font-sans text-[10px] sm:text-[11px] font-bold text-[#927E76] uppercase tracking-wider">
                  MINUTES
                </span>
              </div>

              {/* SECONDS (with subtle micro-animation) */}
              <div
                onClick={triggerAttemptInteraction}
                className="group cursor-pointer rounded-2xl bg-[#FAF7F2] border border-[#EBDCD0] hover:border-[#FDA4AF] transition-all p-3 sm:p-3.5 flex flex-col items-center justify-center shadow-2xs hover:shadow-xs active:scale-95"
              >
                <motion.span
                  key={timeRemaining.seconds}
                  initial={prefersReducedMotion ? false : { scale: 1.12, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="font-serif text-2xl sm:text-3xl font-extrabold text-[#BE185D] tracking-tight leading-none mb-1"
                >
                  {formatNumber(timeRemaining.seconds)}
                </motion.span>
                <span className="font-sans text-[10px] sm:text-[11px] font-bold text-[#927E76] uppercase tracking-wider">
                  SECONDS
                </span>
              </div>
            </div>

            {/* DATE LABEL */}
            <div className="mt-4 pt-3 border-t border-[#F2E8DF] flex items-center justify-center gap-2 text-xs font-sans text-[#786457]">
              <span className="font-medium">Unlocks {DATE_DISPLAY}</span>
              <span className="text-[#D1C2B8]">•</span>
              <span className="font-semibold text-[#BE185D]">{TIMEZONE_DISPLAY}</span>
            </div>
          </div>

          {/* ── PLAYFUL MESSAGES ─────────────────────────────────────────────── */}
          <div className="mt-4 pt-4 border-t border-[#F2E8DF] space-y-1">
            <p className="font-serif italic text-sm sm:text-base font-medium text-[#3F2E24]">
              &ldquo;Yes, I actually locked it. 😂&rdquo;
            </p>
            <p className="font-sans text-xs text-[#786457]">
              Knowing the password won&apos;t help you yet.
            </p>
          </div>

          {/* Interactive Lock Button Icon inside card */}
          <div className="mt-5 flex justify-center">
            <button
              onClick={triggerAttemptInteraction}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF7F2] hover:bg-[#FFF0F3] border border-[#EBDCD0] hover:border-[#FBCFE8] text-xs font-sans font-semibold text-[#786457] hover:text-[#BE185D] transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <Lock className="w-3.5 h-3.5 text-[#F43F5E]" />
              <span>Tap to check door</span>
            </button>
          </div>
        </motion.div>

        {/* ── UNLOCK ANIMATION OVERLAY (When timer hits 0) ──────────────────── */}
        <AnimatePresence>
          {isUnlocked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="max-w-md w-full p-8 rounded-3xl bg-white border-2 border-[#FDA4AF] shadow-2xl flex flex-col items-center">
                {unlockStep >= 3 ? (
                  <motion.div
                    initial={{ scale: 0.5, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="w-16 h-16 rounded-3xl bg-[#FFF0F3] border border-[#FBCFE8] flex items-center justify-center mb-4 text-[#F43F5E]"
                  >
                    <Unlock className="w-8 h-8" />
                  </motion.div>
                ) : (
                  <div className="w-16 h-16 rounded-3xl bg-[#FAF7F2] border border-[#EBDCD0] flex items-center justify-center mb-4 text-[#786457]">
                    <Lock className="w-8 h-8 animate-pulse" />
                  </div>
                )}

                {unlockStep === 1 && (
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-serif text-2xl font-bold text-[#3F2E24]"
                  >
                    Okay...
                  </motion.h2>
                )}

                {unlockStep === 2 && (
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-serif text-2xl font-bold text-[#3F2E24]"
                  >
                    Your wait is over. 👀
                  </motion.h2>
                )}

                {unlockStep >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-2"
                  >
                    <h2 className="font-serif text-3xl font-extrabold text-[#BE185D] tracking-tight">
                      THE DOOR IS OPEN
                    </h2>
                    <p className="font-sans text-xs text-[#786457]">
                      Loading your birthday surprise...
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── FOOTER: Exact Copy "See you on the other side. 🌷" ─────────────── */}
      <footer className="w-full max-w-4xl mx-auto py-3 text-center z-10">
        <p className="font-serif italic text-xs sm:text-sm text-[#786457] font-medium tracking-wide">
          See you on the other side. 🌷
        </p>
      </footer>
    </div>
  );
}
