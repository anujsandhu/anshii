"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Maximize2, Sparkles, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { birthdayData } from "@/data/birthday";
import { FloralCorner } from "@/components/flowers/FloralFrame";
import { PetalSvg, Wildflower } from "@/components/flowers/FlowerSvg";

interface PhotoGalleryProps {
  onPhotoUnlocked?: () => void;
}

export default function PhotoGallery({ onPhotoUnlocked }: PhotoGalleryProps) {
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
    <section id="moments" className="relative py-24 px-4 sm:px-6 max-w-6xl mx-auto select-none">
      {/* Warm cream/peach ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[700px] h-[380px] sm:h-[700px] bg-gradient-to-tr from-amber-500/15 via-rose-500/15 to-purple-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Section Header: Warm Scrapbook Styling */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-rose-300/30 bg-rose-950/30 text-rose-200 font-sans text-xs mb-3 shadow-sm"
        >
          <Camera className="w-3.5 h-3.5 text-rose-300" />
          <span>A Digital Scrapbook</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white font-sans"
        >
          Some Moments
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-3 text-sm sm:text-base text-zinc-300 max-w-lg mx-auto font-sans leading-relaxed"
        >
          A small collection of snapshots, memories, and moments that made this year special. Tap any photo to expand.
        </motion.p>
      </div>

      {/* Grid: Scrapbook Polaroid & Keepsake Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 items-start">
        {photos.map((item, index) => {
          const isPolaroid = index % 2 === 0;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 35, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{
                scale: 1.04,
                rotate: 0,
                zIndex: 25,
                transition: { duration: 0.25 },
              }}
              style={{
                transform: `rotate(${item.rotation || 0}deg)`,
              }}
              onClick={() => {
                setSelectedPhoto(index);
                if (onPhotoUnlocked) onPhotoUnlocked();
              }}
              className="cursor-pointer transition-shadow duration-300 group relative"
            >
              {/* Botanical Frame Decoration for Scrapbook Aesthetic */}
              {index % 3 === 0 && (
                <FloralCorner
                  className="absolute -top-3 -left-3 pointer-events-none z-20 opacity-80 group-hover:scale-110 transition-transform"
                  size={38}
                  color="#86efac"
                  flowerColor="#fda4af"
                />
              )}
              {index % 3 === 1 && (
                <FloralCorner
                  className="absolute -bottom-3 -right-3 pointer-events-none z-20 rotate-180 opacity-80 group-hover:scale-110 transition-transform"
                  size={38}
                  color="#86efac"
                  flowerColor="#d8b4fe"
                />
              )}
              {index % 3 === 2 && (
                <div className="absolute -top-2.5 -right-2.5 pointer-events-none z-20 group-hover:scale-110 transition-transform">
                  <PetalSvg size={24} color="#fef08a" accentColor="#f59e0b" rotation={45} />
                </div>
              )}

              {isPolaroid ? (
                /* Polaroid Keepsake Card with Decorative Tape */
                <div className="polaroid-card rounded-2xl relative">
                  {/* Subtle Washi Tape Accent */}
                  <div className="scrapbook-tape" />

                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-900 shadow-inner">
                    <Image
                      src={item.src}
                      alt={item.caption}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      priority={index < 2}
                    />
                    <div className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="pt-3.5 pb-1 px-1">
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-500 mb-1">
                      <span className="font-semibold text-amber-700/80">{item.tag || `Memory 0${item.id}`}</span>
                      <span>2026</span>
                    </div>
                    <p className="text-zinc-800 font-sans text-sm font-medium line-clamp-2 leading-snug">
                      {item.caption}
                    </p>
                  </div>
                </div>
              ) : (
                /* Modern Warm Frosted Keepsake Card */
                <div className="glass-panel rounded-3xl p-3.5 border border-white/10 hover:border-amber-400/40 transition-all shadow-xl">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-zinc-900">
                    <Image
                      src={item.src}
                      alt={item.caption}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    <div className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-500/30 text-[11px] font-mono text-amber-200">
                      {item.tag || `Snapshot #${item.id}`}
                    </div>
                  </div>

                  <div className="p-3">
                    <p className="text-zinc-100 font-sans text-sm font-medium leading-snug">
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
            <button
              onClick={() => setSelectedPhoto(null)}
              aria-label="Close photo preview"
              className="absolute top-5 right-5 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <button
              onClick={handlePrevPhoto}
              aria-label="Previous photo"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={handleNextPhoto}
              aria-label="Next photo"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full rounded-3xl overflow-hidden bg-[#101524] border border-white/15 shadow-2xl flex flex-col"
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

              <div className="p-5 sm:p-6 border-t border-white/10 flex items-center justify-between gap-4 bg-[#0a0f1c]">
                <div>
                  <div className="text-xs font-mono text-amber-300 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {photos[selectedPhoto].tag || `Photo ${selectedPhoto + 1} of ${photos.length}`}
                    </span>
                  </div>
                  <p className="text-base text-zinc-100 font-medium font-sans">
                    {photos[selectedPhoto].caption}
                  </p>
                </div>
                <div className="font-mono text-xs text-zinc-400 whitespace-nowrap bg-white/5 px-2.5 py-1 rounded-lg">
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
