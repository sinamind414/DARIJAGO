import { BEN_SEDIRA_DICTIONARY } from '../data/benSediraDictionary';
import { ARABIZI_SOUNDS, CURRICULUM_MODULES } from '../data/curriculum';
import { getLocalizedModule, getLocalizedSound } from '../i18n/curriculumTranslations';
import type {
  BenSediraDictionaryEntry,
  DictionaryCategory,
  DictionarySource,
  VerbConjugationTriple,
  VerbPattern,
} from '../types/benSedira';
import type { AppLanguage } from '../types/darija';
import { getEntrySource, normalizeDictionarySearch } from './dictionaryLogic';

export type UnifiedDictionarySource = DictionarySource | 'curriculum';

export interface UnifiedDictionaryEntry {
  id: string;
  source: UnifiedDictionarySource;
  sourceBadge: string;
  letter: string;
  headword: string;
  category: DictionaryCategory;
  verbPattern?: VerbPattern;
  arabicRoot?: string;
  preposition?: string;
  alternativeForms?: string[];
  darijaLatin: string;
  darijaArabic: string;
  phonetic: string;
  pluralLatin?: string;
  pluralArabic?: string;
  feminineLatin?: string;
  conjugation?: VerbConjugationTriple;
  exampleDarija?: string;
  exampleArabic?: string;
  exampleFrench?: string;
  usageNote?: string;
  /** Original entry if sourced from the 4 Algerian reference works (used for 8-person conjugation table). */
  baseEntry?: BenSediraDictionaryEntry;
  /** Pre-normalized full-text search index for Latin/French/Arabizi/conjugations/notes. */
  searchLatin: string;
  /** Pre-normalized headword + Darija Latin string used for relevance ranking. */
  primaryLatin: string;
  /** Pre-joined Arabic full-text search pool. */
  searchArabic: string;
}

export interface UnifiedDictionaryFilterOptions {
  query?: string;
  category?: DictionaryCategory | 'all';
  verbPattern?: VerbPattern | 'all';
  source?: UnifiedDictionarySource | 'all';
  letter?: string | 'all';
}

const TOKEN_GRAMMAR_HINTS = new Set([
  'wach',
  'w',
  'm3a',
  '3la',
  'b',
  'f',
  'fi',
  'min',
  'mn',
  'men',
  'nta',
  'nti',
  'ana',
  'houwa',
  'hiya',
  'hadi',
  'hada',
  'kifach',
  'win',
  'waqtach',
  '3lach',
  'ch7al',
  'chkon',
  'lla',
  'ih',
  'wah',
  'bezzaf',
  'chwiya',
  'bessah',
  'wallah',
  'ta3',
  'dyal',
]);

const TOKEN_TIME_NUMBER_HINTS = new Set([
  'wahad',
  'wa7ed',
  'jouj',
  'tlata',
  'rab3a',
  'khamsa',
  'setta',
  'seb3a',
  'temnya',
  'tes3a',
  'achra',
  'lyoum',
  'ghodwa',
  'elbareh',
  'doka',
  'dork',
  'sba7',
  'lila',
  'sa3a',
  'dinar',
]);

const TOKEN_ADJECTIVE_HINTS = new Set([
  'mlih',
  'mli7',
  'labas',
  'labes',
  'ghalya',
  'ghali',
  'rkhis',
  'rkhisa',
  'kbir',
  'kbira',
  'sghir',
  'sghira',
  'skhoun',
  'skhouna',
  'bared',
  'barda',
  'bnin',
  'bnina',
  'jdid',
  'jdida',
  'qdim',
  'qdima',
  'fari7',
  'zwin',
  'zwina',
  'chbab',
  'chaba',
]);

const TOKEN_VERB_HINTS = new Set([
  'rak',
  'raki',
  'rani',
  'rana',
  'rakoum',
  'rahoum',
  'nheb',
  'n7eb',
  'bghit',
  'nbghi',
  'fahemt',
  'fhemt',
  'nafhem',
  'naqder',
  'taqder',
  'na3ref',
  'ta3ref',
  'nchouf',
  'chof',
  'rouh',
  'nroh',
  'ji',
  'jib',
  'jibli',
  'a3tini',
  '3tini',
  'qolli',
  'qoul',
  'koul',
  'nakoul',
  'nechreb',
  'naskon',
  'neskon',
  'nekhdem',
  'naqra',
  'sakhsi',
  'saqsi',
  'naqasli',
  'samahni',
  'sma7li',
]);

export function classifyCurriculumTokenCategory(
  darijaToken: string,
  meaning: string
): DictionaryCategory {
  const normDarija = normalizeDictionarySearch(darijaToken);
  const words = normDarija.split(' ').filter(Boolean);
  const firstWord = words[0] ?? '';
  const normMeaning = normalizeDictionarySearch(meaning);

  if (TOKEN_VERB_HINTS.has(firstWord)) return 'verb';
  if (TOKEN_TIME_NUMBER_HINTS.has(firstWord)) return 'time-number';
  if (TOKEN_ADJECTIVE_HINTS.has(firstWord)) return 'adjective';
  if (TOKEN_GRAMMAR_HINTS.has(firstWord)) return 'grammar';

  if (words.length >= 2) return 'expression';
  if (
    normMeaning.includes('combien') ||
    normMeaning.includes('comment') ||
    normMeaning.includes('pourquoi') ||
    normMeaning.includes('avec') ||
    normMeaning.includes('dans') ||
    normMeaning.includes('pour') ||
    normMeaning.includes('de ') ||
    normMeaning.includes('et ') ||
    normMeaning.includes('how') ||
    normMeaning.includes('where') ||
    normMeaning.includes('when')
  ) {
    return 'grammar';
  }
  if (
    normMeaning.startsWith('etre ') ||
    normMeaning.startsWith('je ') ||
    normMeaning.startsWith('tu ') ||
    normMeaning.startsWith('donne') ||
    normMeaning.startsWith('apporte') ||
    normMeaning.startsWith('excuse')
  ) {
    return 'verb';
  }
  return 'noun';
}

function normalizeFirstLetter(text: string): string {
  const normalized = text
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
  const match = normalized.match(/[A-Z]/);
  return match ? match[0] : 'A';
}

function buildSearchFields(
  fields: Array<string | undefined>,
  arabicFields: Array<string | undefined>,
  headword: string,
  darijaLatin: string
) {
  const searchLatin = fields
    .filter((v): v is string => Boolean(v && v.trim()))
    .map(normalizeDictionarySearch)
    .filter(Boolean)
    .join(' ');

  const primaryLatin = [headword, darijaLatin]
    .map(normalizeDictionarySearch)
    .filter(Boolean)
    .join(' ');

  const searchArabic = arabicFields
    .filter((v): v is string => Boolean(v && v.trim()))
    .join(' ');

  return { searchLatin, primaryLatin, searchArabic };
}

export function buildUnifiedDictionary(
  language: AppLanguage = 'fr'
): UnifiedDictionaryEntry[] {
  const entries: UnifiedDictionaryEntry[] = [];
  const seenCurriculumKeys = new Set<string>();

  for (const entry of BEN_SEDIRA_DICTIONARY) {
    const src = getEntrySource(entry);
    const searchFields = buildSearchFields(
      [
        entry.frenchHeadword,
        entry.darijaLatin,
        entry.phonetic,
        entry.pluralLatin,
        entry.feminineLatin,
        entry.conjugation?.present1s,
        entry.conjugation?.past1s,
        entry.conjugation?.past3ms,
        entry.conjugation?.imperative,
        ...(entry.alternativeForms ?? []),
        entry.preposition,
        entry.exampleDarija,
        entry.exampleFrench,
        entry.usageNote,
        entry.sourcePage,
      ],
      [
        entry.darijaArabic,
        entry.arabicRoot,
        entry.pluralArabic,
        entry.exampleArabic,
        ...(entry.alternativeForms ?? []),
      ],
      entry.frenchHeadword,
      entry.darijaLatin
    );

    entries.push({
      id: entry.id,
      source: src,
      sourceBadge: entry.sourcePage ?? src,
      letter: entry.letter.toUpperCase(),
      headword: entry.frenchHeadword,
      category: entry.category,
      verbPattern: entry.verbPattern,
      arabicRoot: entry.arabicRoot,
      preposition: entry.preposition,
      alternativeForms: entry.alternativeForms,
      darijaLatin: entry.darijaLatin,
      darijaArabic: entry.darijaArabic,
      phonetic: entry.phonetic,
      pluralLatin: entry.pluralLatin,
      pluralArabic: entry.pluralArabic,
      feminineLatin: entry.feminineLatin,
      conjugation: entry.conjugation,
      exampleDarija: entry.exampleDarija,
      exampleArabic: entry.exampleArabic,
      exampleFrench: entry.exampleFrench,
      usageNote: entry.usageNote,
      baseEntry: entry,
      ...searchFields,
    });

    const dedupeKey = normalizeDictionarySearch(entry.darijaLatin);
    if (dedupeKey) {
      seenCurriculumKeys.add(dedupeKey);
    }
  }

  for (const rawMod of CURRICULUM_MODULES) {
    const mod = getLocalizedModule(rawMod, language);
    for (const phrase of mod.phrases) {
      const phraseKey = `phrase:${normalizeDictionarySearch(phrase.darijaLatin)}`;
      if (!seenCurriculumKeys.has(phraseKey)) {
        seenCurriculumKeys.add(phraseKey);
        const searchFields = buildSearchFields(
          [
            phrase.frenchMeaning,
            phrase.darijaLatin,
            phrase.phoneticFrench,
            phrase.literalMeaning,
            phrase.regionalNote,
            ...phrase.acceptedAnswers,
            mod.title,
          ],
          [phrase.darijaArabic],
          phrase.frenchMeaning,
          phrase.darijaLatin
        );

        entries.push({
          id: `curr-phrase-${phrase.id}`,
          source: 'curriculum',
          sourceBadge: `${mod.number} · ${mod.title}`,
          letter: normalizeFirstLetter(phrase.frenchMeaning),
          headword: phrase.frenchMeaning,
          category: 'expression',
          darijaLatin: phrase.darijaLatin,
          darijaArabic: phrase.darijaArabic,
          phonetic: phrase.phoneticFrench,
          alternativeForms: phrase.acceptedAnswers.slice(0, 3),
          exampleDarija: phrase.darijaLatin,
          exampleArabic: phrase.darijaArabic,
          exampleFrench: phrase.literalMeaning ?? phrase.frenchMeaning,
          usageNote: phrase.regionalNote,
          ...searchFields,
        });
      }

      for (let i = 0; i < phrase.breakdown.length; i += 1) {
        const token = phrase.breakdown[i];
        const normToken = normalizeDictionarySearch(token.darija);
        const normMeaning = normalizeDictionarySearch(token.french);
        const tokenDedupeKey = `tok:${normToken}::${normMeaning}`;
        if (!normToken || seenCurriculumKeys.has(tokenDedupeKey)) {
          continue;
        }
        seenCurriculumKeys.add(tokenDedupeKey);
        const category = classifyCurriculumTokenCategory(
          token.darija,
          token.french
        );
        const searchFields = buildSearchFields(
          [
            token.french,
            token.darija,
            phrase.darijaLatin,
            phrase.frenchMeaning,
            mod.title,
          ],
          [token.arabic, phrase.darijaArabic],
          token.french,
          token.darija
        );

        entries.push({
          id: `curr-word-${phrase.id}-${i}`,
          source: 'curriculum',
          sourceBadge: `${mod.number} · ${mod.title}`,
          letter: normalizeFirstLetter(token.french),
          headword: token.french,
          category,
          darijaLatin: token.darija,
          darijaArabic: token.arabic,
          phonetic: token.darija,
          exampleDarija: phrase.darijaLatin,
          exampleArabic: phrase.darijaArabic,
          exampleFrench: phrase.frenchMeaning,
          ...searchFields,
        });
      }
    }
  }

  for (const rawSound of ARABIZI_SOUNDS) {
    const sound = getLocalizedSound(rawSound, language);
    const soundKey = `phrase:${normalizeDictionarySearch(sound.exampleDarija)}`;
    if (seenCurriculumKeys.has(soundKey)) continue;
    seenCurriculumKeys.add(soundKey);
    const searchFields = buildSearchFields(
      [
        sound.exampleFrench,
        sound.exampleDarija,
        sound.name,
        sound.pronunciationTip,
      ],
      [sound.exampleArabic, sound.arabicLetter],
      sound.exampleFrench,
      sound.exampleDarija
    );
    entries.push({
      id: `curr-sound-${sound.symbol.replace(/\s+/g, '-')}`,
      source: 'curriculum',
      sourceBadge: `Arabizi · ${sound.symbol}`,
      letter: normalizeFirstLetter(sound.exampleFrench),
      headword: sound.exampleFrench,
      category: 'expression',
      darijaLatin: sound.exampleDarija,
      darijaArabic: sound.exampleArabic,
      phonetic: sound.exampleDarija,
      usageNote: `${sound.name} (${sound.arabicLetter}) — ${sound.pronunciationTip}`,
      ...searchFields,
    });
  }

  return entries;
}

function scoreMatch(
  entry: UnifiedDictionaryEntry,
  normalizedQuery: string,
  queryTokens: string[]
): number {
  const normHeadword = normalizeDictionarySearch(entry.headword);
  const normDarija = normalizeDictionarySearch(entry.darijaLatin);

  if (normHeadword === normalizedQuery || normDarija === normalizedQuery) {
    return 100;
  }
  if (
    normHeadword.startsWith(normalizedQuery) ||
    normDarija.startsWith(normalizedQuery)
  ) {
    return 75;
  }
  if (entry.primaryLatin.includes(normalizedQuery)) {
    return 55;
  }
  if (
    queryTokens.length > 0 &&
    queryTokens.every((tok) => entry.primaryLatin.includes(tok))
  ) {
    return 40;
  }
  return 15;
}

export function searchUnifiedDictionary(
  entries: UnifiedDictionaryEntry[],
  {
    query = '',
    category = 'all',
    verbPattern = 'all',
    source = 'all',
    letter = 'all',
  }: UnifiedDictionaryFilterOptions = {}
): UnifiedDictionaryEntry[] {
  const normalizedQuery = normalizeDictionarySearch(query);
  const queryTokens = normalizedQuery.split(' ').filter(Boolean);
  const rawTrimmed = query.trim();
  const hasArabicChars = /[\u0600-\u06FF]/.test(rawTrimmed);

  const matched: Array<{ entry: UnifiedDictionaryEntry; score: number }> = [];

  for (const entry of entries) {
    if (source !== 'all' && entry.source !== source) {
      continue;
    }
    if (category !== 'all' && entry.category !== category) {
      continue;
    }
    if (letter !== 'all' && entry.letter.toUpperCase() !== letter.toUpperCase()) {
      continue;
    }
    if (verbPattern !== 'all') {
      if (entry.category !== 'verb' || entry.verbPattern !== verbPattern) {
        continue;
      }
    }

    if (!normalizedQuery && !rawTrimmed) {
      matched.push({ entry, score: 0 });
      continue;
    }

    if (hasArabicChars) {
      const arabicTokens = rawTrimmed.split(/\s+/).filter(Boolean);
      const arabicHit = arabicTokens.every((t) => entry.searchArabic.includes(t));
      if (arabicHit) {
        const primaryArabicHit =
          entry.darijaArabic.includes(rawTrimmed) ||
          (entry.arabicRoot?.includes(rawTrimmed) ?? false);
        matched.push({ entry, score: primaryArabicHit ? 90 : 30 });
      }
      continue;
    }

    const latinHit =
      queryTokens.length > 0 &&
      queryTokens.every((tok) => entry.searchLatin.includes(tok));
    if (latinHit) {
      matched.push({
        entry,
        score: scoreMatch(entry, normalizedQuery, queryTokens),
      });
    }
  }

  if (normalizedQuery || rawTrimmed) {
    matched.sort((a, b) => b.score - a.score);
  }

  return matched.map((m) => m.entry);
}

export function computeGrammaticalCategoryCounts(
  entries: UnifiedDictionaryEntry[]
): Record<DictionaryCategory | 'all', number> {
  const counts: Record<DictionaryCategory | 'all', number> = {
    all: entries.length,
    verb: 0,
    expression: 0,
    noun: 0,
    adjective: 0,
    'time-number': 0,
    grammar: 0,
  };
  for (const entry of entries) {
    counts[entry.category] += 1;
  }
  return counts;
}

export function computeUnifiedSourceCounts(
  entries: UnifiedDictionaryEntry[]
): Record<UnifiedDictionarySource | 'all', number> {
  const counts: Record<UnifiedDictionarySource | 'all', number> = {
    all: entries.length,
    curriculum: 0,
    'ben-sedira': 0,
    aziri: 0,
    tapiero: 0,
    tadjer: 0,
  };
  for (const entry of entries) {
    counts[entry.source] += 1;
  }
  return counts;
}

export function computeUnifiedVerbPatternCounts(
  entries: UnifiedDictionaryEntry[]
): Record<VerbPattern | 'all', number> {
  const counts: Record<VerbPattern | 'all', number> = {
    all: 0,
    regular: 0,
    doubled: 0,
    hollow: 0,
    defective: 0,
    derived: 0,
  };
  for (const entry of entries) {
    if (entry.category !== 'verb') continue;
    counts.all += 1;
    if (entry.verbPattern) {
      counts[entry.verbPattern] += 1;
    }
  }
  return counts;
}

export function computeUnifiedLetterCounts(
  entries: UnifiedDictionaryEntry[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const entry of entries) {
    const key = entry.letter.toUpperCase();
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}
