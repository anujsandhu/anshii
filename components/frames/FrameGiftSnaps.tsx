"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Camera,
  CheckCircle2,
  Trash2,
  RotateCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Check,
  X,
  ExternalLink,
  Download,
  Lock,
  CloudCheck,
  Cloud,
} from "lucide-react";
import confetti from "canvas-confetti";
import { getAnonymousSessionId, trackEvent } from "@/lib/analyticsClient";

interface FrameGiftSnapsProps {
  isCompleted: boolean;
  onCompleteTask: () => void;
  onNext: () => void;
}

export interface GiftSlot {
  id: string;
  stepNumber: number;
  title: string;
  tabLabel: string;
  icon: string;
  tagline: string;
  prompt: string;
  defaultCaption: string;
  tapeClass: string;
  rotation: number;
  isPreset?: boolean;
}

export interface UploadedGiftSnap {
  slotId: string;
  imageUrl: string; // compressed base64 data URL or Cloudinary CDN URL
  cloudinaryUrl?: string;
  caption: string;
  timestamp: string;
  approved?: boolean;
  verifiedOnLiveVideo?: boolean;
  sharedToWhatsApp?: boolean;
  syncStatus?: "local" | "syncing" | "synced";
}

// ── Progressive Unboxing Sequence ─────────────────────────────────────────────
// 1st: Upload closed box photo
// 2nd: Open gift, wear the bracelet, upload photo wearing bracelet
// 3rd: Find & upload the 2nd gift (Teddy)
// 4th: All gifts together / final smile
const DEFAULT_GIFT_SLOTS: GiftSlot[] = [
  {
    id: "step-1",
    stepNumber: 1,
    title: "Step 1: The Closed Box",
    tabLabel: "1. Closed Box",
    icon: "📦",
    tagline: "Before opening! 🎁",
    prompt: "Before you open anything! Take a picture of the closed, sealed gift box right in front of you.",
    defaultCaption: "The sealed gift box before opening! 📦👀",
    tapeClass: "washi-tape-pink",
    rotation: -1.8,
    isPreset: true,
  },
  {
    id: "step-2",
    stepNumber: 2,
    title: "Step 2: Open The Box",
    tabLabel: "2. Open Box",
    icon: "✨",
    tagline: "Open the box & wear it! ✨",
    prompt: "Now open the gift box! Put on the birthday bracelet and take a photo wearing it on your wrist!",
    defaultCaption: "Wearing the birthday bracelet! Loving the sparkle 💫✨",
    tapeClass: "washi-tape-blue",
    rotation: 2,
    isPreset: true,
  },
  {
    id: "step-3",
    stepNumber: 3,
    title: "Step 3: The Second Gift",
    tabLabel: "3. 2nd Gift",
    icon: "🧸",
    tagline: "Look deeper in the box... 🧸",
    prompt: "Reach inside for your 2nd gift! Find the fluffy teddy bear and snap a cute photo with it!",
    defaultCaption: "Found the 2nd gift! Me & the teddy bear 🧸💖",
    tapeClass: "washi-tape-yellow",
    rotation: -1.5,
    isPreset: true,
  },
  {
    id: "step-4",
    stepNumber: 4,
    title: "Step 4: All Gifts Together",
    tabLabel: "4. All Gifts",
    icon: "💖",
    tagline: "The complete celebration 🌸",
    prompt: "Hold all your gifts together and take the ultimate birthday unboxing snap! Big smile!",
    defaultCaption: "All the birthday surprises together! Best birthday ever 💖🎉",
    tapeClass: "washi-tape-mint",
    rotation: 1.5,
    isPreset: true,
  },
];

const STORAGE_KEY_SNAPS = "anshii_gift_snaps_v4";
const STORAGE_KEY_SLOTS = "anshii_gift_slots_v5";

// Client-side image compressor: keeps polaroids crisp (~1200px max) but under ~150KB
async function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.84));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatCurrentTimestamp(): string {
  const d = new Date();
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function FrameGiftSnaps({
  isCompleted,
  onCompleteTask,
  onNext,
}: FrameGiftSnapsProps) {
  const [slots, setSlots] = useState<GiftSlot[]>(DEFAULT_GIFT_SLOTS);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const [snaps, setSnaps] = useState<Record<string, UploadedGiftSnap>>({});
  const [approvals, setApprovals] = useState<Record<string, boolean>>({});
  const [taskDone, setTaskDone] = useState(isCompleted);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionInput, setCaptionInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [lockedToast, setLockedToast] = useState<string | null>(null);

  // Add custom slot modal state
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [newSlotTitle, setNewSlotTitle] = useState("");
  const [newSlotIcon, setNewSlotIcon] = useState("📸");

  // SSR portal mount guard
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if a slot is unlocked based on previous step having approval or uploaded photo
  const isSlotUnlocked = (index: number): boolean => {
    if (index === 0) return true;
    const prevSlot = slots[index - 1];
    return Boolean(
      approvals[prevSlot.id] ||
      snaps[prevSlot.id]?.approved ||
      snaps[prevSlot.id]?.imageUrl
    );
  };

  const isSlotApproved = (slotId: string): boolean => {
    return Boolean(
      approvals[slotId] ||
      snaps[slotId]?.approved ||
      snaps[slotId]?.imageUrl
    );
  };

  useEffect(() => {
    setMounted(true);

    // 1. Restore from localStorage for instantaneous rendering
    try {
      const savedSnaps = localStorage.getItem(STORAGE_KEY_SNAPS);
      if (savedSnaps) {
        const parsed = JSON.parse(savedSnaps);
        setSnaps(parsed);
        // Only mark done if ALL preset slots have been uploaded
        const presetIds = DEFAULT_GIFT_SLOTS.map((s) => s.id);
        const allDone = presetIds.every((id) => Boolean(parsed[id]?.imageUrl));
        if (allDone) {
          setTaskDone(true);
        }
      }

      // Clean up legacy v4 cache to prevent stale labels like 'Wear Bracelet'
      localStorage.removeItem("anshii_gift_slots_v4");

      const savedSlots = localStorage.getItem(STORAGE_KEY_SLOTS);
      if (savedSlots) {
        const parsedSlots = JSON.parse(savedSlots);
        if (Array.isArray(parsedSlots) && parsedSlots.length > 0) {
          // Always ensure preset unboxing slots use latest defaults (no spoilers!)
          const mergedPresets = DEFAULT_GIFT_SLOTS.map((defaultSlot) => {
            const found = parsedSlots.find((s: GiftSlot) => s.id === defaultSlot.id);
            return found ? { ...found, ...defaultSlot } : defaultSlot;
          });
          const customSlots = parsedSlots.filter((s: GiftSlot) => !s.isPreset);
          setSlots([...mergedPresets, ...customSlots]);
        }
      }
    } catch {}

    // 2. Fetch live from Firestore (/api/gift-snaps) to synchronize cross-device
    fetch("/api/gift-snaps")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.snaps && Object.keys(data.snaps).length > 0) {
          setSnaps((prev) => {
            const merged = { ...prev, ...data.snaps };
            try {
              localStorage.setItem(STORAGE_KEY_SNAPS, JSON.stringify(merged));
            } catch {}
            return merged;
          });
          // Only mark done if ALL preset slots are now present
          const presetIds = DEFAULT_GIFT_SLOTS.map((s) => s.id);
          const allDone = presetIds.every((id) => Boolean(data.snaps[id]?.imageUrl));
          if (allDone) {
            setTaskDone(true);
          }
        }
      })
      .catch((err) => {
        console.warn("Could not sync from Firestore API:", err);
      });
  }, []);

  const onCompleteTaskRef = useRef(onCompleteTask);
  useEffect(() => {
    onCompleteTaskRef.current = onCompleteTask;
  });

  // 3. Live Polling for Admin Approval every 1.5s while on gifts frame
  useEffect(() => {
    let isFetching = false;
    const pollApprovals = async () => {
      if (isFetching) return;
      isFetching = true;
      try {
        const res = await fetch("/api/gift-snaps", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data && data.success) {
            if (data.approvals) {
              setApprovals(data.approvals);
            }
            if (data.snaps && Object.keys(data.snaps).length > 0) {
              setSnaps((prev) => ({ ...prev, ...data.snaps }));
            }
            if (data.allApproved) {
              setTaskDone(true);
              if (onCompleteTaskRef.current) {
                onCompleteTaskRef.current();
              }
            }
          }
        }
      } catch {} finally {
        isFetching = false;
      }
    };

    pollApprovals();
    const interval = setInterval(pollApprovals, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isCompleted) {
      setTaskDone(true);
    }
  }, [isCompleted]);

  useEffect(() => {
    if (taskDone && !isCompleted) {
      onCompleteTaskRef.current();
    }
  }, [taskDone, isCompleted]);

  // Persist snaps to localStorage
  const saveSnapsToStorage = (updated: Record<string, UploadedGiftSnap>) => {
    setSnaps(updated);
    try {
      localStorage.setItem(STORAGE_KEY_SNAPS, JSON.stringify(updated));
    } catch (err) {
      console.warn("Storage quota warning:", err);
    }
  };

  const currentSlot = slots[activeSlotIndex] || slots[0];
  const currentSnap = currentSlot ? snaps[currentSlot.id] : null;

  // Handle slot tab click with progressive locking check
  const handleSelectSlot = (idx: number) => {
    if (!isSlotUnlocked(idx)) {
      setLockedToast("Complete the previous step first to unlock this! 🔒");
      setTimeout(() => setLockedToast(null), 3200);
      return;
    }
    setActiveSlotIndex(idx);
    setIsEditingCaption(false);
  };

  // File upload handler: validates, uploads to Cloudinary & logs in Firestore
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentSlot) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setLockedToast("File exceeds 10MB limit. Please choose a smaller photo! ⚠️");
      setTimeout(() => setLockedToast(null), 3500);
      return;
    }

    // Validate MIME type
    if (!file.type.startsWith("image/")) {
      setLockedToast("Please upload an image file (JPG, PNG, WEBP, GIF)! ⚠️");
      setTimeout(() => setLockedToast(null), 3500);
      return;
    }

    setIsUploading(true);
    setUploadStatus("Preparing preview...");

    try {
      const compressedDataUrl = await compressImageFile(file);
      const timestamp = formatCurrentTimestamp();
      const sessionId = getAnonymousSessionId();

      const newSnap: UploadedGiftSnap = {
        slotId: currentSlot.id,
        imageUrl: compressedDataUrl,
        caption: currentSlot.defaultCaption,
        timestamp,
        syncStatus: "syncing",
      };

      // 1. Immediately update UI & localStorage for instantaneous preview
      const updated = { ...snaps, [currentSlot.id]: newSnap };
      saveSnapsToStorage(updated);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 75,
          spread: 85,
          origin: { y: 0.6 },
          colors: ["#fda4af", "#f43f5e", "#fed7aa", "#bbf7d0", "#d8b4fe"],
        });
      } catch {}

      // Check if ALL preset slots now have images
      const presetIds = DEFAULT_GIFT_SLOTS.map((s) => s.id);
      const allPresetsDone = presetIds.every(
        (id) => Boolean(updated[id]?.imageUrl)
      );
      if (allPresetsDone && !taskDone) {
        setTaskDone(true);
        onCompleteTask();
        try {
          confetti({
            particleCount: 140,
            spread: 110,
            origin: { y: 0.5 },
            colors: ["#fda4af", "#f43f5e", "#fed7aa", "#bbf7d0", "#d8b4fe"],
          });
        } catch {}
      }

      // 2. Upload to Cloudinary via server-side /api/upload
      setUploadStatus("Uploading to Cloudinary CDN...");
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("sessionId", sessionId);
      uploadFormData.append("page", "gift_snaps");
      uploadFormData.append("stepId", currentSlot.id);
      uploadFormData.append("caption", currentSlot.defaultCaption);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const uploadData = await uploadRes.json();
      const finalCdnUrl = uploadData.cloudinaryUrl || compressedDataUrl;

      // 3. Save clean gift-snaps record (storing Cloudinary CDN URL, not raw binary)
      setUploadStatus("Saving to Firestore...");
      await fetch("/api/gift-snaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepId: currentSlot.id,
          stepNumber: currentSlot.stepNumber,
          title: currentSlot.title,
          caption: currentSlot.defaultCaption,
          imageUrl: finalCdnUrl,
          cloudinaryUrl: uploadData.cloudinaryUrl || undefined,
          timestamp,
        }),
      });

      // Track image upload analytics event
      trackEvent({
        type: "image_upload",
        page: "gift_snaps",
        elementId: currentSlot.id,
        elementText: currentSlot.title,
        metadata: {
          stepNumber: currentSlot.stepNumber,
          uploadId: uploadData.uploadId,
          cloudinaryPublicId: uploadData.cloudinaryPublicId,
        },
      });

      const syncedSnap: UploadedGiftSnap = {
        ...newSnap,
        imageUrl: finalCdnUrl,
        cloudinaryUrl: uploadData.cloudinaryUrl || undefined,
        syncStatus: "synced",
      };
      const syncedMap = { ...snaps, [currentSlot.id]: syncedSnap };
      saveSnapsToStorage(syncedMap);
      setUploadStatus("Saved to Cloudinary & Firestore! ✓");

      // 4. Automatically advance to next step if unlocked
      if (activeSlotIndex < slots.length - 1) {
        setTimeout(() => {
          setActiveSlotIndex(activeSlotIndex + 1);
        }, 1100);
      }
    } catch (err: any) {
      console.error("Error processing image file:", err);
      setUploadStatus(`Upload notice: ${err.message || "Saved locally"}`);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadStatus(""), 3500);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Delete current snap (local and Firestore)
  const handleDeleteSnap = async (slotId: string) => {
    if (!confirm("Are you sure you want to remove this photo?")) return;
    const updated = { ...snaps };
    delete updated[slotId];
    saveSnapsToStorage(updated);

    // Call DELETE API in background
    try {
      await fetch(`/api/gift-snaps?stepId=${slotId}`, { method: "DELETE" });
    } catch {}
  };

  // Save caption edits (local and Firestore)
  const handleSaveCaption = async () => {
    if (!currentSlot || !currentSnap) return;
    const trimmed = captionInput.trim();
    if (!trimmed) {
      setIsEditingCaption(false);
      return;
    }
    const updated = {
      ...snaps,
      [currentSlot.id]: {
        ...currentSnap,
        caption: trimmed,
      },
    };
    saveSnapsToStorage(updated);
    setIsEditingCaption(false);

    // Sync edited caption to Firestore
    try {
      await fetch("/api/gift-snaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepId: currentSlot.id,
          stepNumber: currentSlot.stepNumber,
          title: currentSlot.title,
          caption: trimmed,
          imageData: currentSnap.imageUrl,
          timestamp: currentSnap.timestamp,
        }),
      });
    } catch {}
  };

  // Add custom unboxing step
  const handleCreateCustomSlot = () => {
    const nextStepNum = slots.length + 1;
    const title = newSlotTitle.trim() || `Step ${nextStepNum}`;

    const newSlot: GiftSlot = {
      id: `custom-step-${Date.now()}`,
      stepNumber: nextStepNum,
      title: title.startsWith("Step") ? title : `Step ${nextStepNum}: ${title}`,
      tabLabel: `Step ${nextStepNum}`,
      icon: newSlotIcon || "📸",
      tagline: "Custom Gift Memory ✨",
      prompt: `Upload your photo for ${title}! ✨`,
      defaultCaption: `${title} 💖`,
      tapeClass: "washi-tape-pink",
      rotation: Math.floor(Math.random() * 4) - 2,
      isPreset: false,
    };

    const updatedSlots = [...slots, newSlot];
    setSlots(updatedSlots);
    try {
      localStorage.setItem(STORAGE_KEY_SLOTS, JSON.stringify(updatedSlots));
    } catch {}

    setNewSlotTitle("");
    setShowAddSlotModal(false);
    setActiveSlotIndex(updatedSlots.length - 1);
  };

  const uploadedCount = Object.keys(snaps).length;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start lg:justify-center px-3 sm:px-6 select-none overflow-y-auto overflow-x-hidden pt-[max(56px,calc(var(--sat)+44px))] pb-[max(56px,calc(var(--sab)+44px))]">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[680px] h-[340px] sm:h-[680px] bg-gradient-to-tr from-[#fed7aa]/25 via-[#fbcfe8]/25 to-[#bae6fd]/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* ── ORGANIZED 2-COLUMN DESKTOP LAYOUT (FITTED IN ONE FRAME, ZERO SCROLL) ── */}
      <div className="w-full max-w-4xl lg:max-w-5xl flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-10 my-auto z-10">
        
        {/* ══ LEFT: ACTIVE POLAROID CARD WITH PREV / NEXT ARROWS ══ */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 shrink-0">
          {/* Previous Arrow */}
          <button
            onClick={() => {
              const target =
                activeSlotIndex > 0 ? activeSlotIndex - 1 : slots.length - 1;
              if (isSlotUnlocked(target)) {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(
                    new CustomEvent("anshii_auto_save_before_back", {
                      detail: { action: `unboxing_step_${activeSlotIndex}_to_${target}` },
                    })
                  );
                }
                setActiveSlotIndex(target);
                setIsEditingCaption(false);
              }
            }}
            aria-label="Previous step"
            className="p-2 sm:p-2.5 rounded-full bg-white/90 hover:bg-white border border-[#ebdcd0] text-[#786457] hover:text-[#3f2e24] shadow-xs cursor-pointer transition-all shrink-0"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Active Polaroid / Upload Box Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlot.id}
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.22 }}
              className="relative w-full max-w-[300px] sm:max-w-[330px] flex flex-col items-center"
            >
              {currentSnap ? (
                /* ── FILLED POLAROID CARD ── */
                <div
                  className="polaroid-card rounded-2xl relative shadow-[0_16px_45px_-8px_rgba(80,50,30,0.18)] w-full max-w-[300px] sm:max-w-[330px] group transition-transform border border-[#ebdcd0]"
                  style={{
                    padding: "12px 12px 24px 12px",
                    transform: `rotate(${currentSlot.rotation}deg)`,
                  }}
                >
                  {/* Washi Tape */}
                  <div className={currentSlot.tapeClass} />

                  {/* Photo Frame */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#eee7de] shadow-inner mt-2">
                    <Image
                      src={currentSnap.imageUrl}
                      alt={currentSnap.caption}
                      fill
                      unoptimized
                      sizes="330px"
                      className="object-cover transition-transform duration-500 group-hover:scale-103"
                    />

                    {/* Cloud storage badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs border border-[#ebdcd0] text-[#4b5563] text-[9px] font-sans font-medium flex items-center gap-1 shadow-2xs">
                      <Cloud className="w-2.5 h-2.5 text-[#3b82f6]" />
                      <span>Firestore</span>
                      {currentSnap.cloudinaryUrl && <span>• CDN</span>}
                    </div>
                  </div>

                  {/* Caption & Metadata */}
                  <div className="pt-2 px-1 text-center">
                    {isEditingCaption ? (
                      <div className="flex items-center gap-1 justify-center my-1">
                        <input
                          type="text"
                          value={captionInput}
                          onChange={(e) => setCaptionInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveCaption();
                          }}
                          autoFocus
                          maxLength={60}
                          className="font-handwriting text-base text-[#3f2e24] bg-white border border-[#fda4af] rounded-lg px-2 py-0.5 w-full text-center outline-hidden shadow-2xs"
                        />
                        <button
                          onClick={handleSaveCaption}
                          className="p-1 rounded-md bg-[#fda4af] text-white hover:bg-[#fb7185] cursor-pointer"
                          title="Save caption"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          setCaptionInput(currentSnap.caption);
                          setIsEditingCaption(true);
                        }}
                        className="group/cap inline-flex items-center justify-center gap-1 cursor-pointer"
                        title="Click to edit caption"
                      >
                        <p className="font-handwriting text-base sm:text-lg text-[#3f2e24] font-bold leading-tight">
                          &ldquo;{currentSnap.caption}&rdquo;
                        </p>
                        <Pencil className="w-3 h-3 text-[#a89080] opacity-0 group-hover/cap:opacity-100 transition-opacity" />
                      </div>
                    )}

                    <span className="text-[10px] text-[#8c7465] font-sans block mt-0.5">
                      {currentSnap.timestamp}
                    </span>

                    {/* Action Bar */}
                    <div className="flex items-center justify-center gap-2 mt-2 pt-2 border-t border-[#f0e4d6]">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 rounded-full bg-[#f5ece3] hover:bg-[#ebdcd0] text-[#786457] hover:text-[#3f2e24] transition-colors cursor-pointer"
                        title="Replace photo"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSnap(currentSlot.id)}
                        className="p-1.5 rounded-full bg-[#fff1f2] hover:bg-[#ffe4e6] text-[#be185d] transition-colors cursor-pointer"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Quick navigation when approved */}
                    {activeSlotIndex < slots.length - 1 ? (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setActiveSlotIndex(activeSlotIndex + 1);
                          setIsEditingCaption(false);
                        }}
                        className="w-full mt-2.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-sans font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Approved! Next Step</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </motion.button>
                    ) : (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onNext}
                        className="w-full mt-2.5 py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-sans font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>All Gifts Unboxed! Next Chapter</span>
                        <Sparkles className="w-3.5 h-3.5" />
                      </motion.button>
                    )}
                  </div>
                </div>
              ) : (
                /* ── STEP AWAITING ANUJ'S LIVE APPROVAL ── */
                <div className="w-full max-w-[300px] sm:max-w-[330px] p-5 sm:p-6 rounded-3xl bg-[#fffdfa] border-2 border-dashed border-[#e2d5c5] shadow-[0_16px_45px_-8px_rgba(80,50,30,0.14)] flex flex-col items-center text-center relative overflow-hidden">
                  <div className={currentSlot.tapeClass} />

                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#fef3c7] via-[#fff0f3] to-[#f0fdf4] border border-[#fde68a] flex items-center justify-center text-2xl mb-1.5 shadow-inner animate-soft-pulse mt-1">
                    {currentSlot.icon}
                  </div>

                  <h3 className="font-handwriting text-xl sm:text-2xl font-bold text-[#3f2e24] leading-tight">
                    {currentSlot.title}
                  </h3>
                  <span className="text-xs font-sans font-semibold text-[#be185d] mb-1">
                    {currentSlot.tagline}
                  </span>
                  <p className="text-xs text-[#786457] font-sans leading-relaxed mb-3 max-w-xs">
                    {currentSlot.prompt}
                  </p>

                  {/* Live Video Sharing Approval Box */}
                  <div className="w-full p-3 rounded-2xl bg-rose-50/90 border border-rose-200 flex flex-col items-center gap-1.5 mb-2.5 shadow-inner">
                    <div className="flex items-center gap-1.5 text-[#be185d] text-xs font-sans font-bold">
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                      <span>Show to Anuj on Live Video</span>
                    </div>
                    <p className="text-[10px] text-[#8c7465] font-sans">
                      Anuj is watching your camera live! Hold this gift up to your camera for him to verify.
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-rose-700 bg-white px-2.5 py-0.5 rounded-full border border-rose-200 shadow-2xs">
                      ⏳ Awaiting Anuj&apos;s Approval...
                    </span>
                  </div>

                  {/* Optional Photo Upload */}
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-sans font-medium text-[#8c7465] hover:text-[#be185d] underline flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{isUploading ? "Uploading..." : "Snap a keepsake photo? (Optional)"}</span>
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Next Arrow */}
          <button
            onClick={() => {
              const target =
                activeSlotIndex < slots.length - 1 ? activeSlotIndex + 1 : 0;
              if (isSlotUnlocked(target)) {
                setActiveSlotIndex(target);
                setIsEditingCaption(false);
              } else {
                setLockedToast("Complete the previous step first to unlock this! 🔒");
                setTimeout(() => setLockedToast(null), 3200);
              }
            }}
            aria-label="Next step"
            className="p-2 sm:p-2.5 rounded-full bg-white/90 hover:bg-white border border-[#ebdcd0] text-[#786457] hover:text-[#3f2e24] shadow-xs cursor-pointer transition-all shrink-0"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* ══ RIGHT: ORGANIZED DASHBOARD / MILESTONES PANEL ══ */}
        <div className="w-full max-w-md lg:max-w-lg flex flex-col justify-between p-4 sm:p-6 rounded-3xl paper-card-warm border border-[#ebdcd0] shadow-[0_16px_45px_-8px_rgba(80,50,30,0.12)]">
          {/* Header */}
          <div className="mb-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#fef3c7] border border-[#fde68a] text-[#b45309] font-sans text-xs mb-1 shadow-2xs font-semibold">
              <span>🎁</span>
              <span>Chapter 04 • Unboxing Journey</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-handwriting text-[#3f2e24] leading-tight">
              Unboxing Your Birthday Gifts
            </h2>
            <p className="text-xs text-[#786457] font-sans mt-0.5">
              Open your gifts step by step and capture each mystery moment! ✨
            </p>
          </div>

          {/* 4 Milestones Cards (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-2 my-2">
            {slots.map((slot, idx) => {
              const isFilled = isSlotApproved(slot.id);
              const isActive = activeSlotIndex === idx;
              const isUnlocked = isSlotUnlocked(idx);

              const displayIcon = !isUnlocked ? "🎁" : slot.icon;
              const displayLabel = !isUnlocked
                ? idx === 1
                  ? "2. Secret Gift"
                  : idx === 2
                  ? "3. Next Surprise"
                  : `Step ${slot.stepNumber}`
                : slot.tabLabel;

              return (
                <button
                  key={slot.id}
                  onClick={() => handleSelectSlot(idx)}
                  className={`p-2.5 rounded-2xl text-left transition-all duration-200 cursor-pointer border flex flex-col justify-between min-h-[64px] ${
                    isActive
                      ? "bg-[#3f2e24] text-white shadow-sm ring-2 ring-[#3f2e24]/20 scale-102"
                      : isFilled
                      ? "bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46] hover:bg-[#d1fae5]"
                      : isUnlocked
                      ? "bg-white border-[#ebdcd0] text-[#786457] hover:bg-[#fcfaf7]"
                      : "bg-[#f5ede4]/60 border-[#e3d3c4] text-[#a0897a] opacity-75"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-base">{displayIcon}</span>
                    {isFilled ? (
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          isActive ? "text-[#86efac]" : "text-[#10b981]"
                        }`}
                      />
                    ) : !isUnlocked ? (
                      <Lock className="w-3 h-3 text-[#a0897a]" />
                    ) : (
                      <span className="text-[10px] font-sans text-[#fda4af]">Ready</span>
                    )}
                  </div>
                  <span className="font-semibold text-xs truncate mt-1">
                    {displayLabel}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Counter pill */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#fffdfa] border border-[#ebdcd0] text-xs font-sans text-[#786457] my-1">
            <span>Progress</span>
            <span className="font-mono font-bold text-[#be185d]">
              {uploadedCount} of {slots.length} unboxed
            </span>
          </div>

          {/* Locked Step Toast Banner */}
          <AnimatePresence>
            {lockedToast && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="my-1 px-3 py-1 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-xs font-sans flex items-center gap-1.5 shadow-xs"
              >
                <Lock className="w-3.5 h-3.5 text-[#ef4444]" />
                <span>{lockedToast}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Task Completion or Hint */}
          <div className="mt-2 pt-2 border-t border-[#f0e4da]">
            {taskDone ? (
              <div className="flex flex-col gap-2">
                <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] text-xs font-sans font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                  <span>ALL {DEFAULT_GIFT_SLOTS.length} PHOTOS CAPTURED ✓</span>
                </div>
                <button
                  onClick={() => {
                    onCompleteTask();
                    onNext();
                  }}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#fda4af] to-[#fb7185] hover:from-[#fb7185] hover:to-[#f43f5e] text-white font-sans font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 btn-cute"
                >
                  <span>Continue to CS Quiz</span>
                  <span className="text-base leading-none">↓</span>
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-center text-[#8c7465] font-sans">
                Upload all 4 moments to unlock the CS Quiz chapter 📸
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── PORTALED ADD CUSTOM SLOT MODAL ── */}
      {mounted &&
        showAddSlotModal &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2b1e17]/55 backdrop-blur-md select-none cursor-pointer"
            onClick={() => setShowAddSlotModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm bg-[#fffdfa] rounded-3xl border-2 border-[#ebdcd0] shadow-2xl p-5 flex flex-col text-center cursor-default"
            >
              <h3 className="font-serif text-xl font-bold text-[#3f2e24]">
                Add Another Unboxing Step
              </h3>
              <p className="text-xs text-[#786457] font-sans mt-0.5 mb-3">
                Create a custom step for any bonus surprise!
              </p>

              {/* Emoji choices */}
              <div className="flex items-center justify-center gap-2 mb-3">
                {["🎁", "✨", "🎀", "💖", "🧸", "💫", "🌷", "📸"].map(
                  (emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewSlotIcon(emoji)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform cursor-pointer ${
                        newSlotIcon === emoji
                          ? "bg-[#fda4af] scale-110 shadow-xs"
                          : "bg-[#f5ece3] hover:bg-[#ebdcd0]"
                      }`}
                    >
                      {emoji}
                    </button>
                  )
                )}
              </div>

              {/* Title input */}
              <input
                type="text"
                placeholder="e.g. Step 5, Bonus Surprise..."
                value={newSlotTitle}
                onChange={(e) => setNewSlotTitle(e.target.value)}
                maxLength={30}
                className="w-full px-3 py-2.5 rounded-xl border border-[#ebdcd0] font-sans text-xs text-[#3f2e24] bg-white outline-hidden focus:border-[#fda4af] mb-4 text-center"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSlotModal(false)}
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-[#f5ece3] hover:bg-[#ebdcd0] text-[#5c473a] font-sans font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateCustomSlot}
                  disabled={!newSlotTitle.trim()}
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-[#fda4af] hover:bg-[#fb7185] text-white font-sans font-bold text-xs cursor-pointer disabled:opacity-50"
                >
                  Add Step
                </button>
              </div>
            </motion.div>
          </div>,
          document.body
        )}
    </div>
  );
}
