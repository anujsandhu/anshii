"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Sparkles, Heart } from "lucide-react";
import { birthdayData } from "@/data/birthday";

export default function MessageSection() {
  const [copied, setCopied] = useState(false);

  const fullMessage = birthdayData.message.content.join("\n\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(fullMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="message" className="relative py-20 px-4 sm:px-6 max-w-4xl mx-auto select-none">
      {/* Soft lavender/blue ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[600px] h-[340px] sm:h-[600px] bg-gradient-to-tr from-purple-600/15 via-indigo-600/15 to-sky-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Section Header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-400/25 bg-purple-950/30 text-purple-200 font-sans text-xs mb-3 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-300" />
          <span>A Note For Your 19th</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white font-sans"
        >
          {birthdayData.message.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-2.5 text-sm sm:text-base text-zinc-300 max-w-md mx-auto font-sans"
        >
          Just a few honest thoughts on your 19th birthday.
        </motion.p>
      </div>

      {/* Elegant Frosted Stationery Letter Card */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="glass-letter rounded-3xl p-7 sm:p-12 relative overflow-hidden shadow-2xl"
      >
        {/* Subtle decorative gold corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-400/10 via-purple-500/5 to-transparent pointer-events-none rounded-tr-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/10 via-sky-500/5 to-transparent pointer-events-none rounded-bl-3xl" />

        {/* Top Card Bar: Stationery details & copy */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-purple-300/15">
          <div className="flex items-center gap-2 text-xs font-mono text-purple-300/80">
            <span>TO: ANSHIKA</span>
            <span className="text-zinc-500">•</span>
            <span>OCT 28, 2026</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans text-purple-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-purple-300" />
                <span>Save message</span>
              </>
            )}
          </button>
        </div>

        {/* Letter Body: Warm, readable, elegant typography */}
        <div className="space-y-6 text-zinc-100 font-sans text-base sm:text-lg leading-relaxed">
          {birthdayData.message.content.map((paragraph, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === birthdayData.message.content.length - 1;

            return (
              <motion.p
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 + idx * 0.12 }}
                className={
                  isFirst
                    ? "text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-200 via-rose-200 to-purple-200 bg-clip-text text-transparent pb-1"
                    : isLast
                    ? "text-purple-200 font-semibold text-lg sm:text-xl pt-2"
                    : "text-zinc-200 font-normal leading-relaxed"
                }
              >
                {paragraph}
              </motion.p>
            );
          })}
        </div>

        {/* Elegant Letter Signoff */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
          className="mt-10 pt-6 border-t border-purple-300/15 flex items-center justify-between text-sm text-zinc-400 font-sans"
        >
          <div className="flex items-center gap-2 text-xs font-mono text-purple-300/70">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Delivered with genuine warm wishes</span>
          </div>

          <div className="text-right">
            <span className="text-xs text-zinc-500 font-mono block">From</span>
            <span className="text-base sm:text-lg font-bold text-zinc-200 font-serif tracking-wide">
              {birthdayData.recipient.creatorName}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
