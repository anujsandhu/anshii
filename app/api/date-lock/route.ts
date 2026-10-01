import { NextResponse } from "next/server";
import {
  isServerDateLocked,
  calculateTimeRemaining,
  UNLOCK_TIMESTAMP_MS,
  UNLOCK_DATE_ISO,
  TIMEZONE_LABEL,
  DATE_DISPLAY,
  TIMEZONE_DISPLAY,
} from "@/lib/dateLock";

// Do not cache this route so client clock synchronization is always real-time
export const dynamic = "force-dynamic";

export async function GET() {
  const nowMs = Date.now();
  const locked = isServerDateLocked(nowMs);
  const remaining = calculateTimeRemaining(nowMs);

  return NextResponse.json(
    {
      isLocked: locked,
      serverTime: nowMs,
      unlockTimestamp: UNLOCK_TIMESTAMP_MS,
      unlockDateIso: UNLOCK_DATE_ISO,
      timezone: TIMEZONE_LABEL,
      dateDisplay: DATE_DISPLAY,
      timezoneDisplay: TIMEZONE_DISPLAY,
      remaining,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}
