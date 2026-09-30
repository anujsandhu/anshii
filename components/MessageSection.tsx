"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquareText, Terminal, Copy, Check, Heart, Sparkles } from "lucide-react";
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
    <section id="message" className="relative py-20 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Glow backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Section Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 font-mono text-xs mb-3"
        >
          <MessageSquareText className="w-3.5 h-3.5 text-cyan-400" />
          <span>MESSAGE // DIRECT_TRANSMISSION</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white"
        >
          {birthdayData.message.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-2 text-xs sm:text-sm font-mono text-zinc-400"
        >
          {birthdayData.message.codeComment}
        </motion.p>
      </div>

      {/* Code Editor Window Card */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="rounded-2xl border border-white/10 bg-[#0b0f19]/90 backdrop-blur-2xl shadow-2xl overflow-hidden"
      >
        {/* Editor Title Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#080c14]/90 select-none">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-mono text-xs text-zinc-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              letter_to_anshika.ts
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Editor Body */}
        <div className="p-6 sm:p-10 font-mono text-xs sm:text-sm leading-relaxed">
          <div className="text-zinc-500 italic mb-6">
            /** <br />
            &nbsp;* Compiled with best wishes for year 19. <br />
            &nbsp;* From: {birthdayData.recipient.creatorName} <br />
            &nbsp;* To: {birthdayData.recipient.name} <br />
            &nbsp;*/
          </div>

          <div className="space-y-5 text-zinc-200">
            {birthdayData.message.content.map((paragraph, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === birthdayData.message.content.length - 1;
              return (
                <motion.p
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + idx * 0.15 }}
                  className={`font-sans text-sm sm:text-base leading-relaxed ${
                    isFirst
                      ? "text-amber-300 font-semibold text-base sm:text-lg"
                      : isLast
                      ? "text-cyan-300 font-semibold"
                      : "text-zinc-300"
                  }`}
                >
                  {paragraph}
                </motion.p>
              );
            })}
          </div>

          {/* Signoff */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.9 }}
            className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500 font-mono"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>status: 200 OK • message delivered</span>
            </div>
            <div className="text-zinc-400 font-medium">
              — {birthdayData.recipient.creatorName}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
