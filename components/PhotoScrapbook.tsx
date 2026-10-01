"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Maximize2, Sparkles, CheckCircle2, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import confetti from "canvas-confetti";
import { FloralCorner } from "@/components/flowers/FloralFrame";
import { PetalSvg, Wildflower } from "@/components/flowers/FlowerSvg";

interface PhotoScrapbookProps {
  isLocked: boolean;
  onUnlockFlowers: () => void;
  flowersUnlocked: boolean;
}

const SCRAPBOOK_PHOTOS = [
  {
    id: 1,
    src: "/photos/photo1.jpg",
    caption: "This one deserves its own page.",
    subCaption: "Campus morning walk • 2026",
    tapeColor: "washi-tape-pink",
    rotation: -2.5,
    hasHeartSticker: true,
    stickerId: 1,
  },
  {
    id: 2,
    src: "/photos/photo2.jpg",
    caption: "Okay this photo is actually unfair.",
    subCaption: "Cozy coffee & quiet moments",
    tapeColor: "washi-tape-blue",
    rotation: 2.8,
    hasHeartSticker: false,
    stickerId: 0,
  },
  {
    id: 3,
    src: "/photos/photo3.jpg",
    caption: "Certified Anshika moment.",
    subCaption: "Laughing at broken code at 2 AM",
    tapeColor: "washi-tape-yellow",
    rotation: -1.8,
    hasHeartSticker: true,
    stickerId: 2,
  },
  {
    id: 4,
    src: "/photos/photo4.jpg",
    caption: "A genuine smile worth capturing.",
    subCaption: "The semester had no right being this chaotic",
    tapeColor: "washi-tape-pink",
    rotation: 2.2,
    hasHeartSticker: false,
    stickerId: 0,
  },
  {
    id: 5,
    src: "/photos/photo5.jpg",
    caption: "The quiet little moments between all the chaos.",
    subCaption: "Golden sparkler evening",
    tapeColor: "washi-tape-blue",
    rotation: -2,
    hasHeartSticker: true,
    stickerId: 3,
  },
];

export default function PhotoScrapbook({
  isLocked,
  onUnlockFlowers,
  flowersUnlocked,
}: PhotoScrapbookProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [foundHearts, setFoundHearts] = useState<number[]>([]);
  const [taskDone, setTaskDone] = useState(flowersUnlocked);

  const handleHeartClick = (e: React.MouseEvent, stickerId: number) => {
    e.stopPropagation();
    if (foundHearts.includes(stickerId)) return;
    const next = [...foundHearts, stickerId];
    setFoundHearts(next);

    try {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.6 },
        colors: ["#fda4af", "#f43f5e", "#fbcfe8"],
      });
    } catch {}

    if (next.length === 3 && !taskDone) {
      setTaskDone(true);
      onUnlockFlowers();
      try {
        confetti({
          particleCount: 50,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#fda4af", "#fbcfe8", "#d8b4fe", "#bae6fd"],
        });
      } catch {}
    }
  };

  if (isLocked) {
    return (
      <section id="pictures" className="py-16 px-4 max-w-4xl mx-auto text-center select-none">
        <div className="p-8 rounded-3xl bg-[#f5ede4] border border-[#e3d3c4] max-w-md mx-auto space-y-2">
          <div className="w-10 h-10 rounded-full bg-[#ebdcd0] flex items-center justify-center mx-auto text-[#786457]">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-handwriting text-2xl font-bold text-[#4a3528]">
            Pictures Section Locked
          </h3>
          <p className="text-xs text-[#786457] font-sans">
            Please mark your attendance in the card above to open this page! ✍️
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="pictures" className="relative py-20 px-4 sm:px-6 max-w-5xl mx-auto select-none">
      {/* Warm Ambient Backdrop */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[650px] h-[340px] sm:h-[650px] bg-gradient-to-tr from-[#fbcfe8]/20 via-[#fed7aa]/20 to-[#bae6fd]/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Section Header: Scrapbook Style */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fff0f3] border border-[#fbcfe8] text-[#be185d] font-sans text-xs mb-3 shadow-2xs">
          <span>📸</span>
          <span>A Little Digital Scrapbook</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold font-handwriting text-[#3f2e24]">
          Some Favorite Moments
        </h2>

        <p className="mt-2 text-sm sm:text-base text-[#6b5546] max-w-lg mx-auto font-sans leading-relaxed">
          Snapshots and memories from the year. Tap any photo to expand.
        </p>

        {/* Task 02 Prompt Bar */}
        <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#fffaf5] border border-[#eadecf] text-xs font-sans text-[#786457] shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
          <span>Task 02: Tap the <strong>3 hidden heart stickers</strong> on the photos!</span>
          <span className="font-bold text-[#be185d]">({foundHearts.length}/3 found)</span>
        </div>
      </div>

      {/* Scrapbook Polaroid Photo Wall Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 items-start">
        {SCRAPBOOK_PHOTOS.map((item, index) => {
          const isHeartFound = item.hasHeartSticker && foundHearts.includes(item.stickerId);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{
                scale: 1.03,
                rotate: 0,
                zIndex: 20,
                transition: { duration: 0.25 },
              }}
              style={{
                transform: `rotate(${item.rotation}deg)`,
              }}
              onClick={() => setSelectedPhoto(index)}
              className="cursor-pointer group relative"
            >
              {/* Polaroid Frame Card */}
              <div className="polaroid-card rounded-2xl relative">
                {/* Washi Tape Accent */}
                <div className={item.tapeColor} />

                {/* Botanical Corner Flourish */}
                {index % 2 === 0 && (
                  <FloralCorner
                    className="absolute -top-3 -left-3 pointer-events-none z-20 opacity-75"
                    size={36}
                    color="#86efac"
                    flowerColor="#fda4af"
                  />
                )}

                {/* Photo Image Aspect */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#eee7de] shadow-inner">
                  <Image
                    src={item.src}
                    alt={item.caption}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority={index < 2}
                  />

                  {/* Expand icon on hover */}
                  <div className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/70 backdrop-blur-xs text-[#3f2e24] opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>

                  {/* Hidden Heart Sticker for Task 02 */}
                  {item.hasHeartSticker && (
                    <motion.button
                      onClick={(e) => handleHeartClick(e, item.stickerId)}
                      whileHover={{ scale: 1.25 }}
                      whileTap={{ scale: 0.85 }}
                      className={`absolute bottom-2.5 right-2.5 p-1.5 rounded-full transition-all cursor-pointer z-20 ${
                        isHeartFound
                          ? "bg-[#fda4af] text-[#be185d] scale-110 shadow-sm"
                          : "bg-white/80 hover:bg-white text-[#fda4af] shadow-xs hover:scale-115"
                      }`}
                      title="Tap to collect secret heart!"
                      aria-label="Secret heart sticker"
                    >
                      <Heart className={`w-4 h-4 ${isHeartFound ? "fill-[#be185d]" : "fill-[#fda4af]"}`} />
                    </motion.button>
                  )}
                </div>

                {/* Handwritten Photo Caption */}
                <div className="pt-3 px-1 text-center">
                  <p className="font-handwriting text-2xl text-[#3f2e24] leading-snug font-bold">
                    &ldquo;{item.caption}&rdquo;
                  </p>
                  <span className="text-[11px] text-[#8c7465] font-sans block mt-0.5">
                    {item.subCaption}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Task 02 Completion Feedback */}
      <div className="mt-12 text-center max-w-md mx-auto">
        {taskDone ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-4 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] flex flex-col items-center gap-1 text-[#065f46]"
          >
            <div className="flex items-center gap-1.5 font-sans font-semibold text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
              <span>TASK 02 COMPLETE ✓</span>
            </div>
            <p className="text-xs font-sans text-[#047857]">
              &ldquo;No cheating, madam. All 3 hearts found! 💖&rdquo;
            </p>
            <span className="text-[11px] text-[#059669] font-sans mt-0.5 font-medium">
              Flower Garden Unlocked Below ↓
            </span>
          </motion.div>
        ) : (
          <p className="text-xs text-[#8c7465] font-sans">
            (Collect all 3 hearts to unlock the next chapter!)
          </p>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 bg-[#3f2e24]/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 select-none"
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              aria-label="Close preview"
              className="absolute top-5 right-5 z-50 p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="paper-card rounded-3xl p-4 sm:p-6 max-w-2xl w-full text-center relative shadow-2xl"
            >
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-[#eee7de]">
                <Image
                  src={SCRAPBOOK_PHOTOS[selectedPhoto].src}
                  alt={SCRAPBOOK_PHOTOS[selectedPhoto].caption}
                  fill
                  className="object-contain"
                />
              </div>

              <div className="mt-4">
                <p className="font-handwriting text-3xl text-[#3f2e24] font-bold">
                  &ldquo;{SCRAPBOOK_PHOTOS[selectedPhoto].caption}&rdquo;
                </p>
                <p className="text-xs text-[#8c7465] font-sans mt-1">
                  {SCRAPBOOK_PHOTOS[selectedPhoto].subCaption}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
