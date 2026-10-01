"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  Loader2,
  MessageCircle,
} from "lucide-react";
import confetti from "canvas-confetti";

interface SecretGiftGateProps {
  children: React.ReactNode;
}

type GateStage = "checking" | "locked" | "granted" | "unlocked";

const SESSION_STORAGE_KEY = "anshii_auth_session";
const TARGET_WHATSAPP_NUMBER = "918278710552";

// Playful teasing wrong password messages
const PLAYFUL_WRONG_MESSAGES = [
  "Nice try... but nope 😂",
  "Almost... not that one 👀",
  "Good guess. Still locked 🌷",
  "Ummm... that's not it 😂",
  "Who gave you that password? 😭",
];

// 7 subtle, gently drifting ambient elements
const FLOATING_ELEMENTS = [
  { id: 1, type: "emoji", content: "🌸", x: 10, y: 16, duration: 9, delay: 0 },
  { id: 2, type: "emoji", content: "💖", x: 86, y: 20, duration: 10, delay: 1.2 },
  { id: 3, type: "emoji", content: "✨", x: 16, y: 76, duration: 8, delay: 0.5 },
  { id: 4, type: "dot", content: "•", x: 82, y: 70, duration: 11, delay: 2 },
  { id: 5, type: "emoji", content: "🍃", x: 90, y: 46, duration: 9.5, delay: 1.5 },
  { id: 6, type: "emoji", content: "🌷", x: 8, y: 48, duration: 10.5, delay: 2.2 },
  { id: 7, type: "emoji", content: "⭐", x: 34, y: 88, duration: 8.5, delay: 0.7 },
];

export default function SecretGiftGate({ children }: SecretGiftGateProps) {
  const [stage, setStage] = useState<GateStage>("checking");
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const inputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const expirationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearExpirationTimer = () => {
    if (expirationTimerRef.current) {
      clearTimeout(expirationTimerRef.current);
      expirationTimerRef.current = null;
    }
  };

  const scheduleExpiration = (expiresAt: number) => {
    clearExpirationTimer();
    const remainingMs = expiresAt - Date.now();
    if (remainingMs <= 0) {
      handleLockAgain();
      return;
    }
    expirationTimerRef.current = setTimeout(() => {
      handleLockAgain();
    }, remainingMs);
  };

  // ── Session Authentication Check on Mount ──────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);

    // Allow manual relock via URL (?lock=true or ?reset=true)
    if (urlParams.get("lock") === "true" || urlParams.get("reset") === "true") {
      handleLockAgain();
      return;
    }

    const checkActiveSession = async () => {
      try {
        const cached = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed.expiresAt && Date.now() >= parsed.expiresAt) {
              handleLockAgain();
              return;
            }
          } catch {}
        }

        const res = await fetch("/api/auth", { method: "GET" });
        const data = await res.json();

        if (data.authenticated && data.expiresAt && Date.now() < data.expiresAt) {
          scheduleExpiration(data.expiresAt);
          setStage("unlocked");
          return;
        }
      } catch (err) {
        console.warn("Session check error:", err);
      }

      setStage("locked");
    };

    checkActiveSession();

    return () => clearExpirationTimer();
  }, []);

  // Autofocus input when locked screen appears
  useEffect(() => {
    if (stage === "locked") {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // Subtle interactive parallax mouse movement
  const handleMouseMove = (e: React.MouseEvent) => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 6;
    const y = (e.clientY / innerHeight - 0.5) * 6;
    setMouseOffset({ x, y });
  };

  // ── WhatsApp Ask Action ──────────────────────────────────────────────────
  const handleAskForPassword = () => {
    const prefilledText = "Okay, what's the password? 👀";
    const waUrl = `https://wa.me/${TARGET_WHATSAPP_NUMBER}?text=${encodeURIComponent(
      prefilledText
    )}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");

    // Optional subtle celebratory puff
    try {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.7 },
        colors: ["#248A52", "#DDF5E7", "#F7C8D0"],
      });
    } catch {}
  };

  // ── Server-Side Password Submission ────────────────────────────────────────
  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifying) return;

    const entered = passwordInput.trim();
    if (!entered) {
      setIsShaking(true);
      setErrorMsg("Wait, you didn't even type anything! 😂");
      setTimeout(() => setIsShaking(false), 450);
      return;
    }

    setIsVerifying(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: entered }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Save session locally
        try {
          sessionStorage.setItem(
            SESSION_STORAGE_KEY,
            JSON.stringify({
              token: data.token,
              expiresAt: data.expiresAt,
            })
          );
        } catch {}

        scheduleExpiration(data.expiresAt);

        // Smooth unlock sequence: Granted playful animation (1.3s)
        setStage("granted");
        try {
          confetti({
            particleCount: 65,
            spread: 80,
            origin: { y: 0.55 },
            colors: ["#F7C8D0", "#F4A9B8", "#DDF5E7", "#FED7AA", "#BAE6FD"],
          });
        } catch {}

        setTimeout(() => {
          setStage("unlocked");
        }, 1350);
      } else {
        const nextAttempts = wrongAttempts + 1;
        setWrongAttempts(nextAttempts);

        let playfulMsg: string;
        if (nextAttempts >= 4) {
          playfulMsg = "Okay detective, slow down 😂";
        } else {
          const pool = PLAYFUL_WRONG_MESSAGES.filter((m) => m !== errorMsg);
          playfulMsg =
            pool[Math.floor(Math.random() * pool.length)] ||
            PLAYFUL_WRONG_MESSAGES[0];
        }

        setIsShaking(true);
        setErrorMsg(playfulMsg);
        setTimeout(() => {
          setIsShaking(false);
          inputRef.current?.focus();
        }, 450);
      }
    } catch {
      setIsShaking(true);
      setErrorMsg("Ummm... that's not it 😂");
      setTimeout(() => setIsShaking(false), 450);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLockAgain = () => {
    clearExpirationTimer();
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      fetch("/api/auth", { method: "DELETE" }).catch(() => {});
    } catch {}
    setPasswordInput("");
    setErrorMsg("");
    setWrongAttempts(0);
    setStage("locked");
  };

  // ── Render 1: Unlocked State (Protected Content Visible) ────────────────────
  if (stage === "unlocked") {
    return (
      <div className="relative w-full h-full">
        {React.isValidElement(children)
          ? React.cloneElement(
              children as React.ReactElement<{ autoStartMusic?: boolean }>,
              {
                autoStartMusic: true,
              }
            )
          : children}

        {/* Small floating lock-again toggle tucked in bottom-right */}
        <div className="fixed bottom-3 right-3 z-40 flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
          <button
            onClick={handleLockAgain}
            title="Lock page & end session"
            className="px-2.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-[#4A3832] shadow-xs border border-[#F7C8D0] text-[11px] font-sans flex items-center gap-1.5 cursor-pointer backdrop-blur-xs transition-transform active:scale-95"
          >
            <RotateCcw className="w-3 h-3 text-[#F4A9B8]" />
            <span className="hidden sm:inline font-medium">Lock Page</span>
          </button>
        </div>
      </div>
    );
  }

  // ── Render 2: Checking State ───────────────────────────────────────────────
  if (stage === "checking") {
    return (
      <div className="w-screen h-[100dvh] bg-[#FBF7F2] flex flex-col items-center justify-center">
        <div className="w-7 h-7 border-2 border-[#F4A9B8] border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-sans text-[#927E76] tracking-wide">
          Unlocking your little surprise...
        </span>
      </div>
    );
  }

  // ── Render 3: Cute & Playful Digital Scrapbook Password Gate ───────────────
  return (
    <div
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 w-screen h-[100dvh] bg-[#FBF7F2] bg-[radial-gradient(ellipse_at_25%_20%,rgba(247,200,208,0.28),transparent_55%),radial-gradient(ellipse_at_80%_80%,rgba(254,215,170,0.24),transparent_55%)] flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden select-none"
    >
      {/* Subtle Paper Grain Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 5–8 Subtle Floating Decorative Elements drifting slowly */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
        {FLOATING_ELEMENTS.map((elem) => (
          <motion.div
            key={elem.id}
            animate={{
              y: [0, -12, 0],
              x: [0, 6, 0],
              rotate: [0, 10, -8, 0],
              opacity: [0.35, 0.55, 0.35],
            }}
            transition={{
              duration: elem.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: elem.delay,
            }}
            style={{ left: `${elem.x}%`, top: `${elem.y}%` }}
            className="absolute select-none text-xs sm:text-sm"
          >
            {elem.type === "dot" ? (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#F7C8D0]/60" />
            ) : (
              <span>{elem.content}</span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Warm Ambient Glow Behind Card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[440px] h-80 sm:h-[440px] bg-[#F7C8D0]/22 rounded-full blur-[115px] pointer-events-none" />

      {/* Main Card Container with Subtle Float & Gentle Parallax */}
      <motion.div
        ref={cardRef}
        animate={{
          y: [-2, 2, -2],
          x: mouseOffset.x,
        }}
        transition={{
          y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
          x: { type: "spring", stiffness: 100, damping: 25 },
        }}
        className="relative z-10 w-[92%] sm:w-full max-w-[480px] sm:max-w-[510px]"
      >
        <AnimatePresence mode="wait">
          {/* ── STAGE A: PLAYFUL LOCKED GATE ─────────────────────────────────── */}
          {stage === "locked" && (
            <motion.div
              key="locked-card"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className={`relative bg-[#FFFDFC] rounded-[30px] sm:rounded-[34px] border-2 border-[#F7C8D0]/70 shadow-[0_20px_60px_-15px_rgba(74,56,50,0.08),0_4px_16px_rgba(244,169,184,0.12)] p-6 sm:p-8 flex flex-col items-center text-center ${
                isShaking ? "animate-wiggle" : ""
              }`}
            >
              {/* Decorative Corner Scrapbook Stickers */}
              {/* Top-Left Taped Flower */}
              <div
                aria-hidden="true"
                className="absolute -top-3.5 -left-2.5 px-2.5 py-0.5 rounded-md bg-[#FFF0F3] border border-[#F7C8D0] shadow-2xs rotate-[-10deg] pointer-events-none flex items-center gap-1"
              >
                <div className="w-5 h-2 bg-[#F4A9B8]/40 -mt-1.5 mb-0.5 rounded-xs" />
                <span className="text-xs">🌸</span>
              </div>

              {/* Top-Right Star Sticker */}
              <div
                aria-hidden="true"
                className="absolute -top-3 -right-2 px-2 py-0.5 rounded-md bg-[#FEF3C7] border border-[#FDE68A] shadow-2xs rotate-[8deg] pointer-events-none"
              >
                <span className="text-xs">✨</span>
              </div>

              {/* Handwritten "psst... ⤵" Sticker Arrow (Desktop) */}
              <div
                aria-hidden="true"
                className="hidden md:flex absolute -left-20 bottom-16 flex-col items-center pointer-events-none -rotate-6 select-none"
              >
                <span className="font-handwriting text-base font-bold text-[#9C3852]">
                  psst...
                </span>
                <span className="font-handwriting text-2xl text-[#F4A9B8] leading-none">
                  ⤵
                </span>
              </div>

              {/* Bottom-Right Tiny Heart Sticker */}
              <div
                aria-hidden="true"
                className="hidden sm:block absolute -bottom-2.5 -right-2 p-1.5 rounded-full bg-[#FFF0F3] border border-[#F7C8D0] shadow-2xs rotate-[12deg] pointer-events-none"
              >
                <span className="text-xs">💖</span>
              </div>

              {/* ── Top Scrapbook Badge & Sticker Tape Label ── */}
              <div className="flex flex-col items-center mb-2.5">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFF0F3] border border-[#F7C8D0] text-[#9C3852] font-sans text-xs font-semibold shadow-2xs">
                  <span>🌷</span>
                  <span>A little surprise for you</span>
                </div>
                <div className="mt-1 px-2.5 py-0.5 rounded-xs bg-[#FAF0E6] border border-dashed border-[#EBDCD0] text-[11px] font-handwriting text-[#927E76] -rotate-1 shadow-2xs">
                  private entry
                </div>
              </div>

              {/* ── Main Title & Teasing Lines ── */}
              <h1 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#4A3832] leading-tight mt-1">
                Wait... one tiny thing 👀
              </h1>
              <p className="font-sans text-xs sm:text-sm text-[#786457] mt-1.5 leading-relaxed">
                I can&apos;t just let you walk in that easily.
              </p>
              <p className="font-sans text-xs sm:text-sm text-[#786457] mt-0.5 leading-relaxed">
                You&apos;ll have to ask me for the secret first.
              </p>

              {/* ── Playful Teasing Handwritten Note ── */}
              <div className="w-full my-3 px-3.5 py-2 rounded-2xl bg-[#FFF5F7] border border-dashed border-[#F7C8D0] text-center">
                <p className="font-handwriting text-base sm:text-lg text-[#9C3852] font-bold leading-tight">
                  Yes. I&apos;m serious. 😂
                </p>
                <p className="font-handwriting text-sm sm:text-base text-[#927E76] font-medium mt-0.5">
                  There&apos;s no cheating your way around this one.
                </p>
              </div>

              {/* ── Password Form ── */}
              <form onSubmit={handleUnlockSubmit} className="w-full flex flex-col gap-2.5 mt-1">
                <div className="relative w-full">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F4A9B8]" />
                  <input
                    ref={inputRef}
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    placeholder="Enter the secret password..."
                    autoComplete="current-password"
                    spellCheck="false"
                    disabled={isVerifying}
                    className={`w-full pl-10 pr-11 py-3 text-center font-mono font-bold text-sm sm:text-base tracking-widest uppercase rounded-2xl bg-[#FAF7F2] border-2 transition-all text-[#4A3832] placeholder:text-[#927E76]/65 placeholder:tracking-normal placeholder:font-sans placeholder:font-normal shadow-inner disabled:opacity-50 ${
                      errorMsg
                        ? "border-[#F4A9B8] bg-[#FFF5F7] focus:border-[#F4A9B8] focus:ring-4 focus:ring-[#F7C8D0]/40"
                        : "border-[#F7C8D0] focus:border-[#F4A9B8] focus:bg-[#FFFDFC] focus:outline-hidden focus:ring-4 focus:ring-[#F7C8D0]/30"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#927E76] hover:text-[#4A3832] rounded-lg transition-colors cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Soft Playful Error Highlight */}
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-sans font-semibold text-[#BE185D] bg-[#FFF0F3] border border-[#F7C8D0] px-3.5 py-1.5 rounded-xl text-center shadow-2xs"
                  >
                    {errorMsg}
                  </motion.div>
                )}

                {/* Main Unlock Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isVerifying || !passwordInput.trim()}
                  className="w-full mt-1 py-3 px-6 rounded-full bg-gradient-to-r from-[#F7C8D0] via-[#F4A9B8] to-[#F7C8D0] hover:from-[#F4A9B8] hover:to-[#EE92A5] text-white font-sans font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 btn-cute"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Checking the secret...</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" />
                      <span>Open the surprise ✨</span>
                    </>
                  )}
                </motion.button>
              </form>

              {/* ── "Don't know the password?" Section ── */}
              <div className="w-full mt-4 pt-3.5 border-t border-dashed border-[#F7C8D0]/70 flex flex-col items-center">
                <span className="font-sans font-medium text-xs text-[#927E76]">
                  Don&apos;t know the password?
                </span>
                <span className="font-sans font-semibold text-xs text-[#4A3832] mt-0.5">
                  Well... there&apos;s only one way to find out. 👀
                </span>

                {/* WhatsApp Action Button */}
                <motion.button
                  type="button"
                  onClick={handleAskForPassword}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-2.5 py-3 px-5 rounded-full bg-[#DDF5E7] hover:bg-[#C9EED7] border border-[#A7F3D0] text-[#248A52] font-sans font-bold text-xs sm:text-sm shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  title="Ask Anuj for the password on WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 text-[#248A52]" />
                  <span>💬 Ask Anuj for the password</span>
                </motion.button>

                <span className="font-sans text-[11px] text-[#927E76] mt-1.5">
                  Yes, you actually have to text me 😂
                </span>

                {/* Playful Alternative Message */}
                <div className="mt-2 text-center">
                  <span className="font-handwriting text-sm text-[#927E76]">
                    Trying to guess it?{" "}
                    <strong className="text-[#9C3852] font-semibold">
                      Nice try. 😌
                    </strong>
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STAGE B: PLAYFUL SUCCESS STATE ──────────────────────────────── */}
          {stage === "granted" && (
            <motion.div
              key="granted-card"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.04, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative bg-[#FFFDFC] rounded-[30px] sm:rounded-[34px] border-2 border-[#86EFAC] shadow-xl p-8 sm:p-10 flex flex-col items-center text-center overflow-hidden"
            >
              <div className="w-16 h-16 rounded-full bg-[#DDF5E7] border-2 border-[#86EFAC] flex items-center justify-center text-[#248A52] mb-3 shadow-sm animate-bounce">
                <Sparkles className="w-8 h-8 text-[#248A52]" />
              </div>

              <span className="text-[11px] font-mono font-bold tracking-widest text-[#248A52] uppercase mb-1">
                ✦ VERIFIED ✦
              </span>

              <h2 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#14532D] mb-1 leading-tight">
                Okay... you got in. 👀
              </h2>

              <p className="font-sans text-xs sm:text-sm text-[#4A3832] font-medium">
                I guess you were supposed to see this.
              </p>

              <div className="mt-4 px-4 py-1.5 rounded-full bg-[#FFF0F3] border border-[#F7C8D0] text-[#9C3852] font-handwriting text-base sm:text-lg font-bold animate-pulse">
                Unlocking your little surprise... ✨
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Bottom Scrapbook Text ── */}
        <div className="mt-5 text-center select-none">
          <p className="font-handwriting text-base sm:text-lg text-[#927E76] font-medium leading-tight">
            Made with a little too much effort 🌷
          </p>
          <p className="font-handwriting text-sm sm:text-base text-[#927E76]/80 mt-0.5">
            and probably too much overthinking.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
