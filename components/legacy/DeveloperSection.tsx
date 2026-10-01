"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  CheckCircle2,
  Terminal,
  Activity,
  Play,
  RotateCcw,
  Sparkles,
  GitBranch,
} from "lucide-react";
import { birthdayData } from "@/data/birthday";

export default function DeveloperSection() {
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testOutput, setTestOutput] = useState<string[] | null>(null);

  const stats = birthdayData.devDashboard.stats;

  const handleRunTests = () => {
    setIsRunningTests(true);
    setTestOutput(["Running unit test suite for Anshika's 19th Birthday..."]);

    setTimeout(() => {
      setTestOutput((prev) => [
        ...(prev || []),
        "PASS test/happiness.test.ts (19/19 checks passed)",
        "PASS test/memories.test.ts (Zero memory leaks detected)",
        "PASS test/cs_potential.test.ts (Infinite ceiling verified)",
        "PASS test/smile_frequency.test.ts (Expected: high, Received: 100%)",
        "✓ All 4 test suites passed. Build status: 100% HEALTHY",
      ]);
      setIsRunningTests(false);
    }, 1200);
  };

  const handleResetTests = () => {
    setTestOutput(null);
  };

  return (
    <section id="build" className="relative py-20 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Background Tech Mesh */}
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-14">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-300 font-mono text-xs mb-3"
        >
          <Cpu className="w-3.5 h-3.5 text-violet-400" />
          <span>DIAGNOSTICS // SYSTEM_METRICS</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white"
        >
          {birthdayData.devDashboard.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-2 text-sm text-zinc-400 max-w-lg mx-auto font-sans"
        >
          Real-time metrics, telemetry, and compiled runtime state for year 19.
        </motion.p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-10">
        {stats.map((item, idx) => {
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="glass-panel p-4 rounded-xl border border-white/5 hover:border-white/15 transition-all text-center flex flex-col justify-between"
            >
              <div className="text-[11px] font-mono text-zinc-400 mb-1">
                {item.label}
              </div>
              <div className="text-base sm:text-lg font-bold font-mono tracking-tight text-zinc-100 flex items-center justify-center gap-1">
                <span>{item.value}</span>
                {item.value === "Stable" && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
              <div className="mt-2 text-[10px] font-mono text-zinc-500 flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>ok</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Terminal & Code Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Code Snippet Window */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#0d131f]/90 backdrop-blur-xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#080d16]/90 select-none">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/70" />
              <div className="w-3 h-3 rounded-full bg-amber-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
              <span className="ml-2 font-mono text-xs text-zinc-400 flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
                birthday.config.ts
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">TypeScript 5.x</span>
          </div>

          {/* Syntax Highlighted Code Box */}
          <div className="p-4 sm:p-6 font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto text-zinc-300">
            <pre>
              <code>
                <span className="text-zinc-500">// Core constants for year 19</span>
                {"\n"}
                <span className="text-violet-400">const</span>{" "}
                <span className="text-cyan-300">birthday</span>:{" "}
                <span className="text-amber-400">number</span> ={" "}
                <span className="text-emerald-400">19</span>;
                {"\n"}
                <span className="text-violet-400">const</span>{" "}
                <span className="text-cyan-300">wishes</span>:{" "}
                <span className="text-amber-400">number</span> ={" "}
                <span className="text-emerald-400">Infinity</span>;
                {"\n"}
                <span className="text-violet-400">const</span>{" "}
                <span className="text-cyan-300">memories</span>:{" "}
                <span className="text-amber-400">string</span> ={" "}
                <span className="text-amber-300">&quot;loading...&quot;</span>;
                {"\n"}
                <span className="text-violet-400">const</span>{" "}
                <span className="text-cyan-300">smile</span>:{" "}
                <span className="text-amber-400">boolean</span> ={" "}
                <span className="text-emerald-400">true</span>;
                {"\n\n"}
                <span className="text-violet-400">async function</span>{" "}
                <span className="text-cyan-400">initializeYearNineteen</span>(
                <span className="text-orange-300">student</span> ={" "}
                <span className="text-amber-300">&quot;Anshika&quot;</span>
                ) &#123;
                {"\n"}  <span className="text-violet-400">console</span>.
                <span className="text-blue-300">log</span>(
                <span className="text-amber-300">`Compiling year 19 for $&#123;student&#125;...`</span>
                );
                {"\n"}  <span className="text-violet-400">return</span> &#123;
                {"\n"}    academicSuccess:{" "}
                <span className="text-emerald-400">true</span>,
                {"\n"}    goodMoments:{" "}
                <span className="text-amber-300">&quot;maximum&quot;</span>,
                {"\n"}    coffeeCount:{" "}
                <span className="text-emerald-400">404</span>,{" "}
                <span className="text-zinc-500">// infinite</span>
                {"\n"}    codeBugs:{" "}
                <span className="text-emerald-400">0</span>
                {"\n"}  &#125;;
                {"\n"}&#125;
              </code>
            </pre>
          </div>
        </motion.div>

        {/* Live Diagnostics & Test Runner */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#0d131f]/90 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col justify-between"
        >
          <div className="p-4 sm:p-5 border-b border-white/5 bg-[#080d16]/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-xs text-zinc-300 font-medium">
                Live Test Console
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunTests}
                disabled={isRunningTests}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3 h-3 fill-emerald-300" />
                <span>{isRunningTests ? "Running..." : "Run Tests"}</span>
              </button>
              {testOutput && (
                <button
                  onClick={handleResetTests}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                  title="Clear tests"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="p-5 font-mono text-xs space-y-3 min-h-[220px] flex flex-col justify-between">
            {testOutput ? (
              <div className="space-y-1.5">
                {testOutput.map((line, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className={
                      line.startsWith("PASS")
                        ? "text-emerald-400"
                        : line.startsWith("✓")
                        ? "text-cyan-300 font-semibold pt-1 border-t border-white/5"
                        : "text-zinc-400"
                    }
                  >
                    {line}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-zinc-500 space-y-2 py-4">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Interactive Test Suite</span>
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-400">
                  Click <strong className="text-emerald-400">&quot;Run Tests&quot;</strong> above to execute the automated test suites for year 19.
                </p>
                <div className="pt-3 text-[11px] text-zinc-400 border-t border-white/5">
                  <span className="text-cyan-400 font-semibold">Latest Build Log:</span>
                  <div className="mt-1 text-zinc-400">
                    &gt; Zero critical exceptions found. Memory allocation: 100% optimal.
                  </div>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Vercel Ready
              </span>
              <span>Node.js v25 • Turbopack</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
