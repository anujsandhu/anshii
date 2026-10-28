import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebaseAdmin";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { FieldValue } from "firebase-admin/firestore";
import { isServerDateLocked } from "@/lib/dateLock";
import {
  localGetGiftSnaps,
  localSaveGiftSnap,
  localDeleteGiftSnap,
  localGetGiftApprovals,
  localSaveGiftApproval,
  localResetGiftApprovals,
} from "@/lib/localStore";

const COLLECTION_NAME = "gift_snaps";
const PRESET_STEP_IDS = ["step-1", "step-2", "step-3", "step-4"];

const DEFAULT_CAPTIONS: Record<string, string> = {
  "step-1": "The sealed gift box shown to Anuj on live video! 📦👀",
  "step-2": "Wearing the birthday bracelet! Shown on live video ✨💖",
  "step-3": "Found the 2nd gift! Me & the teddy bear 🧸💖",
  "step-4": "All birthday surprises together! Best birthday ever 💖🎉",
};

export function generateVerifiedSvg(stepId: string): string {
  const meta: Record<
    string,
    { icon: string; title: string; subtitle: string; bg1: string; bg2: string }
  > = {
    "step-1": {
      icon: "📦",
      title: "The Closed Gift Box",
      subtitle: "Shown to Anuj on Live Video",
      bg1: "#fed7aa",
      bg2: "#fbcfe8",
    },
    "step-2": {
      icon: "✨",
      title: "Birthday Bracelet",
      subtitle: "Wearing bracelet • Shown on Live Video",
      bg1: "#bae6fd",
      bg2: "#fbcfe8",
    },
    "step-3": {
      icon: "🧸",
      title: "Fluffy Teddy Bear",
      subtitle: "Found 2nd gift • Shown on Live Video",
      bg1: "#fde68a",
      bg2: "#fed7aa",
    },
    "step-4": {
      icon: "💖",
      title: "All Gifts Together",
      subtitle: "Big Birthday Smile • Verified by Anuj",
      bg1: "#fbcfe8",
      bg2: "#fda4af",
    },
  };

  const item = meta[stepId] || {
    icon: "🎁",
    title: "Birthday Surprise",
    subtitle: "Verified on Live Video",
    bg1: "#fbcfe8",
    bg2: "#fed7aa",
  };

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${item.bg1}" />
        <stop offset="100%" stop-color="${item.bg2}" />
      </linearGradient>
    </defs>
    <rect width="600" height="450" fill="url(#bg)" rx="24"/>
    <circle cx="300" cy="180" r="85" fill="#ffffff" opacity="0.9" />
    <text x="300" y="210" font-size="70" text-anchor="middle">${item.icon}</text>
    <text x="300" y="305" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="bold" fill="#3f2e24" text-anchor="middle">${item.title}</text>
    <text x="300" y="340" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="#881337" text-anchor="middle">${item.subtitle}</text>
    <rect x="170" y="370" width="260" height="36" rx="18" fill="#be185d" />
    <text x="300" y="394" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">LIVE VERIFIED BY ANUJ ❤️</text>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

// ── GET: Fetch all saved gift snaps & live approval states ─────────────────────
export async function GET() {
  if (isServerDateLocked()) {
    return NextResponse.json({
      success: false,
      dateLocked: true,
      message: "Locked until 28 October 2026",
      snaps: {},
      approvals: {},
      allApproved: false,
    });
  }

  const snaps: Record<string, any> = { ...localGetGiftSnaps() };
  const approvals: Record<string, boolean> = { ...localGetGiftApprovals() };

  try {
    const db = getAdminFirestore();
    if (db) {
      // 1. Check system approvals doc
      try {
        const appDoc = await db.collection("system").doc("gift_approvals").get();
        if (appDoc.exists) {
          const appData = appDoc.data() || {};
          PRESET_STEP_IDS.forEach((id) => {
            if (appData[id]) approvals[id] = true;
          });
        }
      } catch {}

      // 2. Check gift_snaps collection
      const snapshot = await db.collection(COLLECTION_NAME).get();
      snapshot.forEach((doc) => {
        const data = doc.data();
        snaps[doc.id] = {
          slotId: data.stepId || doc.id,
          imageUrl: data.imageUrl,
          cloudinaryUrl: data.cloudinaryUrl || null,
          caption: data.caption,
          timestamp: data.timestamp,
          stepNumber: data.stepNumber,
          approved: Boolean(data.approved || approvals[doc.id]),
          verifiedOnLiveVideo: Boolean(data.verifiedOnLiveVideo),
          sharedToWhatsApp: !!data.sharedToWhatsApp,
        };
        if (data.approved) {
          approvals[doc.id] = true;
        }
      });
    }
  } catch (error: any) {
    console.warn("Firestore gift snaps fetch error, returning local store:", error);
  }

  // Populate placeholder verified SVG for any approved step without photo
  PRESET_STEP_IDS.forEach((id) => {
    if (approvals[id] && (!snaps[id] || !snaps[id].imageUrl)) {
      snaps[id] = {
        slotId: id,
        imageUrl: generateVerifiedSvg(id),
        caption: DEFAULT_CAPTIONS[id] || "Approved on Live Video by Anuj ❤️",
        timestamp: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
        stepNumber: Number(id.replace("step-", "")) || 1,
        approved: true,
        verifiedOnLiveVideo: true,
      };
    }
  });

  const allApproved = PRESET_STEP_IDS.every(
    (id) => Boolean(approvals[id] || (snaps[id] && snaps[id].imageUrl))
  );

  return NextResponse.json({
    success: true,
    snaps,
    approvals,
    allApproved,
    count: Object.keys(snaps).length,
  });
}

// ── POST: Admin Approval Actions or Photo Upload ──────────────────────────────
export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const { action, stepId, key } = body;

    // ── A. ADMIN APPROVAL ACTIONS (NO PHOTO REQUIRED) ──
    if (action) {
      const lowerKey = typeof key === "string" ? key.trim().toLowerCase() : "";
      const envAdminKey = (process.env.ADMIN_KEY || "").trim().toLowerCase();
      const isAuthorized =
        lowerKey === "@ritusandhu1983" ||
        (envAdminKey !== "" && lowerKey === envAdminKey);

      if (!isAuthorized) {
        return NextResponse.json(
          { success: false, error: "Unauthorized admin key" },
          { status: 401 }
        );
      }

      const db = getAdminFirestore();

      // 1. APPROVE A SPECIFIC STEP
      if (action === "approve" && stepId) {
        localSaveGiftApproval(stepId, true);

        // Ensure snap entry exists with verified live video badge
        const currentSnaps = localGetGiftSnaps();
        if (!currentSnaps[stepId] || !currentSnaps[stepId].imageUrl) {
          localSaveGiftSnap(stepId, {
            stepId,
            stepNumber: Number(stepId.replace("step-", "")) || 1,
            title: `Step ${stepId.replace("step-", "")}`,
            caption: DEFAULT_CAPTIONS[stepId] || "Approved on Live Video by Anuj ❤️",
            imageUrl: generateVerifiedSvg(stepId),
            approved: true,
            verifiedOnLiveVideo: true,
            timestamp: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
          });
        }

        if (db) {
          try {
            await db.collection("system").doc("gift_approvals").set(
              { [stepId]: true, updatedAt: FieldValue.serverTimestamp() },
              { merge: true }
            );
            await db.collection(COLLECTION_NAME).doc(stepId).set(
              {
                stepId,
                approved: true,
                verifiedOnLiveVideo: true,
                caption: DEFAULT_CAPTIONS[stepId] || "Approved on Live Video by Anuj ❤️",
                imageUrl: generateVerifiedSvg(stepId),
                updatedAt: FieldValue.serverTimestamp(),
              },
              { merge: true }
            );
          } catch {}
        }

        const approvals = localGetGiftApprovals();
        return NextResponse.json({
          success: true,
          action: "approve",
          approvedStep: stepId,
          approvals,
          allApproved: PRESET_STEP_IDS.every((k) => Boolean(approvals[k])),
        });
      }

      // 2. UNAPPROVE / REVOKE A STEP
      if (action === "unapprove" && stepId) {
        localSaveGiftApproval(stepId, false);
        localDeleteGiftSnap(stepId);

        if (db) {
          try {
            await db.collection("system").doc("gift_approvals").set(
              { [stepId]: false, updatedAt: FieldValue.serverTimestamp() },
              { merge: true }
            );
            await db.collection(COLLECTION_NAME).doc(stepId).delete();
          } catch {}
        }

        const approvals = localGetGiftApprovals();
        return NextResponse.json({
          success: true,
          action: "unapprove",
          unapprovedStep: stepId,
          approvals,
          allApproved: false,
        });
      }

      // 3. APPROVE ALL 4 STEPS AT ONCE
      if (action === "approve_all") {
        for (const id of PRESET_STEP_IDS) {
          localSaveGiftApproval(id, true);
          localSaveGiftSnap(id, {
            stepId: id,
            stepNumber: Number(id.replace("step-", "")) || 1,
            title: `Step ${id.replace("step-", "")}`,
            caption: DEFAULT_CAPTIONS[id] || "Approved on Live Video by Anuj ❤️",
            imageUrl: generateVerifiedSvg(id),
            approved: true,
            verifiedOnLiveVideo: true,
            timestamp: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
          });
        }

        if (db) {
          try {
            const batch = db.batch();
            const appRef = db.collection("system").doc("gift_approvals");
            batch.set(
              appRef,
              {
                "step-1": true,
                "step-2": true,
                "step-3": true,
                "step-4": true,
                updatedAt: FieldValue.serverTimestamp(),
              },
              { merge: true }
            );

            for (const id of PRESET_STEP_IDS) {
              const docRef = db.collection(COLLECTION_NAME).doc(id);
              batch.set(
                docRef,
                {
                  stepId: id,
                  approved: true,
                  verifiedOnLiveVideo: true,
                  caption: DEFAULT_CAPTIONS[id] || "Approved on Live Video by Anuj ❤️",
                  imageUrl: generateVerifiedSvg(id),
                  updatedAt: FieldValue.serverTimestamp(),
                },
                { merge: true }
              );
            }
            await batch.commit();
          } catch {}
        }

        return NextResponse.json({
          success: true,
          action: "approve_all",
          approvals: { "step-1": true, "step-2": true, "step-3": true, "step-4": true },
          allApproved: true,
        });
      }

      // 4. RESET ALL APPROVALS (CLEAN SLATE)
      if (action === "reset_approvals") {
        localResetGiftApprovals();
        for (const id of PRESET_STEP_IDS) {
          localDeleteGiftSnap(id);
        }

        if (db) {
          try {
            await db.collection("system").doc("gift_approvals").delete();
            const snap = await db.collection(COLLECTION_NAME).get();
            const batch = db.batch();
            snap.forEach((doc) => batch.delete(doc.ref));
            await batch.commit();
          } catch {}
        }

        return NextResponse.json({
          success: true,
          action: "reset_approvals",
          approvals: {},
          allApproved: false,
        });
      }
    }

    // ── B. OPTIONAL PHOTO UPLOAD (KEEPSAKE SNAPSHOT) ──
    const {
      stepId: uploadStepId,
      stepNumber,
      title,
      caption,
      imageData,
      imageUrl,
      timestamp,
      sharedToWhatsApp = false,
    } = body;

    const rawImage = imageData || imageUrl;

    if (!uploadStepId || !rawImage) {
      return NextResponse.json(
        { success: false, error: "Missing required 'stepId' or 'imageData'" },
        { status: 400 }
      );
    }

    let cloudinaryUrl: string | null = null;
    let finalImageUrl = rawImage;

    try {
      const uploadRes = await uploadToCloudinary(
        rawImage,
        "anshii_birthday_gifts"
      );
      if (uploadRes && uploadRes.url) {
        cloudinaryUrl = uploadRes.url;
        finalImageUrl = uploadRes.url;
      }
    } catch (cErr) {
      console.warn("Cloudinary upload failed or not configured:", cErr);
    }

    localSaveGiftSnap(uploadStepId, {
      stepId: uploadStepId,
      stepNumber: Number(stepNumber) || 1,
      title: title || `Step ${stepNumber}`,
      caption: caption || "",
      imageUrl: finalImageUrl,
      cloudinaryUrl: cloudinaryUrl || null,
      timestamp: timestamp || new Date().toISOString(),
      approved: true, // uploading photo auto-approves as well
      sharedToWhatsApp: !!sharedToWhatsApp,
    });
    localSaveGiftApproval(uploadStepId, true);

    const db = getAdminFirestore();
    if (db) {
      try {
        const docRef = db.collection(COLLECTION_NAME).doc(uploadStepId);
        await docRef.set(
          {
            stepId: uploadStepId,
            stepNumber: Number(stepNumber) || 1,
            title: title || `Step ${stepNumber}`,
            caption: caption || "",
            imageUrl: finalImageUrl,
            cloudinaryUrl: cloudinaryUrl || null,
            timestamp: timestamp || new Date().toISOString(),
            approved: true,
            sharedToWhatsApp: !!sharedToWhatsApp,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      } catch (fErr) {
        console.warn("Firestore document write failed (handled by local store):", fErr);
      }
    }

    return NextResponse.json({
      success: true,
      stepId: uploadStepId,
      imageUrl: finalImageUrl,
      cloudinaryUrl,
      approved: true,
    });
  } catch (err: any) {
    console.error("API error in /api/gift-snaps:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// ── DELETE: Remove gift snap from Firestore ────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stepId = searchParams.get("stepId");

    if (!stepId) {
      return NextResponse.json(
        { success: false, error: "Missing stepId" },
        { status: 400 }
      );
    }

    localDeleteGiftSnap(stepId);

    const db = getAdminFirestore();
    if (db) {
      try {
        await db.collection(COLLECTION_NAME).doc(stepId).delete();
        await db.collection("system").doc("gift_approvals").set(
          { [stepId]: false },
          { merge: true }
        );
      } catch {}
    }

    return NextResponse.json({ success: true, deleted: stepId });
  } catch (error: any) {
    console.error("Error deleting snap:", error);
    return NextResponse.json({ success: true });
  }
}
