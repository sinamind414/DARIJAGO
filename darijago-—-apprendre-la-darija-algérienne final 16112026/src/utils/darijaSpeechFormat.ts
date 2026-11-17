import type {
  BenSediraDictionaryEntry,
  FullVerbConjugationRow,
} from '../types/benSedira';

export type NativeSpeakerVoice = 'Kore' | 'Charon' | 'Puck';

export const UNIFIED_FEMALE_VOICE: NativeSpeakerVoice = 'Kore';

export interface NativeSpeakerVoiceProfile {
  id: NativeSpeakerVoice;
  speakerName: string;
  cityHint: string;
}

export const NATIVE_SPEAKER_VOICES: NativeSpeakerVoiceProfile[] = [
  { id: 'Kore', speakerName: 'Yasmine', cityHint: 'Alger' },
];

export interface ArabicVerbTriple {
  present1sArabic: string;
  past1sArabic: string;
  past3msArabic: string;
  spokenTripleArabic: string;
}

export interface ArabicConjugatedRow {
  personKey: FullVerbConjugationRow['personKey'];
  presentArabic: string;
  pastArabic: string;
  negativePresentArabic: string;
  futureArabic: string;
}

const SPECIAL_AVOIR_ARABIC: Record<
  FullVerbConjugationRow['personKey'],
  Omit<ArabicConjugatedRow, 'personKey'>
> = {
  '1s': { presentArabic: 'عندي', pastArabic: 'كان عندي', negativePresentArabic: 'ما عنديش', futureArabic: 'يكون عندي' },
  '2ms': { presentArabic: 'عندك', pastArabic: 'كان عندك', negativePresentArabic: 'ما عندكش', futureArabic: 'يكون عندك' },
  '2fs': { presentArabic: 'عندك', pastArabic: 'كان عندك', negativePresentArabic: 'ما عندكش', futureArabic: 'يكون عندك' },
  '3ms': { presentArabic: 'عندو', pastArabic: 'كان عندو', negativePresentArabic: 'ما عندوش', futureArabic: 'يكون عندو' },
  '3fs': { presentArabic: 'عندها', pastArabic: 'كان عندها', negativePresentArabic: 'ما عندهاش', futureArabic: 'يكون عندها' },
  '1p': { presentArabic: 'عندنا', pastArabic: 'كان عندنا', negativePresentArabic: 'ما عندناش', futureArabic: 'يكون عندنا' },
  '2p': { presentArabic: 'عندكم', pastArabic: 'كان عندكم', negativePresentArabic: 'ما عندكمش', futureArabic: 'يكون عندكم' },
  '3p': { presentArabic: 'عندهم', pastArabic: 'كان عندهم', negativePresentArabic: 'ما عندهمش', futureArabic: 'يكون عندهم' },
};

const SPECIAL_ETRE_ARABIC: Record<
  FullVerbConjugationRow['personKey'],
  Omit<ArabicConjugatedRow, 'personKey'>
> = {
  '1s': { presentArabic: 'راني', pastArabic: 'كنت', negativePresentArabic: 'ما رانيش', futureArabic: 'نكون' },
  '2ms': { presentArabic: 'راك', pastArabic: 'كنت', negativePresentArabic: 'ما راكش', futureArabic: 'تكون' },
  '2fs': { presentArabic: 'راكي', pastArabic: 'كنتي', negativePresentArabic: 'ما راكيش', futureArabic: 'تكوني' },
  '3ms': { presentArabic: 'راهو', pastArabic: 'كان', negativePresentArabic: 'ما راهش', futureArabic: 'يكون' },
  '3fs': { presentArabic: 'راها', pastArabic: 'كانت', negativePresentArabic: 'ما راهيش', futureArabic: 'تكون' },
  '1p': { presentArabic: 'رانا', pastArabic: 'كنا', negativePresentArabic: 'ما راناش', futureArabic: 'نكونو' },
  '2p': { presentArabic: 'راكم', pastArabic: 'كنتو', negativePresentArabic: 'ما راكمش', futureArabic: 'تكونو' },
  '3p': { presentArabic: 'راهم', pastArabic: 'كانو', negativePresentArabic: 'ما راهمش', futureArabic: 'يكونو' },
};

const SPECIAL_FAILLIR_ARABIC: Record<
  FullVerbConjugationRow['personKey'],
  Omit<ArabicConjugatedRow, 'personKey'>
> = {
  '1s': { presentArabic: 'قريب نكون', pastArabic: 'قريب كنت', negativePresentArabic: 'ما قريب كنتش', futureArabic: 'غادي قريب نكون' },
  '2ms': { presentArabic: 'قريب تكون', pastArabic: 'قريب كنت', negativePresentArabic: 'ما قريب كنتش', futureArabic: 'غادي قريب تكون' },
  '2fs': { presentArabic: 'قريب تكوني', pastArabic: 'قريب كنتي', negativePresentArabic: 'ما قريب كنتيش', futureArabic: 'غادي قريب تكوني' },
  '3ms': { presentArabic: 'قريب يكون', pastArabic: 'قريب كان', negativePresentArabic: 'ما قريب كانش', futureArabic: 'غادي قريب يكون' },
  '3fs': { presentArabic: 'قريب تكون', pastArabic: 'قريب كانت', negativePresentArabic: 'ما قريب كانتش', futureArabic: 'غادي قريب تكون' },
  '1p': { presentArabic: 'قريب نكونو', pastArabic: 'قريب كنا', negativePresentArabic: 'ما قريب كناش', futureArabic: 'غادي قريب نكونو' },
  '2p': { presentArabic: 'قريب تكونو', pastArabic: 'قريب كنتو', negativePresentArabic: 'ما قريب كنتوش', futureArabic: 'غادي قريب تكونو' },
  '3p': { presentArabic: 'قريب يكونو', pastArabic: 'قريب كانو', negativePresentArabic: 'ما قريب كانوش', futureArabic: 'غادي قريب يكونو' },
};

function cleanArabicToken(raw: string): string {
  return raw
    .replace(/\(.*?\)/g, ' ')
    .replace(/[^\u0600-\u06FF\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function splitArabicVerbTriple(darijaArabic: string): ArabicVerbTriple {
  const parts = darijaArabic
    .split('/')
    .map((p) => cleanArabicToken(p))
    .filter(Boolean);

  const present1sArabic = parts[0] ?? '';
  const past1sArabic = parts[1] ?? parts[0] ?? '';
  const past3msArabic = parts[2] ?? parts[1] ?? parts[0] ?? '';

  const spokenTripleArabic = [present1sArabic, past1sArabic, past3msArabic]
    .filter(Boolean)
    .join('، ');

  return {
    present1sArabic,
    past1sArabic,
    past3msArabic,
    spokenTripleArabic,
  };
}

function appendArabicPluralOu(stem: string): string {
  if (!stem) return '';
  if (stem.endsWith('و')) return stem;
  if (stem.endsWith('ى') || stem.endsWith('ي')) {
    return `${stem.slice(0, -1)}و`;
  }
  if (stem.endsWith('ا')) {
    return `${stem}و`;
  }
  return `${stem}و`;
}

function appendArabicFemI(stem: string): string {
  if (!stem) return '';
  if (stem.endsWith('ي')) return stem;
  if (stem.endsWith('ى')) return `${stem.slice(0, -1)}ي`;
  if (stem.endsWith('ا')) return `${stem.slice(0, -1)}ي`;
  return `${stem}ي`;
}

function stripLeadingArabicPrefix(token: string): string {
  if (!token) return '';
  if (token.startsWith('ن') || token.startsWith('ت') || token.startsWith('ي')) {
    return token.slice(1);
  }
  return token;
}

function derivePast3fsArabic(past3ms: string): string {
  if (!past3ms) return '';
  if (past3ms.endsWith('ى')) return `${past3ms.slice(0, -1)}ات`;
  if (past3ms.endsWith('ا')) return `${past3ms}ت`;
  return `${past3ms}ت`;
}

function derivePast3pArabic(past3ms: string): string {
  if (!past3ms) return '';
  if (past3ms.endsWith('ى')) return `${past3ms.slice(0, -1)}او`;
  if (past3ms.endsWith('ا')) return `${past3ms}و`;
  return `${past3ms}و`;
}

function derivePast1pArabic(past1s: string): string {
  if (!past1s) return '';
  const stripped = past1s.replace(/[\u064B-\u065F\u0670]$/g, '');
  if (stripped.endsWith('ت')) {
    return `${stripped.slice(0, -1)}نا`;
  }
  return `${stripped}نا`;
}

/**
 * Generates authentic Algerian Arabic script forms across all 8 persons
 * from a Ben Sedira verb's 3-form Arabic triple so every single verb row
 * and flashcard carries real Arabic orthography for native TTS pronunciation.
 */
export function deriveArabicConjugationRows(
  entry: BenSediraDictionaryEntry
): Record<FullVerbConjugationRow['personKey'], ArabicConjugatedRow> {
  if (entry.id === 'bs-v-a-avoir') {
    return {
      '1s': { personKey: '1s', ...SPECIAL_AVOIR_ARABIC['1s'] },
      '2ms': { personKey: '2ms', ...SPECIAL_AVOIR_ARABIC['2ms'] },
      '2fs': { personKey: '2fs', ...SPECIAL_AVOIR_ARABIC['2fs'] },
      '3ms': { personKey: '3ms', ...SPECIAL_AVOIR_ARABIC['3ms'] },
      '3fs': { personKey: '3fs', ...SPECIAL_AVOIR_ARABIC['3fs'] },
      '1p': { personKey: '1p', ...SPECIAL_AVOIR_ARABIC['1p'] },
      '2p': { personKey: '2p', ...SPECIAL_AVOIR_ARABIC['2p'] },
      '3p': { personKey: '3p', ...SPECIAL_AVOIR_ARABIC['3p'] },
    };
  }

  if (entry.id === 'bs-v-e-etre') {
    return {
      '1s': { personKey: '1s', ...SPECIAL_ETRE_ARABIC['1s'] },
      '2ms': { personKey: '2ms', ...SPECIAL_ETRE_ARABIC['2ms'] },
      '2fs': { personKey: '2fs', ...SPECIAL_ETRE_ARABIC['2fs'] },
      '3ms': { personKey: '3ms', ...SPECIAL_ETRE_ARABIC['3ms'] },
      '3fs': { personKey: '3fs', ...SPECIAL_ETRE_ARABIC['3fs'] },
      '1p': { personKey: '1p', ...SPECIAL_ETRE_ARABIC['1p'] },
      '2p': { personKey: '2p', ...SPECIAL_ETRE_ARABIC['2p'] },
      '3p': { personKey: '3p', ...SPECIAL_ETRE_ARABIC['3p'] },
    };
  }

  if (entry.id === 'bs-v-f-faillir') {
    return {
      '1s': { personKey: '1s', ...SPECIAL_FAILLIR_ARABIC['1s'] },
      '2ms': { personKey: '2ms', ...SPECIAL_FAILLIR_ARABIC['2ms'] },
      '2fs': { personKey: '2fs', ...SPECIAL_FAILLIR_ARABIC['2fs'] },
      '3ms': { personKey: '3ms', ...SPECIAL_FAILLIR_ARABIC['3ms'] },
      '3fs': { personKey: '3fs', ...SPECIAL_FAILLIR_ARABIC['3fs'] },
      '1p': { personKey: '1p', ...SPECIAL_FAILLIR_ARABIC['1p'] },
      '2p': { personKey: '2p', ...SPECIAL_FAILLIR_ARABIC['2p'] },
      '3p': { personKey: '3p', ...SPECIAL_FAILLIR_ARABIC['3p'] },
    };
  }

  const { present1sArabic, past1sArabic, past3msArabic } = splitArabicVerbTriple(
    entry.darijaArabic
  );

  // Handle multi-word phrases such as "ندير بلعاني" (take first verb token, keep trailing noun/preposition)
  const presWords = present1sArabic.split(' ').filter(Boolean);
  const presVerbWord = presWords[0] ?? '';
  const presTail = presWords.slice(1).join(' ');
  const tailSuffix = presTail ? ` ${presTail}` : '';

  const past1Words = past1sArabic.split(' ').filter(Boolean);
  const past1VerbWord = past1Words[0] ?? '';
  const past1Tail = past1Words.slice(1).join(' ');
  const past1Suffix = past1Tail ? ` ${past1Tail}` : '';

  const past3Words = past3msArabic.split(' ').filter(Boolean);
  const past3VerbWord = past3Words[0] ?? '';
  const past3Tail = past3Words.slice(1).join(' ');
  const past3Suffix = past3Tail ? ` ${past3Tail}` : '';

  const presStem = stripLeadingArabicPrefix(presVerbWord);

  const p1s = `${presVerbWord}${tailSuffix}`.trim();
  const p2ms = `ت${presStem}${tailSuffix}`.trim();
  const p2fs = `${appendArabicFemI(`ت${presStem}`)}${tailSuffix}`.trim();
  const p3ms = `ي${presStem}${tailSuffix}`.trim();
  const p3fs = `ت${presStem}${tailSuffix}`.trim();
  const p1p = `${appendArabicPluralOu(`ن${presStem}`)}${tailSuffix}`.trim();
  const p2p = `${appendArabicPluralOu(`ت${presStem}`)}${tailSuffix}`.trim();
  const p3p = `${appendArabicPluralOu(`ي${presStem}`)}${tailSuffix}`.trim();

  const k1s = `${past1VerbWord}${past1Suffix}`.trim();
  const k2ms = k1s;
  const k2fs = `${past1VerbWord}ي${past1Suffix}`.trim();
  const k3ms = `${past3VerbWord}${past3Suffix}`.trim();
  const k3fs = `${derivePast3fsArabic(past3VerbWord)}${past3Suffix}`.trim();
  const k1p = `${derivePast1pArabic(past1VerbWord)}${past1Suffix}`.trim();
  const k2p = `${past1VerbWord}و${past1Suffix}`.trim();
  const k3p = `${derivePast3pArabic(past3VerbWord)}${past3Suffix}`.trim();

  const neg = (verbForm: string) => {
    const parts = verbForm.split(' ');
    if (parts.length <= 1) return `ما ${verbForm}ش`;
    return `ما ${parts[0]}ش ${parts.slice(1).join(' ')}`;
  };

  const fut = (verbForm: string) => `غادي ${verbForm}`;

  return {
    '1s': { personKey: '1s', presentArabic: p1s, pastArabic: k1s, negativePresentArabic: neg(p1s), futureArabic: fut(p1s) },
    '2ms': { personKey: '2ms', presentArabic: p2ms, pastArabic: k2ms, negativePresentArabic: neg(p2ms), futureArabic: fut(p2ms) },
    '2fs': { personKey: '2fs', presentArabic: p2fs, pastArabic: k2fs, negativePresentArabic: neg(p2fs), futureArabic: fut(p2fs) },
    '3ms': { personKey: '3ms', presentArabic: p3ms, pastArabic: k3ms, negativePresentArabic: neg(p3ms), futureArabic: fut(p3ms) },
    '3fs': { personKey: '3fs', presentArabic: p3fs, pastArabic: k3fs, negativePresentArabic: neg(p3fs), futureArabic: fut(p3fs) },
    '1p': { personKey: '1p', presentArabic: p1p, pastArabic: k1p, negativePresentArabic: neg(p1p), futureArabic: fut(p1p) },
    '2p': { personKey: '2p', presentArabic: p2p, pastArabic: k2p, negativePresentArabic: neg(p2p), futureArabic: fut(p2p) },
    '3p': { personKey: '3p', presentArabic: p3p, pastArabic: k3p, negativePresentArabic: neg(p3p), futureArabic: fut(p3p) },
  };
}

/**
 * Derives an Arabic imperative string from a verb's Arabic present 1st-person form.
 */
export function deriveArabicImperative(entry: BenSediraDictionaryEntry): string {
  if (entry.id === 'bs-v-e-etre') return 'كون';
  if (entry.id === 'bs-v-a-avoir') return 'يكون عندك';
  const { present1sArabic } = splitArabicVerbTriple(entry.darijaArabic);
  const words = present1sArabic.split(' ').filter(Boolean);
  if (words.length === 0) return '';
  const stem = stripLeadingArabicPrefix(words[0]);
  const tail = words.slice(1).join(' ');
  return `${stem}${tail ? ` ${tail}` : ''}`.trim();
}

/**
 * Formats Ben Sedira Latin text cleanly for spoken delivery (removing slashes and parenthetical notes).
 */
export function formatBenSediraLatinForSpeech(rawLatin: string): string {
  return rawLatin
    .replace(/\//g, '، ')
    .replace(/\(.*?\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
