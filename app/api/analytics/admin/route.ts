import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebaseAdmin";

const ADMIN_SECRET =
  process.env.ADMIN_KEY || process.env.SITE_PASSWORD || "ANSHII19";

function isAuthorized(req: NextRequest): boolean {
  const headerKey = req.headers.get("x-admin-key");
  const url = new URL(req.url);
  const queryKey = url.searchParams.get("key");
  const authHeader = req.headers.get("authorization");

  if (
    headerKey?.trim().toUpperCase() === ADMIN_SECRET.trim().toUpperCase() ||
    queryKey?.trim().toUpperCase() === ADMIN_SECRET.trim().toUpperCase()
  ) {
    return true;
  }

  // Also check auth session cookie
  const cookieSession = req.cookies.get("anshii_auth_session")?.value;
  if (cookieSession) {
    return true;
  }

  return false;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized access to admin analytics." },
      { status: 401 }
    );
  }

  const db = getAdminFirestore();
  if (!db) {
    return NextResponse.json(
      { success: false, error: "Firestore not initialized." },
      { status: 500 }
    );
  }

  const url = new URL(req.url);
  const requestedSessionId = url.searchParams.get("sessionId");

  try {
    // ── Single Session Drilldown with Chronological Timeline ──
    if (requestedSessionId) {
      const sessionDoc = await db
        .collection("sessions")
        .doc(requestedSessionId)
        .get();

      if (!sessionDoc.exists) {
        return NextResponse.json(
          { success: false, error: "Session not found." },
          { status: 404 }
        );
      }

      const session = sessionDoc.data();

      // Fetch chronological events
      const eventsSnap = await db
        .collection("sessions")
        .doc(requestedSessionId)
        .collection("events")
        .orderBy("timestamp", "asc")
        .get();

      const events: any[] = [];
      eventsSnap.forEach((doc) => events.push(doc.data()));

      // Fetch uploads by this session
      const uploadsSnap = await db
        .collection("uploads")
        .where("sessionId", "==", requestedSessionId)
        .get();

      const uploads: any[] = [];
      uploadsSnap.forEach((doc) => uploads.push(doc.data()));

      return NextResponse.json({
        success: true,
        session,
        events,
        uploads,
      });
    }

    // ── Overview List of All Sessions & Stats ──
    const sessionsSnap = await db
      .collection("sessions")
      .orderBy("lastSeenAt", "desc")
      .limit(60)
      .get();

    const sessions: any[] = [];
    let totalEvents = 0;
    let totalDuration = 0;
    const deviceCount: Record<string, number> = {};
    const browserCount: Record<string, number> = {};
    const now = Date.now();
    let activeSessionsCount = 0;

    sessionsSnap.forEach((doc) => {
      const s = doc.data();
      sessions.push(s);

      totalEvents += Number(s.eventCount) || 0;
      totalDuration += Number(s.duration) || 0;

      // Active in last 10 minutes
      const lastSeenMs = new Date(s.lastSeenAt || s.startedAt).getTime();
      if (now - lastSeenMs < 10 * 60 * 1000) {
        activeSessionsCount += 1;
      }

      const dev = s.device || "Other";
      deviceCount[dev] = (deviceCount[dev] || 0) + 1;

      const brow = s.browser || "Other";
      browserCount[brow] = (browserCount[brow] || 0) + 1;
    });

    // Fetch recent uploads (up to 30)
    const uploadsSnap = await db
      .collection("uploads")
      .orderBy("uploadedAt", "desc")
      .limit(30)
      .get();

    const recentUploads: any[] = [];
    uploadsSnap.forEach((doc) => recentUploads.push(doc.data()));

    const totalSessions = sessions.length;
    const avgDuration =
      totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalSessions,
        activeSessionsCount,
        totalEvents,
        totalUploads: recentUploads.length,
        avgDurationSeconds: avgDuration,
        deviceCount,
        browserCount,
      },
      sessions,
      recentUploads,
    });
  } catch (error: any) {
    console.error("Error in admin analytics GET:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
