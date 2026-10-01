"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Maximize2, CheckCircle2, Send, ExternalLink, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import WhatsAppImageModal from "@/components/WhatsAppImageModal";
import {
  getShareableImage,
  ShareableImageConfig,
  TARGET_WHATSAPP_CONFIG,
} from "@/data/whatsappImages";

interface Frame3PhotosProps {
  isCompleted: boolean;
  onCompleteTask: () => void;
  onNext: () => void;
}

// ── Photo data with WhatsApp messages & shareable IDs ──────────────────────────
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
    waMessage: "I found my childhood photo on your website 😂",
    allowWhatsAppShare: true,
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
    waMessage: "Okay, this memory made me smile.",
    allowWhatsAppShare: true,
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
    waMessage: "This one is my favourite.",
    allowWhatsAppShare: true,
  },
];

// Anuj's WhatsApp number (+91 8278710552)
const ANUJ_WA_NUMBER = TARGET_WHATSAPP_CONFIG.rawNumber;

function buildWaLink(message: string) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${ANUJ_WA_NUMBER}?text=${encoded}`;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Frame3Photos({
  isCompleted,
  onCompleteTask,
  onNext,
}: Frame3PhotosProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<string>("");
  const [taskDone, setTaskDone] = useState(isCompleted);
  // Track per-photo "sent" confirmation state
  const [sentPhotos, setSentPhotos] = useState<Set<number>>(new Set());
  // Active WhatsApp modal image
  const [waModalImage, setWaModalImage] = useState<ShareableImageConfig | null>(null);

  React.useEffect(() => {
    setTaskDone(isCompleted);
  }, [isCompleted]);

  // Update selectedMessage whenever a new photo is clicked
  React.useEffect(() => {
    if (selectedPhoto !== null && SCRAPBOOK_PREVIEWS[selectedPhoto]) {
      setSelectedMessage(SCRAPBOOK_PREVIEWS[selectedPhoto].waMessage);
    }
  }, [selectedPhoto]);

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

  const handleOpenWhatsAppModal = (imageId: string) => {
    const config = getShareableImage(imageId);
    if (config) {
      setWaModalImage(config);
    }
  };

  const handleWhatsAppSuccess = (imageId: string) => {
    const photoIdx = SCRAPBOOK_PREVIEWS.findIndex((p) => p.imageId === imageId);
    if (photoIdx !== -1) {
      setSentPhotos((prev) => new Set([...prev, photoIdx]));
    }
  };

  const handleSendToAnuj = (photoIndex: number) => {
    const photo = SCRAPBOOK_PREVIEWS[photoIndex];
    if (photo && photo.imageId) {
      handleOpenWhatsAppModal(photo.imageId);
    } else {
      const messageToSend = selectedMessage || photo.waMessage;
      const link = buildWaLink(messageToSend);
      window.open(link, "_blank", "noopener,noreferrer");
      setTimeout(() => {
        setSentPhotos((prev) => new Set([...prev, photoIndex]));
      }, 800);
    }
  };

  const selectedItem = selectedPhoto !== null ? SCRAPBOOK_PREVIEWS[selectedPhoto] : null;
  const isSent = selectedPhoto !== null && sentPhotos.has(selectedPhoto);

  return (
    <div className="relative w-full h-full flex flex-col items-center px-3 sm:px-6 select-none overflow-y-auto overflow-x-hidden no-scrollbar pt-[max(58px,calc(var(--sat)+50px))] pb-[max(72px,calc(var(--sab)+64px))]">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[650px] h-[340px] sm:h-[650px] bg-gradient-to-tr from-[#fbcfe8]/20 via-[#fed7aa]/20 to-[#bae6fd]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-4xl flex flex-col items-center my-auto">
        {/* Header */}
        <div className="text-center mb-1.5 z-10">
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

        {/* 3 Polaroids */}
        <div
          className="flex flex-nowrap items-center justify-center gap-2 sm:gap-5 max-w-4xl w-full z-10 my-1 overflow-x-auto py-2 px-4"
          style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
        {SCRAPBOOK_PREVIEWS.map((item, index) => (
          <motion.div
            key={item.id}
            onClick={() => setSelectedPhoto(index)}
            whileHover={{ scale: 1.04, rotate: 0, zIndex: 20 }}
            style={{ transform: `rotate(${item.rotation}deg)`, minWidth: "clamp(100px, 28vw, 192px)" }}
            className="shrink-0 cursor-pointer group relative"
          >
            <div
              className="polaroid-card rounded-xl sm:rounded-2xl relative shadow-md"
              style={{ padding: "clamp(6px, 1.5vw, 10px) clamp(6px, 1.5vw, 10px) clamp(20px, 5vw, 40px)" }}
            >
              <div className={item.tape} />

              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg sm:rounded-xl bg-[#eee7de] shadow-inner">
                <Image
                  src={item.src}
                  alt={item.caption}
                  fill
                  sizes="(max-width: 640px) 30vw, 220px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-white/70 backdrop-blur-xs text-[#3f2e24] opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-2.5 h-2.5" />
                </div>

                {/* Sent badge overlay */}
                {sentPhotos.has(index) && (
                  <div className="absolute inset-0 flex items-end justify-center pb-2 pointer-events-none">
                    <span className="text-[9px] font-sans bg-[#ecfdf5]/90 text-[#065f46] px-1.5 py-0.5 rounded-full border border-[#a7f3d0]">
                      sent ✓
                    </span>
                  </div>
                )}

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
                    <Heart className={`w-3.5 h-3.5 ${taskDone ? "fill-[#be185d]" : "fill-[#fda4af]"}`} />
                  </motion.button>
                )}
              </div>

              <div className="pt-1.5 sm:pt-2 text-center">
                <p className="font-handwriting text-[#3f2e24] font-bold leading-tight truncate" style={{ fontSize: "clamp(11px, 3vw, 18px)" }}>
                  &ldquo;{item.caption}&rdquo;
                </p>
                <span className="text-[9px] sm:text-[10px] text-[#8c7465] font-sans block mb-1.5">
                  {item.sub}
                </span>

                {/* Explicit WhatsApp Media Share Action */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenWhatsAppModal(item.imageId);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f0fdf4] hover:bg-[#dcfce7] border border-[#bbf7d0] text-[#15803d] text-[10px] font-sans font-bold shadow-2xs hover:scale-105 transition-all cursor-pointer"
                  title="Send this photo directly to Anuj's WhatsApp"
                >
                  <Send className="w-2.5 h-2.5" />
                  <span>Send to WhatsApp</span>
                </button>
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
              <span>Continue to Song Mixtape</span>
              <span className="text-base leading-none">↓</span>
            </button>
          </motion.div>
        )}
      </div>

      {/* ── Lightbox with WhatsApp action ── */}
      <AnimatePresence>
        {selectedPhoto !== null && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 bg-[#3f2e24]/80 backdrop-blur-sm flex items-center justify-center p-4 select-none"
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              aria-label="Close"
              className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/20 hover:bg-white/35 text-white cursor-pointer transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>

            <motion.div
              initial={{ scale: 0.88, y: 18 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.88, y: 18 }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="paper-card-warm rounded-3xl shadow-2xl border border-[#ebdcd0] w-full max-w-sm overflow-hidden"
              style={{ padding: "clamp(14px, 4vw, 24px)" }}
            >
              {/* Washi tape */}
              <div className="washi-tape-pink" />

              {/* Photo */}
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-[#eee7de] shadow-inner mt-2">
                <Image
                  src={selectedItem.src}
                  alt="Memory"
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 90vw, 500px"
                />
              </div>

              {/* Caption */}
              <div className="mt-3 text-center">
                <p className="font-handwriting text-xl sm:text-2xl text-[#3f2e24] font-bold leading-snug">
                  &ldquo;{selectedItem.caption}&rdquo;
                </p>
                <p className="text-xs text-[#8c7465] font-sans mt-0.5">
                  {selectedItem.sub}
                </p>
              </div>

              {/* ── WhatsApp action ── */}
              <div className="mt-3 pt-3 border-t border-[#f0e4d6]">
                <AnimatePresence mode="wait">
                  {!isSent ? (
                    <motion.div
                      key="send-prompt"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex flex-col items-center gap-2.5"
                    >
                      <p className="text-[12px] text-[#a0897a] font-handwriting text-base">
                        You picked this one 👀
                      </p>

                      {/* Active Pre-filled message bubble */}
                      <div className="w-full px-3 py-2 rounded-xl bg-[#faf7f2] border border-[#ebdcd0] text-center">
                        <span className="text-[11px] font-sans italic text-[#5c473a]">
                          &ldquo;{selectedMessage}&rdquo;
                        </span>
                      </div>

                      {/* Quick message options chips */}
                      <div className="flex flex-wrap gap-1 justify-center max-w-xs">
                        {[
                          selectedItem.waMessage,
                          "I saw the bracelet…",
                          "The teddy is actually so cute 🧸",
                          "Okayyy, I opened the gift 👀",
                          "This one is my favourite.",
                        ]
                          .filter((msg, idx, arr) => arr.indexOf(msg) === idx)
                          .map((msgOption, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedMessage(msgOption)}
                              className={`text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                                selectedMessage === msgOption
                                  ? "bg-[#fda4af] border-[#fb7185] text-[#4c0519] font-bold shadow-2xs"
                                  : "bg-white border-[#ebdcd0] text-[#786457] hover:border-[#fda4af]"
                              }`}
                            >
                              {msgOption.length > 24 ? msgOption.slice(0, 22) + "…" : msgOption}
                            </button>
                          ))}
                      </div>

                      <motion.button
                        type="button"
                        onClick={() => handleSendToAnuj(selectedPhoto)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] text-white font-sans font-bold text-xs shadow-md transition-all cursor-pointer min-h-[44px] group mt-1"
                      >
                        <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        <span>Send Image to Anuj (+91 8278710552)</span>
                        <Sparkles className="w-3.5 h-3.5 text-white/80" />
                      </motion.button>
                      <p className="text-[10px] text-[#8c7465] font-sans">
                        Preview, confirm &amp; securely send via WhatsApp Cloud API ✦
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="sent-confirm"
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-1.5 py-1"
                    >
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] text-xs font-sans font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                        <span>Image delivered to Anuj&apos;s WhatsApp! 🌷</span>
                      </div>
                      <p className="text-[10px] text-[#a0897a] font-sans">
                        Sent to {TARGET_WHATSAPP_CONFIG.displayNumber} ✓
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sleek WhatsApp Image Confirmation Modal */}
      <WhatsAppImageModal
        isOpen={waModalImage !== null}
        onClose={() => setWaModalImage(null)}
        image={waModalImage}
        onSuccess={handleWhatsAppSuccess}
      />
    </div>
  );
}
