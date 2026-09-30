"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Intro from "@/components/Intro";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import MusicPlayer from "@/components/MusicPlayer";
import BirthdayModeChoice from "@/components/BirthdayModeChoice";
import PhotoGallery from "@/components/PhotoGallery";
import StarCatcherMiniGame from "@/components/StarCatcherMiniGame";
import MessageSection from "@/components/MessageSection";
import CsMiniGame from "@/components/CsMiniGame";
import DeveloperSection from "@/components/DeveloperSection";
import InteractiveSecretButton from "@/components/InteractiveSecretButton";
import Qualities from "@/components/Qualities";
import Timeline from "@/components/Timeline";
import ScrollInterstitial from "@/components/ScrollInterstitial";
import Achievements from "@/components/Achievements";
import EasterEgg from "@/components/EasterEgg";
import FinalSection from "@/components/FinalSection";
import AnimatedGif from "@/components/AnimatedGif";
import { birthdayData } from "@/data/birthday";

export default function Home() {
  const [entered, setEntered] = useState(false);
  const [musicTriggered, setMusicTriggered] = useState(false);
  const [terminalClicks, setTerminalClicks] = useState(0);
  const [easterEggOpen, setEasterEggOpen] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);

  const handleEnter = () => {
    setEntered(true);
    setMusicTriggered(true);
  };

  const handleReplay = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setEntered(false);
  };

  const addAchievement = (id: string) => {
    setUnlockedAchievements((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleTerminalClick = () => {
    const nextCount = terminalClicks + 1;
    setTerminalClicks(nextCount);
    addAchievement("curious");
    if (nextCount >= 5) {
      setEasterEggOpen(true);
      addAchievement("easter_egg");
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

            {/* Surprise / Exploration Badge Tracker */}
            <Achievements unlockedList={unlockedAchievements} />

            {/* Main Interactive Journey */}
            <div className="flex-1 space-y-16 sm:space-y-24">
              {/* 1. Hero with Staggered Word Reveals and Version 18->19 Upgrade */}
              <Hero />

              {/* 2. Playful Choice: Choose Your Birthday Mode */}
              <BirthdayModeChoice onSelectMode={() => addAchievement("mode")} />

              {/* Personality Break 1 */}
              <ScrollInterstitial
                mainText={birthdayData.interstitials.break1.main}
                followUpText={birthdayData.interstitials.break1.followUp}
              />

              {/* 3. Photo Gallery with Discoverable Hidden Cards & Lightbox */}
              <PhotoGallery onPhotoUnlocked={() => addAchievement("curious")} />

              {/* 4. Mini-Game: Catch 5 Birthday Sparks */}
              <StarCatcherMiniGame />

              {/* 5. Personal Message formatted as code editor file */}
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

              {/* 6. CS Developer Mini-Game: Debugging Anshika's Birthday */}
              <div onClick={() => addAchievement("debugger")}>
                <CsMiniGame />
              </div>

              {/* 7. Developer Section: Diagnostics & Live Test Suite */}
              <DeveloperSection />

              {/* 8. Playful Secret Micro-Interaction (Talks-back button) */}
              <div onClick={() => addAchievement("curious")}>
                <InteractiveSecretButton />
              </div>

              {/* Personality Break 2 */}
              <ScrollInterstitial
                mainText={birthdayData.interstitials.break2.main}
                followUpText={birthdayData.interstitials.break2.followUp}
              />

              {/* 9. Qualities: Things That Make You, You */}
              <Qualities />

              {/* 10. Memory Timeline: Interactive Lock & Decrypt Stack */}
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

              {/* 11. Cinematic Final Surprise & Replay (Transition from Playful to Sincere) */}
              <FinalSection
                onReplay={handleReplay}
                onOpenEasterEgg={() => {
                  setEasterEggOpen(true);
                  addAchievement("easter_egg");
                }}
              />
            </div>

            {/* Persistent Floating Music Player with Dancing Waveform Equalizer */}
            <MusicPlayer autoPlayTriggered={musicTriggered} />

            {/* Hidden Developer Easter Egg Modal (Supports Konami Code + Terminal clicks) */}
            <EasterEgg
              isOpen={easterEggOpen}
              onOpen={() => {
                setEasterEggOpen(true);
                addAchievement("easter_egg");
              }}
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
