"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, CheckCircle2, ArrowDown, Gift } from "lucide-react";
import confetti from "canvas-confetti";

interface Frame2BirthdayProps {
  isCompleted: boolean;
  onCompleteTask: () => void;
  onNext: () => void;
}

export default function Frame2Birthday({
  isCompleted,
  onCompleteTask,
  onNext,
}: Frame2BirthdayProps) {
  const [taskDone, setTaskDone] = useState(isCompleted);
  const [noteOpen, setNoteOpen] = useState(false);

  React.useEffect(() => {
    setTaskDone(isCompleted);
    if (!isCompleted) setNoteOpen(false);
  }, [isCompleted]);


  const handleBloomTask = () => {
    if (taskDone) return;
    setTaskDone(true);
    onCompleteTask();
    try {
      confetti({
        particleCount: 70,
        spread: 85,
        origin: { y: 0.55 },
        colors: ["#fda4af", "#fbcfe8", "#d8b4fe", "#bae6fd", "#86efac", "#fef08a"],
      });
    } catch {}
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start sm:justify-center px-3 sm:px-8 select-none overflow-y-auto overflow-x-hidden pt-16 pb-16 sm:py-14">

      {/* ── Ambient Background Glow ── */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-gradient-to-tr from-[#fed7aa]/30 via-[#fbcfe8]/25 to-[#d8b4fe]/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-bl from-[#bae6fd]/20 to-transparent rounded-full blur-[100px] pointer-events-none" />

      {/* ── Background scattered doodle dots ── */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#e5d0c0 1.2px, transparent 1.2px)",
          backgroundSize: "26px 26px",
        }}
      />

      {/* ── Scattered tiny star doodles ── */}
      {[
        { top: "12%", left: "6%", size: 10, rot: 20, color: "#fda4af" },
        { top: "18%", right: "8%", size: 8, rot: -15, color: "#d8b4fe" },
        { bottom: "22%", left: "4%", size: 9, rot: 35, color: "#86efac" },
        { bottom: "15%", right: "5%", size: 11, rot: -25, color: "#fde68a" },
        { top: "55%", left: "2%", size: 7, rot: 10, color: "#fbcfe8" },
      ].map((s, i) => (
        <motion.div
          key={i}
          animate={{ rotate: [s.rot, s.rot + 360], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8 + i * 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute pointer-events-none hidden sm:block"
          style={{ top: s.top, left: s.left, right: (s as any).right, bottom: (s as any).bottom }}
        >
          <svg width={s.size} height={s.size} viewBox="0 0 10 10">
            <polygon points="5,0 6.2,3.8 10,3.8 6.9,6.1 8.1,10 5,7.6 1.9,10 3.1,6.1 0,3.8 3.8,3.8" fill={s.color} />
          </svg>
        </motion.div>
      ))}

      {/* ── Corner small flowers ── */}
      <div className="absolute top-5 left-5 pointer-events-none hidden sm:block animate-flower-sway">
        <svg width="38" height="38" viewBox="0 0 50 50">
          {[0,60,120,180,240,300].map((deg, i) => (
            <ellipse key={i} cx="25" cy="25" rx="10" ry="5"
              fill="#fda4af" opacity="0.85"
              transform={`rotate(${deg} 25 25) translate(0 -12)`} />
          ))}
          <circle cx="25" cy="25" r="5" fill="#fef08a" />
        </svg>
      </div>
      <div className="absolute top-6 right-6 pointer-events-none hidden sm:block animate-flower-sway-slow">
        <svg width="32" height="32" viewBox="0 0 50 50">
          {[0,72,144,216,288].map((deg, i) => (
            <ellipse key={i} cx="25" cy="25" rx="9" ry="4.5"
              fill="#d8b4fe" opacity="0.85"
              transform={`rotate(${deg} 25 25) translate(0 -11)`} />
          ))}
          <circle cx="25" cy="25" r="5" fill="#fda4af" />
        </svg>
      </div>
      <div className="absolute bottom-6 left-6 pointer-events-none hidden sm:block animate-gentle-float">
        <svg width="28" height="28" viewBox="0 0 50 50">
          {[0,90,180,270].map((deg, i) => (
            <ellipse key={i} cx="25" cy="25" rx="8" ry="4"
              fill="#86efac" opacity="0.8"
              transform={`rotate(${deg} 25 25) translate(0 -10)`} />
          ))}
          <circle cx="25" cy="25" r="5" fill="#fde68a" />
        </svg>
      </div>
      <div className="absolute bottom-7 right-7 pointer-events-none hidden sm:block animate-flower-sway">
        <svg width="30" height="30" viewBox="0 0 50 50">
          {[0,60,120,180,240,300].map((deg, i) => (
            <ellipse key={i} cx="25" cy="25" rx="9" ry="4.5"
              fill="#fbcfe8" opacity="0.85"
              transform={`rotate(${deg} 25 25) translate(0 -11)`} />
          ))}
          <circle cx="25" cy="25" r="5" fill="#f43f5e" />
        </svg>
      </div>

      {/* ── Main Layout: side-by-side on lg+, stacked on mobile ── */}
      <div className="relative z-10 w-full max-w-4xl lg:max-w-5xl flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-10 px-2 sm:px-4 my-auto">

        {/* ══ LEFT: Childhood Polaroid Photo ══ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, rotate: -4, y: 18 }}
          animate={{ opacity: 1, scale: 1, rotate: -3, y: 0 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="relative shrink-0"
          data-photo="true"
        >
          {/* Floating/bobbing motion wrapper */}
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [-3, -2, -3] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            style={{ display: "inline-block" }}
          >
            {/* Polaroid outer cream frame */}
            <div
              className="relative bg-white rounded-xl shadow-[0_16px_48px_-8px_rgba(80,50,30,0.22),0_4px_14px_-2px_rgba(80,50,30,0.12)] w-[140px] sm:w-[180px] lg:w-[240px] p-2 sm:p-2.5 lg:p-3.5 pb-3 sm:pb-4 lg:pb-5 border border-[#ede3d8]"
            >
              {/* Washi tape top-left */}
              <div
                className="absolute -top-3 left-4 z-20"
                style={{
                  width: 52,
                  height: 18,
                  background: "rgba(254,205,211,0.85)",
                  backdropFilter: "blur(1px)",
                  borderLeft: "1.5px dashed rgba(244,63,94,0.28)",
                  borderRight: "1.5px dashed rgba(244,63,94,0.28)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.09)",
                  transform: "rotate(-2deg)",
                }}
              />

              {/* The photo */}
              <div className="relative overflow-hidden rounded-lg bg-[#f0e8de] shadow-inner" style={{ aspectRatio: "3/4" }}>
                <Image
                  src="/photos/childhood.jpg"
                  alt="Anshika as a child"
                  fill
                  sizes="(max-width: 640px) 140px, (max-width: 1024px) 180px, 240px"
                  className="object-cover object-top hover:scale-105 transition-transform duration-500"
                  priority
                />
              </div>

              {/* Polaroid bottom caption area */}
              <div className="pt-2 pb-0 text-center flex flex-col items-center">
                <p className="font-handwriting text-[#4a3528] font-bold leading-tight text-xs sm:text-sm lg:text-base">
                  Look who grew up… ✨
                </p>
              </div>

              {/* Small heart sticker bottom-right corner */}
              <div className="absolute -bottom-2 -right-2 z-20">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M12 21C12 21 3 14.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 12 5C12.09 3.81 13.76 3 15.5 3C18.58 3 21 5.42 21 8.5C21 14.5 12 21 12 21Z"
                      fill="#f43f5e" stroke="#be185d" strokeWidth="0.5"/>
                  </svg>
                </motion.div>
              </div>

              {/* Small flower sticker top-right */}
              <div className="absolute -top-2.5 -right-2.5 z-20">
                <motion.div
                  animate={{ rotate: [0, 15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg width="18" height="18" viewBox="0 0 50 50">
                    {[0,60,120,180,240,300].map((deg, i) => (
                      <ellipse key={i} cx="25" cy="25" rx="10" ry="5"
                        fill="#fda4af" opacity="0.9"
                        transform={`rotate(${deg} 25 25) translate(0 -12)`} />
                    ))}
                    <circle cx="25" cy="25" r="5.5" fill="#fef08a" />
                  </svg>
                </motion.div>
              </div>
            </div>

            {/* Scatter petals around photo */}
            <motion.div
              className="absolute -top-4 -left-5 pointer-events-none"
              animate={{ rotate: [0, 20, 0], y: [0, -4, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg width="16" height="16" viewBox="0 0 20 20">
                <ellipse cx="10" cy="10" rx="9" ry="5" fill="#fbcfe8" transform="rotate(30 10 10)" />
              </svg>
            </motion.div>
            <motion.div
              className="absolute -bottom-3 -left-4 pointer-events-none"
              animate={{ rotate: [0, -20, 0], y: [0, 4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
            >
              <svg width="14" height="14" viewBox="0 0 20 20">
                <ellipse cx="10" cy="10" rx="9" ry="5" fill="#d8b4fe" transform="rotate(-20 10 10)" />
              </svg>
            </motion.div>
          </motion.div>

          {/* Playful caption below photo (shown on sm+) */}
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="font-handwriting text-center text-[#8c7465] mt-1.5 hidden sm:block text-xs"
          >
            19 years later and still causing chaos.
          </motion.p>
        </motion.div>

        {/* ══ RIGHT: Birthday Card Content ══ */}
        <motion.div
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="flex-1 min-w-0 max-w-md lg:max-w-xl xl:max-w-2xl w-full"
        >
          {/* Paper card */}
          <div className="relative paper-card-warm rounded-3xl shadow-[0_20px_50px_rgba(80,50,30,0.12)] border border-[#ebdcd0] overflow-hidden p-4 sm:p-6 lg:p-8">
            <div className="washi-tape-pink" />

            {/* Date badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fdf2f4] border border-[#fbcfe8] text-[#be185d] font-sans text-xs mb-3 shadow-2xs">
              <Heart className="w-3.5 h-3.5 fill-[#be185d]" />
              <span>28 OCTOBER 2026 // CHAPTER 19</span>
            </div>

            {/* Handwritten Heading */}
            <h2 className="font-bold font-handwriting text-[#3f2e24] leading-tight mb-2 text-3xl sm:text-4xl lg:text-5xl">
              Happy 19th Birthday,
              <span className="block text-[#be185d]">Anshika! 🌸</span>
            </h2>

            {/* Subtitle */}
            <p className="text-[#6e5849] font-sans leading-relaxed mb-3 text-xs sm:text-sm lg:text-base max-w-lg">
              &ldquo;Some people become important without there ever being one specific moment when it happened. You&apos;re one of those people.&rdquo;
            </p>

            {/* Expandable wish note */}
            <div className="mb-3">
              <button
                onClick={() => setNoteOpen(!noteOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fff8f0] border border-[#ebd8c5] text-xs font-sans text-[#786457] hover:border-[#fda4af] transition-all cursor-pointer"
              >
                <Gift className="w-3 h-3 text-[#f43f5e]" />
                <span>{noteOpen ? "Fold note 💌" : "Tap for secret wish ✨"}</span>
              </button>

              <AnimatePresence>
                {noteOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    className="mt-2 p-3 rounded-2xl bg-[#fffefc] border-2 border-dashed border-[#fda4af] shadow-xs overflow-hidden"
                  >
                    <p className="font-handwriting text-[#3f2e24] leading-relaxed text-sm sm:text-base">
                      Wishing you the kindest year yet — one where things feel a little easier,
                      a little lighter, and the good moments outweigh the hard ones by a lot.
                      You deserve that more than you probably think. 🌷
                    </p>
                    <span className="text-[10px] text-[#a0897a] font-sans block mt-1">— Anuj</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Task */}
            <div className="pt-2.5 border-t border-[#f0e4d6]">
              {!taskDone ? (
                <div className="space-y-1.5 p-2.5 sm:p-3 rounded-2xl bg-[#fffaf5] border border-[#eddccc]">
                  <div className="font-handwriting text-[#b45309] text-sm sm:text-base">
                    Task: Wake up the birthday flower! 🌷
                  </div>
                  <p className="text-[11px] text-[#786457] font-sans">
                    Jab bhi teri baat hoti hai, kuch na kuch bloom karta hai &mdash; tap to prove it:
                  </p>
                  <motion.button
                    onClick={handleBloomTask}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-[#fda4af] hover:bg-[#fb7185] text-[#4c0519] font-sans font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer inline-flex items-center justify-center gap-2 btn-cute min-h-[42px]"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-[#be185d] text-[#be185d]" />
                    <span>[ BLOOM BIRTHDAY FLOWER ]</span>
                  </motion.button>
                </div>
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-2.5 sm:p-3 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] flex flex-col items-start gap-1 text-[#065f46]"
                >
                  <div className="flex items-center gap-1.5 font-sans font-semibold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>TASK COMPLETE ✓ Flower Bloomed</span>
                  </div>
                  <p className="text-[11px] sm:text-xs font-sans text-[#047857]">
                    &ldquo;Attendance marked. You may proceed, madam. 🌸&rdquo;
                  </p>
                  <button
                    onClick={onNext}
                    className="mt-1.5 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#fda4af] to-[#fb7185] hover:from-[#fb7185] hover:to-[#f43f5e] text-white font-sans font-bold text-xs sm:text-sm shadow-md transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-1.5 btn-cute"
                  >
                    <span>Continue to Photos</span>
                    <span className="text-sm leading-none">↓</span>
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
