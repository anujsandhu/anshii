"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Maximize2, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { birthdayData } from "@/data/birthday";

export default function PhotoGallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

  const photos = birthdayData.photos;

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhoto !== null) {
      setSelectedPhoto((selectedPhoto + 1) % photos.length);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhoto !== null) {
      setSelectedPhoto((selectedPhoto - 1 + photos.length) % photos.length);
    }
  };

  return (
    <section id="moments" className="relative py-20 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-14">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-300 font-mono text-xs mb-3"
        >
          <Camera className="w-3.5 h-3.5 text-amber-400" />
          <span>GALLERY // SNAPSHOTS</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white"
        >
          Some Moments
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-3 text-sm sm:text-base text-zinc-400 max-w-lg mx-auto font-sans"
        >
          A small visual collection of good days, laughs, and memories.
        </motion.p>
      </div>

      {/* Grid / Layout: Responsive cards with tilt effects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {photos.map((item, index) => {
          const isPolaroid = index % 2 === 0;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{
                scale: 1.03,
                rotate: 0,
                zIndex: 20,
              }}
              style={{
                transform: `rotate(${item.rotation || 0}deg)`,
              }}
              onClick={() => setSelectedPhoto(index)}
              className="cursor-pointer transition-shadow duration-300 group"
            >
              {isPolaroid ? (
                /* Polaroid Style Card */
                <div className="polaroid-card rounded-xl">
                  {/* Image frame */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-zinc-900">
                    <Image
                      src={item.src}
                      alt={item.caption}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      priority={index < 2}
                    />
                    {/* Hover expand badge */}
                    <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Polaroid handwritten caption text */}
                  <div className="pt-3 pb-1 px-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mb-1">
                      <span>{item.tag || `0${item.id}`}</span>
                      <span>2026</span>
                    </div>
                    <p className="text-zinc-800 font-sans text-xs sm:text-sm font-medium line-clamp-2">
                      {item.caption}
                    </p>
                  </div>
                </div>
              ) : (
                /* Modern Glass Card */
                <div className="glass-panel rounded-2xl p-3 border border-white/10 overflow-hidden group-hover:border-cyan-500/40 transition-colors">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-900">
                    <Image
                      src={item.src}
                      alt={item.caption}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
                      {item.tag || `Snapshot #${item.id}`}
                    </div>
                  </div>

                  <div className="p-3">
                    <p className="text-zinc-200 font-sans text-xs sm:text-sm font-medium">
                      {item.caption}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              aria-label="Close photo preview"
              className="absolute top-5 right-5 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Prev button */}
            <button
              onClick={handlePrevPhoto}
              aria-label="Previous photo"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next button */}
            <button
              onClick={handleNextPhoto}
              aria-label="Next photo"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full rounded-2xl overflow-hidden bg-[#0d131f] border border-white/10 shadow-2xl flex flex-col"
            >
              <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full bg-zinc-950">
                <Image
                  src={photos[selectedPhoto].src}
                  alt={photos[selectedPhoto].caption}
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {/* Caption Bar */}
              <div className="p-4 sm:p-5 border-t border-white/10 flex items-center justify-between gap-4 bg-[#090d16]">
                <div>
                  <div className="text-xs font-mono text-cyan-400 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {photos[selectedPhoto].tag || `Photo ${selectedPhoto + 1} of ${photos.length}`}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-zinc-100 font-medium">
                    {photos[selectedPhoto].caption}
                  </p>
                </div>
                <div className="font-mono text-xs text-zinc-500 whitespace-nowrap">
                  {selectedPhoto + 1} / {photos.length}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
