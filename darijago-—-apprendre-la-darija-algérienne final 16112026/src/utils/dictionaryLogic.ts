import type {
  BenSediraDictionaryEntry,
  DictionaryCategory,
  DictionaryQuickDrillItem,
  DictionarySource,
  FullVerbConjugationRow,
  VerbPattern,
} from '../types/benSedira';

export function getEntrySource(entry: BenSediraDictionaryEntry): DictionarySource {
  return entry.source ?? 'ben-sedira';
}

/**
 * Normalizes French, Ben Sedira apostrophe transliteration (h', t', s', d', r', â),
 * and Arabizi digits (3, 7, 9, 5) for tolerant bilingual dictionary search.
 */
export function normalizeDictionarySearch(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/r['’`]/g, 'gh')
    .replace(/([htsd])['’`]/g, '$1')
    .replace(/3/g, 'a')
    .replace(/7/g, 'h')
    .replace(/9/g, 'q')
    .replace(/5/g, 'kh')
    .replace(/[’'`.,?!;:—\-/()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface DictionaryFilterOptions {
  query?: string;
  category?: DictionaryCategory | 'all';
  letter?: string | 'all';
  verbPattern?: VerbPattern | 'all';
  source?: DictionarySource | 'all';
}

export function filterBenSediraEntries(
  entries: BenSediraDictionaryEntry[],
  {
    query = '',
    category = 'all',
    letter = 'all',
    verbPattern = 'all',
    source = 'all',
  }: DictionaryFilterOptions = {}
): BenSediraDictionaryEntry[] {
  const normalizedQuery = normalizeDictionarySearch(query);
  const rawTrimmed = query.trim();

  return entries.filter((entry) => {
    if (source !== 'all' && getEntrySource(entry) !== source) {
      return false;
    }
    if (category !== 'all' && entry.category !== category) {
      return false;
    }
    if (letter !== 'all' && entry.letter.toUpperCase() !== letter.toUpperCase()) {
      return false;
    }
    if (verbPattern !== 'all') {
      if (entry.category !== 'verb' || entry.verbPattern !== verbPattern) {
        return false;
      }
    }
    if (!normalizedQuery && !rawTrimmed) {
      return true;
    }

    const latinPool = [
      entry.frenchHeadword,
      entry.darijaLatin,
      entry.phonetic,
      entry.pluralLatin ?? '',
      entry.feminineLatin ?? '',
      entry.conjugation?.present1s ?? '',
      entry.conjugation?.past1s ?? '',
      entry.conjugation?.past3ms ?? '',
      entry.conjugation?.imperative ?? '',
      ...(entry.alternativeForms ?? []),
      entry.preposition ?? '',
      entry.exampleDarija ?? '',
      entry.exampleFrench ?? '',
    ]
      .map(normalizeDictionarySearch)
      .join(' ');

    if (normalizedQuery && latinPool.includes(normalizedQuery)) {
      return true;
    }

    const arabicPool = [
      entry.darijaArabic,
      entry.arabicRoot ?? '',
      entry.pluralArabic ?? '',
      entry.exampleArabic ?? '',
      ...(entry.alternativeForms ?? []),
    ].join(' ');

    return rawTrimmed.length > 0 && arabicPool.includes(rawTrimmed);
  });
}

export function computeDictionarySourceCounts(
  entries: BenSediraDictionaryEntry[]
): Record<DictionarySource | 'all', number> {
  const counts: Record<DictionarySource | 'all', number> = {
    all: entries.length,
    'ben-sedira': 0,
    aziri: 0,
    tapiero: 0,
    tadjer: 0,
  };
  for (const entry of entries) {
    counts[getEntrySource(entry)] += 1;
  }
  return counts;
}

export function computeDictionaryCategoryCounts(
  entries: BenSediraDictionaryEntry[]
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

export function computeVerbPatternCounts(
  entries: BenSediraDictionaryEntry[]
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

export function computeLetterCounts(
  entries: BenSediraDictionaryEntry[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const entry of entries) {
    const key = entry.letter.toUpperCase();
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

export function getAvailableDictionaryLetters(
  entries: BenSediraDictionaryEntry[]
): string[] {
  const seen = new Set<string>();
  for (const entry of entries) {
    seen.add(entry.letter.toUpperCase());
  }
  return Array.from(seen).sort();
}

function splitConjugationHeadAndTail(raw: string): { head: string; tail: string } {
  const trimmed = raw.trim().replace(/\s+/g, ' ');
  if (!trimmed) return { head: '', tail: '' };
  const spaceIdx = trimmed.indexOf(' ');
  if (spaceIdx === -1) return { head: trimmed, tail: '' };
  return {
    head: trimmed.slice(0, spaceIdx),
    tail: trimmed.slice(spaceIdx),
  };
}

function appendPluralOu(stem: string): string {
  if (stem.endsWith('ou')) return stem;
  if (stem.endsWith('i')) return `${stem}ou`;
  return `${stem}ou`;
}

function appendFemI(stem: string): string {
  if (stem.endsWith('i')) return stem;
  if (stem.endsWith('a')) return `${stem}y`;
  return `${stem}i`;
}

function pastStemWithoutT(past1s: string): string {
  if (past1s.endsWith("t'") || past1s.endsWith('t’')) {
    return past1s.slice(0, -2);
  }
  if (past1s.endsWith('t')) {
    return past1s.slice(0, -1);
  }
  return past1s;
}

/**
 * Generates an 8-person Algerian Darija conjugation table (Aoriste, Prétérit, Négation)
 * from any Ben Sedira verb triple following pp. XXIII–XLII of the 1910 Grammar.
 */
export function deriveFullConjugationTable(
  entry: BenSediraDictionaryEntry
): FullVerbConjugationRow[] {
  if (!entry.conjugation) return [];

  // Special case: Ben Sedira's pseudo-verb "avoir" (ând + affixes)
  if (entry.id === 'bs-v-a-avoir') {
    return [
      { personKey: '1s', pronoun: 'ana (je)', present: 'ândi', past: 'kan ândi', negativePresent: 'ma ândich' },
      { personKey: '2ms', pronoun: 'enta (tu m.)', present: 'ândek', past: 'kan ândek', negativePresent: 'ma ândekch' },
      { personKey: '2fs', pronoun: 'enti (tu f.)', present: 'ândek', past: 'kan ândek', negativePresent: 'ma ândekch' },
      { personKey: '3ms', pronoun: 'hououa (il)', present: 'ândhou', past: 'kan ândhou', negativePresent: 'ma ândhouch' },
      { personKey: '3fs', pronoun: 'hiya (elle)', present: 'ândha', past: 'kan ândha', negativePresent: 'ma ândhach' },
      { personKey: '1p', pronoun: 'ah’na (nous)', present: 'ândna', past: 'kan ândna', negativePresent: 'ma ândnach' },
      { personKey: '2p', pronoun: 'entouma (vous)', present: 'ândkoum', past: 'kan ândkoum', negativePresent: 'ma ândkoumch' },
      { personKey: '3p', pronoun: 'houma (ils/elles)', present: 'ândhoum', past: 'kan ândhoum', negativePresent: 'ma ândhoumch' },
    ];
  }

  // Special case: Ben Sedira's auxiliary "être" (rani / nkoun / kount / kan, p. 202)
  if (entry.id === 'bs-v-e-etre') {
    return [
      { personKey: '1s', pronoun: 'ana (je)', present: 'rani (nkoun)', past: 'kount', negativePresent: 'ma ranich' },
      { personKey: '2ms', pronoun: 'enta (tu m.)', present: 'rak (tkoun)', past: 'kount', negativePresent: 'ma rakch' },
      { personKey: '2fs', pronoun: 'enti (tu f.)', present: 'raki (tkouni)', past: 'kounti', negativePresent: 'ma rakich' },
      { personKey: '3ms', pronoun: 'hououa (il)', present: 'rah / raho (ikoun)', past: 'kan', negativePresent: 'ma rahch' },
      { personKey: '3fs', pronoun: 'hiya (elle)', present: 'rahi / raha (tkoun)', past: 'kanèt', negativePresent: 'ma rahich' },
      { personKey: '1p', pronoun: 'ah’na (nous)', present: 'rana (nkounou)', past: 'kounna', negativePresent: 'ma ranach' },
      { personKey: '2p', pronoun: 'entouma (vous)', present: 'rakoum (tkounou)', past: 'kountou', negativePresent: 'ma rakoumch' },
      { personKey: '3p', pronoun: 'houma (ils/elles)', present: 'rahoum (ikounou)', past: 'kanou', negativePresent: 'ma rahoumch' },
    ];
  }

  // Special case: "faillir" (qrib kount / qrib kan, p. 214)
  if (entry.id === 'bs-v-f-faillir') {
    return [
      { personKey: '1s', pronoun: 'ana (je)', present: 'qrib nkoun', past: 'qrib kount', negativePresent: 'ma qrib kountch' },
      { personKey: '2ms', pronoun: 'enta (tu m.)', present: 'qrib tkoun', past: 'qrib kount', negativePresent: 'ma qrib kountch' },
      { personKey: '2fs', pronoun: 'enti (tu f.)', present: 'qrib tkouni', past: 'qrib kounti', negativePresent: 'ma qrib kountich' },
      { personKey: '3ms', pronoun: 'hououa (il)', present: 'qrib ikoun', past: 'qrib kan', negativePresent: 'ma qrib kanch' },
      { personKey: '3fs', pronoun: 'hiya (elle)', present: 'qrib tkoun', past: 'qrib kanèt', negativePresent: 'ma qrib kanètch' },
      { personKey: '1p', pronoun: 'ah’na (nous)', present: 'qrib nkounou', past: 'qrib kounna', negativePresent: 'ma qrib kounnach' },
      { personKey: '2p', pronoun: 'entouma (vous)', present: 'qrib tkounou', past: 'qrib kountou', negativePresent: 'ma qrib kountouch' },
      { personKey: '3p', pronoun: 'houma (ils/elles)', present: 'qrib ikounou', past: 'qrib kanou', negativePresent: 'ma qrib kanouch' },
    ];
  }

  const { head: pres1s, tail: presTail } = splitConjugationHeadAndTail(
    entry.conjugation.present1s
  );
  const { head: past1s, tail: past1Tail } = splitConjugationHeadAndTail(
    entry.conjugation.past1s
  );
  const { head: past3ms, tail: past3Tail } = splitConjugationHeadAndTail(
    entry.conjugation.past3ms
  );
  const tail = presTail || past1Tail || past3Tail;

  // Extract aorist stem (strip leading 'n', 't', or 'i' if given in 3ms/3fs form)
  const presCore = pres1s.startsWith('n')
    ? pres1s.slice(1)
    : pres1s.startsWith('t') || pres1s.startsWith('i')
      ? pres1s.slice(1)
      : pres1s;

  const thirdCore = presCore.startsWith('e') ? presCore.slice(1) : presCore;

  const p1s = `n${presCore}`;
  const p2ms = `t${presCore}`;
  const p2fs = appendFemI(`t${presCore}`);
  const p3ms = `i${thirdCore}`;
  const p3fs = `t${presCore}`;
  const p1p = appendPluralOu(`n${presCore}`);
  const p2p = appendPluralOu(`t${presCore}`);
  const p3p = appendPluralOu(`i${thirdCore}`);

  const pastBase = pastStemWithoutT(past1s);
  const past2fs = `${past1s}i`;
  const past3fs = past3ms.endsWith('a') ? `${past3ms}t` : `${past3ms}èt`;
  const past1p = `${pastBase}na`;
  const past2p = `${past1s}ou`;
  const past3p = `${past3ms}ou`;

  return [
    { personKey: '1s', pronoun: 'ana (je)', present: `${p1s}${tail}`, past: `${past1s}${tail}`, negativePresent: `ma ${p1s}ch${tail}` },
    { personKey: '2ms', pronoun: 'enta (tu m.)', present: `${p2ms}${tail}`, past: `${past1s}${tail}`, negativePresent: `ma ${p2ms}ch${tail}` },
    { personKey: '2fs', pronoun: 'enti (tu f.)', present: `${p2fs}${tail}`, past: `${past2fs}${tail}`, negativePresent: `ma ${p2fs}ch${tail}` },
    { personKey: '3ms', pronoun: 'hououa (il)', present: `${p3ms}${tail}`, past: `${past3ms}${tail}`, negativePresent: `ma ${p3ms}ch${tail}` },
    { personKey: '3fs', pronoun: 'hiya (elle)', present: `${p3fs}${tail}`, past: `${past3fs}${tail}`, negativePresent: `ma ${p3fs}ch${tail}` },
    { personKey: '1p', pronoun: 'ah’na (nous)', present: `${p1p}${tail}`, past: `${past1p}${tail}`, negativePresent: `ma ${p1p}ch${tail}` },
    { personKey: '2p', pronoun: 'entouma (vous)', present: `${p2p}${tail}`, past: `${past2p}${tail}`, negativePresent: `ma ${p2p}ch${tail}` },
    { personKey: '3p', pronoun: 'houma (ils/elles)', present: `${p3p}${tail}`, past: `${past3p}${tail}`, negativePresent: `ma ${p3p}ch${tail}` },
  ];
}

function deterministicShuffle<T>(items: T[], seed: number): T[] {
  const copy = [...items];
  let s = Math.abs(seed) + 1;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export interface QuickDrillOptions {
  verbsOnly?: boolean;
  letter?: string | 'all';
  source?: DictionarySource | 'all';
}

export function buildDictionaryQuickDrill(
  entries: BenSediraDictionaryEntry[],
  seed = 17,
  limit = 6,
  { verbsOnly = false, letter = 'all', source = 'all' }: QuickDrillOptions = {}
): DictionaryQuickDrillItem[] {
  const usable = entries.filter((e) => {
    if (source !== 'all' && getEntrySource(e) !== source) {
      return false;
    }
    if (letter !== 'all' && e.letter.toUpperCase() !== letter.toUpperCase()) {
      return false;
    }
    if (verbsOnly) {
      return e.category === 'verb' && Boolean(e.conjugation);
    }
    return e.category === 'verb' || e.category === 'expression' || e.category === 'grammar';
  });

  const selected = deterministicShuffle(usable, seed).slice(0, limit);

  return selected.map((entry, idx) => {
    const isVerb = Boolean(entry.conjugation);
    const correctAnswer = isVerb
      ? `${entry.conjugation!.present1s} / ${entry.conjugation!.past1s} / ${entry.conjugation!.past3ms}`
      : entry.darijaLatin;

    const distractors = deterministicShuffle(
      usable.filter((other) => other.id !== entry.id),
      seed + idx * 31
    )
      .slice(0, 3)
      .map((other) =>
        other.conjugation
          ? `${other.conjugation.present1s} / ${other.conjugation.past1s} / ${other.conjugation.past3ms}`
          : other.darijaLatin
      );

    const options = deterministicShuffle(
      [correctAnswer, ...distractors],
      seed + idx * 13
    );

    return {
      id: `drill-${entry.id}`,
      entryId: entry.id,
      frenchPrompt: entry.frenchHeadword,
      promptHint: isVerb ? 'Prés. 1re / Passé 1re / Passé 3e' : entry.phonetic,
      correctAnswer,
      correctArabic: entry.darijaArabic,
      options,
      explanation: entry.exampleDarija
        ? `${entry.exampleDarija} — ${entry.exampleFrench ?? ''}`
        : entry.usageNote ?? entry.phonetic,
    };
  });
}
