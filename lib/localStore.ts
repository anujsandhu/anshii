import fs from "fs";
import path from "path";

export interface LocalSession {
  sessionId: string;
  startedAt: string;
  lastSeenAt: string;
  endedAt?: string | null;
  duration?: number;
  device?: string;
  browser?: string;
  pagesVisited?: string[];
  eventCount?: number;
  uploadCount?: number;
  loginCount?: number;
  isUnlocked?: boolean;
  role?: string;
  userName?: string;
  isTester?: boolean;
  latestLiveVideo?: string;
  latestSlide?: string;
}

export interface LocalEvent {
  eventId: string;
  sessionId: string;
  type: string;
  timestamp: string;
  page?: string;
  elementId?: string;
  elementText?: string;
  metadata?: Record<string, any>;
}

export interface LocalUpload {
  uploadId: string;
  sessionId: string;
  cloudinaryPublicId: string;
  cloudinaryUrl: string;
  uploadedAt: string;
  page: string;
  slide?: string;
  type: "video" | "image";
  caption?: string;
  metadata?: Record<string, any>;
}

export interface LocalLogin {
  loginId: string;
  sessionId: string;
  timestamp: string;
  device?: string;
  browser?: string;
  passwordUsed?: string;
  role?: string;
  userName?: string;
}

interface LocalStoreSchema {
  sessions: Record<string, LocalSession>;
  events: Record<string, LocalEvent[]>; // keyed by sessionId
  uploads: LocalUpload[];
  logins: LocalLogin[];
  notes: Record<string, any>;
  giftSnaps: Record<string, any>;
  giftApprovals?: Record<string, boolean>;
  liveMonitor: {
    sessionId?: string;
    activeNow?: boolean;
    lastUpdated?: string;
    slide?: string;
    latestLiveVideo?: string;
  } | null;
}

import os from "os";

function getStoreFilePath(): string {
  const localPath = path.join(process.cwd(), "data", "localAnalytics.json");
  try {
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // Actively test write capability to detect serverless read-only filesystems (e.g. Vercel)
    const testFile = path.join(dir, `.test_w_${process.pid || 1}`);
    fs.writeFileSync(testFile, "ok");
    fs.unlinkSync(testFile);
    return localPath;
  } catch {
    // Fall back to os.tmpdir() for serverless / read-only filesystems (e.g. Vercel)
    const tmpDir = path.join(os.tmpdir(), "anshii_data");
    if (!fs.existsSync(tmpDir)) {
      try {
        fs.mkdirSync(tmpDir, { recursive: true });
      } catch {}
    }
    const tmpPath = path.join(tmpDir, "localAnalytics.json");
    if (!fs.existsSync(tmpPath) && fs.existsSync(localPath)) {
      try {
        fs.copyFileSync(localPath, tmpPath);
      } catch {}
    }
    return tmpPath;
  }
}

let memoryStore: LocalStoreSchema | null = null;

function readStore(): LocalStoreSchema {
  const storePath = getStoreFilePath();
  let diskData: Partial<LocalStoreSchema> = {};
  try {
    if (fs.existsSync(storePath)) {
      const raw = fs.readFileSync(storePath, "utf8");
      diskData = JSON.parse(raw);
    }
  } catch {}

  const merged: LocalStoreSchema = {
    sessions: { ...(memoryStore?.sessions || {}), ...(diskData.sessions || {}) },
    events: { ...(memoryStore?.events || {}), ...(diskData.events || {}) },
    uploads: [...(diskData.uploads || memoryStore?.uploads || [])],
    logins: [...(diskData.logins || memoryStore?.logins || [])],
    notes: { ...(memoryStore?.notes || {}), ...(diskData.notes || {}) },
    giftSnaps: { ...(memoryStore?.giftSnaps || {}), ...(diskData.giftSnaps || {}) },
    giftApprovals: { ...(memoryStore?.giftApprovals || {}), ...(diskData.giftApprovals || {}) },
    liveMonitor: diskData.liveMonitor || memoryStore?.liveMonitor || null,
  };

  memoryStore = merged;
  return merged;
}

function writeStore(data: LocalStoreSchema) {
  memoryStore = JSON.parse(JSON.stringify(data));
  const storePath = getStoreFilePath();
  try {
    const dir = path.dirname(storePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(storePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    try {
      const fallbackDir = path.join(os.tmpdir(), "anshii_data");
      if (!fs.existsSync(fallbackDir)) {
        fs.mkdirSync(fallbackDir, { recursive: true });
      }
      const fallbackPath = path.join(fallbackDir, "localAnalytics.json");
      fs.writeFileSync(fallbackPath, JSON.stringify(data, null, 2), "utf8");
    } catch {}
  }
}

// ── Sessions ─────────────────────────────────────────────────────────────────
export function localSaveSession(sess: Partial<LocalSession> & { sessionId: string }) {
  const store = readStore();
  const existing = store.sessions[sess.sessionId] || {
    sessionId: sess.sessionId,
    startedAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
    pagesVisited: [],
    eventCount: 0,
    uploadCount: 0,
  };

  const updated: LocalSession = {
    ...existing,
    ...sess,
    lastSeenAt: sess.lastSeenAt || new Date().toISOString(),
    pagesVisited: Array.from(
      new Set([...(existing.pagesVisited || []), ...(sess.pagesVisited || [])])
    ),
  };

  store.sessions[sess.sessionId] = updated;
  writeStore(store);
  return updated;
}

export function localGetSession(sessionId: string): LocalSession | null {
  const store = readStore();
  return store.sessions[sessionId] || null;
}

export function localGetAllSessions(): LocalSession[] {
  const store = readStore();
  return Object.values(store.sessions).sort(
    (a, b) =>
      new Date(b.lastSeenAt || b.startedAt).getTime() -
      new Date(a.lastSeenAt || a.startedAt).getTime()
  );
}

// ── Events ───────────────────────────────────────────────────────────────────
export function localSaveEvent(event: LocalEvent) {
  const store = readStore();
  if (!store.events[event.sessionId]) {
    store.events[event.sessionId] = [];
  }
  // Avoid duplicate eventId
  const list = store.events[event.sessionId];
  if (!list.some((e) => e.eventId === event.eventId)) {
    list.push(event);
  }

  // Update session event count
  if (store.sessions[event.sessionId]) {
    store.sessions[event.sessionId].eventCount =
      (store.sessions[event.sessionId].eventCount || 0) + 1;
    store.sessions[event.sessionId].lastSeenAt = event.timestamp;
    if (event.page) {
      const set = new Set(store.sessions[event.sessionId].pagesVisited || []);
      set.add(event.page);
      store.sessions[event.sessionId].pagesVisited = Array.from(set);
    }
  }

  writeStore(store);
}

export function localGetSessionEvents(sessionId: string): LocalEvent[] {
  const store = readStore();
  return (store.events[sessionId] || []).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

// ── Uploads (Videos) ─────────────────────────────────────────────────────────
export function localSaveUpload(upload: LocalUpload) {
  const store = readStore();
  // Filter only exact duplicate uploadId: NEVER delete or overwrite earlier reaction clips!
  // Every reaction video recorded throughout her visit is permanently preserved.
  store.uploads = store.uploads.filter((u) => u.uploadId !== upload.uploadId);
  store.uploads.unshift(upload);

  if (store.sessions[upload.sessionId]) {
    store.sessions[upload.sessionId].uploadCount =
      (store.sessions[upload.sessionId].uploadCount || 0) + 1;
    store.sessions[upload.sessionId].latestLiveVideo = upload.cloudinaryUrl;
    store.sessions[upload.sessionId].lastSeenAt = upload.uploadedAt;
    if (upload.slide) {
      store.sessions[upload.sessionId].latestSlide = upload.slide;
    }
  }

  writeStore(store);
}

export function localGetAllUploads(): LocalUpload[] {
  const store = readStore();
  return store.uploads.sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
}

// ── Logins ───────────────────────────────────────────────────────────────────
export function localSaveLogin(login: LocalLogin) {
  const store = readStore();
  store.logins = store.logins.filter((l) => l.loginId !== login.loginId);
  store.logins.unshift(login);
  writeStore(store);
}

export function localGetAllLogins(): LocalLogin[] {
  const store = readStore();
  return store.logins.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// ── Live Monitor ─────────────────────────────────────────────────────────────
export function localSetLiveMonitor(data: {
  sessionId?: string;
  activeNow?: boolean;
  lastUpdated?: string;
  slide?: string;
  latestLiveVideo?: string;
}) {
  const store = readStore();
  store.liveMonitor = {
    ...store.liveMonitor,
    ...data,
  };
  writeStore(store);
}

export function localGetLiveMonitor() {
  const store = readStore();
  return store.liveMonitor;
}

// ── Notes (Madam Ji Keepsake) ────────────────────────────────────────────────
export function localSaveNote(sessionId: string, answers: any) {
  const store = readStore();
  store.notes[sessionId] = {
    sessionId,
    answers,
    lastModified: new Date().toISOString(),
  };
  writeStore(store);
}

export function localGetNote(sessionId: string) {
  const store = readStore();
  return store.notes[sessionId] || null;
}

// ── Gift Snaps ───────────────────────────────────────────────────────────────
export function localSaveGiftSnap(stepId: string, snapData: any) {
  const store = readStore();
  store.giftSnaps[stepId] = {
    ...snapData,
    stepId,
    timestamp: snapData.timestamp || new Date().toISOString(),
  };
  writeStore(store);
}

export function localGetGiftSnaps(): Record<string, any> {
  const store = readStore();
  return store.giftSnaps || {};
}

export function localDeleteGiftSnap(stepId: string) {
  const store = readStore();
  delete store.giftSnaps[stepId];
  if (store.giftApprovals) {
    delete store.giftApprovals[stepId];
  }
  writeStore(store);
}

// ── Gift Approvals (Live Video Verification by Admin) ────────────────────────
export function localGetGiftApprovals(): Record<string, boolean> {
  const store = readStore();
  return store.giftApprovals || {};
}

export function localSaveGiftApproval(stepId: string, approved: boolean) {
  const store = readStore();
  if (!store.giftApprovals) store.giftApprovals = {};
  store.giftApprovals[stepId] = approved;
  writeStore(store);
}

export function localResetGiftApprovals() {
  const store = readStore();
  store.giftApprovals = {};
  writeStore(store);
}

// ── Reset Interactive Task State (Guarantees Reaction Videos & Logins are NEVER Deleted) ──
export function localResetAll() {
  const current = readStore();
  const cleanStore: LocalStoreSchema = {
    sessions: current.sessions || {},
    events: current.events || {},
    uploads: current.uploads || [], // PERMANENT: NEVER delete reaction recordings!
    logins: current.logins || [],   // PERMANENT: NEVER delete visitor audit logs!
    notes: {},
    giftSnaps: {},
    giftApprovals: {},
    liveMonitor: current.liveMonitor,
  };
  writeStore(cleanStore);
}
