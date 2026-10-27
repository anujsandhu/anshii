"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ScrapbookPager from "@/components/ScrapbookPager";
import CustomCursor from "@/components/CustomCursor";
import SecretGiftGate from "@/components/SecretGiftGate";
import BirthdayDateLock from "@/components/BirthdayDateLock";
import ScreenSizeGate from "@/components/ScreenSizeGate";
import LiveMessageOverlay from "@/components/LiveMessageOverlay";
import { initAnalytics } from "@/lib/analyticsClient";

const ReactionCam = dynamic(() => import("@/components/ReactionCam"), {
  ssr: false,
});

interface ClientHomeProps {
  initialIsLocked: boolean;
  initialServerTime: number;
}

export default function ClientHome({
  initialIsLocked,
  initialServerTime,
}: ClientHomeProps) {
  // Date Lock State: SSR starts at initialIsLocked to prevent hydration mismatch.
  // Tester Anuj (anuj88) bypass evaluates inside useEffect on client mount.
  const [isLocked, setIsLocked] = useState<boolean>(initialIsLocked);

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);

      // Clear old completed task data (?clear=true, ?reset=true, or ?lock=true)
      if (
        urlParams.get("lock") === "true" ||
        urlParams.get("reset") === "true" ||
        urlParams.get("clear") === "true"
      ) {
        localStorage.removeItem("anshii_completed_frames");
        localStorage.removeItem("anshii_madam_ji_answers");
        localStorage.removeItem("anshii_madam_ji_keepsake_v2");
        localStorage.removeItem("anshii_gift_snaps_v4");
        localStorage.removeItem("anshii_gift_slots_v4");
        localStorage.removeItem("anshii_gift_slots_v5");
        localStorage.removeItem("anshii_wishes_key_v2");
        localStorage.removeItem("anshii_last_frame");

        if (urlParams.get("lock") === "true") {
          localStorage.removeItem("anshii_tester_bypass");
          localStorage.removeItem("anshii_user_role");
          sessionStorage.removeItem("anshii_tester_bypass");
          sessionStorage.removeItem("anshii_user_role");
          sessionStorage.removeItem("anshii_auth_session");
          setIsLocked(true);
          return;
        }
      }

      const pass =
        urlParams.get("pass") ||
        urlParams.get("bypass") ||
        urlParams.get("key") ||
        urlParams.get("tester");

      const isExplicitBypass =
        pass &&
        (pass.toLowerCase() === "anuj88" || pass.toLowerCase() === "anuj19");

      if (isExplicitBypass) {
        sessionStorage.setItem("anshii_tester_bypass", "true");
        sessionStorage.setItem("anshii_user_role", "anuj");
        setIsLocked(false);
        return;
      }

      // No explicit bypass URL parameter:
      if (initialIsLocked) {
        // Date is locked (before 28 Oct): strictly enforce the countdown!
        // Clear any persistent tester keys so nobody gets unauthorized early access.
        localStorage.removeItem("anshii_tester_bypass");
        localStorage.removeItem("anshii_user_role");
        sessionStorage.removeItem("anshii_tester_bypass");
        sessionStorage.removeItem("anshii_user_role");
        sessionStorage.removeItem("anshii_auth_session");
        setIsLocked(true);
      } else {
        // Date is unlocked (28 Oct birthday): keep user session and saved scrapbook progress intact
        setIsLocked(false);
      }
    } catch {}
  }, [initialIsLocked]);

  // Listen for tester bypass authorization events (e.g. secret typing 'anuj88')
  useEffect(() => {
    const handleAuthSuccess = (e: any) => {
      const isAnuj = e.detail?.isTester || e.detail?.role === "anuj";
      if (isAnuj) {
        setIsLocked(false);
      }
    };
    window.addEventListener("anshii_auth_success", handleAuthSuccess);
    return () => {
      window.removeEventListener("anshii_auth_success", handleAuthSuccess);
    };
  }, []);

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
      {/* Screen Size Gate: Mandatory Laptop / Large Screen Only */}
      <ScreenSizeGate>
        {/* Dynamic Desktop Cursor */}
        <CustomCursor mode="cute" />

        {/* Global Continuous Reaction Camera & Live Stream (Entry to Exit) */}
        <ReactionCam autoStartOnMount={true} />

        {/* Real-Time Live Message & Floating Emoji Overlay */}
        <LiveMessageOverlay />

        {/* FIRST LAYER: Birthday Countdown Lock until 28 October 2026 */}
        {isLocked ? (
          <BirthdayDateLock
            onUnlock={handleUnlock}
            initialServerTime={initialServerTime}
          />
        ) : (
          /* SECOND LAYER (after 28 Oct): Password Verification Gate */
          <SecretGiftGate>
            {/* FINAL LAYER (after password): Full Scrapbook Experience */}
            <ScrapbookPager />
          </SecretGiftGate>
        )}
      </ScreenSizeGate>
    </main>
  );
}
