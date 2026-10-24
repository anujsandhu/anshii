import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { getAdminFirestore } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const maxDuration = 60;

interface LiveFeedState {
  active: boolean;
  frame: string | null;
  screenFrame: string | null;
  screenActive: boolean;
  sessionId: string;
  slide: string;
  timestamp: number;
  audioLevel?: number;
}

// In-memory global state for instantaneous sub-millisecond local response
let currentFeed: LiveFeedState = {
  active: false,
  frame: null,
  screenFrame: null,
  screenActive: false,
  sessionId: "",
  slide: "chapter_1",
  timestamp: 0,
  audioLevel: 0,
};

let lastFirestoreSyncTimestamp = 0;

function getSharedFeedFilePath(): string {
  return path.join(os.tmpdir(), "anshii_live_feed.json");
}

function persistSharedFeed(feed: LiveFeedState) {
  try {
    fs.writeFileSync(getSharedFeedFilePath(), JSON.stringify(feed), "utf8");
  } catch {}
}

function readSharedFeed(): LiveFeedState | null {
  try {
    const p = getSharedFeedFilePath();
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, "utf8");
      return JSON.parse(raw);
    }
  } catch {}
  return null;
}

// Set of active SSE subscriber controllers for zero-latency live push
const sseSubscribers = new Set<ReadableStreamDefaultController>();

function broadcast(data: LiveFeedState) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  const encoded = new TextEncoder().encode(payload);

  for (const controller of Array.from(sseSubscribers)) {
    try {
      controller.enqueue(encoded);
    } catch {
      sseSubscribers.delete(controller);
    }
  }
}

// ── GET: Stream live camera & screen frames via SSE or instantaneous HTTP ─────
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const streamParam = url.searchParams.get("stream");
  const acceptHeader = req.headers.get("accept") || "";

  // 1. Server-Sent Events (SSE) mode for zero-latency push (<50ms delay)
  if (streamParam === "true" || acceptHeader.includes("text/event-stream")) {
    let activeController: ReadableStreamDefaultController | null = null;
    let heartbeatTimer: NodeJS.Timeout | null = null;

    const stream = new ReadableStream({
      start(controller) {
        activeController = controller;
        sseSubscribers.add(controller);

        // Immediately send latest active state
        const initial = currentFeed.timestamp > 0 ? currentFeed : readSharedFeed() || currentFeed;
        const initialPayload = `data: ${JSON.stringify(initial)}\n\n`;
        controller.enqueue(new TextEncoder().encode(initialPayload));

        // Heartbeat ping every 12s keeps cross-device NAT & mobile sockets permanently active
        heartbeatTimer = setInterval(() => {
          try {
            controller.enqueue(new TextEncoder().encode(": ping\n\n"));
          } catch {
            if (heartbeatTimer) clearInterval(heartbeatTimer);
          }
        }, 12000);
      },
      cancel() {
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        if (activeController) {
          sseSubscribers.delete(activeController);
        }
      },
    });

    req.signal.addEventListener("abort", () => {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      if (activeController) {
        sseSubscribers.delete(activeController);
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform, no-store",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  }

  // 2. High-speed HTTP JSON mode with multi-instance serverless fallback
  let feedToReturn = currentFeed;
  const now = Date.now();
  const memAgeMs = currentFeed.timestamp > 0 ? now - currentFeed.timestamp : -1;

  // If in-memory is empty or stale (> 3s), check shared filesystem (cross-instance serverless)
  if (memAgeMs < 0 || memAgeMs > 3000) {
    const shared = readSharedFeed();
    if (shared && shared.timestamp > currentFeed.timestamp) {
      currentFeed = shared;
      feedToReturn = shared;
    }
  }

  const ageMs = feedToReturn.timestamp > 0 ? now - feedToReturn.timestamp : -1;
  const isStale = ageMs > 8000; // If no frame sent in 8s, mark inactive

  const res = NextResponse.json({
    success: true,
    active: feedToReturn.active && !isStale,
    frame: isStale ? null : feedToReturn.frame,
    screenFrame: isStale ? null : feedToReturn.screenFrame,
    screenActive: Boolean(feedToReturn.screenActive && !isStale),
    sessionId: feedToReturn.sessionId,
    slide: feedToReturn.slide,
    timestamp: feedToReturn.timestamp,
    audioLevel: isStale ? 0 : feedToReturn.audioLevel || 0,
    ageMs,
  });

  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.headers.set("Pragma", "no-cache");
  return res;
}

// ── POST: Ingest live camera & screen frames with multi-instance resilience ───
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      frame,
      screenFrame,
      screenActive = false,
      sessionId = "anonymous",
      slide = "chapter_1",
      active = true,
      audioLevel = 0,
    } = body;

    const now = Date.now();

    currentFeed = {
      active: Boolean(active),
      frame: typeof frame === "string" ? frame : null,
      screenFrame: typeof screenFrame === "string" ? screenFrame : null,
      screenActive: Boolean(screenActive),
      sessionId: String(sessionId),
      slide: String(slide),
      timestamp: now,
      audioLevel: typeof audioLevel === "number" ? Math.min(100, Math.max(0, audioLevel)) : 0,
    };

    // 1. Instant local broadcast to all connected admin SSE streams
    broadcast(currentFeed);

    // 2. Persist to shared temp filesystem for multi-instance serverless Lambdas
    persistSharedFeed(currentFeed);

    // 3. Throttled Firestore sync (every 1.5s or on active toggle) for cross-datacenter production
    if (now - lastFirestoreSyncTimestamp > 1500 || !active) {
      lastFirestoreSyncTimestamp = now;
      const db = getAdminFirestore();
      if (db) {
        db.collection("system")
          .doc("live_monitor")
          .set(
            {
              sessionId,
              activeNow: Boolean(active),
              lastUpdated: new Date(now).toISOString(),
              slide,
              ...(frame ? { latestLiveFrame: frame } : {}),
              screenActive: Boolean(screenActive),
            },
            { merge: true }
          )
          .catch(() => {});
      }
    }

    return NextResponse.json({ success: true, timestamp: now });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Stream ingest error" },
      { status: 500 }
    );
  }
}
