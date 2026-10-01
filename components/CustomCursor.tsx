"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ClickParticle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  angle: number;
}

interface CustomCursorProps {
  mode?: "cute" | "hacker";
}

const CUTE_CLICK_EMOJIS = ["💖", "✨", "🌸", "🌷", "🎀", "🧸"];
const HACKER_CLICK_EMOJIS = ["⚡", "🚨", "🛑", "01", "💥", "⚠"];

export default function CustomCursor({ mode = "cute" }: CustomCursorProps) {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isDesktop, setIsDesktop] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Interaction states
  const [isHoveringButton, setIsHoveringButton] = useState(false);
  const [isHoveringPhoto, setIsHoveringPhoto] = useState(false);
  const [isHoveringNo, setIsHoveringNo] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);

  // Floating click particles
  const [particles, setParticles] = useState<ClickParticle[]>([]);

  useEffect(() => {
    // Only enable on desktop with fine mouse pointer and hover capability
    const isFinePointer = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isFinePointer || prefersReducedMotion) {
      return;
    }

    setIsDesktop(true);
    document.body.classList.add("custom-cursor-active");

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) {
        setIsHoveringButton(false);
        setIsHoveringPhoto(false);
        setIsHoveringNo(false);
        return;
      }

      // Check if hovering "NO" runaway button
      const text = target.innerText?.toLowerCase() || "";
      const isNoBtn =
        target.closest("[data-no-button]") ||
        text.includes("no thanks") ||
        text.includes("nice try") ||
        text.includes("nope") ||
        text.includes("madam, please") ||
        text.includes("refusal denied");
      setIsHoveringNo(!!isNoBtn);

      // Check if hovering a photo/polaroid
      const isPhoto =
        target.closest(".polaroid-card") ||
        target.closest("[data-photo]") ||
        target.tagName === "IMG";
      setIsHoveringPhoto(!!isPhoto);

      // Check if hovering interactive buttons/links
      const isInteractive =
        target.closest("button") ||
        target.closest("a") ||
        target.closest("[role='button']") ||
        target.closest(".btn-cute") ||
        target.classList.contains("cursor-pointer") ||
        target.closest(".cursor-pointer");
      setIsHoveringButton(!!isInteractive && !isNoBtn);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      document.body.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isVisible]);

  // Click particle spawn
  const spawnParticles = useCallback(
    (e: MouseEvent) => {
      if (!isDesktop) return;

      const palette = mode === "hacker" ? HACKER_CLICK_EMOJIS : CUTE_CLICK_EMOJIS;
      const count = mode === "hacker" ? 4 : 5;
      const newParticles: ClickParticle[] = Array.from({ length: count }, (_, i) => {
        const angle = (i * (360 / count) + Math.random() * 20 - 10) * (Math.PI / 180);
        return {
          id: Date.now() + i + Math.random(),
          x: e.clientX,
          y: e.clientY,
          emoji: palette[Math.floor(Math.random() * palette.length)],
          angle: (Math.random() - 0.5) * 60,
        };
      });

      setParticles((prev) => [...prev.slice(-12), ...newParticles]);

      // Trigger celebratory jump on interactive clicks
      const target = e.target as HTMLElement | null;
      if (
        target?.closest("button") ||
        target?.closest("a") ||
        target?.closest(".btn-cute")
      ) {
        setIsCelebrating(true);
        setTimeout(() => setIsCelebrating(false), 600);
      }
    },
    [isDesktop, mode]
  );

  useEffect(() => {
    window.addEventListener("click", spawnParticles);
    return () => window.removeEventListener("click", spawnParticles);
  }, [spawnParticles]);

  // Clean up particles
  useEffect(() => {
    if (particles.length === 0) return;
    const timer = setTimeout(() => {
      setParticles((prev) => prev.slice(3));
    }, 700);
    return () => clearTimeout(timer);
  }, [particles]);

  if (!isDesktop || !isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden select-none">
      {/* Click Particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 0.7, x: p.x, y: p.y }}
            animate={{
              opacity: 0,
              scale: 1.3,
              y: p.y - 28,
              x: p.x + p.angle * 0.4,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute text-xs pointer-events-none select-none"
            style={{ left: 0, top: 0 }}
          >
            {p.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main Cursor Container */}
      <motion.div
        animate={{
          x: mode === "hacker" ? position.x : position.x - 6,
          y: mode === "hacker" ? position.y : position.y - 6,
          scale: isClicking
            ? 0.88
            : isCelebrating
            ? 1.25
            : isHoveringNo
            ? 1.12
            : isHoveringButton
            ? 1.2
            : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 550,
          damping: 32,
          mass: 0.5,
        }}
        className="absolute pointer-events-none origin-top-left"
        style={{ left: 0, top: 0 }}
      >
        {/* ── HACKER / SECURITY MODE CURSOR ─────────────────────────────────── */}
        {mode === "hacker" ? (
          <div className="relative w-10 h-10 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            {/* Outer Target Corner Brackets */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="flex justify-between w-full">
                <div className="w-2 h-2 border-t-2 border-l-2 border-[#ef4444]" />
                <div className="w-2 h-2 border-t-2 border-r-2 border-[#ef4444]" />
              </div>
              <div className="flex justify-between w-full">
                <div className="w-2 h-2 border-b-2 border-l-2 border-[#ef4444]" />
                <div className="w-2 h-2 border-b-2 border-r-2 border-[#ef4444]" />
              </div>
            </div>

            {/* Rotating Segmented Ring */}
            <motion.div
              animate={{ rotate: isHoveringButton ? 360 : [0, 90, 180, 270, 360] }}
              transition={{
                repeat: Infinity,
                duration: isHoveringButton ? 0.75 : 4,
                ease: "linear",
              }}
              className="absolute w-7 h-7 rounded-full border border-dashed border-[#ef4444] shadow-[0_0_14px_rgba(239,68,68,0.9)]"
            />

            {/* Crosshair Lines */}
            <div className="absolute w-full h-[1.5px] bg-[#ef4444]/90 shadow-[0_0_6px_#ef4444]" />
            <div className="absolute h-full w-[1.5px] bg-[#ef4444]/90 shadow-[0_0_6px_#ef4444]" />

            {/* Center Pulsing Laser Core */}
            <div className="w-2 h-2 rounded-full bg-[#ef4444] shadow-[0_0_10px_#ef4444] animate-ping" />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_4px_#fff]" />

            {/* Target Coordinate / Lock Badge */}
            <div className="absolute -bottom-5 left-5 px-1.5 py-0.5 rounded bg-[#180811]/95 border border-[#ef4444]/80 text-[8px] font-mono text-[#fca5a5] whitespace-nowrap shadow-[0_2px_8px_rgba(0,0,0,0.8)] backdrop-blur-xs flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isHoveringButton ? "bg-[#22c55e]" : "bg-[#ef4444] animate-pulse"}`} />
              {isHoveringButton
                ? "TARGET_LOCKED 🔒"
                : `TRK // [${Math.round(position.x)}, ${Math.round(position.y)}]`}
            </div>
          </div>
        ) : (
          /* ── ORIGINAL CUTE TEDDY BEAR CURSOR ─────────────────────────────── */
          <motion.div
            animate={{
              rotate: isCelebrating
                ? [0, -14, 14, -10, 0]
                : isHoveringNo
                ? [-12, 12, -10, 8, 0]
                : isHoveringPhoto
                ? [0, -7, 7, 0]
                : 0,
            }}
            transition={{
              type: "tween",
              duration: isCelebrating ? 0.6 : isHoveringNo ? 0.5 : 0.4,
              ease: "easeInOut",
              repeat: isCelebrating || isHoveringNo ? Infinity : 0,
            }}
          >
            {/* Tiny Click Tip Sparkle Point */}
            <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-[#fda4af] shadow-[0_0_6px_#f43f5e] opacity-80" />

            {/* Hand-Drawn SVG Teddy Bear */}
            <svg
              width="32"
              height="32"
              viewBox="0 0 34 34"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_2px_4px_rgba(80,50,30,0.18)]"
            >
              {/* Left Ear */}
              <circle cx="9" cy="8" r="4.8" fill="#C89666" stroke="#9A6B43" strokeWidth="0.8" />
              <circle cx="9" cy="8" r="2.6" fill="#FCE7F3" />

              {/* Right Ear */}
              <circle cx="25" cy="8" r="4.8" fill="#C89666" stroke="#9A6B43" strokeWidth="0.8" />
              <circle cx="25" cy="8" r="2.6" fill="#FCE7F3" />

              {/* Tiny Flower Accessory next to Ear */}
              <g transform="translate(6, 4)">
                <circle cx="0" cy="0" r="2.2" fill="#FDA4AF" />
                <circle cx="0" cy="0" r="0.9" fill="#FEF08A" />
              </g>

              {/* Body */}
              <ellipse cx="17" cy="25" rx="7.5" ry="5.5" fill="#C89666" stroke="#9A6B43" strokeWidth="0.8" />
              <ellipse cx="17" cy="25.5" rx="4.5" ry="3.5" fill="#FDF6ED" />

              {/* Head */}
              <ellipse cx="17" cy="15.5" rx="10.5" ry="9" fill="#C89666" stroke="#9A6B43" strokeWidth="0.8" />

              {/* Snout */}
              <ellipse cx="17" cy="17.5" rx="4.8" ry="3.6" fill="#FDF6ED" />

              {/* Nose */}
              <ellipse cx="17" cy="16" rx="1.6" ry="1.1" fill="#4A3728" />
              <path
                d="M17 17.1 V 18.2 M15.6 18.2 Q 17 19.3 18.4 18.2"
                stroke="#4A3728"
                strokeWidth="0.75"
                strokeLinecap="round"
              />

              {/* Eyes */}
              {isHoveringNo ? (
                <>
                  <circle cx="12.5" cy="13.5" r="1.6" fill="#3F2E24" />
                  <circle cx="12.2" cy="13.1" r="0.6" fill="#FFFFFF" />
                  <circle cx="21.5" cy="13.5" r="1.6" fill="#3F2E24" />
                  <circle cx="21.2" cy="13.1" r="0.6" fill="#FFFFFF" />
                </>
              ) : isCelebrating ? (
                <>
                  <path
                    d="M11 14 Q 13 12 15 14"
                    stroke="#3F2E24"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M19 14 Q 21 12 23 14"
                    stroke="#3F2E24"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </>
              ) : (
                <>
                  <circle cx="13" cy="13.8" r="1.25" fill="#3F2E24" />
                  <circle cx="12.6" cy="13.4" r="0.5" fill="#FFFFFF" />
                  <circle cx="21" cy="13.8" r="1.25" fill="#3F2E24" />
                  <circle cx="20.6" cy="13.4" r="0.5" fill="#FFFFFF" />
                </>
              )}

              {/* Rosy Cheeks */}
              <circle cx="10" cy="16.5" r="2" fill="#FDA4AF" opacity="0.7" />
              <circle cx="24" cy="16.5" r="2" fill="#FDA4AF" opacity="0.7" />

              {/* Left Paw holding tiny red heart */}
              <circle cx="10" cy="24" r="2.6" fill="#C89666" stroke="#9A6B43" strokeWidth="0.6" />
              <path
                d="M9.5 22.8 C8.8 21.6 7.6 22.4 8.4 23.5 L9.5 24.8 L10.6 23.5 C11.4 22.4 10.2 21.6 9.5 22.8 Z"
                fill="#F43F5E"
              />

              {/* Right Paw (Waving Arm when hovering button) */}
              <motion.g
                animate={{
                  rotate: isHoveringButton ? [0, -25, 20, -20, 0] : 0,
                }}
                transition={{
                  type: "tween",
                  repeat: isHoveringButton ? Infinity : 0,
                  duration: 0.48,
                  ease: "easeInOut",
                }}
                style={{ originX: "24px", originY: "24px" }}
              >
                <circle cx="24" cy="24" r="2.6" fill="#C89666" stroke="#9A6B43" strokeWidth="0.6" />
              </motion.g>
            </svg>

            {/* Playful mini thought bubble on runaway "NO" button */}
            {isHoveringNo && (
              <motion.div
                initial={{ scale: 0, opacity: 0, y: 5 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="absolute -top-6 -right-6 px-1.5 py-0.5 rounded-full bg-white/95 border border-[#fda4af] text-[9px] font-sans font-bold text-[#be185d] shadow-xs whitespace-nowrap"
              >
                Don&apos;t run! 👀
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
