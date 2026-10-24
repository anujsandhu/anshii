import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { isServerDateLocked } from "@/lib/dateLock";

const SITE_PASSWORD = process.env.SITE_PASSWORD || "ANSHII19";
const SESSION_SECRET =
  process.env.AUTH_SESSION_SECRET || "anshii_birthday_secret_salt_2026_key";
const DURATION_HOURS = Number(process.env.SESSION_DURATION_HOURS) || 24;
const COOKIE_NAME = "anshii_auth_session";

function createSessionToken(expiresAt: number): string {
  const hmac = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(String(expiresAt))
    .digest("hex");
  return `${expiresAt}.${hmac}`;
}

function verifySessionToken(token: string): {
  valid: boolean;
  expiresAt: number | null;
} {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return { valid: false, expiresAt: null };

    const [expiresAtStr, signature] = parts;
    const expiresAt = Number(expiresAtStr);

    if (isNaN(expiresAt) || Date.now() >= expiresAt) {
      return { valid: false, expiresAt: null };
    }

    const expectedHmac = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(expiresAtStr)
      .digest("hex");

    const sigBuf = Buffer.from(signature, "hex");
    const expBuf = Buffer.from(expectedHmac, "hex");

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false, expiresAt: null };
    }

    return { valid: true, expiresAt };
  } catch {
    return { valid: false, expiresAt: null };
  }
}

// ── GET: Check if current session is active and not expired ────────────────────
export async function GET(req: NextRequest) {
  if (isServerDateLocked()) {
    return NextResponse.json(
      {
        authenticated: false,
        dateLocked: true,
        reason: "The birthday website is locked until 28 October 2026.",
      },
      { status: 200 }
    );
  }

  const cookieToken = req.cookies.get(COOKIE_NAME)?.value;
  const headerToken = req.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");

  const token = cookieToken || headerToken;

  if (!token) {
    return NextResponse.json(
      { authenticated: false, reason: "No session token provided" },
      { status: 200 }
    );
  }

  const { valid, expiresAt } = verifySessionToken(token);

  if (!valid || !expiresAt) {
    const res = NextResponse.json(
      { authenticated: false, reason: "Session expired or invalid" },
      { status: 200 }
    );
    res.cookies.delete(COOKIE_NAME);
    return res;
  }

  return NextResponse.json({
    authenticated: true,
    expiresAt,
    expiresInMinutes: Math.max(0, Math.round((expiresAt - Date.now()) / 60000)),
  });
}

// ── POST: Authenticate password on server & establish session ──────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Please enter the password." },
        { status: 400 }
      );
    }

    const entered = password.trim().toUpperCase();
    const isAnshii =
      entered === "ANSHII19" || entered === SITE_PASSWORD.trim().toUpperCase();
    const isAnuj = entered === "ANUJ88" || entered === "ANUJ19";

    if (!isAnshii && !isAnuj) {
      return NextResponse.json(
        {
          success: false,
          error: "Incorrect password. Please check and try again.",
        },
        { status: 401 }
      );
    }

    // Tester Anuj bypasses date lock so testing always works smoothly.
    // Anshii's login is guarded until 28 October.
    if (isAnshii && isServerDateLocked()) {
      return NextResponse.json(
        {
          success: false,
          dateLocked: true,
          error:
            "The birthday website is locked until 28 October 2026. Password verification is unavailable.",
        },
        { status: 403 }
      );
    }

    const userRole = isAnuj ? "anuj" : "anshii";
    const userName = isAnuj ? "Anuj (Tester)" : "Anshii";

    // Generate session expiration timestamp and signed token
    const expiresAt = Date.now() + DURATION_HOURS * 60 * 60 * 1000;
    const token = createSessionToken(expiresAt);

    const res = NextResponse.json({
      success: true,
      authenticated: true,
      message: `Access granted (${userName})`,
      role: userRole,
      userName,
      isTester: isAnuj,
      expiresAt,
      durationHours: DURATION_HOURS,
      token,
    });

    // Record login in local store and Firestore
    const clientSessionId = (body.sessionId as string) || "session";
    const loginAt = new Date().toISOString();
    const loginId = `login_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // 1. Always record in local store for guaranteed persistence
    try {
      const { localSaveLogin, localSaveSession, localSaveEvent } = await import("@/lib/localStore");
      localSaveLogin({
        loginId,
        sessionId: clientSessionId,
        timestamp: loginAt,
        device: body.device || "Desktop",
        browser: body.browser || "Browser",
        passwordUsed: entered,
        role: userRole,
        userName,
      });

      localSaveSession({
        sessionId: clientSessionId,
        role: userRole,
        userName,
        isTester: isAnuj,
        isUnlocked: true,
        lastSeenAt: loginAt,
      });

      localSaveEvent({
        eventId: `ev_${Date.now()}_login`,
        sessionId: clientSessionId,
        type: "login",
        timestamp: loginAt,
        page: "password_gate",
        elementText: isAnuj
          ? "Unlocked website with tester password ANUJ19"
          : "Unlocked website with birthday password ANSHII19",
        metadata: {
          authTime: loginAt,
          device: body.device || "Desktop",
          browser: body.browser || "Browser",
          role: userRole,
          userName,
          passwordUsed: entered,
        },
      });
    } catch (localErr) {
      console.warn("Could not save auth event to local store:", localErr);
    }

    // 2. Also record in Firestore if available
    try {
      const { getAdminFirestore } = await import("@/lib/firebaseAdmin");
      const { FieldValue } = await import("firebase-admin/firestore");
      const db = getAdminFirestore();
      if (db) {
        // Save login audit record with explicit identity
        await db.collection("logins").doc(loginId).set({
          loginId,
          sessionId: clientSessionId,
          timestamp: loginAt,
          device: body.device || "Desktop",
          browser: body.browser || "Browser",
          passwordUsed: entered,
          role: userRole,
          userName,
          createdAt: FieldValue.serverTimestamp(),
        });

        // Also add event to the session's events timeline
        if (clientSessionId && clientSessionId !== "anonymous") {
          await db
            .collection("sessions")
            .doc(clientSessionId)
            .collection("events")
            .doc(`ev_${Date.now()}_login`)
            .set({
              eventId: `ev_${Date.now()}_login`,
              type: "login",
              timestamp: loginAt,
              page: "password_gate",
              elementText: isAnuj
                ? "Unlocked website with tester password ANUJ19"
                : "Unlocked website with birthday password ANSHII19",
              metadata: {
                authTime: loginAt,
                device: body.device || "Desktop",
                browser: body.browser || "Browser",
                role: userRole,
                userName,
                passwordUsed: entered,
              },
              createdAt: FieldValue.serverTimestamp(),
            });

          // Update session document with identity and unlock state
          await db
            .collection("sessions")
            .doc(clientSessionId)
            .set(
              {
                isUnlocked: true,
                role: userRole,
                userName,
                isTester: isAnuj,
                lastSeenAt: loginAt,
                loginCount: FieldValue.increment(1),
              },
              { merge: true }
            );
        }
      }
    } catch (dbErr) {
      console.warn("Could not log auth event to Firestore:", dbErr);
    }

    // Set secure HTTP-only cookie for session persistence across page refreshes
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: DURATION_HOURS * 60 * 60,
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Internal server authentication error" },
      { status: 500 }
    );
  }
}

// ── DELETE: Log out / Clear session ───────────────────────────────────────────
export async function DELETE() {
  const res = NextResponse.json({
    success: true,
    message: "Session ended successfully",
  });
  res.cookies.delete(COOKIE_NAME);
  return res;
}
