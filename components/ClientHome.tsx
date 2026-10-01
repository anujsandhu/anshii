"use client";

import React, { useState, useEffect } from "react";
import ScrapbookPager from "@/components/ScrapbookPager";
import CustomCursor from "@/components/CustomCursor";
import SecretGiftGate from "@/components/SecretGiftGate";
import BirthdayDateLock from "@/components/BirthdayDateLock";
import PrivacyNoticeBanner from "@/components/PrivacyNoticeBanner";
import { initAnalytics } from "@/lib/analyticsClient";

interface ClientHomeProps {
  initialIsLocked: boolean;
  initialServerTime: number;
}

export default function ClientHome({
  initialIsLocked,
  initialServerTime,
}: ClientHomeProps) {
  const [isLocked, setIsLocked] = useState(initialIsLocked);

  useEffect(() => {
    if (!isLocked) {
      initAnalytics("welcome");
    }
  }, [isLocked]);

  const handleUnlock = async () => {
    try {
      const res = await fetch("/api/date-lock", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        // Only unlock if server confirms the date is unlocked
        if (!data.isLocked) {
          setIsLocked(false);
          return;
        }
      }
    } catch {}

    // Fallback: if countdown hit zero, unlock the date gate to expose the password gate
    setIsLocked(false);
  };

  return (
    <main className="w-screen h-[100dvh] overflow-hidden bg-[#faf7f2] text-[#3f2e24] relative selection:bg-[#fda4af]/40 selection:text-[#881337]">
      {/* Custom Hand-Drawn Floral Desktop Cursor */}
      <CustomCursor />

      {/* FIRST LAYER: Birthday Countdown Lock until 28 October 2026 */}
      {isLocked ? (
        <BirthdayDateLock
          onUnlock={handleUnlock}
          initialServerTime={initialServerTime}
        />
      ) : (
        /* SECOND LAYER (after 28 Oct): Password Verification Gate & Privacy Notice */
        <>
          <PrivacyNoticeBanner />
          <SecretGiftGate>
            {/* FINAL LAYER (after password): Full Scrapbook Experience */}
            <ScrapbookPager />
          </SecretGiftGate>
        </>
      )}
    </main>
  );
}
