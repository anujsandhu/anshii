import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebaseAdmin";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { FieldValue } from "firebase-admin/firestore";

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/jpg",
];

// Maximum allowed size: 10 MB
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let imageData: string = "";
    let sessionId: string = "anonymous";
    let page: string = "gift_snaps";
    let caption: string = "";
    let stepId: string = "";
    let fileSizeApprox: number = 0;

    // ── 1. Parse Multipart Form Data or JSON ──
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      sessionId = (formData.get("sessionId") as string) || "anonymous";
      page = (formData.get("page") as string) || "gift_snaps";
      caption = (formData.get("caption") as string) || "";
      stepId = (formData.get("stepId") as string) || "";

      if (!file) {
        return NextResponse.json(
          { success: false, error: "No image file provided." },
          { status: 400 }
        );
      }

      // Validate MIME type
      if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid file type: ${file.type}. Allowed: JPG, PNG, WEBP, GIF, HEIC.`,
          },
          { status: 400 }
        );
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          {
            success: false,
            error: `File size exceeds 10MB limit (size: ${(
              file.size /
              (1024 * 1024)
            ).toFixed(1)}MB).`,
          },
          { status: 400 }
        );
      }

      fileSizeApprox = file.size;
      const buffer = Buffer.from(await file.arrayBuffer());
      imageData = `data:${file.type};base64,${buffer.toString("base64")}`;
    } else {
      // JSON base64
      const body = await req.json().catch(() => ({}));
      imageData = body.imageData || body.imageUrl || "";
      sessionId = body.sessionId || "anonymous";
      page = body.page || "gift_snaps";
      caption = body.caption || "";
      stepId = body.stepId || "";

      if (!imageData) {
        return NextResponse.json(
          { success: false, error: "Missing required 'imageData' base64." },
          { status: 400 }
        );
      }

      // Validate base64 data URL header
      const match = imageData.match(/^data:([^;]+);base64,/);
      if (match) {
        const mime = match[1].toLowerCase();
        if (!ALLOWED_MIME_TYPES.includes(mime)) {
          return NextResponse.json(
            {
              success: false,
              error: `Invalid image type: ${mime}. Allowed: JPG, PNG, WEBP, GIF.`,
            },
            { status: 400 }
          );
        }
      }

      // Calculate approximate byte size from base64
      fileSizeApprox = Math.round((imageData.length * 3) / 4);
      if (fileSizeApprox > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          {
            success: false,
            error: `Image exceeds 10MB limit.`,
          },
          { status: 400 }
        );
      }
    }

    // ── 2. Secure Upload to Cloudinary ──
    const folder = `anshii_birthday_${page.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
    const cloudRes = await uploadToCloudinary(imageData, folder);

    if (!cloudRes || !cloudRes.url) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to upload image to Cloudinary storage.",
        },
        { status: 502 }
      );
    }

    const uploadedAt = new Date().toISOString();
    const uploadId = `up_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    // ── 3. Store Metadata in Firestore (No Image Binaries in Firestore) ──
    const db = getAdminFirestore();
    let firestoreSaved = false;

    if (db) {
      try {
        const uploadDocRef = db.collection("uploads").doc(uploadId);
        await uploadDocRef.set({
          uploadId,
          sessionId,
          cloudinaryPublicId: cloudRes.publicId,
          cloudinaryUrl: cloudRes.url,
          uploadedAt,
          page,
          caption,
          stepId: stepId || null,
          metadata: {
            width: cloudRes.width || null,
            height: cloudRes.height || null,
            format: cloudRes.format || "jpg",
            sizeBytes: cloudRes.bytes || fileSizeApprox,
          },
          createdAt: FieldValue.serverTimestamp(),
        });

        // Also record an image_upload event in the session's event subcollection
        if (sessionId && sessionId !== "anonymous") {
          const eventId = `ev_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 6)}`;
          await db
            .collection("sessions")
            .doc(sessionId)
            .collection("events")
            .doc(eventId)
            .set({
              eventId,
              type: "image_upload",
              timestamp: uploadedAt,
              page,
              elementId: `upload_${stepId || "custom"}`,
              elementText: caption || "Image Upload",
              metadata: {
                uploadId,
                cloudinaryPublicId: cloudRes.publicId,
                format: cloudRes.format,
                sizeBytes: cloudRes.bytes || fileSizeApprox,
              },
            });

          // Update session lastSeenAt & upload count
          await db
            .collection("sessions")
            .doc(sessionId)
            .set(
              {
                lastSeenAt: uploadedAt,
                uploadCount: FieldValue.increment(1),
              },
              { merge: true }
            );
        }

        firestoreSaved = true;
      } catch (fErr) {
        console.error("Firestore upload metadata error:", fErr);
      }
    }

    return NextResponse.json({
      success: true,
      uploadId,
      cloudinaryUrl: cloudRes.url,
      cloudinaryPublicId: cloudRes.publicId,
      uploadedAt,
      page,
      caption,
      metadata: {
        width: cloudRes.width,
        height: cloudRes.height,
        format: cloudRes.format,
        sizeBytes: cloudRes.bytes || fileSizeApprox,
      },
      firestoreSaved,
    });
  } catch (error: any) {
    console.error("Error in /api/upload:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unexpected server upload error.",
      },
      { status: 500 }
    );
  }
}

// ── GET: Retrieve uploads list from Firestore ─────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const db = getAdminFirestore();
    if (!db) {
      return NextResponse.json({ success: true, uploads: [] });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);

    const snapshot = await db
      .collection("uploads")
      .orderBy("uploadedAt", "desc")
      .limit(limit)
      .get();

    const uploads: any[] = [];
    snapshot.forEach((doc) => {
      uploads.push(doc.data());
    });

    return NextResponse.json({
      success: true,
      uploads,
      count: uploads.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
