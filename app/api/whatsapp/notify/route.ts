import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const targetNumber = process.env.WHATSAPP_TO_NUMBER || "918278710552";
    const token =
      process.env.WHATSAPP_ACCESS_TOKEN ||
      process.env.WHATSAPP_CLOUD_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const apiVersion = process.env.WHATSAPP_API_VERSION || "v21.0";

    // Format timestamp: "Oct 1, 2026, 11:32 AM"
    const now = new Date();
    const timestamp = new Intl.DateTimeFormat("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }).format(now);

    // Exact required message format:
    // “Someone just opened the private page and clicked the WhatsApp button — [timestamp]”
    const message = `Someone just opened the private page and clicked the WhatsApp button — ${timestamp}`;
    const directUrl = `https://wa.me/${targetNumber}?text=${encodeURIComponent(
      message
    )}`;

    let sentViaApi = false;
    let apiError: string | null = null;

    // 1. Attempt official WhatsApp Cloud API if credentials are configured
    if (token && phoneNumberId) {
      try {
        const cloudUrl = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
        const res = await fetch(cloudUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: targetNumber,
            type: "text",
            text: {
              preview_url: false,
              body: message,
            },
          }),
        });

        const data = await res.json();
        if (res.ok && data.messages?.[0]?.id) {
          sentViaApi = true;
        } else {
          apiError = data.error?.message || "WhatsApp Cloud API rejected request";
          console.warn("WhatsApp Cloud API notification error:", data);
        }
      } catch (err: any) {
        apiError = err.message || "Failed to reach WhatsApp Cloud API";
        console.warn("WhatsApp Cloud API fetch exception:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message,
      timestamp,
      targetNumber: "+91 8278710552",
      directUrl,
      sentViaApi,
      apiStatus: sentViaApi ? "sent_via_cloud_api" : "fallback_ready",
      apiError,
    });
  } catch (error: any) {
    console.error("Error in /api/whatsapp/notify:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate WhatsApp notification",
      },
      { status: 500 }
    );
  }
}
