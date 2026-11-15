import test from 'node:test';
import assert from 'node:assert/strict';
import { BEN_SEDIRA_DICTIONARY } from '../data/benSediraDictionary';
import { BEN_SEDIRA_GRAMMAR_SECTIONS } from '../data/benSediraGrammar';
import {
  buildDictionaryQuickDrill,
  computeDictionaryCategoryCounts,
  computeLetterCounts,
  computeVerbPatternCounts,
  deriveFullConjugationTable,
  filterBenSediraEntries,
  getAvailableDictionaryLetters,
  normalizeDictionarySearch,
} from './dictionaryLogic';

test('normalizeDictionarySearch handles Ben Sedira apostrophes, accents, and Arabizi digits', () => {
  assert.equal(normalizeDictionarySearch("h'abib / 7abib"), 'habib habib');
  assert.equal(normalizeDictionarySearch('qeddach fi omrek?'), 'qeddach fi omrek');
  assert.equal(normalizeDictionarySearch("r'oucht"), 'ghoucht');
  assert.equal(normalizeDictionarySearch('3alach'), 'aalach');
});

test('BEN_SEDIRA_DICTIONARY has unique IDs and complete verb metadata across A, B, C, D, E', () => {
  const seenIds = new Set<string>();
  for (const entry of BEN_SEDIRA_DICTIONARY) {
    assert.equal(
      seenIds.has(entry.id),
      false,
      `Duplicate dictionary entry id detected: ${entry.id}`
    );
    seenIds.add(entry.id);
    if (entry.category === 'verb') {
      assert.ok(entry.conjugation, `Verb ${entry.id} missing conjugation`);
      assert.ok(entry.verbPattern, `Verb ${entry.id} missing verbPattern`);
    }
  }

  const letters = getAvailableDictionaryLetters(BEN_SEDIRA_DICTIONARY);
  assert.deepEqual(letters, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'Y', 'Z']);

  const letterCounts = computeLetterCounts(BEN_SEDIRA_DICTIONARY);
  assert.ok(letterCounts.A > 100);
  assert.ok(letterCounts.B > 50);
  assert.ok(letterCounts.C >= 130);
  assert.ok(letterCounts.D >= 130);
  assert.ok(letterCounts.E >= 235);
  assert.ok(letterCounts.F >= 75);
  assert.ok(letterCounts.G >= 60);
  assert.ok(letterCounts.H >= 20);
  assert.ok(letterCounts.I >= 54);
  assert.ok(letterCounts.J >= 17);
  assert.ok(letterCounts.K >= 3);
  assert.ok(letterCounts.L >= 30);
  assert.ok(letterCounts.M >= 83);
  assert.ok(letterCounts.N >= 31);
  assert.ok(letterCounts.O >= 41);
  assert.ok(letterCounts.P >= 200);
  assert.ok(letterCounts.Q >= 6);
  assert.ok(letterCounts.R >= 320);
  assert.ok(letterCounts.S >= 198);
  assert.ok(letterCounts.T >= 130);
  assert.ok(letterCounts.U >= 10);
  assert.ok(letterCounts.V >= 90);
  assert.ok(letterCounts.Y >= 3);
  assert.ok(letterCounts.Z >= 4);
});

test('filterBenSediraEntries searches across French, conjugations, Arabic, letters, and verb patterns', () => {
  const byFrench = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, { query: 'Acheter' });
  assert.equal(byFrench.some((e) => e.id === 'bs-v-a-acheter'), true);

  const byConjugation = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, { query: 'chrit' });
  assert.equal(byConjugation.some((e) => e.id === 'bs-v-a-acheter'), true);

  const byLetterAndQuery = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'B',
    query: 'boire',
  });
  assert.equal(byLetterAndQuery.some((e) => e.id === 'bs-v-b-boire'), true);
  assert.equal(byLetterAndQuery.every((e) => e.letter === 'B'), true);

  const byArabic = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, { query: 'دروق' });
  assert.equal(byArabic.some((e) => e.id === 'bs-a-alinstant'), true);

  const byVerbArabic = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, { query: 'نشرب' });
  assert.equal(byVerbArabic.some((e) => e.id === 'bs-v-b-boire'), true);

  const byContrevenir = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'C',
    query: 'contrevenir',
  });
  assert.equal(byContrevenir.some((e) => e.id === 'bs-v-c-contrevenir'), true);

  const byDanser = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'D',
    query: 'danser',
  });
  assert.equal(byDanser.some((e) => e.id === 'bs-v-d-danser'), true);

  const byEcrire = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'E',
    query: 'écrire',
  });
  assert.equal(byEcrire.some((e) => e.id === 'bs-v-e-ecrire'), true);

  const byExtraire = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'E',
    query: 'extraire',
  });
  assert.equal(byExtraire.some((e) => e.id === 'bs-v-e-extraire'), true);

  const byFaire = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'F',
    query: 'faire',
  });
  assert.equal(byFaire.some((e) => e.id === 'bs-v-f-faire'), true);

  const byGagner = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'G',
    query: 'gagner',
  });
  assert.equal(byGagner.some((e) => e.id === 'bs-v-g-gagner'), true);

  const byHabiter = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'H',
    query: 'habiter',
  });
  assert.equal(byHabiter.some((e) => e.id === 'bs-v-h-habiter'), true);

  const byIgnorer = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'I',
    query: 'ignorer',
  });
  assert.equal(byIgnorer.some((e) => e.id === 'bs-v-i-ignorer'), true);

  const byImiter = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'I',
    query: 'imiter',
  });
  assert.equal(byImiter.some((e) => e.id === 'bs-v-i-imiter'), true);

  const byJouer = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'J',
    query: 'jouer',
  });
  assert.equal(byJouer.some((e) => e.id === 'bs-v-j-jouer'), true);

  const byKabyle = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'K',
    query: 'kabyle',
  });
  assert.equal(byKabyle.some((e) => e.id === 'bs-k-kabyle'), true);

  const byLire = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'L',
    query: 'lire',
  });
  assert.equal(byLire.some((e) => e.id === 'bs-v-l-lire'), true);

  const byManger = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'M',
    query: 'manger',
  });
  assert.equal(byManger.some((e) => e.id === 'bs-v-m-manger'), true);

  const byMettre = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'M',
    query: 'mettre',
  });
  assert.equal(byMettre.some((e) => e.id === 'bs-v-m-mettre'), true);

  const byNager = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'N',
    query: 'nager',
  });
  assert.equal(byNager.some((e) => e.id === 'bs-v-n-nager'), true);

  const byOuvrir = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'O',
    query: 'ouvrir',
  });
  assert.equal(byOuvrir.some((e) => e.id === 'bs-v-o-ouvrir'), true);

  const byPartir = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'P',
    query: 'partir',
  });
  assert.equal(byPartir.some((e) => e.id === 'bs-v-p-partir'), true);

  const byPrendre = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'P',
    query: 'prendre',
  });
  assert.equal(byPrendre.some((e) => e.id === 'bs-v-p-prendre'), true);

  const byQuitter = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'Q',
    query: 'quitter',
  });
  assert.equal(byQuitter.some((e) => e.id === 'bs-v-q-quitter'), true);

  const byRaconter = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'R',
    query: 'raconter',
  });
  assert.equal(byRaconter.some((e) => e.id === 'bs-v-r-raconter'), true);

  const byRemettre = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'R',
    query: 'remettre',
  });
  assert.equal(byRemettre.some((e) => e.id === 'bs-v-r-remettre'), true);

  const byRire = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'R',
    query: 'rire',
  });
  assert.equal(byRire.some((e) => e.id === 'bs-v-r-rire'), true);

  const byRougir = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'R',
    query: 'rougir',
  });
  assert.equal(byRougir.some((e) => e.id === 'bs-v-r-rougir'), true);

  const bySavoir = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'S',
    query: 'savoir',
  });
  assert.equal(bySavoir.some((e) => e.id === 'bs-v-s-savoir'), true);

  const bySortir = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'S',
    query: 'sortir',
  });
  assert.equal(bySortir.some((e) => e.id === 'bs-v-s-sortir'), true);

  const bySouvenir = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'S',
    query: 'souvenir',
  });
  assert.equal(bySouvenir.some((e) => e.id === 'bs-v-s-souvenir-se'), true);

  const bySubdiviser = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'S',
    query: 'subdiviser',
  });
  assert.equal(bySubdiviser.some((e) => e.id === 'bs-v-s-subdiviser'), true);

  const bySubir = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'S',
    query: 'subir',
  });
  assert.equal(bySubir.some((e) => e.id === 'bs-v-s-subir'), true);

  const byTomber = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'T',
    query: 'tomber',
  });
  assert.equal(byTomber.some((e) => e.id === 'bs-v-t-tomber'), true);

  const byUnir = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'U',
    query: 'unir',
  });
  assert.equal(byUnir.some((e) => e.id === 'bs-v-u-unir'), true);

  const byVenir = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'V',
    query: 'venir',
  });
  assert.equal(byVenir.some((e) => e.id === 'bs-v-v-venir'), true);

  const byVivre = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'V',
    query: 'vivre',
  });
  assert.equal(byVivre.some((e) => e.id === 'bs-v-v-vivre'), true);

  const byVoir = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'V',
    query: 'voir',
  });
  assert.equal(byVoir.some((e) => e.id === 'bs-v-v-voir'), true);

  const byVouloir = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'V',
    query: 'vouloir',
  });
  assert.equal(byVouloir.some((e) => e.id === 'bs-v-v-vouloir'), true);

  const byZezayer = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    letter: 'Z',
    query: 'zezayer',
  });
  assert.equal(byZezayer.some((e) => e.id === 'bs-v-z-zezayer'), true);

  const byPattern = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
    category: 'verb',
    verbPattern: 'defective',
  });
  assert.ok(byPattern.length >= 20);
  assert.equal(byPattern.every((e) => e.verbPattern === 'defective'), true);

  const empty = filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, { query: 'inexistant_xyz' });
  assert.equal(empty.length, 0);
});

test('category and verb pattern counts sum accurately', () => {
  const counts = computeDictionaryCategoryCounts(BEN_SEDIRA_DICTIONARY);
  assert.equal(counts.all, BEN_SEDIRA_DICTIONARY.length);
  const sum =
    counts.verb +
    counts.expression +
    counts.noun +
    counts.adjective +
    counts['time-number'] +
    counts.grammar;
  assert.equal(sum, counts.all);

  const patternCounts = computeVerbPatternCounts(BEN_SEDIRA_DICTIONARY);
  assert.equal(patternCounts.all, counts.verb);
  const patternSum =
    patternCounts.regular +
    patternCounts.doubled +
    patternCounts.hollow +
    patternCounts.defective +
    patternCounts.derived;
  assert.equal(patternSum, patternCounts.all);
  assert.equal(BEN_SEDIRA_GRAMMAR_SECTIONS.length, 5);
});

test('deriveFullConjugationTable generates 8 persons for regular, defective, and avoir verbs', () => {
  const boire = BEN_SEDIRA_DICTIONARY.find((e) => e.id === 'bs-v-b-boire');
  assert.ok(boire);
  const boireTable = deriveFullConjugationTable(boire);
  assert.equal(boireTable.length, 8);
  assert.equal(boireTable[0].present, 'nechreb');
  assert.equal(boireTable[0].past, 'cherebt');
  assert.equal(boireTable[0].negativePresent, 'ma nechrebch');
  assert.equal(boireTable[5].present, 'nechrebou');
  assert.equal(boireTable[5].past, 'cherebna');

  const acheter = BEN_SEDIRA_DICTIONARY.find((e) => e.id === 'bs-v-a-acheter');
  assert.ok(acheter);
  const acheterTable = deriveFullConjugationTable(acheter);
  assert.equal(acheterTable.length, 8);
  assert.equal(acheterTable[0].present, 'nechri');
  assert.equal(acheterTable[3].past, 'chra');
  assert.equal(acheterTable[7].present, 'ichriou');

  const avoir = BEN_SEDIRA_DICTIONARY.find((e) => e.id === 'bs-v-a-avoir');
  assert.ok(avoir);
  const avoirTable = deriveFullConjugationTable(avoir);
  assert.equal(avoirTable.length, 8);
  assert.equal(avoirTable[0].present, 'ândi');
  assert.equal(avoirTable[0].past, 'kan ândi');
  assert.equal(avoirTable[7].negativePresent, 'ma ândhoumch');

  const dire = BEN_SEDIRA_DICTIONARY.find((e) => e.id === 'bs-v-d-dire');
  assert.ok(dire);
  const direTable = deriveFullConjugationTable(dire);
  assert.equal(direTable.length, 8);
  assert.equal(direTable[0].present, 'nqoul');
  assert.equal(direTable[0].past, 'qoult');
  assert.equal(direTable[3].past, 'qal');
  assert.equal(direTable[5].present, 'nqoulou');
  assert.equal(direTable[5].past, 'qoulna');
  assert.equal(direTable[0].negativePresent, 'ma nqoulch');

  const etre = BEN_SEDIRA_DICTIONARY.find((e) => e.id === 'bs-v-e-etre');
  assert.ok(etre);
  const etreTable = deriveFullConjugationTable(etre);
  assert.equal(etreTable.length, 8);
  assert.equal(etreTable[0].present, 'rani (nkoun)');
  assert.equal(etreTable[0].past, 'kount');
  assert.equal(etreTable[0].negativePresent, 'ma ranich');
  assert.equal(etreTable[3].past, 'kan');
  assert.equal(etreTable[5].past, 'kounna');
  assert.equal(etreTable[7].negativePresent, 'ma rahoumch');

  const faire = BEN_SEDIRA_DICTIONARY.find((e) => e.id === 'bs-v-f-faire');
  assert.ok(faire);
  const faireTable = deriveFullConjugationTable(faire);
  assert.equal(faireTable.length, 8);
  assert.equal(faireTable[0].present, 'nâmel');
  assert.equal(faireTable[0].past, 'âmelt');
  assert.equal(faireTable[3].present, 'iâmel');
  assert.equal(faireTable[5].present, 'nâmelou');

  const faillir = BEN_SEDIRA_DICTIONARY.find((e) => e.id === 'bs-v-f-faillir');
  assert.ok(faillir);
  const faillirTable = deriveFullConjugationTable(faillir);
  assert.equal(faillirTable.length, 8);
  assert.equal(faillirTable[0].present, 'qrib nkoun');
  assert.equal(faillirTable[0].past, 'qrib kount');
  assert.equal(faillirTable[3].past, 'qrib kan');

  const gagner = BEN_SEDIRA_DICTIONARY.find((e) => e.id === 'bs-v-g-gagner');
  assert.ok(gagner);
  const gagnerTable = deriveFullConjugationTable(gagner);
  assert.equal(gagnerTable.length, 8);
  assert.equal(gagnerTable[0].present, 'nerbah’');
  assert.equal(gagnerTable[3].present, 'irbah’');
  assert.equal(gagnerTable[0].negativePresent, 'ma nerbah’ch');

  const manger = BEN_SEDIRA_DICTIONARY.find((e) => e.id === 'bs-v-m-manger');
  assert.ok(manger);
  const mangerTable = deriveFullConjugationTable(manger);
  assert.equal(mangerTable.length, 8);
  assert.equal(mangerTable[0].present, 'nakoul');
  assert.equal(mangerTable[0].past, 'klit');
  assert.equal(mangerTable[3].present, 'iakoul');
  assert.equal(mangerTable[5].past, 'klina');
  assert.equal(mangerTable[0].negativePresent, 'ma nakoulch');

  const lire = BEN_SEDIRA_DICTIONARY.find((e) => e.id === 'bs-v-l-lire');
  assert.ok(lire);
  const lireTable = deriveFullConjugationTable(lire);
  assert.equal(lireTable.length, 8);
  assert.equal(lireTable[0].present, 'naqra');
  assert.equal(lireTable[0].past, 'qrit');
  assert.equal(lireTable[3].past, 'qra');
  assert.equal(lireTable[3].present, 'iaqra');

  const mourir = BEN_SEDIRA_DICTIONARY.find((e) => e.id === 'bs-v-m-mourir');
  assert.ok(mourir);
  const mourirTable = deriveFullConjugationTable(mourir);
  assert.equal(mourirTable.length, 8);
  assert.equal(mourirTable[0].present, 'nmout');
  assert.equal(mourirTable[0].past, 'mett');
  assert.equal(mourirTable[3].past, 'mat');
  assert.equal(mourirTable[3].present, 'imout');

  const ouvrir = BEN_SEDIRA_DICTIONARY.find((e) => e.id === 'bs-v-o-ouvrir');
  assert.ok(ouvrir);
  const ouvrirTable = deriveFullConjugationTable(ouvrir);
  assert.equal(ouvrirTable.length, 8);
  assert.equal(ouvrirTable[0].present, 'neh’all');
  assert.equal(ouvrirTable[0].past, 'h’allit');
  assert.equal(ouvrirTable[3].past, 'h’all');

  const partir = BEN_SEDIRA_DICTIONARY.find((e) => e.id === 'bs-v-p-partir');
  assert.ok(partir);
  const partirTable = deriveFullConjugationTable(partir);
  assert.equal(partirTable.length, 8);
  assert.equal(partirTable[0].present, 'nroh’');
  assert.equal(partirTable[0].past, 'roh’t');
  assert.equal(partirTable[3].past, 'rah’');

  const prendre = BEN_SEDIRA_DICTIONARY.find((e) => e.id === 'bs-v-p-prendre');
  assert.ok(prendre);
  const prendreTable = deriveFullConjugationTable(prendre);
  assert.equal(prendreTable.length, 8);
  assert.equal(prendreTable[0].present, 'nakhoud’');
  assert.equal(prendreTable[0].past, 'khed’it');
  assert.equal(prendreTable[3].past, 'khed’a');

  const quitter = BEN_SEDIRA_DICTIONARY.find((e) => e.id === 'bs-v-q-quitter');
  assert.ok(quitter);
  const quitterTable = deriveFullConjugationTable(quitter);
  assert.equal(quitterTable.length, 8);
  assert.equal(quitterTable[0].present, 'natrek');
  assert.equal(quitterTable[0].past, 'trakt');
  assert.equal(quitterTable[3].past, 'trak');

  const raconter = BEN_SEDIRA_DICTIONARY.find((e) => e.id === 'bs-v-r-raconter');
  assert.ok(raconter);
  const raconterTable = deriveFullConjugationTable(raconter);
  assert.equal(raconterTable.length, 8);
  assert.equal(raconterTable[0].present, 'nah’ki');
  assert.equal(raconterTable[0].past, 'h’akit');
  assert.equal(raconterTable[3].past, 'h’aka');

  const savoir = BEN_SEDIRA_DICTIONARY.find((e) => e.id === 'bs-v-s-savoir');
  assert.ok(savoir);
  const savoirTable = deriveFullConjugationTable(savoir);
  assert.equal(savoirTable.length, 8);
  assert.equal(savoirTable[0].present, 'nâref');
  assert.equal(savoirTable[0].past, 'âreft');
  assert.equal(savoirTable[3].past, 'âref');

  const sortir = BEN_SEDIRA_DICTIONARY.find((e) => e.id === 'bs-v-s-sortir');
  assert.ok(sortir);
  const sortirTable = deriveFullConjugationTable(sortir);
  assert.equal(sortirTable.length, 8);
  assert.equal(sortirTable[0].present, 'nokhroj');
  assert.equal(sortirTable[0].past, 'kherejt');
  assert.equal(sortirTable[3].past, 'kherej');

  const tomber = BEN_SEDIRA_DICTIONARY.find((e) => e.id === 'bs-v-t-tomber');
  assert.ok(tomber);
  const tomberTable = deriveFullConjugationTable(tomber);
  assert.equal(tomberTable.length, 8);
  assert.equal(tomberTable[0].present, 'netih’');
  assert.equal(tomberTable[0].past, 'touh’t');
  assert.equal(tomberTable[3].past, 'tah’');

  const venir = BEN_SEDIRA_DICTIONARY.find((e) => e.id === 'bs-v-v-venir');
  assert.ok(venir);
  const venirTable = deriveFullConjugationTable(venir);
  assert.equal(venirTable.length, 8);
  assert.equal(venirTable[0].present, 'nji');
  assert.equal(venirTable[0].past, 'jit');
  assert.equal(venirTable[3].past, 'ja');

  const vivre = BEN_SEDIRA_DICTIONARY.find((e) => e.id === 'bs-v-v-vivre');
  assert.ok(vivre);
  const vivreTable = deriveFullConjugationTable(vivre);
  assert.equal(vivreTable.length, 8);
  assert.equal(vivreTable[0].present, 'nâich');
  assert.equal(vivreTable[0].past, 'âcht');
  assert.equal(vivreTable[3].past, 'âach');

  const voir = BEN_SEDIRA_DICTIONARY.find((e) => e.id === 'bs-v-v-voir');
  assert.ok(voir);
  const voirTable = deriveFullConjugationTable(voir);
  assert.equal(voirTable.length, 8);
  assert.equal(voirTable[0].present, 'nchouf');
  assert.equal(voirTable[0].past, 'cheft');
  assert.equal(voirTable[3].past, 'chaf');

  const vouloir = BEN_SEDIRA_DICTIONARY.find((e) => e.id === 'bs-v-v-vouloir');
  assert.ok(vouloir);
  const vouloirTable = deriveFullConjugationTable(vouloir);
  assert.equal(vouloirTable.length, 8);
  assert.equal(vouloirTable[0].present, 'neh’abb');
  assert.equal(vouloirTable[0].past, 'h’abbit');
  assert.equal(vouloirTable[3].past, 'h’abb');
});

test('buildDictionaryQuickDrill creates valid 6-item mixed and verb-only drills across C–Z', () => {
  const mixedDrills = buildDictionaryQuickDrill(BEN_SEDIRA_DICTIONARY, 42, 6);
  assert.equal(mixedDrills.length, 6);
  for (const item of mixedDrills) {
    assert.equal(item.options.length, 4);
    assert.equal(item.options.includes(item.correctAnswer), true);
    assert.ok(item.frenchPrompt.length > 0);
  }

  for (const [letter, prefix, expectedLen] of [
    ['C', 'bs-v-c-', 10],
    ['D', 'bs-v-d-', 10],
    ['E', 'bs-v-e-', 10],
    ['F', 'bs-v-f-', 10],
    ['G', 'bs-v-g-', 10],
    ['H', 'bs-v-h-', 10],
    ['I', 'bs-v-i-', 10],
    ['J', 'bs-v-j-', 10],
    ['L', 'bs-v-l-', 10],
    ['M', 'bs-v-m-', 10],
    ['N', 'bs-v-n-', 10],
    ['O', 'bs-v-o-', 10],
    ['P', 'bs-v-p-', 10],
    ['Q', 'bs-v-q-', 6],
    ['R', 'bs-v-r-', 10],
    ['S', 'bs-v-s-', 10],
    ['T', 'bs-v-t-', 10],
    ['U', 'bs-v-u-', 9],
    ['V', 'bs-v-v-', 10],
  ] as const) {
    const verbDrills = buildDictionaryQuickDrill(BEN_SEDIRA_DICTIONARY, 17, 10, {
      verbsOnly: true,
      letter,
    });
    assert.equal(verbDrills.length, expectedLen);
    for (const item of verbDrills) {
      assert.equal(item.options.length, 4);
      assert.equal(item.options.includes(item.correctAnswer), true);
      assert.ok(item.entryId.startsWith(prefix));
    }
  }
});
