"use client";

import React, { useEffect, useState, useRef } from "react";

interface Butterfly {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  scale: number;
  angle: number;
  wingSpeed: number; // seconds per flap
  color: {
    wing: string;
    accent: string;
    body: string;
  };
}

const BUTTERFLY_PALETTES = [
  { wing: "#fda4af", accent: "#f43f5e", body: "#be185d" }, // rose / blush
  { wing: "#d8b4fe", accent: "#c084fc", body: "#7e22ce" }, // soft lavender
  { wing: "#fed7aa", accent: "#fb923c", body: "#c2410c" }, // peach apricot
  { wing: "#bbf7d0", accent: "#4ade80", body: "#15803d" }, // mint green
];

export default function AnimatedButterflies() {
  const [mounted, setMounted] = useState(false);
  const butterfliesRef = useRef<Butterfly[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const elementsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Only show on desktop screens >= 1024px and when reduced motion is not preferred
    const isDesktop = window.innerWidth >= 1024;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!isDesktop || prefersReducedMotion) return;

    setMounted(true);

    const initialButterflies: Butterfly[] = [
      {
        id: 1,
        x: window.innerWidth * 0.15,
        y: window.innerHeight * 0.25,
        targetX: window.innerWidth * 0.25,
        targetY: window.innerHeight * 0.35,
        vx: 0.5,
        vy: 0.3,
        scale: 0.85,
        angle: 25,
        wingSpeed: 0.28,
        color: BUTTERFLY_PALETTES[0],
      },
      {
        id: 2,
        x: window.innerWidth * 0.85,
        y: window.innerHeight * 0.65,
        targetX: window.innerWidth * 0.75,
        targetY: window.innerHeight * 0.5,
        vx: -0.4,
        vy: -0.2,
        scale: 0.75,
        angle: -35,
        wingSpeed: 0.22,
        color: BUTTERFLY_PALETTES[1],
      },
      {
        id: 3,
        x: window.innerWidth * 0.88,
        y: window.innerHeight * 0.18,
        targetX: window.innerWidth * 0.78,
        targetY: window.innerHeight * 0.3,
        vx: -0.3,
        vy: 0.4,
        scale: 0.9,
        angle: -15,
        wingSpeed: 0.25,
        color: BUTTERFLY_PALETTES[2],
      },
    ];

    butterfliesRef.current = initialButterflies;

    let mouseX = -999;
    let mouseY = -999;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    let animationFrameId: number;

    const updatePhysics = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;

      butterfliesRef.current.forEach((b, idx) => {
        // Meander towards random targets
        const distTarget = Math.hypot(b.targetX - b.x, b.targetY - b.y);
        if (distTarget < 40 || Math.random() < 0.01) {
          b.targetX = Math.random() * (W - 120) + 60;
          b.targetY = Math.random() * (H - 120) + 60;
        }

        // Steer towards target
        const dx = b.targetX - b.x;
        const dy = b.targetY - b.y;
        b.vx += (dx / distTarget) * 0.04;
        b.vy += (dy / distTarget) * 0.04;

        // Flee from cursor if within 110px!
        const distMouse = Math.hypot(mouseX - b.x, mouseY - b.y);
        if (distMouse < 110 && distMouse > 0) {
          const fleeX = (b.x - mouseX) / distMouse;
          const fleeY = (b.y - mouseY) / distMouse;
          b.vx += fleeX * 0.5;
          b.vy += fleeY * 0.5;
        }

        // Drag & max speed
        b.vx *= 0.96;
        b.vy *= 0.96;
        const speed = Math.hypot(b.vx, b.vy);
        const maxSpeed = 2.2;
        if (speed > maxSpeed) {
          b.vx = (b.vx / speed) * maxSpeed;
          b.vy = (b.vy / speed) * maxSpeed;
        }

        b.x += b.vx;
        b.y += b.vy;

        // Keep inside screen bounds with bounce
        if (b.x < 30) { b.x = 30; b.vx = Math.abs(b.vx); }
        if (b.x > W - 30) { b.x = W - 30; b.vx = -Math.abs(b.vx); }
        if (b.y < 30) { b.y = 30; b.vy = Math.abs(b.vy); }
        if (b.y > H - 30) { b.y = H - 30; b.vy = -Math.abs(b.vy); }

        // Compute rotation angle based on flight direction
        const targetAngle = (Math.atan2(b.vy, b.vx) * 180) / Math.PI + 90;
        b.angle += (targetAngle - b.angle) * 0.08;

        // Direct DOM update for 60fps buttery smoothness
        const el = elementsRef.current[idx];
        if (el) {
          el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0px) rotate(${b.angle}deg) scale(${b.scale})`;
        }
      });

      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[12] overflow-hidden select-none"
    >
      {butterfliesRef.current.map((b, idx) => (
        <div
          key={b.id}
          ref={(el) => {
            elementsRef.current[idx] = el;
          }}
          className="absolute top-0 left-0 will-change-transform"
          style={{
            transform: `translate3d(${b.x}px, ${b.y}px, 0px) rotate(${b.angle}deg) scale(${b.scale})`,
          }}
        >
          {/* Animated 3D Flapping Butterfly SVG */}
          <div className="relative w-12 h-12 -translate-x-1/2 -translate-y-1/2 perspective-[400px]">
            {/* Left Wing */}
            <div
              className="absolute top-0 left-0 w-6 h-12 origin-right"
              style={{
                animation: `flapLeftWing ${b.wingSpeed}s ease-in-out infinite alternate`,
              }}
            >
              <svg
                viewBox="0 0 40 70"
                className="w-full h-full filter drop-shadow-xs"
                fill="none"
              >
                <path
                  d="M 38 32 C 34 10, 6 2, 2 24 C -1 40, 18 52, 38 46 Z"
                  fill={b.color.wing}
                  fillOpacity="0.85"
                  stroke={b.color.accent}
                  strokeWidth="1.5"
                />
                <circle cx="18" cy="26" r="3.5" fill={b.color.accent} opacity="0.6" />
                <path
                  d="M 38 42 C 32 52, 10 58, 8 68 C 18 72, 36 64, 38 46 Z"
                  fill={b.color.wing}
                  fillOpacity="0.75"
                  stroke={b.color.accent}
                  strokeWidth="1.2"
                />
              </svg>
            </div>

            {/* Right Wing */}
            <div
              className="absolute top-0 right-0 w-6 h-12 origin-left"
              style={{
                animation: `flapRightWing ${b.wingSpeed}s ease-in-out infinite alternate`,
              }}
            >
              <svg
                viewBox="0 0 40 70"
                className="w-full h-full filter drop-shadow-xs -scale-x-100"
                fill="none"
              >
                <path
                  d="M 38 32 C 34 10, 6 2, 2 24 C -1 40, 18 52, 38 46 Z"
                  fill={b.color.wing}
                  fillOpacity="0.85"
                  stroke={b.color.accent}
                  strokeWidth="1.5"
                />
                <circle cx="18" cy="26" r="3.5" fill={b.color.accent} opacity="0.6" />
                <path
                  d="M 38 42 C 32 52, 10 58, 8 68 C 18 72, 36 64, 38 46 Z"
                  fill={b.color.wing}
                  fillOpacity="0.75"
                  stroke={b.color.accent}
                  strokeWidth="1.2"
                />
              </svg>
            </div>

            {/* Central Slender Body & Antennae */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <div
                className="w-1 h-7 rounded-full shadow-xs"
                style={{ backgroundColor: b.color.body }}
              />
              {/* Antennae */}
              <div className="absolute -top-2 -left-1.5 w-4 flex justify-between">
                <span
                  className="w-0.5 h-2.5 rounded-full -rotate-25 origin-bottom"
                  style={{ backgroundColor: b.color.body }}
                />
                <span
                  className="w-0.5 h-2.5 rounded-full rotate-25 origin-bottom"
                  style={{ backgroundColor: b.color.body }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <style jsx global>{`
        @keyframes flapLeftWing {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(68deg);
          }
        }
        @keyframes flapRightWing {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(-68deg);
          }
        }
      `}</style>
    </div>
  );
}
