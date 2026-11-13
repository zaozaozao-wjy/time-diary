import type { DiaryEntry } from "../types";

const DB_NAME = "little-moments-journal";
const DB_VERSION = 1;
const DIARY_STORE = "diaries";
const ASSET_STORE = "image-assets";

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (databasePromise) return databasePromise;
  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DIARY_STORE)) {
        const store = db.createObjectStore(DIARY_STORE, { keyPath: "id" });
        store.createIndex("date", "date", { unique: false });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }
      if (!db.objectStoreNames.contains(ASSET_STORE)) {
        db.createObjectStore(ASSET_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("无法打开本地日记库"));
  });
  return databasePromise;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("本地数据库操作失败"));
  });
}

export async function loadDiaries(): Promise<DiaryEntry[]> {
  const db = await openDatabase();
  const transaction = db.transaction(DIARY_STORE, "readonly");
  const entries = await requestToPromise(
    transaction.objectStore(DIARY_STORE).getAll() as IDBRequest<DiaryEntry[]>,
  );
  return entries.sort((a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt);
}

export async function saveDiary(entry: DiaryEntry): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction(DIARY_STORE, "readwrite");
  await requestToPromise(transaction.objectStore(DIARY_STORE).put(entry));
}

export async function saveDiaries(entries: DiaryEntry[]): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction(DIARY_STORE, "readwrite");
  const store = transaction.objectStore(DIARY_STORE);
  await Promise.all(entries.map((entry) => requestToPromise(store.put(entry))));
}

export async function removeDiary(id: string): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction(DIARY_STORE, "readwrite");
  await requestToPromise(transaction.objectStore(DIARY_STORE).delete(id));
}

export async function persistImageAsset(id: string, dataUrl: string): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction(ASSET_STORE, "readwrite");
  await requestToPromise(
    transaction.objectStore(ASSET_STORE).put({
      id,
      dataUrl,
      createdAt: Date.now(),
    }),
  );
}

export async function getImageAsset(id: string): Promise<string | undefined> {
  const db = await openDatabase();
  const transaction = db.transaction(ASSET_STORE, "readonly");
  const value = await requestToPromise(
    transaction.objectStore(ASSET_STORE).get(id) as IDBRequest<
      { id: string; dataUrl: string } | undefined
    >,
  );
  return value?.dataUrl;
}
