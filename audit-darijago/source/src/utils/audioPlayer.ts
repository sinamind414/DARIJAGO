import type { AppLanguage } from '../types/darija';
import {
  buildAudioCacheKeyUrl,
  clearAudioCacheStorage,
  countClipsCacheStatus,
  deduplicateClips,
  getCachedAudioClipCount,
  readAudioBlobFromCache,
  writeAudioBase64ToCache,
  writeAudioResponseToCache,
  type AudioClipDescriptor,
} from './audioCacheStorage';
import {
  formatBenSediraLatinForSpeech,
  type NativeSpeakerVoice,
} from './darijaSpeechFormat';

export const AUDIO_CACHE_UPDATED_EVENT = 'darijago:audio-cache-updated';

const audioCache = new Map<string, string>();
const inFlightClientRequests = new Map<string, Promise<string | null>>();
let currentAudio: HTMLAudioElement | null = null;
let activePlaybackToken = 0;

export interface PlayAudioOptions {
  textArabic: string;
  textLatin: string;
  phoneticFrench?: string;
  slow?: boolean;
  language?: AppLanguage;
  voiceName?: NativeSpeakerVoice;
  verbId?: string;
  formKey?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

function notifyAudioCacheUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(AUDIO_CACHE_UPDATED_EVENT));
}

function buildClientCacheKey(opts: {
  textArabic: string;
  textLatin: string;
  slow?: boolean;
  voiceName?: NativeSpeakerVoice;
}): string {
  return buildAudioCacheKeyUrl({
    textArabic: opts.textArabic,
    textLatin: opts.textLatin,
    slow: opts.slow,
    voiceName: opts.voiceName,
  });
}

function createAudioSourceUrlFromBlob(blob: Blob): string | null {
  if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
    return URL.createObjectURL(blob);
  }
  return null;
}

function speakWithBrowserFallback(
  opts: PlayAudioOptions,
  token: number
): void {
  if (token !== activePlaybackToken) {
    opts.onEnd?.();
    return;
  }
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    opts.onEnd?.();
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find((v) => v.lang.startsWith('ar'));
    const utterance = new SpeechSynthesisUtterance(
      arabicVoice && opts.textArabic.trim()
        ? opts.textArabic
        : opts.phoneticFrench || opts.textLatin
    );
    utterance.lang =
      arabicVoice && opts.textArabic.trim() ? arabicVoice.lang : 'fr-FR';
    if (arabicVoice && opts.textArabic.trim()) {
      utterance.voice = arabicVoice;
    }
    utterance.rate = opts.slow ? 0.72 : 0.95;
    utterance.onend = () => opts.onEnd?.();
    utterance.onerror = () => opts.onEnd?.();
    window.speechSynthesis.speak(utterance);
  } catch {
    opts.onEnd?.();
  }
}

export function stopAllAudio(): void {
  activePlaybackToken += 1;
  if (currentAudio) {
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

async function fetchNativeAudioSourceUrl(opts: {
  textArabic: string;
  textLatin: string;
  slow?: boolean;
  language?: AppLanguage;
  voiceName?: NativeSpeakerVoice;
}): Promise<string | null> {
  const normalizedOpts: AudioClipDescriptor = {
    textArabic: opts.textArabic.trim(),
    textLatin: formatBenSediraLatinForSpeech(opts.textLatin),
    slow: Boolean(opts.slow),
    voiceName: opts.voiceName ?? 'Kore',
  };

  if (!normalizedOpts.textArabic && !normalizedOpts.textLatin) {
    return null;
  }

  const cacheKey = buildClientCacheKey(normalizedOpts);
  const cachedSrc = audioCache.get(cacheKey);
  if (cachedSrc) return cachedSrc;

  const existing = inFlightClientRequests.get(cacheKey);
  if (existing) return existing;

  const promise = (async () => {
    try {
      // 1. Check persistent browser Cache API first (enables 100% offline playback)
      const cachedBlob = await readAudioBlobFromCache(normalizedOpts);
      if (cachedBlob) {
        const objectUrl = createAudioSourceUrlFromBlob(cachedBlob);
        if (objectUrl) {
          audioCache.set(cacheKey, objectUrl);
          return objectUrl;
        }
      }

      // 2. If offline and not cached, skip network request immediately
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        return null;
      }

      // 3. Fetch binary audio clip via canonical GET endpoint & persist in Cache API
      const clipUrl = new URL(cacheKey);
      clipUrl.searchParams.set('lang', opts.language ?? 'fr');
      const resp = await fetch(clipUrl.toString(), { method: 'GET' });

      if (resp.ok) {
        const contentType = resp.headers.get('content-type') || '';
        if (contentType.startsWith('audio/')) {
          const wroteToCache = await writeAudioResponseToCache(normalizedOpts, resp);
          const blob = await resp.blob();
          const objectUrl = createAudioSourceUrlFromBlob(blob);
          if (objectUrl) {
            audioCache.set(cacheKey, objectUrl);
            if (wroteToCache) {
              notifyAudioCacheUpdated();
            }
            return objectUrl;
          }
        }
      }

      return null;
    } catch {
      return null;
    } finally {
      inFlightClientRequests.delete(cacheKey);
    }
  })();

  inFlightClientRequests.set(cacheKey, promise);
  return promise;
}

export async function prefetchDarijaClips(
  items: Array<{
    textArabic: string;
    textLatin: string;
    slow?: boolean;
  }>,
  language: AppLanguage = 'fr',
  voiceName: NativeSpeakerVoice = 'Kore'
): Promise<void> {
  if (typeof window === 'undefined' || items.length === 0) return;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

  try {
    const normalized = deduplicateClips(
      items.slice(0, 6).map((item) => ({
        ...item,
        voiceName,
      }))
    );
    const { missing } = await countClipsCacheStatus(normalized);
    if (missing.length === 0) return;

    const resp = await fetch('/api/tts/preload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: missing,
        language,
        voiceName,
        includeAudio: true,
      }),
    });
    if (!resp.ok) return;

    const payload = (await resp.json()) as {
      clips?: Array<{
        textArabic: string;
        textLatin: string;
        slow: boolean;
        voiceName: NativeSpeakerVoice;
        audioBase64: string;
        mimeType?: string;
      }>;
    };

    if (!Array.isArray(payload.clips) || payload.clips.length === 0) return;

    let wroteAny = false;
    for (const clip of payload.clips) {
      const ok = await writeAudioBase64ToCache(clip);
      if (ok) wroteAny = true;
    }
    if (wroteAny) {
      notifyAudioCacheUpdated();
    }
  } catch {
    // non-fatal best-effort preload
  }
}

/**
 * Persists an entire list of verb / flashcard audio clips into the browser Cache API
 * for offline listening, skipping clips already present in CacheStorage.
 */
export async function cacheAudioClipsOffline(
  clips: AudioClipDescriptor[],
  language: AppLanguage = 'fr',
  voiceName: NativeSpeakerVoice = 'Kore',
  onProgress?: (cached: number, total: number) => void
): Promise<{ cached: number; total: number }> {
  const deduped = deduplicateClips(
    clips.map((c) => ({
      ...c,
      voiceName: c.voiceName ?? voiceName,
    }))
  );

  if (deduped.length === 0) {
    return { cached: 0, total: 0 };
  }

  const initialStatus = await countClipsCacheStatus(deduped);
  let cachedCount = initialStatus.cached;
  onProgress?.(cachedCount, initialStatus.total);

  if (initialStatus.missing.length === 0) {
    return { cached: cachedCount, total: initialStatus.total };
  }

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { cached: cachedCount, total: initialStatus.total };
  }

  const BATCH_SIZE = 8;
  for (let i = 0; i < initialStatus.missing.length; i += BATCH_SIZE) {
    const batch = initialStatus.missing.slice(i, i + BATCH_SIZE);
    try {
      const resp = await fetch('/api/tts/preload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: batch,
          language,
          voiceName,
          includeAudio: true,
        }),
      });
      if (!resp.ok) continue;

      const data = (await resp.json()) as {
        rateLimited?: boolean;
        clips?: Array<{
          textArabic: string;
          textLatin: string;
          slow: boolean;
          voiceName: NativeSpeakerVoice;
          audioBase64: string;
          mimeType?: string;
        }>;
      };

      if (Array.isArray(data.clips)) {
        for (const clip of data.clips) {
          const stored = await writeAudioBase64ToCache(clip);
          if (stored) {
            cachedCount += 1;
          }
        }
        notifyAudioCacheUpdated();
      }
      onProgress?.(Math.min(cachedCount, initialStatus.total), initialStatus.total);
      if (data.rateLimited) {
        break;
      }
    } catch {
      // continue trying remaining batches if transient error
    }
  }

  const finalStatus = await countClipsCacheStatus(deduped);
  onProgress?.(finalStatus.cached, finalStatus.total);
  return { cached: finalStatus.cached, total: finalStatus.total };
}

export async function getVerbOfflineCacheStatus(
  clips: AudioClipDescriptor[]
): Promise<{ cached: number; total: number }> {
  const status = await countClipsCacheStatus(clips);
  return { cached: status.cached, total: status.total };
}

export async function getTotalCachedAudioClips(): Promise<number> {
  return getCachedAudioClipCount();
}

export async function clearAllOfflineAudioCache(): Promise<void> {
  stopAllAudio();
  if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
    for (const url of audioCache.values()) {
      if (url.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      }
    }
  }
  audioCache.clear();
  await clearAudioCacheStorage();
  notifyAudioCacheUpdated();
}

export async function playDarijaPronunciation(
  opts: PlayAudioOptions
): Promise<'gemini-tts' | 'browser-speech'> {
  stopAllAudio();
  const token = activePlaybackToken;
  opts.onStart?.();

  const audioUrl = await fetchNativeAudioSourceUrl(opts);
  if (token !== activePlaybackToken) {
    return audioUrl ? 'gemini-tts' : 'browser-speech';
  }

  if (!audioUrl) {
    speakWithBrowserFallback(opts, token);
    return 'browser-speech';
  }

  try {
    const audio = new Audio(audioUrl);
    currentAudio = audio;
    await new Promise<void>((resolve) => {
      audio.onended = () => {
        if (currentAudio === audio) currentAudio = null;
        opts.onEnd?.();
        resolve();
      };
      audio.onerror = () => {
        if (currentAudio === audio) currentAudio = null;
        speakWithBrowserFallback(opts, token);
        resolve();
      };
      void audio.play().catch(() => {
        if (currentAudio === audio) currentAudio = null;
        speakWithBrowserFallback(opts, token);
        resolve();
      });
    });
    return 'gemini-tts';
  } catch {
    speakWithBrowserFallback(opts, token);
    return 'browser-speech';
  }
}

export async function playDarijaSequence(
  items: PlayAudioOptions[],
  callbacks?: {
    onStep?: (index: number) => void;
    onComplete?: () => void;
  }
): Promise<void> {
  stopAllAudio();
  const seqToken = activePlaybackToken;

  for (let i = 0; i < items.length; i++) {
    if (seqToken !== activePlaybackToken) break;
    const item = items[i];
    callbacks?.onStep?.(i);

    const audioUrl = await fetchNativeAudioSourceUrl(item);
    if (seqToken !== activePlaybackToken) break;

    if (audioUrl) {
      await new Promise<void>((resolve) => {
        const audio = new Audio(audioUrl);
        currentAudio = audio;
        audio.onended = () => {
          if (currentAudio === audio) currentAudio = null;
          resolve();
        };
        audio.onerror = () => {
          if (currentAudio === audio) currentAudio = null;
          resolve();
        };
        void audio.play().catch(() => {
          if (currentAudio === audio) currentAudio = null;
          resolve();
        });
      });
    } else {
      await new Promise<void>((resolve) => {
        speakWithBrowserFallback(
          {
            ...item,
            onEnd: resolve,
          },
          seqToken
        );
      });
    }

    if (seqToken !== activePlaybackToken) break;
    if (i < items.length - 1) {
      await new Promise((r) => setTimeout(r, 220));
    }
  }

  if (seqToken === activePlaybackToken) {
    callbacks?.onComplete?.();
  }
}
