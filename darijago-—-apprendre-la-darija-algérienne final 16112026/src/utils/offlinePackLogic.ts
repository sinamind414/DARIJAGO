import { ARABIZI_SOUNDS, CURRICULUM_MODULES } from '../data/curriculum';
import { getCulturalStories } from '../data/stories';
import {
  getLocalizedModule,
  getLocalizedSound,
} from '../i18n/curriculumTranslations';
import type {
  AppLanguage,
  ArabiziSound,
  CulturalStory,
  LearningModule,
} from '../types/darija';
import { formatBenSediraLatinForSpeech } from './darijaSpeechFormat';
import {
  buildUnifiedDictionary,
  type UnifiedDictionaryEntry,
} from './unifiedDictionaryLogic';

export const OFFLINE_DB_NAME = 'darijago-offline-v1';
export const OFFLINE_DB_VERSION = 1;

export const OFFLINE_STORE_LESSONS = 'lessons';
export const OFFLINE_STORE_DICTIONARY = 'dictionary';
export const OFFLINE_STORE_AUDIO = 'audioClips';
export const OFFLINE_STORE_META = 'metadata';

export const OFFLINE_MODE_STORAGE_KEY = 'darijago_offline_mode_v1';
export const OFFLINE_BUNDLE_VERSION = 1;

export type OfflineLessonRecord =
  | {
      id: string;
      kind: 'module';
      language: AppLanguage;
      module: LearningModule;
    }
  | {
      id: string;
      kind: 'sound';
      language: AppLanguage;
      sound: ArabiziSound;
    }
  | {
      id: string;
      kind: 'story';
      language: AppLanguage;
      story: CulturalStory;
    };

export interface OfflineDictionaryRecord {
  id: string;
  language: AppLanguage;
  entry: UnifiedDictionaryEntry;
}

export interface OfflineAudioRecord {
  key: string;
  ar: string;
  lat: string;
  speed: 'normal' | 'slow';
  voiceName: 'Kore';
  mimeType: string;
  blob: Blob;
  sizeBytes: number;
  source: 'yasmine-static' | 'gemini-cache';
  savedAt: string;
}

export interface OfflinePackMetadata {
  id: 'pack-status';
  bundleVersion: number;
  language: AppLanguage;
  downloadedAt: string;
  modulesCount: number;
  phrasesCount: number;
  soundsCount: number;
  storiesCount: number;
  dictionaryCount: number;
  audioClipsCount: number;
  audioTargetsCount: number;
  totalBytes: number;
  offlineModeEnabled: boolean;
}

export interface OfflineDownloadProgress {
  stage: 'lessons' | 'dictionary' | 'audio' | 'finalizing';
  percent: number;
  current: number;
  total: number;
  detail: string;
}

export function buildOfflineAudioClipKey(opts: {
  textArabic: string;
  textLatin: string;
  slow?: boolean;
}): string {
  const ar = opts.textArabic.trim();
  const lat = formatBenSediraLatinForSpeech(opts.textLatin);
  const speed = opts.slow ? 'slow' : 'normal';
  return `v1|Kore|${speed}|${ar}|${lat}`;
}

export function buildOfflineLessonRecords(
  language: AppLanguage
): {
  records: OfflineLessonRecord[];
  modulesCount: number;
  phrasesCount: number;
  soundsCount: number;
  storiesCount: number;
} {
  const records: OfflineLessonRecord[] = [];
  let phrasesCount = 0;

  for (const mod of CURRICULUM_MODULES) {
    const localized = getLocalizedModule(mod, language);
    phrasesCount += localized.phrases.length;
    records.push({
      id: `module:${language}:${localized.id}`,
      kind: 'module',
      language,
      module: localized,
    });
  }

  for (const sound of ARABIZI_SOUNDS) {
    const localizedSound = getLocalizedSound(sound, language);
    records.push({
      id: `sound:${language}:${localizedSound.symbol}`,
      kind: 'sound',
      language,
      sound: localizedSound,
    });
  }

  const stories = getCulturalStories(language);
  for (const story of stories) {
    records.push({
      id: `story:${language}:${story.id}`,
      kind: 'story',
      language,
      story,
    });
  }

  return {
    records,
    modulesCount: CURRICULUM_MODULES.length,
    phrasesCount,
    soundsCount: ARABIZI_SOUNDS.length,
    storiesCount: stories.length,
  };
}

export function buildOfflineDictionaryRecords(
  language: AppLanguage
): OfflineDictionaryRecord[] {
  const entries = buildUnifiedDictionary(language);
  return entries.map((entry) => ({
    id: `${language}:${entry.id}`,
    language,
    entry,
  }));
}

export function estimatePayloadByteLength(value: unknown): number {
  try {
    const json = JSON.stringify(value);
    if (typeof TextEncoder !== 'undefined') {
      return new TextEncoder().encode(json).byteLength;
    }
    return json.length * 2;
  } catch {
    return 0;
  }
}

export function formatOfflineBytes(
  bytes: number,
  language: AppLanguage = 'fr'
): string {
  const safe = Math.max(0, Math.round(bytes));
  const useFrenchUnits = language === 'fr';
  if (safe < 1024) {
    return useFrenchUnits ? `${safe} o` : `${safe} B`;
  }
  if (safe < 1024 * 1024) {
    const kb = (safe / 1024).toFixed(safe >= 100 * 1024 ? 0 : 1);
    return useFrenchUnits ? `${kb.replace('.', ',')} Ko` : `${kb} KB`;
  }
  const mb = (safe / (1024 * 1024)).toFixed(1);
  return useFrenchUnits ? `${mb.replace('.', ',')} Mo` : `${mb} MB`;
}

export function createEmptyOfflinePackStatus(
  language: AppLanguage = 'fr',
  offlineModeEnabled = false
): OfflinePackMetadata {
  return {
    id: 'pack-status',
    bundleVersion: OFFLINE_BUNDLE_VERSION,
    language,
    downloadedAt: '',
    modulesCount: 0,
    phrasesCount: 0,
    soundsCount: 0,
    storiesCount: 0,
    dictionaryCount: 0,
    audioClipsCount: 0,
    audioTargetsCount: 0,
    totalBytes: 0,
    offlineModeEnabled,
  };
}

export function isOfflinePackReady(status: OfflinePackMetadata | null | undefined): boolean {
  return Boolean(
    status &&
      status.downloadedAt &&
      status.modulesCount > 0 &&
      status.dictionaryCount > 0
  );
}
