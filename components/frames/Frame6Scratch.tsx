"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface Frame6ScratchProps {
  isCompleted: boolean;
  onCompleteTask: () => void;
  onNext: () => void;
}

// ── Reveal content options ─────────────────────────────────────────────────
const REVEAL_OPTIONS = [
  {
    emoji: "🧸",
    title: "Physical box check-in:",
    line1: "And yes, the teddy was mandatory. 🧸",
    line2: "So… I hope the bracelet survived the opening without getting tangled 😂",
  },
  {
    emoji: "🌷",
    title: "Congratulations, madam.",
    line1: "You found absolutely nothing useful. 😭",
    line2: "Okay fine… you unlocked the next level. Let's go.",
  },
  {
    emoji: "🌸",
    title: "A tiny birthday secret:",
    line1: "You just spent 30 seconds scratching a digital card.",
    line2: "And it was absolutely worth it. Happy 19th 🎂",
  },
  {
    emoji: "💌",
    title: "Surprise unlocked!",
    line1: "No coupon. No grand prize. Just this:",
    line2: "Someone stayed up building this whole website for you. That's the surprise.",
  },
];

// Pick one deterministically (or randomly on mount)
function pickReveal() {
  return REVEAL_OPTIONS[Math.floor(Math.random() * REVEAL_OPTIONS.length)];
}

const SCRATCH_THRESHOLD = 0.62; // 62% scratched to auto-reveal

export default function Frame6Scratch({
  isCompleted,
  onCompleteTask,
  onNext,
}: Frame6ScratchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const taskDoneRef = useRef(isCompleted);

  const [revealed, setRevealed] = useState(isCompleted);
  const [taskDone, setTaskDone] = useState(isCompleted);
  const [scratchPct, setScratchPct] = useState(isCompleted ? 100 : 0);
  const [reveal] = useState(pickReveal);
  const [canvasReady, setCanvasReady] = useState(false);

  // ── Draw the scratch-off overlay once canvas is ready ─────────────────────
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W * window.devicePixelRatio;
    canvas.height = H * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Pastel gradient scratch surface
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#fde8d8");
    grad.addColorStop(0.5, "#fbcfe8");
    grad.addColorStop(1, "#e9d5ff");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Draw the hint text on the scratch layer
    ctx.fillStyle = "rgba(80,50,30,0.5)";
    ctx.font = `bold ${Math.min(W * 0.055, 16)}px 'Segoe UI', sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("Scratch here ✦", W / 2, H / 2 - 10);
    ctx.font = `${Math.min(W * 0.04, 13)}px 'Segoe UI', sans-serif`;
    ctx.fillText("Use finger or mouse", W / 2, H / 2 + 14);

    // Add tiny sparkle dots pattern
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      const r = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    setCanvasReady(true);
  }, []);

  useEffect(() => {
    if (isCompleted) return;
    // Slight delay to let layout settle
    const t = setTimeout(initCanvas, 80);
    return () => clearTimeout(t);
  }, [initCanvas, isCompleted]);

  // ── Compute scratched percentage ───────────────────────────────────────────
  const computeScratchPct = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;

    const W = canvas.width;
    const H = canvas.height;
    const imageData = ctx.getImageData(0, 0, W, H);
    const pixels = imageData.data;
    let transparent = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 30) transparent++;
    }
    return transparent / (W * H);
  }, []);

  // ── Auto-reveal when threshold is met ─────────────────────────────────────
  const checkAndReveal = useCallback(() => {
    if (taskDoneRef.current) return;
    const pct = computeScratchPct();
    setScratchPct(Math.round(pct * 100));

    if (pct >= SCRATCH_THRESHOLD) {
      // Clear the entire canvas to show the reveal underneath
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      taskDoneRef.current = true;
      setRevealed(true);
      setTaskDone(true);
      setScratchPct(100);
      onCompleteTask();
      try {
        confetti({
          particleCount: 70,
          spread: 85,
          origin: { y: 0.6 },
          colors: ["#fda4af", "#fbcfe8", "#d8b4fe", "#bae6fd", "#fed7aa", "#86efac"],
        });
      } catch {}
    }
  }, [computeScratchPct, onCompleteTask]);

  // ── Scratch drawing ───────────────────────────────────────────────────────
  const getPos = (
    e: React.MouseEvent | React.TouchEvent,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width / window.devicePixelRatio;
    const scaleY = canvas.height / rect.height / window.devicePixelRatio;

    if ("touches" in e) {
      const t = e.touches[0];
      return {
        x: (t.clientX - rect.left) * scaleX,
        y: (t.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const scratch = (
    e: React.MouseEvent | React.TouchEvent,
    canvas: HTMLCanvasElement
  ) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e, canvas);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 22 * window.devicePixelRatio, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (revealed) return;
    e.preventDefault();
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (canvas) scratch(e, canvas);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current || revealed) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (canvas) {
      scratch(e, canvas);
      // Check every ~10th move to avoid perf hit
      if (Math.random() < 0.12) checkAndReveal();
    }
  };

  const handleEnd = () => {
    isDrawingRef.current = false;
    checkAndReveal();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center px-4 sm:px-6 select-none overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-[#fbcfe8]/25 via-[#d8b4fe]/20 to-[#fed7aa]/20 rounded-full blur-[130px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65 }}
        className="w-full max-w-md paper-card-warm rounded-3xl relative shadow-xl border border-[#ebdcd0] z-10 overflow-hidden"
        style={{ padding: "clamp(14px, 3.5vw, 26px)" }}
      >
        <div className="washi-tape-pink" />

        {/* Header */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#fef3c7] border border-[#fde68a] text-[#92400e] font-sans text-xs mb-1.5">
            <Sparkles className="w-3 h-3 text-[#d97706]" />
            <span>Birthday Scratch Card 🎟️</span>
          </div>
          <h2 className="font-handwriting text-2xl sm:text-3xl font-bold text-[#3f2e24] leading-tight">
            Hmm… something is hidden here 👀
          </h2>
          <p className="text-xs text-[#786457] font-sans mt-0.5">
            Scratch to reveal.
          </p>
        </div>

        {/* ── Scratch Card Area ── */}
        <div
          className="relative rounded-2xl overflow-hidden mx-auto"
          style={{ width: "100%", maxWidth: 360, aspectRatio: "5/3" }}
        >
          {/* Under-layer: the reveal content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#fff8f0] to-[#fef2f8] rounded-2xl border-2 border-dashed border-[#fda4af] px-4 text-center gap-1.5">
            {/* Tiny SVG flower doodle top-left */}
            <svg
              className="absolute top-2 left-2 opacity-30"
              width="28" height="28" viewBox="0 0 50 50"
            >
              {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                <ellipse
                  key={i} cx="25" cy="25" rx="9" ry="4.5"
                  fill="#fda4af" opacity="0.85"
                  transform={`rotate(${deg} 25 25) translate(0 -11)`}
                />
              ))}
              <circle cx="25" cy="25" r="5" fill="#f43f5e" />
            </svg>

            <motion.div
              initial={{ scale: 0 }}
              animate={revealed ? { scale: 1 } : { scale: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 18 }}
              className="text-4xl"
            >
              {reveal.emoji}
            </motion.div>

            <AnimatePresence>
              {revealed && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="space-y-1"
                >
                  <p className="font-handwriting text-lg font-bold text-[#be185d] leading-snug">
                    {reveal.title}
                  </p>
                  <p className="text-xs text-[#5a4435] font-sans leading-relaxed">
                    {reveal.line1}
                  </p>
                  <p className="text-xs text-[#786457] font-sans leading-relaxed font-semibold">
                    {reveal.line2}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {!revealed && (
              <p className="text-[11px] text-[#c4a89a] font-sans italic">
                Keep scratching…
              </p>
            )}
          </div>

          {/* Scratch overlay canvas */}
          {!isCompleted && (
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full rounded-2xl touch-none"
              style={{
                cursor: revealed ? "default" : "cell",
                opacity: canvasReady ? 1 : 0,
                transition: "opacity 0.3s",
              }}
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={handleEnd}
            />
          )}
        </div>

        {/* Progress bar (only while scratching) */}
        {!revealed && scratchPct > 0 && (
          <div className="mt-2.5 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-[#f0e4d6] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#fda4af] to-[#f43f5e] rounded-full"
                animate={{ width: `${scratchPct}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
            <span className="text-[10px] font-mono text-[#a0897a] shrink-0">
              {scratchPct}%
            </span>
          </div>
        )}

        {/* Task CTA */}
        <div className="mt-3">
          {!taskDone ? (
            <p className="text-[11px] text-center text-[#a0897a] font-sans">
              {scratchPct === 0
                ? "Use your finger or mouse to scratch the card above ✦"
                : `${scratchPct}% scratched — almost there…`}
            </p>
          ) : (
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] text-xs font-sans font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                <span>SCRATCH CARD UNLOCKED ✓</span>
              </div>
              <button
                onClick={onNext}
                className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-[#fda4af] to-[#fb7185] hover:from-[#fb7185] hover:to-[#f43f5e] text-white font-sans font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2 btn-cute"
              >
                <span>Continue to Letter</span>
                <span className="text-base leading-none">↓</span>
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
