import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebaseAdmin";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { FieldValue } from "firebase-admin/firestore";

const COLLECTION_NAME = "gift_snaps";

// ── GET: Fetch all saved gift snaps from Firestore ─────────────────────────────
export async function GET() {
  try {
    const db = getAdminFirestore();
    if (!db) {
      return NextResponse.json({
        success: false,
        message: "Firestore not configured on server",
        snaps: {},
      });
    }

    const snapshot = await db.collection(COLLECTION_NAME).get();
    const snaps: Record<string, any> = {};

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

    return NextResponse.json({
      success: true,
      snaps,
      count: Object.keys(snaps).length,
    });
  } catch (error: any) {
    console.error("Error fetching gift snaps from Firestore:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch snaps" },
      { status: 500 }
    );
  }
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

    // 2. Save / Update in Firestore
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
      console.error("Firestore document write failed:", fErr);
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
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process gift snap" },
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

    const db = getAdminFirestore();
    if (db) {
      await db.collection(COLLECTION_NAME).doc(stepId).delete();
    }

    return NextResponse.json({ success: true, deleted: stepId });
  } catch (error: any) {
    console.error("Error deleting snap from Firestore:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
