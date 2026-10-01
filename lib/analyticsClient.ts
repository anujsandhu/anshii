"use client";

const SESSION_ID_KEY = "anshii_analytics_session_id";
const OPT_OUT_KEY = "anshii_analytics_opt_out";
const SESSION_START_KEY = "anshii_analytics_started_at";

export function getAnonymousSessionId(): string {
  if (typeof window === "undefined") return "ssr_session";

  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    sessionStorage.setItem(SESSION_ID_KEY, id);
    sessionStorage.setItem(SESSION_START_KEY, String(Date.now()));
  }
  return id;
}

export function isAnalyticsOptedOut(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(OPT_OUT_KEY) === "true";
}

export function setAnalyticsOptOut(optOut: boolean): void {
  if (typeof window === "undefined") return;
  if (optOut) {
    localStorage.setItem(OPT_OUT_KEY, "true");
  } else {
    localStorage.removeItem(OPT_OUT_KEY);
  }
}

export function detectDevice(): string {
  if (typeof window === "undefined") return "Desktop";
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "Tablet";
  if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i.test(
      ua
    )
  ) {
    return "Mobile";
  }
  return "Desktop";
}

export function detectBrowser(): string {
  if (typeof window === "undefined") return "Unknown";
  const ua = navigator.userAgent;
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome/") && !ua.includes("Edg/")) return "Chrome";
  if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari";
  if (ua.includes("OPR/") || ua.includes("Opera/")) return "Opera";
  return "Other";
}

export interface TrackEventParams {
  type:
    | "session_start"
    | "session_end"
    | "page_view"
    | "navigation"
    | "click"
    | "image_view"
    | "image_upload"
    | "error"
    | "song_play"
    | "task_complete";
  page?: string;
  elementId?: string;
  elementText?: string;
  metadata?: Record<string, any>;
}

export async function trackEvent({
  type,
  page = "welcome",
  elementId = "",
  elementText = "",
  metadata = {},
}: TrackEventParams) {
  if (isAnalyticsOptedOut() || typeof window === "undefined") return;

  const sessionId = getAnonymousSessionId();
  const payload = {
    sessionId,
    type,
    timestamp: new Date().toISOString(),
    page,
    elementId,
    elementText,
    metadata,
  };

  try {
    // Use navigator.sendBeacon if available for session_end, else fetch
    if (type === "session_end" && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      navigator.sendBeacon("/api/analytics/event", blob);
      return;
    }

    await fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Non-blocking catch
  }
}

let initialized = false;
let heartbeatInterval: any = null;

export function initAnalytics(initialPage = "welcome") {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  if (isAnalyticsOptedOut()) return;

  const sessionId = getAnonymousSessionId();
  const startedAt = new Date().toISOString();

  // 1. Initialize session document in Firestore
  fetch("/api/analytics/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      startedAt,
      device: detectDevice(),
      browser: detectBrowser(),
      initialPage,
      consentGiven: true,
    }),
  }).catch(() => {});

  // 2. Log session_start event
  trackEvent({
    type: "session_start",
    page: initialPage,
    elementText: "Session Started",
  });

  // 3. Heartbeat update every 30 seconds
  const startMs = Number(sessionStorage.getItem(SESSION_START_KEY)) || Date.now();

  heartbeatInterval = setInterval(() => {
    if (isAnalyticsOptedOut()) return;
    const durationSec = Math.round((Date.now() - startMs) / 1000);
    fetch("/api/analytics/session", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: getAnonymousSessionId(),
        duration: durationSec,
      }),
    }).catch(() => {});
  }, 30000);

  // 4. Session end listener
  const handleUnload = () => {
    if (isAnalyticsOptedOut()) return;
    const durationSec = Math.round((Date.now() - startMs) / 1000);
    const endPayload = JSON.stringify({
      sessionId: getAnonymousSessionId(),
      duration: durationSec,
      endedAt: true,
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/analytics/session",
        new Blob([endPayload], { type: "application/json" })
      );
    }
  };

  window.addEventListener("pagehide", handleUnload);
  window.addEventListener("beforeunload", handleUnload);
}
