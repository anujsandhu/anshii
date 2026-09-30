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
} from "lucide-react";
import { birthdayData } from "@/data/birthday";

interface MusicPlayerProps {
  autoPlayTriggered: boolean;
  currentTrack?: {
    title: string;
    artist: string;
    src: string;
  };
}

export default function MusicPlayer({ autoPlayTriggered, currentTrack }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [useSynthFallback, setUseSynthFallback] = useState(false);

  const activeTitle = currentTrack?.title || birthdayData.music.title;
  const activeArtist = currentTrack?.artist || birthdayData.music.artist;
  const activeSrc = currentTrack?.src || birthdayData.music.src;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Web Audio ambient synthesizer fallback for seamless offline playback
  const playSynthChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Soothing chord frequencies
      const chords = [
        [261.63, 329.63, 392.0, 493.88], // Cmaj7
        [220.0, 261.63, 329.63, 392.0],  // Am7
        [174.61, 220.0, 261.63, 329.63], // Fmaj7
        [196.0, 246.94, 293.66, 349.23], // G7
      ];
      const chord = chords[Math.floor((Date.now() / 4000) % chords.length)];

      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const startTime = ctx.currentTime + idx * 0.08;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.04 * volume * (isMuted ? 0 : 1), startTime + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 3.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 3.5);
      });
    } catch {
      // AudioContext not allowed or failed
    }
  }, [volume, isMuted]);

  // Initial trigger after user clicks ENTER
  useEffect(() => {
    if (autoPlayTriggered) {
      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // If browser audio playback fails, switch to ambient synthesizer
            setUseSynthFallback(true);
            setIsPlaying(true);
          });
      }
    }
  }, [autoPlayTriggered]);

  // Synth interval controller
  useEffect(() => {
    if (useSynthFallback && isPlaying && !isMuted) {
      playSynthChime();
      synthIntervalRef.current = setInterval(playSynthChime, 3800);
      return () => {
        if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
      };
    } else {
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
    }
  }, [useSynthFallback, isPlaying, isMuted, playSynthChime]);

  // Audio element events
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleAudioEnded = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const handleAudioError = () => {
    setUseSynthFallback(true);
    if (isPlaying) {
      playSynthChime();
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (useSynthFallback) {
        setIsPlaying(true);
        playSynthChime();
      } else if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            setUseSynthFallback(true);
            setIsPlaying(true);
          });
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
    if (newVol === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.load();
      audioRef.current.play().catch(() => {});
    }
  }, [activeSrc, isPlaying]);

  return (
    <>
      <audio
        ref={audioRef}
        src={activeSrc}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
        loop
        preload="auto"
      />

      {/* Floating persistent widget */}
      <div className="fixed bottom-4 right-4 z-40 max-w-[calc(100vw-32px)]">
        <div
          className={`rounded-2xl border border-white/10 bg-[#0d131f]/95 backdrop-blur-2xl shadow-2xl transition-all duration-300 overflow-hidden ${
            isExpanded ? "w-80 p-4" : "w-auto px-3.5 py-2.5"
          }`}
        >
          {/* Collapsed Bar / Header */}
          <div className="flex items-center justify-between gap-3">
            <div
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="relative">
                <Disc3
                  className={`w-7 h-7 text-cyan-400 ${
                    isPlaying ? "animate-spin [animation-duration:4s]" : ""
                  }`}
                />
                {isPlaying && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>

              <div className="flex flex-col text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-white truncate max-w-[120px] sm:max-w-[160px]">
                    {activeTitle}
                  </span>
                  
                  {/* Animated Waveform Equalizer Bars */}
                  <div className="flex items-end gap-[2px] h-3 w-5 shrink-0">
                    <span
                      className={`w-[3px] bg-cyan-400 rounded-full transition-all ${
                        isPlaying
                          ? "animate-[bounce_0.8s_infinite] h-full"
                          : "h-1 opacity-50"
                      }`}
                    />
                    <span
                      className={`w-[3px] bg-indigo-400 rounded-full transition-all ${
                        isPlaying
                          ? "animate-[bounce_0.6s_infinite_0.2s] h-3/4"
                          : "h-1 opacity-50"
                      }`}
                    />
                    <span
                      className={`w-[3px] bg-amber-400 rounded-full transition-all ${
                        isPlaying
                          ? "animate-[bounce_0.9s_infinite_0.4s] h-full"
                          : "h-1 opacity-50"
                      }`}
                    />
                    <span
                      className={`w-[3px] bg-emerald-400 rounded-full transition-all ${
                        isPlaying
                          ? "animate-[bounce_0.7s_infinite_0.1s] h-1/2"
                          : "h-1 opacity-50"
                      }`}
                    />
                  </div>
                </div>

                <span className="text-[10px] text-zinc-400 truncate max-w-[130px] font-mono">
                  {isPlaying ? "Playing • 28 Oct" : "Paused"}
                </span>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-1.5 ml-auto">
              {/* Play / Pause button */}
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause music" : "Play music"}
                className="w-8 h-8 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-cyan-300" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-cyan-300 translate-x-0.5" />
                )}
              </button>

              {/* Expand / Collapse toggle */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label="Expand player controls"
                className="w-7 h-7 rounded-full text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Expanded Drawer */}
          {isExpanded && (
            <div className="mt-4 pt-3 border-t border-white/10 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <Music2 className="w-3 h-3 text-cyan-400" />
                  {activeArtist}
                </span>
                <span>{useSynthFallback ? "Synth Mode" : "Audio Track"}</span>
              </div>

              {/* Progress bar (if HTML5 audio loaded) */}
              {!useSynthFallback && duration > 0 && (
                <div className="space-y-1">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              )}

              {/* Volume Slider & Mute */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={toggleMute}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <span className="text-[10px] text-zinc-400 w-8 text-right">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>

              {/* Equalizer details */}
              <div className="text-[10px] text-zinc-400 bg-white/5 p-2 rounded-lg flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"}`} />
                  {isPlaying ? "Equalizer active" : "Audio paused"}
                </span>
                <span className="text-cyan-400">44.1 kHz</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
