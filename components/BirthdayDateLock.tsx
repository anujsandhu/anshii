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
  Volume2,
  VolumeX,
  AlertOctagon,
  Radio,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  calculateTimeRemaining,
  DATE_DISPLAY,
  TIMEZONE_DISPLAY,
  CountdownTimeRemaining,
} from "@/lib/dateLock";

interface BirthdayDateLockProps {
  onUnlock?: () => void;
  initialServerTime?: number;
}

const HACKER_PRANK_MESSAGES = [
  "Nice try Anshika. Even NASA can't bypass this before the 28th. 😂",
  "🚨 ALERT: Anshika caught snooping around the secret vault!",
  "Access Denied: Protected by Anuj's anti-snooper firewall. 🛡️",
  "Error 403: Snooper detected. Go away and come back on Oct 28! 👀",
  "Decryption attempt failed. Security level: MAXIMUM ANUJ DEFENSE. 😂",
  "Bro, it's NOT opening early. Stop pressing the button! 😭",
  "October 28. Mark your calendar. Not today, Anshika! 🌷",
  "Your IP has been logged into the 'Impatient People Hall of Fame' 🏆😂",
  "Trying to break into the secret vault? Nice try. 😂",
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
  const [sirenActive, setSirenActive] = useState(false);

  // Normal scrapbook countdown states
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockStep, setUnlockStep] = useState<0 | 1 | 2 | 3>(0);
  const [attemptMessage, setAttemptMessage] = useState<string | null>(null);
  const [lockWiggle, setLockWiggle] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Audio Context Ref for Buzzer Siren
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sirenIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulated live hacker terminal logs (ZERO BIRTHDAY CLUES)
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "INITIALIZING SYSTEM LOCKDOWN PROTOCOL...",
    "Connection flagged: [ANSHIKA_DEVICE] (Access Unverified)",
    "Bypassing security certificates... ACCESS DENIED",
    "Target personal archives... [ENCRYPTED - AES-256 GCM]",
  ]);
  const [hackProgress, setHackProgress] = useState(65);

  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enforce zero-clue mysterious title before Oct 28
  useEffect(() => {
    document.title = "SECURITY WARNING // ACCESS RESTRICTED";
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

  // Physical Phone Vibration
  const triggerPhoneVibrate = (pattern: number[] = [250, 100, 250, 100, 500]) => {
    try {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch {}
  };

  // Realistic Alarm Buzzer Sound Synthesizer
  const playRealisticBuzzer = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Primary harsh alarm oscillator (Sawtooth)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(820, now);
      osc1.frequency.exponentialRampToValueAtTime(440, now + 0.22);
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      // Secondary low-frequency buzzer drone (Square)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "square";
      osc2.frequency.setValueAtTime(160, now);
      gain2.gain.setValueAtTime(0.04, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now);
      osc2.stop(now + 0.22);
    } catch {}
  }, []);

  // Start Repeating Alarm Siren
  const startSiren = useCallback(() => {
    setSirenActive(true);
    triggerPhoneVibrate([300, 120, 300, 120, 600]);
    playRealisticBuzzer();

    if (sirenIntervalRef.current) clearInterval(sirenIntervalRef.current);
    sirenIntervalRef.current = setInterval(() => {
      playRealisticBuzzer();
      triggerPhoneVibrate([200, 80, 200]);
    }, 600);
  }, [playRealisticBuzzer]);

  // Stop Repeating Alarm Siren
  const stopSiren = useCallback(() => {
    setSirenActive(false);
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
  }, []);

  // Auto-trigger brief realistic alarm buzz on first user interaction
  useEffect(() => {
    const handleFirstTouch = () => {
      triggerPhoneVibrate([200, 100, 300]);
      playRealisticBuzzer();
      window.removeEventListener("click", handleFirstTouch);
      window.removeEventListener("touchstart", handleFirstTouch);
    };

    window.addEventListener("click", handleFirstTouch, { once: true });
    window.addEventListener("touchstart", handleFirstTouch, { once: true });

    return () => {
      window.removeEventListener("click", handleFirstTouch);
      window.removeEventListener("touchstart", handleFirstTouch);
      stopSiren();
    };
  }, [playRealisticBuzzer, stopSiren]);

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

  // Terminal log simulation in prank layer (NO BIRTHDAY MENTIONS)
  useEffect(() => {
    const stream = [
      "Accessing personal photo archives... [LOCKED]",
      "Security firewall engaged: ANUJ-SEC-V2",
      "Manual crack attempt: ACCESS_OVERRIDE -> FAILED [403]",
      "Defense status: System locked until Oct 28 00:00 IST",
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < stream.length && stream[i]) {
        const nextLog = stream[i];
        setTerminalLogs((prev) => [...prev.slice(-4), nextLog]);
        setHackProgress((p) => Math.min(99, p + 11));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  // Unlock sequence animation when timer reaches zero on 28 Oct
  const handleUnlockSequence = () => {
    stopSiren();
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

    triggerPhoneVibrate([100, 50, 100]);
    playRealisticBuzzer();

    setLockWiggle(true);
    setTimeout(() => setLockWiggle(false), 500);

    const msg =
      HACKER_PRANK_MESSAGES[
        Math.floor(Math.random() * HACKER_PRANK_MESSAGES.length)
      ];
    setAttemptMessage(msg);

    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(() => {
      setAttemptMessage(null);
    }, 3200);
  };

  // Trigger funny hacker crack attempt inside the prank layer
  const handleBypassAttempt = () => {
    startSiren();
    setGlitchActive(true);
    setTimeout(() => setGlitchActive(false), 600);

    const randomMsg =
      HACKER_PRANK_MESSAGES[
        Math.floor(Math.random() * HACKER_PRANK_MESSAGES.length)
      ];
    setPrankAlert(randomMsg);

    setTerminalLogs((prev) => [
      ...prev.slice(-3),
      `> INTRUSION ALERT: MANUAL OVERRIDE REJECTED ❌`,
      `> ${randomMsg}`,
    ]);

    setTimeout(() => {
      stopSiren();
      setPrankAlert(null);
    }, 3600);
  };

  // Floating background petals configuration (Cute screen)
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
    "Anuj what is this 😭 why does this website say my device is quarantined?! what are you hiding until 28 Oct 😂"
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
      {/* ── TOP HEADER (Minimalist, completely free of birthday clues) ───────── */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between z-20 py-2 sm:py-3">
        <div className="flex items-center gap-2">
          <span className="font-serif italic text-sm sm:text-base font-medium text-[#786457] tracking-tight">
            Anshika
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowHackerLayer(true);
              startSiren();
            }}
            title="Trigger Security Lockdown Prank"
            className="px-2.5 py-1 rounded-full bg-white/80 hover:bg-white border border-[#ef4444]/40 shadow-2xs text-[11px] font-sans font-medium text-[#ef4444] flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#ef4444] animate-pulse" />
            <span className="hidden sm:inline">Security Alert</span>
          </button>

          <button
            onClick={triggerAttemptInteraction}
            title="Vault status: Locked"
            aria-label="Lock status"
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

      {/* ── RESTORED ORIGINAL CUTE CENTERPIECE CARD (100% Spoiler-Free) ───────── */}
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
              onClick={() => {
                setShowHackerLayer(true);
                startSiren();
              }}
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
                      Loading your surprise...
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

      {/* ── THE EXTRA LAYER: REALISTIC SECURITY BREACH & SIREN BUZZER PRANK ──── */}
      <AnimatePresence>
        {showHackerLayer && !isUnlocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className={`fixed inset-0 z-50 bg-[#070508]/98 backdrop-blur-xl flex flex-col justify-between items-center p-3 sm:p-6 font-mono text-[#f3f4f6] overflow-y-auto ${
              glitchActive ? "translate-x-2 filter invert hue-rotate-180" : ""
            } ${sirenActive ? "border-4 border-[#ef4444] shadow-[inset_0_0_80px_rgba(239,68,68,0.5)]" : ""}`}
            style={{
              backgroundImage: `radial-gradient(circle at 50% 12%, rgba(239, 68, 68, 0.28) 0%, transparent 65%),
                                repeating-linear-gradient(0deg, rgba(0,0,0,0.6) 0px, rgba(0,0,0,0.6) 1px, transparent 2px, transparent 4px)`,
            }}
          >
            {/* Top Red Security Siren Lightbar */}
            <div className="w-full max-w-2xl mx-auto flex items-center justify-between py-2 border-b border-[#3b172a]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ef4444] animate-ping" />
                <span className="text-[11px] sm:text-xs font-bold text-[#fca5a5] tracking-widest uppercase">
                  INCIDENT #SEC-9842 // ACCESS_DENIED
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={sirenActive ? stopSiren : startSiren}
                  className={`px-2 py-0.5 rounded-full border text-[10px] flex items-center gap-1 cursor-pointer transition-colors ${
                    sirenActive
                      ? "bg-[#ef4444] text-white border-[#f87171] animate-pulse"
                      : "bg-[#27101c] text-[#fca5a5] border-[#ef4444]/40"
                  }`}
                >
                  {sirenActive ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                  <span>{sirenActive ? "Mute Siren" : "Test Siren"}</span>
                </button>

                <button
                  onClick={() => {
                    stopSiren();
                    setShowHackerLayer(false);
                  }}
                  className="px-2.5 py-1 rounded-full bg-[#27101c] hover:bg-[#3d182b] border border-[#ef4444]/40 text-[11px] text-[#fca5a5] flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                >
                  <span>Reveal Vault</span>
                  <X className="w-3 h-3 text-[#f87171]" />
                </button>
              </div>
            </div>

            {/* Hacker Card Modal */}
            <div className="w-full max-w-lg mx-auto my-auto py-3">
              {/* Alert Header Strobe Banner */}
              <div className="w-full mb-3 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#350d18] border-2 border-[#ef4444] text-center shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse">
                <AlertOctagon className="w-5 h-5 text-[#ef4444] shrink-0 animate-bounce" />
                <span className="text-xs sm:text-sm font-extrabold text-[#fecaca] tracking-wide uppercase">
                  ⚠ CRITICAL SECURITY INTRUSION DETECTED ⚠
                </span>
              </div>

              {/* Realistic Cyber Terminal Snippet */}
              <div className="w-full mb-4 rounded-2xl bg-[#09060c] border border-[#3b172a] p-3.5 text-[11px] text-[#9ca3af] shadow-inner text-left">
                <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#210f1c] text-[10px] text-[#6b7280]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
                    <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                    <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                    <span className="ml-1 text-[#f43f5e] font-semibold">
                      sec-monitor@anuj-vault:~# ./quarantine_device
                    </span>
                  </div>
                  <span className="text-[#ef4444] font-bold">DEFENSE: {hackProgress}%</span>
                </div>

                <div className="space-y-1 leading-relaxed">
                  {terminalLogs
                    .filter((log): log is string => typeof log === "string" && Boolean(log))
                    .map((log, index) => {
                      const isFailed = log.includes("DENIED") || log.includes("FAILED");
                      const isSuccess = log.includes("LOCKDOWN") || log.includes("ENCRYPTED");
                      return (
                        <div
                          key={index}
                          className={
                            isFailed
                              ? "text-[#f87171] font-bold"
                              : isSuccess
                              ? "text-[#fbbf24]"
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
              <div className="rounded-3xl bg-[#130b18] border-2 border-[#4a1c32] p-5 sm:p-7 text-center shadow-2xl">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#2b101c] border border-[#ef4444]/60 text-2xl mb-2.5 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse">
                  <Skull className="w-7 h-7 text-[#f87171]" />
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
                  DEVICE QUARANTINED! 🚨
                </h2>

                <p className="font-sans text-xs sm:text-sm font-bold text-[#f43f5e] mb-1">
                  (Relax Anshika 😂 It&apos;s just Anuj.)
                </p>

                <p className="font-sans text-xs text-[#9ca3af] leading-relaxed max-w-sm mx-auto mb-5">
                  Did your heart jump for a second? 😭 <br />
                  I caught you snooping around! Whatever is inside here is locked safe and will not open before October 28.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  {/* Enter Countdown Button */}
                  <button
                    onClick={() => {
                      stopSiren();
                      setShowHackerLayer(false);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#fda4af] to-[#fb7185] hover:from-[#fb7185] hover:to-[#f43f5e] text-white text-xs font-bold font-sans shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Enter Secret Vault 🌷</span>
                  </button>

                  {/* Playful Hack Attempt with Buzzer & Vibrate */}
                  <button
                    onClick={handleBypassAttempt}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#241321] hover:bg-[#351b31] border border-[#ef4444]/50 text-[#fca5a5] text-xs font-bold font-sans flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Radio className="w-3.5 h-3.5 text-[#ef4444]" />
                    <span>Attempt Override</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Disclaimer */}
            <div className="py-2 text-[10px] text-[#6b7280]">
              *Security lock strictly active until 28 October 2026 00:00 IST. Nice try though! 😂
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
