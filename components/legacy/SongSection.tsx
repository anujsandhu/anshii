"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Music2, Play, Pause, CheckCircle2, Lock, Sparkles, Disc3 } from "lucide-react";
import confetti from "canvas-confetti";
import { SCRAPBOOK_PLAYLIST, SongTrack } from "../MusicPlayer";

interface SongSectionProps {
  isLocked: boolean;
  onUnlockMemories: () => void;
  memoriesUnlocked: boolean;
  activeTrackIndex: number;
  onSelectTrack: (index: number) => void;
}

export default function SongSection({
  isLocked,
  onUnlockMemories,
  memoriesUnlocked,
  activeTrackIndex,
  onSelectTrack,
}: SongSectionProps) {
  const [taskDone, setTaskDone] = useState(memoriesUnlocked);

  const handleTrackSelect = (index: number) => {
    onSelectTrack(index);
    if (!taskDone) {
      setTaskDone(true);
      onUnlockMemories();
      try {
        confetti({
          particleCount: 45,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#fda4af", "#d8b4fe", "#bae6fd", "#fed7aa"],
        });
      } catch {}
    }
  };

  if (isLocked) {
    return (
      <section id="song" className="py-16 px-4 max-w-4xl mx-auto text-center select-none">
        <div className="p-8 rounded-3xl bg-[#f5ede4] border border-[#e3d3c4] max-w-md mx-auto space-y-2">
          <div className="w-10 h-10 rounded-full bg-[#ebdcd0] flex items-center justify-center mx-auto text-[#786457]">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-handwriting text-2xl font-bold text-[#4a3528]">
            Mixtape Section Locked
          </h3>
          <p className="text-xs text-[#786457] font-sans">
            Pick a bouquet flower in the section above to unlock the birthday soundtrack! 🌸
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="song" className="relative py-20 px-4 sm:px-6 max-w-4xl mx-auto select-none">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-[#bae6fd]/20 via-[#fbcfe8]/20 to-[#fed7aa]/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Paper Scrapbook Card */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="paper-card-warm rounded-3xl p-8 sm:p-12 relative shadow-lg border border-[#ebdcd0]"
      >
        <div className="washi-tape-pink" />

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f0f9ff] border border-[#bae6fd] text-[#0369a1] font-sans text-xs mb-3 shadow-2xs">
            <Music2 className="w-3.5 h-3.5 text-[#0284c7]" />
            <span>The Birthday Mixtape</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold font-handwriting text-[#3f2e24]">
            Soundtrack for Year 19
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#6b5546] max-w-md mx-auto font-sans">
            Seven songs for seven moods throughout this little birthday journey. Tap any track to play!
          </p>

          <div className="mt-4 text-xs text-[#a0897a] font-sans">
            Task 04: Select your favorite tune to unlock the memory chapter 🎵
          </div>
        </div>

        {/* Cassette Mixtape Track List Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {SCRAPBOOK_PLAYLIST.map((track, idx) => {
            const isCurrent = activeTrackIndex === idx;

            return (
              <motion.div
                key={track.id}
                onClick={() => handleTrackSelect(idx)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isCurrent
                    ? "bg-[#fff0f3] border-[#f43f5e] shadow-sm"
                    : "bg-white border-[#ebdcd0] hover:border-[#fda4af]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isCurrent
                        ? "bg-[#fda4af] text-[#be185d]"
                        : "bg-[#f5ede4] text-[#786457]"
                    }`}
                  >
                    {isCurrent ? <Disc3 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </div>

                  <div className="flex flex-col min-w-0 text-left">
                    <span className="text-xs sm:text-sm font-sans font-bold text-[#3f2e24] truncate">
                      {idx + 1}. {track.title}
                    </span>
                    <span className="text-[11px] text-[#8c7465] font-sans truncate">
                      {track.artist}
                    </span>
                    <span className="text-[10px] text-[#b45309] font-sans mt-0.5 truncate">
                      {track.vibe}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-[#a0897a] px-2 py-1 rounded-md bg-[#faf7f2] shrink-0 border border-[#ebdcd0]">
                  {track.section}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Task 04 Completion Notification */}
        <div className="mt-8 text-center max-w-md mx-auto">
          {taskDone && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] flex flex-col items-center gap-1 text-[#065f46]"
            >
              <div className="flex items-center gap-1.5 font-sans font-semibold text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                <span>TASK 04 COMPLETE ✓</span>
              </div>
              <p className="text-xs font-sans text-[#047857]">
                &ldquo;Tune locked in! Soundtrack harmonized with the day.&rdquo;
              </p>
              <span className="text-[11px] text-[#059669] font-sans mt-0.5 font-medium">
                Memory Section & CS Easter Egg Unlocked Below ↓
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
