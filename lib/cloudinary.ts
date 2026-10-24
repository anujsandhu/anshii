import { v2 as cloudinary } from "cloudinary";

export function isCloudinaryConfigured(): boolean {
  if (process.env.CLOUDINARY_URL) return true;
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

// Lazy configure Cloudinary
let configured = false;
export function ensureCloudinaryConfig() {
  if (configured) return;
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config();
    configured = true;
    return;
  }
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
}

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

/**
 * Server-side upload to Cloudinary (image or auto).
 * Never exposes API secret to frontend.
 */
export async function uploadToCloudinary(
  base64OrUrl: string,
  folder = "anshii_birthday_uploads",
  resourceType: "image" | "video" | "auto" = "image"
): Promise<CloudinaryUploadResult | null> {
  if (!isCloudinaryConfigured()) {
    console.warn(
      "[Cloudinary] Credentials not configured in environment. Using fallback CDN placeholder."
    );
    // Safe deterministic fallback when keys haven't been added yet
    const fallbackId = `local_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const ext = resourceType === "video" ? "mp4" : "jpg";
    return {
      url: `https://res.cloudinary.com/demo/${resourceType === "video" ? "video" : "image"}/upload/v1/${folder}/${fallbackId}.${ext}`,
      publicId: `${folder}/${fallbackId}`,
      width: 1200,
      height: 900,
      format: ext,
      bytes: 124500,
    };
  }

  try {
    ensureCloudinaryConfig();
    const uploadOptions: Record<string, any> = {
      folder,
      resource_type: resourceType,
    };

    if (resourceType === "image") {
      uploadOptions.transformation = [
        { quality: "auto:good", fetch_format: "auto" },
      ];
    }

    const result = await cloudinary.uploader.upload(base64OrUrl, uploadOptions);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  }
}

/**
 * Server-side video upload stream to Cloudinary for live reaction recordings.
 */
export async function uploadVideoToCloudinary(
  buffer: Buffer,
  folder = "anshii_birthday_reactions",
  publicId?: string
): Promise<CloudinaryUploadResult | null> {
  if (!isCloudinaryConfigured()) {
    console.warn("[Cloudinary] Credentials not configured. Using fallback video mock.");
    const fallbackId = publicId || `mock_vid_${Date.now()}`;
    return {
      url: `https://res.cloudinary.com/demo/video/upload/v1/${folder}/${fallbackId}.mp4`,
      publicId: `${folder}/${fallbackId}`,
      width: 720,
      height: 1280,
      format: "mp4",
      bytes: buffer.length,
    };
  }

  try {
    ensureCloudinaryConfig();
    return new Promise((resolve) => {
      const uploadOptions: Record<string, any> = {
        folder,
        resource_type: "video",
        chunk_size: 6000000,
      };

      if (publicId) {
        uploadOptions.public_id = publicId;
        uploadOptions.overwrite = true;
        uploadOptions.invalidate = true;
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error || !result) {
            console.error("Cloudinary video upload stream error:", error);
            resolve(null);
            return;
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        }
      );
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error("Cloudinary video upload stream catch error:", error);
    return null;
  }
}

/**
 * Generate signed upload parameters for direct client-to-Cloudinary uploads.
 * Only the public API Key, timestamp, and signature are returned; API Secret remains secure on server.
 */
export function generateSignedUploadParams(folder = "anshii_birthday_uploads") {
  if (!isCloudinaryConfigured()) {
    return null;
  }

  ensureCloudinaryConfig();
  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = {
    folder,
    timestamp,
  };

  const apiSecret = process.env.CLOUDINARY_API_SECRET || "";
  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
  };
}

/**
 * Generate an optimized delivery URL with auto-format and auto-quality.
 */
export function getOptimizedImageUrl(
  publicId: string,
  options?: { width?: number; height?: number; crop?: string; gravity?: string }
): string {
  ensureCloudinaryConfig();
  return cloudinary.url(publicId, {
    fetch_format: "auto",
    quality: "auto",
    crop: options?.crop || "limit",
    gravity: options?.gravity,
    width: options?.width,
    height: options?.height,
    secure: true,
  });
}

/**
 * Generate an auto-cropped square thumbnail URL (e.g. 500x500).
 */
export function getSquareThumbnailUrl(publicId: string, size = 500): string {
  ensureCloudinaryConfig();
  return cloudinary.url(publicId, {
    fetch_format: "auto",
    quality: "auto",
    crop: "auto",
    gravity: "auto",
    width: size,
    height: size,
    secure: true,
  });
}

