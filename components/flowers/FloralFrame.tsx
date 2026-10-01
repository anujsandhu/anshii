"use client";

import React from "react";

interface FloralCornerProps {
  className?: string;
  size?: number;
  color?: string;
  flowerColor?: string;
}

/**
 * Elegant SVG Botanical Corner Ornament with leaf vines and a miniature blossom.
 */
export function FloralCorner({
  className = "",
  size = 48,
  color = "#86efac",
  flowerColor = "#fda4af",
}: FloralCornerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Corner curving vine */}
      <path
        d="M6 54 C6 28 28 6 54 6"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* Subsidiary branch */}
      <path
        d="M20 40 C18 24 24 18 40 20"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Little leaves */}
      <path d="M12 44 C8 38 12 34 16 38 C16 42 14 44 12 44Z" fill={color} opacity="0.75" />
      <path d="M44 12 C38 8 34 12 38 16 C42 16 44 14 44 12Z" fill={color} opacity="0.75" />
      <path d="M26 26 C22 20 28 18 30 22 C30 25 28 27 26 26Z" fill={color} opacity="0.7" />

      {/* Mini corner blossom */}
      <circle cx="20" cy="20" r="4.5" fill={flowerColor} />
      <circle cx="20" cy="20" r="1.8" fill="#fef08a" />
    </svg>
  );
}

/**
 * Decorative Floral Photo Frame Wrapper that frames any image card
 * with delicate botanical motifs and optional soft tape.
 */
export function FloralPhotoFrame({
  children,
  variant = "corners",
  hasBlossomAccent = true,
  className = "",
}: {
  children: React.ReactNode;
  variant?: "corners" | "wreath" | "minimal";
  hasBlossomAccent?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {/* Top Left Botanical Flourish */}
      <FloralCorner
        className="absolute -top-3 -left-3 pointer-events-none z-10 transition-transform duration-300 group-hover:scale-110"
        size={42}
        color="#86efac"
        flowerColor="#fda4af"
      />

      {/* Bottom Right Botanical Flourish */}
      <FloralCorner
        className="absolute -bottom-3 -right-3 pointer-events-none z-10 rotate-180 transition-transform duration-300 group-hover:scale-110"
        size={42}
        color="#86efac"
        flowerColor="#d8b4fe"
      />

      {/* Optional Tiny Blossom on Top Right */}
      {hasBlossomAccent && (
        <div className="absolute -top-2 -right-2 pointer-events-none z-10 animate-gentle-float">
          <svg width="24" height="24" viewBox="0 0 30 30" fill="none">
            <circle cx="15" cy="15" r="7" fill="#fda4af" opacity="0.9" />
            <circle cx="15" cy="15" r="3" fill="#fef08a" />
          </svg>
        </div>
      )}

      {/* Wrapped Content */}
      {children}
    </div>
  );
}
