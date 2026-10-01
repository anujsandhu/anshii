"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, EyeOff, Check, X, ShieldAlert, Sparkles } from "lucide-react";
import { isAnalyticsOptedOut, setAnalyticsOptOut } from "@/lib/analyticsClient";

export default function PrivacyNoticeBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOptedOut, setIsOptedOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const opted = isAnalyticsOptedOut();
    setIsOptedOut(opted);

    const dismissed = sessionStorage.getItem("anshii_privacy_banner_dismissed");
    if (!dismissed) {
      // Show notice after a slight delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!mounted) return null;

  const handleDismiss = () => {
    sessionStorage.setItem("anshii_privacy_banner_dismissed", "true");
    setIsOpen(false);
  };

  const handleToggleOptOut = () => {
    const next = !isOptedOut;
    setAnalyticsOptOut(next);
    setIsOptedOut(next);
    sessionStorage.setItem("anshii_privacy_banner_dismissed", "true");
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-3 left-3 sm:bottom-4 sm:left-4 z-50 max-w-sm w-[calc(100vw-24px)] bg-[#fffdfa]/95 backdrop-blur-md rounded-2xl border-2 border-[#ebdcd0] shadow-[0_12px_32px_rgba(80,50,30,0.14)] p-4 select-none"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] text-[11px] font-sans font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#22c55e]" />
                <span>Privacy &amp; Memory Recording</span>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 rounded-full text-[#8c7465] hover:text-[#3f2e24] hover:bg-[#f5ece3] transition-colors cursor-pointer"
                title="Dismiss notice"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-[#5c473a] font-sans leading-relaxed mb-3">
              Anonymous activity &amp; uploaded gift photos are stored to make
              this birthday surprise special. We never record passwords,
              keystrokes, cameras, microphones, or personal messages.
            </p>

            <div className="flex items-center gap-2 pt-1 border-t border-[#f0e4d6]">
              <button
                type="button"
                onClick={handleDismiss}
                className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#fda4af] to-[#fb7185] hover:from-[#fb7185] hover:to-[#f43f5e] text-white font-sans font-bold text-xs shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>Got It ✓</span>
              </button>

              <button
                type="button"
                onClick={handleToggleOptOut}
                className="py-1.5 px-2.5 rounded-xl bg-[#f5ece3] hover:bg-[#ebdcd0] text-[#786457] font-sans text-xs transition-all flex items-center gap-1 cursor-pointer"
                title={isOptedOut ? "Enable Analytics" : "Disable Analytics"}
              >
                <EyeOff className="w-3 h-3 text-[#be185d]" />
                <span>{isOptedOut ? "Re-enable" : "Opt Out"}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Tiny Privacy Badge when banner is closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-3 left-3 z-40 p-2 rounded-full bg-white/80 hover:bg-white text-[#786457] hover:text-[#3f2e24] shadow-xs border border-[#ebdcd0] text-[10px] flex items-center gap-1 cursor-pointer backdrop-blur-xs transition-transform hover:scale-105"
          title="Privacy Settings &amp; Recording Notice"
        >
          {isOptedOut ? (
            <ShieldAlert className="w-3.5 h-3.5 text-[#f43f5e]" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5 text-[#16a34a]" />
          )}
          <span className="hidden sm:inline font-sans">
            {isOptedOut ? "Tracking Off" : "Privacy"}
          </span>
        </button>
      )}
    </>
  );
}
