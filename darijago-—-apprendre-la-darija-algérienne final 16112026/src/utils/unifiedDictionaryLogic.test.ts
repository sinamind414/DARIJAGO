import test from 'node:test';
import assert from 'node:assert/strict';
import { BEN_SEDIRA_DICTIONARY } from '../data/benSediraDictionary';
import {
  buildUnifiedDictionary,
  classifyCurriculumTokenCategory,
  computeGrammaticalCategoryCounts,
  computeUnifiedSourceCounts,
  computeUnifiedVerbPatternCounts,
  searchUnifiedDictionary,
} from './unifiedDictionaryLogic';

test('buildUnifiedDictionary integrates all 4 reference books plus curriculum phrases and tokens with unique IDs', () => {
  const entries = buildUnifiedDictionary('fr');
  assert.ok(entries.length > BEN_SEDIRA_DICTIONARY.length);

  const ids = new Set<string>();
  for (const entry of entries) {
    assert.equal(ids.has(entry.id), false, `Duplicate ID: ${entry.id}`);
    ids.add(entry.id);
  }

  const sources = computeUnifiedSourceCounts(entries);
  assert.ok(sources.curriculum > 100);
  assert.ok(sources['ben-sedira'] >= 2150);
  assert.ok(sources.aziri >= 4000);
  assert.ok(sources.tapiero >= 300);
  assert.ok(sources.tadjer >= 380);
  assert.equal(
    sources.curriculum +
      sources['ben-sedira'] +
      sources.aziri +
      sources.tapiero +
      sources.tadjer,
    sources.all
  );
});

test('computeGrammaticalCategoryCounts covers all grammatical categories accurately', () => {
  const entries = buildUnifiedDictionary('fr');
  const counts = computeGrammaticalCategoryCounts(entries);
  const sum =
    counts.verb +
    counts.noun +
    counts.adjective +
    counts.expression +
    counts['time-number'] +
    counts.grammar;
  assert.equal(sum, counts.all);
  assert.ok(counts.verb > 6900);
  assert.ok(counts.noun > 80);
  assert.ok(counts.expression > 60);
  assert.ok(counts.grammar > 50);
  assert.ok(counts['time-number'] >= 29);
  assert.ok(counts.adjective >= 13);

  const verbPatterns = computeUnifiedVerbPatternCounts(entries);
  assert.ok(verbPatterns.all >= 6900);
});

test('classifyCurriculumTokenCategory classifies grammatical categories cleanly', () => {
  assert.equal(classifyCurriculumTokenCategory('rak', 'es-tu'), 'verb');
  assert.equal(classifyCurriculumTokenCategory('wach', 'quoi / comment'), 'grammar');
  assert.equal(classifyCurriculumTokenCategory('9ahwa', 'café'), 'noun');
  assert.equal(classifyCurriculumTokenCategory('ghalya', 'chère'), 'adjective');
  assert.equal(classifyCurriculumTokenCategory('lyoum', "aujourd'hui"), 'time-number');
  assert.equal(
    classifyCurriculumTokenCategory('Salam alikoum', 'Bonjour'),
    'expression'
  );
});

test('searchUnifiedDictionary performs full-text, multi-word, Arabizi, Arabic, and category filtering with relevance ranking', () => {
  const entries = buildUnifiedDictionary('fr');

  // Exact/primary headword match ranks first
  const byPrendre = searchUnifiedDictionary(entries, { query: 'prendre' });
  assert.ok(byPrendre.length > 0);
  assert.equal(byPrendre[0].headword.toLowerCase(), 'prendre');

  // Search across conjugated verb form
  const byConjugation = searchUnifiedDictionary(entries, {
    query: 'nakhoud',
    category: 'verb',
  });
  assert.ok(byConjugation.some((e) => e.id === 'bs-v-p-prendre'));

  // Search across curriculum phrase with Arabizi
  const byArabizi = searchUnifiedDictionary(entries, {
    query: '3la slamtek',
  });
  assert.ok(byArabizi.length >= 1);

  // Full-text multi-word query spanning fields (headword + usage/context)
  const multiWord = searchUnifiedDictionary(entries, {
    query: 'cafe qahwa',
  });
  assert.ok(multiWord.length >= 1);

  // Arabic script full-text search
  const byArabic = searchUnifiedDictionary(entries, { query: 'نشرب' });
  assert.ok(byArabic.some((e) => e.id === 'bs-v-b-boire'));

  // Grammatical category filter isolates category strictly
  const nounsOnly = searchUnifiedDictionary(entries, { category: 'noun' });
  assert.ok(nounsOnly.length > 70);
  assert.equal(nounsOnly.every((e) => e.category === 'noun'), true);

  const grammarOnly = searchUnifiedDictionary(entries, { category: 'grammar' });
  assert.ok(grammarOnly.length > 34);
  assert.equal(grammarOnly.every((e) => e.category === 'grammar'), true);

  // Localized curriculum search works in English too
  const englishEntries = buildUnifiedDictionary('en');
  const coffeeEn = searchUnifiedDictionary(englishEntries, {
    query: 'coffee',
    source: 'curriculum',
  });
  assert.ok(coffeeEn.length >= 1);
});
