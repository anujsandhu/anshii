"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Music, CheckCircle2, Disc } from "lucide-react";
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
        className="playful-birthday-card p-6 sm:p-7 rounded-3xl shadow-xl relative overflow-hidden flex flex-col items-center justify-center space-y-3.5 border border-sky-400/25"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-400/30 bg-sky-500/15 text-sky-200 font-sans text-xs">
          <Music className="w-3.5 h-3.5 text-sky-300" />
          <span>Soundtrack Selection</span>
        </div>

        <div>
          <h4 className="text-lg sm:text-xl font-bold text-white font-sans">
            Choose the Background Vibe
          </h4>
          <p className="text-xs sm:text-sm text-zinc-300 font-sans mt-1">
            Pick your ambient tune while you explore:
          </p>
        </div>

        {/* 3 Song Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full pt-1">
          {playlist.map((track) => {
            const isSelected = selectedId === track.id;
            return (
              <motion.button
                key={track.id}
                onClick={() => handleSelect(track)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer shadow-md ${
                  isSelected
                    ? "bg-sky-500/25 border-sky-300 shadow-sky-500/20 text-white"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Disc className={`w-4 h-4 ${isSelected ? "text-sky-300 animate-spin" : "text-zinc-400"}`} />
                  {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                </div>
                <div className="font-sans text-xs font-bold text-white truncate">
                  {track.title}
                </div>
                <div className="text-[11px] text-zinc-300 font-sans mt-1 leading-tight line-clamp-2">
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
            className="text-xs font-sans text-emerald-300 flex items-center gap-1.5 pt-1 font-medium"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>&ldquo;Soundtrack updated. Playing softly in the background.&rdquo;</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
