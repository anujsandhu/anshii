"use client";

import React, { useState } from "react";
import { Terminal, Sparkles, Menu, X, Code2 } from "lucide-react";
import { birthdayData } from "@/data/birthday";

interface NavbarProps {
  onTerminalClick: () => void;
  terminalClickCount: number;
}

export default function Navbar({ onTerminalClick, terminalClickCount }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Moments", href: "#moments" },
    { label: "Message", href: "#message" },
    { label: "Build v19.0", href: "#build" },
    { label: "Traits", href: "#qualities" },
    { label: "Timeline", href: "#timeline" },
  ];

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/5 bg-[#080b11]/80 backdrop-blur-xl transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo / Status */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            className="flex items-center gap-2 font-mono text-xs sm:text-sm font-semibold text-white tracking-tight hover:text-cyan-300 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ANSHIKA.EXE</span>
            <span className="text-[10px] text-zinc-500 font-normal hidden sm:inline">
              [v19.0]
            </span>
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 font-mono text-xs text-zinc-400">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-cyan-300 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right side: Secret Terminal Clicker */}
        <div className="flex items-center gap-3">
          <button
            onClick={onTerminalClick}
            aria-label="Developer console Easter egg"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/30 text-zinc-400 hover:text-cyan-300 text-xs font-mono transition-all cursor-pointer group"
            title="Click multiple times for Easter Egg"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">dev.sh</span>
            {terminalClickCount > 0 && terminalClickCount < 5 && (
              <span className="text-[10px] text-amber-400 font-bold ml-1">
                {5 - terminalClickCount} left
              </span>
            )}
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#0c1017] px-4 py-4 space-y-3 font-mono text-xs">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-zinc-300 hover:text-cyan-300"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
