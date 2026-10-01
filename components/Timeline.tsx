"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Maximize2, Sparkles, X, Heart, Bookmark } from "lucide-react";
import { birthdayData } from "@/data/birthday";
import { PetalSvg, Wildflower } from "@/components/flowers/FlowerSvg";

export default function Timeline() {
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  const timelineItems = birthdayData.timeline;

  return (
    <section id="timeline" className="relative py-24 px-4 sm:px-6 max-w-4xl mx-auto select-none">
      {/* Background Warm Ambient Glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-gradient-to-bl from-amber-500/15 via-rose-500/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-400/30 bg-amber-950/30 text-amber-200 font-sans text-xs mb-3 shadow-sm"
        >
          <Bookmark className="w-3.5 h-3.5 text-amber-300" />
          <span>Chapters & Milestones</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white font-sans"
        >
          Moments Along the Way
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-3 text-sm sm:text-base text-zinc-300 max-w-lg mx-auto font-sans leading-relaxed"
        >
          Looking back at a few favorite memories, shared laughs, and milestones that shaped this journey to 19.
        </motion.p>
      </div>

      {/* Vertical Memory Pathway */}
      <div className="relative border-l-2 border-amber-500/25 ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-12">
        {timelineItems.map((item, idx) => {
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="relative group"
            >
              {/* Floral Milestone Node Marker */}
              <div className="absolute -left-[33px] sm:-left-[49px] top-1.5 w-7 h-7 rounded-full bg-[#0d1322] border-2 border-amber-400 flex items-center justify-center group-hover:scale-125 group-hover:border-rose-400 transition-all duration-300 shadow-lg shadow-amber-500/25">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="transition-transform group-hover:rotate-45">
                  <circle cx="10" cy="10" r="4" fill="#fbbf24" />
                  <circle cx="10" cy="4" r="2.5" fill="#fda4af" opacity="0.9" />
                  <circle cx="16" cy="10" r="2.5" fill="#fda4af" opacity="0.9" />
                  <circle cx="10" cy="16" r="2.5" fill="#fda4af" opacity="0.9" />
                  <circle cx="4" cy="10" r="2.5" fill="#fda4af" opacity="0.9" />
                </svg>
              </div>

              {/* Memory Card */}
              <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 hover:border-amber-400/40 transition-all duration-300 shadow-xl">
                {/* Step badge & date */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-xl">
                    Memory 0{item.step}
                  </span>
                  <div className="flex items-center gap-1.5 font-sans text-xs text-zinc-400">
                    <Calendar className="w-3.5 h-3.5 text-rose-300" />
                    <span>{item.date}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white group-hover:text-amber-200 transition-colors mb-2 font-sans">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-sm sm:text-base text-zinc-300 font-sans leading-relaxed">
                  {item.description}
                </p>

                {/* Attached Photo */}
                {item.photo && (
                  <div className="mt-5 pt-4 border-t border-white/5">
                    <div
                      onClick={() => setActivePhoto(item.photo || null)}
                      className="relative w-full max-w-sm h-44 sm:h-52 rounded-2xl overflow-hidden cursor-pointer group/photo border border-white/10 shadow-lg"
                    >
                      <Image
                        src={item.photo}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-cover transition-transform duration-700 group-hover/photo:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover/photo:bg-black/10 transition-colors" />
                      <div className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover/photo:opacity-100 transition-opacity">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 text-[11px] font-sans text-zinc-200">
                        Tap to expand photo
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox for timeline photos */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePhoto(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          >
            <button
              onClick={() => setActivePhoto(null)}
              aria-label="Close photo preview"
              className="absolute top-5 right-5 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative max-w-2xl w-full aspect-[4/3] rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-zinc-950">
              <Image
                src={activePhoto}
                alt="Timeline Memory"
                fill
                className="object-contain"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
