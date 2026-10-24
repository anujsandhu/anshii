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
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);

  // Active Tab & Filters
  const [activeTab, setActiveTab] = useState<
    "live" | "footprints" | "logins" | "gallery"
  >("live");
  const [activityFilter, setActivityFilter] = useState<string>("all");
  const [loginFilter, setLoginFilter] = useState<"all" | "anshii" | "anuj">("all");
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

    // 2. High-speed HTTP poll fallback (<120ms delay) runs seamlessly if SSE is connecting or blocked by proxy
    let isFetching = false;
    const streamPump = setInterval(async () => {
      if (sseActive || isFetching) return;
      isFetching = true;
      try {
        const ctrl = new AbortController();
        const tId = setTimeout(() => ctrl.abort(), 600);

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
    }, 120);

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
    const cachedKey = sessionStorage.getItem("anshii_admin_key");
    if (cachedKey) {
      setAdminKey(cachedKey);
      fetchDashboardData(cachedKey, true);
    }
  }, []);

  // ── 2b. Background Auto-Sync every 2.5 seconds when logged in ──
  useEffect(() => {
    if (!adminKey || !autoSync) return;

    const interval = setInterval(() => {
      fetchDashboardData(adminKey, false);
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
      const data = await res.json();
      if (res.ok && data.success) {
        setStats(data.stats);
        setLiveMonitor(data.liveMonitor || null);
        setLogins(data.logins || []);
        const sessList: SessionData[] = data.sessions || [];
        setSessions(sessList);
        setRecentUploads(data.recentUploads || []);
        setLastSyncTime(new Date());

        // Default-select the first session if none is selected
        if (!selectedSessionId && sessList.length > 0) {
          handleSelectSession(sessList[0], key);
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
      const data = await res.json();
      if (res.ok && data.success) {
        setSessionEvents(data.events || []);
        setSessionUploads(data.uploads || []);
      }
    } catch (err) {
      console.error("Session timeline fetch error:", err);
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
      const data = await res.json();
      if (res.ok && data.success) {
        setSessionEvents(data.events || []);
        setSessionUploads(data.uploads || []);
      }
    } catch (err) {
      console.error("Timeline refresh error:", err);
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
        if (lowerKey === "anuj88" || lowerKey === "anuj19") {
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
        "Are you sure you want to reset all completed tasks and test data?\n\nThis will wipe all completed chapters, scratch card state, quiz answers, test uploads, and analytics so the scrapbook starts completely fresh for production."
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

      // 2. Call admin DELETE API
      const keyToUse = adminKey || "anuj88";
      const res = await fetch(
        `/api/analytics/admin?key=${encodeURIComponent(keyToUse)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        alert("✅ All testing tasks, completions, and analytics have been wiped clean! Ready for production.");
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
                window.location.href = "/?pass=anuj88";
              }}
              className="w-full mt-3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 hover:brightness-110 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Unlock className="w-4 h-4 text-white" />
              <span>🚀 Open Scrapbook (Bypass All Gates)</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#ebdcd0] w-full flex items-center justify-center">
            <Link
              href="/?pass=anuj88"
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

            {/* Reset All Tasks (Clean Production State) */}
            <button
              onClick={handleResetAllData}
              disabled={isResetting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-sans font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              title="Delete all completed tasks, test uploads, and analytics for a completely fresh start"
            >
              <Trash2 className="w-3.5 h-3.5 text-amber-700" />
              <span>{isResetting ? "Resetting..." : "Reset All Tasks"}</span>
            </button>

            {/* Direct Open Bypassed Site Button */}
            <a
              href="/?pass=anuj88&clear=true"
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
        {/* ── Metric Summary Cards ── */}
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
                {stats?.totalLogins || logins.length || sessions.length || 0}
              </div>
              <span className="text-[11px] text-[#786457] font-sans">
                {sessions.length} unique visitor sessions
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
                {formatDuration(
                  sessions.reduce((acc, s) => acc + (s.duration || 0), 0)
                )}
              </div>
              <span className="text-[11px] text-[#786457] font-sans">
                Avg: {formatDuration(stats?.avgDurationSeconds || 0)} / visit
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
                {stats?.totalEvents || 0}
              </div>
              <span className="text-[11px] text-[#786457] font-sans">
                Clicks, songs, quiz &amp; notes
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
                {recentUploads.filter((u) => u.type === "video").length ||
                  recentUploads.length}
              </div>
              <span className="text-[11px] text-[#786457] font-sans">
                Auto-saved live to Cloudinary
              </span>
            </div>
          </div>
        </div>

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
                    ) : latestVideo && !videoPlaybackError ? (
                      /* ── 2. RECORDED VIDEO PLAYBACK / STANDBY BACKUP ── */
                      <video
                        key={`recorded_reaction_${latestVideo.uploadId || latestVideo.cloudinaryUrl}`}
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
                          src={latestVideo.cloudinaryUrl}
                          type={
                            latestVideo.metadata?.format === "mp4" ||
                            latestVideo.cloudinaryUrl.includes(".mp4")
                              ? "video/mp4"
                              : "video/webm"
                          }
                        />
                        <source src={latestVideo.cloudinaryUrl} />
                      </video>
                    ) : latestVideo && videoPlaybackError ? (
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
                                latestVideo.cloudinaryUrl,
                                `anshii_reaction_${latestVideo.sessionId || "rec"}.${
                                  latestVideo.metadata?.format || "mp4"
                                }`
                              )
                            }
                            className="px-3 py-1.5 rounded-xl bg-[#fb7185] hover:bg-[#f43f5e] text-white text-xs font-bold font-sans flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Save Video</span>
                          </button>
                          <a
                            href={latestVideo.cloudinaryUrl}
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

                        return (
                          <div
                            key={`${up.uploadId || "clip"}_${idx}`}
                            className="p-3 rounded-2xl bg-white border border-[#ebdcd0] shadow-2xs hover:shadow-sm transition-all flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-12 h-12 rounded-xl bg-black/90 overflow-hidden shrink-0 relative flex items-center justify-center">
                                {isVid ? (
                                  <Video className="w-5 h-5 text-[#fda4af]" />
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
                                <p className="text-xs font-serif font-bold text-[#3f2e24] truncate">
                                  {up.caption || "Live Reaction Clip"}
                                </p>
                                <span className="text-[10px] text-[#8c7465] font-sans block truncate">
                                  {formatTime(up.uploadedAt)} &bull;{" "}
                                  {up.slide || "continuous"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* 1-Click Save Video Button */}
                              <button
                                onClick={() =>
                                  handleSaveVideo(
                                    up.cloudinaryUrl,
                                    `anshii_clip_${idx + 1}.mp4`
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
                                title="Open in Cloudinary"
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
                    <div className="p-4 text-center text-xs text-[#8c7465]">
                      No sessions recorded yet.
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
              {(logins.length > 0 ? logins : sessions)
                .filter((item: any) => {
                  const isAnuj =
                    item.role === "anuj" ||
                    item.passwordUsed === "ANUJ19" ||
                    item.userName?.includes("Anuj") ||
                    item.isTester === true;
                  if (loginFilter === "anuj") return isAnuj;
                  if (loginFilter === "anshii") return !isAnuj;
                  return true;
                })
                .map((item: any, idx) => {
                  const timestamp = item.timestamp || item.startedAt;
                  const duration = item.duration || 0;
                  const device = item.device || "Desktop";
                  const browser = item.browser || "Browser";
                  const isAnuj =
                    item.role === "anuj" ||
                    item.passwordUsed === "ANUJ19" ||
                    item.userName?.includes("Anuj") ||
                    item.isTester === true;

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
                })}
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
