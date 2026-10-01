"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, CheckCircle2, ArrowDown, Gift } from "lucide-react";
import confetti from "canvas-confetti";
import { TulipFlower, DaisyFlower, Wildflower, BabysBreath, BotanicalSprig, PetalSvg } from "@/components/flowers/FlowerSvg";

interface BirthdayHeroProps {
  onUnlockPictures: () => void;
  isUnlocked: boolean;
}

export default function BirthdayHero({ onUnlockPictures, isUnlocked }: BirthdayHeroProps) {
  const [attendanceMarked, setAttendanceMarked] = useState(isUnlocked);
  const [cardOpened, setCardOpened] = useState(false);

  const handleMarkAttendance = () => {
    if (attendanceMarked) return;
    setAttendanceMarked(true);
    onUnlockPictures();
    try {
      confetti({
        particleCount: 50,
        spread: 75,
        origin: { y: 0.6 },
        colors: ["#fda4af", "#fbcfe8", "#d8b4fe", "#fed7aa", "#86efac"],
      });
    } catch {}
  };

  return (
    <section id="greetings" className="relative py-16 sm:py-24 px-4 sm:px-6 max-w-4xl mx-auto select-none">
      {/* Background Soft Doodles & Warm Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[620px] h-[340px] sm:h-[620px] bg-gradient-to-tr from-[#fed7aa]/25 via-[#fbcfe8]/20 to-[#d8b4fe]/20 rounded-full blur-[130px] pointer-events-none" />

      {/* Floating Flowers around the Edges */}
      <div className="absolute top-4 left-2 sm:left-6 pointer-events-none hidden sm:block animate-flower-sway">
        <TulipFlower size={54} color="#fda4af" accentColor="#f43f5e" />
      </div>
      <div className="absolute top-8 right-2 sm:right-6 pointer-events-none hidden sm:block animate-flower-sway-slow">
        <DaisyFlower size={48} color="#fffbeb" accentColor="#fef08a" />
      </div>
      <div className="absolute bottom-12 left-4 pointer-events-none hidden sm:block">
        <BotanicalSprig size={46} color="#86efac" />
      </div>
      <div className="absolute bottom-14 right-4 pointer-events-none hidden sm:block animate-flower-sway">
        <Wildflower size={46} color="#d8b4fe" accentColor="#c084fc" />
      </div>

      {/* Main Physical Birthday Card Paper Board */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="paper-card-warm rounded-3xl p-8 sm:p-14 relative text-center shadow-lg border border-[#ebdcd0]"
      >
        {/* Washi Tape Header */}
        <div className="washi-tape-pink" />

        {/* Top Date Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fdf2f4] border border-[#fbcfe8] text-[#be185d] font-sans text-xs mb-4">
          <Heart className="w-3.5 h-3.5 fill-[#be185d]" />
          <span>28 OCTOBER 2026 // CHAPTER 19</span>
        </div>

        {/* Hand-Drawn Birthday Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold font-handwriting text-[#3f2e24] leading-[1.15]">
          Happy 19th Birthday,
          <span className="block text-[#be185d] mt-1 sm:mt-2">
            Anshika! 🌸
          </span>
        </h1>

        {/* Heartfelt sub-caption */}
        <p className="mt-4 text-base sm:text-lg text-[#6e5849] max-w-lg mx-auto font-sans leading-relaxed">
          &ldquo;Someone had to make you a little digital birthday card instead of just sending a regular text.&rdquo;
        </p>

        {/* Interactive Little Card / Gift Box Element */}
        <div className="mt-8 flex flex-col items-center">
          <motion.div
            onClick={() => setCardOpened(!cardOpened)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="cursor-pointer group flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-[#fff8f0] border border-[#ebd8c5] shadow-xs text-xs font-sans text-[#786457] hover:border-[#fda4af] transition-all"
          >
            <Gift className="w-4 h-4 text-[#f43f5e] group-hover:rotate-12 transition-transform" />
            <span>{cardOpened ? "Click to fold note 💌" : "Tap to open tiny note ✨"}</span>
          </motion.div>

          <AnimatePresence>
            {cardOpened && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="mt-4 p-4 max-w-sm rounded-2xl bg-[#fffefc] border-2 border-dashed border-[#fda4af] text-center shadow-xs"
              >
                <p className="font-handwriting text-xl text-[#3f2e24] leading-relaxed">
                  Wishing you the kindest, happiest, and most memorable 19th year ahead. May all your goals compile without errors! 🌷
                </p>
                <span className="text-[11px] text-[#a0897a] font-sans block mt-1">
                  — from Anuj
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Task 01: Task-Gated Unlock for Pictures Section */}
        <div className="mt-10 pt-8 border-t border-[#f0e4d6] max-w-md mx-auto">
          {!attendanceMarked ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3 p-5 rounded-2xl bg-[#fffaf5] border border-[#eddccc]"
            >
              <div className="inline-flex items-center gap-1.5 text-xs font-handwriting text-xl text-[#b45309]">
                <span>Task 01: Pehle attendance lagao ✍️</span>
              </div>
              <p className="text-xs text-[#786457] font-sans">
                Rule #1 of college: You cannot unlock the photo scrapbook without marking attendance first!
              </p>
              <button
                onClick={handleMarkAttendance}
                className="px-6 py-2.5 rounded-xl bg-[#fda4af] hover:bg-[#fb7185] text-[#4c0519] font-sans font-bold text-xs shadow-sm transition-all cursor-pointer btn-cute flex items-center justify-center gap-2 mx-auto"
              >
                <Sparkles className="w-3.5 h-3.5 fill-[#be185d] text-[#be185d]" />
                <span>[ MARK ATTENDANCE ✍️ ]</span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] flex flex-col items-center gap-1 text-[#065f46]"
            >
              <div className="flex items-center gap-1.5 font-sans font-semibold text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                <span>TASK 01 COMPLETE ✓</span>
              </div>
              <p className="text-xs font-sans text-[#047857]">
                &ldquo;Accha ji, attendance marked! Okayyy topper, you passed.&rdquo;
              </p>
              <span className="text-[11px] text-[#059669] font-sans mt-0.5 font-medium">
                Photo Scrapbook Unlocked Below ↓
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
