"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  CheckCircle2,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import confetti from "canvas-confetti";
import PetalParticles from "@/components/flowers/PetalParticles";
import SendWhatsAppNotificationButton from "./SendWhatsAppNotificationButton";

interface SecretGiftGateProps {
  children: React.ReactNode;
}

type GateStage = "checking" | "locked" | "granted" | "unlocked";

const SESSION_STORAGE_KEY = "anshii_auth_session";

export default function SecretGiftGate({ children }: SecretGiftGateProps) {
  const [stage, setStage] = useState<GateStage>("checking");
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const expirationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearExpirationTimer = () => {
    if (expirationTimerRef.current) {
      clearTimeout(expirationTimerRef.current);
      expirationTimerRef.current = null;
    }
  };

  // Schedule automatic session expiration in client
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

    // Verify session server-side
    const checkActiveSession = async () => {
      try {
        // First check local session timestamp
        const cached = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed.expiresAt && Date.now() >= parsed.expiresAt) {
              // Expired locally
              handleLockAgain();
              return;
            }
          } catch {}
        }

        // Verify with server endpoint
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
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [stage]);

  // ── Server-Side Password Submission ────────────────────────────────────────
  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifying) return;

    const entered = passwordInput.trim();
    if (!entered) {
      setIsShaking(true);
      setErrorMsg("Please enter the password.");
      setTimeout(() => setIsShaking(false), 500);
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

        // Smooth unlock sequence: Granted animation -> smooth transition to private page
        setStage("granted");
        try {
          confetti({
            particleCount: 65,
            spread: 75,
            origin: { y: 0.55 },
            colors: ["#fda4af", "#86efac", "#bae6fd", "#fbcfe8", "#fed7aa"],
          });
        } catch {}

        setTimeout(() => {
          setStage("unlocked");
        }, 1400);
      } else {
        setIsShaking(true);
        setErrorMsg(
          data.error || "Incorrect password. Please check and try again."
        );
        setTimeout(() => {
          setIsShaking(false);
          inputRef.current?.focus();
        }, 500);
      }
    } catch (err) {
      setIsShaking(true);
      setErrorMsg("Network error. Please try again.");
      setTimeout(() => setIsShaking(false), 500);
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
    setStage("locked");
  };

  // ── Render 1: Unlocked State (Private Page Access) ──────────────────────────
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

        {/* Unobtrusive Floating Lock/Logout Button (tucked in bottom right) */}
        <div className="fixed bottom-3 right-3 z-40 flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
          <button
            onClick={handleLockAgain}
            title="Lock private page & end session"
            className="px-2.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-[#786457] hover:text-[#3f2e24] shadow-xs border border-[#ebdcd0] text-[11px] font-sans flex items-center gap-1.5 cursor-pointer backdrop-blur-xs transition-transform active:scale-95"
          >
            <RotateCcw className="w-3 h-3 text-[#fb7185]" />
            <span className="hidden sm:inline font-medium">Lock Page</span>
          </button>
        </div>
      </div>
    );
  }

  // ── Render 2: Checking State (Prevents UI Flicker) ──────────────────────────
  if (stage === "checking") {
    return (
      <div className="w-screen h-[100dvh] bg-[#faf7f2] flex flex-col items-center justify-center">
        <div className="w-7 h-7 border-2 border-[#fda4af] border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-sans text-[#a89080] tracking-wide">
          Verifying session...
        </span>
      </div>
    );
  }

  // ── Render 3: Locked Entry Screen & Smooth Unlock Animation ────────────────
  return (
    <div className="fixed inset-0 z-50 w-screen h-[100dvh] bg-[#faf7f2] flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* Background Soft Ambient Particles */}
      <PetalParticles count={14} />

      {/* Background Soft Pastel Ambient Glows */}
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-96 h-80 sm:h-96 bg-[#fda4af]/18 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 translate-x-1/2 translate-y-1/2 w-80 sm:w-110 h-80 sm:h-110 bg-[#fed7aa]/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md">
        <AnimatePresence mode="wait">
          {/* STAGE A: LOCKED PASSWORD FORM */}
          {stage === "locked" && (
            <motion.div
              key="locked-card"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={`relative bg-[#fffdfa] rounded-3xl border-2 border-[#ebdcd0] shadow-[0_16px_50px_rgba(120,80,50,0.08)] p-6 sm:p-8 flex flex-col items-center text-center ${
                isShaking ? "animate-wiggle" : ""
              }`}
            >
              {/* Minimal Top Lock Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff0f3] border border-[#fbcfe8] text-[#be185d] font-sans text-xs font-semibold mb-3.5 shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-[#fb7185]" />
                <span>Protected Private Page</span>
              </div>

              {/* Title & Subtitle */}
              <h1 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#3f2e24] leading-tight">
                Enter Password
              </h1>
              <p className="font-sans text-xs sm:text-sm text-[#786457] mt-1.5 mb-6 max-w-xs leading-relaxed">
                This page is private. Please enter the password to unlock access.
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
                    placeholder="Enter password"
                    autoComplete="current-password"
                    autoCapitalize="characters"
                    spellCheck="false"
                    disabled={isVerifying}
                    className="w-full px-4 py-3.5 pr-11 text-center font-mono font-bold text-sm sm:text-base tracking-widest uppercase rounded-2xl bg-[#faf7f2] border-2 border-[#ebdcd0] focus:border-[#fb7185] focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-[#fda4af]/20 transition-all text-[#3f2e24] placeholder:text-[#bda495] placeholder:tracking-normal placeholder:font-sans placeholder:font-normal shadow-inner disabled:opacity-50"
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

                {/* Error Message Feedback with Shake Effect */}
                {errorMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-sans font-medium text-[#e11d48] bg-[#fff1f2] border border-[#fecdd3] px-3.5 py-2 rounded-xl text-center"
                  >
                    {errorMsg}
                  </motion.p>
                )}

                {/* Unlock Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isVerifying || !passwordInput.trim()}
                  className="w-full mt-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#fda4af] to-[#fb7185] hover:from-[#fb7185] hover:to-[#f43f5e] text-white font-sans font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 btn-cute"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>UNLOCK ACCESS →</span>
                    </>
                  )}
                </motion.button>
              </form>

              {/* ── WhatsApp Notification Button ── */}
              <div className="w-full mt-5 pt-4 border-t border-[#ebdcd0]/70 flex flex-col items-center">
                <span className="text-[11px] font-sans text-[#a89080] mb-2">
                  Need to notify or reach Anuj?
                </span>
                <SendWhatsAppNotificationButton variant="entry" />
              </div>
            </motion.div>
          )}

          {/* STAGE B: SMOOTH UNLOCK ANIMATION */}
          {stage === "granted" && (
            <motion.div
              key="granted-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.05, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-[#fffdfa] rounded-3xl border-2 border-[#bbf7d0] shadow-2xl p-8 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#f0fdf4] border-2 border-[#86efac] flex items-center justify-center text-[#16a34a] mb-4 shadow-sm animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <span className="text-[11px] font-mono font-bold tracking-widest text-[#15803d] uppercase mb-1">
                ✦ VERIFIED ✦
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#14532d] mb-1">
                Access Granted ✓
              </h2>
              <p className="text-xs sm:text-sm text-[#3f6212] font-sans">
                Opening your private experience...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
