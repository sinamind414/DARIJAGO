import type { VerbConjugationIndexItem } from './conjugationLogic';
import {
  formatBenSediraLatinForSpeech,
  type NativeSpeakerVoice,
} from './darijaSpeechFormat';

export const DARIJA_AUDIO_CACHE_NAME = 'darijago-verb-audio-v1';

export interface AudioClipDescriptor {
  textArabic: string;
  textLatin: string;
  slow?: boolean;
  voiceName?: NativeSpeakerVoice;
}

export interface CacheLike {
  match(request: RequestInfo | URL): Promise<Response | undefined>;
  put(request: RequestInfo | URL, response: Response): Promise<void>;
  delete(request: RequestInfo | URL): Promise<boolean>;
  keys(): Promise<readonly Request[]>;
}

export interface CacheStorageLike {
  open(cacheName: string): Promise<CacheLike>;
  delete(cacheName: string): Promise<boolean>;
}

export function getBrowserCacheStorage(
  customStorage?: CacheStorageLike | null
): CacheStorageLike | null {
  if (customStorage !== undefined) {
    return customStorage;
  }
  if (typeof window !== 'undefined' && 'caches' in window && window.caches) {
    return window.caches as unknown as CacheStorageLike;
  }
  if (typeof caches !== 'undefined' && caches) {
    return caches as unknown as CacheStorageLike;
  }
  return null;
}

/**
 * Builds a canonical GET URL used both as the live audio clip endpoint
 * and as the deterministic Cache API key.
 */
export function buildAudioCacheKeyUrl(
  opts: AudioClipDescriptor,
  origin?: string
): string {
  const baseOrigin =
    origin ??
    (typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://darijago.local');

  const url = new URL('/api/tts/clip', baseOrigin);
  url.searchParams.set('v', '1');
  url.searchParams.set('voice', opts.voiceName ?? 'Kore');
  url.searchParams.set('speed', opts.slow ? 'slow' : 'normal');
  url.searchParams.set('ar', opts.textArabic.trim());
  url.searchParams.set('lat', formatBenSediraLatinForSpeech(opts.textLatin));
  return url.toString();
}

export function base64ToAudioBytes(base64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function readAudioBlobFromCache(
  opts: AudioClipDescriptor,
  customStorage?: CacheStorageLike | null,
  origin?: string
): Promise<Blob | null> {
  const storage = getBrowserCacheStorage(customStorage);
  if (!storage) return null;

  try {
    const cache = await storage.open(DARIJA_AUDIO_CACHE_NAME);
    const cacheUrl = buildAudioCacheKeyUrl(opts, origin);
    const match = await cache.match(cacheUrl);
    if (!match || !match.ok) return null;

    const blob = await match.blob();
    if (!blob || blob.size === 0) return null;
    return blob;
  } catch {
    return null;
  }
}

export async function writeAudioResponseToCache(
  opts: AudioClipDescriptor,
  response: Response,
  customStorage?: CacheStorageLike | null,
  origin?: string
): Promise<boolean> {
  const storage = getBrowserCacheStorage(customStorage);
  if (!storage || !response.ok) return false;

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.startsWith('audio/') && !contentType.includes('octet-stream')) {
    return false;
  }

  try {
    const cache = await storage.open(DARIJA_AUDIO_CACHE_NAME);
    const cacheUrl = buildAudioCacheKeyUrl(opts, origin);
    await cache.put(cacheUrl, response.clone());
    return true;
  } catch {
    return false;
  }
}

export async function writeAudioBase64ToCache(
  opts: AudioClipDescriptor & {
    audioBase64: string;
    mimeType?: string;
  },
  customStorage?: CacheStorageLike | null,
  origin?: string
): Promise<boolean> {
  const storage = getBrowserCacheStorage(customStorage);
  if (!storage || !opts.audioBase64) return false;

  try {
    const bytes = base64ToAudioBytes(opts.audioBase64);
    const mimeType = opts.mimeType || 'audio/wav';
    const buffer = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength
    ) as ArrayBuffer;
    const response = new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Darija-Offline': '1',
      },
    });
    const cache = await storage.open(DARIJA_AUDIO_CACHE_NAME);
    const cacheUrl = buildAudioCacheKeyUrl(opts, origin);
    await cache.put(cacheUrl, response);
    return true;
  } catch {
    return false;
  }
}

export async function hasAudioClipInCache(
  opts: AudioClipDescriptor,
  customStorage?: CacheStorageLike | null,
  origin?: string
): Promise<boolean> {
  const storage = getBrowserCacheStorage(customStorage);
  if (!storage) return false;

  try {
    const cache = await storage.open(DARIJA_AUDIO_CACHE_NAME);
    const cacheUrl = buildAudioCacheKeyUrl(opts, origin);
    const match = await cache.match(cacheUrl);
    return Boolean(match && match.ok);
  } catch {
    return false;
  }
}

export async function countClipsCacheStatus(
  clips: AudioClipDescriptor[],
  customStorage?: CacheStorageLike | null,
  origin?: string
): Promise<{
  cached: number;
  total: number;
  missing: AudioClipDescriptor[];
}> {
  const deduped = deduplicateClips(clips);
  const storage = getBrowserCacheStorage(customStorage);
  if (!storage || deduped.length === 0) {
    return { cached: 0, total: deduped.length, missing: deduped };
  }

  try {
    const cache = await storage.open(DARIJA_AUDIO_CACHE_NAME);
    const existingKeys = await cache.keys();
    const cachedUrlSet = new Set(existingKeys.map((req) => req.url));

    const missing: AudioClipDescriptor[] = [];
    let cached = 0;

    for (const clip of deduped) {
      const url = buildAudioCacheKeyUrl(clip, origin);
      if (cachedUrlSet.has(url)) {
        cached += 1;
      } else {
        missing.push(clip);
      }
    }

    return {
      cached,
      total: deduped.length,
      missing,
    };
  } catch {
    return { cached: 0, total: deduped.length, missing: deduped };
  }
}

export async function getCachedAudioClipCount(
  customStorage?: CacheStorageLike | null
): Promise<number> {
  const storage = getBrowserCacheStorage(customStorage);
  if (!storage) return 0;

  try {
    const cache = await storage.open(DARIJA_AUDIO_CACHE_NAME);
    const keys = await cache.keys();
    return keys.length;
  } catch {
    return 0;
  }
}

export async function clearAudioCacheStorage(
  customStorage?: CacheStorageLike | null
): Promise<boolean> {
  const storage = getBrowserCacheStorage(customStorage);
  if (!storage) return false;

  try {
    return await storage.delete(DARIJA_AUDIO_CACHE_NAME);
  } catch {
    return false;
  }
}

export function deduplicateClips(
  clips: AudioClipDescriptor[],
  origin?: string
): AudioClipDescriptor[] {
  const seen = new Set<string>();
  const result: AudioClipDescriptor[] = [];

  for (const clip of clips) {
    const cleanArabic = clip.textArabic.trim();
    const cleanLatin = formatBenSediraLatinForSpeech(clip.textLatin);
    if (!cleanArabic && !cleanLatin) continue;

    const normalized: AudioClipDescriptor = {
      textArabic: cleanArabic,
      textLatin: cleanLatin,
      slow: Boolean(clip.slow),
      voiceName: clip.voiceName ?? 'Kore',
    };
    const key = buildAudioCacheKeyUrl(normalized, origin);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
  }

  return result;
}

/**
 * Collects all unique audio clips for a verb's conjugation view:
 * 3-form summary (normal & slow), 3 principal parts, imperative,
 * all 8 persons across present/past/negation, and example sentence.
 */
export function collectVerbOfflineAudioClips(
  item: VerbConjugationIndexItem,
  voiceName: NativeSpeakerVoice = 'Kore'
): AudioClipDescriptor[] {
  const raw: AudioClipDescriptor[] = [
    {
      textArabic: item.arabicTriple.spokenTripleArabic,
      textLatin: item.entry.darijaLatin,
      slow: false,
      voiceName,
    },
    {
      textArabic: item.arabicTriple.spokenTripleArabic,
      textLatin: item.entry.darijaLatin,
      slow: true,
      voiceName,
    },
  ];

  const conj = item.entry.conjugation;
  if (conj) {
    raw.push(
      {
        textArabic: item.arabicTriple.present1sArabic,
        textLatin: conj.present1s,
        slow: false,
        voiceName,
      },
      {
        textArabic: item.arabicTriple.past1sArabic,
        textLatin: conj.past1s,
        slow: false,
        voiceName,
      },
      {
        textArabic: item.arabicTriple.past3msArabic,
        textLatin: conj.past3ms,
        slow: false,
        voiceName,
      }
    );

    if (conj.imperative) {
      raw.push({
        textArabic: item.arabicImperative,
        textLatin: conj.imperative,
        slow: false,
        voiceName,
      });
    }
  }

  for (const row of item.tableRows) {
    const ar = item.arabicRows[row.personKey];
    raw.push(
      {
        textArabic: ar.presentArabic,
        textLatin: row.present,
        slow: false,
        voiceName,
      },
      {
        textArabic: ar.pastArabic,
        textLatin: row.past,
        slow: false,
        voiceName,
      },
      {
        textArabic: ar.negativePresentArabic,
        textLatin: row.negativePresent,
        slow: false,
        voiceName,
      }
    );
  }

  if (item.entry.exampleDarija) {
    raw.push({
      textArabic: item.entry.exampleArabic ?? '',
      textLatin: item.entry.exampleDarija,
      slow: false,
      voiceName,
    });
  }

  return deduplicateClips(raw);
}
