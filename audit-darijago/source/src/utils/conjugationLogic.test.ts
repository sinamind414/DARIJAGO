import test from 'node:test';
import assert from 'node:assert/strict';
import { BEN_SEDIRA_DICTIONARY } from '../data/benSediraDictionary';
import {
  buildVerbConjugationIndex,
  classifyVerbDifficulty,
  computeConjugationDifficultyCounts,
  computeConjugationPatternCounts,
  extractArabicVerbRoot,
  extractLatinVerbRoot,
  filterVerbConjugationIndex,
} from './conjugationLogic';

test('extractArabicVerbRoot and extractLatinVerbRoot extract clean consonantal roots', () => {
  const arWrite = extractArabicVerbRoot('نكتب / كتبت / كتب', 'regular');
  assert.equal(arWrite.compact, 'كتب');
  assert.equal(arWrite.display, 'ك-ت-ب');

  const arDoubled = extractArabicVerbRoot('نحلّ / حلّيت / حلّ', 'doubled');
  assert.equal(arDoubled.compact, 'حلل');
  assert.equal(arDoubled.display, 'ح-ل-ل');

  const arFormV = extractArabicVerbRoot('نتعلّم / تعلّمت / تعلّم', 'derived');
  assert.equal(arFormV.compact, 'علم');

  const arFormX = extractArabicVerbRoot('نستفيد / استفدت / استفاد', 'derived');
  assert.equal(arFormX.compact, 'فاد');

  const latWrite = extractLatinVerbRoot('kteb', 'regular');
  assert.equal(latWrite.compact, 'ktb');
  assert.equal(latWrite.display, 'k-t-b');

  const latDrink = extractLatinVerbRoot('chreb', 'regular');
  assert.equal(latDrink.compact, 'chrb');
  assert.equal(latDrink.display, 'ch-r-b');
});

test('buildVerbConjugationIndex indexes all integrated verbs cleanly', () => {
  const index = buildVerbConjugationIndex(BEN_SEDIRA_DICTIONARY);
  assert.equal(index.length, 2121);

  const counts = computeConjugationPatternCounts(index);
  assert.equal(
    counts.regular + counts.doubled + counts.hollow + counts.defective + counts.derived,
    counts.all
  );

  for (const item of index) {
    assert.equal(item.tableRows.length, 8);
    assert.ok(item.latinRootCompact.length > 0);
    assert.ok(item.arabicTriple.spokenTripleArabic.length > 0);
    assert.equal(item.arabicTriple.spokenTripleArabic.includes('/'), false);
    for (const row of item.tableRows) {
      const arRow = item.arabicRows[row.personKey];
      assert.ok(arRow, `Missing Arabic row for ${item.entry.id} (${row.personKey})`);
      assert.ok(arRow.presentArabic.length > 0);
      assert.ok(arRow.pastArabic.length > 0);
      assert.ok(arRow.negativePresentArabic.length > 0);
      assert.ok(arRow.futureArabic.length > 0);
    }
    if (item.entry.conjugation?.imperative) {
      assert.ok(item.arabicImperative.length > 0);
    }
  }

  const ecrire = index.find((i) => i.entry.id === 'bs-v-e-ecrire');
  assert.ok(ecrire);
  assert.equal(ecrire.arabicRows['1s'].presentArabic, 'نكتب');
  assert.equal(ecrire.arabicRows['3ms'].presentArabic, 'يكتب');
  assert.equal(ecrire.arabicRows['1p'].presentArabic, 'نكتبو');
  assert.equal(ecrire.arabicRows['1s'].negativePresentArabic, 'ما نكتبش');
  assert.equal(ecrire.arabicRows['1p'].pastArabic, 'كتبنا');
  assert.equal(ecrire.arabicImperative, 'كتب');
});

test('filterVerbConjugationIndex supports root search and tense search accurately', () => {
  const index = buildVerbConjugationIndex(BEN_SEDIRA_DICTIONARY);

  // Search by Arabic root
  const byArabicRoot = filterVerbConjugationIndex(index, {
    query: 'ك-ت-ب',
    searchScope: 'root',
  });
  assert.equal(byArabicRoot.some((i) => i.entry.id === 'bs-v-e-ecrire'), true);
  assert.equal(byArabicRoot.some((i) => i.entry.id === 'bs-v-r-rediger'), true);

  // Search by Latin root
  const byLatinRoot = filterVerbConjugationIndex(index, {
    query: 'k-t-b',
    searchScope: 'root',
  });
  assert.equal(byLatinRoot.some((i) => i.entry.id === 'bs-v-e-ecrire'), true);

  // Search by specific tense form (Prétérit 1re sg. "h’akit" -> Raconter)
  const byPastTense = filterVerbConjugationIndex(index, {
    query: 'h’akit',
    searchScope: 'tense',
    tense: 'past',
  });
  assert.equal(byPastTense.some((i) => i.entry.id === 'bs-v-r-raconter'), true);

  // Search by negation form ("ma nakhoud'ch" -> Prendre)
  const byNegation = filterVerbConjugationIndex(index, {
    query: 'ma nakhoudch',
    searchScope: 'tense',
    tense: 'negation',
  });
  assert.equal(byNegation.some((i) => i.entry.id === 'bs-v-p-prendre'), true);

  // Filter by imperative tense
  const imperativeOnly = filterVerbConjugationIndex(index, {
    tense: 'imperative',
  });
  assert.ok(imperativeOnly.length >= 250);
  assert.equal(
    imperativeOnly.every((i) => Boolean(i.entry.conjugation?.imperative)),
    true
  );

  // File 8 verbs (R continuation & S start)
  const byRire = filterVerbConjugationIndex(index, {
    query: 'd’ah’akt',
    searchScope: 'tense',
    tense: 'past',
  });
  assert.equal(byRire.some((i) => i.entry.id === 'bs-v-r-rire'), true);

  const bySortir = filterVerbConjugationIndex(index, {
    query: 'kherejt',
    searchScope: 'tense',
    tense: 'past',
  });
  assert.equal(bySortir.some((i) => i.entry.id === 'bs-v-s-sortir'), true);

  const bySavoirRoot = filterVerbConjugationIndex(index, {
    query: 'ع-ر-ف',
    searchScope: 'root',
  });
  assert.equal(bySavoirRoot.some((i) => i.entry.id === 'bs-v-s-savoir'), true);

  // File 9 verbs (S continuation, T, U, V start)
  const byTomber = filterVerbConjugationIndex(index, {
    query: 'touh’t',
    searchScope: 'tense',
    tense: 'past',
  });
  assert.equal(byTomber.some((i) => i.entry.id === 'bs-v-t-tomber'), true);

  const byUnir = filterVerbConjugationIndex(index, {
    query: 'ج-م-ع',
    searchScope: 'root',
  });
  assert.equal(byUnir.some((i) => i.entry.id === 'bs-v-u-unir'), true);

  const byVivre = filterVerbConjugationIndex(index, {
    query: 'âcht',
    searchScope: 'tense',
    tense: 'past',
  });
  assert.equal(byVivre.some((i) => i.entry.id === 'bs-v-v-vivre'), true);

  // File 10 verbs (V fin, Y, Z)
  const byVoir = filterVerbConjugationIndex(index, {
    query: 'chouf',
    searchScope: 'tense',
    tense: 'imperative',
  });
  assert.equal(byVoir.some((i) => i.entry.id === 'bs-v-v-voir'), true);

  const byVouloir = filterVerbConjugationIndex(index, {
    query: 'h’abbit',
    searchScope: 'tense',
    tense: 'past',
  });
  assert.equal(byVouloir.some((i) => i.entry.id === 'bs-v-v-vouloir'), true);

  const byYouyou = filterVerbConjugationIndex(index, {
    query: 'nzer’ret',
    searchScope: 'tense',
    tense: 'present',
  });
  assert.equal(byYouyou.some((i) => i.entry.id === 'bs-v-y-youyou-pousser'), true);

  const byZezayer = filterVerbConjugationIndex(index, {
    query: 'nlesles',
    searchScope: 'tense',
    tense: 'present',
  });
  assert.equal(byZezayer.some((i) => i.entry.id === 'bs-v-z-zezayer'), true);
});

test('classifyVerbDifficulty and difficulty filters partition all 2,121 verbs cleanly', () => {
  const index = buildVerbConjugationIndex(BEN_SEDIRA_DICTIONARY);
  const diffCounts = computeConjugationDifficultyCounts(index);

  assert.equal(diffCounts.all, 2121);
  assert.equal(
    diffCounts.beginner + diffCounts.intermediate + diffCounts.advanced,
    diffCounts.all
  );
  assert.ok(diffCounts.beginner >= 400);
  assert.ok(diffCounts.intermediate >= 800);
  assert.ok(diffCounts.advanced >= 250);

  const byId = new Map(index.map((item) => [item.entry.id, item]));

  // Essential beginner survival verbs
  for (const id of [
    'bs-v-e-etre',
    'bs-v-a-avoir',
    'bs-v-f-faire',
    'bs-v-e-ecrire',
    'bs-v-p-parler',
    'bs-v-v-voir',
    'bs-v-v-vouloir',
  ]) {
    const item = byId.get(id);
    assert.ok(item, `Missing expected verb ${id}`);
    assert.equal(item.difficulty, 'beginner', `${id} should be beginner`);
    assert.equal(classifyVerbDifficulty(item.entry), 'beginner');
  }

  // Hollow / doubled / defective non-core verbs should be intermediate
  for (const id of ['bs-v-r-raconter', 'bs-v-t-tomber']) {
    const item = byId.get(id);
    assert.ok(item, `Missing expected verb ${id}`);
    assert.equal(item.difficulty, 'intermediate', `${id} should be intermediate`);
  }

  // Reflexive, multi-word idioms, and quadriliteral/complex stems should be advanced
  for (const id of [
    'bs-v-a-abstenir-s',
    'bs-v-y-youyou-pousser',
    'bs-v-f-faire-adieux',
  ]) {
    const item = byId.get(id);
    assert.ok(item, `Missing expected verb ${id}`);
    assert.equal(item.difficulty, 'advanced', `${id} should be advanced`);
  }

  // Disjoint filtering by difficulty
  const beginners = filterVerbConjugationIndex(index, { difficulty: 'beginner' });
  const intermediates = filterVerbConjugationIndex(index, { difficulty: 'intermediate' });
  const advanced = filterVerbConjugationIndex(index, { difficulty: 'advanced' });
  assert.equal(beginners.length, diffCounts.beginner);
  assert.equal(intermediates.length, diffCounts.intermediate);
  assert.equal(advanced.length, diffCounts.advanced);
  assert.equal(
    beginners.every((i) => i.difficulty === 'beginner'),
    true
  );

  // Combining difficulty + root search
  const beginnerKtb = filterVerbConjugationIndex(index, {
    difficulty: 'beginner',
    query: 'k-t-b',
    searchScope: 'root',
  });
  assert.equal(beginnerKtb.some((i) => i.entry.id === 'bs-v-e-ecrire'), true);
});

