"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, CheckCircle2, Copy, Check, ChevronDown } from "lucide-react";
import confetti from "canvas-confetti";
import { FloralCorner } from "@/components/flowers/FloralFrame";

interface Frame6LetterProps {
  isCompleted: boolean;
  onCompleteTask: () => void;
  onNext: () => void;
}

// Split letter into digestible paragraph chunks
const LETTER_CHUNKS = [
  {
    id: 0,
    text: "I debated for a while whether to say any of this, but I figured your birthday is probably the one day where saying it is allowed.",
  },
  {
    id: 1,
    text: "I'm not entirely sure when you went from someone I was just talking to, to someone I genuinely care about. There wasn't one specific moment. It was more like — you asked how my day was, and actually listened. We talked about college, family, plans, food, reels, life in general. And somewhere in all of that, without either of us really noticing, it started to feel comfortable.",
  },
  {
    id: 2,
    text: "I appreciate that you check in. That when I'm overthinking something, you tell me to calm down. That you share parts of your life with me that aren't for everyone.",
  },
  {
    id: 3,
    text: "I know things between us are what they are, and I respect that completely. This isn't about changing anything. This is just me telling you — honestly, with no pressure — that you matter to me. As a person. As someone I'm genuinely glad I get to talk to.",
  },
  {
    id: 4,
    text: "I hope year 19 is gentle with you. I hope you rest when you need to, and don't overthink when you don't have to. You're a good person, Anshika. Not everyone is.",
  },
  {
    id: 5,
    text: "P.S. So… I hope the bracelet survived the opening without getting tangled. And yes, the teddy was mandatory. 🧸",
  },
];

const FULL_TEXT = `Dear Anshika,

Happy 19th Birthday.

I debated for a while whether to say any of this, but I figured your birthday is probably the one day where saying it is allowed.

I'm not entirely sure when you went from someone I was just talking to, to someone I genuinely care about. There wasn't one specific moment. It was more like — you asked how my day was, and actually listened. We talked about college, family, plans, food, reels, life in general. And somewhere in all of that, without either of us really noticing, it started to feel comfortable.

I appreciate that you check in. That when I'm overthinking something, you tell me to calm down. That you share parts of your life with me that aren't for everyone.

I know things between us are what they are, and I respect that completely. This isn't about changing anything. This is just me telling you — honestly, with no pressure — that you matter to me. As a person. As someone I'm genuinely glad I get to talk to.

I hope year 19 is gentle with you. I hope you rest when you need to, and don't overthink when you don't have to. You're a good person, Anshika. Not everyone is.

P.S. So… I hope the bracelet survived the opening without getting tangled. And yes, the teddy was mandatory. 🧸

— Anuj
28 October 2026`;

export default function Frame6Letter({
  isCompleted,
  onCompleteTask,
  onNext,
}: Frame6LetterProps) {
  const [copied, setCopied] = useState(false);
  const [taskDone, setTaskDone] = useState(isCompleted);
  // How many chunks are revealed (starts at 1 — show first paragraph)
  const [revealed, setRevealed] = useState(1);
  const allRevealed = revealed >= LETTER_CHUNKS.length;

  React.useEffect(() => {
    setTaskDone(isCompleted);
    if (isCompleted) setRevealed(LETTER_CHUNKS.length);
  }, [isCompleted]);

  const handleCopy = () => {
    navigator.clipboard.writeText(FULL_TEXT).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevealNext = () => {
    if (revealed < LETTER_CHUNKS.length) {
      setRevealed((r) => r + 1);
    }
  };

  const handleUnlockFinal = () => {
    if (taskDone) return;
    setTaskDone(true);
    onCompleteTask();
    try {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#fda4af", "#fbcfe8", "#d8b4fe", "#bae6fd"],
      });
    } catch {}
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center px-3 sm:px-6 select-none overflow-y-auto overflow-x-hidden no-scrollbar pt-[max(58px,calc(var(--sat)+50px))] pb-[max(72px,calc(var(--sab)+64px))]">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-[#fbcfe8]/25 via-[#fed7aa]/20 to-[#d8b4fe]/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Letter Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65 }}
        className="w-full max-w-xl paper-card-warm rounded-3xl relative shadow-xl border border-[#ebdcd0] z-10 text-left overflow-hidden my-auto p-4 sm:p-7"
      >
        <div className="washi-tape-pink" />

        {/* Botanical Corner Flourishes */}
        <FloralCorner
          className="absolute top-2 left-2 pointer-events-none opacity-40 z-10"
          size={28}
          color="#86efac"
          flowerColor="#fda4af"
        />
        <FloralCorner
          className="absolute bottom-2 right-2 pointer-events-none opacity-40 rotate-180 z-10"
          size={28}
          color="#86efac"
          flowerColor="#d8b4fe"
        />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#ebdcd0]">
          <div className="flex items-center gap-1.5 font-handwriting text-lg text-[#786457]">
            <span>To: Anshika</span>
            <span className="text-[#d1c5b8] text-xs">&bull;</span>
            <span className="text-xs font-sans font-normal">October 28, 2026</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-sans text-[#786457] hover:text-[#3f2e24] bg-[#f5ede4] hover:bg-[#ebdcd0] border border-[#e3d3c4] transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-[#10b981]" />
                <span className="text-[#065f46] text-[11px] font-medium">Saved!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-[#8c7465]" />
                <span className="text-[11px]">Save letter</span>
              </>
            )}
          </button>
        </div>

        {/* ── Letter body: chunk-by-chunk reveal ── */}
        <div className="space-y-2.5">
          {/* Salutation */}
          <p className="font-handwriting text-2xl font-bold text-[#be185d]">
            Dear Anshika,
          </p>
          <p className="text-xs sm:text-sm text-[#3f2e24] font-sans font-semibold">
            Happy 19th Birthday.
          </p>

          {/* Paragraphs revealed progressively */}
          {LETTER_CHUNKS.slice(0, revealed).map((chunk, i) => (
            <motion.p
              key={chunk.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="text-xs sm:text-sm text-[#3f2e24] font-sans leading-relaxed"
            >
              {chunk.text}
            </motion.p>
          ))}

          {/* Show "Read more" tap until all revealed */}
          <AnimatePresence>
            {!allRevealed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleRevealNext}
                className="flex items-center gap-1.5 text-[11px] font-sans text-[#fda4af] hover:text-[#f43f5e] transition-colors cursor-pointer font-semibold"
              >
                <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
                <span>keep reading…</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Sign-off — only shows when fully revealed */}
          <AnimatePresence>
            {allRevealed && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-end justify-between pt-1"
              >
                <div>
                  <span className="font-handwriting text-xl font-bold text-[#3f2e24] block">
                    &mdash; Anuj
                  </span>
                  <span className="text-[10px] text-[#8c7465] font-sans">
                    28 October 2026
                  </span>
                </div>
                <div className="text-xl">🌸</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Task / CTA ── */}
        <div className="mt-3 pt-3 border-t border-[#ebdcd0]">
          {!taskDone ? (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              {!allRevealed ? (
                <p className="text-[11px] text-[#a0897a] font-sans">
                  Tap &ldquo;keep reading&rdquo; to finish the letter first ✉️
                </p>
              ) : (
                <motion.button
                  onClick={handleUnlockFinal}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-[#fda4af] to-[#fb7185] hover:from-[#fb7185] hover:to-[#f43f5e] text-white font-sans font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2 btn-cute"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Unlock Final Surprise 💌</span>
                </motion.button>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] text-xs font-sans font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                <span>Letter read! Final surprise unlocked ✓</span>
              </div>
              <button
                onClick={onNext}
                className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-[#fda4af] to-[#fb7185] hover:from-[#fb7185] hover:to-[#f43f5e] text-white font-sans font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2 btn-cute"
              >
                <span>Continue to Grand Finale</span>
                <span className="text-base leading-none">↓</span>
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
