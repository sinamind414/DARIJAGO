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
  UNIFIED_FEMALE_VOICE,
  formatBenSediraLatinForSpeech,
  type NativeSpeakerVoice,
} from './darijaSpeechFormat';
import {
  isOfflineModeEnabledSync,
  readAudioBlobFromIndexedDb,
  resolveBundledYasmineUrlFromManifest,
  saveAudioBlobToIndexedDb,
} from './offlineIndexedDb';

export const AUDIO_CACHE_UPDATED_EVENT = 'darijago:audio-cache-updated';

// Les clips OmniVoice sont graves a un debit trop rapide pour l'apprentissage.
// Facteur applique a TOUTES les sources natives (manifest, cache, serveur) au moment
// de la lecture, avec preservesPitch = true : la voix reste la meme, plus lente.
// 1 = vitesse d'origine, 0.7 = 30 % plus lent (applique a toute l'application).
export const NATIVE_AUDIO_RATE_FACTOR = 0.7;

// Les verbes suivent le meme ralentissement que le reste de l'application.
// Conserve comme constante explicite pour un reglage futur eventuel.
export const VERB_AUDIO_RATE_FACTOR = NATIVE_AUDIO_RATE_FACTOR;

export interface ResolvedNativeAudioSource {
  url: string;
  playbackRate: number;
}

const audioCache = new Map<string, ResolvedNativeAudioSource>();
const inFlightClientRequests = new Map<string, Promise<ResolvedNativeAudioSource | null>>();
let currentAudio: HTMLAudioElement | null = null;
let activePlaybackToken = 0;

export interface PlayAudioOptions {
  textArabic: string;
  textLatin: string;
  phoneticFrench?: string;
  slow?: boolean;
  language?: AppLanguage;
  voiceName?: NativeSpeakerVoice;
  /** Facteur de vitesse specifique (verbes = 0.7). Defaut = NATIVE_AUDIO_RATE_FACTOR. */
  rateFactor?: number;
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

const MALE_VOICE_HINT_RE =
  /\b(male|homme|man|majed|maged|tarik|naayf|mehdi|karim|amine|hicham|thomas|daniel|paul|henri|nicolas|mathieu|alex)\b/i;
const FEMALE_VOICE_HINT_RE =
  /\b(female|femme|woman|amina|laila|layla|salma|hoda|mariam|meryem|zineb|kenza|fatima|nadia|yasmine|amélie|amelie|aurélie|aurelie|julie|virginie|denise|céline|celine|marie|samantha)\b/i;

function pickPreferredFemaleVoice<T extends SpeechSynthesisVoice>(
  candidates: T[]
): T | undefined {
  if (candidates.length === 0) return undefined;
  return (
    candidates.find((v) => FEMALE_VOICE_HINT_RE.test(v.name)) ??
    candidates.find((v) => !MALE_VOICE_HINT_RE.test(v.name)) ??
    candidates[0]
  );
}

function selectPreferredArabicFallbackVoice(
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | undefined {
  const norm = (lang: string) => lang.trim().toLowerCase().replace(/_/g, '-');
  const dz = voices.filter((v) => norm(v.lang).startsWith('ar-dz'));
  if (dz.length > 0) return pickPreferredFemaleVoice(dz);

  const maghreb = voices.filter((v) => {
    const l = norm(v.lang);
    return l.startsWith('ar-ma') || l.startsWith('ar-tn') || l.startsWith('ar-ly');
  });
  if (maghreb.length > 0) return pickPreferredFemaleVoice(maghreb);

  const major = voices.filter((v) => {
    const l = norm(v.lang);
    return l.startsWith('ar-eg') || l.startsWith('ar-sa') || l.startsWith('ar-001');
  });
  if (major.length > 0) return pickPreferredFemaleVoice(major);

  const anyAr = voices.filter((v) => {
    const l = norm(v.lang);
    return l === 'ar' || l.startsWith('ar-');
  });
  if (anyAr.length > 0) return pickPreferredFemaleVoice(anyAr);

  return undefined;
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
    const arabicVoice = selectPreferredArabicFallbackVoice(voices);
    const frVoices = voices.filter((v) =>
      v.lang.trim().toLowerCase().startsWith('fr')
    );
    const frenchVoice = pickPreferredFemaleVoice(frVoices);
    const useArabic = Boolean(arabicVoice && opts.textArabic.trim());
    const utterance = new SpeechSynthesisUtterance(
      useArabic ? opts.textArabic : opts.phoneticFrench || opts.textLatin
    );
    utterance.lang = useArabic ? arabicVoice!.lang : frenchVoice?.lang || 'fr-FR';
    if (useArabic && arabicVoice) {
      utterance.voice = arabicVoice;
    } else if (frenchVoice) {
      utterance.voice = frenchVoice;
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
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('darijago:stop-web-speech'));
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  }
}

export async function fetchNativeAudioSourceUrlWithMeta(opts: {
  textArabic: string;
  textLatin: string;
  slow?: boolean;
  language?: AppLanguage;
  voiceName?: NativeSpeakerVoice;
}): Promise<ResolvedNativeAudioSource | null> {
  const normalizedOpts: AudioClipDescriptor = {
    textArabic: opts.textArabic.trim(),
    textLatin: formatBenSediraLatinForSpeech(opts.textLatin),
    slow: Boolean(opts.slow),
    voiceName: UNIFIED_FEMALE_VOICE,
  };

  if (!normalizedOpts.textArabic && !normalizedOpts.textLatin) {
    return null;
  }

  const cacheKey = buildClientCacheKey(normalizedOpts);
  const cachedSrc = audioCache.get(cacheKey);
  if (cachedSrc) return cachedSrc;

  const existing = inFlightClientRequests.get(cacheKey);
  if (existing) return existing;

  const promise = (async (): Promise<ResolvedNativeAudioSource | null> => {
    try {
      // 1. Check IndexedDB offline store first (works 100% offline with zero Gemini API calls)
      const idbMatch = await readAudioBlobFromIndexedDb(normalizedOpts);
      if (idbMatch) {
        const objectUrl = createAudioSourceUrlFromBlob(idbMatch.blob);
        if (objectUrl) {
          const resolved: ResolvedNativeAudioSource = {
            url: objectUrl,
            playbackRate: idbMatch.playbackRate,
          };
          audioCache.set(cacheKey, resolved);
          return resolved;
        }
      }

      // 2. Check static bundled Yasmine (Kore) manifest shipped inside the app (no API key needed)
      const bundledMatch = await resolveBundledYasmineUrlFromManifest(normalizedOpts);
      if (bundledMatch) {
        try {
          const staticResp = await fetch(bundledMatch.url, { method: 'GET' });
          if (staticResp.ok) {
            const blob = await staticResp.blob();
            if (blob.size > 0) {
              await saveAudioBlobToIndexedDb(
                {
                  textArabic: normalizedOpts.textArabic,
                  textLatin: normalizedOpts.textLatin,
                  slow: normalizedOpts.slow && bundledMatch.playbackRate === 1,
                },
                blob,
                'yasmine-static'
              );
              const objectUrl = createAudioSourceUrlFromBlob(blob);
              if (objectUrl) {
                const resolved: ResolvedNativeAudioSource = {
                  url: objectUrl,
                  playbackRate: bundledMatch.playbackRate,
                };
                audioCache.set(cacheKey, resolved);
                return resolved;
              }
            }
          }
        } catch {
          // If offline and not in IndexedDB yet, fall through cleanly
        }
      }

      // 3. Check persistent browser Cache API (legacy offline compatibility)
      const cachedBlob = await readAudioBlobFromCache(normalizedOpts);
      if (cachedBlob) {
        await saveAudioBlobToIndexedDb(normalizedOpts, cachedBlob, 'gemini-cache');
        const objectUrl = createAudioSourceUrlFromBlob(cachedBlob);
        if (objectUrl) {
          const resolved: ResolvedNativeAudioSource = {
            url: objectUrl,
            playbackRate: 1,
          };
          audioCache.set(cacheKey, resolved);
          return resolved;
        }
      }

      // 4. Respect offline-only mode or missing network connectivity
      if (
        isOfflineModeEnabledSync() ||
        (typeof navigator !== 'undefined' && navigator.onLine === false)
      ) {
        return null;
      }

      // 5. Fallback to server TTS clip endpoint (which serves static/disk cache first)
      const clipUrl = new URL(cacheKey);
      clipUrl.searchParams.set('lang', opts.language ?? 'fr');
      const resp = await fetch(clipUrl.toString(), { method: 'GET' });

      if (resp.ok) {
        const contentType = resp.headers.get('content-type') || '';
        if (contentType.startsWith('audio/')) {
          const wroteToCache = await writeAudioResponseToCache(normalizedOpts, resp);
          const blob = await resp.blob();
          await saveAudioBlobToIndexedDb(normalizedOpts, blob, 'gemini-cache');
          const objectUrl = createAudioSourceUrlFromBlob(blob);
          if (objectUrl) {
            const resolved: ResolvedNativeAudioSource = {
              url: objectUrl,
              playbackRate: 1,
            };
            audioCache.set(cacheKey, resolved);
            if (wroteToCache) {
              notifyAudioCacheUpdated();
            }
            return resolved;
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

export async function fetchNativeAudioSourceUrl(opts: {
  textArabic: string;
  textLatin: string;
  slow?: boolean;
  language?: AppLanguage;
  voiceName?: NativeSpeakerVoice;
}): Promise<string | null> {
  const resolved = await fetchNativeAudioSourceUrlWithMeta(opts);
  return resolved?.url ?? null;
}

export async function prefetchDarijaClips(
  items: Array<{
    textArabic: string;
    textLatin: string;
    slow?: boolean;
  }>,
  language: AppLanguage = 'fr',
  _voiceName: NativeSpeakerVoice = UNIFIED_FEMALE_VOICE
): Promise<void> {
  if (typeof window === 'undefined' || items.length === 0) return;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

  const lockedVoice = UNIFIED_FEMALE_VOICE;
  try {
    const normalized = deduplicateClips(
      items.slice(0, 6).map((item) => ({
        ...item,
        voiceName: lockedVoice,
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
        voiceName: lockedVoice,
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
  _voiceName: NativeSpeakerVoice = UNIFIED_FEMALE_VOICE,
  onProgress?: (cached: number, total: number) => void
): Promise<{ cached: number; total: number }> {
  const lockedVoice = UNIFIED_FEMALE_VOICE;
  const deduped = deduplicateClips(
    clips.map((c) => ({
      ...c,
      voiceName: lockedVoice,
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
          voiceName: lockedVoice,
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
    for (const entry of audioCache.values()) {
      if (entry.url.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(entry.url);
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

  const resolved = await fetchNativeAudioSourceUrlWithMeta(opts);
  if (token !== activePlaybackToken) {
    return resolved ? 'gemini-tts' : 'browser-speech';
  }

  if (!resolved) {
    speakWithBrowserFallback(opts, token);
    return 'browser-speech';
  }

  try {
    const audio = new Audio(resolved.url);
    audio.playbackRate = resolved.playbackRate * (opts.rateFactor ?? NATIVE_AUDIO_RATE_FACTOR);
    if ('preservesPitch' in audio) {
      audio.preservesPitch = true;
    }
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

    const resolved = await fetchNativeAudioSourceUrlWithMeta(item);
    if (seqToken !== activePlaybackToken) break;

    if (resolved) {
      await new Promise<void>((resolve) => {
        const audio = new Audio(resolved.url);
        audio.playbackRate = resolved.playbackRate * (item.rateFactor ?? NATIVE_AUDIO_RATE_FACTOR);
        if ('preservesPitch' in audio) {
          audio.preservesPitch = true;
        }
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
