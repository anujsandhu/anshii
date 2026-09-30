"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Terminal, ArrowDown, Code2, Calendar, Check, RefreshCw } from "lucide-react";
import { birthdayData } from "@/data/birthday";

interface HeroProps {
  onScrollClick?: () => void;
}

export default function Hero({ onScrollClick }: HeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [versionState, setVersionState] = useState<"18.0" | "updating" | "19.0">("18.0");

  // Version 18 -> 19 upgrade sequence
  useEffect(() => {
    const t1 = setTimeout(() => {
      setVersionState("updating");
    }, 1800);

    const t2 = setTimeout(() => {
      setVersionState("19.0");
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Subtle interactive particle starfield background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;
    }> = [];

    const colors = ["#f59e0b", "#06b6d4", "#8b5cf6", "#38bdf8", "#e0e7ff"];
    const particleCount = Math.min(width > 768 ? 65 : 35, 70);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.6,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: (Math.random() - 0.5) * 0.35,
        opacity: Math.random() * 0.7 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const scrollToNext = () => {
    if (onScrollClick) {
      onScrollClick();
    } else {
      const target = document.getElementById("moments");
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const words = [
    { text: "Happy", delay: 0.1, color: "text-white" },
    { text: "19th", delay: 0.35, color: "text-amber-400" },
    { text: "Birthday,", delay: 0.6, color: "text-white" },
    { text: birthdayData.recipient.name, delay: 0.85, color: "bg-gradient-to-r from-amber-300 via-rose-300 to-cyan-300 bg-clip-text text-transparent text-glow-gold" },
  ];

  return (
    <section className="relative min-h-[94vh] flex flex-col justify-center items-center px-4 sm:px-6 pt-16 pb-12 overflow-hidden select-none">
      {/* Background canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0 opacity-80"
      />

      {/* Subtle Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[620px] h-[340px] sm:h-[620px] bg-gradient-to-tr from-cyan-600/15 via-violet-600/15 to-amber-500/15 rounded-full blur-[130px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Animated Digital Version Upgrade Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-950/50 backdrop-blur-md font-mono text-xs sm:text-sm mb-8 shadow-xl shadow-cyan-950/40"
        >
          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">VERSION</span>
            <span className="text-zinc-500">|</span>
            {versionState === "18.0" && (
              <span className="text-zinc-400 font-bold">18.0</span>
            )}
            {versionState === "updating" && (
              <span className="text-amber-400 font-bold flex items-center gap-1.5 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Updating to 19.0...
              </span>
            )}
            {versionState === "19.0" && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-emerald-400 font-bold flex items-center gap-1"
              >
                19.0 <Check className="w-3.5 h-3.5" />
              </motion.span>
            )}
          </div>
          <span className="text-zinc-600">•</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            STATUS: STABLE
          </span>
        </motion.div>

        {/* Hero Title: Cinematic Word-by-Word Reveal */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.2] flex flex-wrap justify-center items-center gap-x-3 sm:gap-x-4 gap-y-1">
          {words.map((w, index) => (
            <motion.span
              key={w.text}
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.75,
                delay: w.delay,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`inline-block ${w.color}`}
            >
              {w.text}
            </motion.span>
          ))}
        </h1>

        {/* Subtext Reveal */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="mt-6 text-base sm:text-xl text-zinc-300 max-w-2xl font-normal leading-relaxed font-sans"
        >
          &ldquo;{birthdayData.hero.subtext}&rdquo;
        </motion.p>

        {/* CS Meta tags bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-zinc-400"
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-white/5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>{birthdayData.recipient.birthdayDate}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-white/5">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Age == 19</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-white/5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Compiled by {birthdayData.recipient.creatorName}</span>
          </div>
        </motion.div>

        {/* Scroll Indicator with gentle looping animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
          className="mt-14 sm:mt-16 flex flex-col items-center cursor-pointer group"
          onClick={scrollToNext}
        >
          <span className="text-xs font-mono text-zinc-400 group-hover:text-zinc-200 transition-colors mb-2">
            {birthdayData.hero.scrollHint}
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center group-hover:border-cyan-400/40 group-hover:bg-cyan-500/10 transition-colors"
          >
            <ArrowDown className="w-4 h-4 text-zinc-400 group-hover:text-cyan-300 transition-colors" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
