import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore, handleFirestoreError } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const maxDuration = 60;

interface SignalState {
  offer: any | null;
  answer: any | null;
  callerCandidates: any[];
  adminCandidates: any[];
  updatedAt: number;
}

let inMemorySignal: SignalState = {
  offer: null,
  answer: null,
  callerCandidates: [],
  adminCandidates: [],
  updatedAt: 0,
};

// ── GET: Retrieve current signaling state for WebRTC handshake ───────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role") || "admin";
  const now = Date.now();

  // If in-memory state is stale (> 30s), check Firestore
  let state = inMemorySignal;
  if (now - state.updatedAt > 30000) {
    const db = getAdminFirestore();
    if (db) {
      try {
        const doc = await db.collection("system").doc("webrtc_signal").get();
        if (doc.exists) {
          state = { ...state, ...(doc.data() as any) };
        }
      } catch (dbErr: any) {
        handleFirestoreError(dbErr, "webrtc-signal fetch");
      }
    }
  }

  return NextResponse.json({
    success: true,
    role,
    offer: state.offer,
    answer: state.answer,
    callerCandidates: state.callerCandidates,
    adminCandidates: state.adminCandidates,
    updatedAt: state.updatedAt,
  });
}

// ── POST: Send SDP offer, answer, or ICE candidate ───────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      type, // "offer" | "answer" | "candidate" | "reset"
      role, // "caller" (her device) | "admin" (your device)
      sdp,
      candidate,
    } = body;

    const now = Date.now();

    if (type === "reset") {
      inMemorySignal = {
        offer: null,
        answer: null,
        callerCandidates: [],
        adminCandidates: [],
        updatedAt: now,
      };
      return NextResponse.json({ success: true, reset: true });
    }

    if (type === "offer" && sdp) {
      inMemorySignal.offer = sdp;
      inMemorySignal.callerCandidates = [];
      inMemorySignal.answer = null;
      inMemorySignal.adminCandidates = [];
      inMemorySignal.updatedAt = now;
    } else if (type === "answer" && sdp) {
      inMemorySignal.answer = sdp;
      inMemorySignal.updatedAt = now;
    } else if (type === "candidate" && candidate) {
      if (role === "caller") {
        inMemorySignal.callerCandidates.push(candidate);
      } else {
        inMemorySignal.adminCandidates.push(candidate);
      }
      inMemorySignal.updatedAt = now;
    }

    // Background sync to Firestore for cross-datacenter signaling
    const db = getAdminFirestore();
    if (db) {
      db.collection("system")
        .doc("webrtc_signal")
        .set(
          {
            offer: inMemorySignal.offer,
            answer: inMemorySignal.answer,
            callerCandidates: inMemorySignal.callerCandidates.slice(-15),
            adminCandidates: inMemorySignal.adminCandidates.slice(-15),
            updatedAt: now,
          },
          { merge: true }
        )
        .catch((err) => handleFirestoreError(err, "webrtc-signal save"));
    }

    return NextResponse.json({ success: true, timestamp: now });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Signaling error" },
      { status: 500 }
    );
  }
}
