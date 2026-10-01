"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert } from "lucide-react";

interface LeavePageGuardProps {
  /**
   * Warning message passed to beforeunload event returnValue.
   * Modern browsers display their own native confirmation dialog for security,
   * but returning a non-empty string is required by browser specs.
   */
  warningMessage?: string;
}

export const LEAVE_PAGE_WARNING_TEXT =
  "Are you sure you want to leave? Any unsaved progress will be lost.";

export default function LeavePageGuard({
  warningMessage = LEAVE_PAGE_WARNING_TEXT,
}: LeavePageGuardProps) {
  const [navNotice, setNavNotice] = useState<{
    show: boolean;
    title: string;
    subText: string;
  }>({
    show: false,
    title: "",
    subText: "",
  });

  const noticeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInternalNavRef = useRef(false);

  const showNavNotice = (
    title = "Navigation Protected 🌷",
    subText = "Stay inside the scrapbook! Use the chapter buttons to explore."
  ) => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    setNavNotice({ show: true, title, subText });
    noticeTimerRef.current = setTimeout(() => {
      setNavNotice((prev) => ({ ...prev, show: false }));
    }, 2600);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // ── 1. STRICT NATIVE BEFOREUNLOAD CONFIRMATION DIALOG ──
    // Triggers browser's native dialog when attempting to close tab, refresh,
    // or navigate away via address bar / external links.
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // If internal client navigation was intentionally initiated, do not block
      if (isInternalNavRef.current) return;

      // Standard WHATWG specification: preventDefault() triggers the native dialog
      e.preventDefault();

      // Setting e.returnValue is required by Chrome, Edge, Safari, and Firefox
      e.returnValue = warningMessage;
      return warningMessage;
    };

    // Attach with capture: true for strict earliest interception
    window.addEventListener("beforeunload", handleBeforeUnload, { capture: true });

    // ── 2. STRICT BROWSER BACK/FORWARD (POPSTATE) NAVIGATION GUARD ──
    // Prevents accidental back button, mouse back buttons, and trackpad swipe gestures.
    const GUARD_KEY = "anshii_leave_guard_active";
    const currentHref = window.location.href;

    try {
      // Ensure current history entry has our guard state
      const currentState = window.history.state;
      if (!currentState || !currentState[GUARD_KEY]) {
        window.history.pushState(
          { [GUARD_KEY]: true, initial: true, t: Date.now() },
          "",
          currentHref
        );
      }
    } catch {}

    const handlePopState = (e: PopStateEvent) => {
      // If navigating internally between app pages, allow normal navigation
      if (isInternalNavRef.current) return;

      // Immediately push guard state back to strictly neutralise back/forward pop
      // Note: pushState does NOT trigger popstate, guaranteeing no recursion or loops
      try {
        window.history.pushState(
          { [GUARD_KEY]: true, locked: true, t: Date.now() },
          "",
          window.location.href
        );
      } catch {}

      // Display cute bottom-of-card toast informing the user
      showNavNotice(
        "Navigation Protected 🌷",
        "Stay inside the scrapbook! Use the chapter buttons to explore."
      );

      // Also dispatch custom event in case parent components want to react
      window.dispatchEvent(
        new CustomEvent("anshii_leave_blocked", {
          detail: { reason: "popstate" },
        })
      );
    };

    window.addEventListener("popstate", handlePopState);

    // ── 3. STRICT KEYBOARD NAVIGATION GUARD (Backspace outside inputs & Alt+Left) ──
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      // Prevent Backspace outside text fields from triggering browser back navigation
      if (e.key === "Backspace" && !isInput) {
        e.preventDefault();
        showNavNotice(
          "Navigation Protected 🌷",
          "Use the on-screen buttons to navigate through the scrapbook."
        );
      }

      // Detect Alt + ArrowLeft (browser back shortcut)
      if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        showNavNotice(
          "Navigation Protected 🌷",
          "Use the on-screen buttons to navigate through the scrapbook."
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });

    // ── 4. DETECT INTERNAL ROUTING TO PREVENT INTERFERENCE WITH APP NAVIGATION ──
    const handleDocumentClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // If it's an internal Next.js link (starts with / and isn't external // or blank target)
      if (
        (href.startsWith("/") || href.startsWith("#")) &&
        !href.startsWith("//") &&
        anchor.target !== "_blank"
      ) {
        isInternalNavRef.current = true;
        // Reset after transition window
        setTimeout(() => {
          isInternalNavRef.current = false;
        }, 750);
      }
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload, { capture: true });
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      document.removeEventListener("click", handleDocumentClick, { capture: true });
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    };
  }, [warningMessage]);

  return (
    <AnimatePresence>
      {navNotice.show && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.94 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="fixed bottom-5 sm:bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
          style={{ paddingBottom: "max(8px, var(--sab))" }}
        >
          <div className="pointer-events-auto px-4 sm:px-5 py-2.5 rounded-2xl shadow-lg border backdrop-blur-md flex items-center gap-3 max-w-sm sm:max-w-md bg-[#fff0f3]/95 border-[#fda4af] text-[#881337] shadow-[0_10px_30px_rgba(244,63,94,0.18)]">
            <div className="w-7 h-7 rounded-full bg-[#ffe4e6] text-[#e11d48] flex items-center justify-center shrink-0">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="font-sans font-bold text-xs sm:text-sm truncate leading-snug">
                {navNotice.title}
              </span>
              <span className="text-[11px] opacity-85 font-sans font-medium line-clamp-1 leading-tight">
                {navNotice.subText}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
