"use client";

import React, { useState, useEffect, useRef } from "react";
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
  RotateCw,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";
import confetti from "canvas-confetti";

interface Frame3PhotosProps {
  isCompleted: boolean;
  onCompleteTask: () => void;
  onNext: () => void;
}

// ── Photo & Video data for Digital Scrapbook ────────────────────────────────
export interface ScrapbookItem {
  id: number;
  type: "image" | "video";
  src: string;
  badge: string;
  badgeIcon: string;
  caption: string;
  sub: string;
  rotation: number;
  tape: string;
  hasHeart: boolean;
  videoRotation?: number; // e.g. -90deg to orient upright
}

const SCRAPBOOK_PREVIEWS: ScrapbookItem[] = [
  {
    id: 1,
    type: "image",
    src: "/1st-msg-ss.png",
    badge: "The Beginning",
    badgeIcon: "✨",
    caption: "The first few messages.",
    sub: "Before all the random conversations, there was just... this.",
    rotation: -2.4,
    tape: "washi-tape-pink",
    hasHeart: true,
  },
  {
    id: 2,
    type: "video",
    src: "/1st-snap.mp4",
    badge: "First Snap",
    badgeIcon: "📸",
    caption: "One of the first snaps.",
    sub: "Somewhere along the way, the conversation became memories.",
    rotation: 2.1,
    tape: "washi-tape-blue",
    hasHeart: false,
    videoRotation: -90, // Upright rotation
  },
  {
    id: 3,
    type: "video",
    src: "/my-fav-snap.mp4",
    badge: "Favorite Snap",
    badgeIcon: "♡",
    caption: "Some memories just stay.",
    sub: "Not everything needs an explanation. Some moments are just favorites.",
    rotation: -1.8,
    tape: "washi-tape-yellow",
    hasHeart: false,
    videoRotation: -90, // Upright rotation
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function Frame3Photos({
  isCompleted,
  onCompleteTask,
  onNext,
}: Frame3PhotosProps) {
  const [taskDone, setTaskDone] = useState(isCompleted);
  const [zoomPhoto, setZoomPhoto] = useState<ScrapbookItem | null>(null);
  const [activeMobileIdx, setActiveMobileIdx] = useState(0);
  const activeMobileItem = SCRAPBOOK_PREVIEWS[activeMobileIdx];
  const [mounted, setMounted] = useState(false);

  // Lightbox Interactive States (Zoom & Video Controls)
  const [photoZoom, setPhotoZoom] = useState<number>(1);
  const [videoRotation, setVideoRotation] = useState<number>(-90);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setTaskDone(isCompleted);
  }, [isCompleted]);

  // Reset interactive states whenever a photo/video opens in the modal
  useEffect(() => {
    if (zoomPhoto) {
      setPhotoZoom(1);
      setVideoRotation(zoomPhoto.videoRotation ?? -90);
      setIsVideoPlaying(true);
      setIsVideoMuted(false);
    }
  }, [zoomPhoto]);

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

  const handleTogglePlayVideo = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!modalVideoRef.current) return;
    if (modalVideoRef.current.paused) {
      modalVideoRef.current.play();
      setIsVideoPlaying(true);
    } else {
      modalVideoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const handleToggleMuteVideo = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!modalVideoRef.current) return;
    modalVideoRef.current.muted = !isVideoMuted;
    setIsVideoMuted(!isVideoMuted);
  };

  const handleRotateVideo = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setVideoRotation((prev) => {
      // Rotate clockwise by 90 degrees: -90 -> 0 -> 90 -> 180 -> 270 (-90)
      const next = (prev + 90) % 360;
      return next === 270 ? -90 : next;
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center px-3 sm:px-6 select-none overflow-y-auto overflow-x-hidden no-scrollbar pt-[max(58px,calc(var(--sat)+50px))] pb-[max(72px,calc(var(--sab)+64px))]">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[680px] h-[340px] sm:h-[680px] bg-gradient-to-tr from-[#fbcfe8]/25 via-[#fed7aa]/20 to-[#bae6fd]/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-5xl flex flex-col items-center my-auto">
        {/* Header */}
        <div className="text-center mb-2 sm:mb-3 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#fff0f3] border border-[#fbcfe8] text-[#be185d] font-sans text-xs mb-1 shadow-2xs">
            <span>📸</span>
            <span>Digital Scrapbook</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-bold font-handwriting text-[#3f2e24]">
            Some Favorite Moments
          </h2>
          <p className="text-[11px] sm:text-xs text-[#786457] font-sans">
            Tap any polaroid to zoom in & view full size. Collect the secret heart sticker!
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
                className={`px-3 py-1 rounded-full text-[11px] font-sans font-semibold transition-all cursor-pointer shadow-2xs flex items-center gap-1 ${
                  activeMobileIdx === idx
                    ? "bg-[#3f2e24] text-white scale-105 shadow-xs"
                    : "bg-white/85 border border-[#ebdcd0] text-[#786457] hover:bg-white"
                }`}
              >
                <span>{item.badgeIcon}</span>
                <span>{item.badge}</span>
                {item.hasHeart && !taskDone && (
                  <span className="ml-0.5 text-[10px]">💖</span>
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
                className="w-full max-w-[310px] cursor-pointer group relative"
              >
                <div
                  className="polaroid-card rounded-2xl relative shadow-lg"
                  style={{
                    padding: "10px 10px 24px 10px",
                    transform: `rotate(${activeMobileItem.rotation * 0.6}deg)`,
                  }}
                >
                  <div className={activeMobileItem.tape} />

                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#140c08] shadow-inner mt-2 flex items-center justify-center">
                    {activeMobileItem.type === "image" ? (
                      <Image
                        src={activeMobileItem.src}
                        alt={activeMobileItem.caption}
                        fill
                        priority
                        sizes="310px"
                        className="object-cover"
                      />
                    ) : (
                      <video
                        src={activeMobileItem.src}
                        playsInline
                        loop
                        muted
                        autoPlay
                        preload="metadata"
                        className="pointer-events-none transition-transform duration-300"
                        style={{
                          position: "absolute",
                          width: "75%",
                          height: "133.33%",
                          objectFit: "cover",
                          transform: `rotate(${activeMobileItem.videoRotation || 0}deg)`,
                        }}
                      />
                    )}

                    {/* Media Type Badge */}
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-sans font-medium flex items-center gap-1 shadow-xs z-10">
                      <span>{activeMobileItem.badgeIcon}</span>
                      <span>{activeMobileItem.badge}</span>
                    </div>

                    <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-white/75 backdrop-blur-xs text-[#3f2e24] shadow-xs z-10 flex items-center gap-0.5 text-[9px] font-sans font-medium px-1.5">
                      <Maximize2 className="w-2.5 h-2.5" />
                      <span>Zoom</span>
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

        {/* ── DESKTOP VIEW (sm:flex): 3 Prominent Polaroids side-by-side ── */}
        <div
          className="hidden sm:flex flex-nowrap items-center justify-center gap-6 max-w-5xl w-full z-10 my-1 overflow-x-auto py-3 px-4"
          style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
          {SCRAPBOOK_PREVIEWS.map((item) => (
            <motion.div
              key={item.id}
              onClick={() => setZoomPhoto(item)}
              whileHover={{ scale: 1.05, rotate: 0, zIndex: 20 }}
              style={{
                transform: `rotate(${item.rotation}deg)`,
                minWidth: "260px",
                maxWidth: "290px",
              }}
              className="shrink-0 cursor-pointer group relative"
            >
              <div
                className="polaroid-card rounded-2xl relative shadow-md hover:shadow-xl transition-shadow duration-300"
                style={{ padding: "12px 12px 30px 12px" }}
              >
                <div className={item.tape} />

                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#140c08] shadow-inner mt-2 flex items-center justify-center">
                  {item.type === "image" ? (
                    <Image
                      src={item.src}
                      alt={item.caption}
                      fill
                      sizes="290px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <video
                      src={item.src}
                      playsInline
                      loop
                      muted
                      autoPlay
                      preload="metadata"
                      className="pointer-events-none transition-transform duration-500 group-hover:scale-105"
                      style={{
                        position: "absolute",
                        width: "75%",
                        height: "133.33%",
                        objectFit: "cover",
                        transform: `rotate(${item.videoRotation || 0}deg)`,
                      }}
                    />
                  )}

                  {/* Media Type Badge */}
                  <div className="absolute top-1.5 left-1.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-sans font-medium flex items-center gap-1 shadow-xs z-10">
                    <span>{item.badgeIcon}</span>
                    <span>{item.badge}</span>
                  </div>

                  {/* Zoom indicator hover pill */}
                  <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-white/80 backdrop-blur-xs text-[#3f2e24] opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center gap-1 text-[10px] font-sans font-semibold shadow-xs">
                    <Maximize2 className="w-2.5 h-2.5" />
                    <span>Zoom</span>
                  </div>

                  {/* Secret Heart Sticker for Task */}
                  {item.hasHeart && (
                    <motion.button
                      onClick={handleHeartClick}
                      whileHover={{ scale: 1.3 }}
                      whileTap={{ scale: 0.85 }}
                      className={`absolute bottom-2 right-2 p-2 rounded-full transition-all cursor-pointer z-20 min-w-[38px] min-h-[38px] flex items-center justify-center ${
                        taskDone
                          ? "bg-[#fda4af] text-[#be185d] scale-110 shadow-xs"
                          : "bg-white/90 hover:bg-white text-[#fda4af] shadow-md animate-bounce ring-2 ring-[#fda4af]"
                      }`}
                      title="Tap the secret heart sticker!"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          taskDone ? "fill-[#be185d]" : "fill-[#fda4af]"
                        }`}
                      />
                    </motion.button>
                  )}
                </div>

                <div className="pt-2.5 text-center">
                  <p className="font-handwriting text-xl text-[#3f2e24] font-bold leading-tight truncate">
                    &ldquo;{item.caption}&rdquo;
                  </p>
                  <span className="text-[11px] text-[#8c7465] font-sans block mt-0.5">
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
            <div className="p-2.5 rounded-2xl bg-[#fffaf5] border border-[#eddccc] text-center shadow-xs">
              <span className="text-xs text-[#786457] font-sans">
                Task: Tap the <strong>secret heart sticker 💖</strong> on the first polaroid!
              </span>
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-3 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] flex flex-col items-center gap-1 text-[#065f46] shadow-xs"
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

      {/* ── EXPANDED FULL-SCREEN ZOOM MODAL / LIGHTBOX ── */}
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
                className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6"
                style={{
                  backgroundColor: "rgba(18, 11, 7, 0.86)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                }}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.92, y: 12, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl max-h-[92vh] bg-[#fffdfa] rounded-3xl border-2 border-[#ebdcd0] shadow-2xl p-4 sm:p-6 flex flex-col text-center cursor-default select-none overflow-y-auto no-scrollbar"
                >
                  {/* Polaroid Washi Tape Accent */}
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#fed7aa]/85 border-t border-b border-[#fdba74]/60 shadow-xs rotate-[-1deg]"
                    style={{ clipPath: "polygon(4% 0%, 96% 0%, 100% 100%, 0% 100%)" }}
                  />

                  {/* Close button */}
                  <button
                    onClick={() => setZoomPhoto(null)}
                    className="absolute top-3.5 right-3.5 p-2 rounded-full text-[#8c7465] hover:text-[#3f2e24] bg-white/85 hover:bg-[#f5ece3] shadow-xs transition-colors cursor-pointer z-30"
                    title="Close (Esc)"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Lightbox Badge */}
                  <div className="self-center inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fdf2f4] border border-[#fbcfe8] text-[#be185d] font-sans text-xs font-semibold mb-2 shadow-2xs">
                    <span>{zoomPhoto.badgeIcon}</span>
                    <span>{zoomPhoto.badge}</span>
                  </div>

                  {/* ── PHOTO VIEW WITH DEDICATED ZOOM CONTROLS ── */}
                  {zoomPhoto.type === "image" ? (
                    <div className="w-full flex flex-col items-center">
                      {/* Zoom Toolbar */}
                      <div className="flex items-center justify-between w-full max-w-xl px-3 py-1.5 mb-2 bg-[#fbf6f0] border border-[#ecdccd] rounded-xl text-xs font-sans text-[#786457]">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setPhotoZoom((prev) => Math.max(1, +(prev - 0.4).toFixed(1)))}
                            disabled={photoZoom <= 1}
                            className="p-1 px-2 rounded-md bg-white border border-[#ecdccd] text-[#3f2e24] hover:bg-[#fff5eb] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-colors cursor-pointer"
                            title="Zoom Out"
                          >
                            <ZoomOut className="w-3.5 h-3.5" />
                            <span>Zoom Out</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPhotoZoom((prev) => Math.min(2.6, +(prev + 0.4).toFixed(1)))}
                            disabled={photoZoom >= 2.6}
                            className="p-1 px-2 rounded-md bg-white border border-[#ecdccd] text-[#3f2e24] hover:bg-[#fff5eb] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-colors cursor-pointer"
                            title="Zoom In"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                            <span>Zoom In</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPhotoZoom(1)}
                            className="p-1 px-2 rounded-md bg-white border border-[#ecdccd] text-[#786457] hover:bg-[#fff5eb] flex items-center gap-1 font-medium transition-colors cursor-pointer"
                            title="Reset Zoom"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset (100%)</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] font-semibold text-[#be185d]">
                          <span>{Math.round(photoZoom * 100)}%</span>
                        </div>
                      </div>

                      {/* Photo Container with Scrollable/Draggable Zoom */}
                      <div
                        onClick={() => setPhotoZoom((prev) => (prev >= 2 ? 1 : prev + 0.6))}
                        className={`relative w-full max-w-2xl overflow-auto rounded-2xl bg-[#faf6f0] border border-[#ecdccd] shadow-inner mb-3 flex items-center justify-center transition-all ${
                          photoZoom > 1 ? "cursor-zoom-out" : "cursor-zoom-in"
                        }`}
                        style={{ maxHeight: "64vh", minHeight: "360px" }}
                        title={photoZoom > 1 ? "Click to zoom out" : "Click to zoom in"}
                      >
                        <div
                          className="relative transition-transform duration-300 origin-center py-2"
                          style={{
                            transform: `scale(${photoZoom})`,
                            width: "100%",
                            maxWidth: photoZoom > 1 ? "860px" : "560px",
                            aspectRatio: "1442 / 1618",
                          }}
                        >
                          <Image
                            src={zoomPhoto.src}
                            alt={zoomPhoto.caption}
                            fill
                            className="object-contain drop-shadow-sm"
                            sizes="(max-width: 768px) 95vw, 860px"
                            priority
                          />
                        </div>

                        {/* Secret Heart Sticker inside modal */}
                        {zoomPhoto.hasHeart && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHeartClick(e);
                            }}
                            className={`absolute bottom-3 right-3 p-2.5 rounded-full transition-all cursor-pointer z-30 min-w-[46px] min-h-[46px] flex items-center justify-center ${
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

                      <span className="text-[11px] text-[#8c7465] font-sans -mt-1 mb-2">
                        💡 Tap image or use zoom buttons to read messages in full resolution
                      </span>
                    </div>
                  ) : (
                    /* ── VIDEO VIEW WITH 16:9 CONTAINER & ROTATE CONTROLS ── */
                    <div className="w-full max-w-2xl mx-auto mt-1 mb-3">
                      {/* Video Player Box */}
                      <div
                        onClick={handleTogglePlayVideo}
                        className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-black shadow-2xl flex items-center justify-center cursor-pointer group"
                        style={{ maxHeight: "60vh" }}
                      >
                        <video
                          ref={modalVideoRef}
                          src={zoomPhoto.src}
                          playsInline
                          loop
                          autoPlay
                          muted={isVideoMuted}
                          preload="auto"
                          className="transition-transform duration-300 select-none"
                          style={{
                            width: Math.abs(videoRotation % 180) === 90 ? "56.25%" : "100%",
                            height: Math.abs(videoRotation % 180) === 90 ? "177.78%" : "100%",
                            objectFit: "cover",
                            transform: `rotate(${videoRotation}deg)`,
                          }}
                        />

                        {/* Pause Overlay Indicator */}
                        {!isVideoPlaying && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                            <div className="p-4 rounded-full bg-white/90 text-[#3f2e24] shadow-lg animate-scale-in">
                              <Play className="w-8 h-8 fill-current translate-x-0.5" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Video Control Bar with Rotation Button */}
                      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 mt-2 bg-[#fbf6f0] border border-[#ecdccd] rounded-xl text-xs font-sans text-[#786457]">
                        <div className="flex items-center gap-1.5">
                          {/* Play/Pause */}
                          <button
                            type="button"
                            onClick={handleTogglePlayVideo}
                            className="p-1.5 px-3 rounded-lg bg-white border border-[#ebdcd0] text-[#3f2e24] hover:bg-[#fff5eb] transition-colors cursor-pointer flex items-center gap-1.5 font-medium shadow-2xs"
                          >
                            {isVideoPlaying ? (
                              <>
                                <Pause className="w-3.5 h-3.5 fill-current" />
                                <span>Pause</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Play</span>
                              </>
                            )}
                          </button>

                          {/* Sound Toggle */}
                          <button
                            type="button"
                            onClick={handleToggleMuteVideo}
                            className="p-1.5 px-3 rounded-lg bg-white border border-[#ebdcd0] text-[#3f2e24] hover:bg-[#fff5eb] transition-colors cursor-pointer flex items-center gap-1.5 font-medium shadow-2xs"
                          >
                            {isVideoMuted ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5 text-[#e11d48]" />
                                <span>Muted</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5 text-[#10b981]" />
                                <span>Sound On</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Video Rotation Button */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleRotateVideo}
                            className="p-1.5 px-3 rounded-lg bg-[#fff0f3] border border-[#fbcfe8] text-[#be185d] hover:bg-[#ffe4e6] transition-colors cursor-pointer flex items-center gap-1.5 font-semibold shadow-2xs"
                            title="Rotate video by 90 degrees"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            <span>Rotate ({((videoRotation % 360) + 360) % 360}°)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Caption & Subtitle */}
                  <p className="font-handwriting text-2xl sm:text-3xl text-[#3f2e24] font-bold leading-tight">
                    &ldquo;{zoomPhoto.caption}&rdquo;
                  </p>
                  <span className="text-xs sm:text-sm text-[#8c7465] font-sans mt-1 mb-3">
                    {zoomPhoto.sub}
                  </span>

                  {/* Close modal button */}
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
