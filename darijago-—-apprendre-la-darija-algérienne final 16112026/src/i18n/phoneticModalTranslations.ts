import type { AppLanguage } from '../types/darija';

export interface PhoneticModalTranslations {
  openButtonLabel: string;
  openButtonShort: string;
  openItemAria: (phrase: string) => string;
  modalTitle: string;
  modalSubtitle: string;
  simplifiedAlphabetLabel: string;
  listenNormal: string;
  listenSlow: string;
  wordByWordTitle: string;
  specialSoundsTitle: string;
  noSpecialSoundsNote: string;
  inThisPhraseLabel: string;
  tipGeneralTitle: string;
  tipGeneralBody: string;
  closeLabel: string;
}

export const PHONETIC_MODAL_TRANSLATIONS: Record<
  AppLanguage,
  PhoneticModalTranslations
> = {
  fr: {
    openButtonLabel: 'Phonétique détaillée',
    openButtonShort: 'Phonétique',
    openItemAria: (p) => `Voir la phonétique détaillée : ${p}`,
    modalTitle: 'Guide de prononciation · Alphabet latin simplifié',
    modalSubtitle: 'Décomposez chaque syllabe et maîtrisez les sons spécifiques de la darija algérienne.',
    simplifiedAlphabetLabel: 'Transcription phonétique simplifiée',
    listenNormal: 'Écouter',
    listenSlow: 'Lent 0,75×',
    wordByWordTitle: 'Syllabes & phonétique mot par mot',
    specialSoundsTitle: 'Sons spécifiques présents dans cette phrase',
    noSpecialSoundsNote: 'Cette phrase utilise uniquement des consonnes et voyelles directes (sans lettre gutturale complexe). Articuler chaque syllabe nettement.',
    inThisPhraseLabel: 'Dans cette phrase :',
    tipGeneralTitle: 'Conseil d’articulation algérienne',
    tipGeneralBody: 'En darija algérienne, les consonnes doublées (ll, ss, tt) se prononcent en appuyant légèrement, et les voyelles courtes entre consonnes peuvent être très brèves.',
    closeLabel: 'Fermer',
  },
  en: {
    openButtonLabel: 'Detailed phonetics',
    openButtonShort: 'Phonetics',
    openItemAria: (p) => `View detailed phonetics: ${p}`,
    modalTitle: 'Pronunciation Guide · Simplified Latin Alphabet',
    modalSubtitle: 'Break down every syllable and master the distinctive sounds of Algerian Darija.',
    simplifiedAlphabetLabel: 'Simplified phonetic transcription',
    listenNormal: 'Listen',
    listenSlow: 'Slow 0.75×',
    wordByWordTitle: 'Word-by-word syllables & phonetics',
    specialSoundsTitle: 'Distinctive Darija sounds in this phrase',
    noSpecialSoundsNote: 'This phrase uses straightforward consonants and vowels with no deep guttural letters. Articulate each syllable clearly.',
    inThisPhraseLabel: 'In this phrase:',
    tipGeneralTitle: 'Algerian articulation tip',
    tipGeneralBody: 'In Algerian Darija, doubled consonants (ll, ss, tt) are held slightly longer with emphasis, while unstressed short vowels stay crisp and brief.',
    closeLabel: 'Close',
  },
  es: {
    openButtonLabel: 'Fonética detallada',
    openButtonShort: 'Fonética',
    openItemAria: (p) => `Ver fonética detallada: ${p}`,
    modalTitle: 'Guía de pronunciación · Alfabeto latino simplificado',
    modalSubtitle: 'Desglosa cada sílaba y domina los sonidos propios de la dariya argelina.',
    simplifiedAlphabetLabel: 'Transcripción fonética simplificada',
    listenNormal: 'Escuchar',
    listenSlow: 'Lento 0,75×',
    wordByWordTitle: 'Sílabas y fonética palabra por palabra',
    specialSoundsTitle: 'Sonidos específicos en esta frase',
    noSpecialSoundsNote: 'Esta frase utiliza consonantes y vocales directas sin letras guturales complejas. Articula cada sílaba con claridad.',
    inThisPhraseLabel: 'En esta frase:',
    tipGeneralTitle: 'Consejo de pronunciación argelina',
    tipGeneralBody: 'En dariya argelina, las consonantes dobles (ll, ss, tt) se pronuncian con mayor fuerza y duración, mientras que las vocales breves suenan ligeras.',
    closeLabel: 'Cerrar',
  },
  de: {
    openButtonLabel: 'Detaillierte Phonetik',
    openButtonShort: 'Phonetik',
    openItemAria: (p) => `Detaillierte Phonetik anzeigen: ${p}`,
    modalTitle: 'Aussprachehilfe · Vereinfachtes lateinisches Alphabet',
    modalSubtitle: 'Zerlege jede Silbe und meistere die besonderen Laute des algerischen Darija.',
    simplifiedAlphabetLabel: 'Vereinfachte Lautschrift',
    listenNormal: 'Anhören',
    listenSlow: 'Langsam 0,75×',
    wordByWordTitle: 'Silben & Lautschrift Wort für Wort',
    specialSoundsTitle: 'Besondere Darija-Laute in diesem Satz',
    noSpecialSoundsNote: 'Dieser Satz verwendet direkte Konsonanten und Vokale ohne komplexe Kehllaute. Sprich jede Silbe deutlich aus.',
    inThisPhraseLabel: 'In diesem Satz:',
    tipGeneralTitle: 'Algerischer Aussprache-Tipp',
    tipGeneralBody: 'Im algerischen Darija werden doppelte Konsonanten (ll, ss, tt) spürbar länger gehalten, während unbetonte Kurzvokale knapp bleiben.',
    closeLabel: 'Schließen',
  },
  it: {
    openButtonLabel: 'Fonetica dettagliata',
    openButtonShort: 'Fonetica',
    openItemAria: (p) => `Mostra fonetica dettagliata: ${p}`,
    modalTitle: 'Guida alla pronuncia · Alfabeto latino semplificato',
    modalSubtitle: 'Scomponi ogni sillaba e padroneggia i suoni specifici della darija algerina.',
    simplifiedAlphabetLabel: 'Trascrizione fonetica semplificata',
    listenNormal: 'Ascolta',
    listenSlow: 'Lento 0,75×',
    wordByWordTitle: 'Sillabe e fonetica parola per parola',
    specialSoundsTitle: 'Suoni specifici presenti in questa frase',
    noSpecialSoundsNote: 'Questa frase usa consonanti e vocali dirette senza suoni gutturali complessi. Articola ogni sillaba chiaramente.',
    inThisPhraseLabel: 'In questa frase:',
    tipGeneralTitle: 'Consiglio di pronuncia algerina',
    tipGeneralBody: 'Nella darija algerina le consonanti doppie (ll, ss, tt) si pronunciano con maggiore enfasi, mentre le vocali brevi restano rapide.',
    closeLabel: 'Chiudi',
  },
  nl: {
    openButtonLabel: 'Uitgebreide fonetiek',
    openButtonShort: 'Fonetiek',
    openItemAria: (p) => `Bekijk uitgebreide fonetiek: ${p}`,
    modalTitle: 'Uitspraakgids · Vereenvoudigd Latijns alfabet',
    modalSubtitle: 'Splits elke lettergreep en beheers de specifieke klanken van het Algerijns Darija.',
    simplifiedAlphabetLabel: 'Vereenvoudigde fonetische transcriptie',
    listenNormal: 'Beluister',
    listenSlow: 'Langzaam 0,75×',
    wordByWordTitle: 'Lettergrepen & fonetiek woord voor woord',
    specialSoundsTitle: 'Specifieke Darija-klanken in deze zin',
    noSpecialSoundsNote: 'Deze zin gebruikt directe medeklinkers en klinkers zonder diepe keelklanken. Spreek elke lettergreep duidelijk uit.',
    inThisPhraseLabel: 'In deze zin:',
    tipGeneralTitle: 'Algerijnse uitspraaktip',
    tipGeneralBody: 'In het Algerijns Darija worden dubbele medeklinkers (ll, ss, tt) iets langer aangehouden met nadruk, terwijl korte klinkers vlot blijven.',
    closeLabel: 'Sluiten',
  },
  zh: {
    openButtonLabel: '详细音标指南',
    openButtonShort: '详细音标',
    openItemAria: (p) => `查看详细发音指南：${p}`,
    modalTitle: '发音指南 · 简化拉丁字母注音',
    modalSubtitle: '逐词拆解音节，轻松掌握阿尔及利亚达里贾语的特色发音。',
    simplifiedAlphabetLabel: '简化拉丁字母音标',
    listenNormal: '播放发音',
    listenSlow: '慢速 0.75×',
    wordByWordTitle: '逐词音节与简化注音',
    specialSoundsTitle: '本句包含的达里贾语特色音素',
    noSpecialSoundsNote: '本句仅包含基础辅音与元音（无复杂喉音），请清晰读出每个音节。',
    inThisPhraseLabel: '本句示例：',
    tipGeneralTitle: '阿尔及利亚方言发音贴士',
    tipGeneralBody: '在达里贾语中，双写辅音（如 ll、ss、tt）需要稍微加重拉长，非重读短元音则保持轻快干脆。',
    closeLabel: '关闭',
  },
};
