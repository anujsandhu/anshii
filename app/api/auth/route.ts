import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

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
    const expected = SITE_PASSWORD.trim().toUpperCase();

    if (entered !== expected) {
      return NextResponse.json(
        {
          success: false,
          error: "Incorrect password. Please check and try again.",
        },
        { status: 401 }
      );
    }

    // Generate session expiration timestamp and signed token
    const expiresAt = Date.now() + DURATION_HOURS * 60 * 60 * 1000;
    const token = createSessionToken(expiresAt);

    const res = NextResponse.json({
      success: true,
      message: "Access granted",
      expiresAt,
      durationHours: DURATION_HOURS,
      token,
    });

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
