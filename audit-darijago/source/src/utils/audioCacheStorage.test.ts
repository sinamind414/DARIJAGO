import test from 'node:test';
import assert from 'node:assert/strict';
import { BEN_SEDIRA_DICTIONARY } from '../data/benSediraDictionary';
import { buildVerbConjugationIndex } from './conjugationLogic';
import {
  DARIJA_AUDIO_CACHE_NAME,
  buildAudioCacheKeyUrl,
  clearAudioCacheStorage,
  collectVerbOfflineAudioClips,
  countClipsCacheStatus,
  getCachedAudioClipCount,
  hasAudioClipInCache,
  readAudioBlobFromCache,
  writeAudioBase64ToCache,
  writeAudioResponseToCache,
  type CacheLike,
  type CacheStorageLike,
} from './audioCacheStorage';

function createMockCacheStorage(): CacheStorageLike {
  const stores = new Map<string, Map<string, Response>>();

  const getStore = (name: string): Map<string, Response> => {
    let map = stores.get(name);
    if (!map) {
      map = new Map<string, Response>();
      stores.set(name, map);
    }
    return map;
  };

  return {
    async open(cacheName: string): Promise<CacheLike> {
      const store = getStore(cacheName);
      return {
        async match(request: RequestInfo | URL): Promise<Response | undefined> {
          const url = typeof request === 'string' ? request : request.toString();
          const found = store.get(url);
          return found ? found.clone() : undefined;
        },
        async put(request: RequestInfo | URL, response: Response): Promise<void> {
          const url = typeof request === 'string' ? request : request.toString();
          store.set(url, response.clone());
        },
        async delete(request: RequestInfo | URL): Promise<boolean> {
          const url = typeof request === 'string' ? request : request.toString();
          return store.delete(url);
        },
        async keys(): Promise<readonly Request[]> {
          return Array.from(store.keys()).map((url) => new Request(url));
        },
      };
    },
    async delete(cacheName: string): Promise<boolean> {
      return stores.delete(cacheName);
    },
  };
}

test('buildAudioCacheKeyUrl creates canonical GET URLs per voice, speed, Arabic, and Latin text', () => {
  const normal = buildAudioCacheKeyUrl(
    {
      textArabic: 'نكتب / كتبت / كتب',
      textLatin: 'nekteb / ktebt / kteb',
      slow: false,
      voiceName: 'Kore',
    },
    'https://darijago.test'
  );
  const slow = buildAudioCacheKeyUrl(
    {
      textArabic: 'نكتب / كتبت / كتب',
      textLatin: 'nekteb / ktebt / kteb',
      slow: true,
      voiceName: 'Kore',
    },
    'https://darijago.test'
  );
  const oran = buildAudioCacheKeyUrl(
    {
      textArabic: 'نكتب / كتبت / كتب',
      textLatin: 'nekteb / ktebt / kteb',
      slow: false,
      voiceName: 'Charon',
    },
    'https://darijago.test'
  );

  assert.ok(normal.startsWith('https://darijago.test/api/tts/clip?'));
  assert.notEqual(normal, slow);
  assert.notEqual(normal, oran);
});

test('Cache API storage persists base64 and Response audio clips, reports counts, and clears cleanly', async () => {
  const storage = createMockCacheStorage();
  const origin = 'https://darijago.test';
  const sampleWavBase64 = Buffer.from('RIFF1234WAVEfmt fake-audio-payload').toString('base64');

  const clip1 = {
    textArabic: 'نكتب',
    textLatin: 'nekteb',
    slow: false,
    voiceName: 'Kore' as const,
  };
  const clip2 = {
    textArabic: 'كتبت',
    textLatin: 'ktebt',
    slow: false,
    voiceName: 'Kore' as const,
  };

  assert.equal(await hasAudioClipInCache(clip1, storage, origin), false);
  assert.equal(await getCachedAudioClipCount(storage), 0);

  const wroteBase64 = await writeAudioBase64ToCache(
    { ...clip1, audioBase64: sampleWavBase64, mimeType: 'audio/wav' },
    storage,
    origin
  );
  assert.equal(wroteBase64, true);
  assert.equal(await hasAudioClipInCache(clip1, storage, origin), true);

  const blob = await readAudioBlobFromCache(clip1, storage, origin);
  assert.ok(blob);
  assert.ok(blob.size > 10);

  // Writing an HTTP audio Response clone works and rejects non-audio error responses
  const badResp = new Response('error', {
    status: 503,
    headers: { 'Content-Type': 'application/json' },
  });
  assert.equal(await writeAudioResponseToCache(clip2, badResp, storage, origin), false);

  const goodResp = new Response(Buffer.from('RIFFabcdWAVEdata'), {
    status: 200,
    headers: { 'Content-Type': 'audio/wav' },
  });
  assert.equal(await writeAudioResponseToCache(clip2, goodResp, storage, origin), true);

  assert.equal(await getCachedAudioClipCount(storage), 2);

  const status = await countClipsCacheStatus([clip1, clip2, { ...clip2, slow: true }], storage, origin);
  assert.equal(status.total, 3);
  assert.equal(status.cached, 2);
  assert.equal(status.missing.length, 1);

  const cleared = await clearAudioCacheStorage(storage);
  assert.equal(cleared, true);
  assert.equal(await getCachedAudioClipCount(storage), 0);
  const cacheInstance = await storage.open(DARIJA_AUDIO_CACHE_NAME);
  assert.equal((await cacheInstance.keys()).length, 0);
});

test('collectVerbOfflineAudioClips builds deduplicated clips for all verb conjugations', () => {
  const index = buildVerbConjugationIndex(BEN_SEDIRA_DICTIONARY);
  const ecrire = index.find((item) => item.entry.id === 'bs-v-e-ecrire');
  assert.ok(ecrire);

  const clips = collectVerbOfflineAudioClips(ecrire, 'Charon');
  assert.ok(clips.length >= 20);
  assert.equal(
    clips.every((c) => c.voiceName === 'Charon'),
    true
  );
  // Ensure slow + normal spoken triple and all 8-person present/past/negation forms are present
  assert.equal(
    clips.some((c) => c.slow === true && c.textArabic.includes('نكتب')),
    true
  );
  assert.equal(
    clips.some((c) => c.textLatin === 'ma nektebch' && c.textArabic === 'ما نكتبش'),
    true
  );
  assert.equal(
    clips.some((c) => c.textLatin === 'ktebna' && c.textArabic === 'كتبنا'),
    true
  );
});
