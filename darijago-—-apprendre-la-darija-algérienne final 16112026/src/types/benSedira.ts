export type DictionaryCategory =
  | 'verb'
  | 'expression'
  | 'noun'
  | 'adjective'
  | 'time-number'
  | 'grammar';

export type DictionarySource = 'ben-sedira' | 'aziri' | 'tapiero' | 'tadjer';

export type VerbPattern =
  | 'regular'
  | 'doubled'
  | 'hollow'
  | 'defective'
  | 'derived';

export interface VerbConjugationTriple {
  present1s: string;
  past1s: string;
  past3ms: string;
  imperative?: string;
}

export interface BenSediraDictionaryEntry {
  id: string;
  volume: number;
  letter: string;
  source?: DictionarySource;
  sourcePage?: string;
  frenchHeadword: string;
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
}

export interface BenSediraVolumeInfo {
  volume: number;
  title: string;
  letterRange: string;
  pagesCovered: string;
  loaded: boolean;
}

export type GrammarSectionId =
  | 'pronunciation-article'
  | 'pronouns-auxiliaries'
  | 'verbs-conjugation'
  | 'numbers-calendar'
  | 'contractions-negation';

export interface GrammarExample {
  darijaLatin: string;
  darijaArabic: string;
  frenchMeaning: string;
  note?: string;
}

export interface GrammarTable {
  caption: string;
  headers: string[];
  rows: string[][];
}

export interface GrammarSection {
  id: GrammarSectionId;
  order: string;
  sourcePages: string;
  title: string;
  subtitle: string;
  keyRule: string;
  examples: GrammarExample[];
  tables: GrammarTable[];
}

export interface DictionaryQuickDrillItem {
  id: string;
  entryId: string;
  frenchPrompt: string;
  promptHint: string;
  correctAnswer: string;
  correctArabic: string;
  options: string[];
  explanation: string;
}

export interface FullVerbConjugationRow {
  personKey: '1s' | '2ms' | '2fs' | '3ms' | '3fs' | '1p' | '2p' | '3p';
  pronoun: string;
  present: string;
  past: string;
  negativePresent: string;
}
