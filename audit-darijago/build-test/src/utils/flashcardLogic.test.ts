import assert from 'node:assert/strict';
import test from 'node:test';
import { BEN_SEDIRA_DICTIONARY } from '../data/benSediraDictionary';
import { buildVerbConjugationIndex, filterVerbConjugationIndex } from './conjugationLogic';
import {
  buildVerbFlashcardDeck,
  computeFlashcardSessionStats,
  deriveFutureForm,
  evaluateFlashcardTyping,
} from './flashcardLogic';

test('deriveFutureForm produces authentic Algerian ghadi + aorist and special avoir/être forms', () => {
  const index = buildVerbConjugationIndex(BEN_SEDIRA_DICTIONARY);
  const ecrire = index.find((item) => item.entry.frenchHeadword === 'Écrire');
  assert.ok(ecrire);
  assert.equal(deriveFutureForm(ecrire.tableRows[0], ecrire.entry), 'ghadi nekteb');
  assert.equal(deriveFutureForm(ecrire.tableRows[3], ecrire.entry), 'ghadi ikteb');

  const avoir = index.find((item) => item.entry.id === 'bs-v-a-avoir');
  assert.ok(avoir);
  assert.equal(deriveFutureForm(avoir.tableRows[0], avoir.entry), 'ikoun ândi');

  const etre = index.find((item) => item.entry.id === 'bs-v-e-etre');
  assert.ok(etre);
  assert.equal(deriveFutureForm(etre.tableRows[0], etre.entry), 'nkoun');
});

test('buildVerbFlashcardDeck distributes past, present, and future forms in mixed mode and respects single-tense modes', () => {
  const index = buildVerbConjugationIndex(BEN_SEDIRA_DICTIONARY);

  const mixedDeck = buildVerbFlashcardDeck(index, {
    tenseMode: 'mixed',
    personScope: 'core',
    deckSize: 12,
    seed: 42,
  });
  assert.equal(mixedDeck.length, 12);

  const tensesSeen = new Set(mixedDeck.map((c) => c.tense));
  assert.equal(tensesSeen.has('past'), true);
  assert.equal(tensesSeen.has('present'), true);
  assert.equal(tensesSeen.has('future'), true);

  for (const card of mixedDeck) {
    assert.ok(card.answerLatin.length > 0);
    assert.ok(card.answerArabic.length > 0);
    assert.ok(card.allForms.present.length > 0);
    assert.ok(card.allForms.past.length > 0);
    assert.ok(card.allArabicForms.present.length > 0);
    assert.ok(card.allArabicForms.past.length > 0);
    assert.ok(card.allArabicForms.future.length > 0);
    assert.ok(card.allArabicForms.negativePresent.length > 0);
    assert.ok(card.allForms.future.startsWith('ghadi ') || card.allForms.future.includes('koun'));
  }

  const futureDeck = buildVerbFlashcardDeck(index, {
    tenseMode: 'future',
    personScope: 'all8',
    deckSize: 10,
    seed: 7,
  });
  assert.equal(futureDeck.length, 10);
  assert.equal(futureDeck.every((c) => c.tense === 'future'), true);

  // Filtered pool (root ktb)
  const ktbPool = filterVerbConjugationIndex(index, { query: 'ktb', searchScope: 'root' });
  const ktbDeck = buildVerbFlashcardDeck(ktbPool, { deckSize: 6, seed: 3 });
  assert.equal(ktbDeck.length, 6);
  assert.equal(
    ktbDeck.every((c) => c.latinRoot.replace(/-/g, '').includes('ktb')),
    true
  );
});

test('evaluateFlashcardTyping and computeFlashcardSessionStats work accurately', () => {
  assert.equal(evaluateFlashcardTyping('ghadi nekteb', 'ghadi nekteb'), true);
  assert.equal(evaluateFlashcardTyping('hakit', "h’akit"), true);
  assert.equal(evaluateFlashcardTyping('rani', 'rani (nkoun)'), true);
  assert.equal(evaluateFlashcardTyping('ktebt', 'ghadi nekteb'), false);

  const index = buildVerbConjugationIndex(BEN_SEDIRA_DICTIONARY);
  const deck = buildVerbFlashcardDeck(index.slice(0, 10), { deckSize: 4, seed: 11 });
  const stats = computeFlashcardSessionStats(deck, {
    [deck[0].id]: 'known',
    [deck[1].id]: 'review',
  });
  assert.deepEqual(stats, {
    total: 4,
    answered: 2,
    known: 1,
    review: 1,
    remaining: 2,
    percent: 50,
  });
});
