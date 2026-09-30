"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface ScrollInterstitialProps {
  mainText: string;
  followUpText: string;
}

export default function ScrollInterstitial({
  mainText,
  followUpText,
}: ScrollInterstitialProps) {
  const [showFollowUp, setShowFollowUp] = useState(false);

  return (
    <div className="py-6 px-4 max-w-md mx-auto text-center select-none">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        onViewportEnter={() => {
          setTimeout(() => setShowFollowUp(true), 800);
        }}
        className="inline-flex flex-col items-center px-6 py-3 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-lg"
      >
        <div className="flex items-center gap-2 font-sans text-xs text-zinc-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>&ldquo;{mainText}&rdquo;</span>
        </div>

        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={showFollowUp ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden mt-1"
        >
          <span className="font-sans text-xs text-amber-300 font-semibold">
            &ldquo;{followUpText}&rdquo;
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
