import type { GrammarSection } from '../types/benSedira';

export const BEN_SEDIRA_GRAMMAR_SECTIONS: GrammarSection[] = [
  {
    id: 'pronunciation-article',
    order: '01',
    sourcePages: 'Préface & pp. IX–XVI',
    title: 'Prononciation, Article « el- » & Pluriels',
    subtitle: 'Les bases phonétiques, l’assimilation des 14 lettres solaires et la marque du féminin.',
    keyRule:
      'En darija algérienne, aucune voyelle n’est nasalisée comme en français : dans an, in, on, un, le « n » final sonne toujours distinctement. L’article « el- » assimile sa consonne « l » devant les 14 lettres solaires (t, ts, d, r, z, s, ch, s’, d’, t’, l, n) en doublant la consonne suivante.',
    examples: [
      {
        darijaLatin: 'er-rajel / ed-dar / en-nas',
        darijaArabic: 'الراجل / الدار / الناس',
        frenchMeaning: 'l’homme / la maison / les gens (lettres solaires)',
        note: 'el + rajel devient er-rajel ; el + dar devient ed-dar.',
      },
      {
        darijaLatin: 'el-kelb / el-qamar / el-bab',
        darijaArabic: 'الكلب / القمر / الباب',
        frenchMeaning: 'le chien / la lune / la porte (lettres lunaires)',
        note: 'Devant les 14 lettres lunaires, « el- » reste intact.',
      },
      {
        darijaLatin: 'kelba → kelbet ed-dar',
        darijaArabic: 'كلبة ← كلبة الدار',
        frenchMeaning: 'chienne → la chienne de la maison (état construit)',
        note: 'Le -a féminin (ta marbouta) devient -et devant un complément ou un affixe (kelbeti = ma chienne).',
      },
    ],
    tables: [
      {
        caption: 'Schèmes de pluriel courants (pp. XIV–XVI)',
        headers: ['Singulier', 'Pluriel', 'Modèle', 'Sens'],
        rows: [
          ['fellaḥ (فلاح)', 'fellah’in (فلاحين)', '-in (régulier masc.)', 'cultivateurs'],
          ['saâ (ساعة)', 'saât (ساعات)', '-at (régulier fém.)', 'heures'],
          ['rajel (راجل)', 'rjal (رجال)', 'CCaC', 'hommes'],
          ['dar (دار)', 'diar (ديار)', 'CiC / CiaC', 'maisons'],
          ['byt (بيت)', 'byout (بيوت)', 'CCouC', 'chambres'],
          ['merkeb (مركب)', 'mrakeb (مراكب)', 'CCaCeC', 'navires'],
        ],
      },
    ],
  },
  {
    id: 'pronouns-auxiliaries',
    order: '02',
    sourcePages: 'pp. XVII–XXVII',
    title: 'Pronoms, Affixes & Auxiliaires (ând-i, ra-ni)',
    subtitle: 'Comment exprimer « avoir » et « être » et souder les pronoms compléments.',
    keyRule:
      'L’arabe parlé n’a pas de verbe « avoir » propre : on utilise la préposition « ând » (chez) + pronom affixe (« ând-i » = j’ai). Pour situer ou décrire un état présent (« je suis… »), on emploie couramment la particule « ra- » + affixe (« ra-ni », « ra-k », « ra-hou »).',
    examples: [
      {
        darijaLatin: 'Ând-i ktab / Kan ând-i / Ikoun ând-i',
        darijaArabic: 'عندي كتاب / كان عندي / يكون عندي',
        frenchMeaning: 'J’ai un livre / J’avais / J’aurai',
        note: 'On conjugue l’auxiliaire kan / ikoun devant « ând- » pour le passé et le futur.',
      },
      {
        darijaLatin: 'Ra-ni ferh’an / Kount fi ed-dar',
        darijaArabic: 'راني فرحان / كنت في الدار',
        frenchMeaning: 'Je suis content / J’étais à la maison',
        note: '« Kaïn / kaïna / kaïnin » exprime l’existence : il y a / il existe.',
      },
      {
        darijaLatin: 'Dar-i / Chaf-ni / Kif-ek',
        darijaArabic: 'داري / شافني / كيفك',
        frenchMeaning: 'Ma maison / Il m’a vu / Comme toi',
        note: 'L’affixe 1re pers. est -i après un nom et -ni après un verbe.',
      },
    ],
    tables: [
      {
        caption: 'Pronoms isolés, affixes, « Avoir » & « Être »',
        headers: ['Personne', 'Isolé', 'Affixe', 'Avoir (prés.)', 'Être (prés.)'],
        rows: [
          ['Je', 'ana / anaya', '-i (nom) / -ni (verbe)', 'ând-i', 'ra-ni'],
          ['Tu (masc.)', 'enta / entaya', '-ek / -k', 'ând-ek', 'ra-k'],
          ['Tu (fém.)', 'enti / entina', '-ek / -ki', 'ând-ek', 'ra-ki'],
          ['Il', 'hououa', '-hou / -ou', 'ând-ou', 'ra-hou'],
          ['Elle', 'hiya', '-ha', 'ând-ha', 'ra-ha'],
          ['Nous', 'ah’na', '-na', 'ând-na', 'ra-na'],
          ['Vous', 'entouma', '-koum', 'ând-koum', 'ra-koum'],
          ['Ils / Elles', 'houm / houma', '-houm', 'ând-houm', 'ra-houm'],
        ],
      },
    ],
  },
  {
    id: 'verbs-conjugation',
    order: '03',
    sourcePages: 'pp. V–VIII & XXVIII–XLI',
    title: 'Conjugaison algérienne (Aoriste, Prétérit & Irréguliers)',
    subtitle: 'La règle d’or de Ben Sedira : 3 formes par verbe + préfixes algériens n- / -ou.',
    keyRule:
      'Pour maîtriser un verbe algérien, retenez ses 3 repères : Présent 1re pers. (« n- », ex. nechri), Passé 1re pers. (« -t », ex. chrit), Passé 3e pers. masc. (ex. chra). À l’aoriste algérien, « n- » marque le singulier ET le pluriel (avec « -ou ») : nekteb (j’écris) / nektebou (nous écrivons).',
    examples: [
      {
        darijaLatin: 'Nechri / Chrit / Chra',
        darijaArabic: 'نشري / شريت / شرى',
        frenchMeaning: 'J’achète / J’ai acheté / Il a acheté',
        note: 'Verbe défectueux : à la 1re/2e pers. du passé, le -a final devient -i- (chrit, chriti).',
      },
      {
        darijaLatin: 'Njib / Jebt / Jab · Nzour / Zourt / Zar',
        darijaArabic: 'نجيب / جبت / جاب · نزور / زرت / زار',
        frenchMeaning: 'Apporter · Visiter (verbes concaves)',
        note: 'Au passé 1re/2e pers., le « a » central disparaît en « e » ou « ou » : jebt, zourt, chouft.',
      },
      {
        darijaLatin: 'Ma nektebch / Ma ktebtch / Lazem nekhedem',
        darijaArabic: 'ما نكتبش / ما كتبتش / لازم نخدم',
        frenchMeaning: 'Je n’écris pas / Je n’ai pas écrit / Il faut que je travaille',
        note: 'La négation encadre le verbe avec ma … -ch. « Lazem », « bach », « h’atta » commandent l’aoriste.',
      },
    ],
    tables: [
      {
        caption: 'Conjugaison type : kteb (كتب — écrire)',
        headers: ['Personne', 'Présent / Futur (Aoriste)', 'Passé (Prétérit)', 'Négation (Passé)'],
        rows: [
          ['Je (ana)', 'n-ekteb', 'kteb-t', 'ma kteb-t-ch'],
          ['Tu m. (enta)', 't-ekteb', 'kteb-t', 'ma kteb-t-ch'],
          ['Tu f. (enti)', 't-ekteb-i', 'kteb-ti', 'ma kteb-ti-ch'],
          ['Il (hououa)', 'i-ekteb', 'kteb', 'ma kteb-ch'],
          ['Elle (hiya)', 't-ekteb', 'ketb-èt', 'ma ketb-èt-ch'],
          ['Nous (ah’na)', 'n-ekteb-ou', 'kteb-na', 'ma kteb-na-ch'],
          ['Vous (entouma)', 't-ekteb-ou', 'kteb-tou', 'ma kteb-tou-ch'],
          ['Ils / Elles', 'i-ekteb-ou', 'ketb-ou', 'ma ketb-ou-ch'],
        ],
      },
    ],
  },
  {
    id: 'numbers-calendar',
    order: '04',
    sourcePages: 'pp. XLII–XLVIII',
    title: 'Nombres, Heures, Jours & Mois algériens',
    subtitle: 'Compter de 1 à 1000, la règle du -en de 11 à 19 et les 12 mois solaires d’Algérie.',
    keyRule:
      'Entre 11 et 19, les nombres prennent la terminaison « -en » lorsqu’ils sont suivis d’un nom au singulier (ex. « h’adachen rajel » = onze hommes). De 20 à 99, les unités précèdent toujours les dizaines reliées par « ou » (ex. « ouah’ad ou âchrin » = 21).',
    examples: [
      {
        darijaLatin: 'Ouah’ad, zouj, thlatha, arbâ, khamsa',
        darijaArabic: 'واحد، زوج، ثلاثة، أربعة، خمسة',
        frenchMeaning: '1, 2, 3, 4, 5',
        note: 'Zouj (paire) est presque toujours préféré à thnin pour « deux ».',
      },
      {
        darijaLatin: 'H’adachen rajel · Ouah’ad ou âchrin sna',
        darijaArabic: 'احداعشن راجل · واحد وعشرين سنة',
        frenchMeaning: '11 hommes · 21 ans',
        note: 'Ben Sedira note également les formes parlées sebâïn (70), thmanin (80), tsâïn (90).',
      },
      {
        darijaLatin: 'Er-rbiâ, es-seyf, el-kherif, ech-cheta',
        darijaArabic: 'الربيع، الصيف، الخريف، الشتا',
        frenchMeaning: 'Printemps, été, automne, hiver',
        note: 'Les 4 saisons d’Algérie.',
      },
    ],
    tables: [
      {
        caption: 'Jours de la semaine & Mois solaires algériens (pp. XLVI–XLVII)',
        headers: ['Jour (nehar …)', 'Sens', 'Mois algériens (1–6)', 'Mois algériens (7–12)'],
        rows: [
          ['nehar el-thnin', 'Lundi', '1. iennar (Janvier)', '7. youliou (Juillet)'],
          ['nehar et-thelatha', 'Mardi', '2. fourar (Février)', '8. r’oucht (Août)'],
          ['nehar el-arbâ', 'Mercredi', '3. mar’res (Mars)', '9. stenber (Septembre)'],
          ['nehar el-khemis', 'Jeudi', '4. ebril (Avril)', '10. ktobr (Octobre)'],
          ['nehar el-jemâ', 'Vendredi', '5. mayyou (Mai)', '11. nouenber (Novembre)'],
          ['nehar es-sebt', 'Samedi', '6. youniou (Juin)', '12. jenber (Décembre)'],
          ['nehar el-h’add', 'Dimanche', 'mia (100) · miteïn (200)', 'alf (1 000) · alfeïn (2 000)'],
        ],
      },
    ],
  },
  {
    id: 'contractions-negation',
    order: '05',
    sourcePages: 'pp. XLIX–LVI',
    title: 'Contractions parlées & Interrogation',
    subtitle: 'Pourquoi la darija dit « ach », « bach », « âlach », « kifach » et « qeddach ».',
    keyRule:
      'L’arabe parlé en Algérie fusionne les prépositions avec « ayy chay » (quelle chose) pour former des mots-outils rapides et expressifs : bi + ayy chay → bach (pour), âla + ayy chay → âlach (pourquoi), kif + ayy chay → kifach (comment), qedd + ayy chay → qeddach (combien).',
    examples: [
      {
        darijaLatin: 'Ouain rak ? / Men chaf-ni ?',
        darijaArabic: 'وين راك؟ / من شافني؟',
        frenchMeaning: 'Où es-tu ? / Qui m’a vu ?',
        note: 'Interrogatifs directs sans inversion du sujet.',
      },
      {
        darijaLatin: 'Kifach igoulou had’ el-kelma ?',
        darijaArabic: 'كيفاش يقولو هاد الكلمة؟',
        frenchMeaning: 'Comment dit-on ce mot ?',
        note: 'Formule réflexe indispensable pour apprendre de nouveaux mots à l’oral.',
      },
      {
        darijaLatin: 'Ma chi hakda · Elli ja bekri',
        darijaArabic: 'ماشي هكذا · اللي جا بكري',
        frenchMeaning: 'Pas comme ça · Celui qui est venu tôt',
        note: '« Ma chi » nie un nom ou adjectif ; « elli » remplace qui/que/lequel.',
      },
    ],
    tables: [
      {
        caption: 'Tableau des contractions parlées vs arabe littéraire (pp. XLIX–LVI)',
        headers: ['Darija parlée', 'Origine littéraire', 'Sens en français'],
        rows: [
          ['ach / ouach (آش / واش)', 'ayy chay', 'que, quoi, qu’est-ce que'],
          ['bach (باش)', 'bi ayy chay', 'afin que, pour, avec quoi'],
          ['âlach / lach (علاش / لاش)', 'âla / li ayy chay', 'pourquoi'],
          ['fach (فاش)', 'fi ayy chay', 'dans quoi, en quoi'],
          ['kifach (كيفاش)', 'kif ayy chay', 'comment'],
          ['qeddach (قدّاش)', 'qedd ayy chay', 'combien'],
          ['ouaqtach (وقتاش)', 'ouaqt ayy chay', 'quand'],
          ['elli (اللي) · belli (بلّي)', 'alladhi · bi anna', 'qui / que · que (conjonction)'],
        ],
      },
    ],
  },
];
