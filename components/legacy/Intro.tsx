"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Gift } from "lucide-react";
import confetti from "canvas-confetti";
import { DaisyFlower, TulipFlower, PetalSvg } from "@/components/flowers/FlowerSvg";

interface IntroProps {
  onEnter: () => void;
}

const NO_BUTTON_TEXTS = [
  "NO THANKS",
  "Nice try.",
  "Nope, you're coming with me.",
  "Madam, please.",
  "Accha ji, no choice.",
  "System error: Refusal denied 🙃",
  "Don't be shy!",
  "Just click YES already 😂",
];

export default function Intro({ onEnter }: IntroProps) {
  const [noIndex, setNoIndex] = useState(0);
  const [noOffset, setNoOffset] = useState({ x: 0, y: 0 });
  const [isEntering, setIsEntering] = useState(false);

  const handleNoInteraction = () => {
    // Pick next funny text
    setNoIndex((prev) => (prev + 1) % NO_BUTTON_TEXTS.length);
    // Slight playful jitter offset (not offscreen so it's cute rather than annoying)
    const randomX = (Math.random() - 0.5) * 110;
    const randomY = (Math.random() - 0.5) * 50;
    setNoOffset({ x: randomX, y: randomY });
  };

  const handleYes = () => {
    setIsEntering(true);
    try {
      confetti({
        particleCount: 65,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#fda4af", "#fbcfe8", "#d8b4fe", "#bae6fd", "#fed7aa"],
      });
    } catch {}

    setTimeout(() => {
      onEnter();
    }, 700);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#faf7f2] px-4 overflow-hidden select-none"
    >
      {/* Background Soft Doodles & Pastel Polka Dots */}
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{
        backgroundImage: "radial-gradient(#e5d7c5 1.5px, transparent 1.5px)",
        backgroundSize: "28px 28px",
      }} />

      {/* Floating SVG Flowers in the Corners */}
      <div className="absolute top-6 left-6 pointer-events-none hidden sm:block animate-flower-sway">
        <TulipFlower size={56} color="#fda4af" accentColor="#f43f5e" />
      </div>
      <div className="absolute top-8 right-8 pointer-events-none hidden sm:block animate-flower-sway-slow">
        <DaisyFlower size={50} color="#fffbeb" accentColor="#fef08a" />
      </div>
      <div className="absolute bottom-8 left-10 pointer-events-none hidden sm:block">
        <PetalSvg size={32} color="#fbcfe8" accentColor="#f472b6" rotation={25} />
      </div>
      <div className="absolute bottom-6 right-10 pointer-events-none hidden sm:block animate-flower-sway">
        <TulipFlower size={52} color="#d8b4fe" accentColor="#c084fc" />
      </div>

      {/* Handmade Greeting Card Envelope Container */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md paper-card-warm p-8 sm:p-10 rounded-3xl relative text-center shadow-xl border border-[#e8ded1]"
      >
        {/* Washi Tape at Top */}
        <div className="washi-tape-pink" />

        {/* Postage Stamp Sticker */}
        <div className="absolute -top-3 -right-3 rotate-6 stamp-border rounded-lg shadow-sm hidden sm:block">
          <div className="text-[10px] font-mono text-[#8b5cf6] font-bold px-1.5 py-0.5">
            OCT 28 &apos;26
          </div>
        </div>

        {/* Small greeting label */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-xs font-sans mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#f87171]" />
          <span>A Special Delivery For Anshika</span>
        </div>

        {/* Handwritten Style Heading */}
        <h1 className="text-4xl sm:text-5xl font-bold font-handwriting text-[#3f2e24] leading-tight">
          Hello there!
        </h1>
        <p className="text-xs sm:text-sm font-handwriting text-[#8c7465] text-lg mt-0.5">
          — yes, you! ✨
        </p>

        {/* Card Note Prompt */}
        <div className="mt-5 p-4 rounded-2xl bg-[#fff9f2] border border-[#f3e7d7]">
          <p className="text-base sm:text-lg text-[#4a3528] font-sans font-medium leading-relaxed">
            &ldquo;So... ready for your 19th birthday surprise?&rdquo;
          </p>
          <p className="text-xs text-[#8c7465] mt-1.5 font-sans">
            (P.S. Headphones or sound on recommended 🎧)
          </p>
        </div>

        {/* Cute Interactive Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 relative min-h-[64px]">
          {/* YES PLEASE Button */}
          <motion.button
            onClick={handleYes}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#fda4af] hover:bg-[#fb7185] text-[#4c0519] font-sans font-bold text-sm shadow-md shadow-[#fda4af]/40 hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 btn-cute"
          >
            <Heart className="w-4 h-4 fill-[#be185d] text-[#be185d]" />
            <span>YES PLEASE ✨</span>
          </motion.button>

          {/* NO THANKS Playful Runaway Button */}
          <motion.button
            onMouseEnter={handleNoInteraction}
            onClick={handleNoInteraction}
            animate={{
              x: noOffset.x,
              y: noOffset.y,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 22,
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#f5efe6] hover:bg-[#eae0d2] text-[#6b5647] font-sans text-xs font-semibold border border-[#dcd0bf] transition-colors cursor-pointer select-none"
          >
            {NO_BUTTON_TEXTS[noIndex]}
          </motion.button>
        </div>

        {/* Cute Footer Hint */}
        <div className="mt-6 pt-4 border-t border-[#f0e4d4] flex items-center justify-center gap-2 text-xs text-[#a0897a] font-handwriting text-lg">
          <span>Made with love by Anuj</span>
          <span>•</span>
          <span>Turning 19 today</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
