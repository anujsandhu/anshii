"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Unlock,
  Sparkles,
  MessageCircle,
  X,
  CheckCircle2,
  Heart,
  Key,
  Shield,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  Music,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  calculateTimeRemaining,
  DATE_DISPLAY,
  TIMEZONE_DISPLAY,
  CountdownTimeRemaining,
} from "@/lib/dateLock";

interface BirthdayDateLockProps {
  onUnlock?: () => void;
  initialServerTime?: number;
  onPrankLayerChange?: (active: boolean) => void;
}

// Curated calm background soundtracks for the countdown card
const CALM_SOUNDTRACKS = [
  {
    id: "iktara",
    title: "Iktara",
    artist: "Wake Up Sid",
    src: "/music/Iktara.mp3",
    tag: "Acoustic Warmth",
  },
  {
    id: "until-i-found-you",
    title: "Until I Found You",
    artist: "Stephen Sanchez",
    src: "/music/Until_I_Found_You.mp3",
    tag: "Romantic Ballad",
  },
  {
    id: "kalank-lofi",
    title: "Kalank (Lofi)",
    artist: "Acoustic Reverb",
    src: "/music/Sanjay_S_Yadav_Slickmusix_-_Kalank_Lofi_Reverb_(mp3.pm).mp3",
    tag: "Gentle Lofi",
  },
  {
    id: "woh-din",
    title: "Woh Din",
    artist: "Chhichhore",
    src: "/music/Woh_Din.mp3",
    tag: "Nostalgic Melody",
  },
];




export default function BirthdayDateLock({
  onUnlock,
  initialServerTime,
  onPrankLayerChange,
}: BirthdayDateLockProps) {
  // Authoritative clock skew between server and client device
  const clockSkewRef = useRef<number>(
    initialServerTime ? initialServerTime - Date.now() : 0
  );

  const [timeRemaining, setTimeRemaining] = useState<CountdownTimeRemaining>(() => {
    const effectiveNow = Date.now() + clockSkewRef.current;
    return calculateTimeRemaining(effectiveNow);
  });

  // Normal scrapbook countdown states
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockStep, setUnlockStep] = useState<0 | 1 | 2 | 3>(0);
  const [attemptMessage, setAttemptMessage] = useState<string | null>(null);
  const [lockWiggle, setLockWiggle] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ── Tester Bypass State (anuj88) ──
  const [showTesterModal, setShowTesterModal] = useState(false);
  const [testerInput, setTesterInput] = useState("");
  const [isBypassing, setIsBypassing] = useState(false);
  const [testerError, setTesterError] = useState("");

  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ── CALM BACKGROUND MUSIC (Plays on Countdown Card) ───────────────
  const calmAudioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isCalmMusicPlaying, setIsCalmMusicPlaying] = useState(false);
  const [calmMusicVolume, setCalmMusicVolume] = useState(0.38);
  const [isCalmMuted, setIsCalmMuted] = useState(false);

  // Initialize and update calm audio instance on track change
  useEffect(() => {
    if (typeof window === "undefined") return;
    const track = CALM_SOUNDTRACKS[currentTrackIdx];
    const audio = new Audio(track.src);
    audio.loop = true;
    audio.volume = isCalmMuted ? 0 : calmMusicVolume;
    calmAudioRef.current = audio;

    const onPlay = () => setIsCalmMusicPlaying(true);
    const onPause = () => setIsCalmMusicPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    if (!isCalmMuted) {
      audio.play().catch(() => {});
    }

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.pause();
      audio.src = "";
    };
  }, [currentTrackIdx]);

  // Global user gesture unblock listener for browser autoplay policy
  useEffect(() => {
    const handleFirstGesture = () => {
      if (calmAudioRef.current && calmAudioRef.current.paused && !isCalmMuted) {
        calmAudioRef.current.play().catch(() => {});
      }
    };

    window.addEventListener("click", handleFirstGesture, { once: true, passive: true });
    window.addEventListener("touchstart", handleFirstGesture, { once: true, passive: true });

    return () => {
      window.removeEventListener("click", handleFirstGesture);
      window.removeEventListener("touchstart", handleFirstGesture);
    };
  }, [isCalmMuted]);

  // Calm Music Control Handlers
  const toggleCalmPlayPause = useCallback(() => {
    if (!calmAudioRef.current) return;
    if (calmAudioRef.current.paused) {
      calmAudioRef.current.play().catch(() => {});
    } else {
      calmAudioRef.current.pause();
    }
  }, []);

  const nextCalmTrack = useCallback(() => {
    setCurrentTrackIdx((prev) => (prev + 1) % CALM_SOUNDTRACKS.length);
  }, []);

  const toggleCalmMute = useCallback(() => {
    setIsCalmMuted((prev) => {
      const next = !prev;
      if (calmAudioRef.current) {
        calmAudioRef.current.volume = next ? 0 : calmMusicVolume;
      }
      return next;
    });
  }, [calmMusicVolume]);

  useEffect(() => {
    document.title = "Not yet. 👀";
    onPrankLayerChange?.(false);
  }, [onPrankLayerChange]);

  // Check prefers-reduced-motion
  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Soft Phone Vibration for interactions
  const triggerPhoneVibrate = (pattern: number[] = [80, 40, 80]) => {
    try {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch {}
  };

  // Sync clock authoritative from /api/date-lock on mount and periodically
  const syncServerTime = useCallback(async () => {
    try {
      const startFetch = Date.now();
      const res = await fetch("/api/date-lock", { cache: "no-store" });
      const endFetch = Date.now();
      const latency = (endFetch - startFetch) / 2;

      if (res.ok) {
        const data = await res.json();
        if (data.serverTime) {
          const calibratedServerTime = data.serverTime + latency;
          clockSkewRef.current = calibratedServerTime - endFetch;

          const updated = calculateTimeRemaining(calibratedServerTime);
          setTimeRemaining(updated);

          if (updated.isUnlocked) {
            handleUnlockSequence();
          }
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    syncServerTime();
    const syncInterval = setInterval(syncServerTime, 60000);
    return () => clearInterval(syncInterval);
  }, [syncServerTime]);

  // Main countdown interval (every 1000ms)
  useEffect(() => {
    if (isUnlocked) return;

    const timer = setInterval(() => {
      const currentServerTime = Date.now() + clockSkewRef.current;
      const updated = calculateTimeRemaining(currentServerTime);
      setTimeRemaining(updated);

      if (updated.isUnlocked) {
        clearInterval(timer);
        handleUnlockSequence();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isUnlocked]);

  // Unlock sequence animation when timer reaches zero on 28 Oct
  const handleUnlockSequence = () => {
    setIsUnlocked(true);
    document.title = "Happy 19th Birthday, Anshika ✨ | Made with ❤️ by Anuj";

    setUnlockStep(1); // "Okay..."
    setTimeout(() => {
      setUnlockStep(2); // "Your wait is over. 👀"
    }, 1200);

    setTimeout(() => {
      setUnlockStep(3); // 🔓 "THE DOOR IS OPEN"
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.5 },
          colors: ["#fda4af", "#fbcfe8", "#f43f5e", "#fed7aa", "#fff1f2"],
        });
      } catch {}
    }, 2400);

    setTimeout(() => {
      if (onUnlock) {
        onUnlock();
      }
    }, 4200);
  };

  // ── Tester bypass handler (anuj88) ──
  const triggerTesterBypass = useCallback(
    async (passcode: string) => {
      setIsBypassing(true);
      setTesterError("");
      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: passcode.trim() }),
        });
        const data = await res.json();
        if (res.ok && data.isTester) {
          localStorage.setItem("anshii_auth_session", "true");
          localStorage.setItem("anshii_user_role", "anuj");
          localStorage.setItem("anshii_tester_bypass", "true");
          sessionStorage.setItem("anshii_auth_session", "true");
          sessionStorage.setItem("anshii_user_role", "anuj");
          sessionStorage.setItem("anshii_tester_bypass", "true");
          window.dispatchEvent(
            new CustomEvent("anshii_auth_success", {
              detail: { role: "anuj", isTester: true },
            })
          );
          setShowTesterModal(false);
          setIsUnlocked(true);
          if (onUnlock) onUnlock();
          return true;
        } else {
          setTesterError("Incorrect tester password.");
          return false;
        }
      } catch {
        setTesterError("Connection error checking tester key.");
        return false;
      } finally {
        setIsBypassing(false);
      }
    },
    [onUnlock]
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check URL param ?pass=anuj88 or ?tester=anuj88
      const urlParams = new URLSearchParams(window.location.search);
      const pass = urlParams.get("pass") || urlParams.get("tester");
      if (pass && (pass.toLowerCase() === "anuj88" || pass.toLowerCase() === "@ritusandhu1983")) {
        triggerTesterBypass(pass);
      }
    }

    // Keyboard buffer listener for typing "anuj88"
    let typedBuffer = "";
    let bufferClearTimeout: NodeJS.Timeout | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key.length === 1) {
        typedBuffer += e.key.toLowerCase();
        if (typedBuffer.length > 10) {
          typedBuffer = typedBuffer.slice(-10);
        }
        if (typedBuffer.endsWith("anuj88")) {
          typedBuffer = "";
          triggerTesterBypass("anuj88");
        }
        if (bufferClearTimeout) clearTimeout(bufferClearTimeout);
        bufferClearTimeout = setTimeout(() => {
          typedBuffer = "";
        }, 3000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (bufferClearTimeout) clearTimeout(bufferClearTimeout);
    };
  }, [triggerTesterBypass]);

  // Playful interaction on clicking lock or cards in the cute layout
  const triggerAttemptInteraction = () => {
    if (isUnlocked) return;

    triggerPhoneVibrate([80, 40, 80]);
    setLockWiggle(true);
    setTimeout(() => setLockWiggle(false), 500);

    setAttemptMessage("A little surprise is waiting for you... Opens 28 October! 🌸✨");

    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(() => {
      setAttemptMessage(null);
    }, 3200);
  };

  // Easter egg interaction when clicking the tulip on the scrapbook card
  const handleTulipClick = () => {
    triggerPhoneVibrate([60, 40, 80]);
    try {
      confetti({
        particleCount: 30,
        spread: 65,
        origin: { y: 0.4 },
        colors: ["#fda4af", "#f43f5e", "#fed7aa", "#fbcfe8"],
      });
    } catch {}
    setAttemptMessage("🌷 Locked with care by Anuj! (Opens 28 October ✨)");
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(() => {
      setAttemptMessage(null);
    }, 3200);
  };

  // Floating background petals & celestial sparkles
  const FLOATING_ELEMENTS = [
    { id: 1, left: "7%", top: "12%", delay: 0, duration: 7, size: 22, rotate: 20, icon: "🌸" },
    { id: 2, left: "89%", top: "15%", delay: 1.5, duration: 8.5, size: 24, rotate: -35, icon: "🌷" },
    { id: 3, left: "14%", top: "75%", delay: 0.8, duration: 8, size: 20, rotate: 45, icon: "🌸" },
    { id: 4, left: "84%", top: "80%", delay: 2.2, duration: 9.5, size: 18, rotate: -15, icon: "✨" },
    { id: 5, left: "5%", top: "45%", delay: 3, duration: 9, size: 16, rotate: 60, icon: "🌷" },
    { id: 6, left: "93%", top: "48%", delay: 1.2, duration: 7.5, size: 22, rotate: -50, icon: "🌸" },
    { id: 7, left: "24%", top: "25%", delay: 2.5, duration: 10, size: 15, rotate: 30, icon: "✨" },
    { id: 8, left: "76%", top: "32%", delay: 3.8, duration: 8.2, size: 17, rotate: -25, icon: "💫" },
    { id: 9, left: "38%", top: "88%", delay: 1.8, duration: 9, size: 18, rotate: 15, icon: "🌸" },
    { id: 10, left: "68%", top: "85%", delay: 0.5, duration: 8.8, size: 16, rotate: -40, icon: "⭐" },
    { id: 11, left: "18%", top: "58%", delay: 4.2, duration: 7.8, size: 14, rotate: 25, icon: "✨" },
    { id: 12, left: "82%", top: "64%", delay: 2.9, duration: 8.4, size: 19, rotate: -10, icon: "🌷" },
  ];

  const formatNumber = (num: number) => String(num).padStart(2, "0");

  const whatsappMessage = encodeURIComponent(
    "Anuj what is this 😭 why does this website say my device is quarantined?! what are you hiding until 28 Oct 😂"
  );
  const whatsappUrl = `https://wa.me/918278710552?text=${whatsappMessage}`;

  return (
    <div
      className="relative min-h-[100dvh] w-screen flex flex-col justify-between items-center bg-[#FAF7F2] text-[#3F2E24] overflow-y-auto overflow-x-hidden select-none p-2.5 sm:p-6"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 30%, rgba(253, 164, 175, 0.16) 0%, transparent 65%),
                          radial-gradient(circle at 80% 80%, rgba(254, 215, 170, 0.14) 0%, transparent 55%)`,
      }}
    >
      {/* ── AMBIENT DREAMY GLOWING ORBS ───────────────────────────────────── */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-[#fda4af]/35 via-[#fecdd3]/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-88 h-88 rounded-full bg-gradient-to-bl from-[#fed7aa]/40 via-[#fef3c7]/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 left-1/2 -translate-x-1/2 w-[550px] h-[320px] rounded-full bg-gradient-to-t from-[#fce7f3]/30 via-[#e9d5ff]/20 to-transparent blur-3xl pointer-events-none" />

      {/* ── TOP HEADER (Luxury with Calm Music Player & Status) ──────────── */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between z-20 py-2 sm:py-3 gap-2">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-[#ffe4e6] to-[#fecdd3] border border-[#fda4af]/60 flex items-center justify-center text-xs shadow-2xs">
            💌
          </div>
          <span className="font-serif italic text-base sm:text-lg font-bold text-[#4a3832] tracking-tight flex items-center gap-1.5">
            For You
            <span className="text-xs not-italic text-[#f59e0b]">✨</span>
          </span>
        </div>

        {/* ── CALM MUSIC PLAYER PILL (Plays calming tracks like Iktara) ──── */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#ebdcd0] shadow-[0_2px_14px_rgba(244,63,94,0.08)]">
          {/* Mini Rotating Vinyl */}
          <button
            onClick={toggleCalmPlayPause}
            className="relative flex items-center justify-center cursor-pointer group shrink-0"
            title={isCalmMusicPlaying ? "Pause calm music" : "Play calm music"}
          >
            <motion.div
              animate={isCalmMusicPlaying ? { rotate: 360 } : { rotate: 0 }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "linear" }}
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tr from-[#1c1917] via-[#292524] to-[#44403c] p-[2px] flex items-center justify-center shadow-xs ring-1 ring-black/10"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-[#f43f5e] flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-white shadow-xs" />
              </div>
            </motion.div>
          </button>

          {/* Track Info with animated sound wave */}
          <div
            className="flex flex-col text-left cursor-pointer select-none leading-tight"
            onClick={toggleCalmPlayPause}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] sm:text-[11px] font-sans font-bold text-[#4a3832] truncate max-w-[80px] sm:max-w-[125px]">
                {CALM_SOUNDTRACKS[currentTrackIdx].title}
              </span>
              {isCalmMusicPlaying ? (
                <span className="flex items-end gap-[2px] h-[11px] max-h-[11px] overflow-hidden pb-[1px] text-[#f43f5e] shrink-0" aria-label="Playing">
                  <span className="w-[2.5px] bg-[#f43f5e] rounded-full animate-calm-bar-1" style={{ minHeight: "3px" }} />
                  <span className="w-[2.5px] bg-[#f43f5e] rounded-full animate-calm-bar-2" style={{ minHeight: "3px" }} />
                  <span className="w-[2.5px] bg-[#f43f5e] rounded-full animate-calm-bar-3" style={{ minHeight: "3px" }} />
                </span>
              ) : (
                <span className="text-[9px] text-[#9ca3af] font-mono leading-none">paused</span>
              )}
            </div>
            <span className="text-[8px] sm:text-[9px] text-[#927e76] font-medium truncate max-w-[80px] sm:max-w-[125px]">
              {CALM_SOUNDTRACKS[currentTrackIdx].artist}
            </span>
          </div>

          {/* Play/Pause Button */}
          <button
            onClick={toggleCalmPlayPause}
            className="p-1 hover:bg-[#fff0f3] rounded-full text-[#786457] hover:text-[#f43f5e] transition-colors cursor-pointer"
            title={isCalmMusicPlaying ? "Pause" : "Play"}
          >
            {isCalmMusicPlaying ? (
              <Pause className="w-3 h-3 text-[#f43f5e]" />
            ) : (
              <Play className="w-3 h-3 text-[#786457] ml-0.5" />
            )}
          </button>

          {/* Next Song Button */}
          <button
            onClick={nextCalmTrack}
            className="p-1 hover:bg-[#fff0f3] rounded-full text-[#786457] hover:text-[#f43f5e] transition-colors cursor-pointer"
            title="Next calm song"
          >
            <SkipForward className="w-3 h-3" />
          </button>

          {/* Mute Toggle */}
          <button
            onClick={toggleCalmMute}
            className="p-1 hover:bg-[#fff0f3] rounded-full text-[#786457] hover:text-[#f43f5e] transition-colors cursor-pointer hidden sm:block"
            title={isCalmMuted ? "Unmute" : "Mute"}
          >
            {isCalmMuted ? (
              <VolumeX className="w-3 h-3 text-[#f43f5e]" />
            ) : (
              <Volume2 className="w-3 h-3 text-[#786457]" />
            )}
          </button>
        </div>

        {/* Lock Status Pill */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1 rounded-full bg-white/85 border border-[#ebdcd0] text-[11px] font-sans font-medium text-[#786457] flex items-center gap-1.5 shadow-2xs">
            <Lock className="w-3 h-3 text-[#f43f5e]" />
            <span className="hidden sm:inline">Opens 28 Oct</span>
            <span className="sm:hidden">28 Oct</span>
          </div>
        </div>
      </header>

      {/* ── FLOATING PARTICLES (Disabled if prefers-reduced-motion) ─────────── */}
      {mounted && !prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {FLOATING_ELEMENTS.map((el) => (
            <motion.div
              key={el.id}
              className="absolute opacity-40 text-[#FDA4AF] select-none"
              style={{
                left: el.left,
                top: el.top,
                fontSize: `${el.size}px`,
              }}
              animate={{
                y: [0, -22, 0],
                rotate: [el.rotate, el.rotate + 18, el.rotate],
                opacity: [0.35, 0.65, 0.35],
              }}
              transition={{
                duration: el.duration,
                repeat: Infinity,
                delay: el.delay,
                ease: "easeInOut",
              }}
            >
              {el.icon}
            </motion.div>
          ))}
        </div>
      )}

      {/* ── RESTORED ORIGINAL CUTE CENTERPIECE CARD (Luxury Scrapbook) ─────── */}
      <main className="relative z-10 w-full max-w-[540px] mx-auto my-auto flex flex-col items-center">
        {/* Subtle Playful Attempt Toast / Speech Bubble */}
        <AnimatePresence>
          {attemptMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mb-3 px-4 py-2 rounded-2xl bg-[#4A3832] text-[#FFFDF9] text-xs sm:text-sm font-sans font-medium shadow-lg border border-[#F4A9B8]/40 flex items-center gap-2 z-30"
            >
              <span>{attemptMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Luxury Scrapbook Card */}
        <motion.div
          animate={lockWiggle ? { x: [-6, 6, -5, 5, -2, 2, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="relative w-full rounded-[28px] sm:rounded-[36px] bg-gradient-to-b from-[#ffffff] via-[#fffcf9] to-[#fff6f7] border-2 border-[#eeddd3] ring-1 ring-[#f59e0b]/20 shadow-[0_25px_80px_-15px_rgba(244,63,94,0.18),0_0_0_1px_rgba(255,255,255,0.95)_inset,0_10px_35px_rgba(251,113,133,0.12)] p-4 sm:p-9 text-center overflow-hidden"
        >
          {/* Top Decorative Gold-Foil Floral Washi Tape */}
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-36 h-7 bg-gradient-to-r from-[#fed7aa] via-[#fef08a] to-[#fed7aa] border-b border-[#f59e0b]/35 shadow-xs rotate-[-1.2deg] pointer-events-none rounded-xs flex items-center justify-around px-2 opacity-95"
            style={{
              clipPath: "polygon(0 0, 100% 0, 97% 50%, 100% 100%, 0 100%, 3% 50%)",
            }}
          >
            <span className="text-[8.5px] text-[#92400e]/70 font-serif tracking-widest">✦ ✦ ✦ ✦ ✦ ✦ ✦</span>
          </div>

          {/* Corner Miniature Rose Washi Tape */}
          <div
            className="absolute -bottom-2 -right-3 w-18 h-5.5 bg-[#fbcfe8]/85 shadow-2xs rotate-[-12deg] pointer-events-none rounded-xs"
            style={{ clipPath: "polygon(4% 0, 100% 0, 96% 100%, 0 100%)" }}
          />

          {/* Delicate Botanical Vine in Top Left */}
          <div className="absolute top-3 left-3 text-[#fda4af]/35 pointer-events-none select-none text-base">
            🌿
          </div>
          <div className="absolute bottom-3 left-3 text-[#fda4af]/30 pointer-events-none select-none text-sm">
            🌸
          </div>

          {/* Authentic Vintage Postage Stamp Top Right */}
          <div className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-lg border-2 border-dashed border-[#f43f5e]/45 bg-[#fff5f6] text-[10px] font-sans font-bold text-[#be185d] rotate-3 tracking-wider shadow-xs flex flex-col items-center select-none">
            <span className="text-[7.5px] uppercase tracking-widest text-[#9f1239] font-mono">PAR AVION</span>
            <span className="font-serif font-black text-[12px] text-[#be123c] leading-tight my-0.5">OCT 28 &apos;26</span>
            <div className="flex items-center gap-0.5 text-[7px] text-[#fda4af] leading-none opacity-80">
              <span>〰️〰️〰️</span>
            </div>
          </div>

          {/* Glowing Tulip Halo with Easter Egg Click */}
          <div className="relative inline-flex items-center justify-center mb-2">
            <motion.button
              whileHover={{ scale: 1.12, rotate: 6 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleTulipClick}
              title="A sweet little tulip 🌷"
              className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#ffe4e6] to-[#fef3c7] shadow-[0_0_28px_rgba(253,164,175,0.6)] flex items-center justify-center cursor-pointer border border-[#fbcfe8] active:rotate-12 transition-transform"
            >
              <span className="text-3xl sm:text-4xl select-none">🌷</span>
            </motion.button>
          </div>

          {/* Crystal Glassmorphic Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#fff0f3] to-[#fce7f3] border border-[#fbcfe8] text-[11px] sm:text-xs font-sans font-semibold text-[#be185d] mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#f43f5e] animate-pulse" />
            <span className="tracking-wide">Something is waiting...</span>
          </div>

          {/* Main Headline in Playfair Display */}
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#3f2e24] tracking-tight leading-tight mb-2 drop-shadow-[0_1px_2px_rgba(120,53,15,0.06)]">
            Not yet. 👀
          </h1>

          {/* Subtitle */}
          <p className="font-sans text-xs sm:text-sm text-[#786457] font-medium leading-relaxed">
            You found the door a little early.
          </p>

          {/* Highlight Badge */}
          <div className="inline-block my-1 px-3.5 py-0.5 rounded-full bg-[#fff0f3] border border-[#fda4af]/45 shadow-2xs">
            <span className="font-sans text-xs sm:text-sm text-[#be185d] font-bold">
              Come back on 28 October.
            </span>
          </div>

          {/* ── COUNTDOWN TIMER (Luxury Pearl Tiles with Specular Glaze) ─────── */}
          <div className="my-4 sm:my-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 max-w-md mx-auto">
              {/* DAYS */}
              <div
                onClick={triggerAttemptInteraction}
                className="group relative overflow-hidden cursor-pointer rounded-2xl bg-gradient-to-b from-[#ffffff] via-[#fdfbf9] to-[#faf6f0] border-2 border-[#ebdcd0] hover:border-[#fda4af] transition-all p-3 sm:p-4 flex flex-col items-center justify-center shadow-xs hover:shadow-md hover:-translate-y-1 active:scale-95"
              >
                <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />
                <span className="font-serif text-2xl sm:text-3xl font-extrabold bg-gradient-to-b from-[#881337] via-[#9f1239] to-[#be123c] bg-clip-text text-transparent tracking-tight leading-none mb-1 drop-shadow-xs">
                  {formatNumber(timeRemaining.days)}
                </span>
                <span className="font-sans text-[10px] sm:text-[11px] font-bold text-[#927e76] uppercase tracking-wider">
                  DAYS
                </span>
              </div>

              {/* HOURS */}
              <div
                onClick={triggerAttemptInteraction}
                className="group relative overflow-hidden cursor-pointer rounded-2xl bg-gradient-to-b from-[#ffffff] via-[#fdfbf9] to-[#faf6f0] border-2 border-[#ebdcd0] hover:border-[#fda4af] transition-all p-3 sm:p-4 flex flex-col items-center justify-center shadow-xs hover:shadow-md hover:-translate-y-1 active:scale-95"
              >
                <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />
                <span className="font-serif text-2xl sm:text-3xl font-extrabold bg-gradient-to-b from-[#881337] via-[#9f1239] to-[#be123c] bg-clip-text text-transparent tracking-tight leading-none mb-1 drop-shadow-xs">
                  {formatNumber(timeRemaining.hours)}
                </span>
                <span className="font-sans text-[10px] sm:text-[11px] font-bold text-[#927e76] uppercase tracking-wider">
                  HOURS
                </span>
              </div>

              {/* MINUTES */}
              <div
                onClick={triggerAttemptInteraction}
                className="group relative overflow-hidden cursor-pointer rounded-2xl bg-gradient-to-b from-[#ffffff] via-[#fdfbf9] to-[#faf6f0] border-2 border-[#ebdcd0] hover:border-[#fda4af] transition-all p-3 sm:p-4 flex flex-col items-center justify-center shadow-xs hover:shadow-md hover:-translate-y-1 active:scale-95"
              >
                <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />
                <span className="font-serif text-2xl sm:text-3xl font-extrabold bg-gradient-to-b from-[#881337] via-[#9f1239] to-[#be123c] bg-clip-text text-transparent tracking-tight leading-none mb-1 drop-shadow-xs">
                  {formatNumber(timeRemaining.minutes)}
                </span>
                <span className="font-sans text-[10px] sm:text-[11px] font-bold text-[#927e76] uppercase tracking-wider">
                  MINUTES
                </span>
              </div>

              {/* SECONDS (Special radiant blush pulse) */}
              <div
                onClick={triggerAttemptInteraction}
                className="group relative overflow-hidden cursor-pointer rounded-2xl bg-gradient-to-b from-[#fff1f2] to-[#ffe4e6] border-2 border-[#fda4af] hover:border-[#f43f5e] transition-all p-3 sm:p-4 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.18)] hover:shadow-[0_0_25px_rgba(244,63,94,0.3)] hover:-translate-y-1 active:scale-95"
              >
                <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />
                <motion.span
                  key={timeRemaining.seconds}
                  initial={prefersReducedMotion ? false : { scale: 1.15, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="font-serif text-2xl sm:text-3xl font-extrabold text-[#be123c] tracking-tight leading-none mb-1 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                >
                  {formatNumber(timeRemaining.seconds)}
                </motion.span>
                <span className="font-sans text-[10px] sm:text-[11px] font-bold text-[#be123c] uppercase tracking-wider">
                  SECONDS
                </span>
              </div>
            </div>

            {/* DATE LABEL */}
            <div className="mt-3.5 pt-2.5 border-t border-[#f2e8df] flex items-center justify-center gap-2 text-xs font-sans text-[#786457]">
              <span className="font-medium">Unlocks {DATE_DISPLAY}</span>
              <span className="text-[#d1c2b8]">•</span>
              <span className="font-semibold text-[#be185d]">{TIMEZONE_DISPLAY}</span>
            </div>
          </div>

          {/* ── SECRET NOTE (Tactile Folded Kraft Paper with Rose Pin) ───────── */}
          <div className="relative mt-3.5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#fefbf7] via-[#fffdfa] to-[#fbf5ee] border border-[#ebdcd0] shadow-[0_4px_16px_rgba(120,53,15,0.05)] text-center rotate-[-0.6deg]">
            {/* Rose-Gold Pin Top Left */}
            <div className="absolute -top-2.5 left-6 w-5 h-5 rounded-full bg-gradient-to-tr from-[#f43f5e] to-[#fecdd3] shadow-xs flex items-center justify-center text-[10px] pointer-events-none border border-white select-none">
              📌
            </div>

            <p className="font-serif italic text-sm sm:text-base font-bold text-[#3f2e24]">
              &ldquo;Yes, I actually locked it. 😂&rdquo;
            </p>
            <p className="font-sans text-xs text-[#786457] mt-0.5 font-medium">
              Knowing the password won&apos;t help you yet — see you on 28 October! 🤍
            </p>
            <div className="mt-1 text-[11px] font-serif italic text-[#be185d] font-semibold text-right pr-2">
              — Anuj ✨
            </div>
          </div>

          {/* ── ACTION BUTTONS ──────────────────────────────────────────────── */}
          <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            {/* Ask Anuj on WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#fda4af] via-[#fb7185] to-[#f43f5e] hover:brightness-105 text-xs font-sans font-bold text-white shadow-[0_4px_18px_rgba(244,63,94,0.35)] hover:shadow-[0_6px_24px_rgba(244,63,94,0.45)] hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-white" />
              <span>Ask Anuj on WhatsApp</span>
            </a>
          </div>

          {/* ── AUTHENTIC EMBOSSED CRIMSON WAX SEAL (Bottom Right) ───────────── */}
          <div className="absolute -bottom-1 right-3 sm:bottom-2 sm:right-4 flex flex-col items-center pointer-events-none select-none z-10">
            {/* Twin blush-rose satin ribbon tails */}
            <div className="relative flex justify-center -space-x-1.5 -mb-2 z-0 opacity-85">
              <div
                className="w-2.5 h-6 bg-[#be123c] rotate-[15deg] rounded-b-xs shadow-2xs"
                style={{ clipPath: "polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)" }}
              />
              <div
                className="w-2.5 h-7 bg-[#9f1239] rotate-[-12deg] rounded-b-xs shadow-2xs"
                style={{ clipPath: "polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)" }}
              />
            </div>
            {/* 3D Wax Seal Stamp */}
            <div className="vintage-wax-seal relative z-10 w-11 h-11 rounded-full flex items-center justify-center">
              <div className="vintage-wax-seal-inner w-8.5 h-8.5 rounded-full flex items-center justify-center">
                <span className="text-white text-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">🌷</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── UNLOCK ANIMATION OVERLAY (When timer hits 0 on Oct 28) ──────────── */}
        <AnimatePresence>
          {isUnlocked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="max-w-md w-full p-8 rounded-3xl bg-white border-2 border-[#FDA4AF] shadow-2xl flex flex-col items-center">
                {unlockStep >= 3 ? (
                  <motion.div
                    initial={{ scale: 0.5, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="w-16 h-16 rounded-3xl bg-[#FFF0F3] border border-[#FBCFE8] flex items-center justify-center mb-4 text-[#F43F5E]"
                  >
                    <Unlock className="w-8 h-8" />
                  </motion.div>
                ) : (
                  <div className="w-16 h-16 rounded-3xl bg-[#FAF7F2] border border-[#EBDCD0] flex items-center justify-center mb-4 text-[#786457]">
                    <Lock className="w-8 h-8 animate-pulse" />
                  </div>
                )}

                {unlockStep === 1 && (
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-serif text-2xl font-bold text-[#3F2E24]"
                  >
                    Okay...
                  </motion.h2>
                )}

                {unlockStep === 2 && (
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-serif text-2xl font-bold text-[#3F2E24]"
                  >
                    Your wait is over. 👀
                  </motion.h2>
                )}

                {unlockStep >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-2"
                  >
                    <h2 className="font-serif text-3xl font-extrabold text-[#BE185D] tracking-tight">
                      THE DOOR IS OPEN
                    </h2>
                    <p className="font-sans text-xs text-[#786457]">
                      Loading your surprise...
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="w-full max-w-4xl mx-auto py-3 text-center z-10">
        <p className="font-serif italic text-xs sm:text-sm text-[#786457] font-medium tracking-wide">
          See you on the other side. 🌷
        </p>
      </footer>
    </div>
  );
}
