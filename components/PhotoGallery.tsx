"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Maximize2, Sparkles, ChevronLeft, ChevronRight, Layers, Lock, Unlock } from "lucide-react";
import { birthdayData } from "@/data/birthday";

interface PhotoGalleryProps {
  onPhotoUnlocked?: () => void;
}

export default function PhotoGallery({ onPhotoUnlocked }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [loadProgress, setLoadProgress] = useState(10);
  const [memoriesLoaded, setMemoriesLoaded] = useState(false);
  const [unlockedCards, setUnlockedCards] = useState<Record<number, boolean>>({
    1: true, // First photo open by default
  });

  const photos = birthdayData.photos;

  // Progressive loading simulation: 10% -> 35% -> 68% -> 100%
  useEffect(() => {
    const steps = [
      { p: 35, delay: 350 },
      { p: 68, delay: 750 },
      { p: 100, delay: 1100 },
    ];

    const timeouts = steps.map((step) =>
      setTimeout(() => {
        setLoadProgress(step.p);
        if (step.p === 100) {
          setTimeout(() => setMemoriesLoaded(true), 200);
        }
      }, step.delay)
    );

    return () => timeouts.forEach(clearTimeout);
  }, []);

  const handleUnlockCard = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setUnlockedCards((prev) => ({ ...prev, [id]: true }));
    if (onPhotoUnlocked) onPhotoUnlocked();
  };

  const handleUnlockAll = () => {
    const all: Record<number, boolean> = {};
    photos.forEach((p) => {
      all[p.id] = true;
    });
    setUnlockedCards(all);
    if (onPhotoUnlocked) onPhotoUnlocked();
  };

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
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-300 font-mono text-xs mb-3"
        >
          <Camera className="w-3.5 h-3.5 text-amber-400" />
          <span>GALLERY // INTERACTIVE_WALL</span>
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
          There&apos;s something behind each card. Tap to unlock snapshots and memories.
        </motion.p>

        {/* Action button to unlock all */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleUnlockAll}
            className="px-3.5 py-1.5 rounded-lg border border-amber-500/30 bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>[ Unlock All Photos ]</span>
          </button>
        </div>

        {/* Progressive Memory Loading Bar (10% -> 35% -> 68% -> 100%) */}
        <div className="mt-6 max-w-xs mx-auto">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-amber-400" />
              {memoriesLoaded ? "Memory stack compiled" : "Loading memories..."}
            </span>
            <span className="text-amber-400 font-bold">{loadProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-cyan-400 rounded-full"
              animate={{ width: `${loadProgress}%` }}
              transition={{ ease: "easeOut", duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Grid: Interactive Photo Discover Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {photos.map((item, index) => {
          const isPolaroid = index % 2 === 0;
          const isUnlocked = !!unlockedCards[item.id];

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
                scale: 1.03,
                rotate: 0,
                zIndex: 20,
              }}
              style={{
                transform: `rotate(${item.rotation || 0}deg)`,
              }}
              onClick={() => {
                if (isUnlocked) {
                  setSelectedPhoto(index);
                } else {
                  setUnlockedCards((prev) => ({ ...prev, [item.id]: true }));
                  if (onPhotoUnlocked) onPhotoUnlocked();
                }
              }}
              className="cursor-pointer transition-shadow duration-300 group"
            >
              {!isUnlocked ? (
                /* Hidden/Mystery Card State */
                <div className="glass-panel p-6 rounded-2xl border border-dashed border-amber-500/40 text-center flex flex-col items-center justify-center min-h-[260px] space-y-3 hover:border-amber-400 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="font-mono text-xs text-amber-300 font-semibold">
                    Memory #{item.id} Locked
                  </div>
                  <p className="text-xs text-zinc-400 font-sans px-2">
                    &ldquo;There&apos;s something behind this card...&rdquo;
                  </p>
                  <button
                    onClick={(e) => handleUnlockCard(e, item.id)}
                    className="px-4 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-mono font-medium transition-all"
                  >
                    [ Click to Reveal ]
                  </button>
                </div>
              ) : isPolaroid ? (
                /* Unlocked Polaroid Style Card */
                <div className="polaroid-card rounded-xl">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-zinc-900">
                    <Image
                      src={item.src}
                      alt={item.caption}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      priority={index < 2}
                    />
                    <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>
                  </div>

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
                /* Unlocked Modern Glass Card */
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
                    <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
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
