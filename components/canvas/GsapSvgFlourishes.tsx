"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface GsapSvgFlourishesProps {
  currentFrame: number;
}

export default function GsapSvgFlourishes({
  currentFrame,
}: GsapSvgFlourishesProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 1. GSAP Ink Drawing & Botanical Flourish Animation on Frame Change
  useEffect(() => {
    if (!containerRef.current) return;

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Find all stroke paths
      const paths = containerRef.current?.querySelectorAll(".sketch-path");
      const buds = containerRef.current?.querySelectorAll(".sketch-bud");

      if (paths && paths.length > 0) {
        paths.forEach((p) => {
          const pathEl = p as SVGPathElement;
          const length = pathEl.getTotalLength ? pathEl.getTotalLength() : 300;
          pathEl.style.strokeDasharray = `${length}`;
          pathEl.style.strokeDashoffset = `${length}`;
        });

        gsap.to(paths, {
          strokeDashoffset: 0,
          duration: 1.4,
          ease: "power2.out",
          stagger: 0.12,
        });
      }

      if (buds && buds.length > 0) {
        gsap.fromTo(
          buds,
          { scale: 0, opacity: 0, transformOrigin: "center center" },
          {
            scale: 1,
            opacity: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: "back.out(2)",
            delay: 0.4,
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [currentFrame]);

  // 2. GSAP Subtle 3D Card Parallax Tilt on Large Screens
  useEffect(() => {
    const isLargeScreen =
      typeof window !== "undefined" && window.innerWidth >= 1024;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!isLargeScreen || prefersReducedMotion) return;

    let activeCard: HTMLElement | null = null;
    let setRotateX: gsap.QuickToFunc | null = null;
    let setRotateY: gsap.QuickToFunc | null = null;
    let setTranslateZ: gsap.QuickToFunc | null = null;

    const findActiveCard = () => {
      // Look for data-card="true" inside the visible viewport
      const cards = document.querySelectorAll<HTMLElement>('[data-card="true"]');
      for (let i = 0; i < cards.length; i++) {
        const rect = cards[i].getBoundingClientRect();
        if (
          rect.top >= -100 &&
          rect.bottom <= window.innerHeight + 100 &&
          rect.width > 0
        ) {
          activeCard = cards[i];
          break;
        }
      }

      if (activeCard) {
        gsap.set(activeCard, {
          transformPerspective: 1200,
          transformStyle: "preserve-3d",
        });
        setRotateX = gsap.quickTo(activeCard, "rotationX", {
          duration: 0.7,
          ease: "power2.out",
        });
        setRotateY = gsap.quickTo(activeCard, "rotationY", {
          duration: 0.7,
          ease: "power2.out",
        });
        setTranslateZ = gsap.quickTo(activeCard, "z", {
          duration: 0.7,
          ease: "power2.out",
        });
      }
    };

    findActiveCard();
    const timer = setTimeout(findActiveCard, 400);

    const handleMouseMove = (e: MouseEvent) => {
      if (!activeCard || !setRotateX || !setRotateY || !setTranslateZ) {
        findActiveCard();
        return;
      }

      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;

      // Subtle tilt (-2.5 deg to +2.5 deg)
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;

      setRotateY(dx * 2.5);
      setRotateX(-dy * 2.2);
      setTranslateZ(8);
    };

    const handleMouseLeave = () => {
      if (setRotateX && setRotateY && setTranslateZ) {
        setRotateX(0);
        setRotateY(0);
        setTranslateZ(0);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (activeCard) {
        gsap.set(activeCard, {
          rotationX: 0,
          rotationY: 0,
          z: 0,
          clearProps: "transformPerspective,transformStyle",
        });
      }
    };
  }, [currentFrame]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[3] overflow-hidden select-none"
    >
      {/* ── TOP-LEFT BOTANICAL VINE (SVG SKETCH DRAWING) ── */}
      <svg
        className="absolute top-12 left-2 w-32 h-32 sm:w-44 sm:h-44 opacity-45 filter drop-shadow-xs"
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="sketch-path"
          d="M 6 6 C 30 18, 62 14, 88 38 C 114 62, 110 98, 142 120"
          stroke="#be185d"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="sketch-path"
          d="M 36 22 C 34 8, 48 4, 52 14 C 54 22, 44 26, 36 22 Z"
          fill="#fbcfe8"
          stroke="#f43f5e"
          strokeWidth="1.2"
        />
        <path
          className="sketch-path"
          d="M 72 32 C 84 20, 96 26, 92 36 C 88 44, 76 40, 72 32 Z"
          fill="#fef08a"
          stroke="#eab308"
          strokeWidth="1.2"
        />
        <path
          className="sketch-path"
          d="M 104 68 C 118 64, 126 74, 120 84 C 112 90, 102 80, 104 68 Z"
          fill="#d8b4fe"
          stroke="#a855f7"
          strokeWidth="1.2"
        />
        {/* Flower Buds */}
        <circle
          className="sketch-bud"
          cx="142"
          cy="120"
          r="4.5"
          fill="#fda4af"
          stroke="#e11d48"
          strokeWidth="1.2"
        />
        <circle
          className="sketch-bud"
          cx="88"
          cy="38"
          r="3.5"
          fill="#fed7aa"
          stroke="#ea580c"
          strokeWidth="1.2"
        />
      </svg>

      {/* ── TOP-RIGHT BOTANICAL VINE (SVG SKETCH DRAWING) ── */}
      <svg
        className="absolute top-12 right-2 w-32 h-32 sm:w-44 sm:h-44 opacity-45 filter drop-shadow-xs -scale-x-100"
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="sketch-path"
          d="M 6 6 C 30 18, 62 14, 88 38 C 114 62, 110 98, 142 120"
          stroke="#be185d"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="sketch-path"
          d="M 36 22 C 34 8, 48 4, 52 14 C 54 22, 44 26, 36 22 Z"
          fill="#fed7aa"
          stroke="#ea580c"
          strokeWidth="1.2"
        />
        <path
          className="sketch-path"
          d="M 72 32 C 84 20, 96 26, 92 36 C 88 44, 76 40, 72 32 Z"
          fill="#fbcfe8"
          stroke="#f43f5e"
          strokeWidth="1.2"
        />
        <circle
          className="sketch-bud"
          cx="142"
          cy="120"
          r="4.5"
          fill="#d8b4fe"
          stroke="#9333ea"
          strokeWidth="1.2"
        />
      </svg>

      {/* ── BOTTOM-LEFT HANDMADE SKETCH CORNER ── */}
      <svg
        className="absolute bottom-4 left-3 w-28 h-28 sm:w-36 sm:h-36 opacity-35 filter drop-shadow-xs"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="sketch-path"
          d="M 4 116 C 16 80, 40 56, 84 40 C 96 36, 110 34, 118 34"
          stroke="#a89687"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeDasharray="4 3"
        />
        <path
          className="sketch-path"
          d="M 32 78 C 22 68, 30 54, 42 60 C 48 64, 44 76, 32 78 Z"
          fill="#bbf7d0"
          stroke="#16a34a"
          strokeWidth="1"
        />
        <circle
          className="sketch-bud"
          cx="84"
          cy="40"
          r="3"
          fill="#fbcfe8"
          stroke="#db2777"
          strokeWidth="1"
        />
      </svg>

      {/* ── BOTTOM-RIGHT HANDMADE SKETCH CORNER ── */}
      <svg
        className="absolute bottom-4 right-3 w-28 h-28 sm:w-36 sm:h-36 opacity-35 filter drop-shadow-xs -scale-x-100"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="sketch-path"
          d="M 4 116 C 16 80, 40 56, 84 40 C 96 36, 110 34, 118 34"
          stroke="#a89687"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeDasharray="4 3"
        />
        <path
          className="sketch-path"
          d="M 32 78 C 22 68, 30 54, 42 60 C 48 64, 44 76, 32 78 Z"
          fill="#fef08a"
          stroke="#ca8a04"
          strokeWidth="1"
        />
        <circle
          className="sketch-bud"
          cx="84"
          cy="40"
          r="3"
          fill="#fda4af"
          stroke="#e11d48"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
