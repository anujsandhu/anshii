"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Unlock,
  Sparkles,
  ShieldAlert,
  Terminal,
  Skull,
  Flame,
  MessageCircle,
  Eye,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  calculateTimeRemaining,
  DATE_DISPLAY,
  TIMEZONE_DISPLAY,
  getRandomAttemptMessage,
  CountdownTimeRemaining,
} from "@/lib/dateLock";

interface BirthdayDateLockProps {
  onUnlock?: () => void;
  initialServerTime?: number;
}

const HACKER_PRANK_MESSAGES = [
  "Nice try. Even NASA can't bypass this before the 28th. 😂",
  "🚨 ALERT: Anshika caught trying to hack her own birthday surprise!",
  "Access Denied: Firewall protected by Anuj's anti-snooping protocol. 🛡️",
  "Error 403: Birthday snooper detected. Go away and come back on Oct 28! 👀",
  "Decryption attempt failed. Security level: MAXIMUM ANUJ DEFENSE. 😂",
  "Bro, it's NOT opening early. Stop pressing the button! 😭",
  "October 28. Mark the calendar. Not today, Anshika! 🌷",
  "Your IP has been logged into the 'Impatient People Hall of Fame' 🏆😂",
  "Trying to break into your own birthday vault? Nice try. 😂",
];

export default function BirthdayDateLock({
  onUnlock,
  initialServerTime,
}: BirthdayDateLockProps) {
  // Authoritative clock skew between server and client device
  const clockSkewRef = useRef<number>(
    initialServerTime ? initialServerTime - Date.now() : 0
  );

  const [timeRemaining, setTimeRemaining] = useState<CountdownTimeRemaining>(() => {
    const effectiveNow = Date.now() + clockSkewRef.current;
    return calculateTimeRemaining(effectiveNow);
  });

  // Scary hacker prank layer visibility (initial layer before reveal)
  const [showHackerLayer, setShowHackerLayer] = useState(true);
  const [glitchActive, setGlitchActive] = useState(false);
  const [prankAlert, setPrankAlert] = useState<string | null>(null);

  // Normal scrapbook countdown states
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockStep, setUnlockStep] = useState<0 | 1 | 2 | 3>(0);
  const [attemptMessage, setAttemptMessage] = useState<string | null>(null);
  const [lockWiggle, setLockWiggle] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Simulated live hacker terminal logs
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "INITIALIZING SYSTEM BREACH PROTOCOL...",
    "Target identified: [ANSHIKA_DEVICE] (Turning 19 on Oct 28)",
    "Bypassing camera & mic... REJECTED (Relax, we don't do that 😂)",
    "Locating 19th birthday surprise... [ENCRYPTED - AES-256]",
  ]);
  const [hackProgress, setHackProgress] = useState(48);

  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set browser tab title without giving birthday clues away
  useEffect(() => {
    document.title = "Not yet. 👀 | Anshika";
  }, []);

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

  // Play subtle high-tech synthesizer beeps
  const playHackerBeep = (freq = 480, duration = 0.07) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.025, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  };

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
          const calibratedServerTime = data.serverTime + latency;
          clockSkewRef.current = calibratedServerTime - endFetch;

          const updated = calculateTimeRemaining(calibratedServerTime);
          setTimeRemaining(updated);

          if (updated.isUnlocked) {
            handleUnlockSequence();
          }
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    syncServerTime();
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

  // Terminal log simulation in prank layer
  useEffect(() => {
    const stream = [
      "Accessing personal photo cache... [LOCKED]",
      "Birthday firewall engaged: ANUJ-SEC-V2",
      "Manual crack attempt: PASSWORD_BYPASS -> FAILED [403]",
      "Defense status: Timelock active until Oct 28 00:00 IST",
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < stream.length && stream[i]) {
        const nextLog = stream[i];
        setTerminalLogs((prev) => [...prev.slice(-4), nextLog]);
        setHackProgress((p) => Math.min(99, p + 13));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Unlock sequence animation when timer reaches zero on 28 Oct
  const handleUnlockSequence = () => {
    setIsUnlocked(true);
    setShowHackerLayer(false);
    document.title = "Happy 19th Birthday, Anshika ✨ | Made with ❤️ by Anuj";

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

    setTimeout(() => {
      if (onUnlock) {
        onUnlock();
      }
    }, 4200);
  };

  // Playful interaction on clicking lock or cards in the cute layout
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

  // Trigger funny hacker crack attempt inside the prank layer
  const handleBypassAttempt = () => {
    playHackerBeep(880, 0.1);
    setGlitchActive(true);
    setTimeout(() => setGlitchActive(false), 500);

    const randomMsg =
      HACKER_PRANK_MESSAGES[
        Math.floor(Math.random() * HACKER_PRANK_MESSAGES.length)
      ];
    setPrankAlert(randomMsg);

    setTerminalLogs((prev) => [
      ...prev.slice(-3),
      `> MANUAL HACK ATTEMPT BY USER -> REJECTED ❌`,
      `> ${randomMsg}`,
    ]);

    setTimeout(() => setPrankAlert(null), 3800);
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

  const whatsappMessage = encodeURIComponent(
    "Anuj wtf is this website 😭 why does it say I got hacked?! please give me the password early 😂"
  );
  const whatsappUrl = `https://wa.me/918278710552?text=${whatsappMessage}`;

  return (
    <div
      className="relative min-h-[100dvh] w-screen flex flex-col justify-between items-center bg-[#FAF7F2] text-[#3F2E24] overflow-hidden select-none p-4 sm:p-6"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 30%, rgba(253, 164, 175, 0.12) 0%, transparent 65%),
                          radial-gradient(circle at 80% 80%, rgba(254, 215, 170, 0.10) 0%, transparent 55%)`,
      }}
    >
      {/* ── TOP HEADER (Minimalist, zero clues, no chapter tags) ─────────────── */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between z-20 py-2 sm:py-3">
        <div className="flex items-center gap-2">
          <span className="font-serif italic text-sm sm:text-base font-medium text-[#786457] tracking-tight">
            Anshika&apos;s 19th
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHackerLayer(true)}
            title="View Security Breach Prank"
            className="px-2.5 py-1 rounded-full bg-white/80 hover:bg-white border border-[#F7C8D0] shadow-2xs text-[11px] font-sans font-medium text-[#BE185D] flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#ef4444]" />
            <span className="hidden sm:inline">Security Alert</span>
          </button>

          <button
            onClick={triggerAttemptInteraction}
            title="Birthday vault status: Locked"
            aria-label="Birthday lock status"
            className="w-8 h-8 rounded-full bg-white/80 border border-[#F7C8D0] shadow-2xs flex items-center justify-center text-sm cursor-pointer hover:bg-white hover:scale-105 active:scale-95 transition-all"
          >
            <span className="text-sm">🔒</span>
          </button>
        </div>
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

      {/* ── RESTORED ORIGINAL CUTE CENTERPIECE CARD ──────────────────────────── */}
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

        {/* The Cute Scrapbook Card */}
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

          {/* ── COUNTDOWN TIMER CARDS (Restored Original Layout) ──────────────── */}
          <div className="my-3 sm:my-5">
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

              {/* SECONDS */}
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

          {/* Interactive Door Checking Buttons */}
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              onClick={() => setShowHackerLayer(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#FAF7F2] hover:bg-[#FFF0F3] border border-[#EBDCD0] hover:border-[#FBCFE8] text-xs font-sans font-semibold text-[#786457] hover:text-[#BE185D] transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <Lock className="w-3.5 h-3.5 text-[#F43F5E]" />
              <span>Tap to check door</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#FAF7F2] hover:bg-[#F0FDF4] border border-[#EBDCD0] hover:border-[#BBF7D0] text-xs font-sans font-semibold text-[#786457] hover:text-[#16A34A] transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Ask Anuj on WhatsApp</span>
            </a>
          </div>
        </motion.div>

        {/* ── UNLOCK ANIMATION OVERLAY (When timer hits 0 on Oct 28) ──────────── */}
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

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="w-full max-w-4xl mx-auto py-3 text-center z-10">
        <p className="font-serif italic text-xs sm:text-sm text-[#786457] font-medium tracking-wide">
          See you on the other side. 🌷
        </p>
      </footer>

      {/* ── THE EXTRA LAYER: SCARY HACKER DATA BREACH PRANK OVERLAY ─────────── */}
      <AnimatePresence>
        {showHackerLayer && !isUnlocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className={`fixed inset-0 z-50 bg-[#09070b]/98 backdrop-blur-xl flex flex-col justify-between items-center p-3 sm:p-6 font-mono text-[#f3f4f6] overflow-y-auto ${
              glitchActive ? "translate-x-1.5 filter hue-rotate-90" : ""
            }`}
            style={{
              backgroundImage: `radial-gradient(circle at 50% 15%, rgba(239, 68, 68, 0.20) 0%, transparent 65%),
                                repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.5) 1px, transparent 2px, transparent 4px)`,
            }}
          >
            {/* Top Security Siren */}
            <div className="w-full max-w-2xl mx-auto flex items-center justify-between py-2 border-b border-[#3b172a]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-ping" />
                <span className="text-[11px] sm:text-xs font-bold text-[#fca5a5] tracking-widest uppercase">
                  SECURITY_BREACH // ANSHIKA_DATA_VAULT
                </span>
              </div>

              <button
                onClick={() => setShowHackerLayer(false)}
                className="px-2.5 py-1 rounded-full bg-[#27101c] hover:bg-[#3d182b] border border-[#ef4444]/40 text-[11px] text-[#fca5a5] flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
              >
                <span>Reveal Vault</span>
                <X className="w-3 h-3 text-[#f87171]" />
              </button>
            </div>

            {/* Hacker Card Modal */}
            <div className="w-full max-w-lg mx-auto my-auto py-4">
              {/* Alert Header Banner */}
              <div className="w-full mb-3 flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-[#29101a] border border-[#ef4444]/60 text-center animate-pulse">
                <ShieldAlert className="w-4 h-4 text-[#ef4444] shrink-0" />
                <span className="text-[11px] font-bold text-[#fecaca] tracking-wide">
                  ⚠ CRITICAL ALERT: UNAUTHORIZED INTRUSION DETECTED ⚠
                </span>
              </div>

              {/* Terminal Snippet */}
              <div className="w-full mb-4 rounded-2xl bg-[#0b070f] border border-[#3b172a] p-3 text-[11px] text-[#9ca3af] shadow-inner text-left">
                <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#210f1c] text-[10px] text-[#6b7280]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
                    <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                    <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                    <span className="ml-1 text-[#f43f5e] font-semibold">
                      root@anuj-vault:~# ./snooper_defense
                    </span>
                  </div>
                  <span>DEFENSE: {hackProgress}%</span>
                </div>

                <div className="space-y-1 leading-relaxed">
                  {terminalLogs
                    .filter((log): log is string => typeof log === "string" && Boolean(log))
                    .map((log, index) => {
                      const isFailed = log.includes("REJECTED") || log.includes("FAILED");
                      const isSuccess = log.includes("verified") || log.includes("SUCCESS");
                      return (
                        <div
                          key={index}
                          className={
                            isFailed
                              ? "text-[#f87171] font-bold"
                              : isSuccess
                              ? "text-[#34d399]"
                              : "text-[#d1d5db]"
                          }
                        >
                          <span className="text-[#f43f5e] mr-1.5">&gt;</span>
                          {log}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Playful Prank Alert Toast */}
              <AnimatePresence>
                {prankAlert && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="w-full mb-3 px-3.5 py-2 rounded-xl bg-[#450a0a] border border-[#ef4444] text-[#fecaca] text-xs font-sans font-bold flex items-center gap-2 text-left"
                  >
                    <Flame className="w-4 h-4 text-[#f87171] shrink-0 animate-bounce" />
                    <span>{prankAlert}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* The Prank Reveal Box */}
              <div className="rounded-3xl bg-[#140c19] border-2 border-[#4a1c32] p-5 sm:p-7 text-center shadow-2xl">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#2b101c] border border-[#ef4444]/60 text-2xl mb-2.5 animate-pulse">
                  <Skull className="w-6 h-6 text-[#f87171]" />
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
                  YOU&apos;VE BEEN &ldquo;HACKED&rdquo;! 🚨
                </h2>

                <p className="font-sans text-xs sm:text-sm font-bold text-[#f43f5e] mb-1">
                  (Relax Anshika 😂 It&apos;s just Anuj.)
                </p>

                <p className="font-sans text-xs text-[#9ca3af] leading-relaxed max-w-sm mx-auto mb-5">
                  Did your heart jump for a second? 😭 <br />
                  I caught you snooping before your birthday! Your real surprise is locked in the vault behind this screen.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  {/* Enter Countdown Button */}
                  <button
                    onClick={() => setShowHackerLayer(false)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#fda4af] to-[#fb7185] hover:from-[#fb7185] hover:to-[#f43f5e] text-white text-xs font-bold font-sans shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Enter Birthday Vault 🌷</span>
                  </button>

                  {/* Playful Hack Attempt */}
                  <button
                    onClick={handleBypassAttempt}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#241321] hover:bg-[#351b31] border border-[#4a1c32] text-[#fca5a5] text-xs font-bold font-sans flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Attempt Hack Bypass</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Disclaimer */}
            <div className="py-2 text-[10px] text-[#6b7280]">
              *Security lock strictly expires on 28 October 2026 00:00 IST. Nice try though! 😂
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
