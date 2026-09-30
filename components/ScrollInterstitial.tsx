"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Terminal, ArrowDown } from "lucide-react";

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
    <div className="py-8 px-4 max-w-lg mx-auto text-center select-none">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        onViewportEnter={() => {
          setTimeout(() => setShowFollowUp(true), 900);
        }}
        className="inline-flex flex-col items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>&ldquo;{mainText}&rdquo;</span>
        </div>

        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={showFollowUp ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden mt-1.5"
        >
          <span className="font-mono text-xs text-amber-300/90 font-medium">
            &ldquo;{followUpText}&rdquo;
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
