import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore, handleFirestoreError } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const maxDuration = 60;

export interface LiveMessage {
  id: string;
  text: string;
  emojis: string[];
  sender: string;
  timestamp: number;
  audioUrl?: string;
  audioDuration?: number;
}

// In-memory ring buffer (retained for rapid cross-device delivery)
let messageBuffer: LiveMessage[] = [];

// ── GET: Fetch live messages dispatched since timestamp ───────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sinceParam = searchParams.get("since");
  const since = sinceParam ? parseInt(sinceParam, 10) : 0;
  const now = Date.now();

  // Filter messages newer than the client's last seen timestamp
  // If since is 0 or invalid, only return messages from the last 15 seconds
  const cutoff = since > 0 ? since : now - 15000;
  let newMessages = messageBuffer.filter((m) => m.timestamp > cutoff);

  // If in-memory is empty but client has a recent since timestamp, check Firestore fallback
  if (newMessages.length === 0 && now - cutoff < 60000) {
    const db = getAdminFirestore();
    if (db) {
      try {
        const doc = await db.collection("system").doc("live_messages").get();
        if (doc.exists) {
          const data = doc.data();
          const remoteList: LiveMessage[] = data?.recentMessages || [];
          newMessages = remoteList.filter((m) => m.timestamp > cutoff);
        }
      } catch (dbErr: any) {
        handleFirestoreError(dbErr, "live-message fetch");
      }
    }
  }

  const res = NextResponse.json({
    success: true,
    messages: newMessages,
    serverTime: now,
  });

  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.headers.set("Pragma", "no-cache");
  return res;
}

// ── POST: Send a live message & floating emojis to her screen ────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      text = "",
      emojis = [],
      sender = "Anuj",
      key = "",
      audioUrl = "",
      audioDuration = 0,
    } = body;

    const trimmedText = typeof text === "string" ? text.trim() : "";
    const validEmojis = Array.isArray(emojis)
      ? emojis.filter((e) => typeof e === "string" && e.length > 0)
      : [];
    const validAudioUrl =
      typeof audioUrl === "string" && (audioUrl.startsWith("data:audio") || audioUrl.startsWith("http"))
        ? audioUrl
        : undefined;

    if (!trimmedText && validEmojis.length === 0 && !validAudioUrl) {
      return NextResponse.json(
        { success: false, error: "Please provide a message, voice note, or emojis" },
        { status: 400 }
      );
    }

    const now = Date.now();
    const defaultEmojis = validAudioUrl ? ["🎙️", "💌", "💖", "✨"] : [];
    const newMessage: LiveMessage = {
      id: `msg_${now}_${Math.random().toString(36).substring(2, 7)}`,
      text: trimmedText || (validAudioUrl ? "🎙️ Voice message from Anuj" : ""),
      emojis: validEmojis.length > 0 ? validEmojis : defaultEmojis,
      sender: typeof sender === "string" && sender.trim() ? sender.trim() : "Anuj",
      timestamp: now,
      ...(validAudioUrl
        ? {
            audioUrl: validAudioUrl,
            audioDuration: typeof audioDuration === "number" ? audioDuration : 0,
          }
        : {}),
    };

    // Keep the last 30 messages in memory ring buffer
    messageBuffer.push(newMessage);
    if (messageBuffer.length > 30) {
      messageBuffer = messageBuffer.slice(-30);
    }

    // Persist to Firestore for serverless & cross-instance delivery
    const db = getAdminFirestore();
    if (db) {
      db.collection("system")
        .doc("live_messages")
        .set(
          {
            lastMessage: newMessage,
            recentMessages: messageBuffer.slice(-15),
            updatedAt: now,
          },
          { merge: true }
        )
        .catch((err) => handleFirestoreError(err, "live-message save"));
    }

    return NextResponse.json({
      success: true,
      message: newMessage,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to dispatch live message" },
      { status: 500 }
    );
  }
}
