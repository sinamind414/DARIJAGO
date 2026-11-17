import { formatBenSediraLatinForSpeech } from './darijaSpeechFormat';

export interface YasmineManifestClip {
  id: string;
  ar: string;
  lat: string;
  speed: 'normal' | 'slow';
  file: string;
  mimeType: string;
  bytes: number;
  category: 'lesson' | 'sound' | 'dictionary' | 'conjugation';
}

export interface YasmineStaticManifest {
  version: number;
  voice: 'Kore';
  speakerName: string;
  city: string;
  generatedAt: string;
  totalTargets: number;
  clips: YasmineManifestClip[];
}

export interface StaticYasmineMatch {
  clip: YasmineManifestClip;
  playbackRate: number;
}

function normalizeAr(raw?: string): string {
  return (raw ?? '')
    .replace(/\s*\/\s*/g, '، ')
    .replace(/\(.*?\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeLat(raw?: string): string {
  return formatBenSediraLatinForSpeech(raw ?? '').toLowerCase().trim();
}

export function findStaticYasmineClip(
  manifest: YasmineStaticManifest | null | undefined,
  query: {
    textArabic?: string;
    textLatin?: string;
    slow?: boolean;
  }
): StaticYasmineMatch | null {
  if (!manifest || !Array.isArray(manifest.clips) || manifest.clips.length === 0) {
    return null;
  }

  const targetSpeed: 'normal' | 'slow' = query.slow ? 'slow' : 'normal';
  const ar = normalizeAr(query.textArabic);
  const lat = normalizeLat(query.textLatin);

  if (!ar && !lat) return null;

  const findForSpeed = (speed: 'normal' | 'slow'): YasmineManifestClip | null => {
    const bySpeed = manifest.clips.filter((c) => c.speed === speed);
    if (bySpeed.length === 0) return null;

    if (ar && lat) {
      const exactBoth = bySpeed.find(
        (c) => normalizeAr(c.ar) === ar && normalizeLat(c.lat) === lat
      );
      if (exactBoth) return exactBoth;
    }

    if (ar) {
      const exactAr = bySpeed.find((c) => normalizeAr(c.ar) === ar);
      if (exactAr) return exactAr;
    }

    if (lat) {
      const exactLat = bySpeed.find((c) => normalizeLat(c.lat) === lat);
      if (exactLat) return exactLat;
    }

    return null;
  };

  const exactSpeedMatch = findForSpeed(targetSpeed);
  if (exactSpeedMatch) {
    return {
      clip: exactSpeedMatch,
      playbackRate: 1,
    };
  }

  // If slow speed was requested and only a normal-speed Yasmine clip is bundled,
  // reuse Yasmine's exact recording at 0.74x speed with pitch preservation.
  if (targetSpeed === 'slow') {
    const normalFallback = findForSpeed('normal');
    if (normalFallback) {
      return {
        clip: normalFallback,
        playbackRate: 0.74,
      };
    }
  }

  return null;
}

let cachedManifest: YasmineStaticManifest | null = null;
let manifestPromise: Promise<YasmineStaticManifest | null> | null = null;

export function getCachedYasmineStaticManifest(): YasmineStaticManifest | null {
  return cachedManifest;
}

export function resetYasmineStaticManifestCache(): void {
  cachedManifest = null;
  manifestPromise = null;
}

export async function loadYasmineStaticManifest(
  forceRefresh = false
): Promise<YasmineStaticManifest | null> {
  if (cachedManifest && !forceRefresh) {
    return cachedManifest;
  }
  if (typeof window === 'undefined' || typeof fetch === 'undefined') {
    return null;
  }
  if (manifestPromise && !forceRefresh) {
    return manifestPromise;
  }

  manifestPromise = (async () => {
    try {
      const resp = await fetch('/audio/yasmine/manifest.json', {
        method: 'GET',
        cache: forceRefresh ? 'no-cache' : 'default',
      });
      if (!resp.ok) return cachedManifest;
      const data = (await resp.json()) as YasmineStaticManifest;
      if (data && Array.isArray(data.clips)) {
        cachedManifest = data;
        return data;
      }
      return cachedManifest;
    } catch {
      return cachedManifest;
    } finally {
      manifestPromise = null;
    }
  })();

  return manifestPromise;
}
