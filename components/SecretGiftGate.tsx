"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PHYSICAL_GIFT_CONFIG } from "@/data/birthday";
import {
  Sparkles,
  Lock,
  CheckCircle2,
  Gift,
  ArrowRight,
  Eye,
  EyeOff,
  RotateCcw,
  Heart,
} from "lucide-react";
import confetti from "canvas-confetti";
import PetalParticles from "@/components/flowers/PetalParticles";
import Link from "next/link";

interface SecretGiftGateProps {
  children: React.ReactNode;
}

type GateStage =
  | "checking"
  | "locked"
  | "granted"
  | "blooming"
  | "teddy"
  | "welcome"
  | "unlocked";

const STORAGE_KEY = "anshii_birthday_secret_unlocked";

export default function SecretGiftGate({ children }: SecretGiftGateProps) {
  const [stage, setStage] = useState<GateStage>("checking");
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Timer reference to manage unhurried stage progression cleanly
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearCurrentTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Check persistent unlock status and URL parameters
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);

    // Allow resetting state via URL: ?lock=true or ?reset=true
    if (urlParams.get("lock") === "true" || urlParams.get("reset") === "true") {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
      setStage("locked");
      return;
    }

    // Allow bypass for testing or pre-filled link
    const pwdParam = urlParams.get("pwd") || urlParams.get("password");
    if (
      pwdParam &&
      pwdParam.trim().toUpperCase() ===
        PHYSICAL_GIFT_CONFIG.password.trim().toUpperCase()
    ) {
      triggerUnlockSequence();
      return;
    }

    // Check if already previously unlocked in this session
    try {
      const isSessionUnlocked = sessionStorage.getItem(STORAGE_KEY) === "true";
      const isLocalUnlocked = localStorage.getItem(STORAGE_KEY) === "true";
      if (isSessionUnlocked || isLocalUnlocked) {
        setStage("unlocked");
        return;
      }
    } catch {}

    setStage("locked");
  }, []);

  // Autofocus input once locked screen appears
  useEffect(() => {
    if (stage === "locked") {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 400);
    }
  }, [stage]);

  // Clean up any pending timer on unmount
  useEffect(() => {
    return () => clearCurrentTimer();
  }, []);

  // ── Step Navigation Handlers (Generous slow timeouts + manual control) ───
  const goToBlooming = () => {
    clearCurrentTimer();
    setStage("blooming");
    // Stay on blooming for 5.0 seconds so she can watch petals and read calmly
    timerRef.current = setTimeout(() => {
      goToTeddy();
    }, 5000);
  };

  const goToTeddy = () => {
    clearCurrentTimer();
    setStage("teddy");
    try {
      confetti({
        particleCount: 65,
        spread: 85,
        origin: { y: 0.55 },
        colors: ["#fda4af", "#f43f5e", "#fed7aa", "#d8b4fe"],
      });
    } catch {}
    // Stay on teddy for 5.5 seconds so she can read the joke and enjoy the plushie
    timerRef.current = setTimeout(() => {
      goToWelcome();
    }, 5500);
  };

  const goToWelcome = () => {
    clearCurrentTimer();
    setStage("welcome");
    // NOTICE: We do NOT auto-dismiss the welcome screen quickly!
    // She can take all the time she wants to read, and tap "Begin the Journey 🌸 →" when ready.
  };

  const finishAndUnlock = () => {
    clearCurrentTimer();
    try {
      sessionStorage.setItem(STORAGE_KEY, "true");
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {}
    setStage("unlocked");
  };

  // Execute the exact choreographed sequence (unhurried and slow):
  // ACCESS GRANTED ✓ (3.2s) -> flower blooms (5.0s) -> teddy appears (5.5s) -> Welcome (until she clicks!)
  const triggerUnlockSequence = () => {
    clearCurrentTimer();
    // Step 1: ACCESS GRANTED ✓ (Comfortable 3.2s)
    setStage("granted");
    try {
      confetti({
        particleCount: 55,
        spread: 65,
        origin: { y: 0.6 },
        colors: ["#fda4af", "#86efac", "#bae6fd", "#fbcfe8"],
      });
    } catch {}

    timerRef.current = setTimeout(() => {
      goToBlooming();
    }, 3200);
  };

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = passwordInput.trim().toUpperCase();
    const expected = PHYSICAL_GIFT_CONFIG.password.trim().toUpperCase();

    if (entered === expected) {
      setErrorMsg("");
      triggerUnlockSequence();
    } else {
      setIsShaking(true);
      const randomError =
        PHYSICAL_GIFT_CONFIG.entryGate.wrongPasswordMessages[
          Math.floor(
            Math.random() *
              PHYSICAL_GIFT_CONFIG.entryGate.wrongPasswordMessages.length
          )
        ];
      setErrorMsg(randomError || "Hmm, check the little card inside the gift box again 👀");
      setTimeout(() => {
        setIsShaking(false);
      }, 500);
    }
  };

  const handleLockAgain = () => {
    clearCurrentTimer();
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setPasswordInput("");
    setErrorMsg("");
    setStage("locked");
  };

  // Skip gate if unlocked (Login successful!)
  if (stage === "unlocked") {
    return (
      <>
        {React.isValidElement(children)
          ? React.cloneElement(
              children as React.ReactElement<{ autoStartMusic?: boolean }>,
              {
                autoStartMusic: true,
              }
            )
          : children}
        {/* Subtle, unobtrusive relock / printable QR card icon (desktop only, tucked away) */}
        <div className="hidden sm:flex fixed bottom-3 right-48 z-30 items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity">
          <Link
            href="/qr-card"
            title="Print Gift Box QR Card"
            className="p-1.5 rounded-full bg-white/80 hover:bg-white text-[#786457] hover:text-[#3f2e24] shadow-xs border border-[#ebdcd0] text-[10px] flex items-center gap-1"
          >
            <Gift className="w-3 h-3 text-[#fb7185]" />
            <span className="hidden sm:inline">QR Card</span>
          </Link>
          <button
            onClick={handleLockAgain}
            title="Relock Birthday Experience (Test Mode)"
            className="p-1.5 rounded-full bg-white/80 hover:bg-white text-[#786457] hover:text-[#3f2e24] shadow-xs border border-[#ebdcd0] text-[10px] flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Relock</span>
          </button>
        </div>
      </>
    );
  }

  // Initial checking flicker prevention
  if (stage === "checking") {
    return (
      <div className="w-screen h-[100dvh] bg-[#faf7f2] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#fda4af] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 w-screen h-[100dvh] bg-[#faf7f2] flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* Background Petal Particles */}
      <PetalParticles count={18} />

      {/* Background Soft Pastel Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-[#fda4af]/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 sm:w-110 h-80 sm:h-110 bg-[#fed7aa]/25 rounded-full blur-[110px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md">
        <AnimatePresence mode="wait">
          {/* ══════════════════════════════════════════════════════════════════════
              STAGE 1: LOCKED PASSWORD INPUT SCREEN
             ══════════════════════════════════════════════════════════════════════ */}
          {stage === "locked" && (
            <motion.div
              key="locked-card"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={`relative bg-[#fffdfa] rounded-3xl border-2 border-[#ebdcd0] shadow-[0_12px_40px_rgba(120,80,50,0.08)] p-6 sm:p-8 flex flex-col items-center text-center ${
                isShaking ? "animate-wiggle" : ""
              }`}
            >
              {/* Top Washi Tape Sticker */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-gradient-to-r from-[#fda4af]/80 via-[#fbcfe8]/80 to-[#fed7aa]/80 backdrop-blur-xs rotate-[-1deg] shadow-2xs border-y border-white/60 flex items-center justify-center">
                <span className="text-[10px] font-sans font-bold tracking-widest text-[#881337] uppercase">
                  ✦ SECRET PASS ✦
                </span>
              </div>

              {/* Gift Box Connection Badge */}
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff0f3] border border-[#fbcfe8] text-[#be185d] font-sans text-xs font-semibold mb-3">
                <Gift className="w-3.5 h-3.5 text-[#fb7185]" />
                <span>Physical Gift Box Found</span>
              </div>

              {/* Title & Subtitle */}
              <h1 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#3f2e24] leading-tight">
                {PHYSICAL_GIFT_CONFIG.entryGate.heading}
              </h1>
              <p className="font-sans text-xs sm:text-sm text-[#786457] mt-1.5 mb-6 max-w-xs leading-relaxed">
                {PHYSICAL_GIFT_CONFIG.entryGate.subheading}
              </p>

              {/* Password Form */}
              <form onSubmit={handleUnlockSubmit} className="w-full flex flex-col gap-3">
                <div className="relative w-full">
                  <input
                    ref={inputRef}
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    placeholder={PHYSICAL_GIFT_CONFIG.entryGate.placeholder}
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck="false"
                    className="w-full px-4 py-3.5 pr-11 text-center font-mono font-bold text-sm sm:text-base tracking-widest uppercase rounded-2xl bg-[#faf7f2] border-2 border-[#ebdcd0] focus:border-[#fb7185] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#fda4af]/20 transition-all text-[#3f2e24] placeholder:text-[#bda495] placeholder:tracking-normal placeholder:font-sans placeholder:font-normal shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#a89080] hover:text-[#3f2e24] rounded-lg transition-colors cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Error Message with Shake Feedback */}
                {errorMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-sans font-medium text-[#e11d48] bg-[#fff1f2] border border-[#fecdd3] px-3 py-1.5 rounded-xl"
                  >
                    {errorMsg}
                  </motion.p>
                )}

                {/* Unlock Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#fda4af] to-[#fb7185] text-[#4c0519] font-sans font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer btn-cute"
                >
                  <Lock className="w-4 h-4" />
                  <span>{PHYSICAL_GIFT_CONFIG.entryGate.unlockButton}</span>
                </motion.button>
              </form>

              {/* Footnote Hint */}
              <div className="mt-5 pt-4 border-t border-[#ebdcd0]/70 w-full flex items-center justify-between text-[11px] text-[#a89080] font-sans">
                <span className="flex items-center gap-1">
                  <span>🧸</span>
                  <span>Look on the printed card</span>
                </span>
                <Link
                  href="/qr-card"
                  className="text-[#fb7185] hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Print card?</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              STAGE 2: ACCESS GRANTED ✓ (Slow, clear, 3.2s)
             ══════════════════════════════════════════════════════════════════════ */}
          {stage === "granted" && (
            <motion.div
              key="granted-card"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.03, opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#fffdfa] rounded-3xl border-2 border-[#86efac] shadow-[0_16px_45px_rgba(34,197,94,0.15)] p-8 sm:p-10 flex flex-col items-center text-center relative overflow-hidden"
            >
              {/* Step indicator */}
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#16a34a] bg-[#f0fdf4] px-3 py-1 rounded-full border border-[#bbf7d0] mb-4">
                ✦ Step 1 of 4: Secret Verified ✦
              </span>

              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="w-18 h-18 rounded-full bg-[#f0fdf4] border-2 border-[#bbf7d0] flex items-center justify-center text-[#16a34a] mb-4 shadow-sm"
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>

              <h2 className="text-2xl sm:text-3xl font-sans font-black tracking-wide text-[#15803d]">
                {PHYSICAL_GIFT_CONFIG.entryGate.grantedText}
              </h2>

              <p className="text-sm font-sans text-[#4a3528] mt-2 font-medium max-w-xs">
                Password verified. Preparing your birthday surprise...
              </p>

              <div className="mt-5 flex items-center gap-1.5 text-xs text-[#16a34a]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Opening celebration...</span>
              </div>

              {/* Optional fast-forward button */}
              <button
                onClick={goToBlooming}
                className="mt-4 text-[11px] text-[#786457] hover:text-[#3f2e24] underline cursor-pointer"
              >
                Next →
              </button>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              STAGE 3: FLOWER BLOOMS ANIMATION (Slow, graceful, 5.0s)
             ══════════════════════════════════════════════════════════════════════ */}
          {stage === "blooming" && (
            <motion.div
              key="blooming-animation"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#fffdfa] rounded-3xl border-2 border-[#fbcfe8] shadow-[0_16px_45px_rgba(244,63,94,0.12)] p-8 sm:p-10 flex flex-col items-center text-center relative overflow-hidden"
            >
              {/* Step indicator */}
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#be185d] bg-[#fff0f3] px-3 py-1 rounded-full border border-[#fbcfe8] mb-4">
                ✦ Step 2 of 4: Birthday Bloom ✦
              </span>

              {/* Blooming SVG Flower (slowed down so she can watch petals unfold) */}
              <div className="relative w-32 h-32 mb-4 flex items-center justify-center">
                {/* Petals Opening slowly */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.1, y: 0 }}
                    animate={{ scale: 1, y: -30 }}
                    transition={{
                      delay: i * 0.08,
                      duration: 1.4,
                      ease: [0.34, 1.4, 0.64, 1],
                    }}
                    style={{
                      transformOrigin: "center 64px",
                      rotate: `${angle}deg`,
                    }}
                    className="absolute w-9 h-16 rounded-full bg-gradient-to-t from-[#fda4af] to-[#fbcfe8] opacity-90 shadow-xs border border-white/60"
                  />
                ))}

                {/* Flower Center Pollen Glow */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring", damping: 12 }}
                  className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-tr from-[#f59e0b] to-[#fef08a] border-2 border-white shadow-md flex items-center justify-center text-sm"
                >
                  ✨
                </motion.div>
              </div>

              <motion.h3
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="font-serif italic text-xl sm:text-2xl font-bold text-[#881337]"
              >
                A birthday flower for Anshii 🌸
              </motion.h3>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.6 }}
                className="text-sm font-sans text-[#786457] mt-2 max-w-xs leading-relaxed"
              >
                Blooming right on cue for your special 19th...
              </motion.p>

              {/* Optional fast-forward button */}
              <button
                onClick={goToTeddy}
                className="mt-5 text-[11px] text-[#786457] hover:text-[#3f2e24] underline cursor-pointer"
              >
                Continue to gift buddy →
              </button>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              STAGE 4: TEDDY APPEARS & PETALS (Slow, adorable, 5.5s)
             ══════════════════════════════════════════════════════════════════════ */}
          {stage === "teddy" && (
            <motion.div
              key="teddy-animation"
              initial={{ opacity: 0, y: 22, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ type: "spring", damping: 16 }}
              className="bg-[#fffdfa] rounded-3xl border-2 border-[#fed7aa] shadow-[0_16px_45px_rgba(249,115,22,0.12)] p-8 sm:p-10 flex flex-col items-center text-center relative overflow-hidden"
            >
              {/* Step indicator */}
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#9a3412] bg-[#fff7ed] px-3 py-1 rounded-full border border-[#fed7aa] mb-4">
                ✦ Step 3 of 4: Gift Box Buddy ✦
              </span>

              {/* Teddy Bear Plushie Icon with Gentle Bouncing Animation */}
              <motion.div
                animate={{
                  y: [0, -12, 0],
                  rotate: [0, -4, 4, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.2,
                  ease: "easeInOut",
                }}
                className="text-7xl mb-3 filter drop-shadow-md select-none"
              >
                🧸
              </motion.div>

              <h3 className="font-serif italic text-xl sm:text-2xl font-bold text-[#7c2d12]">
                “And yes, the teddy was mandatory.”
              </h3>

              <p className="text-sm font-sans text-[#9a3412] mt-2 font-medium max-w-xs leading-relaxed">
                He hopes you liked the box and everything tucked inside 🌷
              </p>

              {/* Optional fast-forward button */}
              <button
                onClick={goToWelcome}
                className="mt-5 text-[11px] text-[#9a3412] hover:text-[#7c2d12] underline cursor-pointer"
              >
                Proceed to welcome message →
              </button>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              STAGE 5: “WELCOME, ANSHII. NOW YOU CAN FINALLY SEE WHAT'S WAITING...”
              (UNHURRIED: Stays on screen until she clicks to proceed!)
             ══════════════════════════════════════════════════════════════════════ */}
          {stage === "welcome" && (
            <motion.div
              key="welcome-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.08 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#fffdfa] rounded-3xl border-2 border-[#fda4af] shadow-[0_20px_50px_rgba(244,63,94,0.18)] p-7 sm:p-9 flex flex-col items-center text-center relative overflow-hidden"
            >
              {/* Step indicator */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#fff0f3] border border-[#fbcfe8] text-[#be185d] font-sans text-xs font-bold mb-3 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#fb7185]" />
                <span>Chapter 01 Ready</span>
              </div>

              {/* Big, warm welcome heading */}
              <h2 className="font-serif italic text-3xl sm:text-4xl font-bold text-[#3f2e24] leading-tight">
                {PHYSICAL_GIFT_CONFIG.entryGate.welcomeHeading}
              </h2>

              {/* Subtext: unhurried and clear */}
              <p className="font-sans text-sm sm:text-base text-[#786457] mt-3 mb-2 max-w-xs leading-relaxed font-medium">
                {PHYSICAL_GIFT_CONFIG.entryGate.welcomeSubtext}
              </p>

              <p className="font-sans text-xs text-[#a0897a] mb-6 max-w-xs italic">
                Take all the time you need. Every page was made with love for you. 🌸
              </p>

              {/* Prominent Action Button: She clicks when ready! */}
              <motion.button
                onClick={finishAndUnlock}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#fda4af] to-[#fb7185] hover:from-[#fb7185] hover:to-[#f43f5e] text-[#4c0519] font-sans font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer btn-cute animate-pulse"
              >
                <Heart className="w-4 h-4 fill-[#881337] text-[#881337]" />
                <span>Begin the Birthday Journey 🌸</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
