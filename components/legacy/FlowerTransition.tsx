"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, Lock, Heart } from "lucide-react";
import confetti from "canvas-confetti";
import { TulipFlower, DaisyFlower, Wildflower, BabysBreath, BotanicalSprig } from "@/components/flowers/FlowerSvg";

interface FlowerTransitionProps {
  isLocked: boolean;
  onUnlockSong: () => void;
  songUnlocked: boolean;
}

export default function FlowerTransition({
  isLocked,
  onUnlockSong,
  songUnlocked,
}: FlowerTransitionProps) {
  const [selectedFlower, setSelectedFlower] = useState<string | null>(songUnlocked ? "tulip" : null);
  const [taskDone, setTaskDone] = useState(songUnlocked);

  const handlePickFlower = (type: string) => {
    setSelectedFlower(type);
    if (!taskDone) {
      setTaskDone(true);
      onUnlockSong();
      try {
        confetti({
          particleCount: 50,
          spread: 75,
          origin: { y: 0.6 },
          colors: ["#fda4af", "#d8b4fe", "#bae6fd", "#fef08a", "#86efac"],
        });
      } catch {}
    }
  };

  if (isLocked) {
    return (
      <section id="flowers" className="py-16 px-4 max-w-4xl mx-auto text-center select-none">
        <div className="p-8 rounded-3xl bg-[#f5ede4] border border-[#e3d3c4] max-w-md mx-auto space-y-2">
          <div className="w-10 h-10 rounded-full bg-[#ebdcd0] flex items-center justify-center mx-auto text-[#786457]">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-handwriting text-2xl font-bold text-[#4a3528]">
            Flower Garden Locked
          </h3>
          <p className="text-xs text-[#786457] font-sans">
            Find the 3 hidden hearts on the polaroids above to unlock this garden! 💖
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="flowers" className="relative py-20 px-4 sm:px-6 max-w-4xl mx-auto select-none text-center">
      {/* Background Soft Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-[#fed7aa]/20 via-[#fbcfe8]/20 to-[#d8b4fe]/20 rounded-full blur-[130px] pointer-events-none" />

      {/* Scrapbook Container */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="paper-card-warm rounded-3xl p-8 sm:p-12 relative shadow-lg border border-[#ebdcd0]"
      >
        <div className="washi-tape-yellow" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fdf2f4] border border-[#fbcfe8] text-[#be185d] font-sans text-xs mb-3 shadow-2xs">
          <span>🌸</span>
          <span>Botanical Garden</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold font-handwriting text-[#3f2e24]">
          A Flower for Year 19
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[#6b5546] max-w-md mx-auto font-sans">
          Flowers don&apos;t hurry, yet they bloom right on time.
        </p>

        {/* Task 03: Pick your bouquet flower */}
        <div className="mt-8 max-w-md mx-auto p-5 rounded-2xl bg-[#fff9f3] border border-[#eddccc]">
          <div className="text-xs font-handwriting text-xl text-[#b45309] mb-1">
            Task 03: Pick a flower for your birthday bouquet 🌷
          </div>
          <p className="text-xs text-[#786457] font-sans mb-4">
            Select which blossom fits your mood for today:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: "tulip", name: "Tulip", component: <TulipFlower size={42} color="#fda4af" accentColor="#f43f5e" /> },
              { id: "daisy", name: "Daisy", component: <DaisyFlower size={38} color="#fffbeb" accentColor="#fef08a" /> },
              { id: "wildflower", name: "Wildflower", component: <Wildflower size={36} color="#d8b4fe" accentColor="#c084fc" /> },
              { id: "breath", name: "Baby's Breath", component: <BabysBreath size={40} branchColor="#86efac" /> },
            ].map((f) => (
              <motion.button
                key={f.id}
                onClick={() => handlePickFlower(f.id)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  selectedFlower === f.id
                    ? "bg-[#fff0f3] border-[#f43f5e] shadow-sm"
                    : "bg-white border-[#ebdcd0] hover:border-[#fda4af]"
                }`}
              >
                <div className="h-12 flex items-center justify-center">
                  {f.component}
                </div>
                <span className="text-xs font-sans font-medium text-[#4a3528]">
                  {f.name}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Visual Bouquet Display */}
        <div className="mt-8 flex items-center justify-center gap-4 sm:gap-6 py-4">
          <div className="animate-flower-sway">
            <TulipFlower size={56} color="#fda4af" accentColor="#f43f5e" />
          </div>
          <div className="animate-flower-sway-slow">
            <DaisyFlower size={52} color="#fffbeb" accentColor="#fef08a" />
          </div>
          <div className="animate-flower-sway">
            <Wildflower size={50} color="#d8b4fe" accentColor="#c084fc" />
          </div>
          <div className="hidden sm:block">
            <BabysBreath size={52} branchColor="#86efac" />
          </div>
        </div>

        {/* Task 03 Completion Feedback */}
        <div className="mt-6 max-w-md mx-auto">
          {taskDone && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] flex flex-col items-center gap-1 text-[#065f46]"
            >
              <div className="flex items-center gap-1.5 font-sans font-semibold text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                <span>TASK 03 COMPLETE ✓</span>
              </div>
              <p className="text-xs font-sans text-[#047857]">
                &ldquo;Bas itna sa kaam hai 😭 System surprisingly survived.&rdquo;
              </p>
              <span className="text-[11px] text-[#059669] font-sans mt-0.5 font-medium">
                Scrapbook Cassette & Songs Unlocked Below ↓
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
