"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";

interface SendWhatsAppNotificationButtonProps {
  variant?: "entry" | "header" | "floating";
  className?: string;
  onSuccess?: () => void;
}

export default function SendWhatsAppNotificationButton({
  variant = "entry",
  className = "",
  onSuccess,
}: SendWhatsAppNotificationButtonProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (status === "sending") return;

    setStatus("sending");
    setToastMsg(null);

    try {
      const res = await fetch("/api/whatsapp/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("sent");
        setToastMsg("Notification sent to WhatsApp! 💌");

        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#22c55e", "#fda4af", "#bbf7d0", "#86efac"],
          });
        } catch {}

        // If directUrl is provided (always prepared by server), open WhatsApp directly
        if (data.directUrl) {
          window.open(data.directUrl, "_blank", "noopener,noreferrer");
        }

        if (onSuccess) onSuccess();

        setTimeout(() => {
          setStatus("idle");
          setToastMsg(null);
        }, 4000);
      } else {
        // Fallback directly
        const fallbackUrl =
          data.directUrl ||
          `https://wa.me/918278710552?text=${encodeURIComponent(
            "Okay, what's the password? 👀"
          )}`;
        window.open(fallbackUrl, "_blank", "noopener,noreferrer");
        setStatus("sent");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch (err) {
      const fallbackUrl = `https://wa.me/918278710552?text=${encodeURIComponent(
        "Okay, what's the password? 👀"
      )}`;
      window.open(fallbackUrl, "_blank", "noopener,noreferrer");
      setStatus("sent");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  // ── Variant 1: Entry Screen (Clean & Minimal card integration) ──────────────
  if (variant === "entry") {
    return (
      <div className={`w-full flex flex-col items-center ${className}`}>
        <motion.button
          type="button"
          onClick={handleClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={status === "sending"}
          className="w-full py-3 px-4 rounded-2xl bg-[#f0fdf4] hover:bg-[#dcfce7] border border-[#bbf7d0] text-[#15803d] font-sans font-semibold text-xs sm:text-sm shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {status === "sending" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#16a34a]" />
              <span>Sending notification...</span>
            </>
          ) : status === "sent" ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
              <span>Notification Sent to WhatsApp ✓</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5 text-[#22c55e]" />
              <span>Send me a message on WhatsApp</span>
            </>
          )}
        </motion.button>

        {toastMsg && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] font-sans text-[#16a34a] mt-1.5 font-medium"
          >
            {toastMsg}
          </motion.span>
        )}
      </div>
    );
  }

  // ── Variant 2: Header Ribbon / Top Bar Button ────────────────────────────────
  if (variant === "header") {
    return (
      <motion.button
        type="button"
        onClick={handleClick}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        disabled={status === "sending"}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#bbf7d0] hover:border-[#86efac] text-[#15803d] font-sans text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer ${className}`}
        title="Send notification to Anuj on WhatsApp (+91 8278710552)"
      >
        {status === "sending" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#16a34a]" />
        ) : status === "sent" ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
        )}
        <Send className="w-3 h-3 text-[#22c55e]" />
        <span className="hidden sm:inline">Send me a message on WhatsApp</span>
        <span className="sm:hidden">WhatsApp</span>
      </motion.button>
    );
  }

  // ── Variant 3: Floating Action Button ─────────────────────────────────────────
  return (
    <div className={`fixed bottom-4 right-4 z-40 ${className}`}>
      <motion.button
        type="button"
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={status === "sending"}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] text-white font-sans text-xs font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer"
        title="Send predefined notification to Anuj on WhatsApp"
      >
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        <Send className="w-3.5 h-3.5 text-white" />
        <span>Send me a message on WhatsApp</span>
      </motion.button>
    </div>
  );
}
