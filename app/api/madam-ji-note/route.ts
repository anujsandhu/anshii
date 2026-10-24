import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

const COLLECTION_NAME = "madam_ji_notes";

import { localGetNote, localSaveNote } from "@/lib/localStore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ success: true, answers: null });
    }

    // 1. Try Firestore first
    const db = getAdminFirestore();
    if (db) {
      try {
        const doc = await db.collection(COLLECTION_NAME).doc(sessionId).get();
        if (doc.exists) {
          return NextResponse.json({ success: true, answers: doc.data() });
        }
      } catch (dbErr) {
        console.warn("Firestore note fetch error, falling back to localStore:", dbErr);
      }
    }

    // 2. Fall back to local store
    const local = localGetNote(sessionId);
    if (local && local.answers) {
      return NextResponse.json({ success: true, answers: local.answers });
    }

    return NextResponse.json({ success: true, answers: null });
  } catch (err: any) {
    console.error("GET /api/madam-ji-note error:", err);
    return NextResponse.json({ success: true, answers: null });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { sessionId = "anonymous", answers = {}, note = "" } = body;

    const cleanedAnswers = {
      memory: answers.memory || (typeof note === "string" ? note : ""),
      bond: answers.bond || "",
      futureMessage: answers.futureMessage || "",
      anythingSecret: answers.anythingSecret || "",
    };

    // 1. Always save to local store
    try {
      localSaveNote(sessionId, cleanedAnswers);
    } catch (localErr) {
      console.warn("Could not save note to local store:", localErr);
    }

    // 2. Also save to Firestore if available
    const db = getAdminFirestore();
    let firestoreSaved = false;

    if (db) {
      try {
        const docRef = db.collection(COLLECTION_NAME).doc(sessionId);
        await docRef.set(
          {
            sessionId,
            answers: cleanedAnswers,
            updatedAt: FieldValue.serverTimestamp(),
            lastModified: new Date().toISOString(),
          },
          { merge: true }
        );

        // Also record timeline event in session
        if (sessionId && sessionId !== "anonymous") {
          const eventId = `ev_note_${Date.now()}`;
          await db
            .collection("sessions")
            .doc(sessionId)
            .collection("events")
            .doc(eventId)
            .set({
              eventId,
              type: "madam_ji_note",
              timestamp: new Date().toISOString(),
              page: "grand_finale",
              metadata: {
                hasMemory: Boolean(cleanedAnswers.memory?.trim()),
                hasBond: Boolean(cleanedAnswers.bond?.trim()),
                hasFutureMessage: Boolean(cleanedAnswers.futureMessage?.trim()),
                hasSecret: Boolean(cleanedAnswers.anythingSecret?.trim()),
              },
            });
        }

        firestoreSaved = true;
      } catch (dbErr) {
        console.warn("Firestore note write error (handled by local store):", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      firestoreSaved,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("POST /api/madam-ji-note error:", err);
    return NextResponse.json({
      success: true,
      firestoreSaved: false,
      updatedAt: new Date().toISOString(),
    });
  }
}
