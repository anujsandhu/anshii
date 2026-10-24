import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebaseAdmin";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { FieldValue } from "firebase-admin/firestore";
import { isServerDateLocked } from "@/lib/dateLock";

const COLLECTION_NAME = "gift_snaps";

// ── GET: Fetch all saved gift snaps from Firestore ─────────────────────────────
import {
  localGetGiftSnaps,
  localSaveGiftSnap,
  localDeleteGiftSnap,
} from "@/lib/localStore";

export async function GET() {
  if (isServerDateLocked()) {
    return NextResponse.json({
      success: false,
      dateLocked: true,
      message: "Locked until 28 October 2026",
      snaps: {},
    });
  }

  const snaps: Record<string, any> = { ...localGetGiftSnaps() };

  try {
    const db = getAdminFirestore();
    if (db) {
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
          sharedToWhatsApp: !!data.sharedToWhatsApp,
        };
      });
    }
  } catch (error: any) {
    console.warn("Firestore gift snaps fetch error, returning local store:", error);
  }

  return NextResponse.json({
    success: true,
    snaps,
    count: Object.keys(snaps).length,
  });
}

// ── POST: Upload to Cloudinary & Save Document in Firestore ────────────────────
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

    const {
      stepId,
      stepNumber,
      title,
      caption,
      imageData,
      imageUrl,
      timestamp,
      sharedToWhatsApp = false,
    } = body;

    const rawImage = imageData || imageUrl;

    if (!stepId || !rawImage) {
      return NextResponse.json(
        { success: false, error: "Missing required 'stepId' or 'imageData'" },
        { status: 400 }
      );
    }

    let cloudinaryUrl: string | null = null;
    let finalImageUrl = rawImage;

    // 1. Try uploading to Cloudinary if credentials are present
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

    // 2. Always persist gift snap to local store
    try {
      localSaveGiftSnap(stepId, {
        stepId,
        stepNumber: Number(stepNumber) || 1,
        title: title || `Step ${stepNumber}`,
        caption: caption || "",
        imageUrl: finalImageUrl,
        cloudinaryUrl: cloudinaryUrl || null,
        timestamp: timestamp || new Date().toISOString(),
        sharedToWhatsApp: !!sharedToWhatsApp,
      });
    } catch (localErr) {
      console.warn("Could not save snap to local store:", localErr);
    }

    // 3. Save / Update in Firestore if available
    let firestoreSaved = false;
    try {
      const db = getAdminFirestore();
      if (db) {
        const docRef = db.collection(COLLECTION_NAME).doc(stepId);
        await docRef.set(
          {
            stepId,
            stepNumber: Number(stepNumber) || 1,
            title: title || `Step ${stepNumber}`,
            caption: caption || "",
            imageUrl: finalImageUrl,
            cloudinaryUrl: cloudinaryUrl || null,
            timestamp: timestamp || new Date().toISOString(),
            sharedToWhatsApp: !!sharedToWhatsApp,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
        firestoreSaved = true;
      }
    } catch (fErr) {
      console.warn("Firestore document write failed (handled by local store):", fErr);
    }

    return NextResponse.json({
      success: true,
      stepId,
      imageUrl: finalImageUrl,
      cloudinaryUrl,
      firestoreSaved,
    });
  } catch (err: any) {
    console.error("API error in /api/gift-snaps:", err);
    return NextResponse.json({
      success: true,
      stepId: "",
      imageUrl: "",
      cloudinaryUrl: null,
      firestoreSaved: false,
    });
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

    // Delete locally
    try {
      localDeleteGiftSnap(stepId);
    } catch {}

    const db = getAdminFirestore();
    if (db) {
      try {
        await db.collection(COLLECTION_NAME).doc(stepId).delete();
      } catch {}
    }

    return NextResponse.json({ success: true, deleted: stepId });
  } catch (error: any) {
    console.error("Error deleting snap:", error);
    return NextResponse.json({ success: true });
  }
}
