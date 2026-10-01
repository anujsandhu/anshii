"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Sparkles, Heart, MessageCircle } from "lucide-react";
import confetti from "canvas-confetti";
import FinalBloom from "@/components/flowers/FinalBloom";
import { TulipFlower, Wildflower } from "@/components/flowers/FlowerSvg";

interface Frame7FinalProps {
  onReplay: () => void;
}

export default function Frame7Final({ onReplay }: Frame7FinalProps) {
  const [celebrated, setCelebrated] = useState(false);

  const handleCelebrateAgain = () => {
    setCelebrated(true);
    try {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: ["#fda4af", "#fbcfe8", "#d8b4fe", "#bae6fd", "#fed7aa", "#86efac"],
      });
    } catch {}
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center px-3 sm:px-6 select-none overflow-y-auto overflow-x-hidden no-scrollbar pt-[max(58px,calc(var(--sat)+50px))] pb-[max(72px,calc(var(--sab)+64px))]">
      {/* Background Soft Sunset/Blush Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[560px] h-[320px] sm:h-[560px] bg-gradient-to-tr from-[#fed7aa]/25 via-[#fbcfe8]/25 to-[#d8b4fe]/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Paper Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg paper-card-warm rounded-3xl border border-[#ebdcd0] shadow-xl text-center relative z-10 overflow-hidden my-auto p-4 sm:p-7"
      >
        <div className="washi-tape-pink" />

        {/* Flanking Flowers */}
        <div className="absolute top-4 left-3 pointer-events-none hidden sm:block animate-flower-sway opacity-80">
          <TulipFlower size={38} color="#fda4af" accentColor="#f43f5e" />
        </div>
        <div className="absolute top-4 right-3 pointer-events-none hidden sm:block animate-flower-sway-slow opacity-80">
          <Wildflower size={34} color="#d8b4fe" accentColor="#c084fc" />
        </div>

        {/* Final Bloom SVG — now compact */}
        <div className="mb-0.5">
          <FinalBloom onComplete={handleCelebrateAgain} />
        </div>

        {/* Conversational Pause */}
        <div className="text-amber-800/70 font-handwriting text-lg tracking-wide mb-0.5">
          One last thing...
        </div>

        {/* Grand Birthday Message — tighter sizing */}
        <h2
          className="font-bold font-handwriting text-[#3f2e24] leading-[1.1] mt-0.5"
          style={{ fontSize: "clamp(28px, 7vw, 48px)" }}
        >
          Happy 19th,
          <span className="block text-[#be185d]">Anshika.</span>
        </h2>

        {/* Sincere Line — compact handwriting */}
        <p
          className="mt-2 font-handwriting text-[#786457] leading-snug"
          style={{ fontSize: "clamp(13px, 3.2vw, 20px)" }}
        >
          &ldquo;Somewhere between the random conversations, the jokes, the reels&hellip;
          you became someone who matters to me.&rdquo;
        </p>

        {/* Warm Signature */}
        <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fdf2f4] border border-[#fbcfe8] text-xs text-[#be185d] font-sans">
          <Heart className="w-3 h-3 fill-[#be185d]" />
          <span>With love, <strong>Anuj</strong></span>
          <span className="text-[#a0897a]">&bull;</span>
          <span className="text-[11px] text-[#8c7465]">28 October 2026</span>
        </div>

        {/* Buttons */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={handleCelebrateAgain}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#fda4af] hover:bg-[#fb7185] text-[#4c0519] font-sans font-bold text-xs shadow-md transition-all cursor-pointer btn-cute"
          >
            <Sparkles className="w-3.5 h-3.5 fill-[#be185d] text-[#be185d]" />
            <span>Celebrate Again ✨</span>
          </button>

          <button
            onClick={onReplay}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#f5ede4] hover:bg-[#ebdcd0] border border-[#e3d3c4] text-[#4a3528] font-sans text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3 h-3 text-[#b45309]" />
            <span>Replay ↻</span>
          </button>

          <a
            href="/conversation"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#fdf2f4] hover:bg-[#fce7ed] border border-[#fbcfe8] text-[#be185d] font-sans text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Our Instagram Chat 💌</span>
          </a>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-[#ebdcd0] text-[10px] text-[#8c7465] font-sans">
          Made with love by Anuj, for someone who became unusually important 🌸
        </div>
      </motion.div>
    </div>
  );
}
