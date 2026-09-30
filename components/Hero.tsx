"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, Terminal, ArrowDown, Code2, Calendar } from "lucide-react";
import { birthdayData } from "@/data/birthday";

interface HeroProps {
  onScrollClick?: () => void;
}

export default function Hero({ onScrollClick }: HeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center items-center px-4 sm:px-6 pt-16 pb-12 overflow-hidden select-none">
      {/* Background canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0 opacity-80"
      />

      {/* Subtle Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[600px] h-[340px] sm:h-[600px] bg-gradient-to-tr from-cyan-600/15 via-violet-600/15 to-amber-500/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Version / Release Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 backdrop-blur-md text-cyan-300 font-mono text-xs sm:text-sm mb-6 shadow-lg shadow-cyan-950/50"
        >
          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>{birthdayData.hero.badge}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.15]"
        >
          Happy 19th Birthday,{" "}
          <span className="bg-gradient-to-r from-amber-300 via-rose-300 to-cyan-300 bg-clip-text text-transparent text-glow-gold">
            {birthdayData.recipient.name}
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-6 text-base sm:text-xl text-zinc-300 max-w-2xl font-normal leading-relaxed font-sans"
        >
          &ldquo;{birthdayData.hero.subtext}&rdquo;
        </motion.p>

        {/* CS Meta tags bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
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

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="mt-14 sm:mt-16 flex flex-col items-center cursor-pointer group"
          onClick={scrollToNext}
        >
          <span className="text-xs font-mono text-zinc-400 group-hover:text-zinc-200 transition-colors mb-2">
            {birthdayData.hero.scrollHint}
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
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
