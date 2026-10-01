"use client";

import React from "react";

interface FlowerSvgProps {
  className?: string;
  size?: number | string;
  color?: string;
  accentColor?: string;
  stemColor?: string;
  leafColor?: string;
  animated?: boolean;
}

/**
 * Elegant SVG Tulip with petals, stem, and slender leaves.
 */
export function TulipFlower({
  className = "",
  size = 48,
  color = "#fda4af", // peach / blush
  accentColor = "#f43f5e",
  stemColor = "#4ade80",
  leafColor = "#22c55e",
  animated = false,
}: FlowerSvgProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animated ? "animate-flower-sway" : ""}`}
    >
      <defs>
        <linearGradient id="tulipPetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={accentColor} />
        </linearGradient>
        <linearGradient id="tulipStemGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={leafColor} />
          <stop offset="100%" stopColor={stemColor} />
        </linearGradient>
      </defs>

      {/* Stem */}
      <path
        d="M50 48 Q49 85 50 125"
        stroke="url(#tulipStemGrad)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Slender curved leaves */}
      <path
        d="M50 95 Q32 80 34 60 Q42 75 50 88"
        fill="url(#tulipStemGrad)"
        opacity="0.85"
      />
      <path
        d="M50 82 Q68 70 66 52 Q58 66 50 78"
        fill="url(#tulipStemGrad)"
        opacity="0.85"
      />

      {/* Tulip Blossom Petals */}
      {/* Back center petal */}
      <path
        d="M50 10 C42 18 42 38 50 48 C58 38 58 18 50 10Z"
        fill={color}
        opacity="0.75"
      />
      {/* Left petal */}
      <path
        d="M49 48 C34 46 28 32 35 18 C40 28 47 40 49 48Z"
        fill="url(#tulipPetalGrad)"
      />
      {/* Right petal */}
      <path
        d="M51 48 C66 46 72 32 65 18 C60 28 53 40 51 48Z"
        fill="url(#tulipPetalGrad)"
      />
      {/* Front center petal */}
      <path
        d="M50 49 C40 47 38 28 46 16 C48 24 52 24 54 16 C62 28 60 47 50 49Z"
        fill="url(#tulipPetalGrad)"
      />
    </svg>
  );
}

/**
 * Delicate SVG Daisy with radial white/cream petals and a warm golden pistil.
 */
export function DaisyFlower({
  className = "",
  size = 40,
  color = "#fffbeb", // soft cream
  accentColor = "#fef08a",
  stemColor = "#4ade80",
  animated = false,
}: FlowerSvgProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animated ? "animate-flower-sway-slow" : ""}`}
    >
      <defs>
        <radialGradient id="daisyCenterGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="65%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>
      </defs>

      {/* Stem */}
      <path
        d="M50 50 Q48 78 50 105"
        stroke={stemColor}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* Leaf */}
      <path
        d="M50 80 Q36 75 35 66 Q44 72 50 78"
        fill={stemColor}
        opacity="0.8"
      />

      {/* Daisy Petals (8 radial petals) */}
      <g>
        {/* 0 deg */}
        <ellipse cx="50" cy="24" rx="7" ry="14" fill={color} />
        {/* 45 deg */}
        <ellipse cx="68" cy="32" rx="7" ry="14" fill={color} transform="rotate(45 68 32)" />
        {/* 90 deg */}
        <ellipse cx="76" cy="50" rx="7" ry="14" fill={color} transform="rotate(90 76 50)" />
        {/* 135 deg */}
        <ellipse cx="68" cy="68" rx="7" ry="14" fill={accentColor} opacity="0.9" transform="rotate(135 68 68)" />
        {/* 180 deg */}
        <ellipse cx="50" cy="76" rx="7" ry="14" fill={accentColor} opacity="0.9" />
        {/* 225 deg */}
        <ellipse cx="32" cy="68" rx="7" ry="14" fill={accentColor} opacity="0.9" transform="rotate(225 32 68)" />
        {/* 270 deg */}
        <ellipse cx="24" cy="50" rx="7" ry="14" fill={color} transform="rotate(270 24 50)" />
        {/* 315 deg */}
        <ellipse cx="32" cy="32" rx="7" ry="14" fill={color} transform="rotate(315 32 32)" />
      </g>

      {/* Center Golden Core */}
      <circle cx="50" cy="50" r="12" fill="url(#daisyCenterGrad)" />
      <circle cx="48" cy="48" r="3" fill="#ffffff" opacity="0.5" />
    </svg>
  );
}

/**
 * Whimsical Wildflower with 5 rounded lavender/peach petals.
 */
export function Wildflower({
  className = "",
  size = 36,
  color = "#d8b4fe", // soft lavender
  accentColor = "#c084fc",
  stemColor = "#22c55e",
  animated = false,
}: FlowerSvgProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 95"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animated ? "animate-flower-sway" : ""}`}
    >
      <defs>
        <linearGradient id="wildflowerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={accentColor} />
        </linearGradient>
      </defs>

      {/* Slender Stem */}
      <path
        d="M40 42 Q37 68 40 92"
        stroke={stemColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* 5 Organic Petals */}
      <g>
        <path d="M40 40 C35 22 45 22 40 40Z" fill="url(#wildflowerGrad)" transform="rotate(0 40 40) scale(1.3) translate(-9 -10)" />
        <path d="M40 40 C35 22 45 22 40 40Z" fill="url(#wildflowerGrad)" transform="rotate(72 40 40) scale(1.3) translate(-9 -10)" />
        <path d="M40 40 C35 22 45 22 40 40Z" fill="url(#wildflowerGrad)" transform="rotate(144 40 40) scale(1.3) translate(-9 -10)" />
        <path d="M40 40 C35 22 45 22 40 40Z" fill="url(#wildflowerGrad)" transform="rotate(216 40 40) scale(1.3) translate(-9 -10)" />
        <path d="M40 40 C35 22 45 22 40 40Z" fill="url(#wildflowerGrad)" transform="rotate(288 40 40) scale(1.3) translate(-9 -10)" />
      </g>

      {/* Pistil */}
      <circle cx="40" cy="40" r="5" fill="#fef08a" />
      <circle cx="40" cy="40" r="2.5" fill="#f59e0b" />
    </svg>
  );
}

/**
 * Baby's Breath / Gypsophila branch with delicate micro-blossoms.
 */
export function BabysBreath({
  className = "",
  size = 50,
  branchColor = "#86efac",
  flowerColor = "#ffffff",
}: {
  className?: string;
  size?: number | string;
  branchColor?: string;
  flowerColor?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Branch network */}
      <path
        d="M50 115 Q52 75 48 50 M48 50 Q30 35 20 22 M48 50 Q65 32 75 18 M48 50 Q50 30 52 14 M32 38 Q22 42 14 36 M62 36 Q74 44 84 40"
        stroke={branchColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Tiny soft puffs */}
      <circle cx="20" cy="22" r="4.5" fill={flowerColor} opacity="0.9" />
      <circle cx="75" cy="18" r="4.5" fill={flowerColor} opacity="0.9" />
      <circle cx="52" cy="14" r="4" fill={flowerColor} opacity="0.9" />
      <circle cx="14" cy="36" r="3.5" fill={flowerColor} opacity="0.85" />
      <circle cx="84" cy="40" r="3.5" fill={flowerColor} opacity="0.85" />
      <circle cx="38" cy="28" r="3" fill="#fef3c7" opacity="0.9" />
      <circle cx="64" cy="26" r="3" fill="#fef3c7" opacity="0.9" />
      <circle cx="48" cy="42" r="3" fill={flowerColor} opacity="0.8" />
    </svg>
  );
}

/**
 * Botanical Leaf / Sprig with flowing organic curve.
 */
export function BotanicalSprig({
  className = "",
  size = 40,
  color = "#4ade80",
}: {
  className?: string;
  size?: number | string;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M40 95 C40 70 42 45 50 15"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* Pair 1 */}
      <path d="M41 80 C30 76 26 66 30 62 C36 62 40 70 41 80Z" fill={color} opacity="0.7" />
      <path d="M42 75 C52 70 58 62 54 58 C48 58 43 67 42 75Z" fill={color} opacity="0.7" />
      {/* Pair 2 */}
      <path d="M43 55 C33 51 28 41 33 37 C39 37 43 45 43 55Z" fill={color} opacity="0.7" />
      <path d="M45 50 C55 45 60 36 56 32 C50 32 46 41 45 50Z" fill={color} opacity="0.7" />
      {/* Tip */}
      <path d="M50 15 C46 9 52 5 54 7 C55 10 52 13 50 15Z" fill={color} opacity="0.85" />
    </svg>
  );
}

/**
 * Individual drifting organic petal.
 */
export function PetalSvg({
  className = "",
  size = 24,
  color = "#fda4af",
  accentColor = "#f43f5e",
  rotation = 0,
}: {
  className?: string;
  size?: number | string;
  color?: string;
  accentColor?: string;
  rotation?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <defs>
        <linearGradient id={`petalGrad-${color.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={accentColor} />
        </linearGradient>
      </defs>
      <path
        d="M20 5 C10 14 10 26 20 35 C30 26 30 14 20 5Z"
        fill={`url(#petalGrad-${color.replace('#','')})`}
        opacity="0.88"
      />
    </svg>
  );
}
