"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { TulipFlower, DaisyFlower, Wildflower, PetalSvg } from "./FlowerSvg";

interface FlowerBurstProps {
  show: boolean;
  onDone?: () => void;
  message?: string;
  subMessage?: string;
}

export default function FlowerBurst({
  show,
  onDone,
  message = "✨ Flower Bloom Unlocked!",
  subMessage = "Another birthday moment blossomed",
}: FlowerBurstProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        if (onDone) onDone();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onDone]);

  if (!show) return null;

  // 6 radial floral burst items
  const burstItems = [
    { type: "tulip", x: -90, y: -70, rotate: -25, delay: 0.05, size: 44 },
    { type: "daisy", x: 90, y: -75, rotate: 20, delay: 0.1, size: 40 },
    { type: "wildflower", x: -110, y: 30, rotate: -40, delay: 0.15, size: 36 },
    { type: "tulip", x: 105, y: 35, rotate: 35, delay: 0.2, size: 42 },
    { type: "daisy", x: 0, y: -110, rotate: 5, delay: 0.12, size: 46 },
    { type: "petal", x: -45, y: 70, rotate: 18, delay: 0.22, size: 28 },
    { type: "petal", x: 45, y: 70, rotate: -18, delay: 0.25, size: 28 },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
        {/* Soft radial glow */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1.5, opacity: 0.8 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-pink-500/20 via-amber-400/20 to-purple-500/20 blur-3xl pointer-events-none"
        />

        {/* Bursting Flowers & Petals */}
        <div className="relative w-1 h-1">
          {burstItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ x: 0, y: 0, scale: 0, opacity: 0, rotate: 0 }}
              animate={{
                x: item.x,
                y: item.y,
                scale: [0, 1.2, 1],
                opacity: [0, 1, 1, 0.85],
                rotate: item.rotate,
              }}
              exit={{ y: item.y + 40, opacity: 0, scale: 0.5 }}
              transition={{
                duration: 1.2,
                delay: item.delay,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              {item.type === "tulip" && (
                <TulipFlower size={item.size} color="#fda4af" accentColor="#f43f5e" />
              )}
              {item.type === "daisy" && (
                <DaisyFlower size={item.size} color="#fffbeb" accentColor="#fef08a" />
              )}
              {item.type === "wildflower" && (
                <Wildflower size={item.size} color="#d8b4fe" accentColor="#c084fc" />
              )}
              {item.type === "petal" && (
                <PetalSvg size={item.size} color="#fda4af" accentColor="#f43f5e" rotation={item.rotate} />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatePresence>
  );
}
