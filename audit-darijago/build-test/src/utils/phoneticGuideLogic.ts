import type { AppLanguage, DarijaPhrase } from '../types/darija';

export interface DarijaSoundGuide {
  id: string;
  marker: string;
  arabicLetter: string;
  simplifiedLatin: string;
  title: string;
  articulationTip: string;
  exampleInPhrase?: string;
}

export interface WordPhoneticBreakdown {
  darija: string;
  arabic: string;
  meaning: string;
  simplifiedPhonetic: string;
  syllables: string[];
}

export interface PhrasePhoneticAnalysis {
  phraseId: string;
  simplifiedSentence: string;
  wordBreakdowns: WordPhoneticBreakdown[];
  detectedSounds: DarijaSoundGuide[];
}

interface SoundDefinition {
  id: string;
  marker: string;
  arabicLetter: string;
  simplifiedLatin: string;
  regex: RegExp;
  copy: Record<AppLanguage, { title: string; tip: string }>;
}

const SOUND_DEFINITIONS: SoundDefinition[] = [
  {
    id: 'ain',
    marker: '3',
    arabicLetter: 'ع',
    simplifiedLatin: 'â / aa',
    regex: /3/,
    copy: {
      fr: {
        title: 'Aïn (3) · Son « â » guttural profond',
        tip: 'Serrez légèrement le fond de la gorge en prononçant un « a » grave et vibrant (comme un « â » appuyé venu du bas de la gorge).',
      },
      en: {
        title: 'Ayn (3) · Deep throat "aa"',
        tip: 'Gently tighten the back of your throat while voicing a resonant "a" from deep in the throat.',
      },
      es: {
        title: 'Ayn (3) · «a» gutural profunda',
        tip: 'Contrae suavemente el fondo de la garganta al pronunciar una «a» grave y resonante.',
      },
      de: {
        title: 'Ayn (3) · Tiefer Kehllaut „aa“',
        tip: 'Spanne den hinteren Rachen leicht an und sprich ein tiefes, resonantes „a“ aus der Kehle.',
      },
      it: {
        title: 'Ayn (3) · «a» gutturale profonda',
        tip: 'Stringi leggermente il fondo della gola pronunciando una «a» profonda e sonora.',
      },
      nl: {
        title: 'Ayn (3) · Diepe keelklank "aa"',
        tip: 'Span de achterkant van je keel licht aan terwijl je een diepe, resonerende "a" uitspreekt.',
      },
      zh: {
        title: 'Ayn (3) · 深喉“â”音',
        tip: '轻微收紧咽喉后部并声带振动发出低沉浑厚的“a”音。',
      },
    },
  },
  {
    id: 'ha',
    marker: '7',
    arabicLetter: 'ح',
    simplifiedLatin: 'ḥ / hh',
    regex: /7/,
    copy: {
      fr: {
        title: 'Ha emphatique (7) · Souffle sec « hh »',
        tip: 'Expirez un souffle chaud et net depuis la gorge, comme lorsque vous soufflez de la buée sur des lunettes, sans faire vibrer les cordes vocales.',
      },
      en: {
        title: 'Emphatic Ha (7) · Crisp breathy "hh"',
        tip: 'Breathe out sharply from the pharynx—like fogging up a mirror—keeping the sound dry and clear without vocal cord vibration.',
      },
      es: {
        title: 'Ha enfática (7) · Soplo seco «hh»',
        tip: 'Exhala un aire seco y fuerte desde la garganta, como al empañar un cristal, sin vibración vocal.',
      },
      de: {
        title: 'Emphatisches Ha (7) · Kräftiges „hh“',
        tip: 'Hauche trocken und kräftig aus der Kehle aus (wie beim Anhauchen einer Brille), ohne Stimmbandvibration.',
      },
      it: {
        title: 'Ha enfatica (7) · Soffio secco «hh»',
        tip: 'Espira con forza dalla gola come quando si appanna uno specchio, senza far vibrare le corde vocali.',
      },
      nl: {
        title: 'Emfatische Ha (7) · Droge ademstoot "hh"',
        tip: 'Adem scherp en droog uit vanuit de keel, alsof je een bril laat beslaan, zonder stembandtrilling.',
      },
      zh: {
        title: '强吐气 Ha (7) · 清脆喉部送气“hh”',
        tip: '从咽喉呼出干脆强劲的气流（如同向镜片哈气），声带不振动。',
      },
    },
  },
  {
    id: 'qaf',
    marker: '9',
    arabicLetter: 'ق',
    simplifiedLatin: 'q / k',
    regex: /9|q/i,
    copy: {
      fr: {
        title: 'Qaf (9 / q) · « K » grave du fond du palais',
        tip: 'Prononcez un « k » produit tout au fond de la gorge contre la luette (plus grave et sec que le « k » de « café »).',
      },
      en: {
        title: 'Qaf (9 / q) · Deep uvular "k"',
        tip: 'Articulate a firm "k" right at the back of the soft palate near the uvula, deeper than an English "k".',
      },
      es: {
        title: 'Qaf (9 / q) · «K» profunda de garganta',
        tip: 'Articula una «k» firme bien atrás en el paladar blando, más grave que la «c» de «casa».',
      },
      de: {
        title: 'Qaf (9 / q) · Tiefes Rachen-„k“',
        tip: 'Sprich ein festes „k“ ganz hinten am Gaumenzäpfchen, deutlich tiefer als das deutsche „k“.',
      },
      it: {
        title: 'Qaf (9 / q) · «K» profonda di gola',
        tip: 'Pronuncia una «k» decisa dal fondo del palato molle, più profonda della «c» di «casa».',
      },
      nl: {
        title: 'Qaf (9 / q) · Diepe keel-"k"',
        tip: 'Spreek een krachtige "k" uit helemaal achteraan bij de huig, dieper dan de Nederlandse "k".',
      },
      zh: {
        title: 'Qaf (9 / q) · 深喉小舌“q/k”',
        tip: '在软腭最深处靠近小舌的位置发出浑厚的“k”音，比普通“k”更靠后。',
      },
    },
  },
  {
    id: 'kha',
    marker: 'kh / 5',
    arabicLetter: 'خ',
    simplifiedLatin: 'kh',
    regex: /\b\w*(?:kh|5)\w*\b/i,
    copy: {
      fr: {
        title: 'Kha (kh / 5) · Râclement doux du fond du palais',
        tip: 'Comme la « jota » espagnole (Juan) ou le « ch » allemand de « Bach » : frottez légèrement l’air au fond du palais.',
      },
      en: {
        title: 'Kha (kh / 5) · Raspy "kh"',
        tip: 'Like the "ch" in Scottish "loch" or German "Bach": let air brush softly against the back of the palate.',
      },
      es: {
        title: 'Kha (kh / 5) · Como la «j» de «jamón»',
        tip: 'Igual que la «j» española fuerte o la «ch» alemana de «Bach», raspando suavemente el aire atrás.',
      },
      de: {
        title: 'Kha (kh / 5) · Wie „ch“ in „Bach“',
        tip: 'Genau wie das deutsche „ch“ in „Bach“ oder „Nacht“ – weich am hinteren Gaumen reiben.',
      },
      it: {
        title: 'Kha (kh / 5) · Fricativa «kh»',
        tip: 'Come la «j» spagnola di «jamón» o il «ch» tedesco di «Bach»: lascia passare l’aria dal fondo del palato.',
      },
      nl: {
        title: 'Kha (kh / 5) · Zachte keel-"g/ch"',
        tip: 'Vergelijkbaar met de Nederlandse harde "ch" in "nacht" of Duitse "ch" in "Bach".',
      },
      zh: {
        title: 'Kha (kh / 5) · 摩擦音“kh”',
        tip: '类似德语“Bach”中的“ch”或汉语拼音略带摩擦的“h”，气流在软腭处轻擦而出。',
      },
    },
  },
  {
    id: 'ghayn',
    marker: 'gh',
    arabicLetter: 'غ',
    simplifiedLatin: 'gh (r parisien)',
    regex: /gh/i,
    copy: {
      fr: {
        title: 'Ghayn (gh) · « R » grasseyé vibrant',
        tip: 'Prononcez exactement comme un « r » français appuyé et vibrant (comme dans « Paris » ou « gare »), produit au fond de la gorge.',
      },
      en: {
        title: 'Ghayn (gh) · Voiced French-style "r"',
        tip: 'Very close to a Parisian French "r": let your uvula vibrate gently while voicing the sound.',
      },
      es: {
        title: 'Ghayn (gh) · «R» francesa vibrante',
        tip: 'Muy parecido a una «r» francesa de París, haciendo vibrar suavemente la garganta.',
      },
      de: {
        title: 'Ghayn (gh) · Stimmhaftes Rachen-„r“',
        tip: 'Wie ein weiches, stimmhaftes deutsches/französisches Zäpfchen-„r“ aus dem Rachen.',
      },
      it: {
        title: 'Ghayn (gh) · «R» moscia vibrante',
        tip: 'Molto simile alla «r» francese di «Paris», facendo vibrare dolcemente la gola.',
      },
      nl: {
        title: 'Ghayn (gh) · Zachte huig-"r"',
        tip: 'Klinkt als een zachte Franse of Limburgse brouwende "r" achter in de keel.',
      },
      zh: {
        title: 'Ghayn (gh) · 浊小舌颤音“gh”',
        tip: '类似法语“Paris”中的小舌“r”音，声带振动并在咽喉后部轻颤。',
      },
    },
  },
  {
    id: 'chin',
    marker: 'ch',
    arabicLetter: 'ش',
    simplifiedLatin: 'ch (sh)',
    regex: /ch/i,
    copy: {
      fr: {
        title: 'Chin (ch) · Son « ch » de « chat »',
        tip: 'Se prononce toujours « ch » doux comme dans « chat » ou « chaud » (jamais « k »).',
      },
      en: {
        title: 'Chin (ch) · Soft "sh" as in "shoe"',
        tip: 'Always pronounced like English "sh" in "shoe" or "wash" (never like "k" or "ch" in "church").',
      },
      es: {
        title: 'Chin (ch) · Sonido «sh» suave',
        tip: 'Se pronuncia siempre como la «sh» inglesa de «show» o «ch» francesa (suave, sin golpe de «t»).',
      },
      de: {
        title: 'Chin (ch) · Wie deutsches „sch“',
        tip: 'Wird immer wie „sch“ in „Schule“ ausgesprochen.',
      },
      it: {
        title: 'Chin (ch) · Suono «sc» di «sciarpa»',
        tip: 'Si pronuncia sempre dolce come «sc» in «sciarpa» o «sh» inglese (mai duro come «k»).',
      },
      nl: {
        title: 'Chin (ch) · Zachte "sj"-klank',
        tip: 'Spreek altijd uit als "sj" in "sjaal" of Engels "sh" in "shoe".',
      },
      zh: {
        title: 'Chin (ch) · 柔音“sh”',
        tip: '始终读作英语“shoe”中的“sh”音，切勿读成“k”或“ch”。',
      },
    },
  },
  {
    id: 'gemination',
    marker: 'll / ss / tt',
    arabicLetter: 'ـّ',
    simplifiedLatin: 'consonne appuyée',
    regex: /(ll|ss|tt|mm|bb|dd|nn|rr)/i,
    copy: {
      fr: {
        title: 'Chadda (consonne doublée) · Appui net',
        tip: 'Maintenez la consonne doublée une fraction de seconde plus longtemps (ex. « al-lah », « es-sa-ha »).',
      },
      en: {
        title: 'Shadda (doubled consonant) · Held stress',
        tip: 'Hold the doubled consonant slightly longer with a crisp release (e.g., "al-lah", "es-sa-ha").',
      },
      es: {
        title: 'Shadda (consonante doble) · Énfasis marcado',
        tip: 'Mantén la consonante doble un instante más larga y marcada (ej. «al-lah»).',
      },
      de: {
        title: 'Schadda (Doppelkonsonant) · Dehnung',
        tip: 'Halte den doppelten Konsonanten kurz spürbar an (z. B. „al-lah“).',
      },
      it: {
        title: 'Shadda (doppia consonante) · Enfasi marcata',
        tip: 'Pronuncia la consonante doppia con la stessa intensità delle doppie italiane (es. «al-lah»).',
      },
      nl: {
        title: 'Sjadda (dubbele medeklinker) · Nadruk',
        tip: 'Houd de dubbele medeklinker heel even extra aan (bijv. "al-lah").',
      },
      zh: {
        title: '叠音符号（双写辅音）· 停顿重读',
        tip: '遇到双写辅音时需稍微停顿加重读出（例如 “al-lah”）。',
      },
    },
  },
];

/**
 * Converts a single Darija word into a learner-friendly simplified Latin phonetic
 * guide with clean hyphenated syllables.
 */
export function toSimplifiedLatinWord(rawWord: string): string {
  const cleaned = rawWord
    .replace(/[.,?!;:«»"()—]/g, '')
    .trim();
  if (!cleaned) return '';

  let phonetic = cleaned
    .replace(/3/g, 'â')
    .replace(/7/g, 'hh')
    .replace(/9/g, 'q')
    .replace(/5/g, 'kh');

  // Split long multi-syllable words at clean CV / CC boundaries before expanding w -> ou
  if (!phonetic.includes('-') && phonetic.length >= 5) {
    phonetic = phonetic
      .replace(
        /([aeiouyàâéèêîïôû])([bcdfghjklmnpqrstvwxz](?:h)?[aeiouyàâéèêîïôû])/gi,
        '$1-$2'
      )
      .replace(
        /([aeiouyàâéèêîïôû][bcdfghjklmnpqrstvwxz])([bcdfghjklmnpqrstvwxz][aeiouyàâéèêîïôû])/gi,
        '$1-$2'
      );
  }

  phonetic = phonetic
    .replace(/(^|-)w([aeiouàâéèêîïôû])/gi, '$1ou$2')
    .replace(/([bcdfghjklmnpqrstvwxyz])w([aeiouàâéèêîïôû])/gi, '$1ou$2')
    .replace(/w$/i, 'ou');

  return phonetic.toLowerCase();
}

function findExampleWord(darijaLatin: string, regex: RegExp): string | undefined {
  const words = darijaLatin.split(/\s+/).filter(Boolean);
  return words.find((w) => regex.test(w))?.replace(/[.,?!;:«»"]/g, '');
}

export function detectSpecialDarijaSounds(
  phrase: Pick<DarijaPhrase, 'darijaLatin' | 'darijaArabic'>,
  language: AppLanguage
): DarijaSoundGuide[] {
  const found: DarijaSoundGuide[] = [];
  for (const def of SOUND_DEFINITIONS) {
    if (def.regex.test(phrase.darijaLatin)) {
      const copy = def.copy[language] ?? def.copy.fr;
      found.push({
        id: def.id,
        marker: def.marker,
        arabicLetter: def.arabicLetter,
        simplifiedLatin: def.simplifiedLatin,
        title: copy.title,
        articulationTip: copy.tip,
        exampleInPhrase: findExampleWord(phrase.darijaLatin, def.regex),
      });
    }
  }
  return found;
}

export function analyzePhrasePhonetics(
  phrase: DarijaPhrase,
  language: AppLanguage
): PhrasePhoneticAnalysis {
  const wordBreakdowns: WordPhoneticBreakdown[] = phrase.breakdown.map(
    (token) => {
      const parts = token.darija
        .split(/\s+/)
        .map(toSimplifiedLatinWord)
        .filter(Boolean);
      const simplifiedPhonetic = parts.join(' ');
      const syllables = simplifiedPhonetic
        .split(/[\s-]+/)
        .filter(Boolean);
      return {
        darija: token.darija,
        arabic: token.arabic,
        meaning: token.french,
        simplifiedPhonetic,
        syllables,
      };
    }
  );

  const simplifiedSentence =
    phrase.phoneticFrench.trim() ||
    phrase.darijaLatin
      .split(/\s+/)
      .map(toSimplifiedLatinWord)
      .filter(Boolean)
      .join(' ');

  return {
    phraseId: phrase.id,
    simplifiedSentence,
    wordBreakdowns,
    detectedSounds: detectSpecialDarijaSounds(phrase, language),
  };
}
