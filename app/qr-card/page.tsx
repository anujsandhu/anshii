"use client";

import React, { useState, useEffect } from "react";
import PrintableQrCard from "@/components/PrintableQrCard";
import { PHYSICAL_GIFT_CONFIG } from "@/data/birthday";
import {
  Printer,
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Gift,
  KeyRound,
  LayoutGrid,
  CreditCard,
} from "lucide-react";
import Link from "next/link";

export default function QrCardPrintPage() {
  const [targetUrl, setTargetUrl] = useState<string>(PHYSICAL_GIFT_CONFIG.websiteUrl);
  const [password, setPassword] = useState<string>(PHYSICAL_GIFT_CONFIG.password);
  const [sheetMode, setSheetMode] = useState<"single" | "sheet4">("single");
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    // Automatically detect origin in browser if deployed or local
    if (typeof window !== "undefined" && window.location.origin) {
      // If default is placeholder or user hasn't modified, use current origin
      if (PHYSICAL_GIFT_CONFIG.websiteUrl.includes("vercel.app")) {
        setTargetUrl(window.location.origin);
      }
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl).catch(() => {});
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#3f2e24] flex flex-col items-center justify-start p-4 sm:p-8 font-sans selection:bg-[#fda4af]/40">
      {/* ── Screen-only Controls (Hidden during print) ────────────────────────── */}
      <header className="w-full max-w-4xl mx-auto flex flex-col items-center text-center mb-8 print:hidden">
        {/* Top Navigation */}
        <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-[#ebdcd0]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#786457] hover:text-[#3f2e24] px-3 py-1.5 rounded-xl bg-white border border-[#ebdcd0] shadow-2xs transition-all hover:scale-102"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Birthday Site</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff0f3] border border-[#fbcfe8] text-[#be185d] text-xs font-bold shadow-2xs">
            <Gift className="w-3.5 h-3.5 text-[#fb7185]" />
            <span>Physical Gift Box Companion</span>
          </div>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#be185d] hover:text-[#9d174d] px-3 py-1.5 rounded-xl bg-[#fff0f3] border border-[#fbcfe8] shadow-2xs transition-all hover:scale-102"
          >
            <span>Test Password Gate</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Title & Explanation */}
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#3f2e24] flex items-center justify-center gap-2">
          <span>Printable Gift Box QR Card</span>
          <Sparkles className="w-5 h-5 text-[#fb7185]" />
        </h1>
        <p className="text-xs sm:text-sm text-[#786457] max-w-xl mt-2 leading-relaxed">
          Tuck this handmade card inside the physical gift box next to the{" "}
          <strong className="text-[#3f2e24]">bracelet, teddy, and chocolates</strong>.
          When Anshii scans the QR code, she will arrive at the secret password screen and unlock her digital birthday experience!
        </p>

        {/* Configuration Card */}
        <div className="w-full mt-6 p-4 sm:p-5 rounded-2xl bg-white border border-[#ebdcd0] shadow-sm flex flex-col md:flex-row items-center gap-4 text-left justify-between">
          <div className="w-full md:w-1/2 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#634e42] flex items-center justify-between">
              <span>Target Website URL (Encoded in QR)</span>
              <button
                onClick={handleCopyLink}
                className="text-[11px] text-[#fb7185] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUrl ? "Copied" : "Copy"}</span>
              </button>
            </label>
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#ebdcd0] bg-[#faf7f2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fda4af] font-mono text-[#3f2e24]"
              placeholder="https://..."
            />
          </div>

          <div className="w-full md:w-1/4 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#634e42] flex items-center gap-1">
              <KeyRound className="w-3 h-3 text-[#f97316]" />
              <span>Card Password</span>
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 text-xs font-mono font-bold uppercase rounded-xl border border-[#ebdcd0] bg-[#faf7f2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fda4af] text-[#c2410c]"
              placeholder="ANSHII19"
            />
          </div>

          <div className="w-full md:w-auto flex items-center gap-2 self-end">
            {/* Layout switch */}
            <div className="flex bg-[#faf7f2] p-1 rounded-xl border border-[#ebdcd0]">
              <button
                onClick={() => setSheetMode("single")}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  sheetMode === "single"
                    ? "bg-white text-[#3f2e24] shadow-xs"
                    : "text-[#8c7465] hover:text-[#3f2e24]"
                }`}
                title="Single card view"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">1 Card</span>
              </button>
              <button
                onClick={() => setSheetMode("sheet4")}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  sheetMode === "sheet4"
                    ? "bg-white text-[#3f2e24] shadow-xs"
                    : "text-[#8c7465] hover:text-[#3f2e24]"
                }`}
                title="4 cards per A4 sheet"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sheet (4x)</span>
              </button>
            </div>

            {/* Print Trigger */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#fda4af] hover:bg-[#fb7185] text-[#4c0519] font-sans font-bold text-xs shadow-md transition-all cursor-pointer hover:scale-103"
            >
              <Printer className="w-4 h-4" />
              <span>Print Card 🖨️</span>
            </button>
          </div>
        </div>

        {/* Print Tip Banner */}
        <div className="w-full mt-3 px-4 py-2.5 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>💡</span>
            <span>
              Tip: Click <strong>Print Card</strong> to print directly. Use high quality cardstock or photo paper, then cut along the dashed lines!
            </span>
          </div>
          <span className="text-[11px] text-[#15803d] font-semibold hidden sm:inline">
            Standard 2.75&quot; × 3.75&quot;
          </span>
        </div>
      </header>

      {/* ── Printable Card Area ──────────────────────────────────────────────── */}
      <main className="w-full flex flex-col items-center justify-center print:w-full print:m-0 print:p-0">
        {sheetMode === "single" ? (
          /* Single Card Display */
          <div className="flex flex-col items-center my-4 print:my-0">
            <PrintableQrCard
              url={targetUrl}
              password={password}
              showCutLines={true}
            />
          </div>
        ) : (
          /* 4-Card Sheet (for printing multiple copies on 1 standard page) */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-4 print:grid-cols-2 print:gap-4 print:my-0 print:p-0">
            <PrintableQrCard url={targetUrl} password={password} showCutLines={true} />
            <PrintableQrCard url={targetUrl} password={password} showCutLines={true} />
            <PrintableQrCard url={targetUrl} password={password} showCutLines={true} />
            <PrintableQrCard url={targetUrl} password={password} showCutLines={true} />
          </div>
        )}
      </main>

      {/* ── Screen-only Footer ───────────────────────────────────────────────── */}
      <footer className="mt-8 text-center text-xs text-[#a89080] print:hidden">
        <p>Physical gift box package: Bracelet · Cute Plushie Teddy · Chocolates · QR Card</p>
        <p className="mt-1">
          Made with 💖 for Anshika&apos;s 19th Birthday
        </p>
      </footer>
    </div>
  );
}
