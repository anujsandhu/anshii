"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  ShieldAlert,
  Lock,
  Unlock,
  AlertTriangle,
  Flame,
  MessageCircle,
  Skull,
  RefreshCw,
  Cpu,
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

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockStep, setUnlockStep] = useState<0 | 1 | 2 | 3>(0);
  const [glitchActive, setGlitchActive] = useState(false);
  const [prankAlert, setPrankAlert] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "INITIALIZING SYSTEM BREACH SIMULATION...",
    "Scanning network ports for target: [ANSHIKA_DEVICE]...",
    "Connection established via SSL TLS-1.3 [ENCRYPTED]",
    "Accessing target personal archives...",
  ]);
  const [hackProgress, setHackProgress] = useState(34);
  const [isTerminalCollapsed, setIsTerminalCollapsed] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Play subtle high-tech synthesizer beeps
  const playHackerBeep = (freq = 480, duration = 0.07) => {
    if (!audioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
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

  // Simulate funny live terminal updates
  useEffect(() => {
    const stream = [
      "Dumping cached selfies & smiles... [LOCKED]",
      "Target verified: Anshika (Turning 19 on Oct 28)",
      "Birthday firewall detected: ANUJ-SEC-V2",
      "Brute force attempt: PASSWORD_BYPASS -> FAILED [403]",
      "Status: Surveillance lock engaged until Oct 28 00:00 IST",
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
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  // Unlock sequence animation when timer hits 0
  const handleUnlockSequence = () => {
    setIsUnlocked(true);
    setUnlockStep(1);

    setTimeout(() => {
      setUnlockStep(2);
    }, 1200);

    setTimeout(() => {
      setUnlockStep(3);
      try {
        confetti({
          particleCount: 60,
          spread: 80,
          origin: { y: 0.5 },
          colors: ["#ef4444", "#f43f5e", "#fda4af", "#10b981", "#fbbf24"],
        });
      } catch {}
    }, 2400);

    setTimeout(() => {
      if (onUnlock) {
        onUnlock();
      }
    }, 4200);
  };

  // Trigger playful "Hacker Crack Attempt"
  const handleBypassAttempt = () => {
    if (isUnlocked) return;
    setAudioEnabled(true);
    playHackerBeep(880, 0.1);

    // Glitch effect shake
    setGlitchActive(true);
    setTimeout(() => setGlitchActive(false), 600);

    const randomMsg =
      HACKER_PRANK_MESSAGES[
        Math.floor(Math.random() * HACKER_PRANK_MESSAGES.length)
      ];
    setPrankAlert(randomMsg);

    // Add to terminal logs
    setTerminalLogs((prev) => [
      ...prev.slice(-3),
      `> MANUAL HACK ATTEMPT BY USER -> REJECTED ❌`,
      `> ${randomMsg}`,
    ]);

    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(() => {
      setPrankAlert(null);
    }, 4000);
  };

  const formatNumber = (num: number) => String(num).padStart(2, "0");

  const whatsappMessage = encodeURIComponent(
    "Anuj wtf is this website 😭 why does it say I'm getting hacked?! please give me the password early 😂"
  );
  const whatsappUrl = `https://wa.me/918278710552?text=${whatsappMessage}`;

  return (
    <div
      className={`relative min-h-[100dvh] w-screen flex flex-col justify-between items-center bg-[#09070b] text-[#f3f4f6] overflow-x-hidden select-none p-3 sm:p-6 font-mono transition-transform duration-100 ${
        glitchActive ? "translate-x-1.5 translate-y-[-1px] filter hue-rotate-90" : ""
      }`}
      style={{
        backgroundImage: `radial-gradient(circle at 50% 20%, rgba(239, 68, 68, 0.15) 0%, transparent 70%),
                          radial-gradient(circle at 80% 80%, rgba(244, 63, 94, 0.10) 0%, transparent 60%),
                          linear-gradient(rgba(15, 11, 20, 0.95), rgba(9, 7, 11, 0.98))`,
      }}
    >
      {/* CRT Scanline Overlay Effect */}
      <div
        className="pointer-events-none fixed inset-0 z-30 opacity-[0.14]"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.6) 0px, rgba(0,0,0,0.6) 1px, transparent 2px, transparent 4px)",
        }}
      />

      {/* ── TOP STATUS BAR ──────────────────────────────────────────────────── */}
      <header className="w-full max-w-3xl mx-auto flex items-center justify-between z-20 py-2 sm:py-3 border-b border-[#372433]">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-ping" />
          <span className="text-xs sm:text-sm font-bold tracking-wider text-[#fda4af]">
            CRITICAL_ALERT // ANSHIKA_DATA_VAULT
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-[#271520] border border-[#ef4444]/40 text-[10px] text-[#ef4444] tracking-widest uppercase font-bold">
            BREACH SIMULATION ACTIVE
          </span>
          <button
            onClick={() => setIsTerminalCollapsed(!isTerminalCollapsed)}
            className="px-2.5 py-1 rounded-md bg-[#1f131a] hover:bg-[#2d1b26] border border-[#4a2839] text-[11px] text-[#fda4af] flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Terminal className="w-3 h-3 text-[#f43f5e]" />
            <span>{isTerminalCollapsed ? "View Terminal" : "Hide Terminal"}</span>
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT AREA ──────────────────────────────────────────────── */}
      <main className="relative z-10 w-full max-w-[560px] mx-auto my-auto flex flex-col items-center">
        {/* Hacker Alert Banner */}
        <div className="w-full mb-3 flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#291219]/90 border border-[#ef4444]/60 shadow-[0_0_20px_rgba(239,68,68,0.25)] text-center animate-pulse">
          <ShieldAlert className="w-4 h-4 text-[#ef4444] shrink-0" />
          <span className="text-[11px] sm:text-xs font-bold text-[#fca5a5] tracking-wide">
            ⚠ UNAUTHORIZED BIRTHDAY SNOOPER DETECTED ⚠
          </span>
        </div>

        {/* Live Interactive Hacker Terminal */}
        {!isTerminalCollapsed && (
          <div className="w-full mb-4 rounded-2xl bg-[#0e0a12]/90 border border-[#3b1d2e] p-3 text-[11px] sm:text-xs text-[#9ca3af] shadow-inner">
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#261621] text-[10px] text-[#6b7280]">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
                <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                <span className="ml-1 text-[#f43f5e] font-semibold">
                  root@anuj-vault:~# ./extract_birthday_payload
                </span>
              </div>
              <span>PORT: 8080</span>
            </div>

            <div className="space-y-1 font-mono leading-relaxed">
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

            {/* Simulated extraction progress */}
            <div className="mt-2.5 pt-2 border-t border-[#261621] flex items-center justify-between text-[10px]">
              <span className="text-[#9ca3af]">SNOOPER DEFENSE PROTOCOL</span>
              <span className="text-[#ef4444] font-bold">{hackProgress}% LOCKED</span>
            </div>
            <div className="w-full h-1.5 bg-[#261621] rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-[#ef4444] to-[#f43f5e] transition-all duration-300"
                style={{ width: `${hackProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Playful Floating Prank Toast */}
        <AnimatePresence>
          {prankAlert && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="w-full mb-3 px-4 py-2.5 rounded-2xl bg-[#450a0a] border border-[#ef4444] text-[#fecaca] text-xs font-sans font-bold shadow-[0_0_25px_rgba(239,68,68,0.4)] flex items-center gap-2.5 z-40 text-left"
            >
              <Flame className="w-4 h-4 text-[#f87171] shrink-0 animate-bounce" />
              <span>{prankAlert}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── THE PRANK REVEAL & COUNTDOWN CARD ────────────────────────────── */}
        <div className="relative w-full rounded-3xl bg-[#140d19]/90 border-2 border-[#4a2238] shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-5 sm:p-8 text-center backdrop-blur-md overflow-hidden">
          {/* Top Stamp */}
          <div className="absolute top-4 right-4 px-2 py-0.5 rounded bg-[#2b121f] border border-[#f43f5e]/60 text-[10px] text-[#f43f5e] font-bold tracking-widest uppercase">
            TARGET: 28 OCT
          </div>

          {/* Hacker Skull / Playful Icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#2b101c] border border-[#ef4444]/60 text-2xl mb-3 shadow-[0_0_20px_rgba(239,68,68,0.35)] animate-pulse">
            <Skull className="w-7 h-7 text-[#f87171]" />
          </div>

          {/* Big Teasing Title */}
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#fff] tracking-tight leading-tight mb-1">
            YOU&apos;VE BEEN &ldquo;HACKED&rdquo;! 🚨
          </h1>

          <p className="font-sans text-xs sm:text-sm font-bold text-[#f43f5e] mb-1">
            (Relax Anshika 😂 It&apos;s just Anuj.)
          </p>

          <p className="font-sans text-xs text-[#9ca3af] leading-relaxed max-w-sm mx-auto mb-5">
            Did your heart skip a beat for a second? 😭 <br />
            I told you not to come snooping around before October 28! Your birthday surprise is locked safe in this vault.
          </p>

          {/* ── COUNTDOWN CARDS (CYBER VAULT THEME) ─────────────────────────── */}
          <div className="mb-5">
            <div className="text-[10px] font-mono tracking-widest text-[#f43f5e] uppercase font-bold mb-2 flex items-center justify-center gap-1.5">
              <Cpu className="w-3 h-3 text-[#f43f5e]" />
              <span>DECRYPTION TIMELOCK ENGAGED</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-md mx-auto">
              {/* DAYS */}
              <div
                onClick={handleBypassAttempt}
                className="group cursor-pointer rounded-2xl bg-[#1d1222] border border-[#4a2238] hover:border-[#f43f5e] transition-all p-3 flex flex-col items-center justify-center shadow-md active:scale-95"
              >
                <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#fff] tracking-tight leading-none mb-1">
                  {formatNumber(timeRemaining.days)}
                </span>
                <span className="text-[10px] font-bold text-[#9ca3af] tracking-wider uppercase">
                  DAYS
                </span>
              </div>

              {/* HOURS */}
              <div
                onClick={handleBypassAttempt}
                className="group cursor-pointer rounded-2xl bg-[#1d1222] border border-[#4a2238] hover:border-[#f43f5e] transition-all p-3 flex flex-col items-center justify-center shadow-md active:scale-95"
              >
                <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#fff] tracking-tight leading-none mb-1">
                  {formatNumber(timeRemaining.hours)}
                </span>
                <span className="text-[10px] font-bold text-[#9ca3af] tracking-wider uppercase">
                  HOURS
                </span>
              </div>

              {/* MINUTES */}
              <div
                onClick={handleBypassAttempt}
                className="group cursor-pointer rounded-2xl bg-[#1d1222] border border-[#4a2238] hover:border-[#f43f5e] transition-all p-3 flex flex-col items-center justify-center shadow-md active:scale-95"
              >
                <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#fff] tracking-tight leading-none mb-1">
                  {formatNumber(timeRemaining.minutes)}
                </span>
                <span className="text-[10px] font-bold text-[#9ca3af] tracking-wider uppercase">
                  MINUTES
                </span>
              </div>

              {/* SECONDS */}
              <div
                onClick={handleBypassAttempt}
                className="group cursor-pointer rounded-2xl bg-[#1d1222] border border-[#4a2238] hover:border-[#f43f5e] transition-all p-3 flex flex-col items-center justify-center shadow-md active:scale-95"
              >
                <motion.span
                  key={timeRemaining.seconds}
                  initial={{ scale: 1.15, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="font-serif text-2xl sm:text-3xl font-extrabold text-[#f43f5e] tracking-tight leading-none mb-1"
                >
                  {formatNumber(timeRemaining.seconds)}
                </motion.span>
                <span className="text-[10px] font-bold text-[#9ca3af] tracking-wider uppercase">
                  SECONDS
                </span>
              </div>
            </div>

            {/* TIME DETAILS */}
            <div className="mt-3.5 pt-2.5 border-t border-[#2d1726] flex items-center justify-center gap-2 text-[11px] text-[#9ca3af]">
              <span>Auto-Decrypts: {DATE_DISPLAY}</span>
              <span className="text-[#f43f5e]">•</span>
              <span className="font-bold text-[#fca5a5]">{TIMEZONE_DISPLAY}</span>
            </div>
          </div>

          {/* ── ACTION BUTTONS ─────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-3 border-t border-[#2d1726]">
            {/* Button 1: Attempt Hacker Bypass */}
            <button
              onClick={handleBypassAttempt}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#dc2626] to-[#e11d48] hover:from-[#ef4444] hover:to-[#f43f5e] text-white text-xs font-bold shadow-[0_0_20px_rgba(225,29,72,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Attempt Brute-Force Hack</span>
            </button>

            {/* Button 2: WhatsApp Anuj */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#1d1222] hover:bg-[#2c1932] border border-[#4a2238] hover:border-[#f43f5e] text-[#fda4af] text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#22c55e]" />
              <span>Beg Anuj for Password</span>
            </a>
          </div>

          <p className="mt-3.5 text-[10px] text-[#6b7280]">
            *Even if you know the password, the date-lock will not open before Oct 28. 😂
          </p>
        </div>

        {/* ── UNLOCK ANIMATION (When Countdown hits 0 on Oct 28) ────────────── */}
        <AnimatePresence>
          {isUnlocked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#09070b]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="max-w-md w-full p-8 rounded-3xl bg-[#140d19] border-2 border-[#10b981] shadow-[0_0_60px_rgba(16,185,129,0.4)] flex flex-col items-center">
                {unlockStep >= 3 ? (
                  <motion.div
                    initial={{ scale: 0.5, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="w-16 h-16 rounded-3xl bg-[#064e3b] border border-[#10b981] flex items-center justify-center mb-4 text-[#34d399]"
                  >
                    <Unlock className="w-8 h-8" />
                  </motion.div>
                ) : (
                  <div className="w-16 h-16 rounded-3xl bg-[#2b101c] border border-[#ef4444] flex items-center justify-center mb-4 text-[#f87171]">
                    <Lock className="w-8 h-8 animate-pulse" />
                  </div>
                )}

                {unlockStep === 1 && (
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-serif text-2xl font-bold text-white"
                  >
                    Okay...
                  </motion.h2>
                )}

                {unlockStep === 2 && (
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-serif text-2xl font-bold text-white"
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
                    <h2 className="font-serif text-3xl font-extrabold text-[#34d399] tracking-tight">
                      FIREWALL UNLOCKED! 🔓
                    </h2>
                    <p className="font-sans text-xs text-[#9ca3af]">
                      Transferring to Birthday Access Portal...
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="w-full max-w-3xl mx-auto py-2.5 text-center z-10 border-t border-[#261521]">
        <p className="text-[11px] text-[#6b7280]">
          Anuj Security Systems Inc. • All birthday surprises reserved until 28 Oct 2026 🌷
        </p>
      </footer>
    </div>
  );
}
