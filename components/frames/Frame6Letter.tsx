"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, Copy, Check } from "lucide-react";
import confetti from "canvas-confetti";
import { FloralCorner } from "@/components/flowers/FloralFrame";

interface Frame6LetterProps {
  isCompleted: boolean;
  onCompleteTask: () => void;
  onNext: () => void;
}

const PARAGRAPHS = [
  "I debated for a while whether to say any of this, but I figured your birthday is probably the one day where saying it is allowed.",
  "I'm not entirely sure when you went from someone I was just talking to, to someone I genuinely care about. There wasn't one specific moment. It was more like — you asked how my day was, and actually listened. We talked about college, family, plans, food, reels, life in general. And somewhere in all of that, without either of us really noticing, it started to feel comfortable.",
  "I appreciate that you check in. That when I'm overthinking something, you tell me to calm down. That you share parts of your life with me that aren't for everyone.",
  "I know things between us are what they are, and I respect that completely. This isn't about changing anything. This is just me telling you — honestly, with no pressure — that you matter to me. As a person. As someone I'm genuinely glad I get to talk to.",
  "I hope year 19 is gentle with you. I hope you rest when you need to, and don't overthink when you don't have to. You're a good person, Anshika. Not everyone is.",
  "P.S. So… I hope the bracelet survived the opening without getting tangled. And yes, the teddy was mandatory. 🧸",
];

const FULL_TEXT = `Dear Anshika,

Happy 19th Birthday.

${PARAGRAPHS.join("\n\n")}

— Anuj
28 October 2026`;

export default function Frame6Letter({
  isCompleted,
  onCompleteTask,
  onNext,
}: Frame6LetterProps) {
  const [copied, setCopied] = useState(false);
  const [taskDone, setTaskDone] = useState(isCompleted);

  React.useEffect(() => {
    setTaskDone(isCompleted);
  }, [isCompleted]);

  const handleCopy = () => {
    navigator.clipboard.writeText(FULL_TEXT).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUnlockFinal = () => {
    if (taskDone) return;
    setTaskDone(true);
    onCompleteTask();
    try {
      confetti({
        particleCount: 70,
        spread: 90,
        origin: { y: 0.6 },
        colors: ["#fda4af", "#fbcfe8", "#d8b4fe", "#bae6fd"],
      });
    } catch {}
  };

  return (
    /* Fills the section precisely — absolute inset so transforms don't affect measurement */
    <div
      className="absolute inset-0 flex flex-col items-center overflow-hidden px-3 sm:px-5"
      style={{
        paddingTop: "max(58px, calc(var(--sat, 0px) + 50px))",
        paddingBottom: "max(72px, calc(var(--sab, 0px) + 64px))",
      }}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-[#fbcfe8]/30 via-[#fed7aa]/20 to-[#d8b4fe]/25 rounded-full blur-[140px]" />

      {/* ── Letter Card ── fills height, scrolls internally on short screens */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-xl paper-card-warm rounded-2xl sm:rounded-3xl shadow-xl border border-[#ebdcd0] overflow-hidden flex flex-col"
        style={{ flex: "1 1 0", minHeight: 0 }}
      >
        <div className="washi-tape-pink shrink-0" />

        {/* Botanical corners */}
        <FloralCorner
          className="absolute top-2 left-2 pointer-events-none opacity-30 z-10"
          size={24}
          color="#86efac"
          flowerColor="#fda4af"
        />
        <FloralCorner
          className="absolute bottom-[72px] right-2 pointer-events-none opacity-30 rotate-180 z-10"
          size={24}
          color="#86efac"
          flowerColor="#d8b4fe"
        />

        {/* ── Sticky top header ── */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-5 pt-3 pb-2.5 border-b border-[#ebdcd0] bg-[#fffaf7]/90 backdrop-blur-sm">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-handwriting text-base sm:text-lg text-[#786457] truncate">
              To: Anshika 💌
            </span>
            <span className="hidden sm:inline text-[10px] text-[#a89687] font-sans">
              October 28, 2026
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-sans text-[#786457] hover:text-[#3f2e24] bg-[#f5ede4] hover:bg-[#ebdcd0] border border-[#e3d3c4] transition-colors cursor-pointer ml-2"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-[#10b981]" />
                <span className="text-[#065f46] font-medium">Saved!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-[#8c7465]" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>

        {/* ── Scrollable body — entire letter visible at once ── */}
        <div
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-4"
          style={{
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
          } as React.CSSProperties}
        >
          {/* Salutation */}
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="font-handwriting text-2xl sm:text-3xl font-bold text-[#be185d] mb-1"
          >
            Dear Anshika,
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-[11px] sm:text-sm text-[#3f2e24] font-sans font-semibold mb-3 sm:mb-4"
          >
            Happy 19th Birthday.
          </motion.p>

          {/* All paragraphs shown at once, staggered fade-in */}
          <div className="space-y-3 sm:space-y-3.5">
            {PARAGRAPHS.map((para, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.08, duration: 0.45, ease: "easeOut" }}
                className={`font-sans leading-relaxed text-[#3f2e24] ${
                  i === PARAGRAPHS.length - 1
                    ? "text-[11px] sm:text-xs italic opacity-80"  // P.S. style
                    : "text-[12px] sm:text-[13px]"
                }`}
              >
                {para}
              </motion.p>
            ))}
          </div>

          {/* Sign-off */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="flex items-end justify-between mt-4 pt-3 border-t border-[#f0e4da]"
          >
            <div>
              <span className="font-handwriting text-lg sm:text-xl font-bold text-[#3f2e24] block leading-tight">
                &mdash; Anuj
              </span>
              <span className="text-[10px] text-[#a89687] font-sans">
                28 October 2026
              </span>
            </div>
            <span className="text-2xl">🌸</span>
          </motion.div>

          {/* Bottom breathing room */}
          <div className="h-3" />
        </div>

        {/* ── Pinned CTA footer — always visible ── */}
        <div className="shrink-0 px-4 sm:px-5 py-2.5 sm:py-3 border-t border-[#ebdcd0] bg-[#fffaf7]/95 backdrop-blur-sm">
          {!taskDone ? (
            <motion.button
              onClick={handleUnlockFinal}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.4 }}
              className="w-full px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#fda4af] to-[#fb7185] hover:from-[#fb7185] hover:to-[#f43f5e] text-white font-sans font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2 btn-cute"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unlock Final Surprise 💌</span>
            </motion.button>
          ) : (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] text-[11px] font-sans font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                <span>Letter read! Final surprise unlocked ✓</span>
              </div>
              <button
                onClick={onNext}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#fda4af] to-[#fb7185] hover:from-[#fb7185] hover:to-[#f43f5e] text-white font-sans font-bold text-sm shadow-lg transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2 btn-cute"
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
