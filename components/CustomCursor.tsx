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

export default function CustomCursor() {
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

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicking(true);

      // Spawn 2-3 cute hearts or flower petals around click location
      const emojis = ["💖", "🌸", "✨", "🌷", "⭐"];
      const newParticles: ClickParticle[] = Array.from({ length: 3 }).map((_, i) => ({
        id: Date.now() + i + Math.random(),
        x: e.clientX + (Math.random() - 0.5) * 14,
        y: e.clientY + (Math.random() - 0.5) * 14,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        angle: (Math.random() - 0.5) * 60,
      }));

      setParticles((prev) => [...prev, ...newParticles]);

      // Remove after 650ms
      setTimeout(() => {
        setParticles((prev) =>
          prev.filter((p) => !newParticles.some((np) => np.id === p.id))
        );
      }, 650);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Task celebration trigger listener
    const handleTaskCompleteEvent = () => {
      setIsCelebrating(true);
      setTimeout(() => {
        setIsCelebrating(false);
      }, 1600);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("birthday-task-completed", handleTaskCompleteEvent);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("birthday-task-completed", handleTaskCompleteEvent);
    };
  }, [isVisible]);

  if (!isDesktop || !isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden select-none">
      {/* Click Particles (hearts and petals) */}
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

      {/* Main Teddy Bear Cursor Container — position/scale via spring, rotate via tween */}
      <motion.div
        animate={{
          x: position.x - 6,
          y: position.y - 6,
          scale: isClicking
            ? 0.88
            : isCelebrating
            ? 1.3
            : isHoveringNo
            ? 1.12
            : isHoveringButton
            ? 1.18
            : isHoveringPhoto
            ? 1.14
            : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 480,
          damping: 32,
          mass: 0.55,
        }}
        className="absolute pointer-events-none origin-top-left"
        style={{ left: 0, top: 0 }}
      >
        {/* Rotation wrapper — uses tween so multi-keyframe arrays work */}
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

        {/* Celebratory Sparkle Halo */}
        {isCelebrating && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0] }}
            transition={{ type: "tween", repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
            className="absolute -inset-2 rounded-full border border-[#f59e0b] bg-[#fef3c7]/30 pointer-events-none"
          />
        )}

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
            // Playful wide surprised eyes on "NO" button
            <>
              <circle cx="12.5" cy="13.5" r="1.6" fill="#3F2E24" />
              <circle cx="12.2" cy="13.1" r="0.6" fill="#FFFFFF" />
              <circle cx="21.5" cy="13.5" r="1.6" fill="#3F2E24" />
              <circle cx="21.2" cy="13.1" r="0.6" fill="#FFFFFF" />
            </>
          ) : isCelebrating ? (
            // Happy closed crescent eyes on celebrate
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
            // Sweet sparkly bead eyes
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

          {/* Right Paw (Waving Arm when hovering button) — tween for keyframe arrays */}
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
        </motion.div>{/* end rotation wrapper */}
      </motion.div>
    </div>
  );
}
