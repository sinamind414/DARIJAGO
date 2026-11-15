import type { DarijaPhrase } from '../types/darija';

export type SpeechRecognitionLocale = 'ar-DZ' | 'fr-FR';

export type PronunciationTier = 'excellent' | 'good' | 'retry';

export interface TokenMatchResult {
  token: string;
  matched: boolean;
  similarity: number;
}

export interface PronunciationComparisonResult {
  transcript: string;
  score: number;
  tier: PronunciationTier;
  scriptMode: 'arabic' | 'latin';
  tokenMatches: TokenMatchResult[];
}

export interface WebSpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface WebSpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: WebSpeechRecognitionAlternative;
}

export interface WebSpeechRecognitionResultList {
  length: number;
  [index: number]: WebSpeechRecognitionResult;
}

export interface WebSpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: WebSpeechRecognitionResultList;
}

export interface WebSpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

export interface WebSpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: ((this: WebSpeechRecognitionInstance, ev: Event) => void) | null;
  onresult:
    | ((this: WebSpeechRecognitionInstance, ev: WebSpeechRecognitionEvent) => void)
    | null;
  onerror:
    | ((this: WebSpeechRecognitionInstance, ev: WebSpeechRecognitionErrorEvent) => void)
    | null;
  onend: ((this: WebSpeechRecognitionInstance, ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export type WebSpeechRecognitionConstructor = new () => WebSpeechRecognitionInstance;

export function getSpeechRecognitionConstructor(): WebSpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: WebSpeechRecognitionConstructor;
    webkitSpeechRecognition?: WebSpeechRecognitionConstructor;
  };
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
}

export function containsArabicCharacters(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

export function normalizeArabicScript(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // strip tashkeel/diacritics
    .replace(/[،؛؟]/g, ' ')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\u0600-\u06FF0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeSpokenLatin(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/-/g, '')
    .replace(/['’`_.,!?;:()[\]«»"]/g, ' ')
    .replace(/ou/g, 'u')
    .replace(/ch/g, 'sh')
    .replace(/kh/g, '5')
    .replace(/gh/g, 'g')
    .replace(/3/g, 'a')
    .replace(/7/g, 'h')
    .replace(/9/g, 'q')
    .replace(/5/g, 'x')
    .replace(/2/g, 'a')
    .replace(/k/g, 'q')
    .replace(/w/g, 'u')
    .replace(/o/g, 'u')
    .replace(/(.)\1+/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const prev = new Array<number>(b.length + 1);
  const curr = new Array<number>(b.length + 1);

  for (let j = 0; j <= b.length; j++) {
    prev[j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + cost
      );
    }
    for (let j = 0; j <= b.length; j++) {
      prev[j] = curr[j];
    }
  }

  return prev[b.length];
}

export function similarityRatio(a: string, b: string): number {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const dist = levenshteinDistance(a, b);
  return Math.max(0, 1 - dist / maxLen);
}

function splitDisplayTokens(text: string): string[] {
  return text
    .split(/\s+/)
    .map((t) => t.replace(/^[\s.,!?;:«»"'()[\]؟،]+|[\s.,!?;:«»"'()[\]؟،]+$/g, ''))
    .filter(Boolean);
}

export function comparePronunciation(
  spokenTranscript: string,
  phrase: Pick<
    DarijaPhrase,
    'darijaLatin' | 'darijaArabic' | 'phoneticFrench' | 'acceptedAnswers'
  >
): PronunciationComparisonResult {
  const trimmed = spokenTranscript.trim();
  const displayLatinTokens = splitDisplayTokens(phrase.darijaLatin);

  if (!trimmed) {
    return {
      transcript: '',
      score: 0,
      tier: 'retry',
      scriptMode: 'latin',
      tokenMatches: displayLatinTokens.map((token) => ({
        token,
        matched: false,
        similarity: 0,
      })),
    };
  }

  if (containsArabicCharacters(trimmed)) {
    const spokenNorm = normalizeArabicScript(trimmed);
    const targetNorm = normalizeArabicScript(phrase.darijaArabic);
    const displayArabicTokens = splitDisplayTokens(phrase.darijaArabic);
    const spokenTokens = spokenNorm.split(' ').filter(Boolean);

    const tokenMatches: TokenMatchResult[] = displayArabicTokens.map((rawToken) => {
      const normExpected = normalizeArabicScript(rawToken);
      let bestSim = 0;
      for (const sTok of spokenTokens) {
        bestSim = Math.max(bestSim, similarityRatio(normExpected, sTok));
      }
      if (spokenNorm.includes(normExpected) && normExpected.length >= 2) {
        bestSim = Math.max(bestSim, 0.92);
      }
      return {
        token: rawToken,
        matched: bestSim >= 0.6,
        similarity: bestSim,
      };
    });

    const overallSim = similarityRatio(spokenNorm, targetNorm);
    const tokenAvg =
      tokenMatches.length > 0
        ? tokenMatches.reduce((sum, item) => sum + item.similarity, 0) /
          tokenMatches.length
        : overallSim;

    const score = Math.round(Math.min(1, overallSim * 0.55 + tokenAvg * 0.45) * 100);
    const tier: PronunciationTier =
      score >= 75 ? 'excellent' : score >= 45 ? 'good' : 'retry';

    return {
      transcript: trimmed,
      score,
      tier,
      scriptMode: 'arabic',
      tokenMatches,
    };
  }

  const spokenNorm = normalizeSpokenLatin(trimmed);
  const spokenTokens = spokenNorm.split(' ').filter(Boolean);

  const candidateTargets = [
    phrase.darijaLatin,
    phrase.phoneticFrench,
    ...phrase.acceptedAnswers,
  ].map(normalizeSpokenLatin);

  let bestOverallSim = 0;
  for (const candidate of candidateTargets) {
    if (!candidate) continue;
    bestOverallSim = Math.max(bestOverallSim, similarityRatio(spokenNorm, candidate));
  }

  const tokenMatches: TokenMatchResult[] = displayLatinTokens.map((rawToken) => {
    const normExpected = normalizeSpokenLatin(rawToken);
    let bestSim = 0;
    for (const sTok of spokenTokens) {
      bestSim = Math.max(bestSim, similarityRatio(normExpected, sTok));
    }
    if (spokenNorm.includes(normExpected) && normExpected.length >= 2) {
      bestSim = Math.max(bestSim, 0.92);
    }
    return {
      token: rawToken,
      matched: bestSim >= 0.6,
      similarity: bestSim,
    };
  });

  const tokenAvg =
    tokenMatches.length > 0
      ? tokenMatches.reduce((sum, item) => sum + item.similarity, 0) /
        tokenMatches.length
      : bestOverallSim;

  const score = Math.round(
    Math.min(1, bestOverallSim * 0.55 + tokenAvg * 0.45) * 100
  );
  const tier: PronunciationTier =
    score >= 75 ? 'excellent' : score >= 45 ? 'good' : 'retry';

  return {
    transcript: trimmed,
    score,
    tier,
    scriptMode: 'latin',
    tokenMatches,
  };
}

export function formatRecordingDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
