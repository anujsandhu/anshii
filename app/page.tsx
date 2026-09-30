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
    <main className="min-h-screen bg-[#090d18] text-zinc-100 relative selection:bg-amber-500/30 selection:text-amber-200">
      {/* Rare Twinkling Shooting Star */}
      <div className="fixed top-16 left-0 w-2.5 h-2.5 rounded-full bg-amber-300 pointer-events-none shadow-[0_0_15px_#fde047] animate-shooting-star z-20 opacity-0" />

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

            {/* Main Interactive Journey: Seamless Storytelling Progression */}
            <div className="flex-1">
              {/* ==================================================
                  1. HERO SECTION (Dark cinematic navy)
                  ================================================== */}
              <div className="bg-gradient-to-b from-[#090d18] via-[#0d1424] to-[#12162d] pb-8">
                {/* Task 01: Start the Birthday */}
                <StartBirthdayTask
                  onComplete={() => markTaskCompleted("start_bday")}
                  isCompleted={completedTasks.includes("start_bday")}
                />

                {/* Hero with dynamic particles and subtle CS pill accents */}
                <Hero />
              </div>

              {/* Scroll Surprise 1: Gentle Pause */}
              <div className="bg-gradient-to-b from-[#12162d] to-[#171833] py-4">
                <ScrollInterstitial
                  mainText="Wait..."
                  followUpText="Here is something I wanted to share with you."
                />
              </div>

              {/* ==================================================
                  2. BIRTHDAY MESSAGE (Soft lavender / blue)
                  ================================================== */}
              <div className="bg-gradient-to-b from-[#171833] via-[#1c1735] to-[#221a2f] py-12 sm:py-16">
                <MessageSection />
              </div>

              {/* Scroll Surprise 2: Gentle Pause */}
              <div className="bg-gradient-to-b from-[#221a2f] to-[#251b2c] py-4">
                <ScrollInterstitial
                  mainText={birthdayData.interstitials.break1.main}
                  followUpText={birthdayData.interstitials.break1.followUp}
                />
              </div>

              {/* ==================================================
                  3. PHOTOS / DIGITAL SCRAPBOOK (Warm cream / peach)
                  ================================================== */}
              <div className="bg-gradient-to-b from-[#251b2c] via-[#281b28] to-[#201828] py-12 sm:py-16">
                <PhotoGallery />
              </div>

              {/* ==================================================
                  4. INTERACTIVE MOMENTS (Bright, tasteful colors)
                  ================================================== */}
              <div className="bg-gradient-to-b from-[#201828] via-[#161f33] to-[#131d2e] py-16 sm:py-20 space-y-12">
                {/* Qualities: Things That Make You, You */}
                <Qualities />

                {/* Mood Choice: Cake / Chaos / Peace */}
                <BirthdayModeChoice
                  onSelectMode={() => markTaskCompleted("make_choice")}
                />

                {/* Soundtrack Selector */}
                <SoundtrackSelector
                  onSelectTrack={(track) => setActiveTrack(track)}
                  onComplete={() => markTaskCompleted("choose_music")}
                  isCompleted={completedTasks.includes("choose_music")}
                />
              </div>

              {/* ==================================================
                  5. MEMORIES / TIMELINE (Soft warm tones)
                  ================================================== */}
              <div className="bg-gradient-to-b from-[#131d2e] via-[#241a27] to-[#1d1525] py-16 sm:py-20">
                <Timeline />
              </div>

              {/* Scroll Surprise 3: Halfway Mark */}
              <div className="bg-gradient-to-b from-[#1d1525] to-[#171426] py-4">
                <ScrollInterstitial
                  mainText={birthdayData.interstitials.break2.main}
                  followUpText={birthdayData.interstitials.break2.followUp}
                />
              </div>

              {/* ==================================================
                  6. SMALL GAMES & THE ONE DEDICATED CS SECTION
                  ================================================== */}
              <div className="bg-gradient-to-b from-[#171426] via-[#101826] to-[#0c121e] py-16 sm:py-20 space-y-14">
                {/* Task 02: Hidden Star Challenge */}
                <HiddenStarTask
                  onFound={() => markTaskCompleted("find_star")}
                  isFound={completedTasks.includes("find_star")}
                />

                {/* Task 04: Verify the New Age */}
                <FixTheCodeTask
                  onComplete={() => markTaskCompleted("fix_code")}
                  isCompleted={completedTasks.includes("fix_code")}
                />

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

                {/* Playful Animation Break */}
                <div className="max-w-md mx-auto px-4">
                  <AnimatedGif
                    src={birthdayData.gifs.coding}
                    alt="CS Student Coding Mood"
                    type="coding"
                    caption="Late night coding sessions & shared engineering memories"
                  />
                </div>

                {/* Playful CS Mini-Game */}
                <CsMiniGame />

                {/* THE ONE DEDICATED CS SECTION: "Birthday Build v19.0" */}
                <DeveloperSection />

                {/* Playful Secret Button: DO NOT PRESS */}
                <InteractiveSecretButton />

                {/* Celebration GIF Break */}
                <div className="max-w-md mx-auto px-4">
                  <AnimatedGif
                    src={birthdayData.gifs.celebrate}
                    alt="Birthday Celebration"
                    type="celebrate"
                    caption="Here's to an incredible year 19 ahead!"
                  />
                </div>
              </div>

              {/* ==================================================
                  7. FINAL BIRTHDAY SURPRISE (Dark cinematic + golden glow)
                  ================================================== */}
              <div className="bg-gradient-to-b from-[#0c121e] via-[#180f24] to-[#07090f]">
                <FinalSection
                  onReplay={handleReplay}
                  onOpenEasterEgg={() => setEasterEggOpen(true)}
                />
              </div>
            </div>

            {/* Persistent Floating Music Player with Cover Thumbnail & Glassmorphism */}
            <MusicPlayer
              autoPlayTriggered={musicTriggered}
              currentTrack={activeTrack}
            />

            {/* Hidden Developer Easter Egg Modal */}
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
