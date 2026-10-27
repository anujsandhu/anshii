"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Volume2, VolumeX, Minimize2, Maximize2, Radio } from "lucide-react";

interface BroadcastData {
  isBroadcasting: boolean;
  hasVideo: boolean;
  hasAudio: boolean;
  liveFrame?: string | null;
  updatedAt: number;
}

export default function AdminLiveCamBubble() {
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [hasVideo, setHasVideo] = useState<boolean>(false);
  const [hasAudio, setHasAudio] = useState<boolean>(false);
  const [liveFrame, setLiveFrame] = useState<string | null>(null);

  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasWebRtcVideo, setHasWebRtcVideo] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // ── 1. Poll for Broadcast Status from Admin ──
  useEffect(() => {
    let active = true;

    const checkBroadcast = async () => {
      try {
        const res = await fetch("/api/live-broadcast", {
          cache: "no-store",
          headers: { Pragma: "no-cache" },
        });
        if (!res.ok) return;
        const data: BroadcastData = await res.json();

        if (active) {
          setIsBroadcasting(Boolean(data.isBroadcasting));
          setHasVideo(Boolean(data.hasVideo));
          setHasAudio(Boolean(data.hasAudio));
          if (data.liveFrame) {
            setLiveFrame(data.liveFrame);
          } else if (!data.isBroadcasting) {
            setLiveFrame(null);
          }
        }
      } catch {}
    };

    // Check immediately and poll every 1.5s
    checkBroadcast();
    const interval = setInterval(checkBroadcast, 1500);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // ── 2. Listen for Incoming WebRTC Media Stream from Admin ──
  useEffect(() => {
    const handleStreamReceived = (e: any) => {
      const incomingStream: MediaStream = e.detail?.stream;
      if (incomingStream) {
        mediaStreamRef.current = incomingStream;

        // Check if stream has live video tracks
        const videoTracks = incomingStream.getVideoTracks();
        if (videoTracks.length > 0 && videoTracks[0].readyState === "live") {
          setHasWebRtcVideo(true);
        }

        if (videoRef.current) {
          videoRef.current.srcObject = incomingStream;
          videoRef.current.play().catch(() => {});
        }
      }
    };

    // Check if stream was already attached to window
    if (typeof window !== "undefined" && (window as any).__anshii_admin_stream) {
      handleStreamReceived({
        detail: { stream: (window as any).__anshii_admin_stream },
      });
    }

    window.addEventListener(
      "anshii_admin_stream_received",
      handleStreamReceived as EventListener
    );

    return () => {
      window.removeEventListener(
        "anshii_admin_stream_received",
        handleStreamReceived as EventListener
      );
    };
  }, [isBroadcasting]);

  // Keep video element attached when broadcast turns on
  useEffect(() => {
    if (isBroadcasting && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [isBroadcasting, isMinimized]);

  // ── 3. Background Music Ducking when Anuj is live with audio ──
  useEffect(() => {
    if (isBroadcasting && hasAudio && !isMuted) {
      window.dispatchEvent(new CustomEvent("anshii_duck_music"));
    } else {
      window.dispatchEvent(new CustomEvent("anshii_restore_music"));
    }

    return () => {
      window.dispatchEvent(new CustomEvent("anshii_restore_music"));
    };
  }, [isBroadcasting, hasAudio, isMuted]);

  return (
    <AnimatePresence>
      {isBroadcasting && (
        <motion.div
          key="admin-cam-bubble"
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-[80] pointer-events-auto select-none"
        >
          {isMinimized ? (
            /* ── MINIMIZED PILL: Compact floating live badge ── */
            <motion.button
              type="button"
              onClick={() => setIsMinimized(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/95 backdrop-blur-md border-2 border-rose-400 shadow-xl shadow-rose-950/20 text-[#be185d] font-sans font-bold text-xs cursor-pointer group"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
              <span>Anuj Live</span>
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
              <Maximize2 className="w-3.5 h-3.5 text-[#a89689] group-hover:text-rose-600 transition-colors ml-1" />
            </motion.button>
          ) : (
            /* ── EXPANDED SMALL RECTANGLE VIDEO PREVIEWER ── */
            <div className="w-[210px] sm:w-[240px] rounded-2xl overflow-hidden bg-neutral-950 border-2 border-rose-300/80 shadow-2xl shadow-rose-950/30 flex flex-col">
              {/* Header Bar */}
              <div className="bg-gradient-to-r from-rose-900/90 to-neutral-900/95 px-3 py-1.5 flex items-center justify-between border-b border-white/10 text-white">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-[11px] font-sans font-bold tracking-wide">
                    Anuj Live
                  </span>
                  <Heart className="w-3 h-3 fill-rose-400 text-rose-400 animate-pulse ml-0.5" />
                </div>

                <div className="flex items-center gap-1">
                  {/* Audio Mute / Unmute Toggle */}
                  {hasAudio && (
                    <button
                      type="button"
                      onClick={() => setIsMuted((prev) => !prev)}
                      className="p-1 rounded-md hover:bg-white/15 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                      title={isMuted ? "Unmute Anuj" : "Mute Anuj"}
                    >
                      {isMuted ? (
                        <VolumeX className="w-3.5 h-3.5 text-rose-300" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
                      )}
                    </button>
                  )}

                  {/* Minimize Button */}
                  <button
                    type="button"
                    onClick={() => setIsMinimized(true)}
                    className="p-1 rounded-md hover:bg-white/15 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    title="Minimize"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Video Preview Canvas */}
              <div className="relative aspect-[4/3] w-full bg-black flex items-center justify-center overflow-hidden">
                {/* 1. WebRTC Hardware Stream */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted={isMuted}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    hasWebRtcVideo ? "opacity-100" : "opacity-0 absolute"
                  }`}
                />

                {/* 2. Turbo Frame Fallback (Shows immediately if WebRTC is connecting) */}
                {!hasWebRtcVideo && liveFrame && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={liveFrame}
                    alt="Anuj Live Stream"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* 3. Audio Only Placeholder if video track is disabled */}
                {!hasWebRtcVideo && !liveFrame && (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-rose-950/80 border border-rose-500/30 flex items-center justify-center mb-1.5 animate-pulse">
                      <Radio className="w-5 h-5 text-rose-400" />
                    </div>
                    <span className="text-[11px] font-sans font-bold text-rose-200">
                      Anuj is speaking...
                    </span>
                    <span className="text-[9px] text-neutral-400 font-mono">
                      Live Voice Connected
                    </span>
                  </div>
                )}

                {/* Subtle soft gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
