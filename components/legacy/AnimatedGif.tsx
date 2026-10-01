"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, Code2, PartyPopper, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface AnimatedGifProps {
  src: string;
  alt: string;
  type?: "celebrate" | "coding" | "reaction" | "party";
  className?: string;
  caption?: string;
}

export default function AnimatedGif({
  src,
  alt,
  type = "celebrate",
  className = "",
  caption,
}: AnimatedGifProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-white/10 bg-[#0d131f]/80 p-3 backdrop-blur-md shadow-xl flex flex-col items-center justify-center ${className}`}
    >
      {!hasError ? (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/40 flex items-center justify-center">
          <Image
            src={src}
            alt={alt}
            fill
            unoptimized
            onError={() => setHasError(true)}
            className="object-contain"
          />
        </div>
      ) : (
        /* Fallback Dynamic Animated Vector Element */
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-slate-950/80 flex flex-col items-center justify-center p-4 border border-white/5">
          {type === "celebrate" && (
            <div className="flex flex-col items-center text-center">
              <motion.div
                animate={{
                  rotate: [-8, 8, -8],
                  scale: [1, 1.15, 1],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-500/20 mb-2"
              >
                <PartyPopper className="w-8 h-8" />
              </motion.div>
              <span className="font-mono text-xs text-amber-300 font-semibold tracking-wide">
                CELEBRATION_MODE = ON
              </span>
            </div>
          )}

          {type === "coding" && (
            <div className="flex flex-col items-center text-center">
              <motion.div
                animate={{
                  y: [-3, 3, -3],
                }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-500/20 mb-2"
              >
                <Code2 className="w-8 h-8" />
              </motion.div>
              <span className="font-mono text-xs text-cyan-300 font-semibold tracking-wide">
                while (coding) &#123; sipCoffee(); &#125;
              </span>
            </div>
          )}

          {type === "reaction" && (
            <div className="flex flex-col items-center text-center">
              <motion.div
                animate={{
                  scale: [0.95, 1.1, 0.95],
                }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 shadow-lg shadow-rose-500/20 mb-2"
              >
                <Sparkles className="w-8 h-8" />
              </motion.div>
              <span className="font-mono text-xs text-rose-300 font-semibold tracking-wide">
                19th Birthday Joy ✨
              </span>
            </div>
          )}
        </div>
      )}

      {caption && (
        <span className="mt-2 text-[11px] font-mono text-zinc-400 text-center">
          {caption}
        </span>
      )}
    </div>
  );
}
