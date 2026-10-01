"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  CheckCircle2,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";


interface Frame3PhotosProps {
  isCompleted: boolean;
  onCompleteTask: () => void;
  onNext: () => void;
}

// ── Photo data ─────────────────────────────────────────────────────────────
const SCRAPBOOK_PREVIEWS = [
  {
    id: 1,
    imageId: "coffee-date-syntax",
    src: "/photos/photo1.jpg",
    caption: "This one deserved its own page.",
    sub: "You on a good day — which is most days tbh",
    rotation: -2.5,
    tape: "washi-tape-pink",
    hasHeart: true,
  },
  {
    id: 2,
    imageId: "anshika-moment",
    src: "/photos/photo2.jpg",
    caption: "Okay this photo is just unfair.",
    sub: "No notes. Genuinely no notes.",
    rotation: 2.2,
    tape: "washi-tape-blue",
    hasHeart: false,
  },
  {
    id: 3,
    imageId: "golden-hour-moment",
    src: "/photos/photo3.jpg",
    caption: "A certified Anshika moment.",
    sub: "The kind of day I'd remember for no reason",
    rotation: -1.8,
    tape: "washi-tape-yellow",
    hasHeart: false,
  },
];



// ─────────────────────────────────────────────────────────────────────────────

export default function Frame3Photos({
  isCompleted,
  onCompleteTask,
  onNext,
}: Frame3PhotosProps) {
  const [taskDone, setTaskDone] = useState(isCompleted);
  const [zoomPhoto, setZoomPhoto] = useState<(typeof SCRAPBOOK_PREVIEWS)[0] | null>(null);
  const [activeMobileIdx, setActiveMobileIdx] = useState(0);
  const activeMobileItem = SCRAPBOOK_PREVIEWS[activeMobileIdx];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setTaskDone(isCompleted);
  }, [isCompleted]);

  useEffect(() => {
    if (!zoomPhoto) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomPhoto(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomPhoto]);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (taskDone) return;
    setTaskDone(true);
    onCompleteTask();
    try {
      confetti({
        particleCount: 50,
        spread: 75,
        origin: { y: 0.6 },
        colors: ["#fda4af", "#f43f5e", "#fbcfe8", "#d8b4fe"],
      });
    } catch {}
  };


  return (
    <div className="relative w-full h-full flex flex-col items-center px-3 sm:px-6 select-none overflow-y-auto overflow-x-hidden no-scrollbar pt-[max(58px,calc(var(--sat)+50px))] pb-[max(72px,calc(var(--sab)+64px))]">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[650px] h-[340px] sm:h-[650px] bg-gradient-to-tr from-[#fbcfe8]/20 via-[#fed7aa]/20 to-[#bae6fd]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-4xl flex flex-col items-center my-auto">
        {/* Header */}
        <div className="text-center mb-1.5 sm:mb-2 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#fff0f3] border border-[#fbcfe8] text-[#be185d] font-sans text-xs mb-1 shadow-2xs">
            <span>📸</span>
            <span>Digital Scrapbook</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-bold font-handwriting text-[#3f2e24]">
            Some Favorite Moments
          </h2>
          <p className="text-[11px] text-[#786457] font-sans">
            Tap any polaroid to view full size. Collect the secret heart sticker!
          </p>
        </div>

        {/* ── MOBILE VIEW (< sm): Sleek, focused single Polaroid carousel ── */}
        <div className="block sm:hidden w-full max-w-sm z-10 my-1">
          {/* Photo Switcher Pills */}
          <div className="flex items-center justify-center gap-1.5 mb-2">
            {SCRAPBOOK_PREVIEWS.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setActiveMobileIdx(idx)}
                className={`px-3 py-1 rounded-full text-[11px] font-sans font-semibold transition-all cursor-pointer shadow-2xs ${
                  activeMobileIdx === idx
                    ? "bg-[#3f2e24] text-white scale-105 shadow-xs"
                    : "bg-white/85 border border-[#ebdcd0] text-[#786457] hover:bg-white"
                }`}
              >
                <span>Photo {idx + 1}</span>
                {item.hasHeart && !taskDone && (
                  <span className="ml-1 text-[10px]">💖</span>
                )}
              </button>
            ))}
          </div>

          {/* Focused Polaroid Card with Navigation Arrows */}
          <div className="w-full flex items-center justify-center gap-1.5">
            {/* Prev Arrow */}
            <button
              onClick={() =>
                setActiveMobileIdx((prev) =>
                  prev > 0 ? prev - 1 : SCRAPBOOK_PREVIEWS.length - 1
                )
              }
              aria-label="Previous photo"
              className="p-2 rounded-full bg-white/85 backdrop-blur-xs border border-[#ebdcd0] text-[#786457] hover:text-[#3f2e24] shadow-xs cursor-pointer shrink-0 transition-transform active:scale-90"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Active Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMobileItem.id}
                initial={{ opacity: 0, scale: 0.94, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: -8 }}
                transition={{ duration: 0.2 }}
                onClick={() => setZoomPhoto(activeMobileItem)}
                className="w-full max-w-[280px] cursor-pointer group relative"
              >
                <div
                  className="polaroid-card rounded-2xl relative shadow-lg"
                  style={{
                    padding: "10px 10px 22px 10px",
                    transform: `rotate(${activeMobileItem.rotation * 0.6}deg)`,
                  }}
                >
                  <div className={activeMobileItem.tape} />

                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#eee7de] shadow-inner mt-2">
                    <Image
                      src={activeMobileItem.src}
                      alt={activeMobileItem.caption}
                      fill
                      priority
                      sizes="280px"
                      className="object-cover"
                    />

                    <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-white/70 backdrop-blur-xs text-[#3f2e24]">
                      <Maximize2 className="w-3 h-3" />
                    </div>


                    {/* Secret Heart Sticker */}
                    {activeMobileItem.hasHeart && (
                      <motion.button
                        onClick={handleHeartClick}
                        whileHover={{ scale: 1.25 }}
                        whileTap={{ scale: 0.85 }}
                        className={`absolute bottom-2 right-2 p-2 rounded-full transition-all cursor-pointer z-20 min-w-[42px] min-h-[42px] flex items-center justify-center ${
                          taskDone
                            ? "bg-[#fda4af] text-[#be185d] scale-110 shadow-sm"
                            : "bg-white/90 hover:bg-white text-[#fda4af] shadow-md animate-bounce ring-2 ring-[#fda4af]"
                        }`}
                        title="Tap the secret heart sticker!"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            taskDone
                              ? "fill-[#be185d]"
                              : "fill-[#fda4af]"
                          }`}
                        />
                      </motion.button>
                    )}
                  </div>

                  <div className="pt-2.5 text-center">
                    <p className="font-handwriting text-xl text-[#3f2e24] font-bold leading-tight">
                      &ldquo;{activeMobileItem.caption}&rdquo;
                    </p>
                    <span className="text-[11px] text-[#8c7465] font-sans block mt-0.5">
                      {activeMobileItem.sub}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Next Arrow */}
            <button
              onClick={() =>
                setActiveMobileIdx((prev) =>
                  prev < SCRAPBOOK_PREVIEWS.length - 1 ? prev + 1 : 0
                )
              }
              aria-label="Next photo"
              className="p-2 rounded-full bg-white/85 backdrop-blur-xs border border-[#ebdcd0] text-[#786457] hover:text-[#3f2e24] shadow-xs cursor-pointer shrink-0 transition-transform active:scale-90"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Dot Indicators */}
          <div className="flex items-center justify-center gap-1.5 mt-2">
            {SCRAPBOOK_PREVIEWS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveMobileIdx(idx)}
                className={`transition-all rounded-full cursor-pointer ${
                  activeMobileIdx === idx
                    ? "w-4 h-1.5 bg-[#be185d]"
                    : "w-1.5 h-1.5 bg-[#d1c5b8] hover:bg-[#a89687]"
                }`}
                title={`Go to photo ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* ── DESKTOP VIEW (sm:flex): Classic 3 tilted Polaroids side-by-side ── */}
        <div
          className="hidden sm:flex flex-nowrap items-center justify-center gap-5 max-w-4xl w-full z-10 my-1 overflow-x-auto py-2 px-4"
          style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
          {SCRAPBOOK_PREVIEWS.map((item, index) => (
            <motion.div
              key={item.id}
              onClick={() => setZoomPhoto(item)}
              whileHover={{ scale: 1.04, rotate: 0, zIndex: 20 }}
              style={{
                transform: `rotate(${item.rotation}deg)`,
                minWidth: "220px",
                maxWidth: "240px",
              }}
              className="shrink-0 cursor-pointer group relative"
            >
              <div
                className="polaroid-card rounded-2xl relative shadow-md"
                style={{ padding: "10px 10px 32px 10px" }}
              >
                <div className={item.tape} />

                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#eee7de] shadow-inner mt-2">
                  <Image
                    src={item.src}
                    alt={item.caption}
                    fill
                    sizes="240px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-white/70 backdrop-blur-xs text-[#3f2e24] opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-2.5 h-2.5" />
                  </div>


                  {/* Secret Heart Sticker for Task */}
                  {item.hasHeart && (
                    <motion.button
                      onClick={handleHeartClick}
                      whileHover={{ scale: 1.3 }}
                      whileTap={{ scale: 0.85 }}
                      className={`absolute bottom-1.5 right-1.5 p-1.5 rounded-full transition-all cursor-pointer z-20 min-w-[36px] min-h-[36px] flex items-center justify-center ${
                        taskDone
                          ? "bg-[#fda4af] text-[#be185d] scale-110 shadow-xs"
                          : "bg-white/80 hover:bg-white text-[#fda4af] shadow-xs animate-bounce"
                      }`}
                      title="Tap the secret heart sticker!"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          taskDone ? "fill-[#be185d]" : "fill-[#fda4af]"
                        }`}
                      />
                    </motion.button>
                  )}
                </div>

                <div className="pt-2 text-center">
                  <p className="font-handwriting text-lg text-[#3f2e24] font-bold leading-tight truncate">
                    &ldquo;{item.caption}&rdquo;
                  </p>
                  <span className="text-[10px] text-[#8c7465] font-sans block">
                    {item.sub}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      {/* Task Completion Feedback */}
      <div className="mt-3 text-center max-w-sm z-10">
        {!taskDone ? (
          <div className="p-2.5 rounded-2xl bg-[#fffaf5] border border-[#eddccc] text-center">
            <span className="text-xs text-[#786457] font-sans">
              Task: Tap the <strong>secret heart sticker 💖</strong> on the first polaroid!
            </span>
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-3 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] flex flex-col items-center gap-1 text-[#065f46]"
          >
            <div className="flex items-center gap-1.5 font-sans font-semibold text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
              <span>TASK COMPLETE ✓ Secret Heart Found</span>
            </div>
            <p className="text-[11px] font-sans text-[#047857]">
              &ldquo;No cheating, madam. Photo unlocked!&rdquo;
            </p>
            <button
              onClick={onNext}
              className="mt-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-[#fda4af] to-[#fb7185] hover:from-[#fb7185] hover:to-[#f43f5e] text-white font-sans font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 btn-cute"
            >
              <span>Continue to Gift Snaps</span>
              <span className="text-base leading-none">↓</span>
            </button>
          </motion.div>
        )}
      </div>
      </div>



      {/* Full Photo Lightbox Portaled to document.body */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {zoomPhoto && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setZoomPhoto(null)}
                className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6"
                style={{
                  backgroundColor: "rgba(20, 12, 8, 0.82)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                }}
              >
                <motion.div
                  initial={{ scale: 0.86, y: 24, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.9, y: 12, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-sm sm:max-w-md bg-[#fffdfa] rounded-3xl border-2 border-[#ebdcd0] shadow-2xl p-4 sm:p-5 flex flex-col text-center cursor-default select-none"
                >
                  {/* Polaroid Washi Tape Accent */}
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#fed7aa]/80 border-t border-b border-[#fdba74]/50 shadow-xs rotate-[-1deg]"
                    style={{ clipPath: "polygon(4% 0%, 96% 0%, 100% 100%, 0% 100%)" }}
                  />

                  {/* Close button */}
                  <button
                    onClick={() => setZoomPhoto(null)}
                    className="absolute top-3 right-3 p-2 rounded-full text-[#8c7465] hover:text-[#3f2e24] bg-white/80 hover:bg-[#f5ece3] shadow-xs transition-colors cursor-pointer z-10"
                    title="Close (Esc)"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Photo Frame */}
                  <div
                    className="relative w-full overflow-hidden rounded-2xl bg-[#eee7de] shadow-inner mt-2 mb-3"
                    style={{ aspectRatio: "4/3" }}
                  >
                    <Image
                      src={zoomPhoto.src}
                      alt={zoomPhoto.caption}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 92vw, 440px"
                      priority
                    />

                    {/* Secret Heart Sticker inside modal */}
                    {zoomPhoto.hasHeart && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHeartClick(e);
                        }}
                        className={`absolute bottom-2.5 right-2.5 p-2 rounded-full transition-all cursor-pointer z-20 min-w-[44px] min-h-[44px] flex items-center justify-center ${
                          taskDone
                            ? "bg-[#fda4af] text-[#be185d] scale-110 shadow-sm"
                            : "bg-white/95 hover:bg-white text-[#fda4af] shadow-md animate-bounce ring-2 ring-[#fda4af]"
                        }`}
                        title="Tap the secret heart sticker!"
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            taskDone ? "fill-[#be185d]" : "fill-[#fda4af]"
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  <p className="font-handwriting text-2xl sm:text-3xl text-[#3f2e24] font-bold leading-tight">
                    &ldquo;{zoomPhoto.caption}&rdquo;
                  </p>
                  <span className="text-xs sm:text-sm text-[#8c7465] font-sans mt-1 mb-4">
                    {zoomPhoto.sub}
                  </span>

                  <button
                    type="button"
                    onClick={() => setZoomPhoto(null)}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#fda4af] to-[#fb7185] hover:from-[#fb7185] hover:to-[#f43f5e] text-white font-sans font-bold text-sm cursor-pointer transition-all shadow-md active:scale-95"
                  >
                    Close ✕
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

    </div>
  );
}
