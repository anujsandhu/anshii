"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Sparkles } from "lucide-react";

interface FinalBloomProps {
  onComplete?: () => void;
}

export default function FinalBloom({ onComplete }: FinalBloomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stemRef = useRef<SVGPathElement>(null);
  const leavesRef = useRef<SVGGElement>(null);
  const petalsRef = useRef<SVGGElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const centerPistilRef = useRef<SVGGElement>(null);
  const [bloomFinished, setBloomFinished] = useState(false);

  useEffect(() => {
    const stem = stemRef.current;
    const leaves = leavesRef.current;
    const petals = petalsRef.current;
    const glow = glowRef.current;
    const center = centerPistilRef.current;

    if (!stem || !leaves || !petals) return;

    // Check prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setBloomFinished(true);
      if (onComplete) onComplete();
      return;
    }

    const stemLength = stem.getTotalLength();
    gsap.set(stem, {
      strokeDasharray: stemLength,
      strokeDashoffset: stemLength,
    });
    gsap.set(leaves, { scale: 0, opacity: 0, transformOrigin: "50px 100px" });
    gsap.set(petals, { scale: 0, opacity: 0, transformOrigin: "50px 35px", rotate: -30 });
    if (center) gsap.set(center, { scale: 0, opacity: 0, transformOrigin: "50px 35px" });
    if (glow) gsap.set(glow, { scale: 0, opacity: 0 });

    const tl = gsap.timeline({
      delay: 0.4,
      onComplete: () => {
        setBloomFinished(true);
        if (onComplete) onComplete();
      },
    });

    // 1. Stem rises gently
    tl.to(stem, {
      strokeDashoffset: 0,
      duration: 1.4,
      ease: "power2.out",
    })
      // 2. Botanical leaves unfurl
      .to(
        leaves,
        {
          scale: 1,
          opacity: 1,
          duration: 0.9,
          ease: "back.out(1.8)",
        },
        "-=0.6"
      )
      // 3. Petals unfold layer by layer
      .to(
        petals,
        {
          scale: 1,
          opacity: 1,
          rotate: 0,
          duration: 1.5,
          ease: "elastic.out(1, 0.6)",
        },
        "-=0.4"
      )
      // 4. Center pistil radiates
      .to(
        center,
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: "back.out(2)",
        },
        "-=0.8"
      )
      // 5. Soft golden luminescence
      .to(
        glow,
        {
          scale: 1.8,
          opacity: 0.85,
          duration: 1,
          ease: "power2.out",
        },
        "-=0.6"
      );

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center py-2 select-none"
    >
      {/* Dynamic Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-tr from-amber-400/20 via-rose-400/20 to-purple-500/20 rounded-full blur-[90px] pointer-events-none" />

      {/* SVG Final Bloom Masterpiece */}
      <div className="relative w-28 h-40 sm:w-36 sm:h-52 flex items-center justify-center">
        <svg
          viewBox="0 0 100 160"
          className="w-full h-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="finalStemGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#16a34a" />
              <stop offset="60%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#86efac" />
            </linearGradient>

            <linearGradient id="finalPetalOuter" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="50%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>

            <linearGradient id="finalPetalInner" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#fda4af" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>

            <radialGradient id="finalAuraGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Golden Aura Glow */}
          <circle
            ref={glowRef}
            cx="50"
            cy="35"
            r="40"
            fill="url(#finalAuraGlow)"
            className="pointer-events-none"
          />

          {/* Stem */}
          <path
            ref={stemRef}
            d="M50 155 Q47 115 52 75 Q54 50 50 35"
            stroke="url(#finalStemGrad)"
            strokeWidth="3.8"
            strokeLinecap="round"
          />

          {/* Leaves */}
          <g ref={leavesRef}>
            {/* Left curved leaf */}
            <path
              d="M49 110 Q22 96 20 74 Q36 82 49 100"
              fill="url(#finalStemGrad)"
              opacity="0.9"
            />
            {/* Right curved leaf */}
            <path
              d="M51 92 Q78 80 82 58 Q66 68 51 84"
              fill="url(#finalStemGrad)"
              opacity="0.9"
            />
          </g>

          {/* Unfolding Petal Symphony */}
          <g ref={petalsRef}>
            {/* Layer 1: Back spreading petals */}
            <ellipse
              cx="50"
              cy="20"
              rx="12"
              ry="20"
              fill="url(#finalPetalOuter)"
              opacity="0.8"
            />
            <ellipse
              cx="35"
              cy="28"
              rx="11"
              ry="18"
              fill="url(#finalPetalOuter)"
              transform="rotate(-35 35 28)"
              opacity="0.85"
            />
            <ellipse
              cx="65"
              cy="28"
              rx="11"
              ry="18"
              fill="url(#finalPetalOuter)"
              transform="rotate(35 65 28)"
              opacity="0.85"
            />

            {/* Layer 2: Mid-tier blooming petals */}
            <path
              d="M48 38 C28 34 20 20 32 8 C38 18 45 30 48 38Z"
              fill="url(#finalPetalInner)"
            />
            <path
              d="M52 38 C72 34 80 20 68 8 C62 18 55 30 52 38Z"
              fill="url(#finalPetalInner)"
            />

            {/* Layer 3: Crown petal */}
            <path
              d="M50 40 C38 38 36 18 45 8 C48 16 52 16 55 8 C64 18 62 38 50 40Z"
              fill="url(#finalPetalInner)"
            />
          </g>

          {/* Golden center pistil core */}
          <g ref={centerPistilRef}>
            <circle cx="50" cy="30" r="7" fill="#fef08a" />
            <circle cx="50" cy="30" r="4" fill="#f59e0b" />
            <circle cx="48" cy="28" r="1.5" fill="#ffffff" />
          </g>
        </svg>
      </div>

      {bloomFinished && (
        <div className="flex items-center gap-1.5 text-xs text-amber-200/90 font-sans animate-fade-in mt-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Bloom complete</span>
        </div>
      )}
    </div>
  );
}
