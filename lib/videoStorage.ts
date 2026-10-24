/**
 * IndexedDB Local Video Vault for 100% Offline Resilience
 * Keeps all video chunks saved locally on client device so network loss never drops recordings.
 */

const DB_NAME = "AnshiiVideoBackupVault";
const DB_VERSION = 1;
const STORE_NAME = "reaction_chunks";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not available in current environment"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function storeVideoChunkInDB(
  sessionId: string,
  chunk: Blob,
  timestamp: number
): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    store.add({
      sessionId,
      chunk,
      timestamp,
    });

    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve(); // Non-blocking failure
    });
  } catch (err) {
    // Fail silently, memory array remains primary
  }
}

export async function getAllStoredChunksFromDB(
  sessionId: string
): Promise<Blob[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const records = request.result || [];
        const filtered = records
          .filter((r: any) => r.sessionId === sessionId)
          .sort((a: any, b: any) => a.timestamp - b.timestamp)
          .map((r: any) => r.chunk as Blob);
        resolve(filtered);
      };
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}
