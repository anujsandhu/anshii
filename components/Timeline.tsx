"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { GitCommit, Calendar, Maximize2, Sparkles, X, Lock, Unlock, Loader2 } from "lucide-react";
import { birthdayData } from "@/data/birthday";

export default function Timeline() {
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [compiledMemories, setCompiledMemories] = useState<Record<string, boolean>>({});
  const [compilingId, setCompilingId] = useState<string | null>(null);

  const timelineItems = birthdayData.timeline;

  const handleCompileMemory = (id: string) => {
    if (compiledMemories[id] || compilingId) return;

    setCompilingId(id);
    setTimeout(() => {
      setCompiledMemories((prev) => ({ ...prev, [id]: true }));
      setCompilingId(null);
    }, 700);
  };

  const handleCompileAll = () => {
    const all: Record<string, boolean> = {};
    timelineItems.forEach((item) => {
      all[item.id] = true;
    });
    setCompiledMemories(all);
  };

  return (
    <section id="timeline" className="relative py-20 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Background Glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 font-mono text-xs mb-3"
        >
          <GitCommit className="w-3.5 h-3.5 text-cyan-400" />
          <span>GIT_LOG // INTERACTIVE_STACK</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white"
        >
          Compiled Memories
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-3 text-sm sm:text-base text-zinc-400 max-w-lg mx-auto font-sans"
        >
          Each memory is encrypted in the git history. Tap to compile and decrypt each milestone.
        </motion.p>

        {/* Compile All Button */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleCompileAll}
            className="px-4 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 text-xs font-mono transition-colors cursor-pointer flex items-center gap-2"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>[ Compile All Memories ]</span>
          </button>
        </div>
      </div>

      {/* Vertical Timeline Tree */}
      <div className="relative border-l-2 border-cyan-500/20 ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-12">
        {timelineItems.map((item, idx) => {
          const isCompiled = !!compiledMemories[item.id];
          const isCompiling = compilingId === item.id;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="relative group"
            >
              {/* Commit Node dot */}
              <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-6 h-6 rounded-full bg-[#080b11] border-2 border-cyan-400 flex items-center justify-center group-hover:scale-125 group-hover:border-amber-400 transition-all duration-300 shadow-md shadow-cyan-500/20">
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${
                    isCompiled ? "bg-emerald-400" : "bg-cyan-400"
                  }`}
                />
              </div>

              {/* Card Container */}
              <div
                className={`glass-panel p-5 sm:p-6 rounded-2xl border transition-all duration-300 shadow-xl ${
                  isCompiled
                    ? "border-cyan-500/30 bg-[#0d131f]/90"
                    : "border-white/10 hover:border-cyan-500/30"
                }`}
              >
                {/* Step badge & date */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-md">
                    COMMIT {item.step}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-xs text-zinc-400">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>{item.date}</span>
                  </div>
                </div>

                {/* Encrypted / Blurred State or Decrypted Content */}
                {!isCompiled ? (
                  <div className="py-4 text-center space-y-3">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 backdrop-blur-sm flex items-center justify-center gap-2 font-mono text-xs text-zinc-400">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{item.title}</span>
                      <span className="text-[10px] text-zinc-500">[ENCRYPTED]</span>
                    </div>

                    <button
                      onClick={() => handleCompileMemory(item.id)}
                      disabled={isCompiling}
                      className="px-5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-medium transition-all cursor-pointer inline-flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isCompiling ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                          <span>Compiling memory...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                          <span>Click to compile memory...</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Title */}
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-200 transition-colors mb-2">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-zinc-300 font-sans leading-relaxed">
                      {item.description}
                    </p>

                    {/* Optional Attached Photo */}
                    {item.photo && (
                      <div className="mt-4 pt-4 border-t border-white/5">
                        <div
                          onClick={() => setActivePhoto(item.photo || null)}
                          className="relative w-full max-w-sm h-40 sm:h-48 rounded-xl overflow-hidden cursor-pointer group/photo border border-white/10"
                        >
                          <Image
                            src={item.photo}
                            alt={item.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 400px"
                            className="object-cover transition-transform duration-500 group-hover/photo:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/30 group-hover/photo:bg-black/10 transition-colors" />
                          <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover/photo:opacity-100 transition-opacity">
                            <Maximize2 className="w-3.5 h-3.5" />
                          </div>
                          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-zinc-300">
                            Click to expand
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox for timeline photos */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePhoto(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <button
              onClick={() => setActivePhoto(null)}
              aria-label="Close photo preview"
              className="absolute top-5 right-5 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative max-w-2xl w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10">
              <Image
                src={activePhoto}
                alt="Timeline Memory"
                fill
                className="object-contain bg-zinc-950"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
