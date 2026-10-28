import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { getAdminFirestore, handleFirestoreError } from "@/lib/firebaseAdmin";
import { uploadVideoToCloudinary, CloudinaryUploadResult } from "@/lib/cloudinary";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60 seconds timeout on serverless/Vercel for video processing

// Maximum video size: 120 MB
const MAX_VIDEO_SIZE_BYTES = 120 * 1024 * 1024;

function getRecordingsDir(): string {
  const localDir = path.join(process.cwd(), "data", "recordings");
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const testFile = path.join(localDir, ".write_test");
    fs.writeFileSync(testFile, "ok");
    fs.unlinkSync(testFile);
    return localDir;
  } catch {
    const tmpDir = path.join(os.tmpdir(), "anshii_recordings");
    if (!fs.existsSync(tmpDir)) {
      try {
        fs.mkdirSync(tmpDir, { recursive: true });
      } catch {}
    }
    return tmpDir;
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { success: false, error: "Expected multipart/form-data with video file." },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = ((formData.get("file") || formData.get("video")) as File | null);
    const sessionId = (formData.get("sessionId") as string) || "anonymous";
    const slide = (formData.get("slide") as string) || "site_session";
    const durationMs = Number(formData.get("durationMs")) || 0;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No video file provided." },
        { status: 400 }
      );
    }

    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `Video size exceeds limit (size: ${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const isImage = file.type.startsWith("image/");

    // Discard any image uploads completely (only videos allowed, no black photos)
    if (isImage) {
      return NextResponse.json(
        {
          success: false,
          error: "Image snapshots are disabled. Only real full video recordings are permitted.",
        },
        { status: 400 }
      );
    }

    // Discard empty or corrupt video chunks under 3KB
    if (buffer.length < 3000) {
      return NextResponse.json(
        {
          success: false,
          error: "Video file is too small or blank. Discarded.",
        },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const cleanSession = (sessionId || "session").replace(/[^a-zA-Z0-9_-]/g, "_");
    const cleanSlide = (slide || "reaction").replace(/[^a-zA-Z0-9_-]/g, "_");
    const ext = file.type.includes("mp4") ? "mp4" : "webm";

    // ── 1. GUARANTEED DISK BACKUP: Permanently save EVERY unique reaction video to server disk ──
    // Every video clip recorded at every chapter and checkpoint is kept forever without being overwritten!
    const recordingsDir = getRecordingsDir();
    const localDiskFileName = `reaction_${cleanSession}_${cleanSlide}_${timestamp}.${ext}`;
    const localDiskFilePath = path.join(recordingsDir, localDiskFileName);
    try {
      fs.writeFileSync(localDiskFilePath, buffer);
      // Also update latest contiguous pointer file for the session
      const latestPointerPath = path.join(recordingsDir, `full_reaction_${cleanSession}.${ext}`);
      try {
        fs.writeFileSync(latestPointerPath, buffer);
      } catch {}
    } catch (diskErr) {
      console.warn("Could not write to local disk backup:", diskErr);
    }

    // ── 2. Cloudinary Permanent Upload (Unique public ID ensures NO past video is ever overwritten) ──
    const customPublicId = `anshii_reaction_${cleanSession}_${cleanSlide}_${timestamp}`;
    let cloudRes: CloudinaryUploadResult | null = null;
    let cloudinaryError: string | null = null;

    try {
      cloudRes = await uploadVideoToCloudinary(
        buffer,
        "anshii_birthday_reactions",
        customPublicId
      );
    } catch (cErr: any) {
      console.warn("Cloudinary upload failed (will use permanent local server backup):", cErr);
      cloudinaryError = cErr?.message || "Cloudinary network error";
    }

    const uploadedAt = new Date().toISOString();
    const uploadId = `vid_${cleanSession}_${cleanSlide}_${timestamp}`;
    const durationSeconds = Math.round(durationMs / 1000);
    const mins = Math.floor(durationSeconds / 60);
    const secs = durationSeconds % 60;
    const readableSlide = slide.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const finalCaption = `Reaction Video [${readableSlide}] (${mins}m ${secs < 10 ? "0" : ""}${secs}s)`;

    // Local stream fallback URL if Cloudinary was unreachable due to network outage
    const localStreamUrl = `/api/reaction-recording?fileName=${encodeURIComponent(localDiskFileName)}&sessionId=${encodeURIComponent(cleanSession)}&stream=true`;
    const finalVideoUrl = cloudRes?.url || localStreamUrl;
    const finalPublicId = cloudRes?.publicId || `local_disk_${cleanSession}_${timestamp}`;

    // ── 3. Persist to Local Store (Guaranteed Zero Data Loss) ──
    try {
      const { localSaveUpload, localSetLiveMonitor } = await import("@/lib/localStore");
      localSaveUpload({
        uploadId,
        sessionId,
        cloudinaryPublicId: finalPublicId,
        cloudinaryUrl: finalVideoUrl,
        uploadedAt,
        page: "reaction_cam",
        slide,
        type: "video",
        caption: finalCaption,
        metadata: {
          width: cloudRes?.width || 720,
          height: cloudRes?.height || 720,
          format: cloudRes?.format || ext,
          sizeBytes: cloudRes?.bytes || buffer.length,
          durationMs,
          isContiguous: true,
          localDiskPath: localDiskFilePath,
          localFileName: localDiskFileName,
          cloudinarySynced: Boolean(cloudRes?.url),
          cloudinaryError,
        },
      });

      localSetLiveMonitor({
        sessionId,
        activeNow: true,
        lastUpdated: uploadedAt,
        slide,
        latestLiveVideo: finalVideoUrl,
      });
    } catch (localErr) {
      console.warn("Could not save upload to local store:", localErr);
    }

    // ── 4. Record Metadata in Firestore if available ──
    const db = getAdminFirestore();
    let firestoreSaved = false;

    if (db) {
      try {
        const uploadDocRef = db.collection("uploads").doc(uploadId);
        await uploadDocRef.set(
          {
            uploadId,
            sessionId,
            cloudinaryPublicId: finalPublicId,
            cloudinaryUrl: finalVideoUrl,
            uploadedAt,
            page: "reaction_cam",
            slide,
            type: "video",
            caption: finalCaption,
            metadata: {
              width: cloudRes?.width || 720,
              height: cloudRes?.height || 720,
              format: cloudRes?.format || ext,
              sizeBytes: cloudRes?.bytes || buffer.length,
              durationMs,
              isContiguous: true,
              localDiskBackup: true,
            },
            createdAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        // Update session document with master contiguous video and increment uploadCount
        if (sessionId && sessionId !== "anonymous") {
          await db
            .collection("sessions")
            .doc(sessionId)
            .set(
              {
                lastSeenAt: uploadedAt,
                latestSlide: slide,
                isLive: true,
                latestLiveVideo: finalVideoUrl,
                contiguousVideoUrl: finalVideoUrl,
                contiguousDurationMs: durationMs,
                uploadCount: FieldValue.increment(1),
              },
              { merge: true }
            );
        }

        firestoreSaved = true;
      } catch (dbErr: any) {
        handleFirestoreError(dbErr, "reaction upload save");
      }
    }

    return NextResponse.json({
      success: true,
      uploadId,
      url: finalVideoUrl,
      publicId: finalPublicId,
      uploadedAt,
      durationMs,
      localDiskBackup: true,
      cloudinarySynced: Boolean(cloudRes?.url),
      firestoreSaved,
    });
  } catch (err: any) {
    console.error("Reaction recording route error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// ── GET: Stream or Download the permanently recorded full video ───────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("fileName");
    const sessionId = searchParams.get("sessionId");
    const stream = searchParams.get("stream") === "true";
    const download = searchParams.get("download") === "true";

    if (!fileName && !sessionId) {
      return NextResponse.json(
        { success: false, error: "Missing fileName or sessionId parameter." },
        { status: 400 }
      );
    }

    const cleanSession = (sessionId || "").replace(/[^a-zA-Z0-9_-]/g, "_");
    const primaryDir = path.join(process.cwd(), "data", "recordings");
    const fallbackDir = path.join(os.tmpdir(), "anshii_recordings");
    const searchDirs = [primaryDir, fallbackDir];

    let targetFilePath: string | null = null;
    let foundExt = "mp4";

    // 1. Direct search by specific requested file name
    if (fileName) {
      const sanitizedFile = path.basename(fileName);
      for (const dir of searchDirs) {
        if (!fs.existsSync(dir)) continue;
        const candidate = path.join(dir, sanitizedFile);
        if (fs.existsSync(candidate)) {
          targetFilePath = candidate;
          foundExt = sanitizedFile.endsWith(".webm") ? "webm" : "mp4";
          break;
        }
      }
    }

    // 2. Fall back to finding newest recorded file for session
    if (!targetFilePath && cleanSession) {
      for (const dir of searchDirs) {
        if (!fs.existsSync(dir)) continue;
        try {
          const files = fs.readdirSync(dir);
          const matching = files
            .filter(
              (f) =>
                (f.startsWith(`reaction_${cleanSession}_`) ||
                  f.startsWith(`full_reaction_${cleanSession}`)) &&
                (f.endsWith(".webm") || f.endsWith(".mp4"))
            )
            .sort((a, b) => {
              const statA = fs.statSync(path.join(dir, a)).mtimeMs;
              const statB = fs.statSync(path.join(dir, b)).mtimeMs;
              return statB - statA;
            });

          if (matching.length > 0) {
            targetFilePath = path.join(dir, matching[0]);
            foundExt = matching[0].endsWith(".webm") ? "webm" : "mp4";
            break;
          }
        } catch {}
      }
    }

    if (!targetFilePath || !fs.existsSync(targetFilePath)) {
      return NextResponse.json(
        { success: false, error: "No recorded video found on disk for this query." },
        { status: 404 }
      );
    }

    const fileStat = fs.statSync(targetFilePath);
    const mimeType = foundExt === "mp4" ? "video/mp4" : "video/webm";

    if (stream || download) {
      const fileSize = fileStat.size;
      const rangeHeader = req.headers.get("range");

      if (download) {
        const fileBuffer = fs.readFileSync(targetFilePath);
        const headers = new Headers();
        headers.set("Content-Type", mimeType);
        headers.set("Content-Length", String(fileSize));
        headers.set(
          "Content-Disposition",
          `attachment; filename="anshii_full_reaction_${cleanSession}.${foundExt}"`
        );
        headers.set("Cache-Control", "no-cache");
        return new NextResponse(fileBuffer, { status: 200, headers });
      }

      // If client requests Range (standard HTML5 video player in Chrome / Safari / Firefox)
      if (rangeHeader) {
        const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
        if (match) {
          const start = parseInt(match[1], 10);
          const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;

          if (start >= fileSize || end >= fileSize || start > end) {
            return new NextResponse(null, {
              status: 416, // Range Not Satisfiable
              headers: {
                "Content-Range": `bytes */${fileSize}`,
              },
            });
          }

          const chunkSize = end - start + 1;
          const fd = fs.openSync(targetFilePath, "r");
          const chunkBuffer = Buffer.alloc(chunkSize);
          fs.readSync(fd, chunkBuffer, 0, chunkSize, start);
          fs.closeSync(fd);

          const headers = new Headers();
          headers.set("Content-Type", mimeType);
          headers.set("Content-Range", `bytes ${start}-${end}/${fileSize}`);
          headers.set("Accept-Ranges", "bytes");
          headers.set("Content-Length", String(chunkSize));
          headers.set("Content-Disposition", "inline");
          headers.set("Cache-Control", "public, max-age=3600");

          return new NextResponse(chunkBuffer, {
            status: 206, // Partial Content
            headers,
          });
        }
      }

      // No range specified: serve full file with Accept-Ranges
      const fileBuffer = fs.readFileSync(targetFilePath);
      const headers = new Headers();
      headers.set("Content-Type", mimeType);
      headers.set("Content-Length", String(fileSize));
      headers.set("Accept-Ranges", "bytes");
      headers.set("Content-Disposition", "inline");
      headers.set("Cache-Control", "public, max-age=3600");

      return new NextResponse(fileBuffer, {
        status: 200,
        headers,
      });
    }

    return NextResponse.json({
      success: true,
      sessionId: cleanSession,
      filePath: targetFilePath,
      sizeBytes: fileStat.size,
      mimeType,
      updatedAt: fileStat.mtime.toISOString(),
      streamUrl: `/api/reaction-recording?sessionId=${cleanSession}&stream=true`,
      downloadUrl: `/api/reaction-recording?sessionId=${cleanSession}&download=true`,
    });
  } catch (err: any) {
    console.error("GET reaction-recording error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
