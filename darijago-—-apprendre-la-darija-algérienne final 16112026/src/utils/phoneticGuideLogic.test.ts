import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_PHRASES } from '../data/curriculum';
import {
  analyzePhrasePhonetics,
  detectSpecialDarijaSounds,
  toSimplifiedLatinWord,
} from './phoneticGuideLogic';

test('toSimplifiedLatinWord converts Arabizi numbers into readable simplified Latin syllables', () => {
  assert.equal(toSimplifiedLatinWord('Sba7'), 'sbahh');
  assert.equal(toSimplifiedLatinWord('ya3tik'), 'yaâ-tik');
  assert.equal(toSimplifiedLatinWord('9ahwa'), 'qah-oua');
  assert.equal(toSimplifiedLatinWord('wach'), 'ouach');
});

test('detectSpecialDarijaSounds identifies 7, 3, ch, and gemination in lesson phrases', () => {
  const sba7 = ALL_PHRASES.find((p) => p.id === 'sal-3'); // Sba7 el khir, sba7 el nour
  assert.ok(sba7);
  const sba7Sounds = detectSpecialDarijaSounds(sba7, 'fr');
  const ids = sba7Sounds.map((s) => s.id);
  assert.ok(ids.includes('ha'));
  assert.ok(ids.includes('kha'));

  const sahit = ALL_PHRASES.find((p) => p.id === 'sal-4'); // Sahit, ya3tik essa7a
  assert.ok(sahit);
  const sahitSounds = detectSpecialDarijaSounds(sahit, 'en');
  assert.ok(sahitSounds.some((s) => s.id === 'ain'));
  assert.ok(sahitSounds.some((s) => s.id === 'ha'));
  assert.ok(sahitSounds.some((s) => s.id === 'gemination'));
});

test('analyzePhrasePhonetics builds word breakdowns and localized sound guides across all phrases', () => {
  for (const phrase of ALL_PHRASES) {
    const analysis = analyzePhrasePhonetics(phrase, 'fr');
    assert.ok(analysis.simplifiedSentence.length > 0);
    assert.equal(analysis.wordBreakdowns.length, phrase.breakdown.length);
    for (const wb of analysis.wordBreakdowns) {
      assert.ok(wb.simplifiedPhonetic.length > 0);
      assert.ok(wb.syllables.length >= 1);
    }
  }
});
