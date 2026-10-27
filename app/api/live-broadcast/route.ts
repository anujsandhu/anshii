import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

interface BroadcastState {
  isBroadcasting: boolean;
  hasVideo: boolean;
  hasAudio: boolean;
  liveFrame?: string | null;
  updatedAt: number;
}

let inMemoryBroadcast: BroadcastState = {
  isBroadcasting: false,
  hasVideo: false,
  hasAudio: false,
  liveFrame: null,
  updatedAt: 0,
};

const BROADCAST_TIMEOUT_MS = 8000; // 8 seconds of no heartbeat = auto-stop

export async function GET() {
  const now = Date.now();
  const isStale = now - inMemoryBroadcast.updatedAt > BROADCAST_TIMEOUT_MS;

  const active = inMemoryBroadcast.isBroadcasting && !isStale;

  return NextResponse.json({
    success: true,
    isBroadcasting: active,
    hasVideo: active ? inMemoryBroadcast.hasVideo : false,
    hasAudio: active ? inMemoryBroadcast.hasAudio : false,
    liveFrame: active ? inMemoryBroadcast.liveFrame : null,
    updatedAt: inMemoryBroadcast.updatedAt,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { isBroadcasting, hasVideo, hasAudio, liveFrame, key } = body;

    // Check admin authentication
    const lowerKey = typeof key === "string" ? key.trim().toLowerCase() : "";
    const isAuthorized =
      lowerKey === "anuj88" ||
      lowerKey === "anuj19" ||
      lowerKey === process.env.ADMIN_KEY?.toLowerCase();

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = Date.now();

    inMemoryBroadcast = {
      isBroadcasting: Boolean(isBroadcasting),
      hasVideo: isBroadcasting ? Boolean(hasVideo) : false,
      hasAudio: isBroadcasting ? Boolean(hasAudio) : false,
      liveFrame: isBroadcasting && liveFrame ? String(liveFrame) : null,
      updatedAt: now,
    };

    return NextResponse.json({
      success: true,
      isBroadcasting: inMemoryBroadcast.isBroadcasting,
      updatedAt: now,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

