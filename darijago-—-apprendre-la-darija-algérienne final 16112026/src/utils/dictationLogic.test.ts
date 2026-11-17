import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_PHRASES } from '../data/curriculum';
import {
  buildDictationDeck,
  computeDictationHintMask,
  evaluateDictationAttempt,
  normalizeDictationLatin,
} from './dictationLogic';

test('normalizeDictationLatin unifies Arabizi numerals and Algerian Latin variants', () => {
  assert.equal(
    normalizeDictationLatin('Sba7 el khir!'),
    normalizeDictationLatin('Sbah el khir')
  );
  assert.equal(
    normalizeDictationLatin('Salam alikoum, wach rak?'),
    normalizeDictationLatin('Salam alikum wash rak')
  );
  assert.equal(
    normalizeDictationLatin('9ahwa b 5obz'),
    normalizeDictationLatin('kahwa b khobz')
  );
});

test('buildDictationDeck respects unit filter, count, and deterministic seed', () => {
  const deckA = buildDictationDeck(ALL_PHRASES, 'all', 3, 'fr', 8);
  const deckB = buildDictationDeck(ALL_PHRASES, 'all', 3, 'fr', 8);
  assert.equal(deckA.length, 8);
  assert.deepEqual(
    deckA.map((item) => item.phrase.id),
    deckB.map((item) => item.phrase.id)
  );

  const targetModuleId = ALL_PHRASES[0].moduleId;
  const unitDeck = buildDictationDeck(ALL_PHRASES, targetModuleId, 1, 'en', 6);
  assert.ok(unitDeck.length > 0);
  assert.ok(unitDeck.every((item) => item.phrase.moduleId === targetModuleId));
});

test('evaluateDictationAttempt validates exact, Arabizi variant, Arabic script, partial, and empty inputs', () => {
  const target = ALL_PHRASES[0]; // Salam alikoum, wach rak?

  const exact = evaluateDictationAttempt('Salam alikoum, wach rak?', target);
  assert.equal(exact.isCorrect, true);
  assert.equal(exact.accuracyPercent, 100);
  assert.ok(exact.wordFeedback.every((w) => w.status === 'match'));

  const variant = evaluateDictationAttempt('salam alikum wash rak', target);
  assert.equal(variant.isCorrect, true);
  assert.equal(variant.accuracyPercent, 100);

  const arabic = evaluateDictationAttempt(target.darijaArabic, target);
  assert.equal(arabic.isCorrect, true);
  assert.equal(arabic.isArabicMatch, true);
  assert.equal(arabic.accuracyPercent, 100);

  const partialOnly = evaluateDictationAttempt('Salam', target);
  assert.equal(partialOnly.isCorrect, false);
  assert.equal(partialOnly.wordFeedback[0].status, 'match');
  assert.equal(partialOnly.wordFeedback[1].status, 'missing');

  const empty = evaluateDictationAttempt('   ', target);
  assert.equal(empty.isCorrect, false);
  assert.equal(empty.accuracyPercent, 0);
  assert.ok(empty.wordFeedback.every((w) => w.status === 'missing'));
});

test('computeDictationHintMask preserves initial letters and punctuation cleanly', () => {
  assert.equal(
    computeDictationHintMask('Salam alikoum, wach rak?'),
    'S____ a______, w___ r__?'
  );
});
