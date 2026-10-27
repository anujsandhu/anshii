"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Music2,
  ChevronDown,
  ChevronUp,
  Disc3,
  SkipForward,
  SkipBack,
  Heart,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SongConfig,
  BIRTHDAY_SOUNDTRACKS,
  SongTrack,
  SCRAPBOOK_PLAYLIST,
} from "@/data/musicConfig";

export type { SongTrack };
export { SCRAPBOOK_PLAYLIST };

interface MusicPlayerProps {
  autoPlayTriggered: boolean;
  activeSongIndex: number;
  onSongChange?: (index: number) => void;
}

export default function MusicPlayer({
  autoPlayTriggered,
  activeSongIndex = 0,
  onSongChange,
}: MusicPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(activeSongIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isExpanded, setIsExpanded] = useState(false);
  const [segmentCurrentTime, setSegmentCurrentTime] = useState(0);
  const [totalTrackDuration, setTotalTrackDuration] = useState(180);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);

  // Two audio elements for seamless 2-3s crossfade
  const audioARef = useRef<HTMLAudioElement | null>(null);
  const audioBRef = useRef<HTMLAudioElement | null>(null);
  const activeChannelRef = useRef<"A" | "B">("A");
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFadingRef = useRef(false);

  const currentSong = BIRTHDAY_SOUNDTRACKS[currentIndex] || BIRTHDAY_SOUNDTRACKS[0];

  // Helper to format mm:ss
  const formatTime = (secs: number) => {
    const s = Math.max(0, Math.floor(secs));
    const m = Math.floor(s / 60);
    const remainder = s % 60;
    return `${m}:${remainder < 10 ? "0" : ""}${remainder}`;
  };

  // Perform crossfade transition between Channel A and Channel B
  const transitionToSong = useCallback(
    (newIndex: number, shouldPlay = true) => {
      const nextSong = BIRTHDAY_SOUNDTRACKS[newIndex];
      if (!nextSong) return;

      const audioA = audioARef.current;
      const audioB = audioBRef.current;
      if (!audioA || !audioB) return;

      const currentChannel = activeChannelRef.current;
      const outgoingAudio = currentChannel === "A" ? audioA : audioB;
      const incomingAudio = currentChannel === "A" ? audioB : audioA;
      const nextChannel = currentChannel === "A" ? "B" : "A";

      // If user hasn't triggered autoplay yet and this isn't an explicit user play, just stage the song
      if (!hasStartedPlaying && !autoPlayTriggered && !shouldPlay) {
        outgoingAudio.src = nextSong.src;
        outgoingAudio.currentTime = nextSong.startTime;
        setCurrentIndex(newIndex);
        return;
      }

      // If same song is already playing, do NOT restart unnecessarily
      if (
        outgoingAudio.src.includes(encodeURI(nextSong.src)) &&
        !outgoingAudio.paused &&
        currentIndex === newIndex
      ) {
        return;
      }

      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }

      isFadingRef.current = true;
      setCurrentIndex(newIndex);
      setSegmentCurrentTime(0);

      // Prepare incoming track
      incomingAudio.src = nextSong.src;
      incomingAudio.currentTime = nextSong.startTime;
      incomingAudio.volume = 0;

      if (shouldPlay || isPlaying || autoPlayTriggered) {
        incomingAudio
          .play()
          .then(() => {
            setIsPlaying(true);
            setHasStartedPlaying(true);

            // 2.2 second smooth crossfade
            const fadeDurationMs = 2200;
            const steps = 24;
            const stepTime = fadeDurationMs / steps;
            let currentStep = 0;
            const targetVol = isMuted ? 0 : volume;
            const startOutVol = outgoingAudio.volume;

            fadeIntervalRef.current = setInterval(() => {
              currentStep += 1;
              const factor = currentStep / steps; // 0 to 1

              // Fade out outgoing audio
              if (!outgoingAudio.paused) {
                outgoingAudio.volume = Math.max(
                  0,
                  startOutVol * (1 - factor)
                );
              }

              // Fade in incoming audio
              incomingAudio.volume = Math.min(
                targetVol,
                targetVol * factor
              );

              if (currentStep >= steps) {
                if (fadeIntervalRef.current) {
                  clearInterval(fadeIntervalRef.current);
                  fadeIntervalRef.current = null;
                }
                outgoingAudio.pause();
                outgoingAudio.currentTime = 0;
                incomingAudio.volume = targetVol;
                activeChannelRef.current = nextChannel;
                isFadingRef.current = false;
              }
            }, stepTime);
          })
          .catch((err) => {
            console.warn("Audio play prevented:", err);
            isFadingRef.current = false;
          });
      } else {
        outgoingAudio.pause();
        activeChannelRef.current = nextChannel;
        isFadingRef.current = false;
      }
    },
    [currentIndex, volume, isMuted, isPlaying, autoPlayTriggered, hasStartedPlaying]
  );

  // Sync when activeSongIndex prop changes from parent (frame transition)
  useEffect(() => {
    if (activeSongIndex !== currentIndex) {
      transitionToSong(activeSongIndex, hasStartedPlaying || autoPlayTriggered);
    }
  }, [activeSongIndex, currentIndex, transitionToSong, hasStartedPlaying, autoPlayTriggered]);

  // Start initial song when autoPlayTriggered fires (Frame 1 "YES PLEASE")
  // Using a ref to track if we already started so the effect is idempotent
  const autoPlayFiredRef = useRef(false);
  useEffect(() => {
    if (!autoPlayTriggered || autoPlayFiredRef.current) return;
    autoPlayFiredRef.current = true;
    setHasStartedPlaying(true);

    const song = BIRTHDAY_SOUNDTRACKS[0]; // always start with song 1
    const audioA = audioARef.current;
    if (!audioA) return;

    // Build absolute URL so browser never blocks a relative-path play()
    const absoluteSrc = song.src.startsWith("http")
      ? song.src
      : `${window.location.origin}${song.src}`;

    audioA.src = absoluteSrc;
    audioA.currentTime = song.startTime;
    audioA.volume = 0;

    const attemptPlay = () => {
      audioA
        .play()
        .then(() => {
          setIsPlaying(true);
          activeChannelRef.current = "A";
          // 2-second fade-in
          const target = isMuted ? 0 : volume;
          let v = 0;
          const interval = setInterval(() => {
            v = Math.min(target, v + target / 20);
            if (audioA) audioA.volume = v;
            if (v >= target) clearInterval(interval);
          }, 100);
        })
        .catch((err) => {
          console.warn("[Music] autoplay blocked, listening for next user interaction:", err);
          const handleFirstGesture = () => {
            if (audioA && audioA.paused) {
              attemptPlay();
            }
            window.removeEventListener("click", handleFirstGesture);
            window.removeEventListener("touchstart", handleFirstGesture);
          };
          window.addEventListener("click", handleFirstGesture, { once: true });
          window.addEventListener("touchstart", handleFirstGesture, { once: true });
        });
    };

    // If audio is already ready, play immediately; otherwise wait for canplay
    if (audioA.readyState >= 3) {
      attemptPlay();
    } else {
      audioA.addEventListener("canplay", attemptPlay, { once: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlayTriggered]);

  // Continuously play audio from startTime without artificial stop time
  const handleTimeUpdate = (channel: "A" | "B") => {
    if (activeChannelRef.current !== channel && isFadingRef.current) return;

    const audio = channel === "A" ? audioARef.current : audioBRef.current;
    if (!audio) return;

    const ct = audio.currentTime;
    setSegmentCurrentTime(ct);

    if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
      setTotalTrackDuration(audio.duration);
    }
  };

  // Toggle Play / Pause
  const togglePlay = () => {
    const activeAudio =
      activeChannelRef.current === "A"
        ? audioARef.current
        : audioBRef.current;
    if (!activeAudio) return;

    if (isPlaying) {
      activeAudio.pause();
      setIsPlaying(false);
    } else {
      setHasStartedPlaying(true);
      if (activeAudio.currentTime < currentSong.startTime) {
        activeAudio.currentTime = currentSong.startTime;
      }
      activeAudio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    const activeAudio =
      activeChannelRef.current === "A"
        ? audioARef.current
        : audioBRef.current;
    if (activeAudio) {
      activeAudio.volume = nextMute ? 0 : volume;
    }
  };

  // Volume Change
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (isMuted) setIsMuted(false);
    const activeAudio =
      activeChannelRef.current === "A"
        ? audioARef.current
        : audioBRef.current;
    if (activeAudio) {
      activeAudio.volume = newVol;
    }
  };

  // Listen for ducking events when Anuj sends a voice note or speaks
  useEffect(() => {
    const handleDuck = () => {
      const activeAudio =
        activeChannelRef.current === "A"
          ? audioARef.current
          : audioBRef.current;
      if (activeAudio) {
        activeAudio.volume = Math.min(activeAudio.volume, 0.12);
      }
    };

    const handleRestore = () => {
      const activeAudio =
        activeChannelRef.current === "A"
          ? audioARef.current
          : audioBRef.current;
      if (activeAudio && !isMuted) {
        activeAudio.volume = volume;
      }
    };

    window.addEventListener("anshii_duck_music", handleDuck);
    window.addEventListener("anshii_restore_music", handleRestore);

    return () => {
      window.removeEventListener("anshii_duck_music", handleDuck);
      window.removeEventListener("anshii_restore_music", handleRestore);
    };
  }, [volume, isMuted]);

  // Skip Next / Prev track
  const handleNextTrack = () => {
    const nextIdx = (currentIndex + 1) % BIRTHDAY_SOUNDTRACKS.length;
    transitionToSong(nextIdx, true);
    if (onSongChange) onSongChange(nextIdx);
  };

  const handlePrevTrack = () => {
    const prevIdx =
      (currentIndex - 1 + BIRTHDAY_SOUNDTRACKS.length) %
      BIRTHDAY_SOUNDTRACKS.length;
    transitionToSong(prevIdx, true);
    if (onSongChange) onSongChange(prevIdx);
  };

  const progressFraction =
    totalTrackDuration > 0
      ? Math.min(1, Math.max(0, segmentCurrentTime / totalTrackDuration))
      : 0;

  return (
    <div
      className="fixed z-40 select-none right-2 sm:right-4 bottom-0 pointer-events-auto"
      style={{ paddingBottom: "max(12px, calc(var(--sab) + 8px))" }}
    >
      {/* Hidden Dual Audio Elements for Seamless Crossfade */}
      <audio
        ref={audioARef}
        preload="auto"
        onLoadedMetadata={(e) => {
          const d = (e.target as HTMLAudioElement).duration;
          if (d && !isNaN(d) && d > 0) setTotalTrackDuration(d);
        }}
        onTimeUpdate={() => handleTimeUpdate("A")}
        onEnded={() => {
          if (audioARef.current) {
            audioARef.current.currentTime = currentSong.startTime;
            audioARef.current.play().catch(() => {});
          }
        }}
      />
      <audio
        ref={audioBRef}
        preload="auto"
        onLoadedMetadata={(e) => {
          const d = (e.target as HTMLAudioElement).duration;
          if (d && !isNaN(d) && d > 0) setTotalTrackDuration(d);
        }}
        onTimeUpdate={() => handleTimeUpdate("B")}
        onEnded={() => {
          if (audioBRef.current) {
            audioBRef.current.currentTime = currentSong.startTime;
            audioBRef.current.play().catch(() => {});
          }
        }}
      />

      <AnimatePresence mode="wait">
        {!isExpanded ? (
          /* COLLAPSED CUTE RETRO CASSETTE PILL */
          <motion.div
            key="collapsed-pill"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            whileHover={{ scale: 1.03 }}
            className="flex items-center gap-1.5 sm:gap-2.5 p-1 pl-2.5 sm:p-1.5 sm:pl-3 rounded-full bg-white/92 backdrop-blur-md border border-[#ebdcd0] shadow-md hover:border-[#fda4af] transition-all cursor-pointer group"
            onClick={() => setIsExpanded(true)}
            title="Expand Birthday Mixtape Player"
          >
            {/* Spinning Spool or Music Note */}
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#fdf2f4] flex items-center justify-center text-[#be185d] shrink-0">
              {isPlaying ? (
                <Disc3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
              ) : (
                <Music2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              )}
            </div>

            {/* Song title and segment time */}
            <div className="flex flex-col text-left pr-0.5 min-w-[65px] max-w-[85px] sm:min-w-[100px] sm:max-w-[150px]">
              <span className="font-sans font-bold text-[11px] sm:text-xs text-[#3f2e24] truncate leading-tight">
                {currentSong.title}
              </span>
              <span className="text-[9px] sm:text-[10px] text-[#8c7465] font-sans truncate">
                {formatTime(segmentCurrentTime)} / {formatTime(totalTrackDuration)}
              </span>
            </div>

            {/* Mini Segment Progress Pill */}
            <div className="w-12 h-1.5 bg-[#f0e4d6] rounded-full overflow-hidden hidden sm:block">
              <div
                className="h-full bg-gradient-to-r from-[#fda4af] to-[#f43f5e] rounded-full transition-all duration-300"
                style={{ width: `${progressFraction * 100}%` }}
              />
            </div>

            {/* Quick Play/Pause button without expanding */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#fda4af] hover:bg-[#fb7185] text-[#4c0519] flex items-center justify-center transition-transform hover:scale-105 cursor-pointer shadow-xs shrink-0"
              title={isPlaying ? "Pause music" : "Play music"}
            >
              {isPlaying ? (
                <Pause className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
              ) : (
                <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-0.5 fill-current" />
              )}
            </button>

            <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#a0897a] group-hover:text-[#3f2e24] transition-colors hidden xs:block" />
          </motion.div>
        ) : (
          /* EXPANDED HANDMADE SCRAPBOOK CASSETTE DECK */
          <motion.div
            key="expanded-cassette"
            initial={{ scale: 0.92, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="w-72 sm:w-80 paper-card-warm p-4 rounded-3xl relative shadow-xl border border-[#ebdcd0] z-50 text-left"
          >
            {/* Washi Tape Accent */}
            <div className="washi-tape-pink" />

            {/* Header: Title and Collapse */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#f0e4d6]">
              <div className="flex items-center gap-1.5 text-xs text-[#be185d] font-sans font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#f43f5e]" />
                <span>Birthday Mixtape ({currentIndex + 1}/8)</span>
              </div>

              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-full hover:bg-[#f5ede4] text-[#8c7465] hover:text-[#3f2e24] transition-colors cursor-pointer"
                title="Minimize player"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Cassette Graphic / Song Info */}
            <div className="p-3 rounded-2xl bg-[#fffaf5] border border-[#eddccc] mb-3 relative overflow-hidden">
              <div className="flex items-center justify-between mb-1.5">
                <div className="min-w-0 pr-2">
                  <h4 className="font-handwriting text-2xl font-bold text-[#3f2e24] truncate leading-tight">
                    {currentSong.title}
                  </h4>
                  <p className="text-xs text-[#8c7465] font-sans truncate">
                    {currentSong.movieOrArtist}
                  </p>
                </div>

                {/* Animated Spools */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div
                    className={`w-7 h-7 rounded-full border-2 border-dashed border-[#fda4af] flex items-center justify-center text-[#f43f5e] ${
                      isPlaying ? "animate-spin" : ""
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-[#fda4af]" />
                  </div>
                  <div
                    className={`w-7 h-7 rounded-full border-2 border-dashed border-[#fda4af] flex items-center justify-center text-[#f43f5e] ${
                      isPlaying ? "animate-spin" : ""
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-[#fda4af]" />
                  </div>
                </div>
              </div>

              {/* Progress Bar & Timestamps */}
              <div className="mt-2 space-y-1">
                <div className="h-1.5 w-full bg-[#eee5da] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#fda4af] to-[#f43f5e] rounded-full transition-all duration-200"
                    style={{ width: `${progressFraction * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#a0897a] font-mono">
                  <span>{formatTime(segmentCurrentTime)}</span>
                  <span className="text-[9px] text-[#be185d] font-sans">
                    {currentSong.vibe}
                  </span>
                  <span>{formatTime(totalTrackDuration)}</span>
                </div>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between">
              {/* Skip Back */}
              <button
                onClick={handlePrevTrack}
                className="p-2 rounded-xl text-[#786457] hover:text-[#3f2e24] hover:bg-[#f5ede4] transition-colors cursor-pointer"
                title="Previous track"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {/* Play / Pause Main Button */}
              <button
                onClick={togglePlay}
                className="px-5 py-2.5 rounded-2xl bg-[#fda4af] hover:bg-[#fb7185] text-[#4c0519] font-sans font-bold text-xs shadow-md transition-all hover:scale-105 cursor-pointer flex items-center gap-1.5 btn-cute"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    <span>Play</span>
                  </>
                )}
              </button>

              {/* Skip Next */}
              <button
                onClick={handleNextTrack}
                className="p-2 rounded-xl text-[#786457] hover:text-[#3f2e24] hover:bg-[#f5ede4] transition-colors cursor-pointer"
                title="Next track"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Volume / Mute Toggle */}
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-xl text-[#786457] hover:text-[#3f2e24] hover:bg-[#f5ede4] transition-colors cursor-pointer"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-[#f43f5e]" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) =>
                    handleVolumeChange(parseFloat(e.target.value))
                  }
                  className="w-16 h-1 accent-[#f43f5e] bg-[#e8ded1] rounded-lg cursor-pointer"
                  title="Volume control"
                />
              </div>
            </div>

            {/* Helpful hint */}
            <div className="mt-2.5 pt-2 border-t border-[#f0e4d6] text-center">
              <span className="text-[10px] text-[#a0897a] font-sans">
                🎵 Tracks crossfade automatically as you turn each scrapbook page
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
