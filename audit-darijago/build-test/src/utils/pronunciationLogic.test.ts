import test from 'node:test';
import assert from 'node:assert/strict';
import {
  comparePronunciation,
  formatRecordingDuration,
  normalizeArabicScript,
  normalizeSpokenLatin,
} from './pronunciationLogic';

const SAMPLE_PHRASE = {
  darijaLatin: 'Salam alikoum, wach rak?',
  darijaArabic: 'السلام عليكم، واش راك؟',
  phoneticFrench: 'Sa-lam a-li-koum, ouach rak ?',
  acceptedAnswers: ['salam alikoum wach rak', 'salam alikom wach rak'],
};

test('normalizeArabicScript strips diacritics and normalizes alef/punctuation', () => {
  assert.equal(
    normalizeArabicScript('السَّلَامُ عَلَيْكُمْ، وَاشْ رَاك؟'),
    'السلام عليكم واش راك'
  );
});

test('normalizeSpokenLatin unifies French phonetic and Arabizi variants', () => {
  assert.equal(
    normalizeSpokenLatin('Sa-lam a-li-koum, ouach rak?'),
    normalizeSpokenLatin('Salam alikom wach rak')
  );
});

test('comparePronunciation scores exact Arabic Web Speech transcripts as excellent', () => {
  const result = comparePronunciation('السلام عليكم واش راك', SAMPLE_PHRASE);
  assert.equal(result.scriptMode, 'arabic');
  assert.equal(result.tier, 'excellent');
  assert.ok(result.score >= 90);
  assert.equal(result.tokenMatches.length, 4);
  assert.ok(result.tokenMatches.every((t) => t.matched));
});

test('comparePronunciation scores French phonetic transcripts as excellent', () => {
  const result = comparePronunciation('salam alikoum ouach rak', SAMPLE_PHRASE);
  assert.equal(result.scriptMode, 'latin');
  assert.equal(result.tier, 'excellent');
  assert.ok(result.score >= 80);
  assert.ok(result.tokenMatches.every((t) => t.matched));
});

test('comparePronunciation detects partial matches and unrelated speech cleanly', () => {
  const partial = comparePronunciation('السلام عليكم', SAMPLE_PHRASE);
  assert.equal(partial.scriptMode, 'arabic');
  assert.ok(partial.score >= 35 && partial.score < 85);
  assert.equal(partial.tokenMatches[0]?.matched, true);
  assert.equal(partial.tokenMatches[3]?.matched, false);

  const unrelated = comparePronunciation('bonjour je prends un taxi', SAMPLE_PHRASE);
  assert.equal(unrelated.tier, 'retry');
  assert.ok(unrelated.score < 45);
});

test('comparePronunciation handles empty transcripts and formats duration', () => {
  const empty = comparePronunciation('   ', SAMPLE_PHRASE);
  assert.equal(empty.score, 0);
  assert.equal(empty.tier, 'retry');
  assert.ok(empty.tokenMatches.every((t) => !t.matched));

  assert.equal(formatRecordingDuration(0), '0:00');
  assert.equal(formatRecordingDuration(4.8), '0:04');
  assert.equal(formatRecordingDuration(65), '1:05');
});
