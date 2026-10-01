"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Music2, Play, Disc3, CheckCircle2, ArrowDown, Clock } from "lucide-react";
import confetti from "canvas-confetti";
import { BIRTHDAY_SOUNDTRACKS } from "@/data/musicConfig";

interface Frame4SongProps {
  isCompleted: boolean;
  onCompleteTask: () => void;
  onNext: () => void;
  activeTrackIndex: number;
  onSelectTrack: (index: number) => void;
}

export default function Frame4Song({
  isCompleted,
  onCompleteTask,
  onNext,
  activeTrackIndex,
  onSelectTrack,
}: Frame4SongProps) {
  const [taskDone, setTaskDone] = useState(isCompleted);

  React.useEffect(() => {
    setTaskDone(isCompleted);
  }, [isCompleted]);

  const handlePickTrack = (index: number) => {
    onSelectTrack(index);
    if (!taskDone) {
      setTaskDone(true);
      onCompleteTask();
      try {
        confetti({
          particleCount: 50,
          spread: 75,
          origin: { y: 0.6 },
          colors: ["#fda4af", "#d8b4fe", "#bae6fd", "#fed7aa"],
        });
      } catch {}
    }
  };

  const formatSecs = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center px-3 sm:px-6 select-none overflow-y-auto overflow-x-hidden no-scrollbar pt-[max(58px,calc(var(--sat)+50px))] pb-[max(72px,calc(var(--sab)+64px))]">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-[#bae6fd]/20 via-[#fbcfe8]/20 to-[#fed7aa]/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-xl paper-card-warm rounded-3xl relative shadow-lg border border-[#ebdcd0] z-10 my-auto p-3.5 sm:p-6"
      >
        <div className="washi-tape-pink" />

        <div className="text-center mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#f0f9ff] border border-[#bae6fd] text-[#0369a1] font-sans text-xs mb-1 shadow-2xs">
            <Music2 className="w-3.5 h-3.5 text-[#0284c7]" />
            <span>The Birthday Mixtape</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-handwriting text-[#3f2e24]">
            Soundtrack for Year 19
          </h2>
          <p className="text-xs text-[#786457] font-sans">
            Task: Choose your favorite track to set the birthday mood! 🎵
          </p>
        </div>

        {/* 8 Songs — always 2-col, compact rows, no overflow scroll */}
        <div className="grid grid-cols-2 gap-1.5">
          {BIRTHDAY_SOUNDTRACKS.map((track, idx) => {
            const isCurrent = activeTrackIndex === idx;

            return (
              <motion.div
                key={track.id}
                onClick={() => handlePickTrack(idx)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                  isCurrent
                    ? "bg-[#fff0f3] border-[#f43f5e] shadow-xs"
                    : "bg-white border-[#ebdcd0] hover:border-[#fda4af]"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    isCurrent
                      ? "bg-[#fda4af] text-[#be185d]"
                      : "bg-[#f5ede4] text-[#786457]"
                  }`}
                >
                  {isCurrent ? (
                    <Disc3 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Play className="w-2.5 h-2.5 ml-0.5" />
                  )}
                </div>

                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-[11px] font-sans font-bold text-[#3f2e24] truncate leading-tight">
                    {idx + 1}. {track.title}
                  </span>
                  <span className="text-[9px] text-[#8c7465] font-sans truncate">
                    {track.movieOrArtist}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Task Completion Bar */}
        <div className="mt-3.5 text-center">
          {!taskDone ? (
            <span className="text-xs text-[#8c7465] font-sans">
              (Tap any track above to play and complete this task!)
            </span>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-2.5 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] flex flex-col items-center gap-1 text-[#065f46]"
            >
              <div className="flex items-center gap-1.5 font-sans font-semibold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                <span>TASK COMPLETE ✓ Soundtrack Chosen</span>
              </div>
              <p className="text-[11px] font-sans text-[#047857]">
                &ldquo;Tune locked in! Soundtrack harmonized with the day.&rdquo;
              </p>
              <button
                onClick={onNext}
                className="mt-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-[#fda4af] to-[#fb7185] hover:from-[#fb7185] hover:to-[#f43f5e] text-white font-sans font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 btn-cute"
              >
                <span>Continue to Memories</span>
                <span className="text-base leading-none">↓</span>
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
