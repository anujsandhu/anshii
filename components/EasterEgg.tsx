"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Sparkles, X, Check, ArrowRight, ShieldAlert, KeyRound } from "lucide-react";
import confetti from "canvas-confetti";
import { birthdayData } from "@/data/birthday";

interface EasterEggProps {
  clickCount: number;
  onResetCount: () => void;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export default function EasterEgg({
  clickCount,
  onResetCount,
  isOpen,
  onClose,
  onOpen,
}: EasterEggProps) {
  const [inputVal, setInputVal] = useState("sudo birthday --wish");
  const [history, setHistory] = useState<Array<{ cmd: string; output: string | React.ReactNode }>>([
    {
      cmd: "sudo birthday --wish",
      output: birthdayData.easterEgg.wishOutput,
    },
  ]);

  // Konami sequence listener for desktop: ↑ ↑ ↓ ↓ ← → ← →
  const [keySequence, setKeySequence] = useState<string[]>([]);
  const targetSequence = birthdayData.easterEgg.konamiSequence;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      setKeySequence((prev) => {
        const updated = [...prev, e.key].slice(-targetSequence.length);
        if (updated.length === targetSequence.length && updated.every((val, index) => val === targetSequence[index])) {
          onOpen();
          try {
            confetti({
              particleCount: 60,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#10b981", "#38bdf8", "#f59e0b"],
            });
          } catch {}
          return [];
        }
        return updated;
      });
    },
    [targetSequence, onOpen]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#f59e0b", "#06b6d4", "#8b5cf6", "#10b981"],
        });
      } catch {}
    }
  }, [isOpen]);

  const handleRunCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    let reply: string | React.ReactNode = "";

    if (trimmed.toLowerCase() === "sudo birthday --wish") {
      reply = birthdayData.easterEgg.wishOutput;
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
          colors: ["#38bdf8", "#f43f5e", "#fbbf24"],
        });
      } catch {}
    } else if (trimmed.toLowerCase() === "help") {
      reply = "Available commands: sudo birthday --wish, qr, cat note.txt, whoami, clear, exit";
    } else if (trimmed.toLowerCase() === "qr" || trimmed.toLowerCase() === "gift" || trimmed.toLowerCase() === "card") {
      reply = (
        <span>
          🎁 Physical Gift QR Card:{" "}
          <a href="/qr-card" target="_blank" className="text-pink-400 underline font-bold">
            Click here to open /qr-card for printing
          </a>
        </span>
      );
    } else if (trimmed.toLowerCase() === "cat note.txt") {
      reply = "Note from Anuj: Happy 19th Anshika! May all your algorithms run in O(1) time and your coffee never get cold.";
    } else if (trimmed.toLowerCase() === "whoami") {
      reply = "Anshika — 19 years old, CS student, VIP of the day.";
    } else if (trimmed.toLowerCase() === "clear") {
      setHistory([]);
      setInputVal("");
      return;
    } else if (trimmed.toLowerCase() === "exit") {
      onClose();
      return;
    } else {
      reply = `command not found: ${trimmed}. Type 'help' for available commands.`;
    }

    setHistory((prev) => [...prev, { cmd: trimmed, output: reply }]);
    setInputVal("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-2xl bg-[#090d16] border border-cyan-500/40 shadow-2xl shadow-cyan-500/10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#0d131f] border-b border-white/10 select-none">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="ml-2 font-mono text-xs text-cyan-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  sudo terminal (Developer Mode Unlocked)
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Terminal Body */}
            <div className="p-5 font-mono text-xs sm:text-sm space-y-4 max-h-[360px] overflow-y-auto">
              <div className="text-zinc-400 text-xs flex items-center gap-1.5 pb-2 border-b border-white/5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                <span>Developer mode unlocked. Type</span>{" "}
                <code className="text-cyan-400">help</code>{" "}
                <span>for commands.</span>
              </div>

              {history.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <span className="text-emerald-400">root@birthday</span>
                    <span>#</span>
                    <span className="text-white">{item.cmd}</span>
                  </div>
                  <div className="pl-4 text-amber-300 font-semibold flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{item.output}</span>
                  </div>
                </div>
              ))}

              {/* Input prompt */}
              <form onSubmit={handleRunCommand} className="flex items-center gap-2 pt-2">
                <span className="text-emerald-400 shrink-0">root@birthday #</span>
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="type a command..."
                  autoFocus
                  className="flex-1 bg-transparent text-white outline-none font-mono text-xs sm:text-sm border-none focus:ring-0"
                />
                <button
                  type="submit"
                  className="p-1.5 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="px-5 py-2.5 bg-[#070a10] border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span>Shortcut: ↑ ↑ ↓ ↓ ← → ← →</span>
              <span>exit to close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
