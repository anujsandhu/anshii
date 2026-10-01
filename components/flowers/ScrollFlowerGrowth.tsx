"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollFlowerGrowthProps {
  label?: string;
  subLabel?: string;
  flowerType?: "tulip" | "wildflower" | "rose";
}

export default function ScrollFlowerGrowth({
  label = "Watch it bloom",
  subLabel = "Keep scrolling to unfold",
  flowerType = "tulip",
}: ScrollFlowerGrowthProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stemRef = useRef<SVGPathElement>(null);
  const leafLeftRef = useRef<SVGPathElement>(null);
  const leafRightRef = useRef<SVGPathElement>(null);
  const blossomRef = useRef<SVGGElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const stem = stemRef.current;
    const leafLeft = leafLeftRef.current;
    const leafRight = leafRightRef.current;
    const blossom = blossomRef.current;
    const glow = glowRef.current;
    const text = textRef.current;

    if (!container || !stem || !blossom) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      // Just render fully grown without scroll animation
      return;
    }

    const stemLength = stem.getTotalLength();
    gsap.set(stem, {
      strokeDasharray: stemLength,
      strokeDashoffset: stemLength,
    });
    gsap.set([leafLeft, leafRight], { scale: 0, transformOrigin: "center bottom", opacity: 0 });
    gsap.set(blossom, { scale: 0, transformOrigin: "50px 30px", opacity: 0, rotate: -20 });
    if (glow) gsap.set(glow, { scale: 0, opacity: 0 });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top 75%",
          end: "bottom 35%",
          scrub: 1, // Smooth scrub linked to scroll position
        },
      });

      // 1. Stem rises upward
      tl.to(stem, {
        strokeDashoffset: 0,
        ease: "power1.out",
        duration: 1.5,
      })
        // 2. Leaves branch out
        .to(
          [leafLeft, leafRight],
          {
            scale: 1,
            opacity: 1,
            stagger: 0.15,
            ease: "back.out(1.7)",
            duration: 0.8,
          },
          "-=0.7"
        )
        // 3. Flower blossom expands and unfolds
        .to(
          blossom,
          {
            scale: 1,
            opacity: 1,
            rotate: 0,
            ease: "back.out(2)",
            duration: 1,
          },
          "-=0.4"
        );

      // 4. Subtle golden glow burst
      if (glow) {
        tl.to(
          glow,
          {
            scale: 1.6,
            opacity: 0.7,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.3"
        );
      }

      // 5. Text fade-in
      if (text) {
        tl.to(
          text,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
          },
          "-=0.5"
        );
      }
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full py-16 sm:py-24 flex flex-col items-center justify-center overflow-hidden select-none"
    >
      {/* Background Soft Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-tr from-pink-500/10 via-purple-500/10 to-amber-400/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Interactive Growing Botanical SVG */}
      <div className="relative w-40 h-52 sm:w-48 sm:h-64 flex items-center justify-center">
        <svg
          viewBox="0 0 100 160"
          className="w-full h-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="growthStemGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="70%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#86efac" />
            </linearGradient>
            <linearGradient id="growthPetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="60%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
            <radialGradient id="bloomGlowGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Golden bloom aura */}
          <circle
            ref={glowRef}
            cx="50"
            cy="30"
            r="35"
            fill="url(#bloomGlowGrad)"
            className="pointer-events-none"
          />

          {/* Main Stem (growing bottom to top) */}
          <path
            ref={stemRef}
            d="M50 155 Q46 110 52 70 Q54 45 50 30"
            stroke="url(#growthStemGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Left Leaf */}
          <path
            ref={leafLeftRef}
            d="M49 110 Q28 100 24 82 Q38 88 49 102"
            fill="url(#growthStemGrad)"
            opacity="0.9"
          />

          {/* Right Leaf */}
          <path
            ref={leafRightRef}
            d="M51 90 Q72 80 76 64 Q62 72 51 84"
            fill="url(#growthStemGrad)"
            opacity="0.9"
          />

          {/* Blooming Blossom Group */}
          <g ref={blossomRef} className="origin-center">
            {/* Back petals */}
            <path
              d="M50 8 C38 18 36 36 50 44 C64 36 62 18 50 8Z"
              fill="#d8b4fe"
              opacity="0.8"
            />
            {/* Left curved petal */}
            <path
              d="M48 44 C30 40 22 28 32 14 C38 24 45 36 48 44Z"
              fill="url(#growthPetalGrad)"
            />
            {/* Right curved petal */}
            <path
              d="M52 44 C70 40 78 28 68 14 C62 24 55 36 52 44Z"
              fill="url(#growthPetalGrad)"
            />
            {/* Front main petal */}
            <path
              d="M50 45 C38 43 36 24 45 12 C48 20 52 20 55 12 C64 24 62 43 50 45Z"
              fill="url(#growthPetalGrad)"
            />
            {/* Delicate pistil spark */}
            <circle cx="50" cy="22" r="3" fill="#fef08a" />
          </g>
        </svg>
      </div>

      {/* Guiding Scroll Caption */}
      <div
        ref={textRef}
        className="mt-3 text-center opacity-70 transform translate-y-3 transition-all duration-300"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-sans text-amber-200/90">
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>{label}</span>
        </div>
        <p className="text-[11px] text-zinc-400 font-sans mt-1">
          {subLabel}
        </p>
      </div>
    </div>
  );
}
