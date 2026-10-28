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

const OPENING_PARAGRAPHS = [
  "I debated for a while whether to say any of this, but I figured your birthday is probably the one day where saying it is allowed.",
  "I'm not entirely sure when you went from someone I was just talking to, to someone I genuinely care about. There wasn't one specific moment. It was more like — you asked how my day was, and actually listened. We talked about college, family, plans, food, reels, life in general. And somewhere in all of that, without either of us really noticing, it started to feel comfortable.",
  "I appreciate that you check in. That when I'm overthinking something, you tell me to calm down. That you share parts of your life with me that aren't for everyone.",
];

const HEARTFELT_SECTION_TITLE = "A little more of what I never say out loud…";

const HEARTFELT_PARAGRAPHS = [
  "Anshika, there's something about you that I don't think I've ever been able to explain properly.",
  "Somewhere between our random conversations, the stupid jokes, the reels, the little arguments, and those moments when you somehow manage to make me smile without even trying… you became someone I genuinely don't want to lose.",
  "And honestly, it's a little unfair how effortlessly you can make my mood better. 😂🤍 One minute I'm overthinking a hundred things, and the next I'm smiling at my phone because of something you said. You probably don't even realize how often you do that.",
  "Sometimes I wish you could see yourself through my eyes, just for a moment. Maybe then you'd understand why I appreciate the little things about you so much. Your way of talking, your random thoughts, your caring side, and even those moments when you say something completely confusing and then act like it makes perfect sense. 😭😂",
  "And yes, madam ji, you can be quite annoying too. Don't let all these compliments get to your head. 🤌🏻😂 But somehow, even that has become part of what makes talking to you special.",
  "I know things between us aren't exactly what my heart might have wished for. I know what you've told me, and I respect it. I'm not writing this to change your mind or make you feel that you owe me something.",
  "But if I'm being completely honest, a part of me wishes I could keep you in my life for a very, very long time. Not just for the exciting days or the funny conversations, but for the ordinary ones too. The days when neither of us has anything interesting to say. The days when life feels heavy. The days when a simple “Kya haal hai?” is enough to make things feel a little less difficult.",
  "I don't know what life has planned for either of us. I can't promise that everything will always be easy, and I don't expect you to promise me anything either. But if life allows it, I'd love to be someone who gets to see you grow, celebrate your little victories, listen to your endless stories, tease you when you're being dramatic, and remind you of your worth when you forget it yourself.",
  "And if I'm being a little selfish for a second… yes, I wish I could be there for you for a lifetime. I wish we could collect years of memories, laugh about the embarrassing things we do today, and look back someday wondering how we ever had so much to talk about. Maybe that's a little too much dreaming, but you know me by now. My brain doesn't always know when to stop. 😭🤍",
  "Still, more than anything, I don't want my feelings to become a reason you feel uncomfortable around me. I don't want you to feel that you have to be someone you're not just to keep me around. You deserve to be yourself with me, completely and comfortably.",
  "I want you to know that the person I care about isn't some perfect version of you. It's you as you are. The happy you, the quiet you, the overthinking you, the random Korean-speaking you who somehow thinks saying “Annyeonghaseyo” makes her fluent. 😂🤌🏻",
  "So here's my birthday wish for you: I hope nineteen brings you peace in the places where you've been struggling, happiness that doesn't feel temporary, and people who make you feel safe enough to be yourself.",
  "And selfishly, I hope I get to remain one of the people who can make you smile sometimes.",
  "Happy birthday once again, Anshika. Keep that smile. Keep being your wonderfully confusing self. And please take care of the person you are, because she's more special than she probably realizes.",
];

const GOLDEN_QUOTE =
  "Some people become important through grand moments. You became important to me through a thousand little ones. And whatever life looks like from here, I'm genuinely glad our paths crossed. 🤍";

const PS_NOTE =
  "P.S. So… I hope the bracelet survived the opening without getting tangled. And yes, the teddy was mandatory. 🧸";

const FULL_TEXT = `Dear Anshika,

Happy 19th Birthday.

${OPENING_PARAGRAPHS.join("\n\n")}

### ${HEARTFELT_SECTION_TITLE}

${HEARTFELT_PARAGRAPHS.join("\n\n")}

${GOLDEN_QUOTE}

${PS_NOTE}

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
      className="absolute inset-0 flex flex-col items-center justify-start sm:justify-center overflow-y-auto overflow-x-hidden px-3 sm:px-6"
      style={{
        paddingTop: "max(52px, calc(var(--sat, 0px) + 44px))",
        paddingBottom: "max(52px, calc(var(--sab, 0px) + 44px))",
      }}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-[#fbcfe8]/30 via-[#fed7aa]/20 to-[#d8b4fe]/25 rounded-full blur-[140px]" />

      {/* ── Letter Card ── Two-page book spread fitted completely in one frame with ZERO scrolling */}
      <motion.div
        data-card="true"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-4xl lg:max-w-5xl paper-card-warm rounded-3xl shadow-[0_24px_60px_rgba(80,50,30,0.16)] border-2 border-[#ebdcd0] overflow-hidden flex flex-col my-auto p-4 sm:p-6 lg:p-7"
      >
        <div className="washi-tape-pink shrink-0 !top-1" />

        {/* Botanical corners */}
        <FloralCorner
          className="absolute top-2 left-2 pointer-events-none opacity-30 z-10"
          size={24}
          color="#86efac"
          flowerColor="#fda4af"
        />
        <FloralCorner
          className="absolute top-2 right-2 pointer-events-none opacity-30 rotate-90 z-10"
          size={24}
          color="#86efac"
          flowerColor="#d8b4fe"
        />

        {/* ── Top Header ── */}
        <div className="shrink-0 flex items-center justify-between pb-2.5 mb-2 border-b border-[#ebdcd0]/70">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#fff0f3] border border-[#fbcfe8] text-[#be185d] font-sans text-xs font-semibold shadow-2xs">
              <span>💌</span>
              <span>Chapter 07 • Handwritten Letter</span>
            </span>
            <span className="hidden sm:inline text-xs text-[#8c7465] font-sans border-l border-[#ebdcd0] pl-2">
              For Anshika, on her 19th Birthday ✨
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-sans text-[#786457] hover:text-[#3f2e24] bg-[#f5ede4] hover:bg-[#ebdcd0] border border-[#e3d3c4] transition-colors cursor-pointer ml-2 shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#10b981]" />
                <span className="text-[#065f46] font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#8c7465]" />
                <span>Copy full letter</span>
              </>
            )}
          </button>
        </div>

        {/* ── Two-Page Open Scrapbook Spread (Fitted in one frame, NO scroll) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 my-1">
          {/* ══ LEFT PAGE ══ */}
          <div className="flex flex-col justify-between p-3 sm:p-4 rounded-2xl bg-[#fffdfa] border border-[#ebdcd0]/70 shadow-2xs">
            <div>
              {/* Salutation */}
              <p className="font-handwriting text-2xl sm:text-3xl font-bold text-[#be185d] mb-0.5">
                Dear Anshika,
              </p>
              <p className="text-xs text-[#786457] font-sans font-semibold mb-2.5">
                Happy 19th Birthday 🌷
              </p>

              {/* Curated Letter Paragraphs — Part 1 */}
              <div className="space-y-2 text-xs sm:text-[13px] text-[#3f2e24] font-sans leading-relaxed">
                <p>
                  I debated for a while whether to say any of this, but I figured your birthday is probably the one day where saying it is allowed.
                </p>
                <p>
                  Somewhere between our random conversations, the stupid jokes, the reels, the little arguments, and those moments when you somehow manage to make me smile without even trying… you became someone I genuinely don&apos;t want to lose.
                </p>
                <p>
                  And honestly, it&apos;s a little unfair how effortlessly you can make my mood better. 😂🤍 One minute I&apos;m overthinking a hundred things, and the next I&apos;m smiling at my phone because of something you said.
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-[#f0e4da] flex items-center justify-between text-[10px] text-[#a0897a] font-sans">
              <span>Page 1 of 2</span>
              <span>Part I • The Beginning 🌸</span>
            </div>
          </div>

          {/* ══ RIGHT PAGE ══ */}
          <div className="flex flex-col justify-between p-3 sm:p-4 rounded-2xl bg-[#fffdfa] border border-[#ebdcd0]/70 shadow-2xs">
            <div>
              {/* Part 2 Paragraph */}
              <p className="text-xs sm:text-[13px] text-[#3f2e24] font-sans leading-relaxed mb-2.5">
                I want you to know that the person I care about isn&apos;t some perfect version of you. It&apos;s you as you are — the happy you, the quiet you, the overthinking you, the random Korean-speaking you who somehow thinks saying &ldquo;Annyeonghaseyo&rdquo; makes her fluent. 😂🤌🏻
              </p>

              {/* Golden Quote Card */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-[#fff0f3] via-[#fff5f7] to-[#fef2f2] border border-[#fbcfe8] text-[#881337] text-center my-2 shadow-2xs">
                <p className="font-handwriting text-sm sm:text-base font-bold leading-snug">
                  &ldquo;{GOLDEN_QUOTE}&rdquo;
                </p>
              </div>

              {/* P.S. Note */}
              <p className="text-[11px] sm:text-xs italic text-[#786457] opacity-90 mt-2">
                {PS_NOTE}
              </p>
            </div>

            {/* Sign-off */}
            <div className="mt-3 pt-2 border-t border-[#f0e4da] flex items-center justify-between">
              <div>
                <span className="font-handwriting text-base sm:text-lg font-bold text-[#3f2e24] block leading-tight">
                  &mdash; Anuj
                </span>
                <span className="text-[10px] text-[#a89687] font-sans">
                  28 October 2026
                </span>
              </div>
              <span className="text-xl">🌸</span>
            </div>
          </div>
        </div>

        {/* ── Action Buttons Footer (Pinned Inside Card) ── */}
        <div className="shrink-0 pt-2.5 mt-2 border-t border-[#ebdcd0]/70 flex items-center justify-between gap-2">
          {!taskDone ? (
            <motion.button
              onClick={handleUnlockFinal}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2.5 px-6 rounded-2xl bg-gradient-to-r from-[#fda4af] to-[#fb7185] hover:from-[#fb7185] hover:to-[#f43f5e] text-white font-sans font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 btn-cute"
            >
              <Sparkles className="w-4 h-4" />
              <span>Unlock Next Chapter 💌</span>
            </motion.button>
          ) : (
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] text-xs font-sans font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                <span>Letter read! Keepsake chapter unlocked ✓</span>
              </div>
              <button
                onClick={onNext}
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#fda4af] to-[#fb7185] hover:from-[#fb7185] hover:to-[#f43f5e] text-white font-sans font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer inline-flex items-center justify-center gap-2 btn-cute"
              >
                <span>Continue to Madam Ji&apos;s Keepsake</span>
                <span className="text-sm leading-none">↓</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
