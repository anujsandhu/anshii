"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Code2, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface Frame5MemoryProps {
  isCompleted: boolean;
  onCompleteTask: () => void;
  onNext: () => void;
}

// ─── Quiz Data ────────────────────────────────────────────────────────────────
interface Question {
  id: number;
  tag: string;
  tagColor: string;
  question: string;
  options: string[];
  correct: number; // 0-indexed
  correctReaction: string;
  wrongReaction: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    tag: "HTML",
    tagColor: "bg-[#fde68a] text-[#92400e] border-[#fcd34d]",
    question: "Which HTML tag is used to create a hyperlink?",
    options: ["<link>", "<a>", "<href>", "<url>"],
    correct: 1,
    correctReaction: "Okayyy developer detected. 🌸",
    wrongReaction: "Madam 😭 please revise. It's <a>, not that one.",
  },
  {
    id: 2,
    tag: "CSS",
    tagColor: "bg-[#bae6fd] text-[#075985] border-[#7dd3fc]",
    question: "Which CSS property changes the background color?",
    options: ["color", "bg-color", "background-color", "background"],
    correct: 2,
    correctReaction: "Ye toh easy tha yaar 😭 Topper confirmed.",
    wrongReaction: "Madam 😭 It's background-color. bg-color toh exist hi nahi karta.",
  },
  {
    id: 3,
    tag: "PHP",
    tagColor: "bg-[#d8b4fe] text-[#6b21a8] border-[#c084fc]",
    question: "Which symbol is used before a variable name in PHP?",
    options: ["#", "@", "$", "&"],
    correct: 2,
    correctReaction: "Anshika.exe still running. ✅ PHP unlocked.",
    wrongReaction: "Nahi yaar 😭 PHP mein $ lagate hain, like $variable. Note karo.",
  },
  {
    id: 4,
    tag: "Web",
    tagColor: "bg-[#bbf7d0] text-[#065f46] border-[#6ee7b7]",
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "High Text Machine Language",
      "Hyperlink Text Management Language",
      "Home Tool Markup Language",
    ],
    correct: 0,
    correctReaction: "First question of CS 101 and you nailed it. Respect. 🎓",
    wrongReaction: "Madam 😭 It stands for Hyper Text Markup Language. Semester 1 yaad hai?",
  },
  {
    id: 5,
    tag: "JS",
    tagColor: "bg-[#fda4af] text-[#881337] border-[#fb7185]",
    question: "What does console.log() commonly do in JavaScript?",
    options: [
      "Deletes the website",
      "Prints information to the console",
      "Creates HTML",
      "Starts the server",
    ],
    correct: 1,
    correctReaction: "5/5 incoming? Okayyy topper, respect. 🌷",
    wrongReaction: "Madam 😭 console.log() prints to console. Not deletes. Imagine 😂",
  },
];

// ─── Score messages ────────────────────────────────────────────────────────────
function getScoreMessage(score: number): { headline: string; sub: string } {
  if (score === 5) return { headline: "Okay topper, respect. 🎓", sub: "5/5. Anshika.exe has zero bugs." };
  if (score >= 3) return { headline: "Not bad, developer ji. 👩‍💻", sub: `${score}/5. Kuch aur practice kar lo.` };
  return { headline: "Birthday hai, exam nahi. You survived. 🎂", sub: `${score}/5. Cake milega phir bhi.` };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Frame5Memory({ isCompleted, onCompleteTask, onNext }: Frame5MemoryProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(5).fill(null));
  const [showReaction, setShowReaction] = useState(false);
  const [gameOver, setGameOver] = useState(isCompleted);
  const [score, setScore] = useState(0);
  const [taskDone, setTaskDone] = useState(isCompleted);
  // Use a ref to track running score synchronously (state updates are async and would read stale 0)
  const runningScoreRef = React.useRef(0);

  React.useEffect(() => {
    setTaskDone(isCompleted);
    setGameOver(isCompleted);
    if (!isCompleted) {
      runningScoreRef.current = 0;
    }
  }, [isCompleted]);

  const q = QUESTIONS[currentQ];
  const isCorrect = selectedAnswer !== null && selectedAnswer === q.correct;
  const reaction = selectedAnswer !== null
    ? (isCorrect ? q.correctReaction : q.wrongReaction)
    : "";

  const handleAnswer = (optionIdx: number) => {
    if (selectedAnswer !== null) return; // already answered
    setSelectedAnswer(optionIdx);
    setShowReaction(true);
    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIdx;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    // Increment running score synchronously via ref (state reads would be stale)
    if (selectedAnswer === q.correct) {
      runningScoreRef.current += 1;
    }

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ((p) => p + 1);
      setSelectedAnswer(null);
      setShowReaction(false);
    } else {
      // Game over — read final score from ref
      const finalScore = runningScoreRef.current;
      setScore(finalScore);
      setGameOver(true);
      if (!taskDone) {
        setTaskDone(true);
        onCompleteTask();
        try {
          confetti({
            particleCount: 80,
            spread: 90,
            origin: { y: 0.55 },
            colors: ["#fda4af", "#fbcfe8", "#d8b4fe", "#bae6fd", "#fed7aa", "#86efac"],
          });
        } catch {}
      }
    }
  };

  const scoreMsg = getScoreMessage(score);
  const progress = ((currentQ + (selectedAnswer !== null ? 1 : 0)) / QUESTIONS.length) * 100;

  // ── Completed state ─────────────────────────────────────────────────
  if (gameOver) {
    return (
      <div className="relative w-full h-full flex flex-col items-center px-3 sm:px-6 select-none overflow-y-auto overflow-x-hidden no-scrollbar pt-[max(58px,calc(var(--sat)+50px))] pb-[max(72px,calc(var(--sab)+64px))]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-[#fed7aa]/20 via-[#fbcfe8]/20 to-transparent rounded-full blur-[130px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md paper-card-warm p-5 sm:p-9 rounded-3xl relative shadow-xl border border-[#ebdcd0] z-10 text-center my-auto"
        >
          <div className="washi-tape-yellow" />

          {/* Score stars */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {QUESTIONS.map((_, i) => {
              const ans = answers[i];
              const ok = ans !== null && ans === QUESTIONS[i].correct;
              return (
                <motion.span
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.12, type: "spring", stiffness: 400, damping: 18 }}
                  className={`text-2xl ${ok ? "" : "grayscale opacity-40"}`}
                >
                  {ok ? "🌸" : "🌱"}
                </motion.span>
              );
            })}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] font-sans text-xs mb-3 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
            <span>WEB DEV TEST COMPLETE ✓</span>
          </div>

          <h2 className="font-handwriting text-3xl sm:text-4xl font-bold text-[#3f2e24] leading-tight mb-1">
            {scoreMsg.headline}
          </h2>
          <p className="text-sm text-[#786457] font-sans mb-4">{scoreMsg.sub}</p>

          <div className="p-3 rounded-2xl bg-[#fffaf5] border border-[#eddccc] flex items-center justify-between text-xs font-sans text-[#786457] mb-5">
            <span>Score</span>
            <span className="font-bold text-[#be185d] text-lg font-handwriting">{score} / 5</span>
            <span>{score === 5 ? "Perfect 🎉" : score >= 3 ? "Solid 👍" : "Participated 🎂"}</span>
          </div>

          <button
            onClick={onNext}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#fda4af] to-[#fb7185] hover:from-[#fb7185] hover:to-[#f43f5e] text-white font-sans font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 btn-cute"
          >
            <span>Continue to Handwritten Letter</span>
            <span className="text-base leading-none">↓</span>
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Active quiz ─────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-full flex flex-col items-center px-3 sm:px-6 select-none overflow-y-auto overflow-x-hidden no-scrollbar pt-[max(58px,calc(var(--sat)+50px))] pb-[max(72px,calc(var(--sab)+64px))]">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-[#fed7aa]/20 via-[#fbcfe8]/20 to-transparent rounded-full blur-[130px] pointer-events-none" />

      <motion.div
        key={currentQ}
        initial={{ opacity: 0, x: 28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg paper-card-warm rounded-3xl relative shadow-lg border border-[#ebdcd0] z-10 overflow-hidden my-auto p-3.5 sm:p-6"
      >
        <div className="washi-tape-yellow" />

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fef3c7] border border-[#fde68a] text-[#92400e] font-sans text-xs font-semibold">
            <Code2 className="w-3 h-3 text-[#d97706]" />
            <span>CS Mini Quiz</span>
          </div>
          <span className="text-xs font-mono text-[#a0897a]">
            {currentQ + 1} / {QUESTIONS.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-[#f0e4d6] rounded-full mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#fda4af] to-[#f43f5e] rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        {/* Question tag */}
        <div className="mb-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${q.tagColor}`}>
            {q.tag}
          </span>
        </div>

        {/* Question text */}
        <h2 className="font-handwriting text-lg sm:text-xl font-bold text-[#3f2e24] leading-snug mb-3">
          {q.question}
        </h2>

        {/* Options — always 1-col on mobile for large touch targets, 2-col on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2.5">
          {q.options.map((opt, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrectOpt = idx === q.correct;
            const revealed = selectedAnswer !== null;

            let optClass = "bg-white border-[#ebdcd0] text-[#3f2e24] hover:border-[#fda4af] hover:bg-[#fffaf5]";
            if (revealed) {
              if (isCorrectOpt) optClass = "bg-[#ecfdf5] border-[#10b981] text-[#065f46]";
              else if (isSelected && !isCorrectOpt) optClass = "bg-[#fdf2f4] border-[#f43f5e] text-[#9f1239]";
              else optClass = "bg-white border-[#ebdcd0] text-[#b49e91] opacity-60";
            }

            return (
              <motion.button
                key={idx}
                onClick={() => handleAnswer(idx)}
                whileHover={!revealed ? { scale: 1.02 } : {}}
                whileTap={!revealed ? { scale: 0.98 } : {}}
                className={`relative px-4 py-3 rounded-2xl border text-left font-sans font-medium transition-all duration-200 cursor-pointer leading-snug min-h-[48px] flex items-center text-sm ${optClass}`}
                disabled={revealed}
              >
                <span className="font-bold mr-2 font-mono text-[11px] shrink-0">
                  {String.fromCharCode(65 + idx)})
                </span>
                <span>{opt}</span>
                {revealed && isCorrectOpt && (
                  <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#10b981]" />
                )}
                {revealed && isSelected && !isCorrectOpt && (
                  <XCircle className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#f43f5e]" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Reaction message */}
        <AnimatePresence>
          {showReaction && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-3 rounded-2xl mb-3 text-xs font-sans leading-relaxed ${
                isCorrect
                  ? "bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46]"
                  : "bg-[#fff1f2] border border-[#fecdd3] text-[#9f1239]"
              }`}
            >
              <span className="font-semibold">
                {isCorrect ? "✓ Correct! " : "✗ Nope! "}
              </span>
              {reaction}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next button — only shows after answering */}
        <AnimatePresence>
          {selectedAnswer !== null && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="flex items-center justify-between"
            >
              {/* Mini score tracker */}
              <div className="flex gap-1">
                {Array.from({ length: currentQ + 1 }).map((_, i) => {
                  const ans = i < currentQ ? answers[i] : selectedAnswer;
                  const ok = ans !== null && ans === QUESTIONS[i].correct;
                  return (
                    <span key={i} className="text-sm">
                      {ok ? "🌸" : "🌱"}
                    </span>
                  );
                })}
              </div>

              <motion.button
                onClick={handleNext}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#fda4af] to-[#fb7185] hover:from-[#fb7185] hover:to-[#f43f5e] text-white font-sans font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{currentQ < QUESTIONS.length - 1 ? "Next Question" : "See Results ✨"}</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Idle hint */}
        {selectedAnswer === null && (
          <p className="text-[11px] text-[#a0897a] font-sans text-center mt-1">
            Tap an option to answer — it&apos;s okay if you don&apos;t know, birthday hai 🎂
          </p>
        )}
      </motion.div>
    </div>
  );
}
