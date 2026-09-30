"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowDown, Calendar, Heart } from "lucide-react";
import { birthdayData } from "@/data/birthday";

interface HeroProps {
  onScrollClick?: () => void;
}

export default function Hero({ onScrollClick }: HeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dynamic background canvas with floating particles, tiny stars, and subtle light movement
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
      twinkleSpeed: number;
      isStar: boolean;
    }> = [];

    const colors = ["#f59e0b", "#fda4af", "#c084fc", "#38bdf8", "#fef3c7", "#ffffff"];
    const particleCount = Math.min(width > 768 ? 75 : 45, 80);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 0.6,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.7 + 0.25,
        color: colors[Math.floor(Math.random() * colors.length)],
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        isStar: Math.random() > 0.65,
      });
    }

    let time = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.01;

      particles.forEach((p) => {
        p.x += p.speedX + Math.sin(time + p.y * 0.01) * 0.15;
        p.y += p.speedY + Math.cos(time + p.x * 0.01) * 0.15;

        // Twinkle opacity
        p.opacity += Math.sin(time * 2 + p.x) * p.twinkleSpeed;
        if (p.opacity < 0.2) p.opacity = 0.2;
        if (p.opacity > 0.9) p.opacity = 0.9;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        if (p.isStar) {
          // Tiny four-point star sparkle
          const r = p.radius * 1.5;
          ctx.moveTo(p.x, p.y - r);
          ctx.lineTo(p.x + r * 0.3, p.y - r * 0.3);
          ctx.lineTo(p.x + r, p.y);
          ctx.lineTo(p.x + r * 0.3, p.y + r * 0.3);
          ctx.lineTo(p.x, p.y + r);
          ctx.lineTo(p.x - r * 0.3, p.y + r * 0.3);
          ctx.lineTo(p.x - r, p.y);
          ctx.lineTo(p.x - r * 0.3, p.y - r * 0.3);
          ctx.closePath();
        } else {
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.shadowBlur = 10;
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
      const target = document.getElementById("message") || document.getElementById("moments");
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const words = [
    { text: "Happy", delay: 0.1, color: "text-white" },
    { text: "19th", delay: 0.3, color: "text-amber-300 text-glow-gold" },
    { text: "Birthday,", delay: 0.5, color: "text-white" },
    {
      text: birthdayData.recipient.name,
      delay: 0.75,
      color:
        "bg-gradient-to-r from-amber-300 via-rose-300 via-purple-300 to-amber-200 bg-clip-text text-transparent animate-gradient-text text-glow-gold",
    },
  ];

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center items-center px-4 sm:px-6 pt-12 pb-14 overflow-hidden select-none">
      {/* Background canvas for stars and gentle particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0 opacity-85"
      />

      {/* Dynamic Slow-Moving Ambient Gradient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[720px] h-[380px] sm:h-[720px] bg-gradient-to-tr from-amber-500/20 via-rose-500/15 via-purple-600/15 to-sky-500/15 rounded-full blur-[140px] pointer-events-none animate-soft-pulse" />
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 w-[280px] sm:w-[500px] h-[280px] sm:h-[500px] bg-gradient-to-br from-indigo-600/15 via-violet-500/10 to-transparent rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Subtle Developer-Inspired Identity Details */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8"
        >
          {/* Identity Pill 1: ANSHIKA.EXE */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-950/30 backdrop-blur-md font-mono text-xs text-amber-200 shadow-lg shadow-amber-950/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold tracking-wide">ANSHIKA.EXE</span>
            <span className="text-zinc-500">•</span>
            <span className="text-amber-300/90 font-bold">v19.0</span>
          </div>

          {/* Identity Pill 2: RELEASE v19.0 // OCT 28, 2026 */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md font-mono text-xs text-zinc-300">
            <Calendar className="w-3.5 h-3.5 text-rose-300" />
            <span>RELEASE v19.0 // OCT 28, 2026</span>
          </div>
        </motion.div>

        {/* Hero Title: Cinematic Word-by-Word Reveal */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.15] flex flex-wrap justify-center items-center gap-x-3 sm:gap-x-5 gap-y-1.5">
          {words.map((w) => (
            <motion.span
              key={w.text}
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.8,
                delay: w.delay,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`inline-block ${w.color}`}
            >
              {w.text}
            </motion.span>
          ))}
        </h1>

        {/* Thoughtful Subtext Reveal */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-6 text-base sm:text-xl text-zinc-200/90 max-w-2xl font-normal leading-relaxed font-sans"
        >
          &ldquo;{birthdayData.hero.subtext}&rdquo;
        </motion.p>

        {/* Personal Tag Pill */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-zinc-400 font-sans"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Made with care by <strong className="text-zinc-200 font-medium">{birthdayData.recipient.creatorName}</strong></span>
          <span className="text-zinc-600">•</span>
          <span>A dedicated space for year 19</span>
        </motion.div>

        {/* Scroll Indicator with gentle looping animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="mt-12 sm:mt-16 flex flex-col items-center cursor-pointer group"
          onClick={scrollToNext}
        >
          <span className="text-xs font-mono text-zinc-400 group-hover:text-amber-200 transition-colors mb-2.5">
            {birthdayData.hero.scrollHint}
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-9 h-9 rounded-full border border-amber-400/30 bg-amber-500/10 flex items-center justify-center group-hover:border-amber-400/60 group-hover:bg-amber-500/20 transition-all shadow-lg shadow-amber-950/30"
          >
            <ArrowDown className="w-4 h-4 text-amber-300 transition-colors" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
