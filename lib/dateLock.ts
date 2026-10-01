/**
 * Core Date Lock Configuration & Time Authority
 * Target Unlock Date: 28 October 2026, 00:00:00 Asia/Kolkata (IST)
 * Timezone: Asia/Kolkata (UTC +05:30)
 * Equivalent UTC: 2026-10-27T18:30:00.000Z
 */

export const UNLOCK_DATE_ISO = "2026-10-28T00:00:00+05:30";
// Exact milliseconds since Unix epoch for 28 Oct 2026 00:00:00 IST:
export const UNLOCK_TIMESTAMP_MS = 1793125800000;

export const TIMEZONE_LABEL = "Asia/Kolkata";
export const TIMEZONE_DISPLAY = "00:00 IST";
export const DATE_DISPLAY = "October 28, 2026";

/**
 * Server-authoritative check: returns true if currently BEFORE unlock time
 */
export function isServerDateLocked(nowMs: number = Date.now()): boolean {
  return nowMs < UNLOCK_TIMESTAMP_MS;
}

export interface CountdownTimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isUnlocked: boolean;
}

/**
 * Calculate remaining time until 28 Oct 2026 00:00 IST
 */
export function calculateTimeRemaining(currentServerTimeMs: number): CountdownTimeRemaining {
  const diffMs = UNLOCK_TIMESTAMP_MS - currentServerTimeMs;

  if (diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: 0,
      isUnlocked: true,
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;
  const days = Math.floor(totalHours / 24);

  return {
    days,
    hours,
    minutes,
    seconds,
    totalMs: diffMs,
    isUnlocked: false,
  };
}

/**
 * Playful attempt messages when user interacts with locked elements before Oct 28
 */
export const ATTEMPT_MESSAGES = [
  "Nice try. It's still locked. 😂",
  "Bro, it's not opening early. 😭",
  "You are VERY early. Go away. 👀",
  "Password won't save you this time. 😂",
  "October 28. Remember that number.",
  "Trying to break into your own birthday surprise? 😭",
  "Access denied by the birthday department.",
  "Absolutely not. Come back later. 🌷",
  "You're early. The surprise isn't. 😂",
  "Nice try. 😂",
  "The lock is doing its job.",
  "28th. Not 27th. Not 26th. 28th. 😭",
];

export function getRandomAttemptMessage(): string {
  const index = Math.floor(Math.random() * ATTEMPT_MESSAGES.length);
  return ATTEMPT_MESSAGES[index];
}
