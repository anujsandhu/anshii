"use client";

import React from "react";
import ScrapbookPager from "@/components/ScrapbookPager";
import CustomCursor from "@/components/CustomCursor";
import SecretGiftGate from "@/components/SecretGiftGate";

export default function Home() {
  return (
    <main className="w-screen h-[100dvh] overflow-hidden bg-[#faf7f2] text-[#3f2e24] relative selection:bg-[#fda4af]/40 selection:text-[#881337]">
      {/* Custom Hand-Drawn Floral Desktop Cursor */}
      <CustomCursor />

      {/* Physical Gift Box Password Gate & Full-Screen Scrapbook Engine */}
      <SecretGiftGate>
        <ScrapbookPager />
      </SecretGiftGate>
    </main>
  );
}
