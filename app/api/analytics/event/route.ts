import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// Valid event types per specification
const VALID_EVENT_TYPES = [
  "session_start",
  "session_end",
  "page_view",
  "navigation",
  "click",
  "image_view",
  "image_upload",
  "error",
  "song_play",
  "task_complete",
];

// Sliding window rate limiter: 80 events per minute per IP
const ipEventCounts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipEventCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    ipEventCounts.set(ip, { count: 1, resetAt: now + 60000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 80;
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      sessionId,
      type,
      timestamp,
      page = "home",
      elementId = "",
      elementText = "",
      metadata = {},
    } = body;

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing sessionId" },
        { status: 400 }
      );
    }

    const eventType = String(type || "page_view").toLowerCase();
    if (!VALID_EVENT_TYPES.includes(eventType)) {
      return NextResponse.json(
        { success: false, error: `Invalid event type: ${eventType}` },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    if (!db) {
      return NextResponse.json({
        success: false,
        error: "Firestore not initialized",
      });
    }

    const nowIso = timestamp || new Date().toISOString();
    const eventId = `ev_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 6)}`;

    // Sanitize elementText to prevent capturing private text or passwords
    const sanitizedText = sanitizeInput(elementText, 120);
    const sanitizedPage = sanitizeInput(page, 50);

    // Save event in sessions/{sessionId}/events/{eventId}
    const eventRef = db
      .collection("sessions")
      .doc(sessionId)
      .collection("events")
      .doc(eventId);

    await eventRef.set({
      eventId,
      type: eventType,
      timestamp: nowIso,
      page: sanitizedPage,
      elementId: sanitizeInput(elementId, 60),
      elementText: sanitizedText,
      metadata: sanitizeMetadata(metadata),
      createdAt: FieldValue.serverTimestamp(),
    });

    // Update parent session document with lastSeenAt & pagesVisited
    await db
      .collection("sessions")
      .doc(sessionId)
      .set(
        {
          lastSeenAt: nowIso,
          pagesVisited: FieldValue.arrayUnion(sanitizedPage),
          eventCount: FieldValue.increment(1),
        },
        { merge: true }
      );

    return NextResponse.json({
      success: true,
      eventId,
      type: eventType,
    });
  } catch (error: any) {
    console.error("Error logging event:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function sanitizeInput(str: any, maxLen = 80): string {
  if (typeof str !== "string") return "";
  // Strip control chars, html tags, truncate
  return str.replace(/[<>]/g, "").trim().substring(0, maxLen);
}

function sanitizeMetadata(meta: any): Record<string, any> {
  if (!meta || typeof meta !== "object") return {};
  const cleaned: Record<string, any> = {};
  for (const [k, v] of Object.entries(meta)) {
    // Exclude potential sensitive fields
    const keyLower = k.toLowerCase();
    if (
      keyLower.includes("password") ||
      keyLower.includes("secret") ||
      keyLower.includes("key") ||
      keyLower.includes("token")
    ) {
      continue;
    }
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      cleaned[k] = typeof v === "string" ? v.substring(0, 150) : v;
    }
  }
  return cleaned;
}
