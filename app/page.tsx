"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Intro from "@/components/Intro";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import MusicPlayer from "@/components/MusicPlayer";
import PhotoGallery from "@/components/PhotoGallery";
import MessageSection from "@/components/MessageSection";
import CsMiniGame from "@/components/CsMiniGame";
import DeveloperSection from "@/components/DeveloperSection";
import InteractiveSecretButton from "@/components/InteractiveSecretButton";
import Qualities from "@/components/Qualities";
import Timeline from "@/components/Timeline";
import EasterEgg from "@/components/EasterEgg";
import FinalSection from "@/components/FinalSection";
import AnimatedGif from "@/components/AnimatedGif";
import { birthdayData } from "@/data/birthday";

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
              {/* 1. Hero with Word Reveals and Version Upgrade */}
              <Hero />

              {/* 2. Photo Gallery with Progressive Loading and Lightbox */}
              <PhotoGallery />

              {/* 3. Personal Message */}
              <MessageSection />

              {/* Tasteful CS Animation Break */}
              <div className="max-w-md mx-auto px-4">
                <AnimatedGif
                  src={birthdayData.gifs.coding}
                  alt="CS Student Coding Mood"
                  type="coding"
                  caption="Compiling memories & surviving engineering labs together"
                />
              </div>

              {/* 4. CS Developer Mini-Game: Debugging Anshika's Birthday */}
              <CsMiniGame />

              {/* 5. Developer Section: Diagnostics & Live Test Suite */}
              <DeveloperSection />

              {/* 6. Playful Secret Micro-Interaction */}
              <InteractiveSecretButton />

              {/* 7. Qualities: Things That Make You, You */}
              <Qualities />

              {/* 8. Memory Timeline: Interactive Lock & Decrypt Stack */}
              <Timeline />

              {/* Celebration Animation Break */}
              <div className="max-w-md mx-auto px-4">
                <AnimatedGif
                  src={birthdayData.gifs.celebrate}
                  alt="Birthday Celebration"
                  type="celebrate"
                  caption="Here's to a phenomenal 19th year ahead!"
                />
              </div>

              {/* 9. Cinematic Final Surprise & Replay */}
              <FinalSection
                onReplay={handleReplay}
                onOpenEasterEgg={() => setEasterEggOpen(true)}
              />
            </div>

            {/* Persistent Floating Music Player with Dancing Equalizer */}
            <MusicPlayer autoPlayTriggered={musicTriggered} />

            {/* Hidden Developer Easter Egg Modal (Supports Konami Code + Terminal clicks) */}
            <EasterEgg
              isOpen={easterEggOpen}
              onOpen={() => setEasterEggOpen(true)}
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
