"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedCanvasDoodlesProps {
  currentFrame: number;
}

export default function AnimatedCanvasDoodles({
  currentFrame,
}: AnimatedCanvasDoodlesProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[5] overflow-hidden select-none hidden lg:block"
    >
      <AnimatePresence mode="wait">
        {/* CHAPTER 01: WELCOME DOODLES */}
        {currentFrame === 0 && (
          <motion.div
            key="doodle-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full relative"
          >
            {/* Left Hand-drawn Arrow pointing to card */}
            <div className="absolute top-1/2 left-10 -translate-y-1/2 flex flex-col items-center gap-1.5 opacity-75">
              <svg width="70" height="70" viewBox="0 0 100 100" fill="none">
                <motion.path
                  d="M 20 80 Q 50 20 85 45"
                  stroke="#be185d"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="4 4"
                  animate={{ strokeDashoffset: [0, -16] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                <path
                  d="M 85 45 L 75 35 M 85 45 L 74 52"
                  stroke="#be185d"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="font-handwriting text-base font-bold text-[#be185d] -rotate-6">
                Special Delivery 💌
              </span>
            </div>

            {/* Right Twinkling Constellation Stars */}
            <div className="absolute top-1/3 right-12 flex flex-col items-center gap-2 opacity-75">
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.25, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="text-2xl"
              >
                ✦
              </motion.div>
              <span className="font-handwriting text-sm font-bold text-[#b45309] rotate-3 bg-[#fef3c7]/70 px-2 py-0.5 rounded-full border border-[#fde68a]">
                A scrapbook just for you
              </span>
            </div>
          </motion.div>
        )}

        {/* CHAPTER 02: BIRTHDAY DOODLES */}
        {currentFrame === 1 && (
          <motion.div
            key="doodle-1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full relative"
          >
            {/* Floating Birthday Candle Doodle */}
            <div className="absolute top-1/4 left-14 opacity-80">
              <svg width="50" height="80" viewBox="0 0 60 100" fill="none">
                {/* Flame with flickering animation */}
                <motion.path
                  d="M 30 15 C 22 25, 22 35, 30 40 C 38 35, 38 25, 30 15 Z"
                  fill="#f59e0b"
                  animate={{ scale: [1, 1.15, 0.95, 1], y: [-1, 1, -1] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                />
                <circle cx="30" cy="30" r="4" fill="#fef08a" />
                {/* Candle Stick */}
                <rect x="25" y="42" width="10" height="45" rx="3" fill="#fbcfe8" stroke="#f43f5e" strokeWidth="1.5" />
              </svg>
              <span className="font-handwriting text-sm text-[#be185d] -rotate-12 block mt-1">
                Chapter 19 🎂
              </span>
            </div>

            {/* Right Heartbeat & Musical Notes */}
            <div className="absolute bottom-1/4 right-14 opacity-75 flex flex-col items-center">
              <motion.div
                animate={{ y: [-4, 4, -4], rotate: [-5, 5, -5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-3xl"
              >
                🎵
              </motion.div>
              <span className="font-handwriting text-xs text-[#786457] mt-1 bg-white/80 px-2 py-0.5 rounded-full border border-[#ebdcd0]">
                October 28th
              </span>
            </div>
          </motion.div>
        )}

        {/* CHAPTER 03: PHOTOS DOODLES */}
        {currentFrame === 2 && (
          <motion.div
            key="doodle-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full relative"
          >
            {/* Camera doodle on left */}
            <div className="absolute top-1/4 left-10 opacity-75 flex flex-col items-center">
              <motion.div
                animate={{ rotate: [-4, 4, -4] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="p-2.5 rounded-2xl bg-white/80 border border-[#ebdcd0] shadow-sm text-2xl"
              >
                📸
              </motion.div>
              <span className="font-handwriting text-sm font-bold text-[#3f2e24] -rotate-6 mt-1">
                Click to Zoom in!
              </span>
            </div>

            {/* Cute sticker on right */}
            <div className="absolute top-1/3 right-10 opacity-80 flex flex-col items-center">
              <span className="font-handwriting text-xs font-bold text-[#be185d] rotate-6 bg-[#fff0f3] border border-[#fbcfe8] px-3 py-1 rounded-full shadow-2xs">
                Secret Heart Hidden 💖
              </span>
            </div>
          </motion.div>
        )}

        {/* CHAPTER 04: GIFT SNAPS DOODLES */}
        {currentFrame === 3 && (
          <motion.div
            key="doodle-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full relative"
          >
            {/* Cute Teddy Bear Note */}
            <div className="absolute top-1/3 left-10 opacity-80 flex flex-col items-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [-6, 6, -6] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                className="text-3xl"
              >
                🧸
              </motion.div>
              <span className="font-handwriting text-xs font-bold text-[#b45309] -rotate-3 mt-1 bg-[#fffaf5] px-2.5 py-0.5 rounded-full border border-[#fde68a]">
                The Teddy Was Mandatory!
              </span>
            </div>

            {/* Right Gift Unwrapping Sparkle */}
            <div className="absolute bottom-1/4 right-10 opacity-80 flex flex-col items-center">
              <motion.div
                animate={{ y: [-3, 3, -3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-2xl"
              >
                ✨🎁✨
              </motion.div>
              <span className="font-handwriting text-xs text-[#786457] mt-1 bg-white/85 px-2 py-0.5 rounded-full border border-[#ebdcd0]">
                Memories Saved Forever
              </span>
            </div>
          </motion.div>
        )}

        {/* CHAPTER 05: CS QUIZ DOODLES */}
        {currentFrame === 4 && (
          <motion.div
            key="doodle-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full relative"
          >
            {/* Left Terminal / Code Snippet */}
            <div className="absolute top-1/3 left-10 opacity-80 flex flex-col items-center">
              <div className="p-2 rounded-xl bg-[#1e1e1e] text-[#86efac] font-mono text-[11px] shadow-md border border-neutral-700">
                <span className="text-[#f43f5e]">const</span> girl = <span className="text-[#fde047]">&quot;Anshika&quot;</span>;
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-1.5 h-3 bg-[#86efac] ml-1 align-middle"
                />
              </div>
              <span className="font-handwriting text-xs text-[#786457] mt-1 -rotate-6">
                Web Dev Certified 💻
              </span>
            </div>

            {/* Steaming Coffee Cup on Right */}
            <div className="absolute bottom-1/3 right-12 opacity-80 flex flex-col items-center">
              <motion.div
                animate={{ y: [-2, 2, -2] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="text-2xl"
              >
                ☕
              </motion.div>
              <span className="font-handwriting text-xs text-[#a0897a] rotate-6 mt-1">
                Fuel for late night chats
              </span>
            </div>
          </motion.div>
        )}

        {/* CHAPTER 06: SCRATCH CARD DOODLES */}
        {currentFrame === 5 && (
          <motion.div
            key="doodle-5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full relative"
          >
            {/* Scratching Hint on Left */}
            <div className="absolute top-1/3 left-12 opacity-80 flex flex-col items-center">
              <motion.div
                animate={{ x: [-5, 5, -5] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                className="text-2xl"
              >
                🪙 ✦
              </motion.div>
              <span className="font-handwriting text-xs font-bold text-[#b45309] -rotate-6 mt-1 bg-[#fef3c7] px-2.5 py-0.5 rounded-full border border-[#fde68a]">
                Scratch with mouse!
              </span>
            </div>
          </motion.div>
        )}

        {/* CHAPTER 07: LETTER DOODLES */}
        {currentFrame === 6 && (
          <motion.div
            key="doodle-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full relative"
          >
            {/* Fountain Pen on Left */}
            <div className="absolute top-1/3 left-10 opacity-80 flex flex-col items-center">
              <motion.div
                animate={{ rotate: [-8, 8, -8] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-2xl"
              >
                ✒️
              </motion.div>
              <span className="font-handwriting text-xs text-[#be185d] -rotate-6 mt-1">
                Written with sincerity
              </span>
            </div>

            {/* Wax Seal on Right */}
            <div className="absolute bottom-1/3 right-10 opacity-80 flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-[#be185d] text-white flex items-center justify-center font-handwriting text-sm font-bold shadow-md border-2 border-[#fda4af]">
                A
              </div>
              <span className="font-handwriting text-xs text-[#786457] rotate-6 mt-1">
                Sealed with care
              </span>
            </div>
          </motion.div>
        )}

        {/* CHAPTER 08 & 09: FINALE DOODLES */}
        {currentFrame >= 7 && (
          <motion.div
            key="doodle-7-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full relative"
          >
            {/* Burst of flowers on Left */}
            <div className="absolute top-1/4 left-10 opacity-85 flex flex-col items-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="text-3xl"
              >
                🌸
              </motion.div>
              <span className="font-handwriting text-xs font-bold text-[#be185d] -rotate-6 mt-1">
                Happy 19th Anshika!
              </span>
            </div>

            {/* Sparkles on Right */}
            <div className="absolute top-1/3 right-12 opacity-85 flex flex-col items-center">
              <motion.div
                animate={{ scale: [1, 1.25, 1], rotate: [-10, 10, -10] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-3xl"
              >
                ✨💖✨
              </motion.div>
              <span className="font-handwriting text-xs text-[#b45309] rotate-3 mt-1 bg-[#fffaf5] px-2 py-0.5 rounded-full border border-[#fed7aa]">
                With love, Anuj
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
