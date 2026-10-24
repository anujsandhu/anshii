"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, X, MessageCircleHeart } from "lucide-react";

interface LiveMessage {
  id: string;
  text: string;
  emojis: string[];
  sender: string;
  timestamp: number;
}

interface FloatingParticle {
  id: string;
  emoji: string;
  leftPercent: number;
  size: number;
  duration: number;
  delay: number;
  sway: number;
  rotate: number;
}

// Gentle pleasant chime synthesizer (pure Web Audio, no external audio file dependency)
function playDelicateChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtxClass) return;
    const ctx = new AudioCtxClass();

    // Soft celestial arpeggio (C#6 -> F#6 -> G#6 -> C#7)
    const notes = [1108.73, 1479.98, 1661.22, 2217.46];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.045, ctx.currentTime + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.08 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.55);
    });
  } catch {}
}

export default function LiveMessageOverlay() {
  const [activeMessage, setActiveMessage] = useState<LiveMessage | null>(null);
  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const lastSeenTimestampRef = useRef<number>(Date.now());
  const processedMessageIdsRef = useRef<Set<string>>(new Set());
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Poll for incoming live messages every 1.4s
  useEffect(() => {
    let isFetching = false;

    const checkMessages = async () => {
      if (isFetching) return;
      isFetching = true;

      try {
        const res = await fetch(
          `/api/live-message?since=${lastSeenTimestampRef.current}`,
          {
            cache: "no-store",
            headers: { Pragma: "no-cache", "Cache-Control": "no-cache" },
          }
        );

        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.messages) && data.messages.length > 0) {
            // Find the newest unhandled message
            for (const msg of data.messages as LiveMessage[]) {
              if (!processedMessageIdsRef.current.has(msg.id)) {
                processedMessageIdsRef.current.add(msg.id);
                lastSeenTimestampRef.current = Math.max(
                  lastSeenTimestampRef.current,
                  msg.timestamp
                );

                // Play audio chime
                playDelicateChime();

                // Set active message toast
                setActiveMessage(msg);

                // Clear previous dismiss timer and set new one (7.5 seconds)
                if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
                dismissTimerRef.current = setTimeout(() => {
                  setActiveMessage(null);
                }, 7500);

                // Trigger celebratory floating emoji burst
                const emojiPool =
                  msg.emojis && msg.emojis.length > 0
                    ? msg.emojis
                    : ["💖", "✨", "🌸", "🥰", "🎂", "💌"];

                const newParticles: FloatingParticle[] = [];
                const particleCount = Math.max(18, emojiPool.length * 4);

                for (let i = 0; i < particleCount; i++) {
                  const randomEmoji =
                    emojiPool[Math.floor(Math.random() * emojiPool.length)];
                  newParticles.push({
                    id: `p_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
                    emoji: randomEmoji,
                    leftPercent: 6 + Math.random() * 88, // 6% to 94% across screen
                    size: 26 + Math.floor(Math.random() * 26), // 26px to 52px
                    duration: 3.2 + Math.random() * 2.2, // 3.2s to 5.4s
                    delay: Math.random() * 1.2, // Stagger up to 1.2s
                    sway: -35 + Math.random() * 70, // Horizontal sway
                    rotate: -30 + Math.random() * 60, // Rotation
                  });
                }

                setParticles((prev) => [...prev, ...newParticles]);

                // Cleanup particles from DOM after flight duration
                setTimeout(() => {
                  setParticles((prev) =>
                    prev.filter((p) => !newParticles.some((np) => np.id === p.id))
                  );
                }, 6500);

                break; // Show one active message at a time
              }
            }
          }
        }
      } catch {} finally {
        isFetching = false;
      }
    };

    const interval = setInterval(checkMessages, 1400);
    return () => {
      clearInterval(interval);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  return (
    <>
      {/* ── 1. FLOATING CELEBRATORY EMOJI BURST LAYER ── */}
      <div className="fixed inset-0 pointer-events-none z-[99998] overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              y: "105vh",
              x: 0,
              opacity: 0,
              scale: 0.6,
              rotate: 0,
            }}
            animate={{
              y: "-15vh",
              x: [0, p.sway, -p.sway, 0],
              opacity: [0, 1, 1, 0.85, 0],
              scale: [0.6, 1.25, 1, 0.9],
              rotate: [0, p.rotate, -p.rotate, p.rotate * 1.5],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: "easeOut",
            }}
            style={{
              position: "absolute",
              left: `${p.leftPercent}%`,
              fontSize: `${p.size}px`,
              filter: "drop-shadow(0 4px 12px rgba(244,63,94,0.3))",
              userSelect: "none",
            }}
          >
            {p.emoji}
          </motion.div>
        ))}
      </div>

      {/* ── 2. ROMANTIC SCRAPBOOK LIVE MESSAGE POPUP CARD ── */}
      <div className="fixed top-6 left-0 right-0 z-[99999] pointer-events-none flex justify-center px-4">
        <AnimatePresence>
          {activeMessage && (
            <motion.div
              key={activeMessage.id}
              initial={{ opacity: 0, y: -45, scale: 0.9, rotate: -1.5 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, y: -30, scale: 0.92, transition: { duration: 0.3 } }}
              transition={{ type: "spring", stiffness: 380, damping: 24 }}
              className="pointer-events-auto relative max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl p-5 border-2 border-[#fda4af] shadow-[0_22px_65px_-12px_rgba(244,63,94,0.35)] overflow-hidden group"
            >
              {/* Shimmering Rose Gold Top Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#fda4af] via-[#fb7185] to-[#f43f5e]" />

              {/* Header: Sender & Live Badge */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#ffe4e6] flex items-center justify-center text-[#e11d48] shadow-xs">
                    <MessageCircleHeart className="w-4 h-4 fill-[#f43f5e] text-[#f43f5e] animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xs font-serif font-bold text-[#881337] flex items-center gap-1.5">
                      <span>Message from {activeMessage.sender}</span>
                      <Sparkles className="w-3.5 h-3.5 text-[#fb7185] fill-[#fb7185]" />
                    </span>
                    <span className="text-[10px] font-mono text-[#be185d]/80 block">
                      Live on your screen
                    </span>
                  </div>
                </div>

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={() => setActiveMessage(null)}
                  className="w-7 h-7 rounded-full bg-[#faf7f2] hover:bg-[#ffe4e6] text-[#8c7465] hover:text-[#881337] flex items-center justify-center transition-all cursor-pointer border border-[#ebdcd0]"
                  title="Close message"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Message Content */}
              {activeMessage.text && (
                <p className="text-sm sm:text-base font-serif text-[#3f2e24] leading-relaxed my-2 pl-1 select-text">
                  {activeMessage.text}
                </p>
              )}

              {/* Attached Emojis Bar (if any) */}
              {activeMessage.emojis && activeMessage.emojis.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1 mt-1 border-t border-[#fecdd3]/60">
                  {activeMessage.emojis.map((emoji, idx) => (
                    <span
                      key={`${emoji}_${idx}`}
                      className="text-xl sm:text-2xl hover:scale-125 transition-transform cursor-default"
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              )}

              {/* Subtle Glowing Footer */}
              <div className="flex items-center justify-between text-[10px] font-mono text-[#9f1239]/70 mt-2.5 pt-1.5 border-t border-rose-100">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-rose-500 text-rose-500 animate-ping" />
                  <span>Just now</span>
                </span>
                <span className="italic font-serif">With all my love ❤️</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
