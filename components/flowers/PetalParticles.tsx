"use client";

import React, { useEffect, useState } from "react";
import { PetalSvg } from "./FlowerSvg";

interface PetalItem {
  id: number;
  x: number; // percentage across screen
  startY: number; // viewport start offset
  size: number;
  duration: number; // drift cycle duration in seconds
  delay: number;
  rotation: number;
  rotationDelta: number;
  color: string;
  accentColor: string;
  opacity: number;
}

export default function PetalParticles({ count = 22 }: { count?: number }) {
  const [petals, setPetals] = useState<PetalItem[]>([]);

  useEffect(() => {
    // Generate deterministic or randomized petals once on client
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const actualCount = isMobile ? Math.min(count, 12) : count;

    const palette = [
      { color: "#fda4af", accent: "#f43f5e" }, // peach/rose
      { color: "#fbcfe8", accent: "#f472b6" }, // blush
      { color: "#e9d5ff", accent: "#c084fc" }, // soft lavender
      { color: "#fef3c7", accent: "#fcd34d" }, // soft cream
      { color: "#fed7aa", accent: "#fb923c" }, // soft peach
    ];

    const generated: PetalItem[] = [];
    for (let i = 0; i < actualCount; i++) {
      const p = palette[Math.floor(Math.random() * palette.length)];
      generated.push({
        id: i,
        x: Math.random() * 96 + 2, // 2% to 98%
        startY: Math.random() * 100, // percentage
        size: Math.floor(Math.random() * 14) + 12, // 12px to 26px
        duration: Math.random() * 12 + 14, // 14s to 26s
        delay: Math.random() * 8,
        rotation: Math.random() * 360,
        rotationDelta: (Math.random() - 0.5) * 180,
        color: p.color,
        accentColor: p.accent,
        opacity: Math.random() * 0.45 + 0.35,
      });
    }

    setPetals(generated);
  }, [count]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-[1]"
    >
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute will-change-transform"
          style={{
            left: `${petal.x}%`,
            top: `-5%`,
            animation: `floatPetal ${petal.duration}s linear infinite`,
            animationDelay: `${petal.delay}s`,
            opacity: petal.opacity,
          }}
        >
          <PetalSvg
            size={petal.size}
            color={petal.color}
            accentColor={petal.accentColor}
            rotation={petal.rotation}
            className="animate-gentle-float"
          />
        </div>
      ))}

      <style jsx global>{`
        @keyframes floatPetal {
          0% {
            transform: translateY(-5vh) translateX(0px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          50% {
            transform: translateY(50vh) translateX(25px) rotate(120deg);
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(105vh) translateX(-20px) rotate(260deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
