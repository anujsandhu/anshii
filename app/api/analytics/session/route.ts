import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// Simple IP-based rate limiting
const sessionRateMap = new Map<string, number>();
const RATE_LIMIT_MS = 1000; // 1 request per second per IP

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

// ── POST: Start or Initialize a Session ───────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const last = sessionRateMap.get(ip) || 0;
    if (Date.now() - last < RATE_LIMIT_MS) {
      return NextResponse.json({ success: true, throttled: true });
    }
    sessionRateMap.set(ip, Date.now());

    const body = await req.json().catch(() => ({}));
    const {
      sessionId,
      startedAt,
      device = "Desktop",
      browser = "Unknown",
      initialPage = "welcome",
      consentGiven = true,
    } = body;

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing valid sessionId" },
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

    const nowIso = new Date().toISOString();
    const sessionRef = db.collection("sessions").doc(sessionId);
    const doc = await sessionRef.get();

    if (!doc.exists) {
      await sessionRef.set({
        sessionId,
        startedAt: startedAt || nowIso,
        lastSeenAt: nowIso,
        endedAt: null,
        duration: 0,
        device: sanitizeString(device, 30),
        browser: sanitizeString(browser, 40),
        pagesVisited: [initialPage],
        consentGiven: Boolean(consentGiven),
        createdAt: FieldValue.serverTimestamp(),
      });
    } else {
      await sessionRef.set(
        {
          lastSeenAt: nowIso,
          pagesVisited: FieldValue.arrayUnion(initialPage),
        },
        { merge: true }
      );
    }

    return NextResponse.json({ success: true, sessionId });
  } catch (error: any) {
    console.error("Session API error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ── PUT: Session Heartbeat / Update Duration / EndedAt ─────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { sessionId, duration = 0, endedAt, page } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Missing sessionId" },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    if (!db) {
      return NextResponse.json({ success: false });
    }

    const nowIso = new Date().toISOString();
    const updateData: any = {
      lastSeenAt: nowIso,
      duration: Math.max(0, Math.round(Number(duration) || 0)),
    };

    if (endedAt) {
      updateData.endedAt = nowIso;
    }

    if (page) {
      updateData.pagesVisited = FieldValue.arrayUnion(sanitizeString(page, 50));
    }

    await db.collection("sessions").doc(sessionId).set(updateData, { merge: true });

    return NextResponse.json({ success: true, sessionId });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function sanitizeString(val: string, maxLen = 50): string {
  if (typeof val !== "string") return "";
  return val.replace(/[<>]/g, "").substring(0, maxLen);
}
