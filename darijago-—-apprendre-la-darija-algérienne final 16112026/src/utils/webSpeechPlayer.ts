import type { AppLanguage } from '../types/darija';
import {
  fetchNativeAudioSourceUrlWithMeta,
  getNativeAudioRateFactor,
  stopAllAudio,
} from './audioPlayer';

export interface SpeechSynthesisVoiceLike {
  lang: string;
  name?: string;
  default?: boolean;
}

export type WebSpeechScriptMode = 'arabic' | 'arabizi';

export interface WebSpeechUtteranceSpec {
  text: string;
  lang: string;
  rate: number;
  scriptMode: WebSpeechScriptMode;
  matchedVoiceName?: string;
}

export interface WebSpeechPlaybackSnapshot {
  activeId: string | null;
  progress: number;
  scriptMode: WebSpeechScriptMode | null;
  spokenText: string;
  usedSpeechSynthesis: boolean;
  matchedVoiceLang: string | null;
  matchedVoiceName: string | null;
}

export interface StartWebSpeechOptions {
  playbackId: string;
  darijaArabic: string;
  darijaLatin: string;
  phoneticFrench?: string;
  slow?: boolean;
  language?: AppLanguage;
  preferScript?: 'auto' | WebSpeechScriptMode;
  onComplete?: () => void;
}

const STOP_WEB_SPEECH_EVENT = 'darijago:stop-web-speech';

const MALE_VOICE_HINT_RE =
  /\b(male|homme|man|majed|maged|tarik|naayf|mehdi|karim|amine|hicham|thomas|daniel|paul|henri|nicolas|mathieu|alex)\b/i;
const FEMALE_VOICE_HINT_RE =
  /\b(female|femme|woman|amina|laila|layla|salma|hoda|mariam|meryem|zineb|kenza|fatima|nadia|yasmine|amélie|amelie|aurélie|aurelie|julie|virginie|denise|céline|celine|marie|samantha)\b/i;

function pickPreferredFemaleVoice<T extends SpeechSynthesisVoiceLike>(
  candidates: readonly T[]
): T | null {
  if (candidates.length === 0) return null;
  return (
    candidates.find((v) => FEMALE_VOICE_HINT_RE.test(v.name ?? '')) ??
    candidates.find((v) => !MALE_VOICE_HINT_RE.test(v.name ?? '')) ??
    candidates[0]
  );
}

function normalizeVoiceLang(lang: string | undefined): string {
  return (lang ?? '').trim().toLowerCase().replace(/_/g, '-');
}

/**
 * Transliterates Arabizi digits and shorthand into pronounceable Latin/French
 * syllables so Web Speech API voices without an Arabic pack do not read
 * numerals ("trois", "sept", "neuf") literally.
 */
export function formatArabiziForWebSpeech(
  darijaLatin: string,
  phoneticFrench?: string
): string {
  const cleanLatin = darijaLatin
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanLatin) {
    return (phoneticFrench ?? '').replace(/[[\]]/g, '').trim();
  }

  const converted = cleanLatin
    .replace(/3/g, 'a')
    .replace(/7/g, 'h')
    .replace(/9/g, 'q')
    .replace(/5/g, 'kh')
    .replace(/2/g, 'a')
    .replace(/8/g, 'gh')
    .replace(/\bw\b/gi, 'ou')
    .replace(/w(?=[aeiouàâéèêîïôû])/gi, 'ou')
    .replace(/\s+/g, ' ')
    .trim();

  return converted;
}

/**
 * Selects the closest available Arabic speech synthesis voice, prioritizing
 * female Algerian/Maghrebi voices (ar-DZ, ar-MA, ar-TN, ar-LY) before general
 * Arabic locales (ar-EG, ar-SA, ar*) or Arabic-named voices.
 */
export function selectArabicVoice<T extends SpeechSynthesisVoiceLike>(
  voices: readonly T[]
): T | null {
  if (!voices || voices.length === 0) return null;

  const dz = voices.filter((v) => normalizeVoiceLang(v.lang).startsWith('ar-dz'));
  if (dz.length > 0) return pickPreferredFemaleVoice(dz);

  const maghreb = voices.filter((v) => {
    const lang = normalizeVoiceLang(v.lang);
    return (
      lang.startsWith('ar-ma') ||
      lang.startsWith('ar-tn') ||
      lang.startsWith('ar-ly')
    );
  });
  if (maghreb.length > 0) return pickPreferredFemaleVoice(maghreb);

  const majorArabic = voices.filter((v) => {
    const lang = normalizeVoiceLang(v.lang);
    return (
      lang.startsWith('ar-eg') ||
      lang.startsWith('ar-sa') ||
      lang.startsWith('ar-001') ||
      lang.startsWith('ar-xa')
    );
  });
  if (majorArabic.length > 0) return pickPreferredFemaleVoice(majorArabic);

  const anyArabicLang = voices.filter((v) => {
    const lang = normalizeVoiceLang(v.lang);
    return lang === 'ar' || lang.startsWith('ar-');
  });
  if (anyArabicLang.length > 0) return pickPreferredFemaleVoice(anyArabicLang);

  const namedArabic = voices.filter((v) =>
    /\barab(ic|e)?\b/i.test(v.name ?? '')
  );
  return pickPreferredFemaleVoice(namedArabic);
}

/**
 * Selects a French or default Latin voice (preferring female voices) for fallback.
 */
export function selectLatinVoice<T extends SpeechSynthesisVoiceLike>(
  voices: readonly T[]
): T | null {
  if (!voices || voices.length === 0) return null;

  const fr = voices.filter((v) => normalizeVoiceLang(v.lang).startsWith('fr'));
  if (fr.length > 0) return pickPreferredFemaleVoice(fr);

  const def = voices.find((v) => Boolean(v.default));
  return def ?? voices[0] ?? null;
}

/**
 * Builds the Web Speech API utterance specification for a Darija phrase,
 * choosing native Arabic script when an Arabic voice is available (or
 * explicitly requested) and clean Arabizi/Latin pronunciation otherwise.
 */
export function buildWebSpeechUtteranceSpec(
  input: {
    darijaArabic: string;
    darijaLatin: string;
    phoneticFrench?: string;
    slow?: boolean;
    preferScript?: 'auto' | WebSpeechScriptMode;
  },
  voices: readonly SpeechSynthesisVoiceLike[] = []
): WebSpeechUtteranceSpec {
  const arabicText = input.darijaArabic.trim();
  const arabiziText = formatArabiziForWebSpeech(
    input.darijaLatin,
    input.phoneticFrench
  );
  const rate = input.slow ? 0.72 : 0.94;
  const preferScript = input.preferScript ?? 'auto';
  const arabicVoice = selectArabicVoice(voices);
  const latinVoice = selectLatinVoice(voices);

  if (preferScript === 'arabic' && arabicText) {
    return {
      text: arabicText,
      lang: arabicVoice?.lang || 'ar-DZ',
      rate,
      scriptMode: 'arabic',
      matchedVoiceName: arabicVoice?.name,
    };
  }

  if (preferScript === 'arabizi' && arabiziText) {
    return {
      text: arabiziText,
      lang: latinVoice?.lang || 'fr-FR',
      rate,
      scriptMode: 'arabizi',
      matchedVoiceName: latinVoice?.name,
    };
  }

  if (arabicText && arabicVoice) {
    return {
      text: arabicText,
      lang: arabicVoice.lang,
      rate,
      scriptMode: 'arabic',
      matchedVoiceName: arabicVoice.name,
    };
  }

  if (arabiziText) {
    return {
      text: arabiziText,
      lang: latinVoice?.lang || 'fr-FR',
      rate,
      scriptMode: 'arabizi',
      matchedVoiceName: latinVoice?.name,
    };
  }

  return {
    text: arabicText,
    lang: arabicVoice?.lang || 'ar-DZ',
    rate,
    scriptMode: 'arabic',
    matchedVoiceName: arabicVoice?.name,
  };
}

/**
 * Computes a natural simulated playback duration in milliseconds based on
 * phrase length and playback speed.
 */
export function estimateSimulatedSpeechDurationMs(
  text: string,
  slow = false
): number {
  const trimmed = text.trim();
  if (!trimmed) return 1100;

  const words = trimmed.split(/\s+/).filter(Boolean).length;
  const baseMs = Math.max(trimmed.length * 68, words * 360) + 450;
  const clamped = Math.min(5400, Math.max(1200, baseMs));
  return slow ? Math.round(clamped * 1.28) : clamped;
}

let snapshot: WebSpeechPlaybackSnapshot = {
  activeId: null,
  progress: 0,
  scriptMode: null,
  spokenText: '',
  usedSpeechSynthesis: false,
  matchedVoiceLang: null,
  matchedVoiceName: null,
};

let playbackSeq = 0;
let tickIntervalId: number | null = null;
let activeNativeAudio: HTMLAudioElement | null = null;
let stopListenerAttached = false;
let voicesListenerAttached = false;
let cachedVoices: SpeechSynthesisVoice[] = [];
const listeners = new Set<(state: WebSpeechPlaybackSnapshot) => void>();

function refreshCachedVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  try {
    const live = window.speechSynthesis.getVoices();
    if (live.length > 0) {
      cachedVoices = live;
      return live;
    }
  } catch {
    // ignore speechSynthesis getVoices errors
  }
  return cachedVoices;
}

function ensureVoicesWarmedUp(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  refreshCachedVoices();
  if (voicesListenerAttached) return;
  try {
    window.speechSynthesis.addEventListener?.('voiceschanged', () => {
      refreshCachedVoices();
    });
    voicesListenerAttached = true;
  } catch {
    // ignore listener errors
  }
}

function emitSnapshot(next: WebSpeechPlaybackSnapshot): void {
  snapshot = next;
  for (const listener of listeners) {
    listener(snapshot);
  }
}

function clearSimulationTimer(): void {
  if (typeof window !== 'undefined' && tickIntervalId !== null) {
    window.clearInterval(tickIntervalId);
  }
  tickIntervalId = null;
}

function clearNativeAudio(): void {
  if (!activeNativeAudio) return;
  activeNativeAudio.onended = null;
  activeNativeAudio.onerror = null;
  try {
    activeNativeAudio.pause();
    activeNativeAudio.currentTime = 0;
  } catch {
    // ignore audio reset error
  }
  activeNativeAudio = null;
}

function ensureStopEventListener(): void {
  if (typeof window === 'undefined' || stopListenerAttached) return;
  window.addEventListener(STOP_WEB_SPEECH_EVENT, () => {
    stopWebSpeechPlayback();
  });
  stopListenerAttached = true;
}

export function getWebSpeechPlaybackSnapshot(): WebSpeechPlaybackSnapshot {
  return snapshot;
}

export function subscribeWebSpeechPlayback(
  listener: (state: WebSpeechPlaybackSnapshot) => void
): () => void {
  ensureStopEventListener();
  ensureVoicesWarmedUp();
  listeners.add(listener);
  listener(snapshot);
  return () => {
    listeners.delete(listener);
  };
}

export function stopWebSpeechPlayback(): void {
  playbackSeq += 1;
  clearSimulationTimer();
  clearNativeAudio();

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore synthesis cancel errors
    }
  }

  if (snapshot.activeId !== null || snapshot.progress !== 0) {
    emitSnapshot({
      activeId: null,
      progress: 0,
      scriptMode: null,
      spokenText: '',
      usedSpeechSynthesis: false,
      matchedVoiceLang: null,
      matchedVoiceName: null,
    });
  }
}

function startBrowserSpeechFallback(
  token: number,
  spec: WebSpeechUtteranceSpec,
  voices: readonly SpeechSynthesisVoice[],
  options: StartWebSpeechOptions
): void {
  if (token !== playbackSeq) return;

  const durationMs = estimateSimulatedSpeechDurationMs(spec.text, options.slow);
  const startedAt = Date.now();
  let usedSpeechSynthesis = false;
  let utteranceNaturallyEnded = false;

  if (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof SpeechSynthesisUtterance !== 'undefined' &&
    spec.text
  ) {
    try {
      const utterance = new SpeechSynthesisUtterance(spec.text);
      utterance.lang = spec.lang;
      utterance.rate = spec.rate;

      if (spec.matchedVoiceName) {
        const matched = voices.find((v) => v.name === spec.matchedVoiceName);
        if (matched) {
          utterance.voice = matched;
        }
      }

      utterance.onend = () => {
        if (token !== playbackSeq) return;
        const elapsed = Date.now() - startedAt;
        if (elapsed >= 350) {
          utteranceNaturallyEnded = true;
          clearSimulationTimer();
          emitSnapshot({
            activeId: null,
            progress: 0,
            scriptMode: null,
            spokenText: '',
            usedSpeechSynthesis: false,
            matchedVoiceLang: null,
            matchedVoiceName: null,
          });
          options.onComplete?.();
        }
      };

      utterance.onerror = () => {
        // Keep simulated playback running smoothly even if OS TTS is unavailable
      };

      window.speechSynthesis.speak(utterance);
      usedSpeechSynthesis = true;
    } catch {
      usedSpeechSynthesis = false;
    }
  }

  emitSnapshot({
    activeId: options.playbackId,
    progress: Math.max(8, snapshot.progress),
    scriptMode: spec.scriptMode,
    spokenText: spec.text,
    usedSpeechSynthesis,
    matchedVoiceLang: spec.lang,
    matchedVoiceName: spec.matchedVoiceName ?? null,
  });

  if (typeof window !== 'undefined') {
    clearSimulationTimer();
    tickIntervalId = window.setInterval(() => {
      if (token !== playbackSeq || utteranceNaturallyEnded) {
        clearSimulationTimer();
        return;
      }

      const elapsed = Date.now() - startedAt;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));

      if (elapsed >= durationMs) {
        clearSimulationTimer();
        emitSnapshot({
          activeId: null,
          progress: 0,
          scriptMode: null,
          spokenText: '',
          usedSpeechSynthesis: false,
          matchedVoiceLang: null,
          matchedVoiceName: null,
        });
        options.onComplete?.();
      } else {
        emitSnapshot({
          activeId: options.playbackId,
          progress: Math.max(8, pct),
          scriptMode: spec.scriptMode,
          spokenText: spec.text,
          usedSpeechSynthesis,
          matchedVoiceLang: spec.lang,
          matchedVoiceName: spec.matchedVoiceName ?? null,
        });
      }
    }, 60);
  }
}

export function startPhraseWebSpeechPlayback(
  options: StartWebSpeechOptions
): WebSpeechUtteranceSpec {
  ensureStopEventListener();
  ensureVoicesWarmedUp();
  stopAllAudio();
  stopWebSpeechPlayback();

  const token = ++playbackSeq;
  const voices = refreshCachedVoices();

  const spec = buildWebSpeechUtteranceSpec(
    {
      darijaArabic: options.darijaArabic,
      darijaLatin: options.darijaLatin,
      phoneticFrench: options.phoneticFrench,
      slow: options.slow,
      preferScript: options.preferScript,
    },
    voices
  );

  emitSnapshot({
    activeId: options.playbackId,
    progress: 6,
    scriptMode: spec.scriptMode,
    spokenText: spec.text,
    usedSpeechSynthesis: false,
    matchedVoiceLang: spec.lang || 'ar-DZ',
    matchedVoiceName: spec.matchedVoiceName ?? 'Yasmine (Kore)',
  });

  if (typeof window === 'undefined' || typeof fetch === 'undefined') {
    return spec;
  }

  void (async () => {
    const resolved = await fetchNativeAudioSourceUrlWithMeta({
      textArabic: options.darijaArabic,
      textLatin: options.darijaLatin,
      slow: options.slow,
      language: options.language ?? 'fr',
      voiceName: 'Kore',
    });

    if (token !== playbackSeq) return;

    if (!resolved) {
      startBrowserSpeechFallback(token, spec, voices, options);
      return;
    }

    try {
      clearNativeAudio();
      const audio = new Audio(resolved.url);
      audio.playbackRate = resolved.playbackRate * getNativeAudioRateFactor();
      if ('preservesPitch' in audio) {
        audio.preservesPitch = true;
      }
      activeNativeAudio = audio;

      emitSnapshot({
        activeId: options.playbackId,
        progress: 12,
        scriptMode: 'arabic',
        spokenText: options.darijaArabic.trim() || spec.text,
        usedSpeechSynthesis: false,
        matchedVoiceLang: 'ar-DZ',
        matchedVoiceName: 'Yasmine (Kore)',
      });

      const estimatedMs = estimateSimulatedSpeechDurationMs(
        options.darijaArabic.trim() || spec.text,
        options.slow
      );
      const startedAt = Date.now();

      clearSimulationTimer();
      tickIntervalId = window.setInterval(() => {
        if (token !== playbackSeq || activeNativeAudio !== audio) {
          clearSimulationTimer();
          return;
        }
        const pct =
          Number.isFinite(audio.duration) && audio.duration > 0
            ? Math.min(99, Math.round((audio.currentTime / audio.duration) * 100))
            : Math.min(95, Math.round(((Date.now() - startedAt) / estimatedMs) * 100));

        emitSnapshot({
          activeId: options.playbackId,
          progress: Math.max(12, pct),
          scriptMode: 'arabic',
          spokenText: options.darijaArabic.trim() || spec.text,
          usedSpeechSynthesis: false,
          matchedVoiceLang: 'ar-DZ',
          matchedVoiceName: 'Yasmine (Kore)',
        });
      }, 60);

      audio.onended = () => {
        if (token !== playbackSeq) return;
        clearSimulationTimer();
        clearNativeAudio();
        emitSnapshot({
          activeId: null,
          progress: 0,
          scriptMode: null,
          spokenText: '',
          usedSpeechSynthesis: false,
          matchedVoiceLang: null,
          matchedVoiceName: null,
        });
        options.onComplete?.();
      };

      audio.onerror = () => {
        if (token !== playbackSeq) return;
        clearSimulationTimer();
        clearNativeAudio();
        startBrowserSpeechFallback(token, spec, voices, options);
      };

      await audio.play().catch(() => {
        if (token !== playbackSeq) return;
        clearSimulationTimer();
        clearNativeAudio();
        startBrowserSpeechFallback(token, spec, voices, options);
      });
    } catch {
      clearSimulationTimer();
      clearNativeAudio();
      startBrowserSpeechFallback(token, spec, voices, options);
    }
  })();

  return spec;
}
