"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Clock,
  UserCheck,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  ShareableImageConfig,
  generateWhatsAppCaption,
  formatWhatsAppTimestamp,
  TARGET_WHATSAPP_CONFIG,
} from "@/data/whatsappImages";

interface WhatsAppImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: ShareableImageConfig | null;
  onSuccess?: (imageId: string) => void;
}

type ModalState = "preview" | "sending" | "success" | "error";

export default function WhatsAppImageModal({
  isOpen,
  onClose,
  image,
  onSuccess,
}: WhatsAppImageModalProps) {
  const [modalState, setModalState] = useState<ModalState>("preview");
  const [errorMessage, setErrorMessage] = useState("");
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);
  const [previewTimestamp, setPreviewTimestamp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset modal state whenever opened
  useEffect(() => {
    if (isOpen && image) {
      setModalState("preview");
      setErrorMessage("");
      setFallbackUrl(null);
      setIsSubmitting(false);
      setPreviewTimestamp(formatWhatsAppTimestamp());
    }
  }, [isOpen, image]);

  if (!isOpen || !image || !mounted) return null;

  const captionPreview = generateWhatsAppCaption(
    image.title,
    image.pageName,
    previewTimestamp
  );

  const handleSend = async () => {
    if (isSubmitting || modalState === "sending") return;

    setIsSubmitting(true);
    setModalState("sending");
    setErrorMessage("");

    try {
      const response = await fetch("/api/whatsapp/send-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageId: image.id,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setModalState("success");
        if (data.fallbackUrl) {
          setFallbackUrl(data.fallbackUrl);
        }

        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#25D366", "#fda4af", "#f43f5e", "#bbf7d0"],
          });
        } catch {}

        if (onSuccess) {
          onSuccess(image.id);
        }
      } else {
        setModalState("error");
        setErrorMessage(
          data.error ||
            "Unable to send image right now. Please retry or open WhatsApp directly."
        );
        if (data.fallbackUrl) {
          setFallbackUrl(data.fallbackUrl);
        }
      }
    } catch (err: any) {
      setModalState("error");
      setErrorMessage(
        "Network connection error. Please check your internet or retry."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    handleSend();
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2b1e17]/55 backdrop-blur-md select-none cursor-pointer"
        onClick={() => {
          if (modalState !== "sending") onClose();
        }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{
            scale: 1,
            y: 0,
            transition: { type: "spring", damping: 22, stiffness: 320 },
          }}
          exit={{ scale: 0.92, y: 15, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm sm:max-w-md bg-[#fffdfa] rounded-3xl border-2 border-[#ebdcd0] shadow-[0_25px_60px_rgba(40,25,15,0.22)] p-5 sm:p-6 flex flex-col text-center cursor-default overflow-visible"
        >
          {/* Top Washi Tape Decoration */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-36 h-6 bg-gradient-to-r from-[#86efac] via-[#4ade80] to-[#22c55e] shadow-xs rotate-[-1deg] flex items-center justify-center border-y border-white/70 rounded-xs z-10">
            <span className="text-[10px] font-sans font-extrabold tracking-widest text-white uppercase drop-shadow-2xs">
              ✦ WHATSAPP SHARE ✦
            </span>
          </div>

          {/* Close button (top right) */}
          {modalState !== "sending" && (
            <button
              onClick={onClose}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-[#8c7465] hover:text-[#3f2e24] hover:bg-[#f5ece3] transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Header Badge */}
          <div className="inline-flex items-center justify-center gap-1.5 self-center px-3 py-1 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] text-[11px] font-sans font-bold text-[#15803d] mt-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
            <span>Send to Anuj&apos;s WhatsApp</span>
          </div>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* STATE 1: PREVIEW & CONFIRMATION */}
          {/* ──────────────────────────────────────────────────────────── */}
          {modalState === "preview" && (
            <div className="flex flex-col items-center">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#3f2e24] leading-tight">
                Send this photo to Anuj?
              </h3>
              <p className="text-xs text-[#786457] font-sans mt-0.5 mb-3">
                Target:{" "}
                <span className="font-semibold text-[#15803d]">
                  {TARGET_WHATSAPP_CONFIG.displayNumber}
                </span>
              </p>

              {/* Photo Preview Card */}
              <div className="w-full relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#eee7de] border border-[#e5d8cc] shadow-inner mb-3">
                <Image
                  src={image.src}
                  alt={image.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 90vw, 420px"
                  priority
                />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] font-sans font-medium flex items-center gap-1">
                  <span>📸</span>
                  <span>{image.title}</span>
                </div>
              </div>

              {/* Generated Caption Preview Box */}
              <div className="w-full p-3 rounded-2xl bg-[#f8faf8] border border-[#dcfce7] text-left mb-3.5 shadow-2xs">
                <div className="flex items-center justify-between text-[10px] font-sans font-bold uppercase tracking-wider text-[#166534] mb-1">
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#22c55e]" />
                    <span>Auto-generated message caption:</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-[#15803d] opacity-80">
                    <Clock className="w-2.5 h-2.5" />
                    <span>Live timestamp</span>
                  </div>
                </div>
                <p className="text-xs font-sans text-[#27272a] leading-relaxed italic bg-white p-2 rounded-xl border border-[#e2e8f0]">
                  &ldquo;{captionPreview}&rdquo;
                </p>
                <div className="flex items-center gap-1 mt-1.5 text-[10px] text-[#6b7280]">
                  <ShieldCheck className="w-3 h-3 text-[#16a34a]" />
                  <span>Verified media • Sent via official WhatsApp API</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-2xl bg-[#f5ece3] hover:bg-[#ebdcd0] text-[#5c473a] font-sans font-semibold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <motion.button
                  type="button"
                  onClick={handleSend}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                  className="flex-[2] py-3 px-4 rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] text-white font-sans font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer btn-cute disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Image Now</span>
                </motion.button>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* STATE 2: ELEGANT SENDING ANIMATION */}
          {/* ──────────────────────────────────────────────────────────── */}
          {modalState === "sending" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 px-2 flex flex-col items-center justify-center text-center"
            >
              {/* Elegant Glowing Spinner */}
              <div className="relative w-20 h-20 flex items-center justify-center mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-3 border-transparent border-t-[#22c55e] border-r-[#86efac]"
                />
                <motion.div
                  animate={{ scale: [0.9, 1.1, 0.9] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-14 h-14 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center text-[#15803d]"
                >
                  <Send className="w-6 h-6 animate-pulse" />
                </motion.div>
              </div>

              <h4 className="font-serif text-xl sm:text-2xl font-bold text-[#1f2937]">
                Sending to WhatsApp...
              </h4>
              <p className="text-xs text-[#6b7280] font-sans mt-1 max-w-xs leading-relaxed">
                Contacting official WhatsApp Cloud API to deliver{" "}
                <span className="font-bold text-[#15803d]">{image.title}</span>{" "}
                to {TARGET_WHATSAPP_CONFIG.displayNumber}.
              </p>

              <div className="flex items-center gap-1.5 mt-5 px-3 py-1.5 rounded-full bg-[#f9fafb] border border-[#e5e7eb] text-[11px] text-[#4b5563]">
                <RotateCw className="w-3 h-3 animate-spin text-[#22c55e]" />
                <span>Processing media payload &amp; verification</span>
              </div>
            </motion.div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* STATE 3: SUCCESS CONFIRMATION */}
          {/* ──────────────────────────────────────────────────────────── */}
          {modalState === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-4 px-1 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#ecfdf5] border-2 border-[#86efac] flex items-center justify-center text-[#10b981] mb-3 shadow-[0_4px_16px_rgba(34,197,94,0.18)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h4 className="font-serif text-2xl font-bold text-[#14532d] leading-tight">
                Image sent successfully!
              </h4>
              <p className="text-xs text-[#4b5563] font-sans mt-1 max-w-xs leading-relaxed">
                Anuj has received{" "}
                <span className="font-bold text-[#15803d]">{image.title}</span> on{" "}
                {TARGET_WHATSAPP_CONFIG.displayNumber} 💌
              </p>

              {/* Delivery Receipt Box */}
              <div className="w-full mt-3 p-3 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] text-left text-[11px] font-sans text-[#166534] space-y-1 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#4ade80] font-bold">Status:</span>
                  <span className="font-semibold text-[#15803d]">Delivered ✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4ade80] font-bold">Recipient:</span>
                  <span className="font-semibold">{TARGET_WHATSAPP_CONFIG.displayNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4ade80] font-bold">Timestamp:</span>
                  <span className="font-semibold">{previewTimestamp}</span>
                </div>
              </div>

              {fallbackUrl && (
                <a
                  href={fallbackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-[11px] text-[#15803d] hover:text-[#166534] font-sans underline inline-flex items-center gap-1"
                >
                  <span>Open chat in WhatsApp Web / App</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              <button
                type="button"
                onClick={onClose}
                className="mt-4 w-full py-3 px-4 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-sans font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                Done
              </button>
            </motion.div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* STATE 4: GRACEFUL ERROR & RETRY */}
          {/* ──────────────────────────────────────────────────────────── */}
          {modalState === "error" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-4 px-1 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#fef2f2] border-2 border-[#fecaca] flex items-center justify-center text-[#dc2626] mb-3 shadow-[0_4px_16px_rgba(239,68,68,0.15)]">
                <AlertCircle className="w-8 h-8" />
              </div>

              <h4 className="font-serif text-2xl font-bold text-[#991b1b] leading-tight">
                Delivery couldn&apos;t complete
              </h4>
              <p className="text-xs text-[#7f1d1d] font-sans mt-1 max-w-xs leading-relaxed bg-[#fff1f2] p-2.5 rounded-xl border border-[#fecdd3]">
                {errorMessage}
              </p>

              <div className="w-full flex flex-col gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-2xl bg-[#dc2626] hover:bg-[#b91c1c] text-white font-sans font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Retry Sending</span>
                </button>

                {fallbackUrl ? (
                  <a
                    href={fallbackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-2xl bg-[#f0fdf4] hover:bg-[#dcfce7] border border-[#86efac] text-[#15803d] font-sans font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Open in WhatsApp Directly</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : null}

                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-[#8c7465] hover:text-[#3f2e24] font-sans mt-1"
                >
                  Cancel and close
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
