#!/usr/bin/env python3
"""Ingestion structurée du Manuel d'arabe algérien moderne — partie 03.

Partie 03 = 1 PDF (25 spreads), pages imprimées 90 à 137.
ATTENTION : le spread imprimé 104/105 est scanné DEUX fois (pages PDF 8 et 9) ;
la page PDF 9 est un doublon (duplicate_of 8) et n'est pas ingérée.
Couvre la fin de la leçon 22 (§108-111), les leçons 23 à 30 complètes, puis le
début du glossaire alphabétique (p.131-137, conservé en OCR de référence, non
fusionné au vocabulaire : il ne se complète qu'en partie 05).

Curation manuelle assistée par OCR colonnes + relecture visuelle des tableaux
de vocabulaire (p.91, 95, 100, 105, 110, 115). Tout reste `needs_review`.
L'OCR brut n'est jamais exporté.

Conventions de transcription (identiques parties 01/02) :
  â / û / î voyelles longues, e voyelle neutre, š = ch,
  ɛ (ayn) -> e, ġ -> g, ḥ -> h, ṣ -> s, ṭ -> t, ḍ -> d, emphatiques non marquées.
Les formes entre crochets dans le livre sont des emprunts : signalés en notes.
"""
from __future__ import annotations
import csv, hashlib, json, re, sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / 'db' / 'manuel.sqlite'
SOURCE_ID = 'tapiero-manuel-partie-03'
PART = 'partie-03'
PDF_NAME = 'partie-03.pdf'
PREV_SOURCES = ['tapiero-manuel-partie-01', 'tapiero-manuel-partie-02']
DUPLICATE_PDF_PAGE = 9  # spread 104/105 scanné deux fois


def slug(s: str) -> str:
    s = s.lower().replace('’', "'")
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s[:60] or 'x'


def j(x):
    return json.dumps(x, ensure_ascii=False)


# ---------------------------------------------------------------- leçons
# no, title, start_pdf, start_printed, end_pdf, end_printed, completeness, topics
LESSONS = [
    (23, 'Le verbe : l’expression de temps et les temps composés.', 2, 93, 4, 97, 'complete',
     ['temps', 'accompli', 'inaccompli', 'impératif', 'temps composés', 'émigration', 'France']),
    (24, 'Les verbes à conjugaison particulière. Le verbe concave.', 5, 98, 7, 102, 'complete',
     ['verbe concave', 'commerce', 'vente', 'achat', 'cordonnier']),
    (25, 'Le verbe défectueux et le verbe sourd.', 7, 103, 10, 107, 'complete',
     ['verbe défectueux', 'verbe sourd', 'nomades', 'bédouins', 'campagne', 'moutons']),
    (26, 'Les verbes dérivés : formes actives.', 11, 108, 13, 112, 'complete',
     ['verbes dérivés', 'formes actives', 'IIe forme', 'IIIe forme', 'médecin', 'hôpital', 'identité']),
    (27, 'Les verbes dérivés : formes réfléchies et passives.', 13, 113, 16, 118, 'complete',
     ['formes réfléchies', 'formes passives', 'Ve-VIe-VIIIe-Xe formes', 'VIIe-IXe formes', 'football']),
    (28, 'Manières de traduire l’infinitif.', 16, 119, 17, 121, 'complete',
     ['infinitif', 'nom d’action', 'bain maure', 'hammâm']),
    (29, 'Le passif. Traduction de « on ».', 18, 122, 19, 125, 'complete',
     ['passif', 'on indéfini', 'voyage', 'train', 'accident']),
    (30, 'Récapitulation.', 20, 126, 21, 128, 'complete',
     ['récapitulation', 'fêtes', 'aïd el-fitr', 'aïd el-adha', 'pèlerinage']),
]

# ---------------------------------------------------------------- vocabulaire
V = []


def v(lesson, form, gloss, pos='nom', gender=None, plural=None, root=None,
      pdf=None, printed=None, side=None, par=None, notes=None, ex=None, exfr=None):
    V.append(dict(lesson=lesson, form=form, gloss=gloss, pos=pos, gender=gender,
                  plural=plural, root=root, pdf=pdf, printed=printed, side=side,
                  par=par, notes=notes, ex=ex, exfr=exfr))


def block(lesson, pdf, printed, side, par, rows, pos='nom'):
    for row in rows:
        form, gloss = row[0], row[1]
        kw = dict(row[2]) if len(row) > 2 else {}
        item_pos = kw.pop('pos', pos)
        v(lesson, form, gloss, item_pos, pdf=pdf, printed=printed, side=side, par=par, **kw)


# ---- Leçon 22 (suite, p.91) — vocabulaire du texte 108 (construction)
block(22, 1, 91, 'R', '108', [
    ('rasm', 'dessin, plan', dict(gender='m', plural='rsûm')),
    ('mudda', 'durée, laps de temps', dict(gender='f')),
    ('nûe', 'sorte, qualité, type, catégorie', dict(plural='nwâe')),
    ('sûma', 'somme, prix', dict(gender='f')),
    ('hâli', 'vide, nu', dict(pos='participe actif')),
    ('šâhina', 'camion', dict(gender='f', plural='šâhinât', notes='Emprunt, entre crochets dans le livre')),
    ('meammar b-', 'rempli de', dict(pos='participe passif')),
    ('hjar', 'pierres', dict(pos='nom collectif')),
    ('rmel', 'sable'),
    ('lôha', 'planche', dict(gender='f', plural='lwâh')),
    ('trâb', 'terre (matière), poussière épaisse', dict(gender='m')),
    ('nqî', 'propre, trié', dict(pos='adj')),
    ('el-jîr', 'la chaux, le ciment'),
    ('mizâj', 'mélange (produit mélangé)'),
    ('surea', 'rapidité', dict(gender='f')),
    ('l-qarmûd', 'les tuiles', dict(pos='nom collectif')),
    ('es-sqef', 'le toit, le plafond'),
    ('muqâwil', 'contractant, entrepreneur', dict(pos='participe actif')),
    ('si-', 'monsieur, sieur', dict(notes='Abréviation de sîdi ou sayyîdi')),
])
block(22, 1, 91, 'R', '108', [
    ('bna', 'construire, faire construire', dict(notes='inaccompli ibni')),
    ('ttâfeq', 's’accorder sur', dict(notes='inaccompli ittâfeq ela- ; s’emploie surtout au pluriel')),
    ('hallat', 'mélanger', dict(notes='inaccompli ihallat')),
    ('hfar', 'creuser, piocher', dict(notes='inaccompli ihfar')),
    ('laggat', 'ramasser', dict(notes='inaccompli ilaggat')),
    ('fettet', 'réduire en poussière', dict(notes='inaccompli ifettet')),
    ('dres', 'broyer', dict(notes='inaccompli idres ; homonyme de dres, idrus (étudier), voir glossaire')),
    ('tallae', 'édifier, faire monter', dict(notes='inaccompli itallae')),
    ('seggef', 'recouvrir d’un toit', dict(notes='inaccompli iseggef')),
    ('warra', 'montrer, faire voir', dict(notes='inaccompli iwarri')),
    ('ntaq', 'parler à qn, lui adresser la parole', dict(notes='inaccompli intaq l-')),
], pos='verbe')
block(22, 1, 91, 'R', '108', [
    ('hârej-men', 'en dehors de', dict(notes='Variante hârej')),
    ('baed-', 'après (un laps de temps)'),
    ('bih-fih', 'rapidement, vite, immédiatement', dict(notes='Variante fih-bih ; synonyme b-surea')),
    ('muddat-', 'pendant…'),
    ('zmân', 'jadis, il y a longtemps'),
    ('men-hnak', 'par là-bas'),
    ('hetta-', 'jusqu’à ce que', dict(notes='Avec un verbe')),
    ('gêr', 'seulement, il suffit', dict(notes='Avec un verbe')),
    ('ki-ma-', 'comme si', dict(notes='Avec un verbe')),
], pos='expression')

# ---- Leçon 23 (p.95) — vocabulaire du texte 112
block(23, 3, 95, 'R', '112', [
    ('qsontîna', 'Constantine', dict(pos='nom propre')),
    ('risâla', 'lettre', dict(gender='f', notes='Synonyme brîya')),
    ('warqa', 'papier, feuille', dict(gender='f', notes='Emprunt entre crochets : kâgat')),
    ('eunwân', 'adresse'),
    ('qitâr', 'train, locomotive'),
    ('mahatta', 'gare, station', dict(gender='f')),
    ('weqt', 'moment, époque'),
    ('kelma', 'parole', dict(gender='f', plural='klâm')),
    ('el-easkar', 'la vie militaire, le service militaire'),
])
block(23, 3, 95, 'R', '112', [
    ('mhenni', 'tranquille, en paix', dict(pos='adj')),
    ('hâyer', 'étonné, embarrassé', dict(pos='participe actif')),
    ('meskîn', 'pauvre, malheureux', dict(pos='adj', plural='msâkîn')),
    ('nasrâni', 'chrétien, européen', dict(pos='adj', plural='nṣârâ')),
])
block(23, 3, 95, 'R', '112', [
    ('lhaq', 'parvenir (chose) à qn', dict(notes='inaccompli ilhaq + complément direct')),
    ('rwah', 'viens !', dict(notes='Impératif arwah seulement')),
    ('jeal', 'mettre, placer', dict(notes='inaccompli ijeal')),
    ('bqa', 'rester', dict(notes='inaccompli ibqa ; accompli 1re pers. bqit')),
    ('eraf', 'connaître, savoir', dict(notes='inaccompli yaeraf')),
    ('ugef', 'se tenir debout, s’arrêter', dict(notes='inaccompli yugef')),
    ('nzar', 'regarder qn ou qch.', dict(notes='inaccompli yanzor l-')),
    ('bâyes', 'saluer qn avec respect', dict(notes='inaccompli ibâyes l-')),
    ('fham', 'comprendre qn ou qch.', dict(notes='inaccompli ifham')),
    ('râfeq', 'accompagner qn', dict(notes='inaccompli irâfeq')),
    ('sellem', 'saluer, embrasser', dict(notes='inaccompli isellem ela-')),
    ('etâ', 'donner qch. à qn', dict(notes='Variantes aetâ ; inaccompli yaetê ou yuetê ; 2 compléments directs')),
], pos='verbe')
block(23, 3, 95, 'R', '112', [
    ('blâ-', 'sans'),
    ('men-', 'depuis', dict(notes='Avec un laps de temps')),
    ('hâdi-', 'depuis', dict(notes='Avec un laps de temps')),
    ('mlêh', 'bien, convenablement'),
    ('hetta-l-', 'jusqu’à (lieu)'),
    ('illa', 'si ce n’est', dict(notes='Après une négation')),
], pos='expression')

# ---- Leçon 24 (p.100) — vocabulaire du texte 117
block(24, 6, 100, 'L', '117', [
    ('el-bîe', 'la vente'),
    ('eš-šrâ', 'l’achat'),
    ('sfanji', 'marchand de beignets'),
    ('hâla', 'situation, dimension', dict(gender='f')),
    ('sbâbṭi', 'cordonnier', dict(notes='OCR ṣbâbṭê ; à confirmer')),
    ('el-eatriya', 'les épices, les comestibles'),
    ('qâbsa', 'boîte, caissette', dict(gender='f', notes='Emprunt, entre crochets dans le livre')),
    ('sabbât', 'paire de chaussures', dict(gender='m', notes='Singulatif ; collectif šbâbṭa')),
    ('nafqa', 'dépense, prix', dict(gender='f')),
    ('mahfada', 'portefeuille', dict(gender='f')),
])
block(24, 6, 100, 'L', '117', [
    ('jâyez ela-', 'passant près de', dict(pos='participe actif')),
    ('dâhel', 'entrant', dict(pos='participe actif')),
    ('râsi', 'usé, râpé', dict(pos='adj', notes='Synonyme bâli')),
    ('zâhi', 'brillant, flambant', dict(pos='adj')),
    ('gâli', 'cher, d’un prix élevé', dict(pos='adj')),
    ('rhês', 'bon marché', dict(pos='adj')),
])
block(24, 6, 100, 'L', '117', [
    ('dawwar', 'tourner, retourner qch.', dict(notes='inaccompli idawwar ; verbe transitif')),
    ('zâr', 'rendre visite à qn', dict(notes='inaccompli izûr ; verbe transitif')),
    ('qâs', 'essayer, mesurer ; jeter', dict(notes='inaccompli iqês')),
    ('bga', 'vouloir, désirer', dict(notes='inaccompli ibgi')),
    ('mât', 'mourir', dict(notes='inaccompli imût')),
    ('rwaḥ', 'venir', dict(notes='inaccompli irwaḥ')),
    ('dkar', 'citer, rappeler', dict(notes='inaccompli idkar')),
    ('hda', 'prendre', dict(notes='inaccompli yahud ; impératif hud')),
    ('hemmem', 'réfléchir', dict(notes='inaccompli ihemmem')),
], pos='verbe')
block(24, 6, 100, 'L', '117', [
    ('kîf-kîf', 'la même chose (comme, comme)'),
    ('gâya', 'impeccablement, extrêmement'),
    ('qadd-qadd', 'exactement'),
], pos='expression')

# ---- Leçon 25 (p.105) — vocabulaire du texte 122
block(25, 8, 105, 'R', '122', [
    ('rahhâl', 'nomade', dict(plural='rahhâla')),
    ('el-ḥdar', 'les citadins, les sédentaires', dict(pos='nom collectif', notes='Singulier ḥaḍri')),
    ('ism', 'nom (de qn)'),
    ('qarya', 'village', dict(gender='f')),
    ('bedwî', 'bédouin', dict(pos='adj')),
    ('šḥam', 'graisse'),
    ('el-ḥlâ', 'la campagne, l’immensité', dict(notes='Synonyme er-rîf')),
    ('zhar', 'chance, bonne fortune'),
    ('bâdiya', 'désert', dict(gender='f')),
    ('ḥayât', 'vie, existence', dict(gender='f', notes='Synonyme meîša')),
])
block(25, 8, 105, 'R', '122', [
    ('maerûf', 'connu', dict(pos='participe passif')),
    ('saeîd', 'heureux', dict(pos='adj')),
    ('smîn', 'gras', dict(pos='adj', plural='smân')),
    ('sâlem', 'sain', dict(pos='participe actif')),
    ('flân', 'un tel, une telle', dict(pos='adj', notes='Féminin flâna ; synonyme flâni (f. flâniya)')),
])
block(25, 8, 105, 'R', '122', [
    ('sâq', 'mener (une bête) en la poussant', dict(notes='inaccompli isôq fi-')),
    ('ḥayyar', 'choisir', dict(notes='inaccompli iḥayyar')),
    ('ḍhar', 'convenir, plaire à qn ; apparaître', dict(notes='inaccompli iḍhar l-')),
    ('sâwem', 'demander le prix (de qch.)', dict(notes='inaccompli isâwem ela-')),
    ('tsâwem', 'discuter le prix (de qch.)', dict(notes='inaccompli itsâwem ela-')),
    ('dfae', 'verser (de l’argent) à qn', dict(notes='inaccompli idfae l-')),
    ('rabba', 'élever qn', dict(notes='inaccompli irabbi')),
    ('rea', 'brouter, paître, garder les bêtes', dict(notes='inaccompli irea')),
    ('rhel', 'se déplacer', dict(notes='inaccompli irhel')),
    ('kla', 'manger', dict(notes='inaccompli yakul')),
    ('trabba', 'être élevé, s’élever', dict(notes='inaccompli itrabba')),
    ('jra', 'courir', dict(notes='inaccompli ijri')),
    ('bka', 'pleurer', dict(notes='inaccompli ibki')),
    ('mraḍ', 'tomber malade', dict(notes='inaccompli imraḍ')),
], pos='verbe')

# ---- Leçon 26 (p.110) — verbes du texte 127
block(26, 12, 110, 'L', '127', [
    ('ftan', 'se réveiller, comprendre clairement', dict(notes='inaccompli iftan')),
    ('nawwaḍ', 'faire lever qn, réveiller qn', dict(notes='inaccompli inawwaḍ')),
    ('kassar', 'casser, briser', dict(notes='inaccompli ikassar')),
    ('hassan', 'se raser (embellir)', dict(notes='inaccompli ihassan')),
    ('tawwal', 'allonger', dict(notes='inaccompli itawwal')),
    ('harrak', 'remuer qn ou qch.', dict(notes='inaccompli iharrak')),
    ('uqqef', 'mettre debout qn, le mettre sur ses jambes', dict(notes='inaccompli yuqqef')),
    ('leffef', 'envelopper qn ou qch.', dict(notes='inaccompli ileffef')),
    ('rawwaḥ', 's’en aller', dict(notes='inaccompli irawwaḥ')),
    ('seqsâ', 'questionner', dict(notes='inaccompli iseqsê')),
    ('nzâd', 's’ajouter, naître', dict(notes='inaccompli inzâd')),
    ('madd', 'tendre, donner qch.', dict(notes='inaccompli imadd')),
    ('herrej', 'faire sortir, tirer', dict(notes='inaccompli iherrej')),
    ('qsam', 'partager', dict(notes='inaccompli iqsam')),
    ('riyyeh', 'souffler, se reposer', dict(notes='inaccompli iriyyeh')),
    ('fetteš', 'rechercher', dict(notes='inaccompli ifetteš')),
    ('dfae', 'pousser qn, verser (de l’argent, un papier)', dict(notes='inaccompli idfae ; repris leçon 25')),
    ('walla', 'revenir, devenir', dict(notes='inaccompli iwalli')),
    ('naqqal', 'transporter', dict(notes='inaccompli inaqqal')),
    ('lzem', 'être nécessaire', dict(notes='inaccompli ilzem')),
], pos='verbe')

# ---- Leçon 27 (p.115) — verbes du texte 132
block(27, 14, 115, 'R', '132', [
    ('tlâga', 'se rencontrer', dict(notes='inaccompli itlâga')),
    ('tfarraq', 'se séparer, se diviser en', dict(notes='inaccompli itfarraq ela-')),
    ('hbat', 'frapper, donner des coups', dict(notes='inaccompli ihbat')),
    ('thâbat', 'se donner des coups réciproquement', dict(notes='inaccompli ithâbat')),
    ('tharrak', 'se remuer', dict(notes='inaccompli itharrak')),
    ('lhaq', 'atteindre, aller vite vers', dict(notes='inaccompli ilhaq ; repris leçon 23 avec autre sens')),
    ('tdâfae', 'se bousculer', dict(notes='inaccompli itdâfae')),
    ('gleb', 'vaincre qn', dict(notes='inaccompli igleb')),
    ('njrah', 'être blessé', dict(notes='inaccompli injrah')),
    ('lâqa', 'rencontrer qn, atteindre qch.', dict(notes='inaccompli ilâqi')),
    ('qfez', 'sauter', dict(notes='inaccompli iqfez')),
    ('hkem', 'atteindre, saisir', dict(notes='inaccompli ihkem')),
    ('tfarraj', 'jouir d’un spectacle', dict(notes='inaccompli itfarraj')),
    ('tkassar', 'se casser, se briser', dict(notes='inaccompli itkassar')),
    ('tmešša', 'se déplacer, marcher', dict(notes='inaccompli itmešša')),
    ('twakka', 's’appuyer', dict(notes='inaccompli itwakka')),
    ('tnaqqal', 'être transporté', dict(notes='inaccompli itnaqqal')),
    ('tdâbez', 'se battre à coups de poing', dict(notes='inaccompli itdâbez')),
    ('tdârab', 'se battre', dict(notes='inaccompli itdârab')),
    ('hezz', 'secouer, prendre', dict(notes='inaccompli ihezz')),
    ('sellek', 'libérer, délivrer qn', dict(notes='inaccompli isellek')),
    ('štġal', 's’occuper de', dict(notes='inaccompli ištġal b-')),
], pos='verbe')

# ---------------------------------------------------------------- grammaire
R = []


def r(lesson, par, title, summary, examples, pdf, printed, side, notes=None):
    R.append(dict(lesson=lesson, par=par, title=title, summary=summary, examples=examples,
                  pdf=pdf, printed=printed, side=side, notes=notes))


r(22, '110', 'Les particules',
  'On appelle particules l’ensemble des mots et expressions invariables : conjonctions, prépositions, adverbes et locutions. Le glossaire en donne le détail ; le tableau présente les catégories principales.',
  [{'latin': 'tumma', 'fr': 'ensuite (conjonction)'}, {'latin': 'fâq-', 'fr': 'au-dessus de (préposition)'},
   {'latin': 'lhéh', 'fr': 'là-bas (adverbe)'}, {'latin': 'b-es-syäsa', 'fr': 'lentement'},
   {'latin': 'lamma', 'fr': 'lorsque'}, {'latin': 'bin-', 'fr': 'entre'}],
  2, 92, 'L')
r(23, '113', 'L’expression de temps',
  'Chaque aspect de la conjugaison a une correspondance dans le temps. L’accompli correspond en général au passé composé ou au passé simple (action achevée), ou à un présent pour un état ressenti.',
  [{'latin': 'rkbet el-qitâr', 'fr': 'je suis monté / je montai dans le train'},
   {'latin': 'ana fraht', 'fr': 'je suis content'}, {'latin': 'huwwa eṭaš', 'fr': 'il est altéré'}],
  3, 95, 'R')
r(23, '113bis', 'L’expression de temps (fin)',
  'L’inaccompli correspond au présent et parfois au futur (action inachevée). Certaines conjonctions (belli, hetta, bâš, ida, lâkân) peuvent être suivies de l’accompli ou de l’inaccompli, à traduire au mode français convenable. L’impératif correspond à un impératif (ordre ou conseil).',
  [{'latin': 'nerkeb el-bâhira', 'fr': 'je monte / je monterai sur le bateau'},
   {'latin': 'arkeb w-arwah le-fransâ', 'fr': 'embarque-toi et viens en France'}],
  4, 96, 'L')
r(23, '115', 'Les temps composés',
  'L’ensemble kân, ikûn + un autre verbe forme des temps composés. a) kân à l’accompli + verbe à l’inaccompli = imparfait. Quand deux verbes se suivent (accompli + inaccompli), le second équivaut à un infinitif.',
  [{'latin': 'kân igûl-li', 'fr': 'il me disait'}, {'latin': 'kunt gâced', 'fr': 'j’étais assis'},
   {'latin': 'bda yanzor li', 'fr': 'il commença à me regarder'}],
  4, 96, 'L')
r(23, '115bis', 'Les temps composés (fin)',
  'b) kân accompli + verbe accompli = plus-que-parfait. c) ikûn inaccompli + verbe accompli = futur antérieur. Pour un présent duratif (progressif), on emploie râni, râk… + inaccompli.',
  [{'latin': 'kân fham-ni', 'fr': 'il m’avait compris'}, {'latin': 'zâd jeal', 'fr': 'il avait mis en plus'},
   {'latin': 'ikûn kteb-li', 'fr': 'il m’aura écrit'}, {'latin': 'râh ihdem', 'fr': 'il travaille (est en train de travailler)'}],
  4, 97, 'R')
r(24, '118', 'Les verbes à conjugaison particulière',
  'Verbes dont la racine se compose de deux consonnes (ou d’une consonne avec voyelle), plus les racines à deux consonnes dont la 2e est redoublée. On distingue trois sortes selon la place de la voyelle : concave, défectueux, sourd.',
  [{'latin': 'gâl, igûl', 'fr': 'dire (concave)'}, {'latin': 'bda, ibda', 'fr': 'commencer (défectueux)'},
   {'latin': 'habb, ihabb', 'fr': 'aimer (sourd)'}],
  6, 100, 'L')
r(24, '118bis', 'Les verbes à conjugaisons particulières (fin)',
  'Le concave a la voyelle au milieu (bâe, ibîe) ; le défectueux a la voyelle à la fin (mša, imši ; ja, iji) ; le sourd a la 2e consonne redoublée (madd, imadd). Certains verbes à deux consonnes (wsal) se conjuguent comme des verbes à trois consonnes.',
  [{'latin': 'hâf, ihâf', 'fr': 'avoir peur (concave)'}, {'latin': 'eṭâ, yeṭâ', 'fr': 'donner (défectueux)'},
   {'latin': 'wsal, yusal', 'fr': 'arriver (conjugaison ordinaire)'}],
  6, 101, 'R')
r(24, '120', 'Le verbe concave',
  'a) Accompli : aux 1re/2e personnes sing. et pl., la voyelle intérieure devient la voyelle brève correspondant à la voyelle longue de l’inaccompli. b) Inaccompli normal. c) Impératif : voyelle de l’inaccompli mais brève. d) Participe actif : consonne supplémentaire y (râyeh, fâyeh) ; parfois w dans les dérivés (dawwar).',
  [{'latin': 'gult, gult, gulti, gâl, gâlet ; gulna, gultu, gâlu', 'fr': 'accompli de gâl'},
   {'latin': 'gul, guli, gulu', 'fr': 'impératif de gâl'}, {'latin': 'râyeh', 'fr': 'allant (participe de râh)'}],
  7, 102, 'L')
r(25, '123', 'Le verbe défectueux',
  'a) Accompli : racine avec a final aux 3es personnes ; aux 1re/2e personnes sing. et pl., le a devient i. À la 3e pers. pl., le w suffixé se transforme en consonne (bdaw, mšaw).',
  [{'latin': 'bdit, bdit, bditi, bda, bdat ; bdina, bditu, bdaw', 'fr': 'accompli de bda'},
   {'latin': 'mšit, mšit, mšiti, mša, mšat ; mšina, mšitu, mšaw', 'fr': 'accompli de mša'}],
  8, 105, 'R')
r(25, '123bis', 'Le verbe défectueux (fin)',
  'b) Inaccompli normal mais : à la 2e pers. f. sing. le suffixe i tombe pour éviter le hiatus (tebdi, temši) ; aux 3es pers. pl. le w se transforme (nebdaw, nemšiw). c) Impératif : mêmes terminaisons (bda, bdi, bdaw). d) Participe actif terminé par i (gâli, zâhi). Nota : kla (yakul) et hda (yahud) sont défectueux à l’accompli mais ordinaires à l’inaccompli.',
  [{'latin': 'tebdi, temši', 'fr': 'tu commences / tu vas (f.)'}, {'latin': 'bda, bdi, bdaw', 'fr': 'impératif de bda'},
   {'latin': 'gâli', 'fr': 'cher (participe)'}],
  10, 106, 'L')
r(25, '125', 'Le verbe sourd',
  'À l’accompli, les 1re/2e personnes sing. et pl. dédoublent la racine devant le suffixe (terminaisons proches du défectueux). À l’inaccompli et à l’impératif, la racine sourde se présente comme une racine à trois consonnes, la voyelle intérieure se maintenant après la 1re radicale. Les dérivés ont la même particularité.',
  [{'latin': 'habbit, habbit, habbiti, habb, habbet ; habbina, habbitu, habbu', 'fr': 'accompli de habb'},
   {'latin': 'nhabb, thabb… nhabbu', 'fr': 'inaccompli de habb'}],
  10, 107, 'R')
r(26, '128', 'Les verbes dérivés',
  'Certaines racines donnent, par addition de consonnes ou voyelles longues, des formes dérivées du verbe primitif (Ire forme). Chaque forme ajoute une nuance. On distingue formes actives et formes réfléchies/passives. Les dérivés se conjuguent comme les verbes ordinaires, sauf ceux issus de défectueux (terminaison a à l’accompli).',
  [{'latin': 'walla, iwalli', 'fr': 'revenir, devenir (comme mša)'},
   {'latin': 'teašša, iteašša', 'fr': 'souper (comme bda)'}],
  12, 110, 'L')
r(26, '128bis', 'Les verbes dérivés (fin)',
  'Les dérivés ont des participes et noms d’action correspondant à chaque forme. Les participes commencent par m- (me, mu) avec i/é/a avant la consonne finale ; ceux des défectueux se terminent par i/é/a. Les noms d’action sont de plus en plus employés dans le langage moderne.',
  [{'latin': 'mrabbi', 'fr': 'élevé (participe)'}, {'latin': 'mġaṭṭi', 'fr': 'couvert, recouvert'},
   {'latin': 'mustašfa', 'fr': 'hôpital (lieu où est recherchée la guérison)'}],
  12, 111, 'R')
r(26, '130', 'Formes dérivées actives',
  'Deux formes à sens actif, transitives. a) IIe forme : redoublement de la consonne intérieure (deux w/y pour les concaves) ; nuance factitive, causative ou intensive. Parfois dérivée d’un nom ou adjectif.',
  [{'latin': 'earraf', 'fr': 'faire connaître, identifier (de eraf)'},
   {'latin': 'tawwal', 'fr': 'rendre long (de ṭâl)'}, {'latin': 'fetteš', 'fr': 'rechercher (de fteš)'},
   {'latin': 'sellem', 'fr': 'adresser le salut (de salâm)'}, {'latin': 'hassan', 'fr': 'rendre beau, se raser (de hasan)'}],
  12, 111, 'R')
r(26, '130bis', 'Formes dérivées actives (fin)',
  'Le nom d’action de la IIe forme a un a après la 2e consonne au lieu du redoublement (taerif, tafftîš). b) IIIe forme : â après la 1re consonne (w/y pour les concaves) ; nuance participative ou active, action en faveur de qn. Nom d’action : m- préfixé et a final (mucâwana).',
  [{'latin': 'taerif', 'fr': 'identification, identité'}, {'latin': 'bâyes', 'fr': 'saluer qn avec respect'},
   {'latin': 'eâwen', 'fr': 'aider qn'}, {'latin': 'râfeq', 'fr': 'accompagner qn'}, {'latin': 'mucâwana', 'fr': 'aide, assistance'}],
  13, 112, 'L')
r(27, '133', 'Formes dérivées réfléchies',
  'Quatre formes à sens réfléchi. a) Ve forme : préfixe t- devant la IIe forme ; sens réfléchi du dérivé, parfois passif ; forme réfléchie la plus fréquente. Nom d’action avec u intérieur (tafarruq).',
  [{'latin': 'tkassar', 'fr': 'se casser (de kassar)'}, {'latin': 'tharrak', 'fr': 'se remuer (de harrak)'},
   {'latin': 'tnaqqal', 'fr': 'se transporter, être transporté (de naqqal)'}],
  14, 115, 'R')
r(27, '133bis', 'Formes dérivées réfléchies (fin)',
  'b) VIe forme : t- devant la IIIe forme ; réciprocité (surtout au pluriel), renforcée par -bâed. Nom d’action u intérieur (tacâwun). c) VIIIe forme : t- infixé après la 1re consonne ; action profitable à soi-même. Nom d’action i intérieur + a avant dernière radicale (štiġâl). d) Xe forme : préfixe st(a)- ; sens réfléchi ou recherche d’un but. Nom d’action comme VIIIe (stieâjâb). Une IVe forme active existe mais est peu apparente (aetâ).',
  [{'latin': 'teâwen', 'fr': 's’entraider (de eâwen)'}, {'latin': 'tdârab', 'fr': 'se battre réciproquement'},
   {'latin': 'štġal', 'fr': 's’occuper (de šġal)'}, {'latin': 'stiejab', 'fr': 's’émerveiller (de ejab)'},
   {'latin': 'stġfar', 'fr': 'rechercher le pardon de Dieu'}],
  15, 116, 'L')
r(27, '135', 'Formes dérivées passives',
  'Deux formes à sens passif. a) VIIe forme : préfixe n- devant le verbe primitif d’action ; sens passif. Nom d’action i intérieur + a avant dernière radicale (nqisâm). b) IXe forme : â avant la dernière radicale d’un verbe d’état ou de couleur ; sens réfléchi passif ; pas de nom d’action. La Ve forme peut aussi avoir un sens passif (twelled).',
  [{'latin': 'njrah', 'fr': 'être blessé (de jrah)'}, {'latin': 'ngsam', 'fr': 'être partagé (de qsam)'},
   {'latin': 'šeâb', 'fr': 'se compliquer (de seâb)'}, {'latin': 'ḥdâr', 'fr': 'verdir (de ḥdar)'},
   {'latin': 'twelled', 'fr': 'être mis au monde, naître'}],
  15, 117, 'R')
r(27, '136bis', 'Tableau récapitulatif des formes dérivées',
  'Tableau des formes dérivées courantes (IIe, IIIe, Ve, VIe, VIIe, VIIIe, IXe, Xe) avec verbe, participe et nom d’action. Les participes entre parenthèses sont ceux de l’arabe littéral, de plus en plus usités.',
  [{'latin': 'eallam / meallam / taclîm', 'fr': 'IIe : enseigner / enseignant / enseignement'},
   {'latin': 'eâwen / meâwen / mucâwana', 'fr': 'IIIe : aider / aidant / assistance'},
   {'latin': 'teallam / meteallam / tasallum', 'fr': 'Ve : apprendre'},
   {'latin': 'nqsam / menqsem / nqisâm', 'fr': 'VIIe : être partagé'},
   {'latin': 'štġal / meštġel / štiġâl', 'fr': 'VIIIe : s’occuper'}],
  16, 118, 'L')
r(28, '138', 'Manières de traduire l’infinitif',
  'L’infinitif n’existe pas en arabe. Deux moyens : 1) l’inaccompli du verbe, placé après un verbe à l’accompli ou inaccompli, sans conjonction si le premier exprime sentiment/désir/volonté/pouvoir/commencement, sinon avec bâš (souvent supprimable). 2) un nom d’action ou d’état (a intérieur ou a final), y compris ceux des formes dérivées.',
  [{'latin': 'bda igsil', 'fr': 'il s’est mis à laver'}, {'latin': 'nhabb neleab', 'fr': 'j’aime jouer'},
   {'latin': 'hrej bâš idarbo la-hwâ', 'fr': 'il est sorti pour prendre l’air'},
   {'latin': 'nhabb er-rqâd', 'fr': 'j’aime m’étendre'}, {'latin': 'neštġal bi-tacallum el-luga', 'fr': 'je m’occupe d’étudier la langue'}],
  17, 121, 'R')
r(29, '142', 'Le passif ; traduction de « on »',
  'a) Le passif est rare (agent inconnu). Moyens : 1) VIIe forme (préfixe n-) ou formes réfléchies Ve/VIe à sens passif ; 2) ajouter t- au préfixe de l’inaccompli. Ne pas confondre nhallu (passif) et nhall (actif). b) « on » se rend par la 1re pers. pl., la 3e pers. pl., un passif, ou un sujet vague (en-nâs).',
  [{'latin': 'nhallu l-bibân', 'fr': 'les portes ont été ouvertes'}, {'latin': 'tbârek allâh', 'fr': 'Dieu soit béni'},
   {'latin': 'el-ġâleb yutġlab', 'fr': 'le vainqueur sera vaincu'}, {'latin': 'nleabu', 'fr': 'on joue (nous jouons)'},
   {'latin': 'demmru-ni', 'fr': 'on m’a bousculé'}, {'latin': 'en-nâs eayyṭu', 'fr': 'on cria (les gens crièrent)'}],
  19, 124, 'L')

# ---------------------------------------------------------------- exercices
E = []


def e(lesson, par, kind, prompt, items, pdf, printed, side):
    E.append(dict(lesson=lesson, par=par, kind=kind, prompt=prompt, items=items,
                  pdf=pdf, printed=printed, side=side))


e(22, '108bis', 'version', 'Traduire le texte 108.', [], 1, 91, 'R')
e(22, '109', 'questions', 'Répondre aux questions suivantes (sur le texte 108).',
  ['wén habb ibni dâr eammi Milûd ?', 'âškûn bâe lo l-ard ?', 'mnin dhel eammi eand-el-bennây wâš gâl-lo ?',
   'kéfâš jâwbo l-bennây ?', 'âš-men sûma ttâfqu eliha ?', 'âš-men-nûe tkûn dik-ed-dâr ?',
   'âšhâl jâw men-šâhinât ?', 'šhâl jâbu men âlât ?', 'wâš jâbu bâš iġaṭṭiw es-sqef ?',
   'zmân, kéfâš kânu ibniw ed-dyâr ?', 'wâš gâl eammi l-el-muqâwil ?', 'wâš jâwbo l-muqâwil ?'], 1, 91, 'R')
e(22, '111', 'theme', 'Traduire en arabe (thème) : Depuis longtemps, je connais un Européen maçon qui travaille impeccablement… (construction d’une maison dans la banlieue de Annâba).', [], 2, 92, 'L')
e(23, '112bis', 'version', 'Traduire le texte 112.', [], 3, 95, 'R')
e(23, '114', 'questions', 'Répondre aux questions suivantes (sur le texte 112).',
  ['âšhâl hâdi li kunt gâced f-blâdi w-ana blâ-hedma ?', 'âškûn kteb-li bâš nrûh le-fransâ ?',
   'wâš gâl-li f-el-briya ?', 'wâš rhebt bâš nrûh le-fransâ ?', 'lamma hrejt men-el-mahatta, wâš emelt ?',
   'kéfâš kunt ?', 'elâš ?', 'lûkân ujedt fransâwi yaeraf itkellem el-carbiya, kéfâš thellemna ana wiyya-l-h ?',
   'elâš enta teteallem el-carbiya w-tetkellem ?'], 4, 96, 'L')
e(23, '116', 'theme', 'Traduire en arabe (thème) : Nous étions assis sans travail, mon frère et moi, depuis six mois jusqu’à ce que nous nous embarquâmes sur le bateau… (arrivée à Marseille, rencontre d’un Français arabophone).', [], 4, 97, 'R')
e(24, '117bis', 'version', 'Traduire le texte 117.', [], 6, 100, 'L')
e(24, '119', 'questions', 'Répondre aux questions suivantes (sur le texte 117).',
  ['âškûn hum muwâlén-le-hwânet ?', 'dhar tlâta d-el-hwânet elli ihedmu fihum mwâléhum.',
   'ela-lli muwâléhum gêr ibieu fihum ?', 'mnin tedhel l-hânût wâš tgûl l-el-meallem ?', 'kéfâš ijéweb ?',
   'kéfâš kân es-sbâblé mnin juzt guddâm-hânûto ?', 'kéfâš kân el-heddâm wella-là ?',
   'wâš gult-lo mnin kunt hârej men-hânûto ?', 'kéfâš jéwbek ?'], 6, 101, 'R')
e(24, '121', 'theme', 'Traduire en arabe (thème) : Nous sommes passés, mon ami et moi, près de la boutique du marchand de beignets… (visite au tailleur, burnous en laine).', [], 7, 102, 'L')
e(25, '122bis', 'version', 'Traduire le texte 122.', [], 8, 105, 'R')
e(25, '124', 'questions', 'Répondre aux questions suivantes (sur le texte 122).',
  ['âškûn kân el-bedwi, mô-le-ġnem ?', 'layn kân isôq fi-dik le-ġnem ?', 'mea-men tkellem ?',
   'elâš ma-šra-š el-kebš yâmes ?', 'kéfâš kân el-kebš elli šrah si-Sâlem ?',
   'elâš gâl si-Sâlem l-el-bedwi : « enta, eandek ez-zhar ! » ?', 'elâš si-Sâlem ma-irjae-š mea l-el-bedwi ?',
   'w-enta wâš-men hayât thabb ?', 'el-yôm, kéfâš tbân el-hayât f-el-mdin el-kubra ?'], 10, 107, 'R')
e(25, '126', 'theme', 'Traduire en arabe (thème) : Nous avons rencontré hier un bédouin qui était debout au marché aux moutons… (achat d’un mouton pour un michoui, enfance à la campagne).', [], 10, 107, 'R')
e(26, '127bis', 'version', 'Traduire le texte 127.', [], 12, 110, 'L')
e(26, '129', 'questions', 'Répondre aux questions suivantes (sur le texte 127).',
  ['kéfâš Bû-Tâleb sbah rôho mnin ftan ?', 'wâš nawwdo ?', 'elâš ja sâhbo iharrak Bû-Tâleb w-yuqgfo ?',
   'wâš emel tâni sâhbo bâš ieâwen Bû-Tâleb ?', 'mnin dhel l-el-mekteb, wâš gâl-lo l-el-muwaddaf ?',
   'lamma segsâh el-muwaddaf, elâš ma-gder-š ijâweb ?', 'hâd-el-muwaddaf râjel mléh wella gbéh ?',
   'u-elâš ?', 'mnin temrad enta, wâš ieamlu f-el-mustašfa ?', 'weqtâš ijiw el-aqârib izûru l-morda ?'], 12, 111, 'R')
e(26, '131', 'theme', 'Traduire en arabe (thème) : Quel est votre nom ? À quelle date êtes-vous né ?… (formulaire d’identité, hôpital, caisse d’épargne).', [], 13, 112, 'L')
e(27, '132bis', 'version', 'Traduire le texte 132.', [], 14, 115, 'R')
e(27, '134', 'questions', 'Répondre aux questions suivantes (sur le texte 132).',
  ['âš-men laeb ihabbuh laktar ulâd el-jazâir ?', 'kéfâš ilaeabu f-hâd-el-laeb ?', 'elâš iḍarbu l-kora b-er-rjel ?',
   'u-hâd-el-laeb sâhel wella seâb ?', 'l-ulâd injarhu-ši f-hâd-el-laeb ?', 'mnin injerh wâhed, kéfâš injem-ši ileab ?',
   'w-ed-dabza kâyna fi-hâd-el-laeb ?', 'hki-li wâš eamlu l-ulâd ?', 'f-el-eotla, enta wâš tdir ?'], 15, 117, 'R')
e(27, '136', 'theme', 'Traduire en arabe (thème) : J’étais un jour avec six de mes amis et nous avons rencontré des adolescents qui parlaient entre eux… (match de football, blessure, hôpital).', [], 15, 117, 'R')
e(28, '137bis', 'version', 'Traduire le texte 137.', [], 17, 121, 'R')
e(28, '139', 'questions', 'Répondre aux questions suivantes (sur le texte 137).',
  ['eš-šaeb el-jazâiri thabb el-hammâm ?', 'gul wâš iemel men el-wegt elli yusal l-el-hammâm hetta elli ikrej menno ?',
   'u-nta iejbek-ši l-hammâm ?', 'elâš ?'], 17, 121, 'R')
e(28, '140', 'theme', 'Traduire en arabe (thème) : Je veux lire et écrire en arabe. Tu sais écrire en français, mais tu ne sais pas écrire en arabe… (travail, construction, fer).', [], 17, 121, 'R')
e(29, '141bis', 'version', 'Traduire le texte 141.', [], 19, 124, 'L')
e(29, '143', 'questions', 'Répondre aux questions suivantes (sur le texte 141).',
  ['mnin hrejna ana u-bâya ?', 'wâš gâl-l-na si-Qaddûr el-qahwâji ?', 'wâš šrina ?', 'kéfâš kân el-gâsi f-el-gitâr ?',
   'hki-li kéfâš tsâfer f-el-gitâr wella-f-et-tayyâra ?', 'wâš tsemel ?', 'wâš tsûf fi-dak es-safar ?'], 19, 125, 'R')
e(29, '144', 'theme', 'Traduire en arabe (thème) : Un jour, un malheur est arrivé dans la rue. Un vieillard misérable marchait lentement et voulut traverser la route… (accident, hôpital, prudence).', [], 19, 125, 'R')
e(30, '145bis', 'version', 'Traduire le texte 145.', [], 21, 128, 'L')
e(30, '146', 'questions', 'Répondre aux questions suivantes (sur le texte 145).',
  ['weqtâš iji l-eid-es-sgér aw-eid-el-fitr ?', 'kéfâš iearfu le-mselmin bih ?', 'âškûn ihabbarhum ?',
   'wâš iemel el-meslem nhâr-el-eid ?', 'mnin ihorj men-el-jâmee wâš igûlu bâedhum-bâed ?',
   'wâš istennaw le-msâkîn ?', 'weqtâš iji l-eid-el-kbîr aw-eid-el-adha ?', 'wén irûhu bâed-le-mselmin fi dak-el-eid ?',
   'wâš iemel men muddat-el-hajj u-baed-el-hajj ?', 'mnin irjae men-el-hajj, kéfâš itsamma ?'], 21, 128, 'L')
e(30, '147', 'theme', 'Traduire en arabe (thème) : Monsieur Qaddour est très content : c’est la fête… (costume neuf, mosquée, amis, café, joie).', [], 21, 128, 'L')
e(30, '148', 'conjugation', 'Relevez tous les verbes dérivés du texte 145 et donnez pour chacun ce qui a été rajouté au verbe primitif ainsi que la nuance qui vient modifier le sens.', [], 21, 128, 'L')
e(30, '149', 'translation', 'Mettre le 2e paragraphe du texte 141 à la 2e personne du singulier, comme si on s’adressait au jeune adolescent qui voyage avec ses parents.', [], 21, 128, 'L')
e(30, '150', 'conjugation', 'Conjuguez aux trois aspects (accompli, inaccompli, impératif) les verbes dérivés contenus dans le texte 127 (Bû-Tâleb sbah mrêd).', [], 21, 128, 'L')

# ---------------------------------------------------------------- textes
# lesson, par, title, pdf, printed, side, completeness
T = [
    (23, '112', 'mnin tlaqt fi-fransâ', 2, 93, 'R', 'complete'),
    (24, '117', 'el-bîe u-š-šrâ', 5, 98, 'L', 'complete'),
    (25, '122', 'er-rahhâla w-el-ḥdar', 7, 103, 'R', 'complete'),
    (26, '127', 'Bû-Tâleb sbah mrêd', 11, 108, 'L', 'complete'),
    (27, '132', 'korat-el-qadam w-el-mšâjara', 13, 113, 'R', 'complete'),
    (28, '137', 'el-hammâm', 16, 119, 'R', 'complete'),
    (29, '141', 'râyhin nsâfru', 18, 122, 'L', 'complete'),
    (30, '145', 'eid-el-fitr u-eid-el-adha', 20, 126, 'L', 'complete'),
]


def ensure_columns(con):
    cols = {r[1] for r in con.execute('PRAGMA table_info(pages)')}
    if 'pdf_file' not in cols:
        con.execute('ALTER TABLE pages ADD COLUMN pdf_file TEXT')
    cols = {r[1] for r in con.execute('PRAGMA table_info(lessons)')}
    if 'notes' not in cols:
        con.execute('ALTER TABLE lessons ADD COLUMN notes TEXT')


def main():
    con = sqlite3.connect(DB)
    con.executescript((ROOT / 'db' / 'schema.sql').read_text())
    con.execute('PRAGMA foreign_keys=ON')
    ensure_columns(con)
    m = json.loads((ROOT / 'manifest.json').read_text())
    raw = ROOT / 'raw' / PDF_NAME
    sha = hashlib.sha256(raw.read_bytes()).hexdigest()
    nbytes = raw.stat().st_size
    con.execute('''INSERT OR REPLACE INTO sources
        (source_id,book,part,title,author,publisher,edition,isbn,filename,sha256,bytes,pdf_pages,dialect,register,rights_note)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
        (SOURCE_ID, 'manuel-arabe-algerien', PART, m['title'], m['author'], m['publisher'],
         m['edition'], m['isbn'], PDF_NAME, sha, nbytes, 25, 'arq', m['register'],
         'Œuvre sous droit (Klincksieck). Usage interne/recherche ; publication app nécessite licence ou contenu original/licencié.'))

    # ---- purge ciblée partie 03 (idempotent)
    for table, idcol in [('study_texts', 'text_id'), ('exercises', 'exercise_id'),
                         ('grammar_rules', 'rule_id'), ('vocabulary', 'vocab_id')]:
        ids = [r[0] for r in con.execute(f'SELECT {idcol} FROM {table} WHERE source_id=?', (SOURCE_ID,))]
        for oid in ids:
            con.execute('DELETE FROM review_tasks WHERE object_type=? AND object_id=?', (table, oid))
        con.execute(f'DELETE FROM {table} WHERE source_id=?', (SOURCE_ID,))
    lids = [r[0] for r in con.execute('SELECT lesson_id FROM lessons WHERE source_id=?', (SOURCE_ID,))]
    for lid in lids:
        con.execute('DELETE FROM review_tasks WHERE object_type=? AND object_id=?', ('lessons', lid))
        con.execute('DELETE FROM lesson_sections WHERE lesson_id=?', (lid,))
    con.execute('DELETE FROM lessons WHERE source_id=?', (SOURCE_ID,))
    con.execute('DELETE FROM pages WHERE source_id=?', (SOURCE_ID,))
    con.execute("DELETE FROM review_tasks WHERE object_type='sources' AND reason LIKE 'Glossaire alphabétique p.129-137 (partie 03)%'")

    # ---- pages (25 spreads ; spread 9 = doublon de 8, non ingéré)
    meta = json.loads((ROOT / 'ocr' / 'partie-03-colonnes' / 'ocr-columns.json').read_text())
    for p in meta['pages']:
        n = p['pdf_page']
        if n == DUPLICATE_PDF_PAGE:
            continue
        printed = p['printed_pages']
        for side, key in [('L', 'left'), ('R', 'right')]:
            info = p[key]
            con.execute('''INSERT INTO pages
                (source_id,pdf_page,printed_page,side,ocr_file,ocr_langs,ocr_psm,ocr_chars,quality,pdf_file)
                VALUES(?,?,?,?,?,?,?,?,?,?)''',
                (SOURCE_ID, n, printed[0] if side == 'L' else printed[1], side, info['file'],
                 info['langs'], info['psm'], info['chars'], 'ocr_columns', PDF_NAME))

    # ---- leçons nouvelles 23..30
    lesson_ids = {}
    for no, title, sp, spn, ep, epn, comp, topics in LESSONS:
        cur = con.execute('''INSERT INTO lessons
            (source_id,lesson_no,title_fr,topics,start_pdf_page,start_printed_page,end_pdf_page,end_printed_page,completeness,status,notes)
            VALUES(?,?,?,?,?,?,?,?,?,?,?)''',
            (SOURCE_ID, no, title, j(topics), sp, spn, ep, epn, comp, 'needs_review', None))
        lesson_ids[no] = cur.lastrowid
    # leçon 22 : commencée en partie 02, achevée ici
    row = con.execute('SELECT lesson_id FROM lessons WHERE lesson_no=22').fetchone()
    if row is None:
        raise SystemExit('Leçon 22 introuvable : ingérer la partie 02 d’abord.')
    lesson_ids[22] = row[0]
    con.execute('''UPDATE lessons SET completeness='complete', end_pdf_page=2, end_printed_page=92,
        notes='Leçon commencée en partie 02 (§108, p.89) et achevée en partie 03 (p.90-92, §108-111). Données de la suite rattachées à la source partie-03.'
        WHERE lesson_id=?''', (lesson_ids[22],))
    # texte 108 : compléter la fiche créée en partie 02
    con.execute('''UPDATE study_texts SET notes='Texte complete ; commencé p.89 (partie 02), suite et fin p.90 (partie 03). Transcription et traduction à produire et valider avant publication.'
        WHERE paragraph_ref='108' ''')

    # ---- sections
    for no, title, sp, spn, ep, epn, comp, topics in LESSONS:
        con.execute('''INSERT INTO lesson_sections
            (lesson_id,kind,paragraph_ref,title,pdf_page,printed_page,side,content_fr,status,notes)
            VALUES(?,?,?,?,?,?,?,?,?,?)''',
            (lesson_ids[no], 'grammar', None, title, sp, spn, 'L', title, 'needs_review',
             'Section repérée ; contenu détaillé dans grammar_rules/vocabulary. Source partie-03.'))
    con.execute("DELETE FROM lesson_sections WHERE lesson_id=? AND notes LIKE '%provenance partie-03%'", (lesson_ids[22],))
    con.execute('''INSERT INTO lesson_sections
        (lesson_id,kind,paragraph_ref,title,pdf_page,printed_page,side,content_fr,status,notes)
        VALUES(?,?,?,?,?,?,?,?,?,?)''',
        (lesson_ids[22], 'grammar', '108-111', 'La construction / les particules (suite de la leçon 22)', 1, 90, 'L',
         'Suite de la leçon 22 : fin du texte 108, vocabulaire, version (§108bis), exercice (§109), particules (§110), thème (§111).',
         'needs_review', 'Rattaché à la leçon 22 créée en partie 02 ; provenance partie-03, p.90-92.'))

    # ---- vocabulaire (dédup interne partie 03)
    HOMONYMS = {'dres', 'lhaq', 'dfae'}
    seen = {}
    duplicates = []
    kept = []
    for i, item in enumerate(V, 1):
        key = item['form'].strip().lower()
        if key in seen and key not in HOMONYMS:
            first = seen[key]
            extra = f"Également au vocabulaire de la leçon {item['lesson']} (p. {item['printed']}, §{item['par']})"
            first['notes'] = (first['notes'] + ' ; ' if first['notes'] else '') + extra
            duplicates.append((item['form'], item['lesson'], first['lesson']))
            continue
        seen[key] = item
        kept.append((i, item))
    prev_forms = {}
    for src in PREV_SOURCES:
        for f, lid in con.execute('SELECT form_latin, lesson_id FROM vocabulary WHERE source_id=?', (src,)):
            prev_forms.setdefault(f.strip().lower(), lid)
    for i, item in kept:
        lid = lesson_ids[item['lesson']]
        uid = f"tapiero-p03-l{item['lesson']:02d}-{slug(item['form'])}-{i:03d}"
        con.execute('''INSERT INTO vocabulary
            (lesson_id,source_id,entry_uid,form_latin,form_ar,pos,gender,plural,root,gloss_fr,
             example_latin,example_fr,pdf_page,printed_page,side,paragraph_ref,status,notes)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
            (lid, SOURCE_ID, uid, item['form'], None, item['pos'], item['gender'], item['plural'],
             item['root'], item['gloss'], item['ex'], item['exfr'], item['pdf'], item['printed'],
             item['side'], item['par'], 'needs_review', item['notes']))

    # ---- règles
    for item in R:
        lid = lesson_ids[item['lesson']]
        uid = f"tapiero-p03-rule-{item['par']}-{slug(item['title'])}"
        con.execute('''INSERT INTO grammar_rules
            (lesson_id,source_id,rule_uid,paragraph_ref,title,summary_fr,examples_json,pdf_page,printed_page,side,status,notes)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?)''',
            (lid, SOURCE_ID, uid, item['par'], item['title'], item['summary'], j(item['examples']),
             item['pdf'], item['printed'], item['side'], 'needs_review', item['notes']))

    # ---- exercices
    for item in E:
        lid = lesson_ids[item['lesson']]
        uid = f"tapiero-p03-ex-{item['par']}-{slug(item['prompt'][:40])}"
        con.execute('''INSERT INTO exercises
            (lesson_id,source_id,exercise_uid,kind,paragraph_ref,prompt_fr,items_json,pdf_page,printed_page,side,status)
            VALUES(?,?,?,?,?,?,?,?,?,?,?)''',
            (lid, SOURCE_ID, uid, item['kind'], item['par'], item['prompt'], j(item['items']),
             item['pdf'], item['printed'], item['side'], 'needs_review'))

    # ---- textes
    for lesson, par, title, pdf, printed, side, comp in T:
        lid = lesson_ids[lesson]
        uid = f"tapiero-p03-text-{par}"
        con.execute('''INSERT INTO study_texts
            (lesson_id,source_id,text_uid,paragraph_ref,title_latin,latin_text,ar_text,fr_translation,pdf_page,printed_page,side,status,notes)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)''',
            (lid, SOURCE_ID, uid, par, title, None, None, None, pdf, printed, side, 'needs_review',
             f'Texte {comp} ; transcription et traduction à produire et valider avant publication. OCR colonnes disponible en interne.'))

    # ---- tâches de relecture (périmètre partie 03 uniquement)
    def add_tasks(table, idcol, reason, priority):
        for row in con.execute(f'SELECT {idcol} FROM {table} WHERE source_id=?', (SOURCE_ID,)):
            con.execute('INSERT INTO review_tasks(object_type,object_id,reason,priority,status) VALUES(?,?,?,?,?)',
                        (table, row[0], reason, priority, 'open'))

    add_tasks('vocabulary', 'vocab_id', 'Validation native forme + sens + registre Tapiéro (partie 03)', 2)
    add_tasks('grammar_rules', 'rule_id', 'Validation native règle + exemples (partie 03)', 2)
    add_tasks('exercises', 'exercise_id', 'Validation consigne + corrigé à produire (partie 03)', 3)
    add_tasks('study_texts', 'text_id', 'Transcription/validation texte latin + arabe avant publication (partie 03)', 1)
    for no in [x[0] for x in LESSONS]:
        con.execute('INSERT INTO review_tasks(object_type,object_id,reason,priority,status) VALUES(?,?,?,?,?)',
                    ('lessons', lesson_ids[no], 'Validation pédagogique leçon (partie 03)', 3, 'open'))
    # reprises inter-parties
    reprises = []
    for i, item in kept:
        f = item['form'].strip().lower()
        if f in prev_forms:
            reprises.append(dict(form=item['form'], new_lesson=item['lesson']))
    for rep in reprises:
        row = con.execute('SELECT vocab_id FROM vocabulary WHERE source_id=? AND form_latin=?',
                          (SOURCE_ID, rep['form'])).fetchone()
        if row:
            con.execute('INSERT INTO review_tasks(object_type,object_id,reason,priority,status) VALUES(?,?,?,?,?)',
                        ('vocabulary', row[0],
                         'Reprise pédagogique : forme déjà présente en partie 01/02 ; fusionner les fiches avant publication', 2, 'open'))
    # glossaire : tâche de référence
    con.execute('INSERT INTO review_tasks(object_type,object_id,reason,priority,status) VALUES(?,?,?,?,?)',
                ('sources', 0, 'Glossaire alphabétique p.129-137 (partie 03) conservé en OCR de référence ; à cross-checker (pluriels/genres) et fusionner après la partie 05.', 3, 'open'))

    con.execute('INSERT INTO processing_runs(part,step,finished_at,details_json) VALUES(?,?,datetime("now"),?)',
                (PART, 'ingestion_curated',
                 j(dict(pdf=PDF_NAME, sha256=sha, duplicate_pdf_page=DUPLICATE_PDF_PAGE,
                        printed_range=[90, 137], vocab=len(kept), vocab_dedup_removed=len(duplicates),
                        rules=len(R), exercises=len(E), texts=len(T), lessons_new=len(LESSONS),
                        lesson_22_completed=True, cross_part_reprises=len(reprises),
                        glossaire_reference_pages=[129, 137]))))
    con.commit()

    # ---- exports
    exp = ROOT / 'exports' / 'partie-03'
    exp.mkdir(parents=True, exist_ok=True)

    def dump(name, rows):
        (exp / f'{name}.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
        if rows:
            with (exp / f'{name}.csv').open('w', newline='', encoding='utf-8') as f:
                w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
                w.writeheader()
                w.writerows(rows)

    dump('lessons', [dict(lesson_no=no, title=t, start_pdf_page=sp, start_printed_page=spn,
                          end_pdf_page=ep, end_printed_page=epn, completeness=c, topics=tp,
                          status='needs_review') for no, t, sp, spn, ep, epn, c, tp in LESSONS])
    dump('vocabulary', [dict(entry_uid=f"tapiero-p03-l{x['lesson']:02d}-{slug(x['form'])}-{i:03d}",
                             lesson_no=x['lesson'], form_latin=x['form'], form_ar=None, pos=x['pos'],
                             gender=x['gender'], plural=x['plural'], root=x['root'], gloss_fr=x['gloss'],
                             example_latin=x['ex'], example_fr=x['exfr'], pdf_page=x['pdf'],
                             printed_page=x['printed'], side=x['side'], paragraph_ref=x['par'],
                             status='needs_review', notes=x['notes']) for i, x in kept])
    dump('grammar_rules', [dict(rule_uid=f"tapiero-p03-rule-{x['par']}-{slug(x['title'])}",
                                lesson_no=x['lesson'], paragraph_ref=x['par'], title=x['title'],
                                summary_fr=x['summary'], examples=x['examples'], pdf_page=x['pdf'],
                                printed_page=x['printed'], side=x['side'], status='needs_review',
                                notes=x['notes']) for x in R])
    dump('exercises', [dict(exercise_uid=f"tapiero-p03-ex-{x['par']}-{slug(x['prompt'][:40])}",
                            lesson_no=x['lesson'], kind=x['kind'], paragraph_ref=x['par'],
                            prompt_fr=x['prompt'], items=x['items'], pdf_page=x['pdf'],
                            printed_page=x['printed'], side=x['side'], status='needs_review') for x in E])
    dump('study_texts_index', [dict(text_uid=f"tapiero-p03-text-{par}", lesson_no=lesson, paragraph_ref=par,
                                    title_latin=title, pdf_page=pdf, printed_page=printed, side=side,
                                    completeness=comp, status='needs_review', latin_text=None,
                                    ar_text=None, fr_translation=None) for lesson, par, title, pdf, printed, side, comp in T])
    counts = {t: con.execute(f'SELECT COUNT(*) FROM {t}').fetchone()[0]
              for t in ['sources', 'pages', 'lessons', 'lesson_sections', 'vocabulary',
                        'grammar_rules', 'exercises', 'study_texts', 'review_tasks']}
    per_source = {t: con.execute(f'SELECT COUNT(*) FROM {t} WHERE source_id=?', (SOURCE_ID,)).fetchone()[0]
                  for t in ['pages', 'lessons', 'vocabulary', 'grammar_rules', 'exercises', 'study_texts']}
    (exp / 'counts.json').write_text(json.dumps(dict(total=counts, partie_03=per_source,
                                                     vocab_dedup_removed=len(duplicates),
                                                     cross_part_reprises=len(reprises)),
                                                 ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(dict(total=counts, partie_03=per_source,
                          dedup_removed=duplicates, reprises=len(reprises)), ensure_ascii=False, indent=2))
    print('integrity', con.execute('PRAGMA integrity_check').fetchone()[0])
    print('fk', con.execute('PRAGMA foreign_key_check').fetchall())
    con.close()


if __name__ == '__main__':
    main()
