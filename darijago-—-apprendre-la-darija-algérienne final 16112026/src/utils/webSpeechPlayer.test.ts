import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWebSpeechUtteranceSpec,
  estimateSimulatedSpeechDurationMs,
  formatArabiziForWebSpeech,
  selectArabicVoice,
  selectLatinVoice,
} from './webSpeechPlayer';

test('formatArabiziForWebSpeech converts Arabizi numerals cleanly for speech output', () => {
  assert.equal(
    formatArabiziForWebSpeech('Sba7 el khir, 3la slamtek'),
    'Sbah el khir, ala slamtek'
  );
  assert.equal(formatArabiziForWebSpeech('9ahwa w 5obz'), 'qahoua ou khobz');
  assert.equal(
    formatArabiziForWebSpeech('   ', '[Ya-tik es-sa-ha]'),
    'Ya-tik es-sa-ha'
  );
});

test('selectArabicVoice prioritizes Algerian and Maghrebi Arabic voices', () => {
  const voices = [
    { lang: 'fr-FR', name: 'Thomas' },
    { lang: 'ar-SA', name: 'Majed' },
    { lang: 'ar-DZ', name: 'Amina' },
  ];
  assert.equal(selectArabicVoice(voices)?.name, 'Amina');
  assert.equal(
    selectArabicVoice([
      { lang: 'en-US', name: 'Samantha' },
      { lang: 'ar-MA', name: 'Kenza' },
    ])?.name,
    'Kenza'
  );
  assert.equal(selectArabicVoice([{ lang: 'fr-FR', name: 'Thomas' }]), null);
});

test('selectLatinVoice chooses French voice before default fallback', () => {
  const voices = [
    { lang: 'en-US', name: 'Samantha', default: true },
    { lang: 'fr-FR', name: 'Amélie' },
  ];
  assert.equal(selectLatinVoice(voices)?.name, 'Amélie');
  assert.equal(
    selectLatinVoice([{ lang: 'en-US', name: 'Samantha', default: true }])?.name,
    'Samantha'
  );
});

test('buildWebSpeechUtteranceSpec selects Arabic script when Arabic voice exists and Arabizi fallback otherwise', () => {
  const phrase = {
    darijaArabic: 'صباح الخير، واش راك؟',
    darijaLatin: 'Sba7 el khir, wach rak?',
    phoneticFrench: 'Sbah el khir, ouach rak?',
  };

  const withArabicVoice = buildWebSpeechUtteranceSpec(phrase, [
    { lang: 'ar-DZ', name: 'Algerian Voice' },
    { lang: 'fr-FR', name: 'French Voice' },
  ]);
  assert.equal(withArabicVoice.scriptMode, 'arabic');
  assert.equal(withArabicVoice.text, 'صباح الخير، واش راك؟');
  assert.equal(withArabicVoice.lang, 'ar-DZ');
  assert.equal(withArabicVoice.matchedVoiceName, 'Algerian Voice');

  const withoutArabicVoice = buildWebSpeechUtteranceSpec(phrase, [
    { lang: 'fr-FR', name: 'French Voice' },
  ]);
  assert.equal(withoutArabicVoice.scriptMode, 'arabizi');
  assert.equal(withoutArabicVoice.text, 'Sbah el khir, ouach rak?');
  assert.equal(withoutArabicVoice.lang, 'fr-FR');
  assert.equal(withoutArabicVoice.matchedVoiceName, 'French Voice');

  const forcedArabic = buildWebSpeechUtteranceSpec(
    { ...phrase, preferScript: 'arabic', slow: true },
    []
  );
  assert.equal(forcedArabic.scriptMode, 'arabic');
  assert.equal(forcedArabic.lang, 'ar-DZ');
  assert.equal(forcedArabic.rate, 0.72);
});

test('estimateSimulatedSpeechDurationMs scales naturally with text length and slow speed', () => {
  const shortMs = estimateSimulatedSpeechDurationMs('Salam', false);
  const longMs = estimateSimulatedSpeechDurationMs(
    'Salam alikoum, wach rak khouya el youm? Kolchi labes?',
    false
  );
  const slowLongMs = estimateSimulatedSpeechDurationMs(
    'Salam alikoum, wach rak khouya el youm? Kolchi labes?',
    true
  );

  assert.ok(shortMs >= 1100);
  assert.ok(longMs > shortMs);
  assert.ok(slowLongMs > longMs);
  assert.ok(slowLongMs <= 7000);
});

test('selectArabicVoice normalizes underscore locales, ranks ar-EG/ar-SA, and falls back to Arabic voice names', () => {
  assert.equal(
    selectArabicVoice([
      { lang: 'ar-SA', name: 'Majed' },
      { lang: 'ar_DZ', name: 'Android Algerian' },
    ])?.name,
    'Android Algerian'
  );
  assert.equal(
    selectArabicVoice([
      { lang: 'ar-KW', name: 'Kuwait Voice' },
      { lang: 'ar-EG', name: 'Hoda' },
    ])?.name,
    'Hoda'
  );
  assert.equal(
    selectArabicVoice([
      { lang: 'en-US', name: 'Samantha' },
      { lang: 'und', name: 'Google Arabic Female' },
    ])?.name,
    'Google Arabic Female'
  );
});

test('buildWebSpeechUtteranceSpec handles single dictionary words with appropriate Arabic voice', () => {
  const word = {
    darijaArabic: 'قهوة',
    darijaLatin: 'qahwa',
    phoneticFrench: 'qah-oua',
  };

  const withSaudiArabic = buildWebSpeechUtteranceSpec(word, [
    { lang: 'fr-FR', name: 'Thomas' },
    { lang: 'ar-SA', name: 'Majed' },
  ]);
  assert.equal(withSaudiArabic.scriptMode, 'arabic');
  assert.equal(withSaudiArabic.text, 'قهوة');
  assert.equal(withSaudiArabic.lang, 'ar-SA');
  assert.equal(withSaudiArabic.matchedVoiceName, 'Majed');

  const withoutArabic = buildWebSpeechUtteranceSpec(word, [
    { lang: 'fr-FR', name: 'Thomas' },
  ]);
  assert.equal(withoutArabic.scriptMode, 'arabizi');
  assert.equal(withoutArabic.text, 'qahoua');
  assert.equal(withoutArabic.lang, 'fr-FR');
});

test('selectArabicVoice and selectLatinVoice prefer female voices when multiple voices exist in the same locale', () => {
  assert.equal(
    selectArabicVoice([
      { lang: 'ar-SA', name: 'Majed' },
      { lang: 'ar-SA', name: 'Salma' },
    ])?.name,
    'Salma'
  );
  assert.equal(
    selectArabicVoice([
      { lang: 'ar-DZ', name: 'Karim Male' },
      { lang: 'ar-DZ', name: 'Amina Female' },
    ])?.name,
    'Amina Female'
  );
  assert.equal(
    selectLatinVoice([
      { lang: 'fr-FR', name: 'Thomas' },
      { lang: 'fr-FR', name: 'Amélie' },
    ])?.name,
    'Amélie'
  );
});


