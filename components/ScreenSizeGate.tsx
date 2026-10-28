"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Laptop, Sparkles, Heart, Monitor, ShieldAlert } from "lucide-react";
import PetalParticles from "./flowers/PetalParticles";
import { TulipFlower, DaisyFlower } from "./flowers/FlowerSvg";
import { FloralCorner } from "./flowers/FloralFrame";

interface ScreenSizeGateProps {
  children: React.ReactNode;
}

export default function ScreenSizeGate({ children }: ScreenSizeGateProps) {
  const [windowWidth, setWindowWidth] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isTester, setIsTester] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateSize = () => {
      setWindowWidth(window.innerWidth);
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    try {
      const isAnuj =
        sessionStorage.getItem("anshii_user_role") === "anuj" ||
        sessionStorage.getItem("anshii_tester_bypass") === "true";
      if (isAnuj) setIsTester(true);
    } catch {}

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  if (isTester) {
    return <>{children}</>;
  }

  return <div className="w-full h-full">{children}</div>;
}
