import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  getShareableImage,
  generateWhatsAppCaption,
  formatWhatsAppTimestamp,
  TARGET_WHATSAPP_CONFIG,
} from "@/data/whatsappImages";

// Rate limiting in-memory store (sliding window per client IP)
// 5 requests per 10 minutes
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const ipRequestHistory = new Map<string, number[]>();

// Duplicate click protection (10 seconds cooldown per image per IP)
const DUPLICATE_COOLDOWN_MS = 10 * 1000;
const recentSubmissions = new Map<string, number>();

// Clean up stale rate-limiting entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of ipRequestHistory.entries()) {
    const valid = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (valid.length === 0) {
      ipRequestHistory.delete(ip);
    } else {
      ipRequestHistory.set(ip, valid);
    }
  }

  for (const [key, timestamp] of recentSubmissions.entries()) {
    if (now - timestamp > DUPLICATE_COOLDOWN_MS) {
      recentSubmissions.delete(key);
    }
  }
}, 60 * 1000);

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const now = Date.now();

    // ── 1. AUTHENTICATION & SAME-ORIGIN CHECK ──
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");

    if (origin && host) {
      const originHost = origin.replace(/^https?:\/\//, "");
      // In production or local, origin must match host
      if (!originHost.startsWith(host)) {
        return NextResponse.json(
          {
            success: false,
            error: "Unauthorized request origin. Cross-origin requests are blocked.",
          },
          { status: 403 }
        );
      }
    }

    // Optional API secret header check if configured
    const expectedSecret = process.env.WHATSAPP_API_SECRET;
    if (expectedSecret) {
      const clientSecret = req.headers.get("x-api-secret");
      if (clientSecret !== expectedSecret) {
        return NextResponse.json(
          { success: false, error: "Invalid API authorization secret." },
          { status: 401 }
        );
      }
    }

    // ── 2. RATE LIMITING ──
    const clientTimestamps = ipRequestHistory.get(clientIp) || [];
    const validTimestamps = clientTimestamps.filter(
      (t) => now - t < RATE_LIMIT_WINDOW_MS
    );

    if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
      const oldest = validTimestamps[0];
      const waitSeconds = Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: `Rate limit reached. Please wait ${waitSeconds}s before sharing another image.`,
          retryAfter: waitSeconds,
        },
        { status: 429, headers: { "Retry-After": waitSeconds.toString() } }
      );
    }

    // ── 3. PAYLOAD PARSING & VALIDATION ──
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request payload." },
        { status: 400 }
      );
    }

    const { imageId } = body;
    if (!imageId || typeof imageId !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid 'imageId' parameter." },
        { status: 400 }
      );
    }

    // ── 4. DUPLICATE-CLICK PROTECTION ──
    const dedupKey = `${clientIp}:${imageId}`;
    const lastSentTime = recentSubmissions.get(dedupKey);
    if (lastSentTime && now - lastSentTime < DUPLICATE_COOLDOWN_MS) {
      const remainingSeconds = Math.ceil(
        (lastSentTime + DUPLICATE_COOLDOWN_MS - now) / 1000
      );
      return NextResponse.json(
        {
          success: false,
          error: `This image was just sent! Please wait ${remainingSeconds}s before sending again.`,
          isDuplicate: true,
        },
        { status: 429 }
      );
    }

    // ── 5. EXPLICIT IMAGE WHITELIST & CONFIGURATION VALIDATION ──
    const imageConfig = getShareableImage(imageId);
    if (!imageConfig || !imageConfig.allowWhatsAppShare) {
      return NextResponse.json(
        {
          success: false,
          error: "This image is not authorized or configured for WhatsApp sharing.",
        },
        { status: 400 }
      );
    }

    // ── 6. SERVER-SIDE FILE & SIZE VALIDATION ──
    // Verify file exists in public/ folder, check size and MIME
    const publicFilePath = path.join(process.cwd(), "public", imageConfig.src);
    try {
      if (fs.existsSync(publicFilePath)) {
        const stats = fs.statSync(publicFilePath);
        if (stats.size > imageConfig.maxSizeBytes) {
          return NextResponse.json(
            {
              success: false,
              error: `Image size exceeds the maximum allowed limit of ${Math.round(
                imageConfig.maxSizeBytes / (1024 * 1024)
              )}MB.`,
            },
            { status: 400 }
          );
        }
      }
    } catch (fsErr) {
      console.warn("Could not check local file stats:", fsErr);
    }

    // ── 7. RESOLVE PUBLIC MEDIA URL & CAPTION ──
    const proto = req.headers.get("x-forwarded-proto") || "http";
    const hostHeader = req.headers.get("host") || "localhost:3000";
    const appBaseUrl =
      process.env.APP_BASE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      `${proto}://${hostHeader}`;

    // Ensure media link is absolute for WhatsApp Cloud API
    const mediaUrl = `${appBaseUrl.replace(/\/$/, "")}${imageConfig.src}`;

    const timestampStr = formatWhatsAppTimestamp(new Date());
    const caption = generateWhatsAppCaption(
      imageConfig.title,
      imageConfig.pageName,
      timestampStr
    );

    // Target recipient phone number (Default: Anuj's +91 8278710552)
    const targetRecipient =
      process.env.WHATSAPP_TO_NUMBER || TARGET_WHATSAPP_CONFIG.rawNumber;

    // Fallback wa.me URL in case user wants direct chat or if API is in sandbox
    const fallbackUrl = `https://wa.me/${targetRecipient}?text=${encodeURIComponent(
      caption + "\n\n" + mediaUrl
    )}`;

    // ── 8. OFFICIAL WHATSAPP CLOUD API INTEGRATION ──
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const apiVersion = process.env.WHATSAPP_API_VERSION || "v21.0";

    // Record submission for rate limiting and dedup
    validTimestamps.push(now);
    ipRequestHistory.set(clientIp, validTimestamps);
    recentSubmissions.set(dedupKey, now);

    if (accessToken && phoneNumberId) {
      // Production Meta WhatsApp Cloud API call
      const cloudApiUrl = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

      const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: targetRecipient,
        type: "image",
        image: {
          link: mediaUrl,
          caption: caption,
        },
      };

      const metaResponse = await fetch(cloudApiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const metaData = await metaResponse.json();

      if (!metaResponse.ok) {
        console.error("Meta WhatsApp Cloud API Error:", {
          status: metaResponse.status,
          error: metaData.error?.message,
        });

        return NextResponse.json(
          {
            success: false,
            error:
              metaData.error?.message ||
              "WhatsApp Cloud API could not deliver the media. Please check configuration or try again.",
            fallbackUrl,
          },
          { status: 502 }
        );
      }

      const messageId = metaData.messages?.[0]?.id || "wamid.success";

      return NextResponse.json({
        success: true,
        mode: "official_cloud_api",
        messageId,
        recipient: targetRecipient,
        caption,
        mediaUrl,
        timestamp: timestampStr,
      });
    }

    // ── 9. PREVIEW / DEMO SIMULATION MODE ──
    // If WHATSAPP_ACCESS_TOKEN is not yet set in .env.local, provide a graceful,
    // working preview mode that documents how to activate production Meta Cloud API.
    return NextResponse.json({
      success: true,
      mode: "preview_simulation",
      messageId: `wamid.sim_${Date.now()}`,
      recipient: targetRecipient,
      caption,
      mediaUrl,
      timestamp: timestampStr,
      fallbackUrl,
      note: "Image successfully processed for WhatsApp. To enable direct live delivery through Meta WhatsApp Business Cloud API, add WHATSAPP_ACCESS_TOKEN & WHATSAPP_PHONE_NUMBER_ID to .env.local",
    });
  } catch (err: any) {
    console.error("Internal WhatsApp Share API Error:", err);
    return NextResponse.json(
      {
        success: false,
        error:
          "Internal server error occurred while processing image for WhatsApp.",
      },
      { status: 500 }
    );
  }
}
