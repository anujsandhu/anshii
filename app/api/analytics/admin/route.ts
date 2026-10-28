import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore, handleFirestoreError } from "@/lib/firebaseAdmin";
import { localResetAll } from "@/lib/localStore";
import fs from "fs";
import path from "path";

function isAuthorized(req: NextRequest): boolean {
  const headerKey = req.headers.get("x-admin-key")?.trim();
  const url = new URL(req.url);
  const queryKey = url.searchParams.get("key")?.trim();
  const authHeader = req.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "")
    ?.trim();

  const keyToTest = queryKey || headerKey || authHeader;
  if (!keyToTest) return false;

  const lower = keyToTest.toLowerCase();
  const envAdminKey = (process.env.ADMIN_KEY || "").trim().toLowerCase();

  return (
    lower === "@ritusandhu1983" ||
    (envAdminKey !== "" && lower === envAdminKey)
  );
}

import {
  localGetSession,
  localGetSessionEvents,
  localGetAllSessions,
  localGetAllUploads,
  localGetAllLogins,
  localGetLiveMonitor,
} from "@/lib/localStore";

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized access to admin analytics." },
      { status: 401 }
    );
  }

  const url = new URL(req.url);
  const requestedSessionId = url.searchParams.get("sessionId");
  const db = getAdminFirestore();

  // ── Single Session Drilldown with Chronological Timeline ──
  if (requestedSessionId) {
    let session: any = null;
    let events: any[] = [];
    let uploads: any[] = [];

    // 1. Try fetching from Firestore
    if (db) {
      try {
        const sessionDoc = await db
          .collection("sessions")
          .doc(requestedSessionId)
          .get();

        if (sessionDoc.exists) {
          session = { sessionId: sessionDoc.id, ...sessionDoc.data() };

          const eventsSnap = await db
            .collection("sessions")
            .doc(requestedSessionId)
            .collection("events")
            .orderBy("timestamp", "asc")
            .get();

          eventsSnap.forEach((doc) => events.push(doc.data()));

          const uploadsSnap = await db
            .collection("uploads")
            .where("sessionId", "==", requestedSessionId)
            .get();

          uploadsSnap.forEach((doc) => uploads.push(doc.data()));
        }
      } catch (dbErr: any) {
        handleFirestoreError(dbErr, "admin drilldown");
      }
    }

    // 2. Fall back to / merge with Local Store
    const localSess = localGetSession(requestedSessionId);
    if (!session && localSess) {
      session = localSess;
    }
    const localEvs = localGetSessionEvents(requestedSessionId);
    if (events.length === 0 && localEvs.length > 0) {
      events = localEvs;
    }
    const localUps = localGetAllUploads().filter(
      (u) => u.sessionId === requestedSessionId
    );
    if (uploads.length === 0 && localUps.length > 0) {
      uploads = localUps;
    }

    // 3. Resilient fallback: If no explicit session document exists, check logins or synthesize
    if (!session) {
      const allLogins = localGetAllLogins();
      const matchedLogin = allLogins.find(
        (l) => l.sessionId === requestedSessionId
      );

      session = {
        sessionId: requestedSessionId,
        startedAt: matchedLogin?.timestamp || new Date().toISOString(),
        lastSeenAt: matchedLogin?.timestamp || new Date().toISOString(),
        pagesVisited: ["welcome"],
        device: matchedLogin?.device || "Desktop",
        browser: matchedLogin?.browser || "Browser",
        role: matchedLogin?.role || "anshii",
        userName: matchedLogin?.userName || "Anshii",
        isUnlocked: true,
        eventCount: events.length,
        uploadCount: uploads.length,
      };
    }

    return NextResponse.json({
      success: true,
      session,
      events,
      uploads,
    });
  }

  // ── Overview List of All Sessions & Stats ──
  try {
    const sessions: any[] = [];
    const recentUploads: any[] = [];
    const logins: any[] = [];
    let liveMonitor: any = null;

    // 1. Try fetching from Firestore
    if (db) {
      try {
        const sessionsSnap = await db
          .collection("sessions")
          .orderBy("lastSeenAt", "desc")
          .limit(60)
          .get();

        sessionsSnap.forEach((doc) => {
          const data = doc.data();
          sessions.push({ sessionId: doc.id, ...data });
        });

        const uploadsSnap = await db
          .collection("uploads")
          .orderBy("uploadedAt", "desc")
          .limit(60)
          .get();

        uploadsSnap.forEach((doc) => recentUploads.push(doc.data()));

        const liveDoc = await db.collection("system").doc("live_monitor").get();
        if (liveDoc.exists) {
          liveMonitor = liveDoc.data();
        }

        const loginsSnap = await db
          .collection("logins")
          .orderBy("timestamp", "desc")
          .limit(40)
          .get();
        loginsSnap.forEach((doc) => logins.push(doc.data()));
      } catch (dbErr: any) {
        handleFirestoreError(dbErr, "admin overview query");
      }
    }

    // 2. Merge localStore data seamlessly (guaranteeing no data is lost during quota limits)
    const localSessList = localGetAllSessions();
    const existingSessionIds = new Set(sessions.map((s) => s.sessionId));
    for (const ls of localSessList) {
      if (!existingSessionIds.has(ls.sessionId)) {
        sessions.push(ls);
      }
    }

    const localUps = localGetAllUploads();
    const existingUploadIds = new Set(recentUploads.map((u) => u.uploadId));
    for (const lu of localUps) {
      if (!existingUploadIds.has(lu.uploadId)) {
        recentUploads.push(lu);
      }
    }

    const localLogs = localGetAllLogins();
    const existingLoginIds = new Set(logins.map((l) => l.loginId));
    for (const ll of localLogs) {
      if (!existingLoginIds.has(ll.loginId)) {
        logins.push(ll);
      }
    }

    if (!liveMonitor) {
      liveMonitor = localGetLiveMonitor();
    }

    // 3. Synthesize session stubs for any login records lacking an explicit session doc
    const knownSessionIds = new Set(sessions.map((s) => s.sessionId));
    for (const log of logins) {
      if (log.sessionId && !knownSessionIds.has(log.sessionId)) {
        sessions.push({
          sessionId: log.sessionId,
          startedAt: log.timestamp,
          lastSeenAt: log.timestamp,
          pagesVisited: ["welcome"],
          device: log.device || "Desktop",
          browser: log.browser || "Browser",
          role: log.role || "anshii",
          userName: log.userName || "Anshii",
          isUnlocked: true,
          eventCount: 1,
          uploadCount: 0,
        });
        knownSessionIds.add(log.sessionId);
      }
    }

    // Sort combined lists
    sessions.sort(
      (a, b) =>
        new Date(b.lastSeenAt || b.startedAt).getTime() -
        new Date(a.lastSeenAt || a.startedAt).getTime()
    );

    recentUploads.sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    logins.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Compute aggregated metrics
    let totalEvents = 0;
    let totalDuration = 0;
    const deviceCount: Record<string, number> = {};
    const browserCount: Record<string, number> = {};
    const now = Date.now();
    let activeSessionsCount = 0;

    sessions.forEach((s) => {
      totalEvents += Number(s.eventCount) || 0;
      totalDuration += Number(s.duration) || 0;

      const lastSeenMs = new Date(s.lastSeenAt || s.startedAt).getTime();
      if (now - lastSeenMs < 10 * 60 * 1000) {
        activeSessionsCount += 1;
      }

      const dev = s.device || "Other";
      deviceCount[dev] = (deviceCount[dev] || 0) + 1;

      const brow = s.browser || "Other";
      browserCount[brow] = (browserCount[brow] || 0) + 1;
    });

    const totalSessions = sessions.length;
    const totalLogins = logins.length || totalSessions;
    const avgDuration =
      totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalSessions,
        totalLogins,
        activeSessionsCount,
        totalEvents,
        totalUploads: recentUploads.length,
        avgDurationSeconds: avgDuration,
        deviceCount,
        browserCount,
      },
      liveMonitor,
      logins,
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

// ── DELETE: Reset interactive test tasks (Guarantees ALL REACTION VIDEOS ARE SAVED & NEVER DELETED) ──
export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Provide valid admin credentials." },
      { status: 401 }
    );
  }

  try {
    // 1. Reset interactive task state (keeps all uploads & logins safe)
    localResetAll();

    // 2. Clear ONLY temporary task cache in Firestore (NEVER delete uploads, reaction videos, or logins)
    const db = getAdminFirestore();
    let firestoreCleaned = false;
    if (db) {
      try {
        const taskCollections = ["gift_snaps", "madam_ji_notes"];
        for (const col of taskCollections) {
          const snap = await db.collection(col).get();
          for (const doc of snap.docs) {
            await doc.ref.delete();
          }
        }
        firestoreCleaned = true;
      } catch (dbErr: any) {
        handleFirestoreError(dbErr, "admin task reset");
      }
    }

    return NextResponse.json({
      success: true,
      message: "Interactive tasks reset. All reaction videos, logins, and recordings are permanently preserved.",
      firestoreCleaned,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to reset tasks" },
      { status: 500 }
    );
  }
}
