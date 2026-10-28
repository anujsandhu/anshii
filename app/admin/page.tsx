"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Unlock,
  Users,
  Eye,
  Camera,
  Clock,
  Smartphone,
  Laptop,
  Tablet,
  Globe,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Calendar,
  Sparkles,
  Music2,
  CheckCircle2,
  AlertCircle,
  FileText,
  MousePointerClick,
  Compass,
  Video,
  Download,
  Play,
  Heart,
  Radio,
  Sliders,
  Check,
  Flame,
  Monitor,
  Layout,
  Layers,
  Trash2,
  Volume2,
  VolumeX,
  Zap,
  Wifi,
  WifiOff,
  Send,
  Smile,
  MessageSquare,
  Mic,
  MicOff,
  Square,
  CameraOff,
  Gift,
} from "lucide-react";
import Link from "next/link";

interface SessionData {
  sessionId: string;
  startedAt: string;
  lastSeenAt: string;
  endedAt?: string | null;
  duration?: number;
  device?: string;
  browser?: string;
  pagesVisited?: string[];
  eventCount?: number;
  uploadCount?: number;
  loginCount?: number;
  isUnlocked?: boolean;
  role?: string;
  userName?: string;
  isTester?: boolean;
  passwordUsed?: string;
  latestSlide?: string;
  latestLiveFrame?: string;
  latestLiveVideo?: string;
}

interface TimelineEvent {
  eventId: string;
  type: string;
  timestamp: string;
  page?: string;
  elementId?: string;
  elementText?: string;
  metadata?: Record<string, any>;
}

interface UploadRecord {
  uploadId: string;
  sessionId: string;
  cloudinaryPublicId: string;
  cloudinaryUrl: string;
  uploadedAt: string;
  page: string;
  slide?: string;
  type?: "video" | "image";
  caption?: string;
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
    sizeBytes?: number;
    durationMs?: number;
  };
}

interface LoginRecord {
  loginId: string;
  sessionId: string;
  timestamp: string;
  device?: string;
  browser?: string;
  passwordUsed?: string;
}

interface LiveMonitorData {
  sessionId?: string;
  activeNow?: boolean;
  lastUpdated?: string;
  slide?: string;
  latestLiveFrame?: string;
  latestLiveVideo?: string;
}

export default function AdminAnalyticsDashboard() {
  const [adminKey, setAdminKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Dashboard Data State
  const [isLoading, setIsLoading] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [stats, setStats] = useState<any>(null);
  const [liveMonitor, setLiveMonitor] = useState<LiveMonitorData | null>(null);
  const [logins, setLogins] = useState<LoginRecord[]>([]);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [recentUploads, setRecentUploads] = useState<UploadRecord[]>([]);

  // Selected Session Timeline
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
  const [sessionEvents, setSessionEvents] = useState<TimelineEvent[]>([]);
  const [sessionUploads, setSessionUploads] = useState<UploadRecord[]>([]);
  const [selectedVideoForPreview, setSelectedVideoForPreview] = useState<UploadRecord | null>(null);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);

  // Active Tab & Filters
  const [activeTab, setActiveTab] = useState<
    "live" | "footprints" | "logins" | "gallery"
  >("live");
  const [activityFilter, setActivityFilter] = useState<string>("all");
  const [loginFilter, setLoginFilter] = useState<"all" | "anshii" | "anuj">("anshii");
  const [downloadingUrl, setDownloadingUrl] = useState<string | null>(null);

  // ── Real-Time Live Feed State (< 120ms delay) ──
  const [realtimeFeed, setRealtimeFeed] = useState<{
    active: boolean;
    frame: string | null;
    screenFrame?: string | null;
    screenActive?: boolean;
    slide?: string;
    timestamp?: number;
    audioLevel?: number;
    ageMs?: number;
  }>({ active: false, frame: null, screenFrame: null, screenActive: false, audioLevel: 0 });
  const [monitorMode, setMonitorMode] = useState<"live" | "video">("live");
  const [liveLayout, setLiveLayout] = useState<"pip" | "split" | "cam" | "screen">("pip");
  const [streamFps, setStreamFps] = useState<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFpsCalcRef = useRef<number>(Date.now());

  // ── WebRTC Direct P2P Ultra-Low Latency Video & Audio State ──
  const [webRtcConnected, setWebRtcConnected] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);
  const [webRtcStream, setWebRtcStream] = useState<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const calleePeerRef = useRef<RTCPeerConnection | null>(null);
  const lastProcessedOfferRef = useRef<string | null>(null);

  // ── Live Message & Floating Emojis Dispatcher State ──
  const [liveMsgText, setLiveMsgText] = useState<string>("");
  const [liveMsgEmojis, setLiveMsgEmojis] = useState<string[]>(["💖", "✨"]);
  const [isSendingLiveMsg, setIsSendingLiveMsg] = useState<boolean>(false);
  const [liveMsgNotice, setLiveMsgNotice] = useState<string | null>(null);
  const [videoPlaybackError, setVideoPlaybackError] = useState<boolean>(false);

  // ── Voice Dispatcher & Live Intercom State ──
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [voiceSeconds, setVoiceSeconds] = useState<number>(0);
  const [recordedVoiceBlob, setRecordedVoiceBlob] = useState<Blob | null>(null);
  const [recordedVoiceUrl, setRecordedVoiceUrl] = useState<string | null>(null);
  const [isSendingVoice, setIsSendingVoice] = useState<boolean>(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [isLiveIntercomOn, setIsLiveIntercomOn] = useState<boolean>(false);
  const voiceRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const voiceChunksRef = useRef<Blob[]>([]);
  const intercomStreamRef = useRef<MediaStream | null>(null);

  // ── Anuj's Live Camera & Voice Stream State (Preview & Broadcast) ──
  const [isMyCamActive, setIsMyCamActive] = useState<boolean>(false);
  const [isMyMicActive, setIsMyMicActive] = useState<boolean>(true);
  const [isBroadcastingToHer, setIsBroadcastingToHer] = useState<boolean>(false);
  const [broadcastNotice, setBroadcastNotice] = useState<string | null>(null);

  const myStreamRef = useRef<MediaStream | null>(null);
  const myCamPreviewRef = useRef<HTMLVideoElement | null>(null);
  const isBroadcastingToHerRef = useRef<boolean>(false);
  isBroadcastingToHerRef.current = isBroadcastingToHer;
  const broadcastHeartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const canvasFrameRef = useRef<HTMLCanvasElement | null>(null);

  // ── Gift Unboxing Live Approval State ──
  const [giftApprovals, setGiftApprovals] = useState<Record<string, boolean>>({});
  const [isUpdatingApproval, setIsUpdatingApproval] = useState<string | null>(null);
  const [approvalNotice, setApprovalNotice] = useState<string | null>(null);

  // ── 1. Enable full scrolling on admin page ──
  useEffect(() => {
    document.documentElement.style.overflow = "auto";
    document.documentElement.style.height = "auto";
    document.body.style.overflow = "auto";
    document.body.style.height = "auto";
    return () => {
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";
      document.body.style.overflow = "";
      document.body.style.height = "";
    };
  }, []);

  // ── 1b. Real-Time Zero-Lag Live Stream (Dual Pipeline: Instant SSE Push + HTTP Poll Fallback) ──
  useEffect(() => {
    if (!adminKey) return;

    let sseActive = false;
    let eventSource: EventSource | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;

    const setupSSE = () => {
      if (typeof window === "undefined" || !window.EventSource) return;

      try {
        if (eventSource) {
          eventSource.close();
        }
        eventSource = new EventSource("/api/live-stream?stream=true");

        eventSource.onopen = () => {
          sseActive = true;
        };

        eventSource.onmessage = (e) => {
          try {
            // Heartbeat check
            if (e.data === "ping") return;

            const data = JSON.parse(e.data);
            if (data) {
              setRealtimeFeed(data);
              frameCountRef.current += 1;
              const now = Date.now();
              if (now - lastFpsCalcRef.current >= 1000) {
                setStreamFps(frameCountRef.current);
                frameCountRef.current = 0;
                lastFpsCalcRef.current = now;
              }
            }
          } catch {}
        };

        eventSource.onerror = () => {
          sseActive = false;
          // Attempt graceful reconnect after 3 seconds if socket was closed
          if (eventSource?.readyState === EventSource.CLOSED) {
            if (reconnectTimer) clearTimeout(reconnectTimer);
            reconnectTimer = setTimeout(setupSSE, 3000);
          }
        };
      } catch {
        sseActive = false;
      }
    };

    setupSSE();

    // 2. HTTP poll fallback (750ms) runs seamlessly if SSE is connecting or blocked by proxy
    let isFetching = false;
    const streamPump = setInterval(async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      if (sseActive || isFetching) return;
      isFetching = true;
      try {
        const ctrl = new AbortController();
        const tId = setTimeout(() => ctrl.abort(), 1200);

        const res = await fetch("/api/live-stream", {
          cache: "no-store",
          headers: { Pragma: "no-cache", "Cache-Control": "no-cache" },
          signal: ctrl.signal,
        });
        clearTimeout(tId);

        if (res.ok) {
          const data = await res.json();
          if (data && data.success) {
            setRealtimeFeed(data);
            frameCountRef.current += 1;
            const now = Date.now();
            if (now - lastFpsCalcRef.current >= 1000) {
              setStreamFps(frameCountRef.current);
              frameCountRef.current = 0;
              lastFpsCalcRef.current = now;
            }
          }
        }
      } catch {} finally {
        isFetching = false;
      }
    }, 750);

    return () => {
      clearInterval(streamPump);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [adminKey]);

  // ── 1c. WebRTC P2P Direct Video & Audio Receiver (Ultra-Fast <50ms Cross-Device Streaming) ──
  useEffect(() => {
    if (!adminKey || typeof window === "undefined" || !window.RTCPeerConnection) return;

    let isPolling = false;
    const pollInterval = setInterval(async () => {
      if (calleePeerRef.current && calleePeerRef.current.connectionState === "connected") {
        return; // Already streaming via WebRTC P2P
      }
      if (isPolling) return;
      isPolling = true;

      try {
        const res = await fetch("/api/webrtc-signal?role=admin");
        if (!res.ok) return;
        const data = await res.json();

        if (data && data.offer && data.offer.sdp && data.offer.sdp !== lastProcessedOfferRef.current) {
          lastProcessedOfferRef.current = data.offer.sdp;

          if (calleePeerRef.current) {
            calleePeerRef.current.close();
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
          calleePeerRef.current = pc;

          pc.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
              setWebRtcStream(event.streams[0]);
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
                remoteVideoRef.current.play().catch(() => {});
              }
            }
          };

          pc.onconnectionstatechange = () => {
            if (pc.connectionState === "connected") {
              setWebRtcConnected(true);
            } else if (
              pc.connectionState === "disconnected" ||
              pc.connectionState === "failed" ||
              pc.connectionState === "closed"
            ) {
              setWebRtcConnected(false);
            }
          };

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              fetch("/api/webrtc-signal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  type: "candidate",
                  role: "admin",
                  candidate: event.candidate.toJSON(),
                }),
              }).catch(() => {});
            }
          };

          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));

          if (Array.isArray(data.callerCandidates)) {
            for (const cand of data.callerCandidates) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(cand));
              } catch {}
            }
          }

          // If Anuj is broadcasting his cam/voice, add his tracks to pc before creating answer
          if (myStreamRef.current && isBroadcastingToHerRef.current) {
            myStreamRef.current.getTracks().forEach((track) => {
              try {
                pc.addTrack(track, myStreamRef.current!);
              } catch {}
            });
          }

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          await fetch("/api/webrtc-signal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "answer",
              role: "admin",
              sdp: pc.localDescription
                ? {
                    type: pc.localDescription.type,
                    sdp: pc.localDescription.sdp,
                  }
                : null,
            }),
          });
        }
      } catch (err) {
        console.warn("WebRTC callee handshake (staying on SSE/HTTP):", err);
      } finally {
        isPolling = false;
      }
    }, 1500);

    return () => {
      clearInterval(pollInterval);
      if (calleePeerRef.current) {
        calleePeerRef.current.close();
        calleePeerRef.current = null;
      }
      if (broadcastHeartbeatRef.current) {
        clearInterval(broadcastHeartbeatRef.current);
        broadcastHeartbeatRef.current = null;
      }
      if (myStreamRef.current) {
        myStreamRef.current.getTracks().forEach((track) => track.stop());
        myStreamRef.current = null;
      }
      setWebRtcConnected(false);
      setWebRtcStream(null);
    };
  }, [adminKey]);

  // Keep remote video element synced with incoming WebRTC media stream
  useEffect(() => {
    if (remoteVideoRef.current && webRtcStream) {
      remoteVideoRef.current.srcObject = webRtcStream;
      remoteVideoRef.current.play().catch(() => {});
    }
  }, [webRtcStream, monitorMode, webRtcConnected]);

  // ── 2. Check cached admin key on mount ──
  useEffect(() => {
    const cachedKey = sessionStorage.getItem("anshii_admin_key")?.trim();
    if (cachedKey) {
      if (cachedKey.toLowerCase() !== "@ritusandhu1983") {
        sessionStorage.removeItem("anshii_admin_key");
        setAdminKey("");
        return;
      }
      setAdminKey(cachedKey);
      fetchDashboardData(cachedKey, true);
    }
  }, []);

  // ── 2b. Background Auto-Sync every 2.5 seconds when logged in ──
  useEffect(() => {
    if (!adminKey || !autoSync) return;

    const interval = setInterval(() => {
      fetchDashboardData(adminKey, false);
      fetchGiftApprovals();
      if (selectedSessionId) {
        refreshSessionTimeline(selectedSessionId, adminKey, false);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [adminKey, autoSync, selectedSessionId]);

  // ── 3. Data Fetching ──
  const fetchDashboardData = async (key = adminKey, showSpinner = true) => {
    if (!key) return;
    if (showSpinner) setIsLoading(true);

    try {
      const res = await fetch(
        `/api/analytics/admin?key=${encodeURIComponent(key)}`
      );
      if (res.status === 401) {
        setAdminKey("");
        sessionStorage.removeItem("anshii_admin_key");
        setAuthError("Unauthorized. Please login with @Ritusandhu1983.");
        return;
      }
      const data = await res.json();
      if (res.ok && data.success) {
        setStats(data.stats);
        setLiveMonitor(data.liveMonitor || null);
        setLogins(data.logins || []);
        const sessList: SessionData[] = data.sessions || [];
        setSessions(sessList);
        setRecentUploads(data.recentUploads || []);
        setLastSyncTime(new Date());
        fetchGiftApprovals();

        // Default-select Anshii session if available, else first session
        if (!selectedSessionId && sessList.length > 0) {
          const anshiiSess = sessList.find(
            (s) =>
              s.role === "anshii" ||
              (!s.isTester && s.userName !== "Anuj (Tester)")
          );
          handleSelectSession(anshiiSess || sessList[0], key);
        }
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  };

  const handleSelectSession = async (sess: SessionData, key = adminKey) => {
    setSelectedSessionId(sess.sessionId);
    setSelectedSession(sess);
    setIsLoadingTimeline(true);

    try {
      const res = await fetch(
        `/api/analytics/admin?key=${encodeURIComponent(
          key
        )}&sessionId=${encodeURIComponent(sess.sessionId)}`
      );
      if (res.status === 401) {
        setAdminKey("");
        sessionStorage.removeItem("anshii_admin_key");
        return;
      }
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.success) {
        setSessionEvents(data.events || []);
        setSessionUploads(data.uploads || []);
        if (data.session) {
          setSelectedSession(data.session);
        }
      }
    } catch (err) {
      // Non-fatal timeline fetch
    } finally {
      setIsLoadingTimeline(false);
    }
  };

  const refreshSessionTimeline = async (
    sessionId: string,
    key = adminKey,
    showSpinner = false
  ) => {
    if (!sessionId || !key) return;
    if (showSpinner) setIsLoadingTimeline(true);

    try {
      const res = await fetch(
        `/api/analytics/admin?key=${encodeURIComponent(
          key
        )}&sessionId=${encodeURIComponent(sessionId)}`
      );
      if (res.status === 401) {
        setAdminKey("");
        sessionStorage.removeItem("anshii_admin_key");
        return;
      }
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.success) {
        setSessionEvents(data.events || []);
        setSessionUploads(data.uploads || []);
        if (data.session) {
          setSelectedSession(data.session);
        }
      }
    } catch (err) {
      // Non-fatal timeline refresh
    } finally {
      if (showSpinner) setIsLoadingTimeline(false);
    }
  };

  // ── 4. Save / Download Video to Computer ──
  const handleSaveVideo = async (
    videoUrl: string,
    filename = "anshii_reaction_video.mp4"
  ) => {
    if (!videoUrl) return;
    try {
      setDownloadingUrl(videoUrl);
      let resolvedUrl = videoUrl;
      if (videoUrl.includes("/api/reaction-recording") && !videoUrl.includes("download=true")) {
        resolvedUrl = videoUrl.includes("stream=true")
          ? videoUrl.replace("stream=true", "download=true")
          : `${videoUrl}${videoUrl.includes("?") ? "&" : "?"}download=true`;
      }
      const res = await fetch(resolvedUrl);
      const blob = await res.blob();
      const finalExt = blob.type.includes("webm") ? ".webm" : ".mp4";
      const cleanFilename = filename.endsWith(".mp4") || filename.endsWith(".webm")
        ? filename.replace(/\.(mp4|webm)$/, finalExt)
        : `${filename}${finalExt}`;
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = cleanFilename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback direct link
      const a = document.createElement("a");
      a.href = videoUrl;
      a.target = "_blank";
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setDownloadingUrl(null);
    }
  };

  // ── 4b. Send Live Message & Floating Emojis to Her Screen ──
  const handleSendLiveMessage = async (customText?: string, customEmojis?: string[]) => {
    const textToSend = customText !== undefined ? customText : liveMsgText;
    const emojisToSend = customEmojis !== undefined ? customEmojis : liveMsgEmojis;

    if (!textToSend.trim() && emojisToSend.length === 0) return;

    setIsSendingLiveMsg(true);
    setLiveMsgNotice(null);

    try {
      const res = await fetch("/api/live-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToSend.trim(),
          emojis: emojisToSend,
          sender: "Anuj",
          key: adminKey,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLiveMsgNotice("🚀 Popped up on her screen live with floating emojis!");
        if (customText === undefined) {
          setLiveMsgText("");
        }
        setTimeout(() => setLiveMsgNotice(null), 4000);
      } else {
        setLiveMsgNotice(data.error || "Failed to deliver");
      }
    } catch {
      setLiveMsgNotice("Network hiccup sending message");
    } finally {
      setIsSendingLiveMsg(false);
    }
  };

  // ── 4c. Voice Note Recording & Live Intercom Handlers ──
  const startRecordingVoice = async () => {
    try {
      if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setVoiceNotice("Microphone not supported on this browser");
        return;
      }
      setVoiceNotice(null);
      setRecordedVoiceBlob(null);
      if (recordedVoiceUrl) {
        URL.revokeObjectURL(recordedVoiceUrl);
        setRecordedVoiceUrl(null);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      voiceChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";

      const options = mimeType ? { mimeType } : undefined;
      const recorder = new MediaRecorder(stream, options);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          voiceChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(voiceChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        setRecordedVoiceBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedVoiceUrl(url);
      };

      recorder.start(100);
      voiceRecorderRef.current = recorder;
      setIsRecordingVoice(true);
      setVoiceSeconds(0);

      voiceTimerRef.current = setInterval(() => {
        setVoiceSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn("Microphone access denied:", err);
      setVoiceNotice("Mic access denied: " + (err?.message || "Please allow microphone"));
    }
  };

  const stopRecordingVoice = () => {
    if (voiceTimerRef.current) {
      clearInterval(voiceTimerRef.current);
      voiceTimerRef.current = null;
    }
    if (voiceRecorderRef.current && voiceRecorderRef.current.state === "recording") {
      voiceRecorderRef.current.stop();
    }
    setIsRecordingVoice(false);
  };

  const cancelRecordingVoice = () => {
    if (voiceTimerRef.current) {
      clearInterval(voiceTimerRef.current);
      voiceTimerRef.current = null;
    }
    if (voiceRecorderRef.current && voiceRecorderRef.current.state === "recording") {
      voiceRecorderRef.current.stop();
    }
    setIsRecordingVoice(false);
    setRecordedVoiceBlob(null);
    if (recordedVoiceUrl) {
      URL.revokeObjectURL(recordedVoiceUrl);
      setRecordedVoiceUrl(null);
    }
    setVoiceSeconds(0);
  };

  const handleSendVoiceNote = async () => {
    if (!recordedVoiceBlob) return;

    setIsSendingVoice(true);
    setVoiceNotice(null);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(recordedVoiceBlob);
      });
      const base64Audio = await base64Promise;

      const res = await fetch("/api/live-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioUrl: base64Audio,
          audioDuration: voiceSeconds || 5,
          text: liveMsgText.trim() || "🎙️ Voice message from Anuj",
          emojis: ["🎙️", "💌", "💖", "✨"],
          sender: "Anuj",
          key: adminKey,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setVoiceNotice("🎙️ Voice note delivered! Auto-playing on her screen with waveform ✨");
        cancelRecordingVoice();
        setTimeout(() => setVoiceNotice(null), 5000);
      } else {
        setVoiceNotice(data.error || "Failed to deliver voice note");
      }
    } catch (err: any) {
      setVoiceNotice("Error sending voice note: " + (err?.message || ""));
    } finally {
      setIsSendingVoice(false);
    }
  };

  // ── Unified Live Broadcast & Voice Intercom Handlers (Video & Voice-Only) ──
  const startBroadcast = async (withVideo: boolean = true) => {
    try {
      let stream = myStreamRef.current;

      if (withVideo) {
        if (!stream || !stream.active || stream.getVideoTracks().length === 0) {
          if (stream) {
            stream.getTracks().forEach((t) => t.stop());
          }
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480, frameRate: 30 },
            audio: true,
          });
          myStreamRef.current = stream;
        }
        setIsMyCamActive(true);
        setIsMyMicActive(true);
        if (myCamPreviewRef.current) {
          myCamPreviewRef.current.srcObject = stream;
          myCamPreviewRef.current.play().catch(() => {});
        }
      } else {
        // Voice Only: no camera requested or needed
        if (!stream || !stream.active || stream.getAudioTracks().length === 0) {
          if (stream) {
            stream.getTracks().forEach((t) => t.stop());
          }
          stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
          });
          myStreamRef.current = stream;
        }
        setIsMyCamActive(false);
        setIsMyMicActive(true);
        if (myCamPreviewRef.current) {
          myCamPreviewRef.current.srcObject = null;
        }
      }

      // Add tracks to callee peer connection
      if (calleePeerRef.current && stream) {
        const senders = calleePeerRef.current.getSenders();
        stream.getTracks().forEach((track) => {
          try {
            const existingSender = senders.find((s) => s.track && s.track.kind === track.kind);
            if (existingSender) {
              existingSender.replaceTrack(track);
            } else {
              calleePeerRef.current!.addTrack(track, stream!);
            }
          } catch {}
        });
      }

      // Signal renegotiation so her browser immediately sends fresh offer and connects
      fetch("/api/webrtc-signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "request_offer",
          role: "admin",
        }),
      }).catch(() => {});

      setIsBroadcastingToHer(true);
      isBroadcastingToHerRef.current = true;
      setIsLiveIntercomOn(true);
      setBroadcastNotice(
        withVideo
          ? "🔴 Live Cam & Voice broadcasting to her window!"
          : "🎙️ Live Voice broadcasting to her window (no video)!"
      );

      // Start turbo frame capture (if video) & heartbeat loop
      if (broadcastHeartbeatRef.current) clearInterval(broadcastHeartbeatRef.current);

      const sendHeartbeatAndFrame = async () => {
        let frameBase64: string | null = null;
        const currentCamActive = Boolean(
          myStreamRef.current &&
          myStreamRef.current.getVideoTracks().length > 0 &&
          myStreamRef.current.getVideoTracks()[0].readyState === "live" &&
          myStreamRef.current.getVideoTracks()[0].enabled
        );

        if (currentCamActive && myCamPreviewRef.current && canvasFrameRef.current) {
          try {
            const video = myCamPreviewRef.current;
            const canvas = canvasFrameRef.current;
            if (video.videoWidth > 0 && video.videoHeight > 0) {
              canvas.width = 320;
              canvas.height = 240;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.drawImage(video, 0, 0, 320, 240);
                frameBase64 = canvas.toDataURL("image/jpeg", 0.55);
              }
            }
          } catch {}
        }

        await fetch("/api/live-broadcast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isBroadcasting: true,
            hasVideo: currentCamActive,
            hasAudio: isMyMicActive,
            liveFrame: frameBase64,
            key: adminKey,
          }),
        }).catch(() => {});
      };

      sendHeartbeatAndFrame();
      broadcastHeartbeatRef.current = setInterval(sendHeartbeatAndFrame, 350);
    } catch (err: any) {
      console.warn("Could not start broadcast:", err);
      setBroadcastNotice("Could not access microphone: " + (err?.message || "Check permissions"));
    }
  };

  const stopBroadcast = async () => {
    if (broadcastHeartbeatRef.current) {
      clearInterval(broadcastHeartbeatRef.current);
      broadcastHeartbeatRef.current = null;
    }

    setIsBroadcastingToHer(false);
    isBroadcastingToHerRef.current = false;
    setIsLiveIntercomOn(false);
    setBroadcastNotice("Live stream stopped. Bubble closed on her window.");
    setTimeout(() => setBroadcastNotice(null), 3500);

    await fetch("/api/live-broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isBroadcasting: false,
        key: adminKey,
      }),
    }).catch(() => {});
  };

  const toggleLiveIntercom = async () => {
    if (isBroadcastingToHer || isLiveIntercomOn) {
      await stopBroadcast();
      setVoiceNotice("Live Intercom stopped");
      setTimeout(() => setVoiceNotice(null), 2500);
    } else {
      await startBroadcast(false); // Voice only!
      setVoiceNotice("🔴 Live Intercom active! Speaking directly to her headphones.");
    }
  };

  const toggleMyCamPreview = async () => {
    if (isMyCamActive) {
      // Turn off camera: if broadcasting, keep audio alive in voice-only mode!
      if (myStreamRef.current) {
        myStreamRef.current.getVideoTracks().forEach((track) => {
          track.stop();
          myStreamRef.current?.removeTrack(track);
        });
      }
      if (myCamPreviewRef.current) {
        myCamPreviewRef.current.srcObject = null;
      }
      setIsMyCamActive(false);

      if (isBroadcastingToHer) {
        setBroadcastNotice("Switched to Voice Only mode (Cam off)");
      } else {
        setBroadcastNotice("Camera preview off");
      }
      setTimeout(() => setBroadcastNotice(null), 2500);
    } else {
      // Turn on camera
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, frameRate: 30 },
          audio: !myStreamRef.current || myStreamRef.current.getAudioTracks().length === 0,
        });

        if (!myStreamRef.current) {
          myStreamRef.current = videoStream;
        } else {
          videoStream.getVideoTracks().forEach((track) => {
            myStreamRef.current!.addTrack(track);
          });
        }

        setIsMyCamActive(true);
        if (myCamPreviewRef.current) {
          myCamPreviewRef.current.srcObject = myStreamRef.current;
          myCamPreviewRef.current.play().catch(() => {});
        }

        // If broadcasting, add video track to peer connection & trigger re-offer
        if (isBroadcastingToHer && calleePeerRef.current) {
          const videoTrack = myStreamRef.current.getVideoTracks()[0];
          if (videoTrack) {
            const senders = calleePeerRef.current.getSenders();
            const existingSender = senders.find((s) => s.track && s.track.kind === "video");
            if (existingSender) {
              existingSender.replaceTrack(videoTrack);
            } else {
              calleePeerRef.current.addTrack(videoTrack, myStreamRef.current);
            }
          }
          fetch("/api/webrtc-signal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "request_offer", role: "admin" }),
          }).catch(() => {});
          setBroadcastNotice("🔴 Cam activated! Streaming video & voice to her.");
        } else {
          setBroadcastNotice("📷 Camera ready! Self preview active.");
        }
        setTimeout(() => setBroadcastNotice(null), 3000);
      } catch (err: any) {
        setBroadcastNotice("Camera permission denied: " + (err?.message || ""));
      }
    }
  };

  const toggleMyMic = () => {
    if (!myStreamRef.current) return;
    const audioTrack = myStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMyMicActive(audioTrack.enabled);
      setBroadcastNotice(audioTrack.enabled ? "🎙️ Mic unmuted" : "🔇 Mic muted");
      setTimeout(() => setBroadcastNotice(null), 2500);
    }
  };

  // ── Gift Unboxing Live Approval Handlers ──
  const fetchGiftApprovals = async () => {
    try {
      const res = await fetch("/api/gift-snaps", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data && data.approvals) {
          setGiftApprovals(data.approvals);
        }
      }
    } catch {}
  };

  const handleApproveGiftStep = async (stepId: string, approve: boolean = true) => {
    setIsUpdatingApproval(stepId);
    try {
      setGiftApprovals((prev) => ({ ...prev, [stepId]: approve }));
      const res = await fetch("/api/gift-snaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: approve ? "approve" : "unapprove",
          stepId,
          key: adminKey,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGiftApprovals(data.approvals || {});
        setApprovalNotice(
          approve
            ? `✅ ${stepId.replace("step-", "Step ")} approved! Her next step is unlocked.`
            : `Revoked approval for ${stepId.replace("step-", "Step ")}.`
        );
        setTimeout(() => setApprovalNotice(null), 3500);
      } else {
        setApprovalNotice("Approval failed: " + (data.error || ""));
      }
    } catch (err: any) {
      setApprovalNotice("Network error: " + (err?.message || ""));
    } finally {
      setIsUpdatingApproval(null);
    }
  };

  const handleApproveAllGiftSteps = async () => {
    setIsUpdatingApproval("all");
    try {
      setGiftApprovals({ "step-1": true, "step-2": true, "step-3": true, "step-4": true });
      const res = await fetch("/api/gift-snaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve_all",
          key: adminKey,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGiftApprovals(data.approvals || {});
        setApprovalNotice("🎉 All 4 gift steps approved! Chapter 4 unlocked & complete.");
        setTimeout(() => setApprovalNotice(null), 4000);
      }
    } catch (err: any) {
      setApprovalNotice("Failed to approve all: " + (err?.message || ""));
    } finally {
      setIsUpdatingApproval(null);
    }
  };

  const handleResetGiftApprovals = async () => {
    if (!window.confirm("Reset all gift unboxing approvals back to Step 1?")) return;
    setIsUpdatingApproval("reset");
    try {
      setGiftApprovals({});
      const res = await fetch("/api/gift-snaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset_approvals",
          key: adminKey,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGiftApprovals({});
        setApprovalNotice("All gift approvals reset back to zero.");
        setTimeout(() => setApprovalNotice(null), 3000);
      }
    } catch (err: any) {
      setApprovalNotice("Reset error: " + (err?.message || ""));
    } finally {
      setIsUpdatingApproval(null);
    }
  };

  // ── 5. Authentication Handlers ──
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;

    setIsVerifying(true);
    setAuthError("");

    try {
      const res = await fetch(
        `/api/analytics/admin?key=${encodeURIComponent(keyInput.trim())}`
      );
      const data = await res.json();

      if (res.ok && data.success) {
        setAdminKey(keyInput.trim());
        sessionStorage.setItem("anshii_admin_key", keyInput.trim());
        const lowerKey = keyInput.trim().toLowerCase();
        if (
          lowerKey === "@ritusandhu1983" ||
          lowerKey === "anuj88" ||
          lowerKey === "anuj19"
        ) {
          localStorage.setItem("anshii_tester_bypass", "true");
          localStorage.setItem("anshii_user_role", "anuj");
          sessionStorage.setItem("anshii_tester_bypass", "true");
          sessionStorage.setItem("anshii_user_role", "anuj");
        }
        setStats(data.stats);
        setLiveMonitor(data.liveMonitor || null);
        setLogins(data.logins || []);
        setSessions(data.sessions || []);
        setRecentUploads(data.recentUploads || []);
      } else {
        setAuthError(data.error || "Incorrect admin key.");
      }
    } catch {
      setAuthError("Failed to reach analytics server.");
    } finally {
      setIsVerifying(false);
    }
  };

  const [isResetting, setIsResetting] = useState(false);

  const handleResetAllData = async () => {
    if (
      !window.confirm(
        "Reset interactive tasks (scratch card & quiz)?\n\nAll saved reaction videos, recordings, and visitor logins are permanently safe and will NEVER be deleted."
      )
    ) {
      return;
    }

    setIsResetting(true);
    try {
      // 1. Clear local browser task keys
      localStorage.removeItem("anshii_completed_frames");
      localStorage.removeItem("anshii_madam_ji_answers");
      localStorage.removeItem("anshii_madam_ji_keepsake_v2");
      localStorage.removeItem("anshii_gift_snaps_v4");
      localStorage.removeItem("anshii_gift_slots_v4");
      localStorage.removeItem("anshii_gift_slots_v5");
      localStorage.removeItem("anshii_wishes_key_v2");
      localStorage.removeItem("anshii_last_frame");

      // 2. Call admin DELETE API (only resets task state, preserves all videos)
      const keyToUse = adminKey || "@Ritusandhu1983";
      const res = await fetch(
        `/api/analytics/admin?key=${encodeURIComponent(keyToUse)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        alert("✅ Interactive test tasks reset! All saved reaction videos and visitor logs remain 100% safe.");
      } else {
        alert(`Note: Local storage cleared. Server response: ${data.error || "Done"}`);
      }
      fetchDashboardData(keyToUse, true);
    } catch (err: any) {
      alert("Local task data cleared! " + (err.message || ""));
      fetchDashboardData(adminKey, true);
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("anshii_admin_key");
    setAdminKey("");
    setKeyInput("");
    setSessions([]);
    setSelectedSessionId(null);
  };

  // ── Check if Anshii is currently Online ──
  const isAnshiiOnline = (() => {
    if (liveMonitor?.activeNow) {
      const diff =
        Date.now() - new Date(liveMonitor.lastUpdated || "").getTime();
      if (diff < 3 * 60 * 1000) return true;
    }
    if (sessions.length > 0) {
      const latest = sessions[0];
      const diff =
        Date.now() - new Date(latest.lastSeenAt || latest.startedAt).getTime();
      return diff < 3 * 60 * 1000;
    }
    return false;
  })();

  // ── Find Latest Live Video & Snapshot ──
  const latestVideo =
    recentUploads.find(
      (u) =>
        u.type === "video" ||
        u.page === "reaction_cam" ||
        u.cloudinaryUrl.endsWith(".mp4") ||
        u.cloudinaryUrl.endsWith(".webm")
    ) ||
    (liveMonitor?.latestLiveVideo
      ? {
          uploadId: "live_mon",
          sessionId: liveMonitor.sessionId || "live",
          cloudinaryPublicId: "live",
          cloudinaryUrl: liveMonitor.latestLiveVideo,
          uploadedAt: liveMonitor.lastUpdated || new Date().toISOString(),
          page: "reaction_cam",
          slide: liveMonitor.slide || "live",
          type: "video" as const,
          caption: "One Contiguous Reaction Video",
        }
      : null) ||
    (selectedSession?.latestLiveVideo
      ? {
          uploadId: "sess_vid",
          sessionId: selectedSession.sessionId,
          cloudinaryPublicId: "session",
          cloudinaryUrl: selectedSession.latestLiveVideo,
          uploadedAt: selectedSession.lastSeenAt || new Date().toISOString(),
          page: "reaction_cam",
          slide: selectedSession.latestSlide || "session",
          type: "video" as const,
          caption: "Session Reaction Video",
        }
      : null);

  const activePlaybackVideo = selectedVideoForPreview || latestVideo;

  const latestFrameSnap =
    recentUploads.find(
      (u) =>
        u.type === "image" &&
        (u.slide?.includes("frame") ||
          u.slide?.includes("snap") ||
          u.caption?.toLowerCase().includes("snapshot"))
    ) || null;

  // ── Render 1: Admin Password Protection Gate ────────────────────────────────
  if (!adminKey) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex flex-col items-center justify-center p-4 selection:bg-[#fda4af]/40">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm bg-[#fffdfa] rounded-3xl border-2 border-[#ebdcd0] shadow-xl p-6 sm:p-8 text-center flex flex-col items-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#fff0f3] border border-[#fbcfe8] text-[#be185d] flex items-center justify-center mb-4 shadow-sm">
            <Lock className="w-7 h-7 text-[#fb7185]" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#3f2e24]">
            Anshii Hub Admin
          </h1>
          <p className="text-xs text-[#786457] font-sans mt-1.5 mb-6">
            Enter your private admin master key to access the dashboard.
          </p>

          <form onSubmit={handleAuthSubmit} className="w-full flex flex-col gap-3">
            <input
              type="password"
              value={keyInput}
              onChange={(e) => {
                setKeyInput(e.target.value);
                if (authError) setAuthError("");
              }}
              placeholder="Enter admin password..."
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-[#ebdcd0] bg-white text-sm text-[#3f2e24] placeholder:text-[#a89080] focus:outline-hidden focus:ring-2 focus:ring-[#fda4af] focus:border-transparent transition-all text-center font-mono tracking-wider"
            />

            {authError && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-[#e11d48] font-sans">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || !keyInput.trim()}
              className="w-full py-3 rounded-xl bg-[#fb7185] hover:bg-[#f43f5e] active:scale-[0.99] text-white font-sans font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Access Admin Hub</span>
                </>
              )}
            </button>

            {/* Direct 1-Click Tester Bypass into Scrapbook */}
            <button
              type="button"
              onClick={() => {
                localStorage.setItem("anshii_tester_bypass", "true");
                localStorage.setItem("anshii_user_role", "anuj");
                sessionStorage.setItem("anshii_tester_bypass", "true");
                sessionStorage.setItem("anshii_user_role", "anuj");
                window.location.href = "/?pass=@Ritusandhu1983";
              }}
              className="w-full mt-3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 hover:brightness-110 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Unlock className="w-4 h-4 text-white" />
              <span>🚀 Open Scrapbook (Bypass All Gates)</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#ebdcd0] w-full flex items-center justify-center">
            <Link
              href="/?pass=@Ritusandhu1983"
              onClick={() => {
                localStorage.setItem("anshii_tester_bypass", "true");
                localStorage.setItem("anshii_user_role", "anuj");
                sessionStorage.setItem("anshii_tester_bypass", "true");
                sessionStorage.setItem("anshii_user_role", "anuj");
              }}
              className="text-xs text-[#8c7465] hover:text-[#1e40af] flex items-center gap-1 font-sans font-semibold transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to Scrapbook (Bypassed)</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Render 2: Main Admin Dashboard ──────────────────────────────────────────
  const activeSessionItem =
    sessions.find((s) => s.sessionId === selectedSessionId) || sessions[0];

  return (
    <div className="admin-page-root min-h-screen w-full overflow-y-auto overflow-x-hidden bg-[#faf7f2] text-[#3f2e24] selection:bg-[#fda4af]/40 pb-28">
      {/* ── Top Header Bar ── */}
      <header className="sticky top-0 z-30 bg-[#fffdfa]/95 backdrop-blur-md border-b border-[#ebdcd0] px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left Brand & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fff0f3] border border-[#fbcfe8] text-[#be185d] flex items-center justify-center shadow-2xs">
              <Sparkles className="w-5 h-5 text-[#fb7185]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg sm:text-xl font-bold text-[#3f2e24]">
                  Anshii Hub // Admin Command
                </h1>
                {/* Live Online Badge */}
                {isAnshiiOnline ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] text-[11px] font-mono font-bold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                    <span>ONLINE NOW</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f4ece3] text-[#786457] text-[11px] font-mono">
                    <span className="w-2 h-2 rounded-full bg-[#a89080]" />
                    <span>OFFLINE</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#786457] font-sans">
                Real-time reaction video recorder, exact login timing &amp;
                complete footprints.
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Auto-Sync Toggle */}
            <button
              onClick={() => setAutoSync(!autoSync)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-sans font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                autoSync
                  ? "bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46]"
                  : "bg-white border-[#ebdcd0] text-[#786457]"
              }`}
              title="Automatically refresh every 4 seconds"
            >
              <Radio
                className={`w-3.5 h-3.5 ${
                  autoSync ? "text-[#10b981] animate-pulse" : "text-[#9ca3af]"
                }`}
              />
              <span className="hidden sm:inline">
                {autoSync ? "Live Auto-Sync (4s)" : "Auto-Sync Off"}
              </span>
            </button>

            {/* Manual Refresh Button */}
            <button
              onClick={() => fetchDashboardData(adminKey, true)}
              disabled={isLoading}
              className="p-2 rounded-xl bg-white border border-[#ebdcd0] hover:bg-[#f5ece3] text-[#786457] transition-all cursor-pointer"
              title="Refresh data now"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin text-[#fb7185]" : ""}`}
              />
            </button>

            {/* Reset Tasks (Preserves all reaction videos & logins) */}
            <button
              onClick={handleResetAllData}
              disabled={isResetting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-sans font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              title="Reset scratch card and quiz state for testing without deleting any saved reaction videos or logs"
            >
              <Trash2 className="w-3.5 h-3.5 text-amber-700" />
              <span>{isResetting ? "Resetting..." : "Reset Tasks (Videos Safe)"}</span>
            </button>

            {/* Direct Open Bypassed Site Button */}
            <a
              href="/?pass=@Ritusandhu1983&clear=true"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                sessionStorage.setItem("anshii_tester_bypass", "true");
                sessionStorage.setItem("anshii_user_role", "anuj");
                localStorage.removeItem("anshii_tester_bypass");
                localStorage.removeItem("anshii_user_role");
                localStorage.removeItem("anshii_completed_frames");
                localStorage.removeItem("anshii_madam_ji_answers");
                localStorage.removeItem("anshii_gift_snaps_v4");
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-sans font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
              title="Open website in new tab with countdown and all gates bypassed with fresh uncompleted tasks"
            >
              <Unlock className="w-3.5 h-3.5 text-white" />
              <span>Open Scrapbook (Fresh Start)</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
            </a>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-[#fff0f3] hover:bg-[#ffe4e6] text-[#be185d] text-xs font-sans font-semibold transition-all cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Derive Anshika-specific data so her metrics are accurately isolated */}
        {(() => {
          const isAnujRecord = (item: any) =>
            item.role === "anuj" ||
            item.passwordUsed === "@Ritusandhu1983" ||
            item.passwordUsed === "ANUJ88" ||
            item.passwordUsed === "ANUJ19" ||
            item.userName?.includes("Anuj") ||
            item.isTester === true;

          const anshiiSessions = sessions.filter((s) => !isAnujRecord(s));
          const anshiiLogins = logins.filter((l) => !isAnujRecord(l));
          const anshiiUploads = recentUploads.filter(
            (u) => !isAnujRecord(u) && u.type === "video"
          );
          const anshiiDuration = anshiiSessions.reduce(
            (acc, s) => acc + (s.duration || 0),
            0
          );
          const anshiiEvents = anshiiSessions.reduce(
            (acc, s) => acc + (s.eventCount || 0),
            0
          );
          const avgDuration =
            anshiiSessions.length > 0
              ? Math.round(anshiiDuration / anshiiSessions.length)
              : 0;

          return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: Total Logins */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#ebdcd0] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#8c7465] mb-2">
                  <span className="text-[11px] font-sans font-bold uppercase tracking-wider">
                    Total Logins
                  </span>
                  <div className="p-1.5 rounded-lg bg-[#fff0f3] text-[#fb7185]">
                    <KeyIcon className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-[#3f2e24]">
                    {anshiiLogins.length || anshiiSessions.length || 0}
                  </div>
                  <span className="text-[11px] text-[#786457] font-sans">
                    {anshiiSessions.length === 0
                      ? "Awaiting her login with 'anshii19'"
                      : `${anshiiSessions.length} visit${
                          anshiiSessions.length === 1 ? "" : "s"
                        } by Anshika`}
                  </span>
                </div>
              </div>

              {/* Card 2: Cumulative Duration */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#ebdcd0] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#8c7465] mb-2">
                  <span className="text-[11px] font-sans font-bold uppercase tracking-wider">
                    Total Time on Site
                  </span>
                  <div className="p-1.5 rounded-lg bg-[#f0fdf4] text-[#15803d]">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-[#3f2e24]">
                    {formatDuration(anshiiDuration)}
                  </div>
                  <span className="text-[11px] text-[#786457] font-sans">
                    {anshiiSessions.length === 0
                      ? "0s active"
                      : `Avg: ${formatDuration(avgDuration)} / visit`}
                  </span>
                </div>
              </div>

              {/* Card 3: Footprint Actions */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#ebdcd0] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#8c7465] mb-2">
                  <span className="text-[11px] font-sans font-bold uppercase tracking-wider">
                    Total Footprints
                  </span>
                  <div className="p-1.5 rounded-lg bg-[#eff6ff] text-[#2563eb]">
                    <MousePointerClick className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-[#3f2e24]">
                    {anshiiEvents}
                  </div>
                  <span className="text-[11px] text-[#786457] font-sans">
                    {anshiiSessions.length === 0
                      ? "Clicks, songs, quiz & notes"
                      : "Footprints left by Anshika"}
                  </span>
                </div>
              </div>

              {/* Card 4: Reaction Recordings */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#ebdcd0] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#8c7465] mb-2">
                  <span className="text-[11px] font-sans font-bold uppercase tracking-wider">
                    Reaction Videos
                  </span>
                  <div className="p-1.5 rounded-lg bg-[#fff1f2] text-[#e11d48]">
                    <Video className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-[#3f2e24]">
                    {anshiiUploads.length}
                  </div>
                  <span className="text-[11px] text-[#786457] font-sans">
                    {anshiiUploads.length === 0
                      ? "Awaiting her live opening"
                      : `${anshiiUploads.length} reaction video${
                          anshiiUploads.length === 1 ? "" : "s"
                        }`}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── Navigation Tabs ── */}
        <div className="flex items-center gap-2 border-b border-[#ebdcd0] pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("live")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-sans font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "live"
                ? "bg-[#fb7185] text-white shadow-xs"
                : "bg-white text-[#786457] hover:bg-[#f5ece3] border border-[#ebdcd0]"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isAnshiiOnline ? "bg-[#22c55e] animate-pulse" : "bg-white"
              }`}
            />
            <span>🔴 Live Stream &amp; Reaction Videos</span>
          </button>

          <button
            onClick={() => setActiveTab("footprints")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-sans font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "footprints"
                ? "bg-[#fb7185] text-white shadow-xs"
                : "bg-white text-[#786457] hover:bg-[#f5ece3] border border-[#ebdcd0]"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>🐾 Her Activity Footprints &amp; Timeline</span>
          </button>

          <button
            onClick={() => setActiveTab("logins")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-sans font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "logins"
                ? "bg-[#fb7185] text-white shadow-xs"
                : "bg-white text-[#786457] hover:bg-[#f5ece3] border border-[#ebdcd0]"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>📅 Logins &amp; Timing Log ({logins.length || sessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("gallery")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-sans font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "gallery"
                ? "bg-[#fb7185] text-white shadow-xs"
                : "bg-white text-[#786457] hover:bg-[#f5ece3] border border-[#ebdcd0]"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>🎞️ Cloudinary Media Vault ({recentUploads.length})</span>
          </button>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            TAB 1: LIVE STREAM MONITOR & REACTION VIDEOS
        ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === "live" && (
          <div className="space-y-6">
            {/* Live Camera Broadcast Studio Monitor */}
            <div className="p-5 sm:p-7 rounded-3xl bg-white border-2 border-[#ebdcd0] shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#ebdcd0] mb-5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-[#ef4444] animate-ping" />
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#3f2e24]">
                      Live Camera &amp; Reaction Studio
                    </h2>
                  </div>
                  <p className="text-xs text-[#786457] font-sans mt-1">
                    Auto-streaming frames &amp; rolling video recordings directly
                    from Anshii&apos;s webcam to Cloudinary.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Mode Switcher */}
                  <div className="flex items-center p-1 rounded-xl bg-[#faf7f2] border border-[#ebdcd0]">
                    <button
                      onClick={() => setMonitorMode("live")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        monitorMode === "live"
                          ? "bg-[#ef4444] text-white shadow-xs"
                          : "text-[#786457] hover:text-[#3f2e24]"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          realtimeFeed.active
                            ? "bg-white animate-pulse"
                            : "bg-neutral-400"
                        }`}
                      />
                      <span>Live Stream (&lt;0.3s)</span>
                    </button>
                    <button
                      onClick={() => setMonitorMode("video")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        monitorMode === "video"
                          ? "bg-[#fb7185] text-white shadow-xs"
                          : "text-[#786457] hover:text-[#3f2e24]"
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Saved Videos ({recentUploads.length})</span>
                    </button>
                  </div>

                  <span className="text-[11px] font-mono text-[#8c7465]">
                    Sync: {formatTime(lastSyncTime.toISOString())}
                  </span>
                </div>
              </div>

              {/* Monitor Screen Frame */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left (7 Cols): Active Live Video / Snapshot Player */}
                <div className="lg:col-span-7 flex flex-col gap-3">
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/95 border-2 border-[#ebdcd0] shadow-inner flex items-center justify-center group">
                    {monitorMode === "live" && (webRtcConnected || (realtimeFeed.active && realtimeFeed.frame)) ? (
                      /* ── 1. ULTRA-FAST LIVE STREAM: FACE CAM + SCREEN SHARE (DUAL WEBRTC + SSE) ── */
                      <div className="relative w-full h-full flex items-center justify-center bg-black">
                        {/* ── LAYOUT A: SPLIT VIEW (Face Cam + Screen Share Side-by-Side) ── */}
                        {liveLayout === "split" ? (
                          <div className="w-full h-full grid grid-cols-2 gap-1.5 bg-black p-1">
                            {/* Left: Live Face Cam (WebRTC Hardware / SSE Turbo) */}
                            <div className="relative w-full h-full rounded-xl overflow-hidden bg-neutral-900 flex items-center justify-center">
                              {webRtcConnected ? (
                                <video
                                  ref={remoteVideoRef}
                                  playsInline
                                  autoPlay
                                  muted={isAudioMuted}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={realtimeFeed.frame || ""}
                                  alt="Live Face Cam"
                                  className="w-full h-full object-contain"
                                />
                              )}
                              <div className="absolute top-2 left-2 bg-black/85 text-[9px] font-mono font-bold text-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1.5 border border-white/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                <Camera className="w-3 h-3" />
                                <span>{webRtcConnected ? "FACE CAM (P2P 60FPS)" : "FACE CAM"}</span>
                              </div>
                            </div>

                            {/* Right: Live Screen Share */}
                            <div className="relative w-full h-full rounded-xl overflow-hidden bg-neutral-900 flex items-center justify-center">
                              {realtimeFeed.screenFrame ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={realtimeFeed.screenFrame}
                                  alt="Live Screen Share"
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="text-center p-4 text-neutral-400">
                                  <Monitor className="w-7 h-7 mx-auto mb-1.5 text-neutral-500 animate-pulse" />
                                  <span className="text-[11px] font-mono block">
                                    Screen Share Standing By...
                                  </span>
                                  <span className="text-[10px] text-neutral-500">
                                    Awaiting screen share permission
                                  </span>
                                </div>
                              )}
                              <div className="absolute top-2 left-2 bg-black/85 text-[9px] font-mono font-bold text-cyan-300 px-2 py-0.5 rounded-md flex items-center gap-1.5 border border-white/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                <Monitor className="w-3 h-3" />
                                <span>SCREEN SHARE</span>
                              </div>
                            </div>
                          </div>
                        ) : liveLayout === "screen" && realtimeFeed.screenFrame ? (
                          /* ── LAYOUT B: SCREEN SHARE FULL FOCUS ── */
                          <div className="relative w-full h-full flex items-center justify-center bg-black">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={realtimeFeed.screenFrame}
                              alt="Live Screen Share"
                              className="w-full h-full object-contain"
                            />
                            <div className="absolute top-3 left-3 bg-black/85 text-[10px] font-mono font-bold text-cyan-300 px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/10">
                              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                              <Monitor className="w-3.5 h-3.5" />
                              <span>LIVE SCREEN SHARE</span>
                            </div>
                          </div>
                        ) : liveLayout === "cam" || !realtimeFeed.screenFrame ? (
                          /* ── LAYOUT C: FACE CAM FULL FOCUS ── */
                          <div className="relative w-full h-full flex items-center justify-center bg-black">
                            {webRtcConnected ? (
                              <video
                                ref={remoteVideoRef}
                                playsInline
                                autoPlay
                                muted={isAudioMuted}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={realtimeFeed.frame || ""}
                                alt="Real-Time Webcam Feed"
                                className="w-full h-full object-contain"
                              />
                            )}
                            <div className="absolute top-3 left-3 bg-black/85 text-[10px] font-mono font-bold text-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/10">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                              <Camera className="w-3.5 h-3.5" />
                              <span>{webRtcConnected ? "LIVE FACE CAM (WEBRTC 60FPS)" : "LIVE FACE CAM"}</span>
                            </div>
                          </div>
                        ) : (
                          /* ── LAYOUT D: PICTURE-IN-PICTURE (Screen Share with Face Cam Inset) ── */
                          <div className="relative w-full h-full flex items-center justify-center bg-black">
                            {/* Main Background: Screen Share */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={realtimeFeed.screenFrame}
                              alt="Live Screen Share"
                              className="w-full h-full object-contain"
                            />

                            {/* Floating Inset: Face Cam */}
                            <div className="absolute bottom-3 right-3 w-40 sm:w-52 aspect-4/3 rounded-xl overflow-hidden border-2 border-white/30 shadow-2xl bg-neutral-900 z-10 group/pip">
                              {webRtcConnected ? (
                                <video
                                  ref={remoteVideoRef}
                                  playsInline
                                  autoPlay
                                  muted={isAudioMuted}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={realtimeFeed.frame || ""}
                                  alt="Live Face Cam"
                                  className="w-full h-full object-cover"
                                />
                              )}
                              <div className="absolute top-1 left-1.5 bg-black/85 text-[8px] font-mono font-bold text-emerald-300 px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span>{webRtcConnected ? "P2P CAM" : "FACE CAM"}</span>
                              </div>
                            </div>

                            <div className="absolute top-3 left-3 bg-black/85 text-[10px] font-mono font-bold text-cyan-300 px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/10">
                              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                              <Monitor className="w-3.5 h-3.5" />
                              <span>SCREEN &amp; FACE PIP</span>
                            </div>
                          </div>
                        )}

                        {/* Live Latency & Audio EQ Badge */}
                        <div className="absolute bottom-3 left-3 bg-black/85 backdrop-blur-md text-white text-[10px] font-mono px-3 py-1.5 rounded-full border border-white/15 flex items-center gap-2.5 shadow-md z-20">
                          {webRtcConnected ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                              <span className="text-emerald-300 font-bold flex items-center gap-1">
                                <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                                WEBRTC P2P
                              </span>
                              <span className="text-neutral-400">&bull;</span>
                              <span className="text-emerald-200">&lt;50ms latency</span>
                              <span className="text-neutral-400">&bull;</span>
                              <span className="text-cyan-300">60 FPS Direct</span>
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                              <span className="text-emerald-300 font-bold">SSE ON-AIR</span>
                              <span className="text-neutral-400">&bull;</span>
                              <span>~0.12s</span>
                              <span className="text-neutral-400">&bull;</span>
                              <span>{streamFps || 4} FPS</span>
                            </>
                          )}

                          {/* Real-time Microphone Audio Activity Equalizer */}
                          {Boolean(realtimeFeed.audioLevel && realtimeFeed.audioLevel > 4) && (
                            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40">
                              <div
                                className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                                style={{ height: `${Math.max(4, Math.min(14, (realtimeFeed.audioLevel || 0) * 0.22))}px` }}
                              />
                              <div
                                className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                                style={{ height: `${Math.max(6, Math.min(16, (realtimeFeed.audioLevel || 0) * 0.3))}px` }}
                              />
                              <div
                                className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                                style={{ height: `${Math.max(3, Math.min(12, (realtimeFeed.audioLevel || 0) * 0.18))}px` }}
                              />
                              <span className="text-[8px] font-mono font-bold text-emerald-300 ml-0.5">VOICE</span>
                            </div>
                          )}

                          {realtimeFeed.screenActive && (
                            <>
                              <span className="text-neutral-400">&bull;</span>
                              <span className="text-cyan-300">Screen Active</span>
                            </>
                          )}
                        </div>

                        {/* Live Multi-View & Audio Controls Overlay */}
                        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-black/85 backdrop-blur-md p-1.5 rounded-xl border border-white/15 shadow-md">
                          {/* Live Microphone Audio Toggle */}
                          <button
                            type="button"
                            onClick={() => setIsAudioMuted(!isAudioMuted)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              !isAudioMuted
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-neutral-800 text-neutral-300 hover:text-white"
                            }`}
                            title={!isAudioMuted ? "Mute live microphone audio" : "Listen to live microphone audio"}
                          >
                            {!isAudioMuted ? (
                              <Volume2 className="w-3 h-3 text-emerald-200 animate-pulse" />
                            ) : (
                              <VolumeX className="w-3 h-3 text-neutral-400" />
                            )}
                            <span>{!isAudioMuted ? "Live Audio" : "Listen"}</span>
                          </button>

                          {/* Layout Switches */}
                          <div className="flex items-center gap-1 border-l border-white/15 pl-1.5">
                            <button
                              type="button"
                              onClick={() => setLiveLayout("pip")}
                              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                liveLayout === "pip"
                                  ? "bg-[#be185d] text-white"
                                  : "text-neutral-300 hover:text-white"
                              }`}
                              title="Picture in Picture: Screen with Face in corner"
                            >
                              <Layers className="w-3 h-3" />
                              <span>PiP</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setLiveLayout("split")}
                              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                liveLayout === "split"
                                  ? "bg-[#be185d] text-white"
                                  : "text-neutral-300 hover:text-white"
                              }`}
                              title="Split View: Face and Screen side by side"
                            >
                              <Layout className="w-3 h-3" />
                              <span>Split</span>
                              {realtimeFeed.screenActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse ml-0.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setLiveLayout("cam")}
                              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                liveLayout === "cam"
                                  ? "bg-[#be185d] text-white"
                                  : "text-neutral-300 hover:text-white"
                              }`}
                              title="Face Cam only"
                            >
                              <Camera className="w-3 h-3" />
                              <span>Cam</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setLiveLayout("screen")}
                              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                liveLayout === "screen"
                                  ? "bg-[#be185d] text-white"
                                  : "text-neutral-300 hover:text-white"
                              }`}
                              title="Screen share only"
                            >
                              <Monitor className="w-3 h-3" />
                              <span>Screen</span>
                              {realtimeFeed.screenActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse ml-0.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : activePlaybackVideo && !videoPlaybackError ? (
                      /* ── 2. RECORDED VIDEO PLAYBACK / STANDBY BACKUP ── */
                      <video
                        key={`recorded_reaction_${activePlaybackVideo.uploadId || activePlaybackVideo.cloudinaryUrl}`}
                        controls
                        playsInline
                        autoPlay
                        muted
                        loop
                        onError={() => setVideoPlaybackError(true)}
                        onLoadedData={() => setVideoPlaybackError(false)}
                        className="w-full h-full object-contain"
                      >
                        <source
                          src={activePlaybackVideo.cloudinaryUrl}
                          type={
                            activePlaybackVideo.metadata?.format === "mp4" ||
                            activePlaybackVideo.cloudinaryUrl.includes(".mp4")
                              ? "video/mp4"
                              : "video/webm"
                          }
                        />
                        <source src={activePlaybackVideo.cloudinaryUrl} />
                      </video>
                    ) : activePlaybackVideo && videoPlaybackError ? (
                      /* ── Fallback Card if Video Format is unsupported by browser ── */
                      <div className="text-center p-6 text-neutral-300 flex flex-col items-center justify-center max-w-sm">
                        <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-[#fb7185] flex items-center justify-center mb-3">
                          <Video className="w-6 h-6 animate-pulse" />
                        </div>
                        <p className="text-xs font-mono font-bold text-neutral-200 mb-1">
                          Recorded Video Ready
                        </p>
                        <p className="text-[11px] text-neutral-400 font-sans leading-relaxed mb-4">
                          Reaction video is safely stored on the server. Your current browser encountered a direct playback constraint.
                        </p>
                        <div className="flex items-center gap-2 flex-wrap justify-center">
                          <button
                            type="button"
                            onClick={() =>
                              handleSaveVideo(
                                activePlaybackVideo.cloudinaryUrl,
                                `anshii_reaction_${activePlaybackVideo.sessionId || "rec"}.${
                                  activePlaybackVideo.metadata?.format || "mp4"
                                }`
                              )
                            }
                            className="px-3 py-1.5 rounded-xl bg-[#fb7185] hover:bg-[#f43f5e] text-white text-xs font-bold font-sans flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Save Video</span>
                          </button>
                          <a
                            href={activePlaybackVideo.cloudinaryUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-200 text-xs font-sans font-semibold flex items-center gap-1 transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open In Tab</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => setVideoPlaybackError(false)}
                            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-xs font-sans cursor-pointer transition-all"
                          >
                            ↺ Retry
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-8 text-neutral-400">
                        <Video className="w-10 h-10 mx-auto mb-2 text-neutral-600 animate-pulse" />
                        <p className="text-xs font-mono">
                          Live reaction video recording stands by...
                        </p>
                        <p className="text-[11px] text-neutral-500 font-sans mt-1">
                          When Anshii interacts on the website, instant live streaming and continuous .mp4 video clips appear here.
                        </p>
                      </div>
                    )}

                    {/* Chapter Slide Tag (when not in custom overlay) */}
                    {(realtimeFeed.slide || latestVideo?.slide || liveMonitor?.slide) &&
                      !(monitorMode === "live" && realtimeFeed.active) && (
                        <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-xs text-[#fda4af] text-[10px] font-mono px-2.5 py-1 rounded-full border border-white/10">
                          Slide: {realtimeFeed.slide || latestVideo?.slide || liveMonitor?.slide}
                        </div>
                      )}
                  </div>

                  {/* Actions for Latest Contiguous Reaction Video */}
                  {latestVideo && (
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#faf7f2] border border-[#ebdcd0]">
                      <div className="text-xs font-sans text-[#3f2e24]">
                        <span className="font-bold text-[#be185d]">⭐ Full Session Video: </span>
                        <span>
                          {latestVideo.caption || "Full Reaction Video (Entry to Exit)"}
                        </span>
                        <span className="text-[#8c7465] text-[11px] ml-2">
                          ({formatTimeAgo(latestVideo.uploadedAt)})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* 🌟 SAVE FULL CONTIGUOUS VIDEO BUTTON 🌟 */}
                        <button
                          onClick={() =>
                            handleSaveVideo(
                              latestVideo.cloudinaryUrl,
                              `anshii_full_reaction_${Date.now()}.mp4`
                            )
                          }
                          disabled={downloadingUrl === latestVideo.cloudinaryUrl}
                          className="px-4 py-2 rounded-xl bg-[#be185d] hover:bg-[#9d174d] active:scale-[0.98] text-white text-xs font-sans font-bold flex items-center gap-2 shadow-sm cursor-pointer transition-all disabled:opacity-50"
                        >
                          {downloadingUrl === latestVideo.cloudinaryUrl ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Saving Video...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Full Video (.mp4)</span>
                            </>
                          )}
                        </button>

                        <a
                          href={latestVideo.cloudinaryUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-white border border-[#ebdcd0] hover:bg-[#f5ece3] text-[#786457]"
                          title="Open original video stream"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* ── 🎁 GIFT UNBOXING LIVE APPROVAL BY ADMIN ── */}
                  <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#ebdcd0] shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                          <Gift className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-sans font-bold text-[#3f2e24]">
                            Gift Unboxing Live Approval
                          </h4>
                          <p className="text-[10px] text-[#8c7465]">
                            Watch her live video above — click Approve as she shows each gift to unlock her next step
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          {Object.values(giftApprovals).filter(Boolean).length} / 4 Approved
                        </span>
                      </div>
                    </div>

                    {/* 4 Steps Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { id: "step-1", icon: "📦", title: "Step 1: Closed Box", prompt: "Shows sealed box to camera" },
                        { id: "step-2", icon: "✨", title: "Step 2: Wear Bracelet", prompt: "Opens box & shows bracelet on wrist" },
                        { id: "step-3", icon: "🧸", title: "Step 3: Fluffy Teddy", prompt: "Finds 2nd gift & shows teddy bear" },
                        { id: "step-4", icon: "💖", title: "Step 4: All Gifts & Smile", prompt: "Holds all gifts together with big smile" },
                      ].map((step, idx) => {
                        const isApproved = Boolean(giftApprovals[step.id]);
                        const isPrevApproved = idx === 0 || Boolean(giftApprovals[`step-${idx}`]);
                        const isBusy = isUpdatingApproval === step.id;

                        return (
                          <div
                            key={step.id}
                            className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                              isApproved
                                ? "bg-emerald-50/90 border-emerald-300 shadow-2xs"
                                : isPrevApproved
                                ? "bg-white border-amber-300 shadow-2xs ring-1 ring-amber-200"
                                : "bg-[#f5ede4]/40 border-[#ebdcd0] opacity-65"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xl shrink-0">{step.icon}</span>
                                <div className="min-w-0">
                                  <p className="text-xs font-sans font-bold text-[#3f2e24] leading-tight truncate">
                                    {step.title}
                                  </p>
                                  <p className="text-[10px] text-[#8c7465] leading-tight mt-0.5">
                                    {step.prompt}
                                  </p>
                                </div>
                              </div>
                              {isApproved ? (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold shrink-0">
                                  <Check className="w-2.5 h-2.5" />
                                  Approved
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[9px] font-mono font-bold shrink-0 border border-amber-200">
                                  Pending
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-black/5">
                              {!isApproved ? (
                                <button
                                  type="button"
                                  onClick={() => handleApproveGiftStep(step.id, true)}
                                  disabled={isBusy}
                                  className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[11px] font-sans font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 transition-all"
                                >
                                  {isBusy ? (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Check className="w-3 h-3" />
                                  )}
                                  <span>Approve {step.title.split(":")[0]}</span>
                                </button>
                              ) : (
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-[10px] text-emerald-800 font-mono font-semibold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    Verified on Live Cam
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleApproveGiftStep(step.id, false)}
                                    disabled={isBusy}
                                    className="text-[10px] text-neutral-400 hover:text-rose-600 underline cursor-pointer"
                                  >
                                    Revoke
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick action footer */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#ebdcd0]/60">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleApproveAllGiftSteps}
                          disabled={isUpdatingApproval !== null}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 border border-amber-300 text-amber-900 text-[10px] font-mono font-bold cursor-pointer transition-colors shadow-2xs"
                        >
                          Approve All 4 Steps ✨
                        </button>
                        <button
                          type="button"
                          onClick={handleResetGiftApprovals}
                          disabled={isUpdatingApproval !== null}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-rose-50 border border-[#ebdcd0] text-[#8c7465] hover:text-rose-700 text-[10px] font-mono font-bold cursor-pointer transition-colors"
                        >
                          Reset Approvals 🔄
                        </button>
                      </div>
                      <span className="text-[10px] text-[#a89689] font-mono">
                        Instant live unlock on her window &lt;1.5s
                      </span>
                    </div>

                    {/* Approval Notice */}
                    {approvalNotice && (
                      <motion.div
                        initial={{ opacity: 0, y: 2 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[11px] font-mono font-bold text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>{approvalNotice}</span>
                      </motion.div>
                    )}
                  </div>

                  {/* ── 💬 LIVE MESSAGE & FLOATING EMOJI DISPATCHER ── */}
                  <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#ebdcd0] shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#ffe4e6] flex items-center justify-center text-[#e11d48]">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-xs font-sans font-bold text-[#3f2e24]">
                          Send Live Message &amp; Floating Emojis to Her Screen
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#be185d]">
                        Instant popup on her screen ✨
                      </span>
                    </div>

                    {/* Quick Preset Message Chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: "Look at slide! 👀", text: "Look closely at this slide right now! 👀✨", emojis: ["👀", "✨", "💖"] },
                        { label: "Happy Birthday! 🎂", text: "Happy Birthday Madam Ji! May all your dreams come true! 🎂💖", emojis: ["🎂", "🎉", "✨", "🥰"] },
                        { label: "Love your smile 🥰", text: "I love your smile right now, you look gorgeous! 🥰❤️", emojis: ["🥰", "💖", "🌸", "🥺"] },
                        { label: "Turn volume up 🎵", text: "Turn up your volume for this part! 🎵✨", emojis: ["🎵", "🎶", "✨"] },
                        { label: "You're cute ❤️", text: "Why are you so cute Madam Ji?! ❤️", emojis: ["❤️", "🥺", "🧸", "💖"] },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendLiveMessage(preset.text, preset.emojis)}
                          disabled={isSendingLiveMsg}
                          className="px-2.5 py-1 rounded-full bg-white hover:bg-[#ffe4e6] text-[#786457] hover:text-[#881337] border border-[#ebdcd0] text-[11px] font-sans font-medium transition-all active:scale-95 cursor-pointer disabled:opacity-50 shadow-2xs"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    {/* Custom Text Input & Send Button */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={liveMsgText}
                        onChange={(e) => setLiveMsgText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendLiveMessage();
                          }
                        }}
                        placeholder="Type a custom live message to Anshii..."
                        autoComplete="off"
                        data-lpignore="true"
                        data-1p-ignore="true"
                        data-form-type="other"
                        className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-[#ebdcd0] text-xs font-sans text-[#3f2e24] placeholder:text-[#a89689] focus:outline-hidden focus:border-[#fb7185] focus:ring-1 focus:ring-[#fda4af] transition-all"
                      />

                      <button
                        type="button"
                        onClick={() => handleSendLiveMessage()}
                        disabled={isSendingLiveMsg || (!liveMsgText.trim() && liveMsgEmojis.length === 0)}
                        className="px-4 py-2 rounded-xl bg-[#be185d] hover:bg-[#9d174d] active:scale-95 text-white text-xs font-sans font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-40"
                      >
                        {isSendingLiveMsg ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>Send Live</span>
                      </button>
                    </div>

                    {/* Emoji Selector Chips */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#ebdcd0]/60">
                      <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                        <span className="text-[10px] font-mono text-[#8c7465] shrink-0 mr-1">
                          Burst Emojis:
                        </span>
                        {["💖", "🥰", "✨", "🎂", "🌸", "🧸", "💌", "🎉", "🥺", "🔥", "👀"].map((emoji) => {
                          const isSelected = liveMsgEmojis.includes(emoji);
                          return (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                setLiveMsgEmojis((prev) =>
                                  isSelected
                                    ? prev.filter((e) => e !== emoji)
                                    : [...prev, emoji]
                                );
                              }}
                              className={`w-7 h-7 rounded-lg text-base flex items-center justify-center transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-[#ffe4e6] border border-[#fda4af] scale-110 shadow-xs"
                                  : "bg-white hover:bg-[#f3ece4] border border-[#ebdcd0] opacity-60 hover:opacity-100"
                              }`}
                              title={isSelected ? `Remove ${emoji}` : `Add ${emoji} to burst`}
                            >
                              {emoji}
                            </button>
                          );
                        })}
                      </div>

                      {/* Quick send emoji burst only */}
                      <button
                        type="button"
                        onClick={() => handleSendLiveMessage("", liveMsgEmojis)}
                        disabled={isSendingLiveMsg || liveMsgEmojis.length === 0}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#ffe4e6] text-[#be185d] border border-[#ebdcd0] text-[10px] font-mono font-bold transition-all cursor-pointer shrink-0 disabled:opacity-40 shadow-2xs"
                      >
                        Float Emojis Only ✨
                      </button>
                    </div>

                    {/* Delivery Notification Toast */}
                    {liveMsgNotice && (
                      <motion.div
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                        <span>{liveMsgNotice}</span>
                      </motion.div>
                    )}
                  </div>

                  {/* ── 🎙️ VOICE TO ANSHIKA (VOICE NOTES & LIVE INTERCOM) ── */}
                  <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#ebdcd0] shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#fce7f3] flex items-center justify-center text-[#db2777]">
                          <Mic className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-xs font-sans font-bold text-[#3f2e24]">
                          Send Your Voice to Anshika
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {isLiveIntercomOn ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-[#be185d] text-[10px] font-mono font-bold animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                            Live Intercom ON
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-[#be185d]">
                            Auto-plays on her screen ✨
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Dual Action Grid: Live Walkie-Talkie & Recorded Voice Note */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* 1. Live Intercom Toggle */}
                      <button
                        type="button"
                        onClick={toggleLiveIntercom}
                        className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                          isLiveIntercomOn
                            ? "bg-rose-50 border-rose-300 text-[#be185d] shadow-sm ring-2 ring-rose-200"
                            : "bg-white hover:bg-rose-50/50 border-[#ebdcd0] text-[#786457]"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isLiveIntercomOn ? "bg-rose-600 text-white animate-pulse" : "bg-[#f5ede4] text-[#8c7465]"
                          }`}
                        >
                          {isLiveIntercomOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-sans font-bold leading-tight">
                            {isLiveIntercomOn ? "Speaking Live (Click to Mute)" : "Live Intercom (Speak Now)"}
                          </p>
                          <p className="text-[10px] text-[#a89689] truncate">
                            {isLiveIntercomOn ? "Streams live to her headphones" : "Direct WebRTC live audio"}
                          </p>
                        </div>
                      </button>

                      {/* 2. Voice Note Recorder Trigger */}
                      {!isRecordingVoice && !recordedVoiceUrl && (
                        <button
                          type="button"
                          onClick={startRecordingVoice}
                          className="p-3 rounded-xl bg-white hover:bg-[#ffe4e6]/60 border border-[#ebdcd0] text-[#786457] hover:text-[#881337] flex items-center gap-2.5 transition-all cursor-pointer text-left shadow-2xs active:scale-95"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#ffe4e6] flex items-center justify-center text-[#e11d48] shrink-0">
                            <Radio className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-sans font-bold leading-tight">
                              Record Voice Note
                            </p>
                            <p className="text-[10px] text-[#a89689] truncate">
                              Record, preview &amp; send audio clip
                            </p>
                          </div>
                        </button>
                      )}

                      {/* Recording in progress */}
                      {isRecordingVoice && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 flex items-center justify-between gap-2 shadow-inner">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping shrink-0" />
                            <div>
                              <span className="text-xs font-mono font-bold text-rose-700 block">
                                Recording: {Math.floor(voiceSeconds / 60)}:{(voiceSeconds % 60).toString().padStart(2, "0")}
                              </span>
                              <span className="text-[10px] text-rose-600/80">Speak your message...</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={cancelRecordingVoice}
                              className="px-2 py-1 rounded-lg bg-white border border-rose-200 text-rose-700 text-[11px] font-sans font-bold hover:bg-rose-100 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={stopRecordingVoice}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-sans font-bold hover:bg-rose-700 cursor-pointer flex items-center gap-1 shadow-xs"
                            >
                              <Square className="w-3 h-3 fill-white" />
                              <span>Stop</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Recorded Voice Preview & Send */}
                      {recordedVoiceUrl && !isRecordingVoice && (
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2 shadow-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <audio src={recordedVoiceUrl} controls className="h-8 max-w-[130px] sm:max-w-[150px]" />
                            <span className="text-[10px] font-mono font-bold text-emerald-800">
                              {voiceSeconds}s
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={cancelRecordingVoice}
                              disabled={isSendingVoice}
                              className="p-1.5 rounded-lg bg-white border border-emerald-200 text-neutral-600 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="Discard recording"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={handleSendVoiceNote}
                              disabled={isSendingVoice}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-sans font-bold flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                            >
                              {isSendingVoice ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Send className="w-3.5 h-3.5" />
                              )}
                              <span>Send</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Voice Delivery Notice Banner */}
                    {voiceNotice && (
                      <motion.div
                        initial={{ opacity: 0, y: 2 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{voiceNotice}</span>
                      </motion.div>
                    )}
                  </div>

                  {/* ── 📹 MY CAMERA & VOICE BROADCAST (PREVIEW & STREAM TO HER) ── */}
                  <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#ebdcd0] shadow-2xs space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
                          <Video className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-sans font-bold text-[#3f2e24]">
                            My Camera &amp; Live Video Stream
                          </h4>
                          <p className="text-[10px] text-[#8c7465]">
                            Preview yourself and share live video &amp; voice to her window
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isBroadcastingToHer ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-mono font-bold animate-pulse shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            {isMyCamActive ? "BROADCASTING CAM & VOICE" : "BROADCASTING VOICE ONLY"}
                          </span>
                        ) : isMyCamActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Camera Ready (Preview)
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-[#be185d]">
                            Small side popup on her screen ✨
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Main Grid: Preview Window (Left) + Stream Controls (Right) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-3 rounded-xl border border-[#ebdcd0]">
                      {/* Left (5 cols): Local Preview Box */}
                      <div className="md:col-span-5 flex flex-col gap-1.5">
                        <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center shadow-inner group">
                          {/* Mirrored Local Webcam Video */}
                          <video
                            ref={myCamPreviewRef}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${
                              isMyCamActive ? "opacity-100" : "opacity-0 absolute"
                            }`}
                          />

                          {/* Offline Placeholder */}
                          {!isMyCamActive && (
                            <div className="flex flex-col items-center justify-center p-3 text-center">
                              <CameraOff className="w-6 h-6 text-neutral-600 mb-1" />
                              <span className="text-[11px] font-sans font-medium text-neutral-400">
                                Camera is off
                              </span>
                              <button
                                type="button"
                                onClick={toggleMyCamPreview}
                                className="mt-2 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] font-mono font-bold transition-all cursor-pointer"
                              >
                                Turn On Preview
                              </button>
                            </div>
                          )}

                          {/* Status badges over preview */}
                          {isMyCamActive && (
                            <div className="absolute top-2 left-2 flex items-center gap-1">
                              <span className="bg-black/80 backdrop-blur-sm text-[9px] font-mono font-bold text-emerald-300 px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                YOU (SELF PREVIEW)
                              </span>
                            </div>
                          )}

                          {isBroadcastingToHer && (
                            <div className="absolute bottom-2 inset-x-2 bg-rose-600/90 backdrop-blur-sm text-white text-[9px] font-mono font-bold px-2 py-1 rounded-md text-center flex items-center justify-center gap-1.5 border border-white/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              {isMyCamActive ? "LIVE CAM & VOICE" : "LIVE VOICE (NO VIDEO)"}
                            </div>
                          )}
                        </div>

                        {/* Hidden canvas for turbo frame fallback capture */}
                        <canvas ref={canvasFrameRef} className="hidden" />

                        {/* Mic Status Indicator under preview */}
                        <div className="flex items-center justify-between text-[10px] px-1 text-[#8c7465]">
                          <span>Self-view (mirrored)</span>
                          <span className={isMyMicActive ? "text-emerald-700 font-bold" : "text-neutral-500"}>
                            {isMyMicActive ? "🎙️ Mic Unmuted" : "🔇 Mic Muted"}
                          </span>
                        </div>
                      </div>

                      {/* Right (7 cols): Controls & Broadcast Actions */}
                      <div className="md:col-span-7 flex flex-col justify-between gap-2.5">
                        {/* Toggles */}
                        <div className="space-y-2">
                          <p className="text-[11px] font-sans text-[#786457]">
                            Share your <strong>live video &amp; voice</strong> or stream <strong>voice only</strong> without camera. A small rectangle or glowing soundwave card pops up smoothly on the side of her window.
                          </p>

                          <div className="grid grid-cols-2 gap-2">
                            {/* Cam Toggle */}
                            <button
                              type="button"
                              onClick={toggleMyCamPreview}
                              className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition-all cursor-pointer ${
                                isMyCamActive
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs"
                                  : "bg-white hover:bg-neutral-50 border-[#ebdcd0] text-[#786457]"
                              }`}
                            >
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                isMyCamActive ? "bg-emerald-600 text-white" : "bg-[#f5ede4] text-[#8c7465]"
                              }`}>
                                {isMyCamActive ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[11px] font-sans font-bold leading-tight truncate">
                                  {isMyCamActive ? "Cam On" : "Turn On Cam"}
                                </p>
                                <p className="text-[9px] text-[#a89689] truncate">
                                  {isMyCamActive ? "Click to turn off" : "Preview webcam"}
                                </p>
                              </div>
                            </button>

                            {/* Mic Toggle */}
                            <button
                              type="button"
                              onClick={toggleMyMic}
                              disabled={!myStreamRef.current}
                              className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition-all cursor-pointer disabled:opacity-50 ${
                                isMyMicActive && myStreamRef.current
                                  ? "bg-rose-50 border-rose-300 text-[#be185d] shadow-2xs"
                                  : "bg-white hover:bg-neutral-50 border-[#ebdcd0] text-[#786457]"
                              }`}
                            >
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                isMyMicActive && myStreamRef.current ? "bg-rose-600 text-white" : "bg-[#f5ede4] text-[#8c7465]"
                              }`}>
                                {isMyMicActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[11px] font-sans font-bold leading-tight truncate">
                                  {isMyMicActive ? "Mic On" : "Mic Muted"}
                                </p>
                                <p className="text-[9px] text-[#a89689] truncate">
                                  {isMyMicActive ? "Voice streaming" : "Click to unmute"}
                                </p>
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* Main Broadcast Trigger Buttons */}
                        <div>
                          {!isBroadcastingToHer ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => startBroadcast(true)}
                                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-sans font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
                              >
                                <Radio className="w-4 h-4 animate-pulse" />
                                <span>Share Cam &amp; Voice</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => startBroadcast(false)}
                                className="py-2.5 px-3 rounded-xl bg-white hover:bg-rose-50/80 border border-rose-300 text-[#be185d] text-xs font-sans font-bold flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer active:scale-98"
                              >
                                <Mic className="w-4 h-4 text-rose-600" />
                                <span>Stream Voice Only</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={stopBroadcast}
                              className="w-full py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-black text-rose-300 border border-rose-500/40 text-xs font-sans font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
                            >
                              <Square className="w-3.5 h-3.5 fill-rose-400" />
                              <span>Stop Live Broadcast ({isMyCamActive ? "Cam & Voice" : "Voice Only"})</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Notice */}
                    {broadcastNotice && (
                      <motion.div
                        initial={{ opacity: 0, y: 2 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[11px] font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl flex items-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                        <span>{broadcastNotice}</span>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Right (5 Cols): Master Contiguous Reaction Video Vault */}
                <div className="lg:col-span-5 flex flex-col gap-3">
                  <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-[#8c7465] flex items-center justify-between">
                    <span>Full Reaction Videos (Entry to Exit)</span>
                    <span className="text-[#fb7185]">
                      {recentUploads.length} saved
                    </span>
                  </h3>

                  <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                    {recentUploads.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-[#faf7f2] border border-[#ebdcd0] text-center text-xs text-[#8c7465]">
                        No full reaction videos recorded yet. When Anshii enters the website,
                        her complete reaction is recorded continuously from entry to exit.
                      </div>
                    ) : (
                      recentUploads.map((up, idx) => {
                        const isVid =
                          up.type === "video" ||
                          up.cloudinaryUrl.endsWith(".mp4") ||
                          up.cloudinaryUrl.endsWith(".webm") ||
                          up.page === "reaction_cam";

                        const isCurrentlyPlaying =
                          activePlaybackVideo?.uploadId === up.uploadId ||
                          activePlaybackVideo?.cloudinaryUrl === up.cloudinaryUrl;

                        return (
                          <div
                            key={`${up.uploadId || "clip"}_${idx}`}
                            onClick={() => {
                              setSelectedVideoForPreview(up);
                              setVideoPlaybackError(false);
                            }}
                            className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                              isCurrentlyPlaying
                                ? "bg-rose-50/90 border-rose-300 shadow-xs ring-1 ring-rose-400"
                                : "bg-white border-[#ebdcd0] shadow-2xs hover:shadow-sm hover:border-rose-200"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-12 h-12 rounded-xl bg-black/90 overflow-hidden shrink-0 relative flex items-center justify-center">
                                {isVid ? (
                                  <Video className={`w-5 h-5 ${isCurrentlyPlaying ? "text-rose-600 animate-pulse" : "text-[#fda4af]"}`} />
                                ) : (
                                  <Image
                                    unoptimized
                                    src={up.cloudinaryUrl}
                                    alt="thumb"
                                    fill
                                    className="object-cover"
                                  />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs font-serif font-bold text-[#3f2e24] truncate">
                                    {up.caption || `Reaction Clip #${recentUploads.length - idx}`}
                                  </p>
                                  {isCurrentlyPlaying && (
                                    <span className="shrink-0 px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[9px] font-mono font-bold flex items-center gap-0.5">
                                      <Play className="w-2 h-2 fill-white" />
                                      Playing
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-[#8c7465] font-sans block truncate">
                                  {formatTime(up.uploadedAt)} &bull;{" "}
                                  {up.slide || "continuous"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                              {/* 1-Click Save Video Button */}
                              <button
                                onClick={() =>
                                  handleSaveVideo(
                                    up.cloudinaryUrl,
                                    `anshii_reaction_${idx + 1}.mp4`
                                  )
                                }
                                disabled={downloadingUrl === up.cloudinaryUrl}
                                className="px-2.5 py-1.5 rounded-lg bg-[#fff0f3] hover:bg-[#ffe4e6] text-[#be185d] text-[11px] font-sans font-bold flex items-center gap-1 cursor-pointer transition-all"
                                title="Download video file to your computer"
                              >
                                <Download className="w-3 h-3" />
                                <span>Save</span>
                              </button>

                              <a
                                href={up.cloudinaryUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-[#f5ece3] hover:bg-[#ebdcd0] text-[#786457]"
                                title="Open in Cloudinary or disk"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            TAB 2: HER ACTIVITY FOOTPRINTS & COMPLETE TIMELINE
        ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === "footprints" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 4 Cols: Session Picker & Journey Roadmap */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#ebdcd0] shadow-xs">
                <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-[#8c7465] mb-3">
                  Select Visitor Session
                </h3>
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {sessions.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#8c7465] flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-[#fff0f3] flex items-center justify-center text-[#fb7185] text-lg">
                        🌸
                      </div>
                      <p className="font-serif font-bold text-sm text-[#3f2e24]">
                        Awaiting Anshika&apos;s Login
                      </p>
                      <p className="text-[11px] text-[#a89080]">
                        When Anshika logs in with password{" "}
                        <span className="font-mono text-[#fb7185] font-bold">
                          anshii19
                        </span>
                        , her session timeline, live device, and journey
                        milestones will appear here in real time.
                      </p>
                    </div>
                  ) : (
                    sessions.map((sess, idx) => {
                      const isSel = selectedSessionId === sess.sessionId;
                      return (
                        <div
                          key={`${sess.sessionId || "sess"}_${idx}`}
                          onClick={() => handleSelectSession(sess)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            isSel
                              ? "bg-[#fff0f3] border-[#fb7185] ring-2 ring-[#fda4af]/30 shadow-xs"
                              : "bg-white hover:bg-[#faf7f2] border-[#ebdcd0]"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-xs font-bold text-[#3f2e24]">
                              Visit #{sessions.length - idx}
                            </span>
                            <span className="text-[10px] text-[#8c7465] font-sans">
                              {formatTimeAgo(sess.lastSeenAt || sess.startedAt)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-[#786457]">
                            <span>
                              {sess.device || "Desktop"} &bull;{" "}
                              {formatDuration(sess.duration || 0)}
                            </span>
                            <span className="text-[#fb7185] font-bold">
                              {isSel ? "Active" : "Inspect"}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Chapter Progression Roadmap */}
              {activeSessionItem && (
                <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#ebdcd0] shadow-xs">
                  <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-[#8c7465] mb-3">
                    Scrapbook Chapter Journey
                  </h3>
                  <div className="space-y-2">
                    {[
                      { id: "welcome", label: "Chapter 1: Welcome & Lock" },
                      { id: "cake", label: "Chapter 2: Birthday Cake & Wish" },
                      { id: "photos", label: "Chapter 3: Polaroid Scrapbook" },
                      { id: "soundtrack", label: "Chapter 4: Birthday Music" },
                      { id: "quiz", label: "Chapter 5: Memory Love Quiz" },
                      { id: "letter", label: "Chapter 6: Handwritten Letter" },
                      { id: "scratch", label: "Chapter 7: Scratch Card" },
                      {
                        id: "keepsake",
                        label: "Chapter 8: Madam Ji Keepsake",
                      },
                      { id: "gifts", label: "Chapter 9: Secret Gifts Unboxing" },
                    ].map((chap, i) => {
                      const visited =
                        activeSessionItem.pagesVisited?.some((p) =>
                          p.toLowerCase().includes(chap.id)
                        ) || false;

                      return (
                        <div
                          key={chap.id}
                          className={`p-2.5 rounded-xl border text-xs font-sans flex items-center justify-between ${
                            visited
                              ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#166534] font-medium"
                              : "bg-[#faf7f2] border-[#ebdcd0] text-[#8c7465]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                visited ? "bg-[#22c55e]" : "bg-[#d6c7b9]"
                              }`}
                            />
                            <span>{chap.label}</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold">
                            {visited ? "EXPLORED" : "PENDING"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right 8 Cols: Complete Detailed Footprint Activity Stream */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#ebdcd0] shadow-xs">
                {/* Header & Filter Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#ebdcd0] mb-4">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-[#3f2e24]">
                      Chronological Activity Footprints
                    </h2>
                    <p className="text-xs text-[#786457] font-sans mt-0.5">
                      Session:{" "}
                      <span className="font-mono font-bold text-[#fb7185]">
                        {selectedSessionId || "Default"}
                      </span>{" "}
                      &bull; {sessionEvents.length} actions logged
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap gap-1">
                    {[
                      { key: "all", label: "All" },
                      { key: "login", label: "Logins" },
                      { key: "song", label: "Songs" },
                      { key: "video", label: "Videos" },
                      { key: "quiz", label: "Quiz/Notes" },
                    ].map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setActivityFilter(f.key)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-sans font-bold cursor-pointer transition-all ${
                          activityFilter === f.key
                            ? "bg-[#fb7185] text-white"
                            : "bg-[#f5ece3] text-[#786457] hover:bg-[#ebdcd0]"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timeline Stream */}
                {isLoadingTimeline ? (
                  <div className="py-16 text-center text-xs text-[#8c7465]">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#fb7185] mx-auto mb-2" />
                    <span>Loading footprints...</span>
                  </div>
                ) : sessionEvents.length === 0 ? (
                  <div className="py-16 text-center text-xs text-[#8c7465]">
                    No footprints recorded yet for this session.
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#ebdcd0]">
                    {sessionEvents
                      .filter((ev) => {
                        if (activityFilter === "all") return true;
                        if (activityFilter === "login")
                          return (
                            ev.type === "login" || ev.type === "session_start"
                          );
                        if (activityFilter === "song")
                          return ev.type.includes("song");
                        if (activityFilter === "video")
                          return ev.type.includes("video") || ev.type.includes("snap");
                        if (activityFilter === "quiz")
                          return (
                            ev.type.includes("task") ||
                            ev.type.includes("note") ||
                            ev.type.includes("quiz")
                          );
                        return true;
                      })
                      .map((ev, idx) => (
                        <div
                          key={`${ev.eventId || "ev"}_${idx}`}
                          className="relative flex items-start gap-3"
                        >
                          {/* Dot indicator */}
                          <div className="absolute -left-6 mt-1 w-4 h-4 rounded-full border-2 border-white bg-[#fb7185] flex items-center justify-center shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          </div>

                          {/* Event Box */}
                          <div className="flex-1 p-3 rounded-2xl bg-[#faf7f2] border border-[#ebdcd0]/80">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#fff0f3] text-[#be185d]">
                                {formatEventBadge(ev.type)}
                              </span>
                              <span className="text-[10px] font-mono text-[#a89080]">
                                {formatTime(ev.timestamp)}
                              </span>
                            </div>

                            {ev.elementText && (
                              <p className="text-xs font-sans text-[#3f2e24] font-medium mt-1">
                                &ldquo;{ev.elementText}&rdquo;
                              </p>
                            )}

                            {ev.page && (
                              <span className="text-[10px] font-mono text-[#8c7465] block mt-0.5">
                                Page: /{ev.page}
                              </span>
                            )}

                            {ev.metadata && Object.keys(ev.metadata).length > 0 && (
                              <pre className="mt-1.5 p-2 rounded-xl bg-white border border-[#ebdcd0] text-[9px] font-mono text-[#5c473a] overflow-x-auto">
                                {JSON.stringify(ev.metadata, null, 2)}
                              </pre>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            TAB 3: LOGINS & EXACT TIMING LOG
        ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === "logins" && (
          <div className="p-6 rounded-3xl bg-white border border-[#ebdcd0] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ebdcd0]">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#3f2e24]">
                  Login History &amp; Exact Timings
                </h2>
                <p className="text-xs text-[#786457] font-sans mt-0.5">
                  Detailed logs of every time she opened with{" "}
                  <span className="font-mono font-bold text-[#fb7185]">anshii19</span> or you tested with{" "}
                  <span className="font-mono font-bold text-[#2563eb]">anuj19</span>.
                </p>
              </div>

              {/* Filter Pills for Anshii vs Anuj */}
              <div className="flex items-center gap-1.5">
                {[
                  { key: "all", label: "All Logins" },
                  { key: "anshii", label: "🌸 Anshii Only" },
                  { key: "anuj", label: "🛠️ Anuj (Tests)" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setLoginFilter(f.key as any)}
                    className={`px-3 py-1 rounded-xl text-xs font-sans font-bold cursor-pointer transition-all ${
                      loginFilter === f.key
                        ? "bg-[#fb7185] text-white shadow-2xs"
                        : "bg-[#f5ece3] text-[#786457] hover:bg-[#ebdcd0]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {(() => {
                const isAnujItem = (item: any) =>
                  item.role === "anuj" ||
                  item.passwordUsed === "@Ritusandhu1983" ||
                  item.passwordUsed === "ANUJ88" ||
                  item.passwordUsed === "ANUJ19" ||
                  item.userName?.includes("Anuj") ||
                  item.isTester === true;

                const candidateList = logins.length > 0 ? logins : sessions;
                const filteredList = candidateList.filter((item: any) => {
                  const isAnuj = isAnujItem(item);
                  if (loginFilter === "anuj") return isAnuj;
                  if (loginFilter === "anshii") return !isAnuj;
                  return true;
                });

                if (filteredList.length === 0) {
                  return (
                    <div className="p-8 text-center rounded-2xl bg-white border border-[#ebdcd0] flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-[#fff0f3] flex items-center justify-center text-[#fb7185] text-xl">
                        🌸
                      </div>
                      <h3 className="font-serif font-bold text-base text-[#3f2e24]">
                        {loginFilter === "anshii"
                          ? "Awaiting Anshika's Login"
                          : "No Logins Recorded"}
                      </h3>
                      <p className="text-xs text-[#786457] max-w-sm">
                        {loginFilter === "anshii"
                          ? "No logins yet from Anshika. When she logs in with password 'anshii19', her exact timing, device, and footprints will be tracked here in real time."
                          : "No activity recorded yet for this view."}
                      </p>
                    </div>
                  );
                }

                return filteredList.map((item: any, idx) => {
                  const timestamp = item.timestamp || item.startedAt;
                  const duration = item.duration || 0;
                  const device = item.device || "Desktop";
                  const browser = item.browser || "Browser";
                  const isAnuj = isAnujItem(item);

                  return (
                    <div
                      key={`${item.loginId || item.sessionId || "log"}_${idx}`}
                      className="p-4 rounded-2xl bg-[#faf7f2] border border-[#ebdcd0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white transition-all shadow-2xs"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isAnuj
                              ? "bg-[#eff6ff] text-[#1e40af]"
                              : "bg-[#fff0f3] text-[#be185d]"
                          }`}
                        >
                          <KeyIcon
                            className={`w-5 h-5 ${
                              isAnuj ? "text-[#3b82f6]" : "text-[#fb7185]"
                            }`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif font-bold text-sm text-[#3f2e24]">
                              Login #{idx + 1}
                            </h4>
                            {isAnuj ? (
                              <span className="px-2 py-0.5 rounded-full bg-[#eff6ff] text-[#1e40af] border border-[#bfdbfe] text-[10px] font-mono font-bold">
                                🛠️ Anuj (Admin)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-[#fdf2f8] text-[#be185d] border border-[#fbcfe8] text-[10px] font-mono font-bold">
                                🌸 Anshii (Birthday Girl)
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#786457] font-sans mt-0.5">
                            Date:{" "}
                            <span className="font-semibold text-[#3f2e24]">
                              {formatFullDate(timestamp)}
                            </span>{" "}
                            &bull; Exact Time:{" "}
                            <span className="font-mono font-bold text-[#fb7185]">
                              {formatTime(timestamp)}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-sans text-[#786457]">
                        <div>
                          <span className="text-[10px] text-[#8c7465] uppercase block">
                            Device
                          </span>
                          <span className="font-medium text-[#3f2e24]">
                            {device} &bull; {browser}
                          </span>
                        </div>

                        {duration > 0 && (
                          <div>
                            <span className="text-[10px] text-[#8c7465] uppercase block">
                              Duration
                            </span>
                            <span className="font-medium text-[#3f2e24]">
                              {formatDuration(duration)}
                            </span>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            if (item.sessionId) {
                              setSelectedSessionId(item.sessionId);
                              setActiveTab("footprints");
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#fb7185] hover:bg-[#f43f5e] text-white text-xs font-bold cursor-pointer transition-all"
                        >
                          View Footprints
                        </button>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            TAB 4: CLOUDINARY MEDIA VAULT
        ═════════════════════════════════════════════ */}
        {activeTab === "gallery" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#3f2e24]">
                  Cloudinary Stored Media Vault ({recentUploads.length})
                </h2>
                <p className="text-xs text-[#786457] font-sans">
                  All live reaction videos &amp; snapshot photos saved during
                  visits.
                </p>
              </div>
            </div>

            {recentUploads.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-[#ebdcd0] text-center text-xs text-[#8c7465]">
                No media uploaded yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {recentUploads.map((up, idx) => {
                  const isVid =
                    up.type === "video" ||
                    up.cloudinaryUrl.includes(".mp4") ||
                    up.cloudinaryUrl.includes(".webm") ||
                    up.cloudinaryUrl.includes("/video/") ||
                    up.page === "reaction_cam";

                  return (
                    <div
                      key={`${up.uploadId || "upload_card"}_${idx}`}
                      className="p-3.5 rounded-2xl bg-white border border-[#ebdcd0] shadow-xs flex flex-col justify-between"
                    >
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-black/90 border border-[#ebdcd0] mb-2.5">
                        <video
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover"
                        >
                          <source
                            src={up.cloudinaryUrl}
                            type={
                              up.metadata?.format === "mp4" || up.cloudinaryUrl.includes(".mp4")
                                ? "video/mp4"
                                : "video/webm"
                            }
                          />
                          <source src={up.cloudinaryUrl} />
                        </video>
                      </div>

                      <div className="flex flex-col gap-1">
                        <p className="text-xs font-serif font-bold text-[#3f2e24] truncate">
                          {up.caption || "Reaction Footage"}
                        </p>
                        <span className="text-[10px] text-[#8c7465] font-sans">
                          {formatTime(up.uploadedAt)} &bull; {up.slide || "live"}
                        </span>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[#f5ece3] flex items-center justify-between">
                        {/* 🌟 SAVE VIDEO BUTTON 🌟 */}
                        <button
                          onClick={() =>
                            handleSaveVideo(
                              up.cloudinaryUrl,
                              `anshii_reaction_video_${idx + 1}.mp4`
                            )
                          }
                          disabled={downloadingUrl === up.cloudinaryUrl}
                          className="px-2.5 py-1 rounded-lg bg-[#fff0f3] hover:bg-[#ffe4e6] text-[#be185d] text-[11px] font-sans font-bold flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Download className="w-3 h-3" />
                          <span>Save Video (.mp4)</span>
                        </button>

                        <a
                          href={up.cloudinaryUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded-md text-[#786457] hover:text-[#fb7185]"
                          title="Open in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ── Icons & Helpers ──────────────────────────────────────────────────────────
function KeyIcon(props: any) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="m21 3-9.5 9.5" />
      <path d="m15.5 7.5 2.5 2.5" />
    </svg>
  );
}

function formatDuration(sec: number): string {
  if (!sec || isNaN(sec)) return "0s";
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

function formatTimeAgo(isoString?: string): string {
  if (!isoString) return "just now";
  const now = Date.now();
  const past = new Date(isoString).getTime();
  const diffSec = Math.max(0, Math.floor((now - past) / 1000));
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

function formatTime(isoString?: string): string {
  if (!isoString) return "--:--";
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return isoString;
  }
}

function formatFullDate(isoString?: string): string {
  if (!isoString) return "Recent";
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}

function formatEventBadge(type: string): string {
  if (type === "login") return "🔑 Unlocked Password";
  if (type === "session_start") return "🌟 Opened Site";
  if (type === "song_play") return "🎵 Played Song";
  if (type === "reaction_video_recorded") return "📹 Video Recorded";
  if (type === "live_frame_snapshot") return "📸 Live Snapshot";
  if (type === "task_complete") return "✨ Completed Activity";
  if (type === "madam_ji_note") return "💌 Wrote Note";
  if (type === "page_view") return "👀 Viewed Chapter";
  return type.replace(/_/g, " ");
}
