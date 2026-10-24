"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Unlock,
  Sparkles,
  ShieldAlert,
  Terminal,
  Skull,
  Flame,
  MessageCircle,
  Eye,
  X,
  AlertOctagon,
  Radio,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
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

// 4 Options for "When did we talk for the first time?" (Exact date from chat archive: 14 August 2026)
const FIRST_TALK_OPTIONS = [
  { id: 0, date: "10 August", fullDate: "10 August 2026", isCorrect: false },
  { id: 1, date: "14 August", fullDate: "14 August 2026", isCorrect: true },
  { id: 2, date: "18 August", fullDate: "18 August 2026", isCorrect: false },
  { id: 3, date: "24 August", fullDate: "24 August 2026", isCorrect: false },
];

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


const HACKER_PRANK_MESSAGES = [
  "Nice try! Even NASA can't bypass this before the 28th. 😂",
  "🚨 ALERT: Unauthorized visitor caught snooping around the secret vault!",
  "Access Denied: Protected by Anuj's anti-snooper firewall. 🛡️",
  "Error 403: Snooper detected. Go away and come back on Oct 28! 👀",
  "Decryption attempt failed. Security level: MAXIMUM ANUJ DEFENSE. 😂",
  "Bro, it's NOT opening early. Stop pressing the button! 😭",
  "October 28. Mark your calendar. Not today! 🌷",
  "Your IP has been logged into the 'Impatient People Hall of Fame' 🏆😂",
  "Trying to break into the secret vault? Nice try. 😂",
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

  // Scary hacker prank layer visibility (disabled / removed)
  const [showHackerLayer, setShowHackerLayer] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const [prankAlert, setPrankAlert] = useState<string | null>(null);
  const [sirenActive, setSirenActive] = useState(false);
  const [showPrankRevealModal, setShowPrankRevealModal] = useState(false);

  // Disarm Game State: "When did we talk for the first time?" (4 options, strictly 2 attempts)
  const [disarmAttemptsLeft, setDisarmAttemptsLeft] = useState<number>(2);
  const [disarmWrongSelected, setDisarmWrongSelected] = useState<number[]>([]);
  const [disarmSuccess, setDisarmSuccess] = useState<boolean>(false);
  const [disarmShake, setDisarmShake] = useState<boolean>(false);
  const [disarmMessage, setDisarmMessage] = useState<string | null>(null);
  const [disarmCooldown, setDisarmCooldown] = useState<number>(0);
  const disarmSectionRef = useRef<HTMLDivElement | null>(null);

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

  // Audio Context Ref for Buzzer Siren
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sirenIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

    // If countdown card screen is active, start playing immediately
    if (!showHackerLayer && !isCalmMuted) {
      audio.play().catch(() => {});
    }

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.pause();
      audio.src = "";
    };
  }, [currentTrackIdx]);

  // Coordinate Calm Music with Siren (Pause during siren, resume on countdown card)
  useEffect(() => {
    if (showHackerLayer) {
      if (calmAudioRef.current && !calmAudioRef.current.paused) {
        calmAudioRef.current.pause();
      }
    } else {
      if (calmAudioRef.current && calmAudioRef.current.paused && !isCalmMuted) {
        calmAudioRef.current.play().catch(() => {});
      }
    }
  }, [showHackerLayer, isCalmMuted]);

  // Global user gesture unblock listener for browser autoplay policy
  useEffect(() => {
    if (showHackerLayer) return;

    const handleFirstGesture = () => {
      if (calmAudioRef.current && calmAudioRef.current.paused && !isCalmMuted && !showHackerLayer) {
        calmAudioRef.current.play().catch(() => {});
      }
    };

    window.addEventListener("click", handleFirstGesture, { once: true, passive: true });
    window.addEventListener("touchstart", handleFirstGesture, { once: true, passive: true });

    return () => {
      window.removeEventListener("click", handleFirstGesture);
      window.removeEventListener("touchstart", handleFirstGesture);
    };
  }, [showHackerLayer, isCalmMuted]);

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


  // Simulated live hacker terminal logs (ZERO CLUES)
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "INITIALIZING SYSTEM LOCKDOWN PROTOCOL...",
    "Connection flagged: [VISITOR_DEVICE] (Access Unverified)",
    "Bypassing security certificates... ACCESS DENIED",
    "Target personal archives... [ENCRYPTED - AES-256 GCM]",
  ]);
  const [hackProgress, setHackProgress] = useState(65);

  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enforce zero-clue mysterious title before Oct 28
  useEffect(() => {
    if (showHackerLayer) {
      document.title = "🚨 SECURITY WARNING // ACCESS RESTRICTED";
    } else {
      document.title = "Not yet. 👀";
    }
  }, [showHackerLayer]);

  // Sync prank layer status with parent for cursor mode switching
  useEffect(() => {
    onPrankLayerChange?.(showHackerLayer);
  }, [showHackerLayer, onPrankLayerChange]);

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

  // High-Intensity Phone Vibration
  const triggerPhoneVibrate = (
    pattern: number[] = [450, 40, 450, 40, 600, 60, 500, 40, 500]
  ) => {
    try {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch {}
  };

  // Step tracker for two-tone alternating siren
  const sirenStepRef = useRef(0);

  // Realistic Alarm Buzzer Sound Synthesizer (DISABLED / REMOVED)
  const playRealisticBuzzer = useCallback(() => {
    // Siren removed completely
  }, []);

  // Start Repeating Alarm Siren at Full Volume & High-Intensity Vibration (DISABLED / REMOVED)
  const startSiren = useCallback(() => {
    // Siren removed completely
  }, []);

  // Stop Repeating Alarm Siren
  const stopSiren = useCallback(() => {
    setSirenActive(false);
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
  }, []);

  // Low-frequency error buzz on wrong date attempt
  const playErrorBuzz = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(70, now + 0.32);
      gain.gain.setValueAtTime(0.55, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    } catch {}
  }, []);

  // Sweet victory chime on correct first talk date
  const playVictoryChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.35, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.55);
      });
    } catch {}
  }, []);

  // Handle Disarm Question: "When did we talk for the first time?" (4 options, strictly 2 attempts)
  const handleSelectFirstTalkDate = useCallback(
    (optionId: number) => {
      if (disarmAttemptsLeft <= 0 || disarmSuccess || disarmWrongSelected.includes(optionId)) {
        return;
      }

      const selected = FIRST_TALK_OPTIONS.find((o) => o.id === optionId);
      if (!selected) return;

      if (selected.isCorrect) {
        // Correct date! Disarm emergency siren & lockdown
        stopSiren();
        playVictoryChime();
        triggerPhoneVibrate([150, 40, 150, 40, 350]);
        setDisarmSuccess(true);
        setDisarmMessage("🎉 IDENTITY VERIFIED! You remembered 14 August 2026! ❤️");
        try {
          confetti({
            particleCount: 90,
            spread: 95,
            origin: { y: 0.5 },
            colors: ["#fda4af", "#34d399", "#fed7aa", "#f43f5e", "#38bdf8"],
          });
        } catch {}
      } else {
        // Wrong date selected
        playErrorBuzz();
        triggerPhoneVibrate([240, 60, 240]);
        setDisarmShake(true);
        setTimeout(() => setDisarmShake(false), 500);

        const remaining = disarmAttemptsLeft - 1;
        setDisarmAttemptsLeft(remaining);
        setDisarmWrongSelected((prev) => [...prev, optionId]);

        if (remaining === 1) {
          setDisarmMessage(
            "❌ WRONG DATE! 🚨 Only 1 ATTEMPT REMAINING! Think carefully... how could you forget when we first talked?! 😭"
          );
        } else {
          // 0 attempts remaining -> Lockdown penalty
          setDisarmMessage(
            "🚨 2 FAILED ATTEMPTS! ACCESS LOCKED! 🚨 How could you forget?! 😭💔 Siren will KEEP PLAYING!"
          );
          setDisarmCooldown(15);
        }
      }
    },
    [disarmAttemptsLeft, disarmSuccess, disarmWrongSelected, stopSiren, playVictoryChime, playErrorBuzz]
  );

  // Cooldown countdown if both attempts are exhausted
  useEffect(() => {
    if (disarmCooldown <= 0) return;
    const interval = setInterval(() => {
      setDisarmCooldown((c) => {
        if (c <= 1) {
          setDisarmAttemptsLeft(2);
          setDisarmWrongSelected([]);
          setDisarmMessage("💡 Cooldown expired. You have 2 fresh attempts. Think carefully! 🌷");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [disarmCooldown]);

  // Siren disabled
  useEffect(() => {
    stopSiren();
  }, [stopSiren]);

  const handleOpenSecretVault = useCallback(() => {
    stopSiren();
    setShowPrankRevealModal(false);
    setShowHackerLayer(false);
  }, [stopSiren]);

  // Intercept Back button, Tab Close, and Exit Intent to reveal the prank
  useEffect(() => {
    if (!showHackerLayer || isUnlocked) return;

    // 1. History state push to catch browser back button / swipe back
    try {
      window.history.pushState({ prankActive: true }, "", window.location.href);
    } catch {}

    const handlePopState = () => {
      setShowPrankRevealModal(true);
      try {
        window.history.pushState({ prankActive: true }, "", window.location.href);
      } catch {}
    };

    // 2. BeforeUnload (when closing tab / browser window)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      setShowPrankRevealModal(true);
      e.preventDefault();
      e.returnValue = "Wait! It's just a little prank by Anuj! 😂 Answer the question to stop the siren!";
      return "Wait! It's just a little prank by Anuj! 😂 Answer the question to stop the siren!";
    };

    // 3. Desktop exit intent (mouse moves up toward tabs / close button)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 15) {
        setShowPrankRevealModal(true);
      }
    };

    // 4. Mobile tab switch / app minimize (visibilitychange)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stopSiren();
      } else if (document.visibilityState === "visible") {
        if (!disarmSuccess) {
          startSiren();
          setShowPrankRevealModal(true);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("visibilitychange", handleVisibilityChange);


    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [showHackerLayer, isUnlocked, stopSiren]);

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

  // Terminal log simulation in prank layer (NO BIRTHDAY MENTIONS)
  useEffect(() => {
    const stream = [
      "Accessing personal photo archives... [LOCKED]",
      "Security firewall engaged: ANUJ-SEC-V2",
      "Manual crack attempt: ACCESS_OVERRIDE -> FAILED [403]",
      "Defense status: System locked until Oct 28 00:00 IST",
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < stream.length && stream[i]) {
        const nextLog = stream[i];
        setTerminalLogs((prev) => [...prev.slice(-4), nextLog]);
        setHackProgress((p) => Math.min(99, p + 11));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  // Unlock sequence animation when timer reaches zero on 28 Oct
  const handleUnlockSequence = () => {
    stopSiren();
    setIsUnlocked(true);
    setShowHackerLayer(false);
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
          stopSiren();
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
    [onUnlock, stopSiren]
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check URL param ?pass=anuj88 or ?tester=anuj88
      const urlParams = new URLSearchParams(window.location.search);
      const pass = urlParams.get("pass") || urlParams.get("tester");
      if (pass && pass.toLowerCase() === "anuj88") {
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

    triggerPhoneVibrate([100, 50, 100]);
    playRealisticBuzzer();

    setLockWiggle(true);
    setTimeout(() => setLockWiggle(false), 500);

    const msg =
      HACKER_PRANK_MESSAGES[
        Math.floor(Math.random() * HACKER_PRANK_MESSAGES.length)
      ];
    setAttemptMessage(msg);

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

  // Trigger funny hacker crack attempt inside the prank layer
  const handleBypassAttempt = () => {
    startSiren();
    setGlitchActive(true);
    setTimeout(() => setGlitchActive(false), 600);

    const randomMsg =
      HACKER_PRANK_MESSAGES[
        Math.floor(Math.random() * HACKER_PRANK_MESSAGES.length)
      ];
    setPrankAlert(randomMsg);

    setTerminalLogs((prev) => [
      ...prev.slice(-3),
      `> INTRUSION ALERT: MANUAL OVERRIDE REJECTED ❌`,
      `> ${randomMsg}`,
    ]);

    setTimeout(() => {
      setPrankAlert(null);
    }, 3600);
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
      className="relative min-h-[100dvh] w-screen flex flex-col justify-between items-center bg-[#FAF7F2] text-[#3F2E24] overflow-hidden select-none p-3 sm:p-6"
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
          className="relative w-full rounded-[36px] bg-gradient-to-b from-[#ffffff] via-[#fffcf9] to-[#fff6f7] border-2 border-[#eeddd3] ring-1 ring-[#f59e0b]/20 shadow-[0_25px_80px_-15px_rgba(244,63,94,0.18),0_0_0_1px_rgba(255,255,255,0.95)_inset,0_10px_35px_rgba(251,113,133,0.12)] p-6 sm:p-9 text-center overflow-hidden"
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

            {/* Door Check Button */}
            <button
              onClick={() => {
                setShowHackerLayer(true);
                startSiren();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-white/95 hover:bg-[#fff0f3] border border-[#ebdcd0] hover:border-[#fbcfe8] text-xs font-sans font-medium text-[#786457] hover:text-[#be185d] transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <Lock className="w-3.5 h-3.5 text-[#f43f5e]" />
              <span>Check Door</span>
            </button>

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

      {/* ── THE EXTRA LAYER: REALISTIC SECURITY BREACH & SIREN BUZZER PRANK (DISABLED) ──── */}
      <AnimatePresence>
        {false && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className={`fixed inset-0 z-50 bg-[#070508]/98 backdrop-blur-xl flex flex-col justify-between items-center p-3 sm:p-6 font-mono text-[#f3f4f6] overflow-y-auto ${
              glitchActive ? "translate-x-2 filter invert hue-rotate-180" : ""
            } ${sirenActive ? "border-4 border-[#ef4444] shadow-[inset_0_0_80px_rgba(239,68,68,0.5)] animate-high-intensity-vibrate" : ""}`}
            style={{
              backgroundImage: `radial-gradient(circle at 50% 12%, rgba(239, 68, 68, 0.28) 0%, transparent 65%),
                                repeating-linear-gradient(0deg, rgba(0,0,0,0.6) 0px, rgba(0,0,0,0.6) 1px, transparent 2px, transparent 4px)`,
            }}
          >
            {/* Crisp Red & White Emergency Strobe in Full Brightness */}
            <div className="pointer-events-none fixed inset-0 z-[70] animate-crisp-red-white-strobe mix-blend-screen" />
            <div className="pointer-events-none fixed inset-0 z-[69] animate-crisp-beacon" />

            {/* Top Red Security Siren Lightbar */}
            <div className="w-full max-w-2xl mx-auto flex items-center justify-between py-2 px-3 rounded-2xl bg-black/60 border border-[#3b172a] backdrop-blur-md mb-2">
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-ping absolute" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] sm:text-xs font-bold text-[#fca5a5] tracking-widest uppercase font-mono">
                    INCIDENT #SEC-9842 // THREAT LEVEL: MAXIMUM
                  </span>
                  <span className="text-[9px] text-[#f87171]/70 font-mono">
                    TARGET: UNAUTHORIZED VISITOR // VAULT LOCKDOWN ACTIVE
                  </span>
                </div>
              </div>

              {/* Audio Equalizer visualizer */}
              {/* Audio Equalizer visualizer */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 h-5 px-2.5 py-0.5 rounded-full bg-black/70 border border-[#ef4444]/40">
                  <Volume2 className="w-3 h-3 text-[#ef4444] animate-pulse" />
                  <span className="w-1 h-3 rounded-full bg-[#ef4444] animate-audio-bar-1" />
                  <span className="w-1 h-4 rounded-full bg-[#f43f5e] animate-audio-bar-2" />
                  <span className="w-1 h-2 rounded-full bg-[#fb7185] animate-audio-bar-3" />
                  <span className="w-1 h-5 rounded-full bg-[#ef4444] animate-audio-bar-4" />
                  <span className="text-[9px] font-mono text-[#fca5a5] font-bold ml-1">SIREN 100%</span>
                </div>
              </div>
            </div>

            {/* Hacker Card Modal */}
            <div className="w-full max-w-lg mx-auto my-auto py-2">
              {/* Alert Header Strobe Banner */}
              <div className="w-full mb-3 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#350d18] border-2 border-[#ef4444] text-center shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse">
                <AlertOctagon className="w-5 h-5 text-[#ef4444] shrink-0 animate-bounce" />
                <span className="text-xs sm:text-sm font-extrabold text-[#fecaca] tracking-wide uppercase">
                  ⚠ CRITICAL SECURITY INTRUSION DETECTED ⚠
                </span>
              </div>

              {/* Realistic Cyber Terminal Snippet */}
              <div className="w-full mb-3 rounded-2xl bg-[#09060c] border border-[#3b172a] p-3 text-[11px] text-[#9ca3af] shadow-inner text-left">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#210f1c] text-[10px] text-[#6b7280]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
                    <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                    <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                    <span className="ml-1 text-[#f43f5e] font-semibold font-mono">
                      sec-monitor@anuj-vault:~# ./quarantine_device
                    </span>
                  </div>
                  <span className="text-[#ef4444] font-bold font-mono">DEFENSE: {hackProgress}%</span>
                </div>

                <div className="space-y-1 leading-relaxed font-mono">
                  {terminalLogs
                    .filter((log): log is string => typeof log === "string" && Boolean(log))
                    .map((log, index) => {
                      const isFailed = log.includes("DENIED") || log.includes("FAILED");
                      const isSuccess = log.includes("LOCKDOWN") || log.includes("ENCRYPTED");
                      return (
                        <div
                          key={index}
                          className={
                            isFailed
                              ? "text-[#f87171] font-bold"
                              : isSuccess
                              ? "text-[#fbbf24]"
                              : "text-[#d1d5db]"
                          }
                        >
                          <span className="text-[#f43f5e] mr-1.5">&gt;</span>
                          {log}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Playful Prank Alert Toast */}
              <AnimatePresence>
                {prankAlert && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="w-full mb-3 px-3.5 py-2 rounded-xl bg-[#450a0a] border border-[#ef4444] text-[#fecaca] text-xs font-sans font-bold flex items-center gap-2 text-left"
                  >
                    <Flame className="w-4 h-4 text-[#f87171] shrink-0 animate-bounce" />
                    <span>{prankAlert}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── QUARANTINE CONTAINMENT CARD (NO QUESTION & NO REDIRECT HERE) ── */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#1b0a1d]/95 via-[#120514]/95 to-[#09020b]/95 border-2 border-[#ef4444] shadow-[0_0_50px_rgba(239,68,68,0.4)] p-6 sm:p-8 text-center transition-all">
                {/* Glowing neon top accent line */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#ef4444] to-transparent opacity-90 animate-pulse" />

                <div className="w-16 h-16 rounded-full bg-[#350d18] border-2 border-[#ef4444] mx-auto flex items-center justify-center text-3xl mb-3 shadow-[0_0_30px_rgba(239,68,68,0.6)] animate-pulse">
                  🔒
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ef4444]/20 border border-[#ef4444]/60 text-[#fca5a5] text-xs font-bold uppercase tracking-wider font-mono mb-2">
                  <Skull className="w-3.5 h-3.5 text-[#ef4444]" />
                  <span>TOTAL QUARANTINE // INESCAPABLE CONTAINMENT</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                  SYSTEM LOCKED BY ANUJ 🚨
                </h2>

                <p className="font-sans text-xs sm:text-sm text-[#fca5a5] leading-relaxed max-w-sm mx-auto mb-4 font-mono">
                  Siren is locked on 100% volume. Root access is blocked until 28 October 2026.
                </p>

                <div className="p-3 rounded-2xl bg-black/60 border border-[#ef4444]/40 max-w-sm mx-auto mb-5 text-left font-mono text-[11px] text-[#9ca3af] space-y-1">
                  <div className="text-[#f87171] font-bold">&gt; BYPASS ATTEMPTS: REJECTED ❌</div>
                  <div className="text-[#fbbf24]">&gt; AUDIO SIREN: UNMUTABLE 🔊</div>
                  <div className="text-[#d1d5db]">&gt; TARGET: VISITOR_DEVICE // 0 PRIVILEGES</div>
                </div>

                {/* Mobile / Direct Escape Attempt Button (triggers question modal) */}
                <button
                  onClick={() => setShowPrankRevealModal(true)}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-[#2c0b16] to-[#1c081e] hover:from-[#3d1222] hover:to-[#280c2b] border border-[#ef4444]/60 text-xs font-mono font-bold text-[#fca5a5] hover:text-white flex items-center justify-center gap-2 mx-auto cursor-pointer transition-all active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.25)]"
                >
                  <X className="w-3.5 h-3.5 text-[#f87171]" />
                  <span>Try to Exit / Close Tab</span>
                </button>
              </div>
            </div>

            {/* Bottom Disclaimer */}
            <div className="py-2 text-[10px] text-[#6b7280]">
              *Security lock strictly active until 28 October 2026 00:00 IST. Nice try though! 😂
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PRANK REVEAL MODAL: TRIGGERED WHEN TRYING TO BACK OR CLOSE TAB (DISABLED) ──── */}
      <AnimatePresence>
        {false && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 selection:bg-[#fda4af]/40"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 380, damping: 25 }}
              className={`w-full max-w-lg rounded-3xl bg-[#140816]/95 border-2 ${
                disarmSuccess
                  ? "border-[#10b981] shadow-[0_0_60px_rgba(16,185,129,0.45)]"
                  : disarmShake
                  ? "border-[#ef4444] animate-shake-error shadow-[0_0_50px_rgba(239,68,68,0.7)]"
                  : "border-[#fda4af]/60 shadow-[0_0_50px_rgba(253,164,175,0.35)]"
              } p-5 sm:p-7 text-center relative overflow-hidden my-auto`}
            >
              {/* Cute glowing background orbs */}
              <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-[#f43f5e]/25 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-[#fda4af]/20 blur-2xl pointer-events-none" />

              {disarmSuccess ? (
                /* ── SUCCESS STATE: SIREN DISARMED // 14 AUGUST VERIFIED ── */
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#10b981]/20 border border-[#34d399] mx-auto flex items-center justify-center text-3xl shadow-[0_0_24px_rgba(16,185,129,0.6)]">
                    ❤️
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10b981]/20 border border-[#10b981]/50 text-[#34d399] text-xs font-bold uppercase tracking-wider font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>IDENTITY VERIFIED // SIREN SILENCED</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    YOU REMEMBERED! 🥹
                  </h2>
                  <p className="font-sans text-xs sm:text-sm text-[#a7f3d0] leading-relaxed max-w-sm mx-auto">
                    Yes! We talked for the very first time on{" "}
                    <span className="font-bold text-white underline decoration-[#34d399] decoration-2">
                      14 August 2026
                    </span>
                    .
                  </p>

                  {/* Styled authentic WhatsApp memory transcript snippet */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0c1317] border border-[#10b981]/50 text-left max-w-sm mx-auto mb-3 space-y-2.5 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />
                    <div className="text-[10px] font-sans font-semibold text-[#8696a0] flex items-center justify-between pb-2 border-b border-[#202c33]">
                      <span className="flex items-center gap-1.5 text-[#25d366]">
                        <Lock className="w-3 h-3 text-[#25d366]" />
                        WhatsApp Archive • 14 Aug 2026
                      </span>
                      <span className="text-[#8696a0] font-mono text-[9px]">Verified Memory</span>
                    </div>

                    {/* Anuj Bubble 1 */}
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#202c33] border border-[#3b4a54] flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-1">
                        A
                      </div>
                      <div className="flex flex-col items-start max-w-[82%]">
                        <div className="px-3 py-1.5 rounded-2xl rounded-tl-xs bg-[#202c33] text-[#e9edef] text-xs font-sans shadow-xs">
                          Heyy
                        </div>
                        <span className="text-[8.5px] text-[#8696a0] font-sans mt-0.5 ml-1 flex items-center gap-1">
                          Anuj • 5:47 AM <span className="text-[#53bdeb] text-[10px]">✓✓</span>
                        </span>
                      </div>
                    </div>

                    {/* Contact Bubble 1 */}
                    <div className="flex items-start justify-end gap-2">
                      <div className="flex flex-col items-end max-w-[82%]">
                        <div className="px-3 py-1.5 rounded-2xl rounded-tr-xs bg-[#005c4b] text-[#e9edef] text-xs font-sans font-medium shadow-xs">
                          Hlo
                        </div>
                        <span className="text-[8.5px] text-[#8696a0] font-sans mt-0.5 mr-1">
                          You • 9:56 AM
                        </span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-[#005c4b] border border-[#059669] flex items-center justify-center text-[11px] shrink-0 mt-1">
                        🌸
                      </div>
                    </div>

                    {/* Anuj Bubble 2 */}
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#202c33] border border-[#3b4a54] flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-1">
                        A
                      </div>
                      <div className="flex flex-col items-start max-w-[82%]">
                        <div className="px-3 py-1.5 rounded-2xl rounded-tl-xs bg-[#202c33] text-[#e9edef] text-xs font-sans shadow-xs">
                          ek random question thaa 😅 aap mere classmate the na?
                        </div>
                        <span className="text-[8.5px] text-[#8696a0] font-sans mt-0.5 ml-1 flex items-center gap-1">
                          Anuj • 11:06 AM <span className="text-[#53bdeb] text-[10px]">✓✓</span>
                        </span>
                      </div>
                    </div>

                    {/* Contact Bubble 2 */}
                    <div className="flex items-start justify-end gap-2">
                      <div className="flex flex-col items-end max-w-[82%]">
                        <div className="px-3 py-1.5 rounded-2xl rounded-tr-xs bg-[#005c4b] text-[#e9edef] text-xs font-sans font-medium shadow-xs">
                          Haan ,Right
                        </div>
                        <span className="text-[8.5px] text-[#8696a0] font-sans mt-0.5 mr-1">
                          You • 11:06 AM
                        </span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-[#005c4b] border border-[#059669] flex items-center justify-center text-[11px] shrink-0 mt-1">
                        🌸
                      </div>
                    </div>
                  </div>

                  <p className="font-sans text-xs text-[#fecdd3] pt-1 leading-relaxed">
                    Siren permanently silenced! It was all just a little prank by Anuj! 😂🌷
                  </p>

                  {/* NOW AND ONLY NOW: The button to redirect to countdown card appears! */}
                  <div className="flex flex-col gap-2.5 pt-2">
                    <button
                      onClick={() => {
                        stopSiren();
                        setShowPrankRevealModal(false);
                        setShowHackerLayer(false);
                      }}
                      className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#10b981] via-[#059669] to-[#047857] hover:brightness-110 text-white font-sans font-bold text-sm shadow-[0_4px_24px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 hover:shadow-[0_6px_28px_rgba(16,185,129,0.55)]"
                    >
                      <span>🌷 Open Countdown Card</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-[#fecdd3] font-sans font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#22c55e]" />
                      <span>Send Anuj a reaction on WhatsApp 😂</span>
                    </a>
                  </div>
                </div>
              ) : (
                /* ── ACTIVE GAME: GIVEN ONLY WHEN SHE TRIES TO BACK OR CLOSE TAB ── */
                <div>
                  {/* Animated Floating Emojis */}
                  <div className="flex items-center justify-center gap-3 text-3xl sm:text-4xl mb-2 animate-bounce">
                    <span>🙈</span>
                    <span>🌷</span>
                    <span>😂</span>
                  </div>

                  {/* Header Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f43f5e]/20 border border-[#f43f5e]/40 text-[#fda4af] text-[11px] font-sans font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#fb7185]" />
                    <span>Prank Caught! Tried to Exit?</span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#fff1f2] tracking-tight mb-1">
                    WAIT WAIT WAIT! 😂
                  </h3>

                  <p className="font-sans text-sm sm:text-base font-bold text-[#fda4af] mb-1">
                    It&apos;s just a little prank by Anuj! 🙈🌷
                  </p>

                  <p className="font-sans text-xs text-[#fecdd3]/90 leading-relaxed max-w-sm mx-auto mb-3">
                    Did you actually try to close or go back?! 😭 Your phone is 100% safe...
                    <span className="block font-bold text-white mt-0.5">
                      BUT to stop this blaring siren &amp; reach the countdown card, solve this:
                    </span>
                  </p>

                  {/* Question Card with Holographic Keys HUD */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#180816] border border-[#5c1c39] mb-3 text-left shadow-inner">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-[#f43f5e] uppercase tracking-wider flex items-center gap-1">
                        <Radio className="w-3 h-3 animate-ping text-[#ef4444]" />
                        SECURITY QUESTION:
                      </span>

                      {/* Holographic Keys Counter */}
                      <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full border border-[#ef4444]/40">
                        <span className="text-[9.5px] font-mono font-bold text-[#fca5a5] flex items-center gap-0.5">
                          <Shield className="w-3 h-3 text-[#f43f5e]" /> KEYS:
                        </span>
                        <div className="flex items-center gap-1">
                          {[1, 2].map((att) => {
                            const active = att <= disarmAttemptsLeft;
                            return (
                              <span
                                key={att}
                                className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold tracking-wider ${
                                  active
                                    ? "bg-[#ef4444]/30 text-[#fecaca] border border-[#ef4444] shadow-[0_0_6px_rgba(239,68,68,0.8)] animate-pulse"
                                    : "bg-black text-[#6b7280] border border-[#374151] line-through opacity-40"
                                }`}
                              >
                                {active ? "🔑 ACTIVE" : "💥 LOST"}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <p className="font-serif text-sm sm:text-base font-bold text-white mb-1">
                      When did we talk for the first time? 💬
                    </p>
                    <p className="font-sans text-[11px] text-[#fda4af]/80 italic">
                      Humne pehli baar kis date ko baat ki thi? (Sirf 2 attempts hai!)
                    </p>
                  </div>

                  {/* Feedback Toast / Warning */}
                  <AnimatePresence>
                    {disarmMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className={`mb-3 p-2.5 rounded-xl border text-xs font-sans font-bold flex items-center gap-2 text-left leading-snug ${
                          disarmAttemptsLeft === 0
                            ? "bg-[#450a0a] border-[#ef4444] text-[#fecaca]"
                            : disarmAttemptsLeft === 1
                            ? "bg-[#451a03] border-[#f59e0b] text-[#fef3c7]"
                            : "bg-[#18181b] border-[#52525b] text-[#e4e4e7]"
                        }`}
                      >
                        <Flame className="w-4 h-4 shrink-0 text-[#f87171] animate-bounce" />
                        <span>{disarmMessage}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 4 Date Options Grid (Holographic Cyber Tiles) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3.5">
                    {FIRST_TALK_OPTIONS.map((opt, idx) => {
                      const isWrong = disarmWrongSelected.includes(opt.id);
                      const letters = ["A", "B", "C", "D"];
                      return (
                        <button
                          key={opt.id}
                          disabled={isWrong || disarmAttemptsLeft <= 0}
                          onClick={() => handleSelectFirstTalkDate(opt.id)}
                          className={`group relative overflow-hidden p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between active:scale-95 ${
                            isWrong
                              ? "bg-[#250b13]/80 border-[#ef4444]/45 opacity-55 cursor-not-allowed text-[#9ca3af]"
                              : disarmAttemptsLeft <= 0
                              ? "bg-[#140816]/60 border-[#3b172a] opacity-50 cursor-not-allowed text-[#6b7280]"
                              : "bg-gradient-to-r from-[#210c22] via-[#2c112f] to-[#1c081e] hover:from-[#351538] hover:to-[#280c2b] border-[#5c1c39] hover:border-[#f43f5e] text-white shadow-sm hover:shadow-[0_0_18px_rgba(244,63,94,0.3)] hover:-translate-y-0.5"
                          }`}
                        >
                          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-6.5 h-6.5 rounded-xl flex items-center justify-center text-xs font-bold font-mono transition-all ${
                                isWrong
                                  ? "bg-[#ef4444]/30 text-[#fca5a5] border border-[#ef4444]/50"
                                  : "bg-[#f43f5e]/20 text-[#fda4af] border border-[#f43f5e]/40 group-hover:bg-[#f43f5e] group-hover:text-white group-hover:shadow-[0_0_10px_rgba(244,63,94,0.8)]"
                              }`}
                            >
                              {letters[idx]}
                            </span>
                            <div>
                              <div className="text-sm font-bold font-sans tracking-wide text-white group-hover:text-[#ffe4e6]">
                                {opt.date}
                              </div>
                              <div className="text-[10px] text-[#9ca3af] font-mono">
                                {opt.fullDate}
                              </div>
                            </div>
                          </div>

                          {isWrong ? (
                            <span className="text-[10px] font-bold text-[#ef4444] flex items-center gap-1 font-mono bg-red-950/60 px-2 py-0.5 rounded-full border border-red-500/40">
                              <X className="w-3 h-3" /> WRONG
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-[#fda4af]/60 group-hover:text-white transition-colors">
                              SELECT &gt;
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* If 2 attempts failed (Lockout state with WhatsApp hint & countdown) */}
                  {disarmAttemptsLeft <= 0 && (
                    <div className="p-3.5 rounded-2xl bg-[#3f080e] border-2 border-[#ef4444] text-center mb-1">
                      <p className="font-sans text-xs text-[#fca5a5] font-bold mb-2.5 leading-relaxed">
                        🚨 2 failed attempts! Siren will NOT stop! How could you forget?! 😭
                      </p>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                        <a
                          href="https://wa.me/918278710552?text=Anuj%20please%20siren%20band%20karo%20%F0%9F%98%AD%20Mujhe%20pehli%20baar%20baat%20karne%20ki%20date%20yaad%20nahi%20aa%20rahi%2C%20hint%20do!%20%F0%9F%98%82"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-bold font-sans flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Ask Anuj for a hint on WhatsApp 💬</span>
                        </a>
                        <div className="w-full sm:w-auto px-3 py-2 rounded-xl bg-black/40 border border-[#ef4444]/40 text-xs text-[#fca5a5] font-mono">
                          Retry in: <strong className="text-white">{disarmCooldown}s</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* NO OPTION TO REDIRECT TO COUNTDOWN WINDOW! NOTICE: ZERO REDIRECT BUTTONS HERE! */}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
