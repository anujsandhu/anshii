"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Laptop, Sparkles, Heart, Monitor, ShieldAlert } from "lucide-react";
import PetalParticles from "./flowers/PetalParticles";
import { TulipFlower, DaisyFlower } from "./flowers/FlowerSvg";
import { FloralCorner } from "./flowers/FloralFrame";

interface ScreenSizeGateProps {
  children: React.ReactNode;
}

export default function ScreenSizeGate({ children }: ScreenSizeGateProps) {
  const [windowWidth, setWindowWidth] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isTester, setIsTester] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateSize = () => {
      setWindowWidth(window.innerWidth);
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    try {
      const isAnuj =
        sessionStorage.getItem("anshii_user_role") === "anuj" ||
        sessionStorage.getItem("anshii_tester_bypass") === "true";
      if (isAnuj) setIsTester(true);
    } catch {}

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  if (isTester) {
    return <>{children}</>;
  }

  const isSmallScreen = mounted && windowWidth !== null && windowWidth < 1024;

  return (
    <>
      {/* ── CSS HARD GATE FOR SMALL SCREENS (< 1024px) ── */}
      {/* Shows on all mobile/tablet viewports even before hydration */}
      <div className="block lg:hidden fixed inset-0 z-[999999] w-screen h-[100dvh] overflow-hidden bg-[#faf7f2] text-[#3f2e24] select-none flex flex-col items-center justify-center p-4">
        {/* Ambient floating petals */}
        <PetalParticles count={16} />

        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-[#fed7aa]/30 via-[#fbcfe8]/30 to-[#d8b4fe]/25 rounded-full blur-[120px] pointer-events-none" />

        {/* Floating corner flowers */}
        <div className="absolute top-4 left-4 pointer-events-none opacity-60">
          <TulipFlower size={42} color="#fda4af" accentColor="#f43f5e" />
        </div>
        <div className="absolute top-4 right-4 pointer-events-none opacity-60">
          <DaisyFlower size={38} color="#fffbeb" accentColor="#fef08a" />
        </div>

        {/* Main Laptop Gate Paper Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-sm paper-card-warm rounded-3xl border-2 border-[#ebdcd0] shadow-2xl p-6 text-center overflow-hidden"
        >
          {/* Top washi tape */}
          <div className="washi-tape-pink shrink-0 !top-1" />

          {/* Botanical corners */}
          <FloralCorner
            className="absolute top-2 left-2 pointer-events-none opacity-30 z-0"
            size={22}
            color="#86efac"
            flowerColor="#fda4af"
          />
          <FloralCorner
            className="absolute top-2 right-2 pointer-events-none opacity-30 rotate-90 z-0"
            size={22}
            color="#86efac"
            flowerColor="#d8b4fe"
          />

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-xs font-sans font-semibold mb-3 shadow-2xs">
            <Laptop className="w-3.5 h-3.5 text-[#ef4444]" />
            <span>Laptop / Large Screen Only</span>
          </div>

          {/* Animated Laptop Icon with Flowers */}
          <div className="relative my-2 flex items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#fff0f3] to-[#fdf2f8] border-2 border-[#fbcfe8] flex items-center justify-center shadow-inner relative">
              <Laptop className="w-10 h-10 text-[#be185d] animate-pulse" />
              <div className="absolute -top-1.5 -right-1.5 bg-[#fef3c7] border border-[#fde68a] text-[#b45309] text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-xs">
                ✨
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="font-handwriting text-3xl font-bold text-[#3f2e24] leading-tight mt-1">
            Madam Ji, Please Open on a Laptop! 💻🌸
          </h1>

          {/* Playful description */}
          <p className="mt-2 text-xs font-sans text-[#786457] leading-relaxed">
            This 19th birthday scrapbook was handcrafted with lots of music, interactive cards, photos, and letters designed <strong className="text-[#be185d]">specifically for a laptop or desktop screen</strong>.
          </p>

          <p className="mt-2 text-[11px] font-sans text-[#a89080] italic leading-snug">
            Small screens are strictly locked — please grab your laptop, turn the volume up, and enjoy your birthday surprise properly! 🤍
          </p>

          {/* Device indicator pill */}
          <div className="mt-4 p-2.5 rounded-2xl bg-[#fffdfa] border border-[#ebdcd0] text-[11px] font-sans text-[#8c7465] flex items-center justify-between">
            <span className="flex items-center gap-1 font-semibold text-[#dc2626]">
              <span className="w-2 h-2 rounded-full bg-[#dc2626] animate-ping" />
              Phone Screen
            </span>
            <span className="text-[10px] font-mono font-bold text-[#be185d] bg-[#fdf2f4] px-2 py-0.5 rounded-md">
              Need 1024px+
            </span>
          </div>

          {/* Reassurance signature */}
          <div className="mt-4 pt-2.5 border-t border-[#f0e4da] flex items-center justify-center gap-1.5 text-[11px] font-handwriting text-[#be185d]">
            <Heart className="w-3 h-3 fill-[#be185d]" />
            <span>Worth opening on your laptop, promise &mdash; Anuj</span>
          </div>
        </motion.div>
      </div>

      {/* ── DESKTOP & LAPTOP VIEW (>= 1024px) ── */}
      {/* Hidden completely on small screens, renders cleanly on laptop */}
      <div className="hidden lg:block w-full h-full">
        {children}
      </div>
    </>
  );
}
