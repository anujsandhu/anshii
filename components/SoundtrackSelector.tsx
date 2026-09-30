"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Music, CheckCircle2, Disc, Play } from "lucide-react";
import { birthdayData } from "@/data/birthday";

interface SoundtrackSelectorProps {
  onSelectTrack: (track: { title: string; artist: string; src: string }) => void;
  onComplete: () => void;
  isCompleted: boolean;
}

export default function SoundtrackSelector({
  onSelectTrack,
  onComplete,
  isCompleted,
}: SoundtrackSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(isCompleted ? "track-1" : null);

  const playlist = birthdayData.music.playlist;

  const handleSelect = (item: (typeof playlist)[0]) => {
    setSelectedId(item.id);
    onSelectTrack({ title: item.title, artist: item.artist, src: item.src });
    onComplete();
  };

  return (
    <div className="py-6 px-4 max-w-xl mx-auto text-center select-none">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-panel p-5 sm:p-6 rounded-3xl border border-indigo-500/25 shadow-xl relative overflow-hidden flex flex-col items-center justify-center space-y-3"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 font-mono text-[11px]">
          <Music className="w-3 h-3 text-indigo-400" />
          <span>TASK 05 // SOUNDTRACK_SELECTION</span>
        </div>

        <div>
          <h4 className="text-base sm:text-lg font-bold text-white font-sans">
            Choose the Next Soundtrack
          </h4>
          <p className="text-xs sm:text-sm text-zinc-400 font-sans mt-0.5">
            Pick your ambient vibe while exploring the rest of the website:
          </p>
        </div>

        {/* 3 Song Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full pt-1">
          {playlist.map((track) => {
            const isSelected = selectedId === track.id;
            return (
              <motion.button
                key={track.id}
                onClick={() => handleSelect(track)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected
                    ? "bg-cyan-500/20 border-cyan-400 shadow-md shadow-cyan-500/20"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Disc className={`w-4 h-4 ${isSelected ? "text-cyan-400 animate-spin" : "text-zinc-500"}`} />
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                </div>
                <div className="font-mono text-xs font-semibold text-white truncate">
                  {track.title}
                </div>
                <div className="text-[10px] text-zinc-400 font-sans mt-1 line-clamp-2">
                  {track.vibe}
                </div>
              </motion.button>
            );
          })}
        </div>

        {selectedId && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 pt-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>&ldquo;Good choice. Soundtrack updated.&rdquo;</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
