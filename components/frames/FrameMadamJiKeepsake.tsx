"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  Pencil,
  CheckCircle2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { FloralCorner } from "@/components/flowers/FloralFrame";
import { getAnonymousSessionId, trackEvent } from "@/lib/analyticsClient";

interface FrameMadamJiKeepsakeProps {
  isCompleted: boolean;
  onCompleteTask: () => void;
  onNext: () => void;
}

export interface MadamJiAnswers {
  memory: string;
  bond: string;
  futureMessage: string;
  anythingSecret: string;
}

interface QuestionStep {
  id: keyof MadamJiAnswers;
  number: string;
  badge: string;
  shortLabel: string;
  icon: string;
  question: string;
  placeholder: string;
  hint: string;
}

const STORAGE_KEY = "anshii_madam_ji_answers";

const QUESTIONS: QuestionStep[] = [
  {
    id: "memory",
    number: "01",
    badge: "01 — A memory",
    shortLabel: "Memory",
    icon: "📸",
    question: "What's one memory with me that you would want to keep?",
    placeholder: "A conversation, a late night chat, a joke, a shared moment… whatever you never want to forget.",
    hint: "Every memory with you matters.",
  },
  {
    id: "bond",
    number: "02",
    badge: "02 — Our little bond",
    shortLabel: "Our bond",
    icon: "🤍",
    question: "What's one thing you genuinely like about our bond?",
    placeholder: "Something honest about talking to each other, how it feels, or what makes it special to you…",
    hint: "Be completely honest.",
  },
  {
    id: "futureMessage",
    number: "03",
    badge: "03 — A message to future us",
    shortLabel: "Future us",
    icon: "⏳",
    question: "Imagine we're reading this a year from now. What would you want to say?",
    placeholder: "To us, 365 days from today… what do you hope for us?",
    hint: "For our future selves to look back on.",
  },
  {
    id: "anythingSecret",
    number: "04",
    badge: "04 — Anything, just between us",
    shortLabel: "Secret",
    icon: "🤫",
    question: "Anything you've wanted to tell me but haven't found the right moment for?",
    placeholder: "Anything you never said out loud… completely just between you and me.",
    hint: "Just between us, safe in our vault.",
  },
];

export default function FrameMadamJiKeepsake({
  isCompleted,
  onCompleteTask,
  onNext,
}: FrameMadamJiKeepsakeProps) {
  const [answers, setAnswers] = useState<MadamJiAnswers>({
    memory: "",
    bond: "",
    futureMessage: "",
    anythingSecret: "",
  });
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [nudgeError, setNudgeError] = useState("");

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing answers on mount
  useEffect(() => {
    try {
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        setAnswers((prev) => ({ ...prev, ...parsed }));

        const allDone = QUESTIONS.every(
          (q) => Boolean(parsed[q.id]?.trim()?.length >= 2)
        );
        if (allDone || isCompleted) {
          setShowSummary(true);
        }
      } else if (!isCompleted) {
        setShowSummary(false);
        setCurrentStepIndex(0);
      }
    } catch {}
  }, [isCompleted]);

  // Save answers to Firestore & localStorage
  const saveAnswers = useCallback(
    async (newAnswers: MadamJiAnswers) => {
      try {
        setSaveStatus("saving");
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newAnswers));

        const sessionId = getAnonymousSessionId();
        const res = await fetch("/api/madam-ji-note", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            answers: newAnswers,
          }),
          keepalive: true,
        });

        if (res.ok) {
          setSaveStatus("saved");
        } else {
          setSaveStatus("idle");
        }
      } catch (e) {
        console.error("Save madam ji answers error:", e);
        setSaveStatus("idle");
      }
    },
    []
  );

  // Real-time debounced auto-save as she types
  const handleAnswerChange = (field: keyof MadamJiAnswers, value: string) => {
    const updated = { ...answers, [field]: value };
    setAnswers(updated);
    if (nudgeError) setNudgeError("");

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      saveAnswers(updated);
    }, 700);
  };

  const currentQuestion = QUESTIONS[currentStepIndex];

  // Next / Continue button handler (mandatory check removed for production phase)
  const handleNextQuestion = () => {
    setNudgeError("");
    saveAnswers(answers);

    if (currentStepIndex < QUESTIONS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Completed all questions!
      setShowSummary(true);
      onCompleteTask();

      trackEvent({
        type: "madam_ji_note",
        page: "madam_ji_keepsake",
        elementText: "Madam Ji Keepsake Completed",
        metadata: {
          hasMemory: Boolean(answers.memory?.trim()),
          hasBond: Boolean(answers.bond?.trim()),
          hasFutureMessage: Boolean(answers.futureMessage?.trim()),
          hasSecret: Boolean(answers.anythingSecret?.trim()),
        },
      });

      try {
        confetti({
          particleCount: 120,
          spread: 110,
          origin: { y: 0.6 },
          colors: ["#fda4af", "#fbcfe8", "#d8b4fe", "#bae6fd", "#fed7aa", "#86efac"],
        });
      } catch {}
    }
  };

  const handlePrevQuestion = () => {
    setNudgeError("");
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSelectStep = (index: number) => {
    setNudgeError("");
    setShowSummary(false);
    setCurrentStepIndex(index);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center px-4 sm:px-8 select-none overflow-hidden pt-12 pb-14">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[680px] h-[340px] sm:h-[680px] bg-gradient-to-tr from-[#fed7aa]/25 via-[#fbcfe8]/25 to-[#d8b4fe]/20 rounded-full blur-[140px] pointer-events-none" />

      {/* ── UNIFIED KEEPSAKE CARD (LARGE SCREEN OPTIMIZED) ── */}
      <motion.div
        data-card="true"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-2xl lg:max-w-3xl paper-card-warm rounded-3xl border-2 border-[#ebdcd0] shadow-2xl flex flex-col my-auto p-6 sm:p-8"
      >
        <div className="washi-tape-pink shrink-0 !top-1" />

        {/* Botanical corners for warm scrapbook aesthetic */}
        <FloralCorner
          className="absolute top-3 left-3 pointer-events-none opacity-30 z-0"
          size={26}
          color="#86efac"
          flowerColor="#fda4af"
        />
        <FloralCorner
          className="absolute top-3 right-3 pointer-events-none opacity-30 rotate-90 z-0"
          size={26}
          color="#86efac"
          flowerColor="#d8b4fe"
        />

        {/* ── TOP SECTION: FIXED HEADER & SUBTITLE ── */}
        <div className="shrink-0 text-center relative z-10 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#fef3c7] border border-[#fde68a] text-[#b45309] font-sans text-xs font-semibold shadow-2xs mb-1.5">
            <span>🤍</span>
            <span>Chapter 08 • Keepsake From You</span>
          </div>

          <h2 className="font-handwriting text-3xl sm:text-4xl font-bold text-[#3f2e24] leading-tight">
            Before You Go, Madam Ji…
          </h2>

          <p className="mt-1 font-handwriting text-sm sm:text-base text-[#786457] leading-relaxed max-w-lg mx-auto">
            I&apos;ve written quite a lot about you. Now I&apos;d love to keep a little something written by you, too. 🤍
          </p>
        </div>

        {/* ── STEPPER PILLS: FIXED HEIGHT, NEVER JITTERS ── */}
        <div className="shrink-0 flex items-center justify-between gap-1.5 sm:gap-2 my-2 px-1 relative z-10">
          {QUESTIONS.map((q, idx) => {
            const isFilled = Boolean(answers[q.id]?.trim()?.length >= 2);
            const isCurrent = currentStepIndex === idx && !showSummary;

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => handleSelectStep(idx)}
                className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-1.5 sm:px-2.5 rounded-xl text-xs font-sans font-bold transition-all duration-200 cursor-pointer ${
                  isCurrent
                    ? "bg-[#3f2e24] text-white shadow-xs scale-102"
                    : isFilled
                    ? "bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] hover:bg-[#d1fae5]"
                    : "bg-[#f5ede4]/70 border border-[#e3d3c4] text-[#8c7465] hover:bg-[#f5ede4]"
                }`}
                title={`Question ${q.number}: ${q.badge}`}
              >
                <span className="text-sm shrink-0">{q.icon}</span>
                <span className="truncate text-[11px] sm:text-xs font-semibold">
                  {q.shortLabel}
                </span>
                {isFilled && <Check className="w-3 h-3 text-[#10b981] stroke-[2.5] shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* ── MIDDLE WORKSPACE (STABLE, FIXED-HEIGHT CANVASES) ── */}
        <div className="flex-1 min-h-0 relative z-10 flex flex-col justify-center">
          {!showSummary ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="w-full flex flex-col justify-between h-full py-1"
              >
                {/* Question Details */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-bold text-[11px] sm:text-xs text-[#be185d] tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#fff0f3] border border-[#fbcfe8]">
                      {currentQuestion.badge}
                    </span>
                  </div>
                  <span className="text-[11px] font-sans text-[#8c7465]">
                    Question {currentStepIndex + 1} of {QUESTIONS.length}
                  </span>
                </div>

                <h3 className="font-sans font-bold text-xs sm:text-base lg:text-lg text-[#3f2e24] mb-1 leading-snug">
                  {currentQuestion.question}
                </h3>

                <p className="text-[11px] sm:text-xs text-[#8c7465] font-sans mb-2">
                  {currentQuestion.hint}
                </p>

                {/* Textarea — fitted in one frame with no scrolling */}
                <textarea
                  value={answers[currentQuestion.id]}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  className="w-full h-28 sm:h-32 resize-none p-3.5 sm:p-4 text-sm sm:text-base font-handwriting text-[#3f2e24] bg-[#faf7f2]/95 border-2 border-[#eddccc] rounded-2xl outline-hidden focus:border-[#fda4af] focus:bg-white placeholder:text-[#a89080]/70 shadow-inner leading-relaxed overflow-hidden"
                />

                {/* Nudge Error if empty on Next */}
                {nudgeError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-1.5 mt-1 rounded-xl bg-[#fff1f2] border border-[#fecdd3] text-[#be123c] text-[11px] font-sans text-center font-medium shadow-2xs"
                  >
                    {nudgeError}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            /* ── ALL QUESTIONS COMPLETED SUMMARY VIEW (2x2 GRID, ZERO SCROLL) ── */
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full flex flex-col justify-between py-1"
            >
              <div className="p-3 rounded-2xl bg-[#ecfdf5] border-2 border-[#a7f3d0] text-center text-[#065f46]">
                <div className="w-8 h-8 rounded-full bg-[#d1fae5] flex items-center justify-center mx-auto mb-1 text-base">
                  💌
                </div>
                <h4 className="font-handwriting text-2xl font-bold leading-tight">
                  All 4 Keepsakes Sealed in Our Vault Forever 🤍
                </h4>
                <p className="text-xs font-sans mt-0.5 text-[#047857]">
                  Thank you for sharing your honest words with me, Anshika.
                </p>
              </div>

              {/* 2x2 Grid of her 4 answers — ZERO SCROLL, fits in one frame */}
              <div className="grid grid-cols-2 gap-2 my-2">
                {QUESTIONS.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-2.5 rounded-xl bg-[#fffdfa] border border-[#ebdcd0] shadow-2xs flex flex-col justify-between min-h-[58px]"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-sans font-bold text-[10px] text-[#be185d]">
                        {q.badge}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentStepIndex(idx);
                          setShowSummary(false);
                        }}
                        className="text-[10px] text-[#786457] hover:text-[#3f2e24] underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Pencil className="w-2.5 h-2.5" />
                        <span>Edit</span>
                      </button>
                    </div>
                    <p className="font-sans text-[11px] text-[#3f2e24] font-medium leading-relaxed italic line-clamp-2">
                      &ldquo;{answers[q.id] || "—"}&rdquo;
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAnswers({
                      memory: "",
                      bond: "",
                      futureMessage: "",
                      anythingSecret: "",
                    });
                    setCurrentStepIndex(0);
                    setShowSummary(false);
                    try {
                      localStorage.removeItem(STORAGE_KEY);
                    } catch {}
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-[#9f1239] border border-rose-200 text-xs font-sans font-semibold transition-all cursor-pointer"
                >
                  Clear &amp; Rewrite
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-[#fda4af] to-[#fb7185] hover:from-[#fb7185] hover:to-[#f43f5e] text-white font-sans font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 btn-cute"
                >
                  <span>Continue to Grand Finale</span>
                  <span className="text-base leading-none">↓</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── BOTTOM CONTROLS FOOTER: FIXED PINNED BAR ── */}
        <div className="shrink-0 pt-2 border-t border-[#f0e4da] relative z-10 flex flex-col gap-1.5">
          {!showSummary && (
            <div className="flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={handlePrevQuestion}
                disabled={currentStepIndex === 0}
                className="px-3.5 py-2 rounded-xl bg-[#f5ede4] hover:bg-[#ebdcd0] disabled:opacity-30 disabled:cursor-not-allowed border border-[#e3d3c4] text-[#4a3528] font-sans text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <div className="text-[10px] sm:text-[11px] font-sans text-[#8c7465] text-center">
                {saveStatus === "saving" ? (
                  <span className="inline-flex items-center gap-1">
                    <Loader2 className="w-2.5 h-2.5 animate-spin text-[#be185d]" />
                    <span>Saving...</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[#065f46]">
                    <CheckCircle2 className="w-3 h-3 text-[#10b981]" />
                    <span>Auto-saved ✓</span>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-5 py-2 rounded-xl font-sans font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 btn-cute bg-gradient-to-r from-[#fda4af] to-[#fb7185] hover:from-[#fb7185] hover:to-[#f43f5e] text-white"
              >
                <span>
                  {currentStepIndex === QUESTIONS.length - 1
                    ? "Seal All 4 Keepsakes 💌"
                    : "Next Question"}
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="text-center">
            <span className="text-[10px] sm:text-[11px] font-handwriting text-[#be185d] font-bold">
              No perfect answers needed. Just your honest words. 🌸
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
