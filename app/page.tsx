"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Intro from "@/components/Intro";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import MusicPlayer from "@/components/MusicPlayer";
import PhotoGallery from "@/components/PhotoGallery";
import MessageSection from "@/components/MessageSection";
import DeveloperSection from "@/components/DeveloperSection";
import Qualities from "@/components/Qualities";
import Timeline from "@/components/Timeline";
import EasterEgg from "@/components/EasterEgg";
import FinalSection from "@/components/FinalSection";

export default function Home() {
  const [entered, setEntered] = useState(false);
  const [musicTriggered, setMusicTriggered] = useState(false);
  const [terminalClicks, setTerminalClicks] = useState(0);
  const [easterEggOpen, setEasterEggOpen] = useState(false);

  const handleEnter = () => {
    setEntered(true);
    setMusicTriggered(true);
  };

  const handleReplay = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setEntered(false);
  };

  const handleTerminalClick = () => {
    const nextCount = terminalClicks + 1;
    setTerminalClicks(nextCount);
    if (nextCount >= 5) {
      setEasterEggOpen(true);
      setTerminalClicks(0);
    }
  };

  return (
    <main className="min-h-screen bg-[#080b11] text-zinc-100 relative selection:bg-cyan-500/25 selection:text-cyan-200">
      <AnimatePresence mode="wait">
        {!entered ? (
          <Intro key="intro" onEnter={handleEnter} />
        ) : (
          <motion.div
            key="main-experience"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col min-h-screen relative"
          >
            {/* Top Navigation */}
            <Navbar
              onTerminalClick={handleTerminalClick}
              terminalClickCount={terminalClicks}
            />

            {/* Main Sections */}
            <div className="flex-1 space-y-16 sm:space-y-24">
              <Hero />
              <PhotoGallery />
              <MessageSection />
              <DeveloperSection />
              <Qualities />
              <Timeline />
              <FinalSection
                onReplay={handleReplay}
                onOpenEasterEgg={() => setEasterEggOpen(true)}
              />
            </div>

            {/* Persistent Floating Music Player */}
            <MusicPlayer autoPlayTriggered={musicTriggered} />

            {/* Hidden Developer Easter Egg Modal */}
            <EasterEgg
              isOpen={easterEggOpen}
              onClose={() => setEasterEggOpen(false)}
              clickCount={terminalClicks}
              onResetCount={() => setTerminalClicks(0)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
