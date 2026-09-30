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
import QuestTracker from "@/components/QuestTracker";
import StartBirthdayTask from "@/components/StartBirthdayTask";
import HiddenStarTask from "@/components/HiddenStarTask";
import FixTheCodeTask from "@/components/FixTheCodeTask";
import SoundtrackSelector from "@/components/SoundtrackSelector";
import ReactionSpeedTask from "@/components/ReactionSpeedTask";
import CompleteSentenceTask from "@/components/CompleteSentenceTask";
import MemoryMatchGame from "@/components/MemoryMatchGame";
import EasterEgg from "@/components/EasterEgg";
import FinalSection from "@/components/FinalSection";
import AnimatedGif from "@/components/AnimatedGif";
import { birthdayData } from "@/data/birthday";

export default function Home() {
  const [entered, setEntered] = useState(false);
  const [musicTriggered, setMusicTriggered] = useState(false);
  const [activeTrack, setActiveTrack] = useState<{
    title: string;
    artist: string;
    src: string;
  }>({
    title: birthdayData.music.title,
    artist: birthdayData.music.artist,
    src: birthdayData.music.src,
  });
  const [terminalClicks, setTerminalClicks] = useState(0);
  const [easterEggOpen, setEasterEggOpen] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  const handleEnter = () => {
    setEntered(true);
    setMusicTriggered(true);
  };

  const handleReplay = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setEntered(false);
  };

  const markTaskCompleted = (taskId: string) => {
    setCompletedTasks((prev) => (prev.includes(taskId) ? prev : [...prev, taskId]));
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

            {/* Birthday Quest Floating Checklist */}
            <QuestTracker completedTasks={completedTasks} />

            {/* Main Interactive Journey */}
            <div className="flex-1 space-y-16 sm:space-y-24">
              {/* Task 01: Start the Birthday */}
              <StartBirthdayTask
                onComplete={() => markTaskCompleted("start_bday")}
                isCompleted={completedTasks.includes("start_bday")}
              />

              {/* 1. Hero with Staggered Word Reveals and Version 18->19 Upgrade */}
              <Hero />

              {/* Task 03: Important Birthday Decision (Cake / Sleep / Chaos) */}
              <BirthdayModeChoice
                onSelectMode={() => markTaskCompleted("make_choice")}
              />

              {/* Task 02: Hidden Star Challenge */}
              <HiddenStarTask
                onFound={() => markTaskCompleted("find_star")}
                isFound={completedTasks.includes("find_star")}
              />

              {/* Personality Break 1 */}
              <ScrollInterstitial
                mainText={birthdayData.interstitials.break1.main}
                followUpText={birthdayData.interstitials.break1.followUp}
              />

              {/* 2. Photo Gallery with Discoverable Hidden Cards & Lightbox */}
              <PhotoGallery />

              {/* Task 04: Fix the Birthday Code */}
              <FixTheCodeTask
                onComplete={() => markTaskCompleted("fix_code")}
                isCompleted={completedTasks.includes("fix_code")}
              />

              {/* Task 05: Soundtrack Selection */}
              <SoundtrackSelector
                onSelectTrack={(track) => setActiveTrack(track)}
                onComplete={() => markTaskCompleted("choose_music")}
                isCompleted={completedTasks.includes("choose_music")}
              />

              {/* 3. Personal Message formatted as code editor file */}
              <MessageSection />

              {/* Task 06: Mini Reaction Test */}
              <ReactionSpeedTask
                onComplete={() => markTaskCompleted("reaction_test")}
                isCompleted={completedTasks.includes("reaction_test")}
              />

              {/* Task 07: Complete the Sentence */}
              <CompleteSentenceTask
                onComplete={() => markTaskCompleted("complete_sentence")}
                isCompleted={completedTasks.includes("complete_sentence")}
              />

              {/* Bonus Mini-Game: 3-Pair Memory Match */}
              <MemoryMatchGame />

              {/* Mini-Game: Catch 5 Birthday Sparks */}
              <StarCatcherMiniGame />

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

              {/* 6. Playful Secret Micro-Interaction (DO NOT PRESS button) */}
              <InteractiveSecretButton />

              {/* Personality Break 2 */}
              <ScrollInterstitial
                mainText={birthdayData.interstitials.break2.main}
                followUpText={birthdayData.interstitials.break2.followUp}
              />

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

              {/* 9. Cinematic Final Surprise & Replay (Transition from Playful to Sincere with [READY] task) */}
              <FinalSection
                onReplay={handleReplay}
                onOpenEasterEgg={() => setEasterEggOpen(true)}
              />
            </div>

            {/* Persistent Floating Music Player with Dancing Waveform Equalizer */}
            <MusicPlayer
              autoPlayTriggered={musicTriggered}
              currentTrack={activeTrack}
            />

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
