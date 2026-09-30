"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Code2,
  Coffee,
  Smile,
  HeartHandshake,
  Compass,
  Award,
} from "lucide-react";
import { birthdayData } from "@/data/birthday";

// Dynamic Lucide icon lookup
const iconMap: Record<string, React.ElementType> = {
  Sparkles,
  Code2,
  Coffee,
  Laugh: Smile,
  Smile,
  HeartHandshake,
  Compass,
};

export default function Qualities() {
  const qualities = birthdayData.qualities;

  return (
    <section id="qualities" className="relative py-20 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-14">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-300 font-mono text-xs mb-3"
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>ATTRIBUTES // CHARACTER_TRAITS</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white"
        >
          Things that make you, you.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-3 text-sm sm:text-base text-zinc-400 max-w-lg mx-auto font-sans"
        >
          A few things that stand out and make spending time or collaborating with you genuinely great.
        </motion.p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {qualities.map((item, idx) => {
          const IconComponent = iconMap[item.icon] || Sparkles;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-amber-500/30 transition-all duration-300 flex flex-col justify-between group shadow-lg"
            >
              <div>
                {/* Header row with icon & tag */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-[11px] text-zinc-500 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                    {item.tag}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-zinc-100 group-hover:text-amber-200 transition-colors mb-2.5">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-zinc-300 leading-relaxed font-sans">
                  {item.description}
                </p>
              </div>

              {/* Bottom detail */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span className="group-hover:text-amber-300/80 transition-colors">
                  trait_score: 10/10
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
