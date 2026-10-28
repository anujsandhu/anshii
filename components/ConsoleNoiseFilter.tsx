"use client";

import { useEffect } from "react";

export default function ConsoleNoiseFilter() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Signatures of noisy browser extensions (e.g. Apple iCloud Passwords, Brave wallet, adblockers)
    const EXTENSION_NOISE = [
      "FrameIsBrowserFrameError",
      "FrameDoesNotExistError",
      "background.js",
      "message port closed",
      "Receiving end does not exist",
      "runtime.lastError",
      "DelayedMessageSender",
      "setUpContentScript",
    ];

    const isExtensionNoise = (msg: string): boolean => {
      return EXTENSION_NOISE.some((noise) => msg.includes(noise));
    };

    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      const reasonStr = String(
        e?.reason?.message || e?.reason?.stack || e?.reason || ""
      );
      if (isExtensionNoise(reasonStr)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };

    const handleError = (e: ErrorEvent) => {
      const msg = String(e?.message || "");
      const filename = String(e?.filename || "");
      if (isExtensionNoise(msg) || isExtensionNoise(filename)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };

    // Filter console.error if extension calls leak into page execution context
    const origError = console.error;
    console.error = function (...args: any[]) {
      const fullText = args
        .map((a) => String(a?.message || a?.stack || a))
        .join(" ");
      if (isExtensionNoise(fullText)) {
        return;
      }
      origError.apply(console, args);
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection, {
      capture: true,
    });
    window.addEventListener("error", handleError, { capture: true });

    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
        { capture: true }
      );
      window.removeEventListener("error", handleError, { capture: true });
      console.error = origError;
    };
  }, []);

  return null;
}
