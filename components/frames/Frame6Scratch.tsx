"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles, RotateCcw, ArrowRight } from "lucide-react";
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

const SCRATCH_THRESHOLD = 0.42; // 42% scratched to auto-reveal

export default function Frame6Scratch({
  isCompleted,
  onCompleteTask,
  onNext,
}: Frame6ScratchProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const [revealed, setRevealed] = useState(false);
  const [taskDone, setTaskDone] = useState(isCompleted);
  const [scratchPct, setScratchPct] = useState(0);
  const [reveal, setReveal] = useState(REVEAL_OPTIONS[0]);
  const [canvasReady, setCanvasReady] = useState(false);

  // Set random reveal on client mount
  useEffect(() => {
    setReveal(REVEAL_OPTIONS[Math.floor(Math.random() * REVEAL_OPTIONS.length)]);
  }, []);

  useEffect(() => {
    setTaskDone(isCompleted);
  }, [isCompleted]);

  // ── Draw the scratch-off overlay once canvas has layout dimensions ─────────
  const drawLayer = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;

    // Rich metallic pastel gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#fde68a");
    grad.addColorStop(0.35, "#fbcfe8");
    grad.addColorStop(0.7, "#fda4af");
    grad.addColorStop(1, "#e9d5ff");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Decorative dashed border ring inside canvas
    ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, W - 16, H - 16);

    // Sparkle speckles
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      const r = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Centered Scratch Callout
    ctx.fillStyle = "#881337";
    ctx.font = `bold ${Math.max(14, Math.min(W * 0.055, 18))}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✦ Scratch Here Madam Ji ✦", W / 2, H / 2 - 12);

    ctx.fillStyle = "#9f1239";
    ctx.font = `${Math.max(11, Math.min(W * 0.038, 13))}px sans-serif`;
    ctx.fillText("Drag mouse or finger to scratch", W / 2, H / 2 + 14);

    ctx.restore();
    setCanvasReady(true);
    setScratchPct(0);
  }, []);

  // Initialize and observe resize
  useEffect(() => {
    if (revealed) return;
    drawLayer();

    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => {
      if (!revealed) drawLayer();
    });
    ro.observe(container);

    return () => ro.disconnect();
  }, [drawLayer, revealed]);

  // Fast percentage sampler (sampled 384 points across buffer, <0.2ms runtime)
  const calculateProgress = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) return 0;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return 0;

    const stepX = Math.max(1, Math.floor(canvas.width / 24));
    const stepY = Math.max(1, Math.floor(canvas.height / 16));
    let clearCount = 0;
    let totalCount = 0;

    for (let y = Math.floor(stepY / 2); y < canvas.height; y += stepY) {
      for (let x = Math.floor(stepX / 2); x < canvas.width; x += stepX) {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        if (pixel[3] < 35) {
          clearCount++;
        }
        totalCount++;
      }
    }
    return totalCount > 0 ? clearCount / totalCount : 0;
  }, []);

  const triggerReveal = useCallback(() => {
    setRevealed(true);
    setTaskDone(true);
    setScratchPct(100);
    onCompleteTask();
    try {
      confetti({
        particleCount: 75,
        spread: 85,
        origin: { y: 0.6 },
        colors: ["#fda4af", "#fbcfe8", "#d8b4fe", "#bae6fd", "#fed7aa", "#86efac"],
      });
    } catch {}
  }, [onCompleteTask]);

  // Unified Pointer events for touch, mouse, trackpad
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {}
    isDrawingRef.current = true;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    lastPointRef.current = { x, y };

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 26 * (window.devicePixelRatio || 1), 0, Math.PI * 2);
    ctx.fill();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 52 * (window.devicePixelRatio || 1);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    if (lastPointRef.current) {
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.arc(x, y, 26 * (window.devicePixelRatio || 1), 0, Math.PI * 2);
      ctx.fill();
    }
    lastPointRef.current = { x, y };

    // Sample progress intermittently on move
    if (Math.random() < 0.22) {
      const pct = calculateProgress();
      setScratchPct(Math.round(pct * 100));
      if (pct >= SCRATCH_THRESHOLD) {
        triggerReveal();
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    const pct = calculateProgress();
    setScratchPct(Math.round(pct * 100));
    if (pct >= SCRATCH_THRESHOLD) {
      triggerReveal();
    }
  };

  const resetScratch = () => {
    setRevealed(false);
    setScratchPct(0);
    setTaskDone(false);
    setReveal(REVEAL_OPTIONS[Math.floor(Math.random() * REVEAL_OPTIONS.length)]);
    setTimeout(drawLayer, 60);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start sm:justify-center px-3 sm:px-8 select-none overflow-y-auto overflow-x-hidden pt-16 pb-16 sm:py-14">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-[#fbcfe8]/25 via-[#d8b4fe]/20 to-[#fed7aa]/20 rounded-full blur-[130px] pointer-events-none" />

      <motion.div
        data-card="true"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65 }}
        className="w-full max-w-md lg:max-w-xl paper-card-warm rounded-3xl relative shadow-[0_20px_50px_rgba(80,50,30,0.14)] border border-[#ebdcd0] z-10 overflow-hidden my-auto p-4 sm:p-7 lg:p-9"
      >
        <div className="washi-tape-pink shrink-0 !top-1" />

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#fef3c7] border border-[#fde68a] text-[#92400e] font-sans text-xs mb-2 shadow-2xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
            <span>Birthday Scratch Card 🎟️</span>
          </div>
          <h2 className="font-handwriting text-2xl sm:text-3xl lg:text-4xl font-bold text-[#3f2e24] leading-tight">
            Hmm… something is hidden here 👀
          </h2>
          <p className="text-xs sm:text-sm text-[#786457] font-sans mt-1">
            Scratch the card below with your mouse or finger to reveal!
          </p>
        </div>

        {/* ── Scratch Card Area ── */}
        <div
          ref={containerRef}
          className="relative rounded-2xl overflow-hidden mx-auto shadow-inner select-none"
          style={{ width: "100%", maxWidth: 430, aspectRatio: "16/10" }}
        >
          {/* Under-layer: the reveal content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#fff8f0] to-[#fef2f8] rounded-2xl border-2 border-dashed border-[#fda4af] px-6 text-center gap-2">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={revealed ? { scale: 1.15 } : { scale: 0.9 }}
              transition={{ type: "spring", stiffness: 350, damping: 18 }}
              className="text-4xl sm:text-5xl"
            >
              {reveal.emoji}
            </motion.div>

            <AnimatePresence>
              {revealed ? (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="space-y-1"
                >
                  <p className="font-handwriting text-lg sm:text-xl font-bold text-[#be185d] leading-snug">
                    {reveal.title}
                  </p>
                  <p className="text-xs sm:text-sm text-[#5a4435] font-sans leading-relaxed">
                    {reveal.line1}
                  </p>
                  <p className="text-xs sm:text-sm text-[#786457] font-sans leading-relaxed font-semibold">
                    {reveal.line2}
                  </p>
                </motion.div>
              ) : (
                <p className="text-xs text-[#c4a89a] font-sans italic mt-1">
                  Keep scratching… secret is right under here! ✨
                </p>
              )}
            </AnimatePresence>
          </div>

          {/* Interactive Scratch Canvas */}
          {!revealed && (
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full rounded-2xl touch-none cursor-grab active:cursor-grabbing z-20"
              style={{
                opacity: canvasReady ? 1 : 0,
                transition: "opacity 0.25s ease-in",
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />
          )}
        </div>

        {/* Scratch Progress Bar */}
        {!revealed && (
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex-1 h-2 bg-[#f0e4d6] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#fda4af] to-[#f43f5e] rounded-full"
                animate={{ width: `${scratchPct}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-[#be185d] shrink-0">
              {scratchPct}%
            </span>
          </div>
        )}

        {/* Task Footer Actions */}
        <div className="mt-4">
          {!revealed ? (
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] text-[#a0897a] font-sans">
                {scratchPct === 0
                  ? "Drag cursor across the card to scratch ✨"
                  : `${scratchPct}% scratched — keep going!`}
              </p>
              <button
                type="button"
                onClick={triggerReveal}
                className="px-3 py-1 rounded-xl bg-white hover:bg-rose-50 text-[#be185d] border border-rose-200 text-xs font-sans font-semibold transition-colors cursor-pointer"
              >
                Quick Reveal ✨
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col sm:flex-row items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] text-xs font-sans font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                  <span>SCRATCH CARD UNLOCKED ✓</span>
                </div>
                <button
                  type="button"
                  onClick={resetScratch}
                  title="Scratch again"
                  className="p-1.5 rounded-full bg-white hover:bg-zinc-100 text-[#786457] border border-[#ebdcd0] text-xs transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={onNext}
                className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-[#fda4af] to-[#fb7185] hover:from-[#fb7185] hover:to-[#f43f5e] text-white font-sans font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2 btn-cute"
              >
                <span>Continue to Letter</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
