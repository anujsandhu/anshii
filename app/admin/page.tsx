"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Lock,
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
  caption?: string;
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
    sizeBytes?: number;
  };
}

export default function AdminAnalyticsDashboard() {
  const [adminKey, setAdminKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Dashboard Data State
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [recentUploads, setRecentUploads] = useState<UploadRecord[]>([]);

  // Selected Session Timeline
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
  const [sessionEvents, setSessionEvents] = useState<TimelineEvent[]>([]);
  const [sessionUploads, setSessionUploads] = useState<UploadRecord[]>([]);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"sessions" | "uploads">("sessions");

  // Check stored admin key on mount
  useEffect(() => {
    const cachedKey = sessionStorage.getItem("anshii_admin_key");
    if (cachedKey) {
      setAdminKey(cachedKey);
      fetchDashboardData(cachedKey);
    }
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;

    setIsVerifying(true);
    setAuthError("");

    try {
      const res = await fetch(`/api/analytics/admin?key=${encodeURIComponent(keyInput.trim())}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setAdminKey(keyInput.trim());
        sessionStorage.setItem("anshii_admin_key", keyInput.trim());
        setStats(data.stats);
        setSessions(data.sessions || []);
        setRecentUploads(data.recentUploads || []);
      } else {
        setAuthError(data.error || "Incorrect admin key.");
      }
    } catch (err) {
      setAuthError("Failed to reach analytics server.");
    } finally {
      setIsVerifying(false);
    }
  };

  const fetchDashboardData = async (key = adminKey) => {
    if (!key) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/analytics/admin?key=${encodeURIComponent(key)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setStats(data.stats);
        setSessions(data.sessions || []);
        setRecentUploads(data.recentUploads || []);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSession = async (sess: SessionData) => {
    setSelectedSessionId(sess.sessionId);
    setSelectedSession(sess);
    setIsLoadingTimeline(true);

    try {
      const res = await fetch(
        `/api/analytics/admin?key=${encodeURIComponent(adminKey)}&sessionId=${encodeURIComponent(sess.sessionId)}`
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

  const handleLogout = () => {
    sessionStorage.removeItem("anshii_admin_key");
    setAdminKey("");
    setKeyInput("");
    setSessions([]);
    setSelectedSessionId(null);
  };

  // ── Render 1: Admin Password Protection Gate ────────────────────────────────
  if (!adminKey) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex flex-col items-center justify-center p-4 selection:bg-[#fda4af]/40">
        <div className="w-full max-w-sm bg-[#fffdfa] rounded-3xl border-2 border-[#ebdcd0] shadow-xl p-6 sm:p-8 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-[#fff0f3] border border-[#fbcfe8] text-[#be185d] flex items-center justify-center mb-3.5 shadow-2xs">
            <Lock className="w-6 h-6 text-[#fb7185]" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#3f2e24]">
            Admin Analytics
          </h1>
          <p className="text-xs text-[#786457] font-sans mt-1 mb-6">
            Enter the admin key to view visitor sessions &amp; Cloudinary uploads.
          </p>

          <form onSubmit={handleAuthSubmit} className="w-full flex flex-col gap-3">
            <input
              type="password"
              value={keyInput}
              onChange={(e) => {
                setKeyInput(e.target.value);
                if (authError) setAuthError("");
              }}
              placeholder="Admin key or site password"
              autoFocus
              className="w-full px-4 py-3 rounded-2xl bg-[#faf7f2] border-2 border-[#ebdcd0] focus:border-[#fb7185] focus:bg-white text-center font-mono font-bold text-sm tracking-wider uppercase outline-hidden"
            />

            {authError && (
              <p className="text-xs font-sans text-[#e11d48] bg-[#fff1f2] border border-[#fecdd3] px-3 py-1.5 rounded-xl">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={isVerifying || !keyInput.trim()}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#fda4af] to-[#fb7185] text-white font-sans font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? "Verifying..." : "ACCESS DASHBOARD →"}
            </button>
          </form>

          <Link
            href="/"
            className="mt-5 text-xs text-[#a89080] hover:text-[#3f2e24] font-sans flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Birthday Site</span>
          </Link>
        </div>
      </div>
    );
  }

  // ── Render 2: Admin Dashboard Console ───────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#3f2e24] font-sans selection:bg-[#fda4af]/40 pb-12">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-30 bg-[#fffdfa]/95 backdrop-blur-md border-b border-[#ebdcd0] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 rounded-xl bg-[#f5ece3] hover:bg-[#ebdcd0] text-[#786457] hover:text-[#3f2e24] transition-colors"
            title="Go to website"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-base sm:text-lg text-[#3f2e24]">
                Anshika 19th Birthday
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] font-bold">
                Firestore &bull; Cloudinary
              </span>
            </div>
            <span className="text-[11px] text-[#8c7465] font-sans">
              Real-time anonymous visitor sessions &amp; upload timeline
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchDashboardData()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#ebdcd0] text-xs font-semibold text-[#5c473a] hover:bg-[#faf7f2] shadow-2xs cursor-pointer transition-all active:scale-95"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl bg-[#fff1f2] border border-[#fecdd3] text-xs font-semibold text-[#be185d] hover:bg-[#ffe4e6] shadow-2xs cursor-pointer transition-all"
            title="Log out of admin console"
          >
            Log Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        {/* KPI Summary Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-white border border-[#ebdcd0] shadow-xs">
              <div className="flex items-center justify-between text-[#8c7465] text-xs font-sans mb-1">
                <span>Total Sessions</span>
                <Users className="w-4 h-4 text-[#fb7185]" />
              </div>
              <p className="font-mono text-2xl font-bold text-[#3f2e24]">
                {stats.totalSessions}
              </p>
              <span className="text-[10px] text-[#16a34a] font-sans">
                {stats.activeSessionsCount} active recently
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#ebdcd0] shadow-xs">
              <div className="flex items-center justify-between text-[#8c7465] text-xs font-sans mb-1">
                <span>Recorded Events</span>
                <MousePointerClick className="w-4 h-4 text-[#3b82f6]" />
              </div>
              <p className="font-mono text-2xl font-bold text-[#3f2e24]">
                {stats.totalEvents}
              </p>
              <span className="text-[10px] text-[#8c7465] font-sans">
                Clicks &bull; Views &bull; Nav
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#ebdcd0] shadow-xs">
              <div className="flex items-center justify-between text-[#8c7465] text-xs font-sans mb-1">
                <span>Cloudinary Uploads</span>
                <Camera className="w-4 h-4 text-[#10b981]" />
              </div>
              <p className="font-mono text-2xl font-bold text-[#3f2e24]">
                {stats.totalUploads}
              </p>
              <span className="text-[10px] text-[#10b981] font-sans">
                Secure CDN hosted
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#ebdcd0] shadow-xs">
              <div className="flex items-center justify-between text-[#8c7465] text-xs font-sans mb-1">
                <span>Avg Session Time</span>
                <Clock className="w-4 h-4 text-[#f59e0b]" />
              </div>
              <p className="font-mono text-2xl font-bold text-[#3f2e24]">
                {formatDuration(stats.avgDurationSeconds)}
              </p>
              <span className="text-[10px] text-[#8c7465] font-sans">
                Active engagement
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#ebdcd0] shadow-xs col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-[#8c7465] text-xs font-sans mb-1">
                <span>Top Device</span>
                <Smartphone className="w-4 h-4 text-[#8b5cf6]" />
              </div>
              <p className="font-mono text-2xl font-bold text-[#3f2e24]">
                {getTopKey(stats.deviceCount)}
              </p>
              <span className="text-[10px] text-[#8c7465] font-sans truncate block">
                {getTopKey(stats.browserCount)} browser
              </span>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mb-4 border-b border-[#ebdcd0] pb-2">
          <button
            onClick={() => {
              setActiveTab("sessions");
              setSelectedSessionId(null);
            }}
            className={`px-4 py-2 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer ${
              activeTab === "sessions"
                ? "bg-[#3f2e24] text-white shadow-xs"
                : "bg-white text-[#786457] hover:bg-[#f5ece3]"
            }`}
          >
            Anonymous Sessions ({sessions.length})
          </button>
          <button
            onClick={() => setActiveTab("uploads")}
            className={`px-4 py-2 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer ${
              activeTab === "uploads"
                ? "bg-[#3f2e24] text-white shadow-xs"
                : "bg-white text-[#786457] hover:bg-[#f5ece3]"
            }`}
          >
            Cloudinary Uploads Gallery ({recentUploads.length})
          </button>
        </div>

        {/* ── TAB 1: SESSIONS & CHRONOLOGICAL TIMELINE ── */}
        {activeTab === "sessions" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Session List (Left 5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-2.5">
              <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-[#8c7465] mb-1">
                Visitor Sessions
              </h2>

              {sessions.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white border border-[#ebdcd0] text-center text-xs text-[#8c7465]">
                  No visitor sessions recorded yet.
                </div>
              ) : (
                sessions.map((sess) => {
                  const isSelected = selectedSessionId === sess.sessionId;
                  return (
                    <div
                      key={sess.sessionId}
                      onClick={() => handleSelectSession(sess)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-white border-[#fb7185] ring-2 ring-[#fda4af]/30 shadow-md"
                          : "bg-white/85 hover:bg-white border-[#ebdcd0] shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          {sess.device === "Mobile" ? (
                            <Smartphone className="w-3.5 h-3.5 text-[#fb7185]" />
                          ) : sess.device === "Tablet" ? (
                            <Tablet className="w-3.5 h-3.5 text-[#8b5cf6]" />
                          ) : (
                            <Laptop className="w-3.5 h-3.5 text-[#3b82f6]" />
                          )}
                          <span className="font-mono text-xs font-bold text-[#3f2e24]">
                            {sess.sessionId}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#8c7465] font-sans">
                          {formatTimeAgo(sess.lastSeenAt || sess.startedAt)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#786457] font-sans">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-[#f5ece3] text-[#5c473a] text-[10px] font-mono">
                            {sess.browser || "Browser"}
                          </span>
                          <span>Duration: {formatDuration(sess.duration || 0)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[#fb7185] text-xs font-bold">
                          <span>Timeline</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {sess.pagesVisited && sess.pagesVisited.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-[#f5ece3]">
                          {sess.pagesVisited.map((p, i) => (
                            <span
                              key={i}
                              className="text-[9px] font-sans px-1.5 py-0.2 rounded-md bg-[#faf7f2] text-[#8c7465] border border-[#ebdcd0]"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Session Chronological Timeline (Right 7 Cols) */}
            <div className="lg:col-span-7">
              <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-[#8c7465] mb-1">
                Chronological Activity Timeline
              </h2>

              {!selectedSession ? (
                <div className="p-12 rounded-3xl bg-white border border-[#ebdcd0] shadow-xs text-center flex flex-col items-center justify-center min-h-[350px]">
                  <Compass className="w-10 h-10 text-[#fda4af] mb-3" />
                  <p className="font-serif text-lg font-bold text-[#3f2e24]">
                    Select a Session
                  </p>
                  <p className="text-xs text-[#786457] font-sans max-w-xs mt-1">
                    Click any visitor session on the left to inspect its complete
                    chronological timeline of actions, clicks, page views, and
                    uploads.
                  </p>
                </div>
              ) : (
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#ebdcd0] shadow-sm">
                  {/* Selected Session Header */}
                  <div className="flex items-start justify-between pb-4 border-b border-[#ebdcd0] mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-mono text-sm font-bold text-[#3f2e24]">
                          {selectedSession.sessionId}
                        </h3>
                        <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-[#f0fdf4] text-[#15803d] font-bold">
                          {selectedSession.device} &bull; {selectedSession.browser}
                        </span>
                      </div>
                      <p className="text-xs text-[#786457] font-sans mt-0.5">
                        Started: {formatFullDate(selectedSession.startedAt)} &bull;{" "}
                        Duration: {formatDuration(selectedSession.duration || 0)}
                      </p>
                    </div>

                    <button
                      onClick={() => handleSelectSession(selectedSession)}
                      className="p-1.5 rounded-lg bg-[#f5ece3] hover:bg-[#ebdcd0] text-[#786457]"
                      title="Refresh session timeline"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTimeline ? "animate-spin" : ""}`} />
                    </button>
                  </div>

                  {/* Timeline Stream */}
                  {isLoadingTimeline ? (
                    <div className="py-12 flex flex-col items-center justify-center text-xs text-[#8c7465]">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#fb7185] mb-2" />
                      <span>Loading chronological timeline...</span>
                    </div>
                  ) : sessionEvents.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#8c7465]">
                      No events recorded yet for this session.
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#ebdcd0]">
                      {sessionEvents.map((ev, idx) => (
                        <div key={ev.eventId || idx} className="relative flex items-start gap-3">
                          {/* Timeline node icon */}
                          <div
                            className={`absolute -left-6 mt-0.5 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shadow-2xs ${getEventIconStyle(
                              ev.type
                            )}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          </div>

                          {/* Event Content Box */}
                          <div className="flex-1 p-3 rounded-2xl bg-[#faf7f2] border border-[#ebdcd0]/80">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${getEventBadgeStyle(
                                    ev.type
                                  )}`}
                                >
                                  {ev.type.replace(/_/g, " ")}
                                </span>
                                {ev.page && (
                                  <span className="text-[10px] font-mono text-[#786457]">
                                    /{ev.page}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-[#a89080]">
                                {formatTime(ev.timestamp)}
                              </span>
                            </div>

                            {ev.elementText && (
                              <p className="text-xs font-sans text-[#3f2e24] font-medium mt-0.5">
                                &ldquo;{ev.elementText}&rdquo;
                              </p>
                            )}

                            {ev.elementId && (
                              <span className="text-[10px] font-mono text-[#8c7465] block mt-0.5">
                                target: #{ev.elementId}
                              </span>
                            )}

                            {ev.metadata && Object.keys(ev.metadata).length > 0 && (
                              <pre className="mt-1.5 p-1.5 rounded-lg bg-white border border-[#ebdcd0] text-[9px] font-mono text-[#5c473a] overflow-x-auto">
                                {JSON.stringify(ev.metadata, null, 2)}
                              </pre>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Uploads in this session */}
                  {sessionUploads.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-[#ebdcd0]">
                      <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-[#15803d] mb-2 flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5" />
                        <span>Photos Uploaded in this Session ({sessionUploads.length})</span>
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {sessionUploads.map((up) => (
                          <div
                            key={up.uploadId}
                            className="relative aspect-square rounded-xl overflow-hidden border border-[#ebdcd0] bg-[#eee7de] group"
                          >
                            <Image
                              src={up.cloudinaryUrl}
                              alt={up.caption || "Uploaded photo"}
                              fill
                              className="object-cover"
                            />
                            <a
                              href={up.cloudinaryUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-sans font-bold gap-1"
                            >
                              <span>View CDN</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: CLOUDINARY UPLOADS GALLERY ── */}
        {activeTab === "uploads" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-[#8c7465]">
                Cloudinary Stored Images ({recentUploads.length})
              </h2>
              <span className="text-[11px] text-[#15803d] font-sans font-medium">
                Stored in Firestore &bull; Hosted on Cloudinary CDN
              </span>
            </div>

            {recentUploads.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-[#ebdcd0] text-center text-xs text-[#8c7465]">
                No images uploaded yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {recentUploads.map((up) => (
                  <div
                    key={up.uploadId}
                    className="p-3 rounded-2xl bg-white border border-[#ebdcd0] shadow-xs flex flex-col"
                  >
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#eee7de] border border-[#ebdcd0] mb-2 group">
                      <Image
                        src={up.cloudinaryUrl}
                        alt={up.caption || "Cloudinary Image"}
                        fill
                        className="object-cover"
                      />
                      <a
                        href={up.cloudinaryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1"
                      >
                        <span>Open Full CDN</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <p className="text-xs font-serif font-bold text-[#3f2e24] truncate">
                      {up.caption || "Unboxing Snap"}
                    </p>
                    <span className="text-[10px] text-[#8c7465] font-sans">
                      {formatTimeAgo(up.uploadedAt)} &bull; {up.page}
                    </span>
                    <span className="text-[9px] font-mono text-[#a89080] truncate mt-1">
                      ID: {up.cloudinaryPublicId}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDuration(sec: number): string {
  if (!sec || isNaN(sec)) return "0s";
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

function formatTimeAgo(isoString: string): string {
  if (!isoString) return "";
  const diffSec = Math.round((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

function formatTime(isoString: string): string {
  if (!isoString) return "";
  try {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "";
  }
}

function formatFullDate(isoString: string): string {
  if (!isoString) return "";
  try {
    return new Date(isoString).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function getTopKey(counts: Record<string, number> | undefined): string {
  if (!counts || Object.keys(counts).length === 0) return "N/A";
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function getEventBadgeStyle(type: string): string {
  switch (type) {
    case "session_start":
      return "bg-[#f3e8ff] text-[#7e22ce]";
    case "session_end":
      return "bg-[#f1f5f9] text-[#475569]";
    case "page_view":
      return "bg-[#dbeafe] text-[#1d4ed8]";
    case "navigation":
      return "bg-[#cffafe] text-[#0e7490]";
    case "click":
      return "bg-[#fef3c7] text-[#b45309]";
    case "image_view":
      return "bg-[#fce7f3] text-[#be185d]";
    case "image_upload":
      return "bg-[#dcfce7] text-[#15803d]";
    case "error":
      return "bg-[#fee2e2] text-[#b91c1c]";
    default:
      return "bg-[#f5ece3] text-[#786457]";
  }
}

function getEventIconStyle(type: string): string {
  switch (type) {
    case "session_start":
      return "border-[#a855f7] text-[#a855f7] bg-[#faf5ff]";
    case "page_view":
      return "border-[#3b82f6] text-[#3b82f6] bg-[#eff6ff]";
    case "navigation":
      return "border-[#06b6d4] text-[#06b6d4] bg-[#ecfeff]";
    case "click":
      return "border-[#f59e0b] text-[#f59e0b] bg-[#fffbeb]";
    case "image_upload":
      return "border-[#22c55e] text-[#22c55e] bg-[#f0fdf4]";
    case "image_view":
      return "border-[#ec4899] text-[#ec4899] bg-[#fdf2f8]";
    case "error":
      return "border-[#ef4444] text-[#ef4444] bg-[#fef2f2]";
    default:
      return "border-[#a89080] text-[#a89080] bg-[#faf7f2]";
  }
}
