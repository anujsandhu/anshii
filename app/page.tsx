"use client";

import React, { useEffect } from "react";
import ScrapbookPager from "@/components/ScrapbookPager";
import CustomCursor from "@/components/CustomCursor";
import SecretGiftGate from "@/components/SecretGiftGate";
import PrivacyNoticeBanner from "@/components/PrivacyNoticeBanner";
import { initAnalytics } from "@/lib/analyticsClient";

export default function Home() {
  useEffect(() => {
    initAnalytics("welcome");
  }, []);

  return (
    <main className="w-screen h-[100dvh] overflow-hidden bg-[#faf7f2] text-[#3f2e24] relative selection:bg-[#fda4af]/40 selection:text-[#881337]">
      {/* Custom Hand-Drawn Floral Desktop Cursor */}
      <CustomCursor />

      {/* Transparent Consent-Based Privacy Notice */}
      <PrivacyNoticeBanner />

      {/* Password Gate & Full-Screen Scrapbook Engine */}
      <SecretGiftGate>
        <ScrapbookPager />
      </SecretGiftGate>
    </main>
  );
}
