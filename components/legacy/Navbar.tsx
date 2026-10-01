"use client";

import React, { useState } from "react";
import { Heart, Sparkles, Menu, X, Bookmark, Code2 } from "lucide-react";

interface NavbarProps {
  onTerminalClick?: () => void;
  terminalClickCount?: number;
}

export default function Navbar({ onTerminalClick, terminalClickCount = 0 }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrapbookTabs = [
    { label: "Greetings", href: "#greetings", emoji: "💌" },
    { label: "Pictures", href: "#pictures", emoji: "📸" },
    { label: "Flowers", href: "#flowers", emoji: "🌸" },
    { label: "Song", href: "#song", emoji: "🎵" },
    { label: "Letter", href: "#letter", emoji: "✍️" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#faf7f2]/90 backdrop-blur-md border-b border-[#ebdcd0] shadow-xs select-none">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Scrapbook Ribbon Title */}
        <a
          href="#greetings"
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="w-7 h-7 rounded-full bg-[#fee2e2] flex items-center justify-center text-xs shadow-xs">
            🌸
          </div>
          <div className="flex flex-col text-left">
            <span className="font-handwriting text-xl sm:text-2xl font-bold text-[#3f2e24] group-hover:text-[#be185d] transition-colors leading-none">
              Anshika&apos;s 19th
            </span>
            <span className="text-[10px] font-sans text-[#9c8273] tracking-wide">
              handmade scrapbook
            </span>
          </div>
        </a>

        {/* Desktop Scrapbook Bookmark Tabs: Greetings | Pictures | Flowers | Song | Letter */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#f5ede4] p-1 rounded-2xl border border-[#e3d3c4]">
          {scrapbookTabs.map((tab) => (
            <a
              key={tab.label}
              href={tab.href}
              className="px-3.5 py-1 rounded-xl text-xs font-sans font-medium text-[#5a4435] hover:text-[#3f2e24] hover:bg-white transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </a>
          ))}
        </nav>

        {/* Right Action: Small CS Easter Egg Ribbon + Mobile Toggle */}
        <div className="flex items-center gap-2.5">
          {onTerminalClick && (
            <button
              onClick={onTerminalClick}
              aria-label="CS student easter egg"
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#fffdfa] border border-[#e8ded1] text-xs font-mono text-[#786457] hover:text-[#be185d] hover:border-[#fda4af] transition-all cursor-pointer shadow-2xs group"
              title="A tiny CS note from Anuj"
            >
              <Code2 className="w-3.5 h-3.5 text-[#fda4af] group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">v19.0</span>
              {terminalClickCount > 0 && terminalClickCount < 5 && (
                <span className="text-[10px] text-[#f43f5e] font-bold">
                  ({5 - terminalClickCount})
                </span>
              )}
            </button>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-xl bg-[#f5ede4] text-[#5a4435]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#e5d7c7] bg-[#faf7f2] px-4 py-3 space-y-1 shadow-md">
          {scrapbookTabs.map((tab) => (
            <a
              key={tab.label}
              href={tab.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 px-3 rounded-xl text-sm font-sans font-medium text-[#4a3528] hover:bg-[#f5ede4] transition-colors"
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
