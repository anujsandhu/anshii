"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Sparkles, Heart, Lock } from "lucide-react";
import confetti from "canvas-confetti";
import FinalBloom from "@/components/flowers/FinalBloom";
import { TulipFlower, Wildflower, DaisyFlower, PetalSvg } from "@/components/flowers/FlowerSvg";

interface FinalRevealProps {
  isLocked: boolean;
  onReplay: () => void;
  onPlayFinalSong: () => void;
}

export default function FinalReveal({
  isLocked,
  onReplay,
  onPlayFinalSong,
}: FinalRevealProps) {
  const [revealed, setRevealed] = useState(false);

  const handleOpenGrandFinale = () => {
    setRevealed(true);
    onPlayFinalSong();
    try {
      confetti({
        particleCount: 85,
        spread: 90,
        origin: { y: 0.6 },
        colors: ["#fda4af", "#fbcfe8", "#d8b4fe", "#bae6fd", "#fed7aa", "#86efac"],
      });
    } catch {}
  };

  const handleTriggerCelebration = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 85,
        origin: { y: 0.65 },
        colors: ["#fda4af", "#fbcfe8", "#d8b4fe", "#bae6fd", "#fed7aa", "#86efac"],
      });
    } catch {}
  };

  if (isLocked) {
    return (
      <section className="py-16 px-4 max-w-3xl mx-auto text-center select-none">
        <div className="p-8 rounded-3xl bg-[#f5ede4] border border-[#e3d3c4] max-w-md mx-auto space-y-2">
          <div className="w-10 h-10 rounded-full bg-[#ebdcd0] flex items-center justify-center mx-auto text-[#786457]">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-handwriting text-2xl font-bold text-[#4a3528]">
            Final Chapter Locked
          </h3>
          <p className="text-xs text-[#786457] font-sans">
            Please read and unlock your letter above to reveal the final surprise! 💌
          </p>
        </div>
      </section>
    );
  }

  return (
    <footer className="relative min-h-[90vh] flex flex-col justify-center items-center px-4 sm:px-6 py-24 text-center select-none overflow-hidden">
      {/* Background Soft Sunset/Blush Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[700px] h-[340px] sm:h-[700px] bg-gradient-to-tr from-[#fed7aa]/25 via-[#fbcfe8]/25 to-[#d8b4fe]/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto w-full flex flex-col items-center">
        {!revealed ? (
          /* Pre-reveal teaser card */
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full max-w-md paper-card-warm p-8 sm:p-10 rounded-3xl shadow-xl border border-[#ebdcd0] space-y-4 text-center relative"
          >
            <div className="washi-tape-yellow" />

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#fff0f3] border border-[#fbcfe8] text-[#be185d] font-sans text-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#f43f5e]" />
              <span>The Grand Birthday Climax</span>
            </div>

            <h3 className="font-handwriting text-4xl sm:text-5xl font-bold text-[#3f2e24]">
              One last thing...
            </h3>

            <p className="text-sm text-[#6b5546] font-sans leading-relaxed">
              Before you wrap up exploring this little digital card, there is one final moment waiting to bloom.
            </p>

            <motion.button
              onClick={handleOpenGrandFinale}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-3 px-8 py-3.5 rounded-2xl bg-[#fda4af] hover:bg-[#fb7185] text-[#4c0519] font-sans text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto btn-cute"
            >
              <Sparkles className="w-4 h-4 fill-[#be185d] text-[#be185d]" />
              <span>[ OPEN FINAL SURPRISE 🌸 ]</span>
            </motion.button>
          </motion.div>
        ) : (
          /* Grand Sincere Climax */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="paper-card-warm rounded-3xl p-8 sm:p-14 border border-[#ebdcd0] shadow-xl w-full text-center relative"
          >
            <div className="washi-tape-pink" />

            {/* Flanking SVG Flowers */}
            <div className="absolute top-8 left-4 pointer-events-none hidden sm:block animate-flower-sway">
              <TulipFlower size={54} color="#fda4af" accentColor="#f43f5e" />
            </div>
            <div className="absolute top-8 right-4 pointer-events-none hidden sm:block animate-flower-sway-slow">
              <Wildflower size={50} color="#d8b4fe" accentColor="#c084fc" />
            </div>

            {/* Signature SVG Final Bloom */}
            <div className="mb-2">
              <FinalBloom onComplete={handleTriggerCelebration} />
            </div>

            {/* Subtle Keepsake Polaroids */}
            <div className="flex items-center justify-center -space-x-3 sm:-space-x-4 mb-6 pt-2">
              <div className="w-20 sm:w-24 h-24 sm:h-28 rounded-xl overflow-hidden border-2 border-white shadow-md -rotate-6 transform hover:rotate-0 hover:scale-105 transition-all">
                <Image src="/photos/photo1.jpg" alt="Memory" width={96} height={112} className="w-full h-full object-cover" />
              </div>
              <div className="w-24 sm:w-28 h-28 sm:h-32 rounded-xl overflow-hidden border-2 border-white shadow-lg rotate-2 z-10 transform hover:rotate-0 hover:scale-105 transition-all">
                <Image src="/photos/photo4.jpg" alt="Memory" width={112} height={128} className="w-full h-full object-cover" />
              </div>
              <div className="w-20 sm:w-24 h-24 sm:h-28 rounded-xl overflow-hidden border-2 border-white shadow-md rotate-6 transform hover:rotate-0 hover:scale-105 transition-all">
                <Image src="/photos/photo5.jpg" alt="Memory" width={96} height={112} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Grand Birthday Message */}
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold font-handwriting text-[#3f2e24] leading-[1.1]">
              Happy 19th,
              <span className="block text-[#be185d] mt-1">
                Anshika.
              </span>
            </h2>

            {/* Sincere Wish Line */}
            <p className="mt-4 font-handwriting text-2xl sm:text-3xl font-medium text-[#786457]">
              &ldquo;I hope 19 is extraordinarily kind to you.&rdquo;
            </p>

            {/* Warm Signature */}
            <div className="mt-6 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#fdf2f4] border border-[#fbcfe8] text-sm text-[#be185d] font-sans">
              <Heart className="w-3.5 h-3.5 fill-[#be185d]" />
              <span>With appreciation, <strong>Anuj</strong></span>
              <span className="text-[#a0897a]">•</span>
              <span className="text-xs text-[#8c7465]">28 October 2026</span>
            </div>

            {/* Action Buttons: Celebrate & Replay */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={handleTriggerCelebration}
                className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-[#fda4af] hover:bg-[#fb7185] text-[#4c0519] font-sans font-bold text-xs shadow-sm transition-all cursor-pointer btn-cute"
              >
                <Sparkles className="w-4 h-4 fill-[#be185d] text-[#be185d]" />
                <span>Celebrate Again ✨</span>
              </button>

              <button
                onClick={onReplay}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#f5ede4] hover:bg-[#ebdcd0] border border-[#e3d3c4] text-[#4a3528] font-sans text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#b45309]" />
                <span>Replay the whole thing ↻</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Footer Note */}
        <div className="mt-16 pt-6 border-t border-[#ebdcd0] w-full flex flex-col sm:flex-row items-center justify-between text-xs text-[#8c7465] gap-2 font-sans">
          <div>
            Made with love by Anuj for Anshika • Computer Science &apos;26
          </div>
          <div>
            Turning 19 on October 28, 2026 🌸
          </div>
        </div>
      </div>
    </footer>
  );
}
