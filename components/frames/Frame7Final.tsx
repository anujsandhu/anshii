"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  RotateCcw,
  Sparkles,
  Heart,
  MessageCircle,
  Pencil,
  CheckCircle2,
} from "lucide-react";
import confetti from "canvas-confetti";
import FinalBloom from "@/components/flowers/FinalBloom";
import { TulipFlower, Wildflower } from "@/components/flowers/FlowerSvg";
import { getAnonymousSessionId } from "@/lib/analyticsClient";

interface Frame7FinalProps {
  onReplay: () => void;
}

interface MadamJiAnswers {
  memory: string;
  bond: string;
  futureMessage: string;
  anythingSecret: string;
}

const STORAGE_KEY = "anshii_madam_ji_answers";

export default function Frame7Final({ onReplay }: Frame7FinalProps) {
  const [celebrated, setCelebrated] = useState(false);
  const [answers, setAnswers] = useState<MadamJiAnswers | null>(null);

  useEffect(() => {
    try {
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) {
        setAnswers(JSON.parse(local));
      }
    } catch {}

    const sessionId = getAnonymousSessionId();
    if (sessionId) {
      fetch(`/api/madam-ji-note?sessionId=${encodeURIComponent(sessionId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.answers) {
            const actualAnswers = data.answers.answers || data.answers;
            setAnswers(actualAnswers);
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleCelebrateAgain = () => {
    setCelebrated(true);
    try {
      confetti({
        particleCount: 100,
        spread: 95,
        origin: { y: 0.6 },
        colors: ["#fda4af", "#fbcfe8", "#d8b4fe", "#bae6fd", "#fed7aa", "#86efac"],
      });
    } catch {}
  };

  const hasAnyAnswer =
    answers &&
    Boolean(
      answers.memory?.trim() ||
        answers.bond?.trim() ||
        answers.futureMessage?.trim() ||
        answers.anythingSecret?.trim()
    );

  const [showKeepsakeDrawer, setShowKeepsakeDrawer] = useState(false);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center px-4 sm:px-8 select-none overflow-hidden pt-12 pb-14">
      {/* Background Soft Sunset/Blush Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[600px] h-[340px] sm:h-[600px] bg-gradient-to-tr from-[#fed7aa]/25 via-[#fbcfe8]/25 to-[#d8b4fe]/20 rounded-full blur-[140px] pointer-events-none" />

      {/* ── UNIFIED CENTERED GRAND FINALE CARD (EVERYTHING INSIDE & FULLY VISIBLE) ── */}
      <motion.div
        data-card="true"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg lg:max-w-2xl paper-card-warm rounded-3xl border border-[#ebdcd0] shadow-[0_24px_60px_rgba(80,50,30,0.16)] text-center relative z-10 my-auto p-5 sm:p-6 lg:p-8 flex flex-col"
      >
        <div className="washi-tape-pink shrink-0 !top-1" />

        {/* Flanking Flowers */}
        <div className="absolute top-4 left-4 pointer-events-none hidden sm:block animate-flower-sway opacity-80">
          <TulipFlower size={36} color="#fda4af" accentColor="#f43f5e" />
        </div>
        <div className="absolute top-4 right-4 pointer-events-none hidden sm:block animate-flower-sway-slow opacity-80">
          <Wildflower size={34} color="#d8b4fe" accentColor="#c084fc" />
        </div>

        {/* Final Bloom SVG */}
        <div className="shrink-0 mb-1">
          <FinalBloom onComplete={handleCelebrateAgain} />
        </div>

        {/* Conversational Pause */}
        <div className="text-amber-800/80 font-handwriting text-base sm:text-lg lg:text-xl tracking-wide mb-1">
          One last thing...
        </div>

        {/* Grand Birthday Message */}
        <h2
          className="font-bold font-handwriting text-[#3f2e24] leading-[1.1] mt-0.5 text-3xl sm:text-4xl lg:text-5xl"
        >
          Happy 19th,
          <span className="block text-[#be185d]">Anshika.</span>
        </h2>

        {/* Sincere Line */}
        <p
          className="mt-2 font-handwriting text-[#786457] leading-snug px-4 text-base sm:text-lg lg:text-xl"
        >
          &ldquo;Somewhere between the random conversations, the jokes, the reels&hellip;
          you became someone who matters to me.&rdquo;
        </p>

        {/* Warm Signature */}
        <div className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-[#fdf2f4] border border-[#fbcfe8] text-xs sm:text-sm text-[#be185d] font-sans mx-auto shadow-2xs">
          <Heart className="w-3.5 h-3.5 fill-[#be185d]" />
          <span>With love, <strong>Anuj</strong></span>
          <span className="text-[#a0897a]">&bull;</span>
          <span className="text-[11px] sm:text-xs text-[#8c7465]">28 October 2026</span>
        </div>

        {/* ── EMBEDDED KEEPSAKE DRAWER: FITTED 2x2 GRID (ZERO SCROLL) ── */}
        {hasAnyAnswer && (
          <div className="my-2 border-t border-b border-[#f0e4da] py-1.5">
            <button
              type="button"
              onClick={() => setShowKeepsakeDrawer((p) => !p)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fffdfa] border border-[#fbcfe8] text-[11px] text-[#be185d] font-sans font-semibold hover:bg-[#fff0f3] transition-colors cursor-pointer shadow-2xs"
            >
              <span>💌</span>
              <span>{showKeepsakeDrawer ? "Hide Sealed Keepsakes ▲" : "View Your 4 Sealed Keepsakes ▼"}</span>
            </button>

            {showKeepsakeDrawer && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="mt-2 grid grid-cols-2 gap-2 text-left p-2.5 rounded-2xl bg-[#fffdfa] border border-[#ebdcd0]"
              >
                {answers?.memory && (
                  <div className="p-2 rounded-xl bg-[#fffaf5] border border-[#ebdcd0]/70 text-[11px] font-sans">
                    <span className="font-bold text-[#be185d] block text-[10px] uppercase">
                      01 — A memory
                    </span>
                    <p className="text-[#3f2e24] italic line-clamp-2">
                      &ldquo;{answers.memory}&rdquo;
                    </p>
                  </div>
                )}
                {answers?.bond && (
                  <div className="p-2 rounded-xl bg-[#fffaf5] border border-[#ebdcd0]/70 text-[11px] font-sans">
                    <span className="font-bold text-[#be185d] block text-[10px] uppercase">
                      02 — Our little bond
                    </span>
                    <p className="text-[#3f2e24] italic line-clamp-2">
                      &ldquo;{answers.bond}&rdquo;
                    </p>
                  </div>
                )}
                {answers?.futureMessage && (
                  <div className="p-2 rounded-xl bg-[#fffaf5] border border-[#ebdcd0]/70 text-[11px] font-sans">
                    <span className="font-bold text-[#be185d] block text-[10px] uppercase">
                      03 — Future us
                    </span>
                    <p className="text-[#3f2e24] italic line-clamp-2">
                      &ldquo;{answers.futureMessage}&rdquo;
                    </p>
                  </div>
                )}
                {answers?.anythingSecret && (
                  <div className="p-2 rounded-xl bg-[#fffaf5] border border-[#ebdcd0]/70 text-[11px] font-sans">
                    <span className="font-bold text-[#be185d] block text-[10px] uppercase">
                      04 — Just between us
                    </span>
                    <p className="text-[#3f2e24] italic line-clamp-2">
                      &ldquo;{answers.anythingSecret}&rdquo;
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* Action Buttons — Inside Card */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={handleCelebrateAgain}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#fda4af] hover:bg-[#fb7185] text-[#4c0519] font-sans font-bold text-xs lg:text-sm shadow-md transition-all cursor-pointer btn-cute"
          >
            <Sparkles className="w-4 h-4 fill-[#be185d] text-[#be185d]" />
            <span>Celebrate Again ✨</span>
          </button>

          <button
            onClick={onReplay}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#f5ede4] hover:bg-[#ebdcd0] border border-[#e3d3c4] text-[#4a3528] font-sans text-xs lg:text-sm font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#b45309]" />
            <span>Replay ↻</span>
          </button>

          <a
            href="/conversation"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#fdf2f4] hover:bg-[#fce7ed] border border-[#fbcfe8] text-[#be185d] font-sans text-xs lg:text-sm font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Our Chat 💌</span>
          </a>
        </div>

        {/* Footer Note — Inside Card */}
        <div className="mt-2 pt-1 text-center text-[10px] text-[#8c7465] font-sans border-t border-[#f0e4da]/70">
          Made with love by Anuj, for someone who became unusually important 🌸
        </div>
      </motion.div>
    </div>
  );
}
