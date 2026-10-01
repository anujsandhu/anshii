"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles, ArrowDown } from "lucide-react";
import confetti from "canvas-confetti";
import { DaisyFlower, TulipFlower, PetalSvg } from "@/components/flowers/FlowerSvg";

interface Frame1WelcomeProps {
  isCompleted: boolean;
  onCompleteTask: () => void;
  onNext: () => void;
}

const NO_BUTTON_TEXTS = [
  "Nah, I'm good",
  "Haha nice try though",
  "Nope. And yet, here you are.",
  "Madam, just scroll already.",
  "Accha fine, keep clicking then 🙃",
  "Error: stubbornness limit exceeded",
  "Okay you're literally proving my point",
  "Alright, madam. I accept you.",
];

export default function Frame1Welcome({
  isCompleted,
  onCompleteTask,
  onNext,
}: Frame1WelcomeProps) {
  const [noIndex, setNoIndex] = useState(0);
  const [noOffset, setNoOffset] = useState({ x: 0, y: 0 });

  const handleNoInteraction = () => {
    setNoIndex((prev) => (prev + 1) % NO_BUTTON_TEXTS.length);
    const randomX = (Math.random() - 0.5) * 110;
    const randomY = (Math.random() - 0.5) * 45;
    setNoOffset({ x: randomX, y: randomY });
  };

  const handleYes = () => {
    onCompleteTask();
    try {
      confetti({
        particleCount: 65,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#fda4af", "#fbcfe8", "#d8b4fe", "#bae6fd", "#fed7aa"],
      });
    } catch {}
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center px-4 sm:px-6 select-none overflow-y-auto overflow-x-hidden no-scrollbar pt-[max(58px,calc(var(--sat)+50px))] pb-[max(72px,calc(var(--sab)+64px))]">
      {/* Background Soft Doodles & Pastel Polka Dots */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#e5d7c5 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Floating Flowers in Corners */}
      <div className="absolute top-6 left-6 pointer-events-none hidden sm:block animate-flower-sway z-[2] opacity-70">
        <TulipFlower size={56} color="#fda4af" accentColor="#f43f5e" />
      </div>
      <div className="absolute top-8 right-8 pointer-events-none hidden sm:block animate-flower-sway-slow z-[2] opacity-70">
        <DaisyFlower size={50} color="#fffbeb" accentColor="#fef08a" />
      </div>
      <div className="absolute bottom-10 left-10 pointer-events-none hidden sm:block z-[2] opacity-60">
        <PetalSvg size={30} color="#fbcfe8" accentColor="#f472b6" rotation={25} />
      </div>
      <div className="absolute bottom-8 right-10 pointer-events-none hidden sm:block animate-flower-sway z-[2] opacity-70">
        <TulipFlower size={52} color="#d8b4fe" accentColor="#c084fc" />
      </div>

      {/* Handmade Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md paper-card-warm rounded-3xl relative text-center shadow-lg border border-[#e8ded1] z-10 my-auto p-4 sm:p-8"
      >
        <div className="washi-tape-pink" />

        {/* Top Stamp */}
        <div className="absolute -top-3 -right-3 rotate-6 stamp-border rounded-lg shadow-xs hidden sm:block">
          <div className="text-[10px] font-mono text-[#8b5cf6] font-bold px-1.5 py-0.5">
            OCT 28 &apos;26
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-xs font-sans mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-[#f87171]" />
          <span>Something I Made For You, Anshika</span>
        </div>

        {/* Handwritten Heading */}
        <h1
          className="font-bold font-handwriting text-[#3f2e24] leading-tight"
          style={{ fontSize: "clamp(26px, 8vw, 48px)" }}
        >
          Hello there, Anshika!
        </h1>
        <p className="font-handwriting text-[#8c7465] mt-0.5" style={{ fontSize: "clamp(15px, 4.5vw, 20px)" }}>
          &mdash; yes, you! ✨
        </p>

        {/* Card Prompt Note */}
        <div className="mt-3 p-3 sm:p-4 rounded-2xl bg-[#fff9f2] border border-[#f3e7d7]">
          <p className="text-sm sm:text-base text-[#4a3528] font-sans font-medium leading-relaxed">
            &ldquo;So I built you a birthday website. A proper one. Because a plain &apos;hbd&apos; text felt too ordinary for someone who became unusually important.&rdquo;
          </p>
          <p className="text-xs text-[#8c7465] mt-1.5 font-sans">
            Sound on recommended 🎧 &nbsp;&bull;&nbsp; Give it a few minutes, it&apos;s worth it
          </p>
        </div>

        {/* Interactive Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3.5 relative min-h-[58px]">
          {!isCompleted ? (
            <>
              <motion.button
                onClick={handleYes}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-[#fda4af] hover:bg-[#fb7185] text-[#4c0519] font-sans font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 btn-cute"
              >
                <Heart className="w-4 h-4 fill-[#be185d] text-[#be185d]" />
                <span>Okay, I&apos;m curious ✨</span>
              </motion.button>

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
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#f5efe6] hover:bg-[#eae0d2] text-[#6b5647] font-sans text-xs font-semibold border border-[#dcd0bf] transition-colors cursor-pointer select-none"
              >
                {NO_BUTTON_TEXTS[noIndex]}
              </motion.button>
            </>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full flex flex-col items-center gap-3"
            >
              <div className="px-5 py-2 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] text-xs font-sans font-semibold inline-flex items-center gap-1.5">
                <span>✓</span><span>Good. Now keep going 🌷</span>
              </div>
              <button
                onClick={onNext}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#fda4af] to-[#fb7185] hover:from-[#fb7185] hover:to-[#f43f5e] text-white font-sans font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 btn-cute"
              >
                <span>Continue to Birthday Card</span>
                <span className="text-base leading-none">↓</span>
              </button>
            </motion.div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-[#f0e4d4] hidden sm:flex items-center justify-center gap-2 text-xs text-[#a0897a] font-sans">
          <span>Made with love by Anuj</span>
          <span>&bull;</span>
          <span>28 October 2026</span>
        </div>
      </motion.div>
    </div>
  );
}
