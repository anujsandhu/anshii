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
  Heart,
} from "lucide-react";
import { birthdayData } from "@/data/birthday";

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
    <section id="qualities" className="relative py-24 px-4 sm:px-6 max-w-6xl mx-auto select-none">
      {/* Background Warm Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-amber-500/15 via-rose-500/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-400/30 bg-amber-500/15 text-amber-200 font-sans text-xs mb-3 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Celebrating You</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white font-sans"
        >
          Things That Make You, You
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-3 text-sm sm:text-base text-zinc-300 max-w-lg mx-auto font-sans leading-relaxed"
        >
          A few things that stand out and make spending time, collaborating, and laughing with you genuinely great.
        </motion.p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {qualities.map((item, idx) => {
          const IconComponent = iconMap[item.icon] || Sparkles;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between group shadow-xl"
            >
              <div>
                {/* Header row with icon & tag */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform shadow-md">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="font-sans text-xs text-zinc-400 px-3 py-1 rounded-xl bg-white/5 border border-white/5 font-medium">
                    {item.tag}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white group-hover:text-amber-200 transition-colors mb-2.5 font-sans">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-zinc-300 leading-relaxed font-sans">
                  {item.description}
                </p>
              </div>

              {/* Bottom detail */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-sans text-zinc-400">
                <span className="group-hover:text-amber-300 transition-colors flex items-center gap-1.5 font-medium">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/30" />
                  <span>Uniquely Anshika</span>
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
