"use client";

import React, { useEffect, useRef } from "react";

interface StardustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  color: string;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface CursorSparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  decay: number;
  isPetal?: boolean;
  isHeart?: boolean;
  rotation?: number;
  rotationSpeed?: number;
}

interface RippleRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  lineWidth: number;
}

const PALETTE = [
  "#fda4af", // rose
  "#fbcfe8", // blush
  "#fed7aa", // warm apricot
  "#fef08a", // soft gold
  "#d8b4fe", // soft lavender
];

export default function InteractiveScrapbookCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Only run on desktop screens (>= 768px) to keep mobile devices silky smooth and fast
    const isMobile = window.innerWidth < 768 || ("ontouchstart" in window && window.innerWidth < 1024);
    if (isMobile) return;

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // 1. Ambient Stardust
    const ambientStars: StardustParticle[] = [];
    const starCount = Math.min(35, Math.floor(width / 35));

    for (let i = 0; i < starCount; i++) {
      ambientStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -0.15 - Math.random() * 0.2, // gentle upward drift
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.6 + 0.2,
        maxAlpha: Math.random() * 0.6 + 0.3,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        twinkleSpeed: 0.02 + Math.random() * 0.03,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    // 2. Cursor Sparkles & Floating Mini Petals
    const sparkles: CursorSparkle[] = [];
    const ripples: RippleRing[] = [];

    let lastMouseX = -100;
    let lastMouseY = -100;
    let lastSpawnTime = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      const dist = Math.hypot(e.clientX - lastMouseX, e.clientY - lastMouseY);

      if (dist > 8 && now - lastSpawnTime > 25) {
        lastSpawnTime = now;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;

        const rand = Math.random();
        const isHeart = rand < 0.48; // Sprinkle hearts!
        const isPetal = !isHeart && rand < 0.76;
        const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];

        sparkles.push({
          x: e.clientX + (Math.random() - 0.5) * 12,
          y: e.clientY + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 0.8,
          vy: isHeart ? -0.4 - Math.random() * 0.4 : 0.3 + Math.random() * 0.5, // hearts float up gracefully
          size: isHeart ? 4.5 + Math.random() * 3.5 : isPetal ? 4 + Math.random() * 3 : 1.8 + Math.random() * 2,
          alpha: 0.9,
          color,
          decay: isHeart ? 0.014 : isPetal ? 0.013 : 0.02,
          isHeart,
          isPetal,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.06,
        });

        // Cap sparkle count for 60fps performance
        if (sparkles.length > 60) sparkles.shift();
      }
    };

    const handleClick = (e: MouseEvent) => {
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 4,
        maxRadius: 36 + Math.random() * 16,
        alpha: 0.55,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        lineWidth: 1.5,
      });
      if (ripples.length > 8) ripples.shift();
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("click", handleClick, { passive: true });

    // Draw helper: delicate mini petal
    const drawPetal = (
      pCtx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      rotation: number,
      color: string,
      alpha: number
    ) => {
      pCtx.save();
      pCtx.translate(x, y);
      pCtx.rotate(rotation);
      pCtx.globalAlpha = Math.max(0, alpha);
      pCtx.fillStyle = color;

      pCtx.beginPath();
      pCtx.moveTo(0, -size);
      pCtx.bezierCurveTo(size * 0.7, -size * 0.5, size * 0.8, size * 0.6, 0, size);
      pCtx.bezierCurveTo(-size * 0.8, size * 0.6, -size * 0.7, -size * 0.5, 0, -size);
      pCtx.fill();
      pCtx.restore();
    };

    // Draw helper: delicate mini heart
    const drawHeart = (
      pCtx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      rotation: number,
      color: string,
      alpha: number
    ) => {
      pCtx.save();
      pCtx.translate(x, y);
      pCtx.rotate(rotation);
      pCtx.globalAlpha = Math.max(0, alpha);
      pCtx.fillStyle = color;

      pCtx.beginPath();
      const topCurveHeight = size * 0.35;
      pCtx.moveTo(0, topCurveHeight);
      pCtx.bezierCurveTo(-size * 0.6, -topCurveHeight, -size * 1.1, topCurveHeight * 0.4, 0, size * 1.1);
      pCtx.bezierCurveTo(size * 1.1, topCurveHeight * 0.4, size * 0.6, -topCurveHeight, 0, topCurveHeight);
      pCtx.fill();
      pCtx.restore();
    };

    // Main render loop
    let isTabVisible = true;
    const handleVisibility = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const render = () => {
      if (!isTabVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // A. Draw Ambient Stardust
      for (let i = 0; i < ambientStars.length; i++) {
        const star = ambientStars[i];
        star.x += star.vx;
        star.y += star.vy;
        star.twinklePhase += star.twinkleSpeed;

        if (star.y < -10) star.y = height + 10;
        if (star.x < -10) star.x = width + 10;
        if (star.x > width + 10) star.x = -10;

        const currentAlpha =
          star.maxAlpha * (0.4 + 0.6 * Math.sin(star.twinklePhase));

        ctx.save();
        ctx.globalAlpha = Math.max(0, currentAlpha);
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Cross sparkle glow on peak twinkle
        if (currentAlpha > 0.65) {
          ctx.strokeStyle = star.color;
          ctx.lineWidth = 0.75;
          ctx.beginPath();
          ctx.moveTo(star.x - star.size * 2, star.y);
          ctx.lineTo(star.x + star.size * 2, star.y);
          ctx.moveTo(star.x, star.y - star.size * 2);
          ctx.lineTo(star.x, star.y + star.size * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // B. Draw Expanding Watercolor Ripple Rings
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 1.4;
        r.alpha -= 0.018;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, r.alpha);
        ctx.strokeStyle = r.color;
        ctx.lineWidth = r.lineWidth;
        ctx.setLineDash([3, 4]); // sketched dashed watercolor ring
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // C. Draw Cursor Sparkles & Mini Petals
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= s.decay;

        if (s.rotation !== undefined && s.rotationSpeed !== undefined) {
          s.rotation += s.rotationSpeed;
        }

        if (s.alpha <= 0) {
          sparkles.splice(i, 1);
          continue;
        }

        if (s.isHeart) {
          drawHeart(
            ctx,
            s.x,
            s.y,
            s.size,
            s.rotation || 0,
            s.color,
            s.alpha
          );
        } else if (s.isPetal) {
          drawPetal(
            ctx,
            s.x,
            s.y,
            s.size,
            s.rotation || 0,
            s.color,
            s.alpha
          );
        } else {
          ctx.save();
          ctx.globalAlpha = Math.max(0, s.alpha);
          ctx.fillStyle = s.color;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[2] w-full h-full"
    />
  );
}
