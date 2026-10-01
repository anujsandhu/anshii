"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { PHYSICAL_GIFT_CONFIG } from "@/data/birthday";
import { Sparkles, Scissors, Heart } from "lucide-react";

interface PrintableQrCardProps {
  url?: string;
  password?: string;
  showCutLines?: boolean;
  scale?: number;
}

export default function PrintableQrCard({
  url = PHYSICAL_GIFT_CONFIG.websiteUrl,
  password = PHYSICAL_GIFT_CONFIG.password,
  showCutLines = true,
  scale = 1,
}: PrintableQrCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    // Generate high-resolution QR code image with custom warm espresso color
    QRCode.toDataURL(url, {
      width: 512,
      margin: 1,
      color: {
        dark: "#3a2518", // Warm chocolate espresso matching scrapbook
        light: "#ffffff",
      },
      errorCorrectionLevel: "H", // High error correction so it scans reliably even with small center badge
    })
      .then((dataUri) => {
        setQrDataUrl(dataUri);
      })
      .catch((err) => {
        console.error("Failed to generate QR code:", err);
      });
  }, [url]);

  return (
    <div
      className="relative select-none print:m-0"
      style={{
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: "center center",
      }}
    >
      {/* Outer cut-guide wrapper (printed lines) */}
      <div
        className={`relative p-2.5 rounded-3xl ${
          showCutLines
            ? "border-2 border-dashed border-[#d6c4b8] print:border-[#999]"
            : "border-transparent"
        }`}
      >
        {/* Scissor icon cut hint */}
        {showCutLines && (
          <div className="absolute -top-3 left-6 px-1.5 py-0.5 bg-white border border-[#ebdcd0] rounded-full flex items-center gap-1 text-[10px] text-[#a89080] font-sans font-medium print:border-gray-400 print:text-gray-500">
            <Scissors className="w-2.5 h-2.5 rotate-90" />
            <span>Cut line</span>
          </div>
        )}

        {/* Physical Gift Box Card Container: Exactly 70mm x 95mm (~2.75" x 3.75") */}
        <div
          id="physical-gift-card"
          className="w-[265px] h-[365px] rounded-2xl bg-[#fffdfa] border-2 border-[#ebdcd0] shadow-[0_8px_30px_rgba(120,80,50,0.08)] print:shadow-none print:border-[#bbb] flex flex-col items-center justify-between p-4 relative overflow-hidden text-[#3f2e24]"
          style={{
            backgroundImage:
              "radial-gradient(#f0e6dd 0.75px, transparent 0.75px), radial-gradient(#f0e6dd 0.75px, #fffdfa 0.75px)",
            backgroundSize: "16px 16px",
            backgroundPosition: "0 0, 8px 8px",
          }}
        >
          {/* Top Washi Tape Sticker */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-gradient-to-r from-[#fda4af]/60 via-[#fbcfe8]/70 to-[#fed7aa]/60 backdrop-blur-xs rotate-[-1.5deg] shadow-xs border-y border-white/60 flex items-center justify-center">
            <span className="text-[9px] font-sans font-bold tracking-widest text-[#881337]/70 uppercase">
              ✦ FOR ANSHII ✦
            </span>
          </div>

          {/* Corner Floral Doodles */}
          <span className="absolute top-2 left-2.5 text-xs opacity-40 select-none">🌸</span>
          <span className="absolute top-2 right-2.5 text-xs opacity-40 select-none">🌷</span>
          <span className="absolute bottom-2 left-2.5 text-xs opacity-40 select-none">✨</span>
          <span className="absolute bottom-2 right-2.5 text-xs opacity-40 select-none">🧸</span>

          {/* Header Texts */}
          <div className="w-full text-center pt-2">
            <div className="inline-flex items-center gap-1 text-[10px] uppercase font-sans font-bold tracking-wider text-[#be185d]/80 bg-[#fff0f3] px-2 py-0.5 rounded-full border border-[#fbcfe8]/60 mb-1">
              <Sparkles className="w-2.5 h-2.5 text-[#fb7185]" />
              <span>Special Delivery</span>
            </div>

            <h3 className="font-serif italic text-base sm:text-lg font-bold text-[#3f2e24] leading-tight">
              “Wait… there&apos;s one more thing.”
            </h3>

            <p className="text-[12px] font-sans font-semibold text-[#8c6b58] mt-0.5 flex items-center justify-center gap-1">
              <span>Scan me</span>
              <span className="text-sm">👀</span>
            </p>
          </div>

          {/* Center QR Code Container with Polaroid styling */}
          <div className="relative p-2 bg-white rounded-xl shadow-xs border border-[#ebdcd0] flex flex-col items-center">
            {qrDataUrl ? (
              <div className="relative w-[136px] h-[136px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt="Birthday Website QR Code"
                  className="w-full h-full object-contain rounded-lg"
                />
                {/* Tiny Center Heart Badge */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-xs border border-[#fbcfe8] flex items-center justify-center pointer-events-none">
                  <Heart className="w-3.5 h-3.5 fill-[#fb7185] text-[#fb7185]" />
                </div>
              </div>
            ) : (
              <div className="w-[136px] h-[136px] bg-[#f5efe9] animate-pulse rounded-lg flex items-center justify-center text-xs text-[#a89080]">
                Generating QR...
              </div>
            )}
          </div>

          {/* Bottom Card Content: Password Hint & Value */}
          <div className="w-full text-center pb-1">
            <p className="text-[11px] font-sans font-medium text-[#786457]">
              “You&apos;ll need a little secret to get in.”
            </p>

            {/* Password Highlight Box */}
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#fff7ed] border border-[#fed7aa] shadow-2xs">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#9a3412]">
                Password:
              </span>
              <span className="font-mono font-bold text-sm text-[#c2410c] tracking-widest px-1 bg-white rounded border border-[#ffedd5]">
                {password}
              </span>
            </div>

            <p className="text-[9px] text-[#a89080] font-sans mt-1">
              Box 🎁: Bracelet · Teddy · Chocolates · You 🌷
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
