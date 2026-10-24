"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PageTurnShimmerProps {
  currentFrame: number;
}

export default function PageTurnShimmer({ currentFrame }: PageTurnShimmerProps) {
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey((prev) => prev + 1);
  }, [currentFrame]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden select-none"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: "120%", opacity: [0, 0.6, 0.4, 0] }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.85,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="absolute inset-y-0 w-2/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent blur-md"
        />
      </AnimatePresence>
    </div>
  );
}
