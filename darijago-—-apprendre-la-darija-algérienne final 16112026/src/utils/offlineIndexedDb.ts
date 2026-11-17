import type { AppLanguage, LearningModule } from '../types/darija';
import type { UnifiedDictionaryEntry } from './unifiedDictionaryLogic';
import {
  DARIJA_AUDIO_CACHE_NAME,
  buildAudioCacheKeyUrl,
  getBrowserCacheStorage,
} from './audioCacheStorage';
import { formatBenSediraLatinForSpeech } from './darijaSpeechFormat';
import {
  OFFLINE_BUNDLE_VERSION,
  OFFLINE_DB_NAME,
  OFFLINE_DB_VERSION,
  OFFLINE_MODE_STORAGE_KEY,
  OFFLINE_STORE_AUDIO,
  OFFLINE_STORE_DICTIONARY,
  OFFLINE_STORE_LESSONS,
  OFFLINE_STORE_META,
  buildOfflineAudioClipKey,
  buildOfflineDictionaryRecords,
  buildOfflineLessonRecords,
  createEmptyOfflinePackStatus,
  estimatePayloadByteLength,
  type OfflineAudioRecord,
  type OfflineDictionaryRecord,
  type OfflineDownloadProgress,
  type OfflineLessonRecord,
  type OfflinePackMetadata,
} from './offlinePackLogic';
import {
  findStaticYasmineClip,
  loadYasmineStaticManifest,
  type YasmineStaticManifest,
} from './yasmineStaticManifest';

export const OFFLINE_STATUS_UPDATED_EVENT = 'darijago:offline-status-updated';

function notifyOfflineStatusUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(OFFLINE_STATUS_UPDATED_EVENT));
}

export function isOfflineModeEnabledSync(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(OFFLINE_MODE_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function persistOfflineModeFlag(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (enabled) {
      window.localStorage.setItem(OFFLINE_MODE_STORAGE_KEY, '1');
    } else {
      window.localStorage.removeItem(OFFLINE_MODE_STORAGE_KEY);
    }
  } catch {
    // ignore storage quota errors
  }
}

export function openOfflineDatabase(
  customIndexedDb?: IDBFactory | null
): Promise<IDBDatabase | null> {
  const idb =
    customIndexedDb !== undefined
      ? customIndexedDb
      : typeof window !== 'undefined' && 'indexedDB' in window
        ? window.indexedDB
        : typeof indexedDB !== 'undefined'
          ? indexedDB
          : null;

  if (!idb) return Promise.resolve(null);

  return new Promise((resolve) => {
    try {
      const request = idb.open(OFFLINE_DB_NAME, OFFLINE_DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(OFFLINE_STORE_LESSONS)) {
          db.createObjectStore(OFFLINE_STORE_LESSONS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(OFFLINE_STORE_DICTIONARY)) {
          db.createObjectStore(OFFLINE_STORE_DICTIONARY, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(OFFLINE_STORE_AUDIO)) {
          db.createObjectStore(OFFLINE_STORE_AUDIO, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(OFFLINE_STORE_META)) {
          db.createObjectStore(OFFLINE_STORE_META, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function idbGet<T>(db: IDBDatabase, storeName: string, key: IDBValidKey): Promise<T | null> {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as T | undefined) ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function idbGetAll<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as T[]) ?? []);
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

function idbCount(db: IDBDatabase, storeName: string): Promise<number> {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.count();
      req.onsuccess = () => resolve(req.result ?? 0);
      req.onerror = () => resolve(0);
    } catch {
      resolve(0);
    }
  });
}

function idbPutBatch<T>(
  db: IDBDatabase,
  storeName: string,
  items: T[]
): Promise<boolean> {
  if (items.length === 0) return Promise.resolve(true);
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      for (const item of items) {
        store.put(item);
      }
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

function idbClearStores(db: IDBDatabase, storeNames: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeNames, 'readwrite');
      for (const name of storeNames) {
        tx.objectStore(name).clear();
      }
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function getOfflinePackStatus(
  language: AppLanguage = 'fr',
  customIndexedDb?: IDBFactory | null
): Promise<OfflinePackMetadata> {
  const flagEnabled = isOfflineModeEnabledSync();
  const db = await openOfflineDatabase(customIndexedDb);
  if (!db) {
    return createEmptyOfflinePackStatus(language, flagEnabled);
  }

  try {
    const meta = await idbGet<OfflinePackMetadata>(
      db,
      OFFLINE_STORE_META,
      'pack-status'
    );
    const liveAudioCount = await idbCount(db, OFFLINE_STORE_AUDIO);
    if (!meta) {
      return {
        ...createEmptyOfflinePackStatus(language, flagEnabled),
        audioClipsCount: liveAudioCount,
      };
    }
    return {
      ...meta,
      audioClipsCount: Math.max(meta.audioClipsCount, liveAudioCount),
      offlineModeEnabled: Boolean(meta.offlineModeEnabled || flagEnabled),
    };
  } finally {
    db.close();
  }
}

export async function setOfflineModeEnabled(
  enabled: boolean,
  language: AppLanguage = 'fr',
  customIndexedDb?: IDBFactory | null
): Promise<OfflinePackMetadata> {
  persistOfflineModeFlag(enabled);
  const db = await openOfflineDatabase(customIndexedDb);
  if (!db) {
    notifyOfflineStatusUpdated();
    return createEmptyOfflinePackStatus(language, enabled);
  }

  try {
    const existing = await idbGet<OfflinePackMetadata>(
      db,
      OFFLINE_STORE_META,
      'pack-status'
    );
    const next: OfflinePackMetadata = existing
      ? { ...existing, offlineModeEnabled: enabled }
      : createEmptyOfflinePackStatus(language, enabled);
    await idbPutBatch(db, OFFLINE_STORE_META, [next]);
    notifyOfflineStatusUpdated();
    return next;
  } finally {
    db.close();
  }
}

export async function readOfflineLessonsFromIndexedDb(
  language: AppLanguage,
  customIndexedDb?: IDBFactory | null
): Promise<LearningModule[] | null> {
  const db = await openOfflineDatabase(customIndexedDb);
  if (!db) return null;
  try {
    const records = await idbGetAll<OfflineLessonRecord>(db, OFFLINE_STORE_LESSONS);
    const modules = records
      .filter(
        (r): r is Extract<OfflineLessonRecord, { kind: 'module' }> =>
          r.kind === 'module' && r.language === language
      )
      .map((r) => r.module);
    if (modules.length === 0) return null;
    modules.sort((a, b) => Number(a.number) - Number(b.number));
    return modules;
  } finally {
    db.close();
  }
}

export async function readOfflineDictionaryFromIndexedDb(
  language: AppLanguage,
  customIndexedDb?: IDBFactory | null
): Promise<UnifiedDictionaryEntry[] | null> {
  const db = await openOfflineDatabase(customIndexedDb);
  if (!db) return null;
  try {
    const records = await idbGetAll<OfflineDictionaryRecord>(
      db,
      OFFLINE_STORE_DICTIONARY
    );
    const matching = records
      .filter((r) => r.language === language)
      .map((r) => r.entry);
    return matching.length > 0 ? matching : null;
  } finally {
    db.close();
  }
}

export async function saveAudioBlobToIndexedDb(
  opts: {
    textArabic: string;
    textLatin: string;
    slow?: boolean;
  },
  blob: Blob,
  source: 'yasmine-static' | 'gemini-cache' = 'yasmine-static',
  customIndexedDb?: IDBFactory | null
): Promise<boolean> {
  if (!blob || blob.size === 0) return false;
  const db = await openOfflineDatabase(customIndexedDb);
  if (!db) return false;

  try {
    const key = buildOfflineAudioClipKey(opts);
    const record: OfflineAudioRecord = {
      key,
      ar: opts.textArabic.trim(),
      lat: formatBenSediraLatinForSpeech(opts.textLatin),
      speed: opts.slow ? 'slow' : 'normal',
      voiceName: 'Kore',
      mimeType: blob.type || 'audio/mpeg',
      blob,
      sizeBytes: blob.size,
      source,
      savedAt: new Date().toISOString(),
    };
    const ok = await idbPutBatch(db, OFFLINE_STORE_AUDIO, [record]);
    if (ok) {
      notifyOfflineStatusUpdated();
    }
    return ok;
  } finally {
    db.close();
  }
}

export async function readAudioBlobFromIndexedDb(
  opts: {
    textArabic: string;
    textLatin: string;
    slow?: boolean;
  },
  customIndexedDb?: IDBFactory | null
): Promise<{ blob: Blob; playbackRate: number } | null> {
  const db = await openOfflineDatabase(customIndexedDb);
  if (!db) return null;

  try {
    const exactKey = buildOfflineAudioClipKey(opts);
    const exactRecord = await idbGet<OfflineAudioRecord>(
      db,
      OFFLINE_STORE_AUDIO,
      exactKey
    );
    if (exactRecord?.blob && exactRecord.blob.size > 0) {
      return { blob: exactRecord.blob, playbackRate: 1 };
    }

    if (opts.slow) {
      const normalKey = buildOfflineAudioClipKey({
        ...opts,
        slow: false,
      });
      const normalRecord = await idbGet<OfflineAudioRecord>(
        db,
        OFFLINE_STORE_AUDIO,
        normalKey
      );
      if (normalRecord?.blob && normalRecord.blob.size > 0) {
        return { blob: normalRecord.blob, playbackRate: 0.74 };
      }
    }

    return null;
  } finally {
    db.close();
  }
}

async function importCacheStorageClipsIntoIndexedDb(
  db: IDBDatabase
): Promise<{ imported: number; bytes: number }> {
  const storage = getBrowserCacheStorage();
  if (!storage) return { imported: 0, bytes: 0 };

  try {
    const cache = await storage.open(DARIJA_AUDIO_CACHE_NAME);
    const requests = await cache.keys();
    let imported = 0;
    let bytes = 0;
    const records: OfflineAudioRecord[] = [];

    for (const req of requests) {
      try {
        const url = new URL(req.url);
        const ar = url.searchParams.get('ar') ?? '';
        const lat = url.searchParams.get('lat') ?? '';
        const speed = url.searchParams.get('speed') === 'slow' ? 'slow' : 'normal';
        const resp = await cache.match(req);
        if (!resp || !resp.ok) continue;
        const blob = await resp.blob();
        if (!blob || blob.size === 0) continue;

        records.push({
          key: buildOfflineAudioClipKey({
            textArabic: ar,
            textLatin: lat,
            slow: speed === 'slow',
          }),
          ar: ar.trim(),
          lat: formatBenSediraLatinForSpeech(lat),
          speed,
          voiceName: 'Kore',
          mimeType: blob.type || 'audio/wav',
          blob,
          sizeBytes: blob.size,
          source: 'gemini-cache',
          savedAt: new Date().toISOString(),
        });
        imported += 1;
        bytes += blob.size;
      } catch {
        // skip invalid cache entry
      }
    }

    if (records.length > 0) {
      await idbPutBatch(db, OFFLINE_STORE_AUDIO, records);
    }
    return { imported, bytes };
  } catch {
    return { imported: 0, bytes: 0 };
  }
}

export async function downloadOfflinePackToIndexedDb(
  language: AppLanguage,
  onProgress?: (progress: OfflineDownloadProgress) => void,
  customIndexedDb?: IDBFactory | null
): Promise<OfflinePackMetadata> {
  const db = await openOfflineDatabase(customIndexedDb);
  if (!db) {
    throw new Error('IndexedDB is not available in this browser.');
  }

  try {
    // 1. Store core lessons, sounds & stories
    const lessonsPayload = buildOfflineLessonRecords(language);
    onProgress?.({
      stage: 'lessons',
      percent: 10,
      current: 0,
      total: lessonsPayload.records.length,
      detail: `${lessonsPayload.modulesCount} modules · ${lessonsPayload.phrasesCount} phrases`,
    });
    await idbPutBatch(db, OFFLINE_STORE_LESSONS, lessonsPayload.records);
    const lessonsBytes = estimatePayloadByteLength(lessonsPayload.records);

    // 2. Store full dictionary in responsive batches
    const dictRecords = buildOfflineDictionaryRecords(language);
    const DICT_BATCH = 600;
    for (let i = 0; i < dictRecords.length; i += DICT_BATCH) {
      const slice = dictRecords.slice(i, i + DICT_BATCH);
      await idbPutBatch(db, OFFLINE_STORE_DICTIONARY, slice);
      const done = Math.min(dictRecords.length, i + slice.length);
      onProgress?.({
        stage: 'dictionary',
        percent: 15 + Math.round((done / Math.max(1, dictRecords.length)) * 45),
        current: done,
        total: dictRecords.length,
        detail: `${done} / ${dictRecords.length}`,
      });
    }
    const dictBytes = estimatePayloadByteLength(dictRecords);

    // 3. Download bundled static Yasmine (Kore) audio clips without calling Gemini API
    let audioBytes = 0;
    let manifest: YasmineStaticManifest | null = null;
    try {
      manifest = await loadYasmineStaticManifest(true);
    } catch {
      manifest = null;
    }

    const staticClips = manifest?.clips ?? [];
    for (let i = 0; i < staticClips.length; i++) {
      const clip = staticClips[i];
      try {
        const resp = await fetch(clip.file, { method: 'GET' });
        if (resp.ok) {
          const blob = await resp.blob();
          if (blob.size > 0) {
            const record: OfflineAudioRecord = {
              key: buildOfflineAudioClipKey({
                textArabic: clip.ar,
                textLatin: clip.lat,
                slow: clip.speed === 'slow',
              }),
              ar: clip.ar,
              lat: clip.lat,
              speed: clip.speed,
              voiceName: 'Kore',
              mimeType: clip.mimeType || blob.type || 'audio/mpeg',
              blob,
              sizeBytes: blob.size,
              source: 'yasmine-static',
              savedAt: new Date().toISOString(),
            };
            await idbPutBatch(db, OFFLINE_STORE_AUDIO, [record]);
            audioBytes += blob.size;
          }
        }
      } catch {
        // continue downloading remaining static clips
      }
      onProgress?.({
        stage: 'audio',
        percent:
          60 + Math.round(((i + 1) / Math.max(1, staticClips.length)) * 32),
        current: i + 1,
        total: staticClips.length,
        detail: `${i + 1} / ${staticClips.length}`,
      });
    }

    // Mirror any CacheStorage Gemini clips already earned earlier into IndexedDB
    const mirrored = await importCacheStorageClipsIntoIndexedDb(db);
    audioBytes += mirrored.bytes;

    // 4. Finalize metadata record
    const allAudioRecords = await idbGetAll<OfflineAudioRecord>(
      db,
      OFFLINE_STORE_AUDIO
    );
    const actualAudioBytes = allAudioRecords.reduce(
      (sum, rec) => sum + (rec.sizeBytes || rec.blob?.size || 0),
      0
    );

    const metadata: OfflinePackMetadata = {
      id: 'pack-status',
      bundleVersion: OFFLINE_BUNDLE_VERSION,
      language,
      downloadedAt: new Date().toISOString(),
      modulesCount: lessonsPayload.modulesCount,
      phrasesCount: lessonsPayload.phrasesCount,
      soundsCount: lessonsPayload.soundsCount,
      storiesCount: lessonsPayload.storiesCount,
      dictionaryCount: dictRecords.length,
      audioClipsCount: allAudioRecords.length,
      audioTargetsCount: manifest?.totalTargets ?? allAudioRecords.length,
      totalBytes: lessonsBytes + dictBytes + Math.max(audioBytes, actualAudioBytes),
      offlineModeEnabled: true,
    };

    persistOfflineModeFlag(true);
    await idbPutBatch(db, OFFLINE_STORE_META, [metadata]);

    onProgress?.({
      stage: 'finalizing',
      percent: 100,
      current: 1,
      total: 1,
      detail: 'OK',
    });

    notifyOfflineStatusUpdated();
    return metadata;
  } finally {
    db.close();
  }
}

export async function clearOfflineIndexedDb(
  language: AppLanguage = 'fr',
  customIndexedDb?: IDBFactory | null
): Promise<OfflinePackMetadata> {
  persistOfflineModeFlag(false);
  const db = await openOfflineDatabase(customIndexedDb);
  if (db) {
    try {
      await idbClearStores(db, [
        OFFLINE_STORE_LESSONS,
        OFFLINE_STORE_DICTIONARY,
        OFFLINE_STORE_AUDIO,
        OFFLINE_STORE_META,
      ]);
    } finally {
      db.close();
    }
  }
  notifyOfflineStatusUpdated();
  return createEmptyOfflinePackStatus(language, false);
}

export async function resolveBundledYasmineUrlFromManifest(opts: {
  textArabic: string;
  textLatin: string;
  slow?: boolean;
}): Promise<{ url: string; playbackRate: number } | null> {
  const manifest = await loadYasmineStaticManifest();
  const matched = findStaticYasmineClip(manifest, opts);
  if (!matched) return null;
  return {
    url: matched.clip.file,
    playbackRate: matched.playbackRate,
  };
}

export async function cacheCanonicalClipInIndexedDbAndStorage(
  opts: {
    textArabic: string;
    textLatin: string;
    slow?: boolean;
  },
  blob: Blob,
  source: 'yasmine-static' | 'gemini-cache'
): Promise<void> {
  await saveAudioBlobToIndexedDb(opts, blob, source);
  const storage = getBrowserCacheStorage();
  if (!storage) return;
  try {
    const cache = await storage.open(DARIJA_AUDIO_CACHE_NAME);
    const cacheUrl = buildAudioCacheKeyUrl({
      textArabic: opts.textArabic,
      textLatin: opts.textLatin,
      slow: opts.slow,
      voiceName: 'Kore',
    });
    const resp = new Response(blob, {
      status: 200,
      headers: {
        'Content-Type': blob.type || 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
    await cache.put(cacheUrl, resp);
  } catch {
    // non-fatal
  }
}
