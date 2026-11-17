import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildOfflineAudioClipKey,
  buildOfflineDictionaryRecords,
  buildOfflineLessonRecords,
  createEmptyOfflinePackStatus,
  formatOfflineBytes,
  isOfflinePackReady,
} from './offlinePackLogic';
import {
  findStaticYasmineClip,
  type YasmineStaticManifest,
} from './yasmineStaticManifest';

test('buildOfflineLessonRecords collects all 7 modules, 42 phrases, sounds, and stories', () => {
  const fr = buildOfflineLessonRecords('fr');
  assert.equal(fr.modulesCount, 7);
  assert.equal(fr.phrasesCount, 42);
  assert.equal(fr.soundsCount, 6);
  assert.equal(fr.storiesCount, 3);
  assert.equal(fr.records.length, 7 + 6 + 3);

  const en = buildOfflineLessonRecords('en');
  const firstMod = en.records.find((r) => r.kind === 'module');
  assert.ok(firstMod && firstMod.kind === 'module');
  assert.equal(firstMod.module.title, 'Greetings & Politeness');
});

test('buildOfflineDictionaryRecords indexes all unified dictionary entries for IndexedDB', () => {
  const records = buildOfflineDictionaryRecords('fr');
  assert.ok(records.length >= 7000);
  const first = records[0];
  assert.ok(first.id.startsWith('fr:'));
  assert.ok(first.entry.headword.length > 0);
  assert.ok(first.entry.darijaLatin.length > 0);
});

test('buildOfflineAudioClipKey normalizes speed and text deterministically', () => {
  const k1 = buildOfflineAudioClipKey({
    textArabic: ' السلام عليكم ',
    textLatin: 'Salam alikoum',
    slow: false,
  });
  const k2 = buildOfflineAudioClipKey({
    textArabic: 'السلام عليكم',
    textLatin: 'Salam alikoum',
    slow: false,
  });
  const kSlow = buildOfflineAudioClipKey({
    textArabic: 'السلام عليكم',
    textLatin: 'Salam alikoum',
    slow: true,
  });
  assert.equal(k1, k2);
  assert.notEqual(k1, kSlow);
  assert.ok(k1.includes('|Kore|normal|'));
  assert.ok(kSlow.includes('|Kore|slow|'));
});

test('findStaticYasmineClip matches exact normal clips and falls back cleanly for slow playback', () => {
  const manifest: YasmineStaticManifest = {
    version: 1,
    voice: 'Kore',
    speakerName: 'Yasmine',
    city: 'Alger',
    generatedAt: '2026-11-16T00:00:00Z',
    totalTargets: 2,
    clips: [
      {
        id: '3a5ad3dcb70d95f6',
        ar: 'السلام عليكم، واش راك؟',
        lat: 'Salam alikoum, wach rak?',
        speed: 'normal',
        file: '/audio/yasmine/3a5ad3dcb70d95f6.mp3',
        mimeType: 'audio/mpeg',
        bytes: 28000,
        category: 'lesson',
      },
      {
        id: '259171fe83dddc6b',
        ar: 'لاباس',
        lat: 'Labes',
        speed: 'normal',
        file: '/audio/yasmine/259171fe83dddc6b.mp3',
        mimeType: 'audio/mpeg',
        bytes: 13000,
        category: 'dictionary',
      },
    ],
  };

  const normalMatch = findStaticYasmineClip(manifest, {
    textArabic: 'السلام عليكم، واش راك؟',
    textLatin: 'Salam alikoum, wach rak?',
    slow: false,
  });
  assert.ok(normalMatch);
  assert.equal(normalMatch.playbackRate, 1);
  assert.equal(normalMatch.clip.file, '/audio/yasmine/3a5ad3dcb70d95f6.mp3');

  const slowFallbackMatch = findStaticYasmineClip(manifest, {
    textArabic: 'لاباس',
    textLatin: 'Labes',
    slow: true,
  });
  assert.ok(slowFallbackMatch);
  assert.equal(slowFallbackMatch.playbackRate, 0.74);
  assert.equal(slowFallbackMatch.clip.file, '/audio/yasmine/259171fe83dddc6b.mp3');

  const missing = findStaticYasmineClip(manifest, {
    textArabic: 'كلمة غير موجودة',
    textLatin: 'nonexistent',
    slow: false,
  });
  assert.equal(missing, null);
});

test('formatOfflineBytes and isOfflinePackReady report storage state accurately', () => {
  assert.equal(formatOfflineBytes(512, 'fr'), '512 o');
  assert.equal(formatOfflineBytes(15 * 1024, 'fr'), '15,0 Ko');
  assert.equal(formatOfflineBytes(3.5 * 1024 * 1024, 'en'), '3.5 MB');

  const empty = createEmptyOfflinePackStatus('fr');
  assert.equal(isOfflinePackReady(empty), false);

  const ready = {
    ...empty,
    downloadedAt: '2026-11-16T12:00:00Z',
    modulesCount: 7,
    phrasesCount: 42,
    dictionaryCount: 7247,
    audioClipsCount: 14,
  };
  assert.equal(isOfflinePackReady(ready), true);
});
