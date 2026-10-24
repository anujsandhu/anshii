import { initializeApp, getApps, cert } from "firebase-admin/app";
import type { App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { Firestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

let cachedApp: App | null = null;
let cachedDb: Firestore | null = null;

function getServiceAccount() {
  // 1. Try local service account json file in project root
  const localFilePath = path.join(
    process.cwd(),
    "anshii-52fd5-firebase-adminsdk-fbsvc-90f317816b.json"
  );
  if (fs.existsSync(localFilePath)) {
    try {
      const fileData = fs.readFileSync(localFilePath, "utf8");
      return JSON.parse(fileData);
    } catch (err) {
      console.error("Error reading local Firebase service account file:", err);
    }
  }

  // 2. Try JSON string from environment variable (useful for Vercel deployment)
  const envKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (envKey) {
    try {
      return JSON.parse(envKey);
    } catch {
      try {
        // Handle base64 encoded string
        return JSON.parse(Buffer.from(envKey, "base64").toString("utf8"));
      } catch (err) {
        console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_KEY env var:", err);
      }
    }
  }

  // 3. Try individual env variables
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };
  }

  return null;
}

let quotaCooldownUntil = 0;
let hasLoggedQuotaNotice = false;

export function markFirestoreQuotaExhausted(cooldownMs = 15 * 60 * 1000) {
  quotaCooldownUntil = Date.now() + cooldownMs;
  if (!hasLoggedQuotaNotice) {
    hasLoggedQuotaNotice = true;
    console.log(
      "⚡ [Storage] Firebase free tier quota reached (RESOURCE_EXHAUSTED). Activating local resilient storage (zero-latency localStore). All analytics, sessions, and uploads continue without interruption."
    );
  }
}

export function isFirestoreQuotaExhausted(): boolean {
  if (quotaCooldownUntil > 0) {
    if (Date.now() < quotaCooldownUntil) {
      return true;
    }
    quotaCooldownUntil = 0;
    hasLoggedQuotaNotice = false;
  }
  return false;
}

export function handleFirestoreError(err: any, contextMessage = "Firestore operation") {
  const errMsg = err?.message || String(err || "");
  const errCode = err?.code;
  if (errCode === 8 || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Quota exceeded")) {
    markFirestoreQuotaExhausted();
    return;
  }
  console.warn(`[Firebase] ${contextMessage} notice:`, errMsg);
}

export function getAdminFirestore(): Firestore | null {
  if (isFirestoreQuotaExhausted()) {
    return null;
  }

  if (cachedDb) return cachedDb;

  const existingApps = getApps();
  if (existingApps.length > 0) {
    cachedDb = getFirestore(existingApps[0]);
    return cachedDb;
  }

  const serviceAccount = getServiceAccount();
  if (!serviceAccount) {
    console.warn(
      "Firebase Admin: No credentials found (anshii-52fd5-firebase-adminsdk-fbsvc-90f317816b.json or FIREBASE_SERVICE_ACCOUNT_KEY)."
    );
    return null;
  }

  try {
    cachedApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id || "anshii-52fd5",
    });
    cachedDb = getFirestore(cachedApp);
    return cachedDb;
  } catch (err) {
    console.error("Error initializing Firebase Admin App:", err);
    return null;
  }
}

