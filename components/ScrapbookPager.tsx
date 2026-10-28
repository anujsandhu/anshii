"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronUp,
  ChevronDown,
  Lock,
  Sparkles,
  Music2,
  Volume2,
  VolumeX,
  Heart,
  CheckCircle2,
} from "lucide-react";
import confetti from "canvas-confetti";

import Frame1Welcome from "./frames/Frame1Welcome";
import Frame2Birthday from "./frames/Frame2Birthday";
import Frame3Photos from "./frames/Frame3Photos";
import FrameGiftSnaps from "./frames/FrameGiftSnaps";
import Frame5Memory from "./frames/Frame5Memory";
import Frame6Scratch from "./frames/Frame6Scratch";
import Frame7Letter from "./frames/Frame6Letter";
import FrameMadamJiKeepsake from "./frames/FrameMadamJiKeepsake";
import Frame8Final from "./frames/Frame7Final";
import MusicPlayer from "./MusicPlayer";
import { BIRTHDAY_SOUNDTRACKS, getSongForFrame } from "@/data/musicConfig";
import EasterEgg from "./EasterEgg";
import PetalParticles from "./flowers/PetalParticles";
import FlowerBurst from "./flowers/FlowerBurst";
import LockedSkipTransition from "./transitions/LockedSkipTransition";
import ChapterCurtainTransition from "./transitions/ChapterCurtainTransition";
import PageTurnShimmer from "./transitions/PageTurnShimmer";

import { trackEvent } from "@/lib/analyticsClient";
import InteractiveScrapbookCanvas from "./canvas/InteractiveScrapbookCanvas";
import GsapSvgFlourishes from "./canvas/GsapSvgFlourishes";
import AnimatedButterflies from "./canvas/AnimatedButterflies";
import AnimatedCanvasDoodles from "./canvas/AnimatedCanvasDoodles";

export interface FrameMeta {
  id: number;
  chapter: string;
  title: string;
  vibe: string;
  flowerName: string;
  bgGradient: string;
}

export const SCRAPBOOK_FRAMES: FrameMeta[] = [
  {
    id: 0,
    chapter: "01",
    title: "Welcome",
    vibe: "Hello there, Anshika! ✨",
    flowerName: "🌸",
    bgGradient: "from-[#faf7f2] via-[#fff5f5] to-[#faf7f2]",
  },
  {
    id: 1,
    chapter: "02",
    title: "19th Birthday",
    vibe: "Happy 19th Birthday 🌷",
    flowerName: "🌷",
    bgGradient: "from-[#fffbf5] via-[#fef2f2] to-[#faf7f2]",
  },
  {
    id: 2,
    chapter: "03",
    title: "Photos",
    vibe: "Polaroid Scrapbook 📸",
    flowerName: "🌼",
    bgGradient: "from-[#fbf8f5] via-[#f5f3ff] to-[#faf7f2]",
  },
  {
    id: 3,
    chapter: "04",
    title: "Gift Snaps",
    vibe: "You & Your Gifts 🧸🎁",
    flowerName: "🧸",
    bgGradient: "from-[#fffbf5] via-[#fef3c7]/20 to-[#faf7f2]",
  },
  {
    id: 4,
    chapter: "05",
    title: "CS Quiz",
    vibe: "Web Dev Mini Quiz 💻",
    flowerName: "💐",
    bgGradient: "from-[#fefcf8] via-[#fef3c7]/20 to-[#faf7f2]",
  },
  {
    id: 5,
    chapter: "06",
    title: "Scratch Card",
    vibe: "Hidden Birthday Secret 🎟️",
    flowerName: "✨",
    bgGradient: "from-[#fdf8ff] via-[#fbcfe8]/15 to-[#faf7f2]",
  },
  {
    id: 6,
    chapter: "07",
    title: "Letter",
    vibe: "Handwritten Note 💌",
    flowerName: "🌺",
    bgGradient: "from-[#fffaf5] via-[#fdf2f8] to-[#faf7f2]",
  },
  {
    id: 7,
    chapter: "08",
    title: "Madam Ji's Keepsake",
    vibe: "Before You Go 🤍",
    flowerName: "💌",
    bgGradient: "from-[#fff9f6] via-[#fef3c7]/25 to-[#faf7f2]",
  },
  {
    id: 8,
    chapter: "09",
    title: "Grand Finale",
    vibe: "Birthday Bloom Climax ✨",
    flowerName: "🌸",
    bgGradient: "from-[#fff8f5] via-[#ffe4e6]/30 to-[#faf7f2]",
  },
];

const LOCKED_MESSAGES = [
  "Nuh uh 😭 Complete this one first.",
  "Complete this first, madam 👀",
  "Pehle task toh karo ji 🌷",
  "No skipping ahead, Anshika! 🙈",
  "Hold your horses, finish this first ✨",
];

interface ScrapbookPagerProps {
  autoStartMusic?: boolean;
}

export default function ScrapbookPager({ autoStartMusic = false }: ScrapbookPagerProps) {
  const [currentFrame, setCurrentFrame] = useState(0);

  // Tester mode bypass for Anuj (anuj88)
  const [isTester, setIsTester] = useState<boolean>(false);

  // Completed frames: For Anuj (tester), all frames 0-8 are unlocked.
  // For Anshii (anshii19), strict progression is enforced: she starts at 0 and cannot advance without completing each task.
  const [completedFrames, setCompletedFrames] = useState<Set<number>>(
    () => new Set<number>()
  );

  useEffect(() => {
    // Check if user requested a fresh reset/clear
    try {
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        const shouldClear =
          url.searchParams.get("clear") === "true" ||
          url.searchParams.get("reset") === "true";
        if (shouldClear) {
          localStorage.removeItem("anshii_completed_frames");
          localStorage.removeItem("anshii_madam_ji_answers");
          localStorage.removeItem("anshii_madam_ji_keepsake_v2");
          localStorage.removeItem("anshii_gift_snaps_v4");
          localStorage.removeItem("anshii_gift_slots_v4");
          localStorage.removeItem("anshii_gift_slots_v5");
          localStorage.removeItem("anshii_wishes_key_v2");
          localStorage.removeItem("anshii_last_frame");
          setCompletedFrames(new Set<number>());
        }
      }
    } catch {}

    const isAnuj =
      localStorage.getItem("anshii_user_role") === "anuj" ||
      localStorage.getItem("anshii_tester_bypass") === "true" ||
      sessionStorage.getItem("anshii_user_role") === "anuj" ||
      sessionStorage.getItem("anshii_tester_bypass") === "true";

    if (isAnuj) {
      setIsTester(true);
      // NOTE: Tester (anuj88) has free navigation anywhere, but tasks themselves
      // (scratch card, quiz, keepsake, gifts) start clean so they can be interactively tested.
    } else {
      try {
        const stored = localStorage.getItem("anshii_completed_frames");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setCompletedFrames(new Set<number>(parsed));
          }
        }
      } catch {}
    }
  }, []);

  // Listen to auth events to activate tester bypass for Anuj
  useEffect(() => {
    const handleAuthEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const isAnuj = detail?.isTester || detail?.role === "anuj";
      if (isAnuj) {
        setIsTester(true);
      }
    };
    window.addEventListener("anshii_auth_success", handleAuthEvent);
    return () => {
      window.removeEventListener("anshii_auth_success", handleAuthEvent);
    };
  }, []);

  // Persist completedFrames to localStorage only for real user (Anshii)
  useEffect(() => {
    if (isTester) return;
    try {
      localStorage.setItem(
        "anshii_completed_frames",
        JSON.stringify(Array.from(completedFrames))
      );
    } catch {}
  }, [completedFrames, isTester]);

  // On mount, also check if Firestore has all 4 gift snaps or approvals
  useEffect(() => {
    fetch("/api/gift-snaps")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const presetKeys = ["step-1", "step-2", "step-3", "step-4"];
          const isDone =
            data.allApproved ||
            presetKeys.every(
              (k) =>
                Boolean(
                  data.approvals?.[k] ||
                    data.snaps?.[k]?.approved ||
                    data.snaps?.[k]?.imageUrl
                )
            );
          if (isDone) {
            setCompletedFrames((prev) => {
              if (prev.has(3)) return prev;
              const next = new Set(prev);
              next.add(3);
              return next;
            });
          }
        }
      })
      .catch(() => {});
  }, []);

  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [musicTriggered, setMusicTriggered] = useState(true);

  // Auto-play music automatically across the whole scrapbook
  useEffect(() => {
    setMusicTriggered(true);
    const triggerAudio = () => setMusicTriggered(true);
    window.addEventListener("click", triggerAudio, { once: true });
    window.addEventListener("touchstart", triggerAudio, { once: true });
    window.addEventListener("keydown", triggerAudio, { once: true });
    return () => {
      window.removeEventListener("click", triggerAudio);
      window.removeEventListener("touchstart", triggerAudio);
      window.removeEventListener("keydown", triggerAudio);
    };
  }, []);
  const [easterEggOpen, setEasterEggOpen] = useState(false);
  const [titleClicks, setTitleClicks] = useState(0);

  // Elastic nudge feedback on locked attempt
  const [nudgeY, setNudgeY] = useState(0);
  const [isWiggling, setIsWiggling] = useState(false);

  // Full-screen Locked Attempt Transition Effect
  const [lockedTransition, setLockedTransition] = useState<{
    show: boolean;
    customMessage: string;
  }>({
    show: false,
    customMessage: "",
  });

  // Full-screen Chapter Curtain Transition Effect (when moving to new task/chapter)
  const [curtainTarget, setCurtainTarget] = useState<FrameMeta | null>(null);
  const [showCurtain, setShowCurtain] = useState(false);

  // Toast Notification System (only for minor bottom-right notifications)
  const [toast, setToast] = useState<{
    show: boolean;
    text: string;
    subText?: string;
    type: "locked" | "unlocked" | "info";
  }>({
    show: false,
    text: "",
    type: "info",
  });
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // FlowerBurst Celebration Overlay
  const [burstState, setBurstState] = useState<{
    show: boolean;
    message: string;
    subMessage: string;
  }>({
    show: false,
    message: "",
    subMessage: "",
  });

  // Inertia & multi-scroll prevention locks
  const isTransitioningRef = useRef(false);
  const lastScrollTimeRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchStartTimeRef = useRef(0);
  const touchStartXRef = useRef(0);
  const touchTargetScrollableRef = useRef<Element | null>(null);
  const touchTargetIsCardScrollRef = useRef(false);
  const prefersReducedMotionRef = useRef(false);

  useEffect(() => {
    prefersReducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  const showToast = useCallback(
    (
      text: string,
      type: "locked" | "unlocked" | "info" = "info",
      subText?: string,
      duration = 2500
    ) => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      setToast({ show: true, text, subText, type });
      toastTimeoutRef.current = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, duration);
    },
    []
  );

  // Trigger full-screen locked transition effect when user tries to skip a task
  const triggerLockedAlert = useCallback((customMsg?: string) => {
    const randomMsg =
      customMsg ||
      LOCKED_MESSAGES[Math.floor(Math.random() * LOCKED_MESSAGES.length)];

    setLockedTransition({
      show: true,
      customMessage: randomMsg,
    });

    // Elastic nudge down and bounce back
    setNudgeY(-26);
    setIsWiggling(true);
    setTimeout(() => {
      setNudgeY(0);
      setIsWiggling(false);
    }, 380);

    // Subtle haptic feedback if mobile
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([40, 60, 40]);
    }
  }, []);

  // Navigate frames with task-gating, full-screen transitions, and inertia prevention
  const navigateToFrame = useCallback(
    (targetIndex: number) => {
      if (targetIndex < 0 || targetIndex >= SCRAPBOOK_FRAMES.length) return;
      if (targetIndex === currentFrame) return;

      // Advancing to next frame (strictly linear progression: prior task must be completed)
      if (targetIndex > currentFrame) {
        // Must have completed the current frame's task!
        if (!completedFrames.has(currentFrame)) {
          triggerLockedAlert();
          return;
        }

        // Also prevent jumping over multiple locked frames if clicked from indicator
        for (let i = currentFrame; i < targetIndex; i++) {
          if (!completedFrames.has(i)) {
            triggerLockedAlert();
            return;
          }
        }

        // Trigger full-screen animated chapter curtain when moving forward to new task!
        const targetMeta = SCRAPBOOK_FRAMES[targetIndex];
        setCurtainTarget(targetMeta);
        setShowCurtain(true);
      }

      // Allowed! Transition smoothly
      isTransitioningRef.current = true;
      setCurrentFrame(targetIndex);

      const targetMeta = SCRAPBOOK_FRAMES[targetIndex];
      trackEvent({
        type: "navigation",
        page: targetMeta.title,
        elementText: `Chapter ${targetMeta.chapter}: ${targetMeta.title}`,
        metadata: {
          fromFrame: currentFrame,
          toFrame: targetIndex,
          chapter: targetMeta.chapter,
        },
      });

      // Automatically sync music track for the entered frame with smooth crossfade
      const targetSong = getSongForFrame(targetIndex);
      const songIdx = BIRTHDAY_SOUNDTRACKS.findIndex((s) => s.id === targetSong.id);
      if (songIdx !== -1 && songIdx !== activeTrackIndex) {
        setActiveTrackIndex(songIdx);
      }

      // Notify ReactionCam of current chapter for live streaming monitoring
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("anshii_chapter_changed", {
            detail: { chapter: targetIndex + 1 },
          })
        );
      }

      const transitionDelay = prefersReducedMotionRef.current ? 50 : 950;
      setTimeout(() => {
        isTransitioningRef.current = false;
      }, transitionDelay);
    },
    [currentFrame, completedFrames, isTester, triggerLockedAlert]
  );

  const handleNext = useCallback(() => {
    navigateToFrame(currentFrame + 1);
  }, [currentFrame, navigateToFrame]);

  const handlePrev = useCallback(() => {
    navigateToFrame(currentFrame - 1);
  }, [currentFrame, navigateToFrame]);

  // Complete a task on a specific frame
  const handleTaskComplete = useCallback(
    (frameId: number, customMessage?: string) => {
      setCompletedFrames((prev) => {
        if (prev.has(frameId)) return prev;
        const next = new Set(prev);
        next.add(frameId);
        return next;
      });

      // Frame 1 specifically starts music
      if (frameId === 0) {
        setMusicTriggered(true);
      }

      const frameMeta = SCRAPBOOK_FRAMES[frameId];
      trackEvent({
        type: "task_complete",
        page: frameMeta?.title || `Frame ${frameId}`,
        elementText: `Chapter ${frameMeta?.chapter} Complete`,
        metadata: { frameId },
      });

      showToast(
        `🌸 Chapter ${SCRAPBOOK_FRAMES[frameId].chapter} Complete!`,
        "unlocked",
        customMessage || "Okayyy, unlocked 🌷",
        2500
      );

      setBurstState({
        show: true,
        message: `🌸 Chapter ${SCRAPBOOK_FRAMES[frameId].chapter} Complete!`,
        subMessage: customMessage || "Okayyy, unlocked 🌷",
      });

      try {
        confetti({
          particleCount: 55,
          spread: 75,
          origin: { y: 0.65 },
          colors: ["#fda4af", "#fbcfe8", "#d8b4fe", "#bae6fd", "#fed7aa", "#86efac"],
        });
      } catch {}
    },
    [showToast]
  );

  const handleReplay = useCallback(() => {
    setCurrentFrame(0);
    setCompletedFrames(new Set());
    try {
      localStorage.removeItem("anshii_completed_frames");
      localStorage.removeItem("anshii_madam_ji_answers");
      localStorage.removeItem("anshii_madam_ji_keepsake_v2");
      localStorage.removeItem("anshii_gift_snaps_v4");
      localStorage.removeItem("anshii_gift_slots_v4");
      localStorage.removeItem("anshii_gift_slots_v5");
      localStorage.removeItem("anshii_wishes_key_v2");
    } catch {}
    setActiveTrackIndex(0);
    showToast("Starting fresh from Chapter 01 🌸", "info", undefined, 2500);
  }, [showToast]);

  // Helper: check if element or its ancestor is an internal card scroll container
  const getCardScrollParent = (el: Element | null): Element | null => {
    while (el && el !== document.body) {
      if (
        el.hasAttribute?.("data-card-scroll") ||
        el.classList?.contains("card-scroll") ||
        el.tagName === "TEXTAREA"
      ) {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  };

  // Helper: find the closest scrollable ancestor of an element
  const getScrollableParent = (el: Element | null): Element | null => {
    while (el && el !== document.body) {
      const style = window.getComputedStyle(el);
      const overflow = style.overflowY;
      const isScrollable = (overflow === "auto" || overflow === "scroll") && el.scrollHeight > el.clientHeight;
      if (isScrollable) return el;
      el = el.parentElement;
    }
    return null;
  };

  // Wheel & Trackpad Listener (strict 1-frame-per-gesture with Card Isolation)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const targetEl = e.target as Element | null;

      // 1. If target is inside an internal card scroll area (letter text, Madam Ji answers review, textarea, etc.)
      const cardScrollEl = getCardScrollParent(targetEl);
      if (cardScrollEl) {
        // Strict card isolation: Let the card scroll naturally with its own momentum and contained overscroll.
        // DO NOT intercept or trigger full-screen chapter transitions, even when reaching the boundaries!
        return;
      }

      // 2. If target is inside a general frame scrollable container (e.g. mobile viewport wrapper)
      const scrollable = getScrollableParent(targetEl);
      if (scrollable) {
        const atTop = scrollable.scrollTop <= 0;
        const atBottom = scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 2;
        // Only intercept if the scrollable is already at its boundary in the scroll direction
        if (e.deltaY > 0 && !atBottom) return;
        if (e.deltaY < 0 && !atTop) return;
      }

      // 3. Full-screen gesture: navigate between chapters
      e.preventDefault();
      if (isTransitioningRef.current) return;

      const now = Date.now();
      if (now - lastScrollTimeRef.current < 550) return;

      // Filter out micro-jitters
      if (Math.abs(e.deltaY) < 16) return;

      lastScrollTimeRef.current = now;

      if (e.deltaY > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [handleNext, handlePrev]);

  // Touch & Swipe Listener (Mobile / Tablet with Card Isolation)
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
      touchStartXRef.current = e.touches[0].clientX;
      touchStartTimeRef.current = Date.now();

      const targetEl = e.target as Element | null;
      touchTargetIsCardScrollRef.current = Boolean(getCardScrollParent(targetEl));
      touchTargetScrollableRef.current = getScrollableParent(targetEl);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isTransitioningRef.current) return;

      // If swipe started inside an internal card scroll area, isolate it strictly to the card!
      // This prevents accidental chapter flips while she is reading the letter or writing answers.
      if (touchTargetIsCardScrollRef.current) {
        return;
      }

      const touchEndY = e.changedTouches[0].clientY;
      const touchEndX = e.changedTouches[0].clientX;
      const deltaY = touchStartYRef.current - touchEndY;
      const deltaX = touchStartXRef.current - touchEndX;
      const deltaTime = Date.now() - touchStartTimeRef.current;

      // Ignore mostly-horizontal swipes (probably swiping within a carousel/gallery)
      if (Math.abs(deltaX) > Math.abs(deltaY)) return;

      // Require meaningful vertical swipe gesture
      if (Math.abs(deltaY) > 45 && deltaTime < 900) {
        // If the touch originated inside a scrollable frame area, check if it can still scroll
        const scrollable = touchTargetScrollableRef.current;
        if (scrollable) {
          const atTop = scrollable.scrollTop <= 2;
          const atBottom = scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 2;
          // Swipe-down (deltaY < 0 = finger moved down) = scrolling up in content
          if (deltaY < 0 && !atTop) return;
          // Swipe-up (deltaY > 0 = finger moved up) = scrolling down in content
          if (deltaY > 0 && !atBottom) return;
        }

        const now = Date.now();
        if (now - lastScrollTimeRef.current < 800) return;
        lastScrollTimeRef.current = now;

        if (deltaY > 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleNext, handlePrev]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  const handleTitleClick = () => {
    const nextClicks = titleClicks + 1;
    setTitleClicks(nextClicks);
    if (nextClicks >= 5) {
      setEasterEggOpen(true);
      setTitleClicks(0);
    }
  };

  const isCurrentTaskDone = isTester || completedFrames.has(currentFrame);
  const activeFrameMeta = SCRAPBOOK_FRAMES[currentFrame];

  return (
    <div className="w-screen h-[100dvh] overflow-hidden relative bg-[#faf7f2] select-none">
      {/* Page Turn Shimmer & Sunlight Sweep on chapter transition */}
      <PageTurnShimmer currentFrame={currentFrame} />

      {/* Interactive HTML5 Canvas: Stardust, cursor sparkles & watercolor ripples */}
      <InteractiveScrapbookCanvas />

      {/* GSAP-Powered SVG Ink-Drawing Flourishes & 3D Parallax Tilt */}
      <GsapSvgFlourishes currentFrame={currentFrame} />

      {/* Dynamic Animated Canvas Doodles & Annotations tailored to each chapter */}
      <AnimatedCanvasDoodles currentFrame={currentFrame} />

      {/* Whimsical 3D Flapping SVG Butterflies floating across canvas */}
      <AnimatedButterflies />

      {/* Ambient Floating Petals across the whole scrapbook */}
      <PetalParticles count={14} />

      {/* FlowerBurst celebration overlay */}
      <FlowerBurst
        show={burstState.show}
        onDone={() => setBurstState((prev) => ({ ...prev, show: false }))}
        message={burstState.message}
        subMessage={burstState.subMessage}
      />

      {/* TOP SCRAPBOOK HEADER RIBBON */}
      <header
        className="fixed top-0 inset-x-0 z-40 px-2 sm:px-6 lg:px-8 py-1.5 sm:py-3.5 flex items-center justify-between pointer-events-none"
        style={{ paddingTop: "max(8px, var(--sat, 8px))" }}
      >
        {/* Left: Chapter & Title Badge with Handcrafted Stamp */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          <motion.button
            onClick={handleTitleClick}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#e8ded1] shadow-[0_4px_20px_-2px_rgba(90,60,40,0.08)] text-[#3f2e24] cursor-pointer group"
            title="A handmade digital card by Anuj (click 5x for Easter Egg)"
          >
            <span className="font-mono text-[10px] sm:text-xs font-bold text-[#be185d] bg-[#fdf2f4] px-1.5 sm:px-2 py-0.5 rounded-md border border-[#fbcfe8]">
              {activeFrameMeta.chapter} / {SCRAPBOOK_FRAMES.length.toString().padStart(2, "0")}
            </span>
            <span className="font-handwriting text-base sm:text-lg lg:text-xl font-bold text-[#3f2e24] group-hover:text-[#be185d] transition-colors truncate max-w-[120px] xs:max-w-[160px] sm:max-w-none">
              {activeFrameMeta.title}
            </span>
            <span className="hidden xl:inline text-xs text-[#8c7465] font-sans border-l border-[#ebdcd0] pl-2">
              For Anshika 🌸
            </span>
          </motion.button>
        </div>

        {/* Center: Mobile Compact Dots Pill (< md) */}
        <div className="flex md:hidden pointer-events-auto items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#e8ded1] shadow-xs">
          {SCRAPBOOK_FRAMES.map((frame) => {
            const isCompleted = completedFrames.has(frame.id);
            const isCurrent = currentFrame === frame.id;
            return (
              <button
                key={frame.id}
                onClick={() => {
                  if (isCompleted || isCurrent) {
                    navigateToFrame(frame.id);
                  } else {
                    triggerLockedAlert();
                  }
                }}
                className={`transition-all rounded-full ${
                  isCurrent
                    ? "w-2.5 h-1.5 bg-[#be185d]"
                    : isCompleted
                    ? "w-1.5 h-1.5 bg-[#10b981]"
                    : "w-1.5 h-1.5 bg-[#d1c5b8]"
                }`}
                title={`Ch ${frame.chapter}: ${frame.title}`}
              />
            );
          })}
        </div>

        {/* Center: 9 Botanical Progress Flowers (Desktop & Tablet Scrapbook Tabs) */}
        <div className="hidden md:flex pointer-events-auto items-center gap-1 lg:gap-1.5 px-2 lg:px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#e8ded1] shadow-[0_4px_20px_-2px_rgba(90,60,40,0.08)]">
          {SCRAPBOOK_FRAMES.map((frame) => {
            const isCompleted = completedFrames.has(frame.id);
            const isCurrent = currentFrame === frame.id;
            const isAccessible = isCompleted || isCurrent;

            return (
              <button
                key={frame.id}
                onClick={() => {
                  if (isAccessible) {
                    navigateToFrame(frame.id);
                  } else {
                    triggerLockedAlert();
                  }
                }}
                className={`group relative rounded-full transition-all cursor-pointer flex items-center justify-center min-w-[26px] lg:min-w-[32px] min-h-[30px] lg:min-h-[36px] px-1.5 ${
                  isCurrent
                    ? "scale-110 text-[#be185d] font-bold"
                    : isCompleted
                    ? "text-[#10b981] hover:scale-110"
                    : "text-[#d1c5b8] hover:text-[#a89687]"
                }`}
                title={`Chapter ${frame.chapter}: ${frame.title} ${
                  isCompleted ? "(Completed)" : isCurrent ? "(Current)" : "(Locked - Complete prior chapters first)"
                }`}
              >
                {isCurrent && (
                  <motion.div
                    layoutId="activeChapterPill"
                    className="absolute inset-0 rounded-full bg-[#fdf2f4] border border-[#fbcfe8] shadow-xs z-0"
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  />
                )}
                <span className="text-xs lg:text-sm block leading-none relative z-10">
                  {isCurrent ? "🌷" : isCompleted ? "🌸" : "🌱"}
                </span>
                <span className="hidden xl:inline text-[11px] font-mono ml-1 font-semibold opacity-85 relative z-10">
                  {frame.chapter}
                </span>

                {/* Floating tooltip on hover (large screen) */}
                <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-[#3f2e24] text-white text-[10px] font-sans font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md z-50">
                  Ch {frame.chapter}: {frame.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Sound Equalizer & Desktop Keyboard Shortcut Pill */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Keyboard hint for laptops */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[#ebdcd0] text-[11px] font-sans text-[#786457] shadow-2xs">
            <span className="text-[10px] font-mono font-bold bg-[#f5ede4] px-1.5 py-0.5 rounded text-[#4a3528] border border-[#e3d3c4]">
              ↑ / ↓
            </span>
            <span className="text-[10px] text-[#a0897a]">or</span>
            <span className="text-[10px] font-mono font-bold bg-[#f5ede4] px-1.5 py-0.5 rounded text-[#4a3528] border border-[#e3d3c4]">
              Space
            </span>
            <span className="text-[#8c7465]">to flip</span>
          </div>

          {/* Equalizer Visualizer (Responsive for phones) */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#e8ded1] shadow-xs text-xs font-sans text-[#786457]">
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-0.5 h-3 bg-[#f43f5e] rounded-full animate-pulse" />
              <span className="w-0.5 h-2 bg-[#fda4af] rounded-full animate-bounce" />
              <span className="w-0.5 h-3.5 bg-[#f43f5e] rounded-full animate-pulse delay-75" />
              <span className="w-0.5 h-1.5 bg-[#fda4af] rounded-full animate-bounce delay-100" />
            </div>
            <span className="text-[11px] font-sans font-medium text-[#be185d] hidden sm:inline">
              Music Playing 🎵
            </span>
            <span className="text-[11px] sm:hidden">🎵</span>
          </div>
        </div>
      </header>

      {/* CONTINUOUS VERTICAL FRAME SLIDER WITH 3D DEPTH PARALLAX */}
      <motion.div
        animate={{
          y: `calc(-${currentFrame * 100}dvh + ${nudgeY}px)`,
        }}
        transition={{
          duration: prefersReducedMotionRef.current ? 0.05 : 0.82,
          ease: [0.16, 1, 0.3, 1],
        }}
        className={`w-full flex flex-col will-change-transform ${
          isWiggling ? "animate-wiggle" : ""
        }`}
        style={{ height: `${SCRAPBOOK_FRAMES.length * 100}dvh` }}
      >
        {/* FRAME 01: WELCOME */}
        <section className="w-screen h-[100dvh] shrink-0 relative overflow-hidden">
          <motion.div
            animate={{
              scale: currentFrame === 0 ? 1 : 0.94,
              opacity: currentFrame === 0 ? 1 : 0.35,
              y: currentFrame === 0 ? 0 : 0 < currentFrame ? -25 : 25,
            }}
            transition={{ duration: 0.82, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            <Frame1Welcome
              isCompleted={completedFrames.has(0)}
              onCompleteTask={() =>
                handleTaskComplete(
                  0,
                  "✓ Welcome! Birthday unlocked 🌷 Let's celebrate!"
                )
              }
              onNext={handleNext}
            />
          </motion.div>
        </section>

        {/* FRAME 02: BIRTHDAY */}
        <section className="w-screen h-[100dvh] shrink-0 relative overflow-hidden">
          <motion.div
            animate={{
              scale: currentFrame === 1 ? 1 : 0.94,
              opacity: currentFrame === 1 ? 1 : 0.35,
              y: currentFrame === 1 ? 0 : 1 < currentFrame ? -25 : 25,
            }}
            transition={{ duration: 0.82, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            <Frame2Birthday
              isCompleted={completedFrames.has(1)}
              onCompleteTask={() =>
                handleTaskComplete(
                  1,
                  "🌸 Flower bloomed! Attendance marked ✓"
                )
              }
              onNext={handleNext}
            />
          </motion.div>
        </section>

        {/* FRAME 03: PHOTOS */}
        <section className="w-screen h-[100dvh] shrink-0 relative overflow-hidden">
          <motion.div
            animate={{
              scale: currentFrame === 2 ? 1 : 0.94,
              opacity: currentFrame === 2 ? 1 : 0.35,
              y: currentFrame === 2 ? 0 : 2 < currentFrame ? -25 : 25,
            }}
            transition={{ duration: 0.82, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            <Frame3Photos
              isCompleted={completedFrames.has(2)}
              onCompleteTask={() =>
                handleTaskComplete(
                  2,
                  "💖 Secret heart found! Photo chapter complete!"
                )
              }
              onNext={handleNext}
            />
          </motion.div>
        </section>

        {/* FRAME 04: GIFT SNAPS */}
        <section className="w-screen h-[100dvh] shrink-0 relative overflow-hidden">
          <motion.div
            animate={{
              scale: currentFrame === 3 ? 1 : 0.94,
              opacity: currentFrame === 3 ? 1 : 0.35,
              y: currentFrame === 3 ? 0 : 3 < currentFrame ? -25 : 25,
            }}
            transition={{ duration: 0.82, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            <FrameGiftSnaps
              isCompleted={completedFrames.has(3)}
              onCompleteTask={() =>
                handleTaskComplete(
                  3,
                  "🧸 Gift snaps saved! Beautiful memories ✓"
                )
              }
              onNext={handleNext}
            />
          </motion.div>
        </section>

        {/* FRAME 05: CS QUIZ */}
        <section className="w-screen h-[100dvh] shrink-0 relative overflow-hidden">
          <motion.div
            animate={{
              scale: currentFrame === 4 ? 1 : 0.94,
              opacity: currentFrame === 4 ? 1 : 0.35,
              y: currentFrame === 4 ? 0 : 4 < currentFrame ? -25 : 25,
            }}
            transition={{ duration: 0.82, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            <Frame5Memory
              isCompleted={completedFrames.has(4)}
              onCompleteTask={() =>
                handleTaskComplete(
                  4,
                  "🧠 CS Quiz done! Web dev certified ✓"
                )
              }
              onNext={handleNext}
            />
          </motion.div>
        </section>

        {/* FRAME 06: SCRATCH CARD */}
        <section className="w-screen h-[100dvh] shrink-0 relative overflow-hidden">
          <motion.div
            animate={{
              scale: currentFrame === 5 ? 1 : 0.94,
              opacity: currentFrame === 5 ? 1 : 0.35,
              y: currentFrame === 5 ? 0 : 5 < currentFrame ? -25 : 25,
            }}
            transition={{ duration: 0.82, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            <Frame6Scratch
              isCompleted={completedFrames.has(5)}
              onCompleteTask={() =>
                handleTaskComplete(
                  5,
                  "🎟️ Scratch card revealed! Secret unlocked ✓"
                )
              }
              onNext={handleNext}
            />
          </motion.div>
        </section>

        {/* FRAME 07: LETTER */}
        <section className="w-screen h-[100dvh] shrink-0 relative overflow-hidden">
          <motion.div
            animate={{
              scale: currentFrame === 6 ? 1 : 0.94,
              opacity: currentFrame === 6 ? 1 : 0.35,
              y: currentFrame === 6 ? 0 : 6 < currentFrame ? -25 : 25,
            }}
            transition={{ duration: 0.82, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            <Frame7Letter
              isCompleted={completedFrames.has(6)}
              onCompleteTask={() =>
                handleTaskComplete(
                  6,
                  "💌 Letter opened! Keepsake chapter unlocked ✓"
                )
              }
              onNext={handleNext}
            />
          </motion.div>
        </section>

        {/* FRAME 08: MADAM JI'S KEEPSAKE */}
        <section className="w-screen h-[100dvh] shrink-0 relative overflow-hidden">
          <motion.div
            animate={{
              scale: currentFrame === 7 ? 1 : 0.94,
              opacity: currentFrame === 7 ? 1 : 0.35,
              y: currentFrame === 7 ? 0 : 7 < currentFrame ? -25 : 25,
            }}
            transition={{ duration: 0.82, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            <FrameMadamJiKeepsake
              isCompleted={completedFrames.has(7)}
              onCompleteTask={() =>
                handleTaskComplete(
                  7,
                  "🤍 All 4 memories sealed! Grand finale unlocked ✓"
                )
              }
              onNext={handleNext}
            />
          </motion.div>
        </section>

        {/* FRAME 09: GRAND FINALE */}
        <section className="w-screen h-[100dvh] shrink-0 relative overflow-hidden">
          <motion.div
            animate={{
              scale: currentFrame === 8 ? 1 : 0.94,
              opacity: currentFrame === 8 ? 1 : 0.35,
              y: currentFrame === 8 ? 0 : 8 < currentFrame ? -25 : 25,
            }}
            transition={{ duration: 0.82, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            <Frame8Final onReplay={handleReplay} />
          </motion.div>
        </section>
      </motion.div>

      {/* FLOATING NAVIGATION BUTTONS (PREV & NEXT) */}
      <div
        className="fixed bottom-0 left-0 z-40 flex items-center gap-1.5 sm:gap-2 select-none p-2 sm:p-4 pointer-events-none"
        style={{ paddingBottom: "max(12px, calc(var(--sab) + 8px))" }}
      >
        {/* Previous Button */}
        {currentFrame > 0 && (
          <motion.button
            onClick={handlePrev}
            onPointerDown={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(
                  new CustomEvent("anshii_auto_save_before_back", {
                    detail: {
                      action: `touch_prev_button_chapter_${currentFrame}`,
                    },
                  })
                );
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="pointer-events-auto flex items-center justify-center p-2.5 sm:px-3.5 sm:py-2.5 rounded-2xl bg-white/90 hover:bg-white backdrop-blur-md border border-[#ebdcd0] text-[#786457] hover:text-[#3f2e24] text-xs font-sans font-semibold shadow-sm transition-all cursor-pointer min-h-[40px] sm:min-h-[44px]"
            title="Go to previous chapter"
          >
            <ChevronUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline sm:ml-1">Prev</span>
          </motion.button>
        )}

        {/* Next / Locked Button */}
        {currentFrame < SCRAPBOOK_FRAMES.length - 1 && (
          <motion.button
            onClick={() => {
              if (isCurrentTaskDone) {
                handleNext();
              } else {
                triggerLockedAlert();
              }
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={`pointer-events-auto flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs font-sans font-bold shadow-md transition-all cursor-pointer min-h-[40px] sm:min-h-[44px] ${
              isCurrentTaskDone
                ? "bg-[#fda4af] hover:bg-[#fb7185] text-[#4c0519] ring-2 ring-[#f43f5e]/30 btn-cute animate-pulse"
                : "bg-white/85 hover:bg-white text-[#8c7465] border border-[#ebdcd0] backdrop-blur-md"
            }`}
            title={
              isCurrentTaskDone
                ? "Scroll down or tap to advance to next chapter"
                : "Complete this chapter's task first!"
            }
          >
            {isCurrentTaskDone ? (
              <>
                <span className="hidden xs:inline">Next Chapter</span>
                <span className="xs:hidden">Next</span>
                <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-[#f43f5e]" />
                <span className="hidden xs:inline">Task Locked</span>
                <span className="xs:hidden">Locked</span>
              </>
            )}
          </motion.button>
        )}
      </div>

      {/* PERSISTENT RETRO CASSETTE PLAYER (Bottom Right) */}
      <MusicPlayer
        autoPlayTriggered={musicTriggered}
        activeSongIndex={activeTrackIndex}
        onSongChange={(idx) => setActiveTrackIndex(idx)}
      />

      {/* EASTER EGG TERMINAL MODAL */}
      <EasterEgg
        isOpen={easterEggOpen}
        onOpen={() => setEasterEggOpen(true)}
        onClose={() => setEasterEggOpen(false)}
        clickCount={titleClicks}
        onResetCount={() => setTitleClicks(0)}
      />

      {/* FULL-SCREEN ANIMATED LOCKED SKIP TRANSITION EFFECT */}
      <LockedSkipTransition
        show={lockedTransition.show}
        onClose={() =>
          setLockedTransition((prev) => ({ ...prev, show: false }))
        }
        currentFrameIndex={currentFrame}
        chapterTitle={SCRAPBOOK_FRAMES[currentFrame].title}
        customMessage={lockedTransition.customMessage}
      />

      {/* FULL-SCREEN ANIMATED CHAPTER CURTAIN TRANSITION (MOVING TO NEW TASK) */}
      <ChapterCurtainTransition
        show={showCurtain}
        targetFrame={curtainTarget}
        onTransitionEnd={() => setShowCurtain(false)}
      />

      {/* CUTE SCRAPBOOK TOASTER MESSAGE AT BOTTOM OF CARD (2 TO 3 SEC DISPLAY) */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.94 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-5 sm:bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
            style={{ paddingBottom: "max(8px, var(--sab))" }}
          >
            <div
              className={`pointer-events-auto px-4 sm:px-5 py-2.5 rounded-2xl shadow-lg border backdrop-blur-md flex items-center gap-3 max-w-sm sm:max-w-md ${
                toast.type === "unlocked"
                  ? "bg-[#fff0f3]/95 border-[#fda4af] text-[#881337] shadow-[0_10px_30px_rgba(244,63,94,0.18)]"
                  : toast.type === "locked"
                  ? "bg-[#fff1f2]/95 border-[#fecdd3] text-[#9f1239] shadow-[0_10px_30px_rgba(225,29,72,0.14)]"
                  : "bg-[#fffdfa]/95 border-[#ebdcd0] text-[#3f2e24] shadow-[0_8px_25px_rgba(120,80,50,0.1)]"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  toast.type === "unlocked"
                    ? "bg-[#ffe4e6] text-[#e11d48]"
                    : toast.type === "locked"
                    ? "bg-[#fee2e2] text-[#dc2626]"
                    : "bg-[#fef3c7] text-[#d97706]"
                }`}
              >
                {toast.type === "unlocked" && <Sparkles className="w-3.5 h-3.5" />}
                {toast.type === "locked" && <Lock className="w-3.5 h-3.5" />}
                {toast.type === "info" && <Sparkles className="w-3.5 h-3.5" />}
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="font-sans font-bold text-xs sm:text-sm truncate leading-snug">
                  {toast.text}
                </span>
                {toast.subText && (
                  <span className="text-[11px] opacity-85 font-sans font-medium line-clamp-1 leading-tight">
                    {toast.subText}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
