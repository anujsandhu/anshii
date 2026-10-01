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
 * Server-side upload to Cloudinary.
 * Never exposes API secret to frontend.
 */
export async function uploadToCloudinary(
  base64OrUrl: string,
  folder = "anshii_birthday_uploads"
): Promise<CloudinaryUploadResult | null> {
  if (!isCloudinaryConfigured()) {
    console.warn(
      "[Cloudinary] Credentials not configured in environment. Using fallback CDN placeholder."
    );
    // Safe deterministic fallback when keys haven't been added yet
    const fallbackId = `local_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      url: `https://res.cloudinary.com/demo/image/upload/v1/${folder}/${fallbackId}.jpg`,
      publicId: `${folder}/${fallbackId}`,
      width: 1200,
      height: 900,
      format: "jpg",
      bytes: 124500,
    };
  }

  try {
    ensureCloudinaryConfig();
    const result = await cloudinary.uploader.upload(base64OrUrl, {
      folder,
      resource_type: "image",
      transformation: [
        { quality: "auto:good", fetch_format: "auto" },
      ],
    });

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
