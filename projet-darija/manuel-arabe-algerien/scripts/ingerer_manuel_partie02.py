#!/usr/bin/env python3
"""Ingestion structurée du Manuel d'arabe algérien moderne — partie 02.

Partie 02 = 3 segments PDF (10 + 10 + 5 pages), pages imprimées 40 à 89.
Couvre la fin de la leçon 11, les leçons 12 à 21 complètes et le début de la
leçon 22 (§108). Base séparée du dictionnaire 1910.

Curation manuelle assistée par OCR colonnes + relecture visuelle des tableaux
de vocabulaire. Tout reste `needs_review` tant qu'un locuteur natif n'a pas
validé les formes. L'OCR brut n'est jamais exporté.

Conventions de transcription (identiques à la partie 01) :
  â / û / î voyelles longues, e voyelle neutre, š = ch,
  ɛ (ayn) -> e, ġ -> g, ḥ -> h, ṣ -> s, ṭ -> t, emphatiques non marquées.
Les formes entre crochets dans le livre sont des emprunts : signalés en notes.
"""
from __future__ import annotations
import csv, hashlib, json, re, sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / 'db' / 'manuel.sqlite'
SOURCE_ID = 'tapiero-manuel-partie-02'
PART = 'partie-02'
SEGMENTS = ['partie-02-1.pdf', 'partie-02-2.pdf', 'partie-02-3.pdf']
PREV_SOURCE_ID = 'tapiero-manuel-partie-01'


def slug(s: str) -> str:
    s = s.lower().replace('’', "'")
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s[:60] or 'x'


def j(x):
    return json.dumps(x, ensure_ascii=False)


# ---------------------------------------------------------------- leçons
# no, title, start_pdf, start_printed, end_pdf, end_printed, completeness, topics
LESSONS = [
    (12, 'Le nom : le genre. La numération de 11 à 19.', 2, 42, 3, 45, 'complete',
     ['genre', 'féminin', 'nombres 11-19', 'saisons', 'année']),
    (13, 'Quelques catégories de substantifs.', 4, 46, 5, 49, 'complete',
     ['substantifs', 'noms d’artisan', 'noms de lieu', 'noms d’action', 'pain', 'agriculture']),
    (14, 'Quelques catégories d’adjectifs. Emploi de l’adjectif.', 6, 50, 8, 54, 'complete',
     ['adjectifs', 'épithète', 'attribut', 'couleurs', 'rue', 'boutiques']),
    (15, 'L’heure. Le nom : le nombre (duel, pluriel externe).', 8, 54, 10, 59, 'complete',
     ['heure', 'duel', 'pluriel externe', 'collectif', 'politesse']),
    (16, 'Le nombre (fin) : pluriel interne, collectif.', 11, 60, 13, 65, 'complete',
     ['pluriel interne', 'collectif', 'commerce', 'richesse']),
    (17, 'Récapitulation. La numération de 20 à 99.', 14, 66, 15, 69, 'complete',
     ['médecin', 'santé', 'impératif de politesse', 'nombres 20-99']),
    (18, 'Comparatif et superlatif. La numération de 100 à l’infini. Les adjectifs numéraux ordinaux.', 16, 70, 18, 74, 'complete',
     ['comparatif', 'superlatif', 'nombres 100+', 'ordinaux', 'famille', 'études']),
    (19, 'Le pronom relatif. La proposition relative.', 18, 74, 20, 79, 'complete',
     ['relatif', 'relative', 'travail', 'émigration', 'métiers']),
    (20, 'Les indéfinis.', 21, 80, 23, 84, 'complete',
     ['indéfinis', 'diminutif', 'Alger', 'ville']),
    (21, 'L’exclamation. La négation (fin).', 23, 85, 25, 88, 'complete',
     ['exclamation', 'vocatif', 'négation', 'agriculture', 'moisson']),
    (22, 'La construction. Les particules (mots et expressions invariables).', 25, 89, 25, 89, 'partial',
     ['construction', 'maison', 'particules']),
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


# ---- Leçon 11 (suite, partie 02 p. 40) — vocabulaire du texte 54
block(11, 1, 40, 'L', '54', [
    ('tfal', 'garçonnet', dict(plural='taflân', notes='Repris de la leçon 8 (partie 01) : tfal, enfant')),
    ('tayyeb', 'bon', dict(pos='adj')),
    ('qrâya', 'lecture', dict(gender='f', notes='Partie 01 : grâya (variante q/g)')),
    ('marra', 'une fois', dict(gender='f', plural='marrât')),
    ('kaslân', 'paresseux', dict(pos='adj')),
    ('el-fransâwîya', 'le français (la langue)', dict(notes='Nom de langue ; forme voisine el-franséwiya dans le texte')),
    ('el-carbîya', 'l’arabe (la langue)'),
    ('hâja', 'une chose', dict(gender='f')),
    ('qbêh', 'méchant', dict(pos='adj')),
    ('klâm', 'paroles, conseils', dict(pos='nom collectif')),
])
block(11, 1, 40, 'L', '54', [
    ('habb', 'vouloir, aimer (avec un complément)', dict(notes='inaccompli ihabb')),
    ('hass', 'manquer (une chose) à qn', dict(notes='inaccompli ihass')),
    ('tkellem', 'parler', dict(notes='inaccompli itkellem')),
    ('smae', 'entendre, écouter', dict(notes='inaccompli ismae l-')),
    ('qra', 'lire', dict(notes='inaccompli iqra')),
    ('hrab', 'se sauver, s’enfuir', dict(notes='inaccompli ihrab')),
], pos='verbe')
block(11, 1, 40, 'L', '54', [
    ('ela-l-kîf', 'comme il faut, parfaitement'),
    ('âšhâl-men', 'combien de…', dict(pos='interrogatif', notes='Variante de šhâl-men (partie 01, leçon 4)')),
    ('b-es-sahh', 'mais, à la vérité', dict(notes='Déjà étudié leçon 4 (partie 01) : b-es-sahh')),
], pos='expression')

# ---- Leçon 12
block(12, 2, 43, 'R', '58', [
    ('sana', 'année', dict(gender='f', plural='sanawât ou snîn', notes='Synonyme eâm ; déjà vu sous la forme sna en leçon 8')),
    ('el-hréf', 'l’automne'),
    ('es-sêf', 'l’été', dict(notes='Déjà étudié leçon 7 (partie 01)')),
    ('el-berd', 'le froid'),
    ('fasl', 'saison', dict(plural='fsûl', notes='OCR de la forme isolée partiel ; confirmée par le texte 58')),
    ('qesm', 'division, partie, classe', dict(plural='qsûm')),
    ('er-rbîe', 'le printemps'),
    ('el-otâ', 'la plaine'),
    ('et-telj', 'la neige'),
    ('el-jbel', 'la montagne', dict(gender='m')),
    ('el-gamar', 'la lune', dict(gender='m')),
    ('el-ürubbiyin', 'les Européens, les Chrétiens', dict(pos='nom collectif')),
    ('eâm', 'an, année', dict(notes='Déjà étudié leçon 8 (partie 01)')),
    ('usbûe', 'semaine', dict(gender='m', notes='Apparenté à sebea, sept ; synonyme jemca')),
    ('yôm', 'jour', dict(plural='iyyâm ou ayyâm', notes='Déjà étudié leçon 6 (partie 01)')),
    ('en-nû', 'la pluie', dict(gender='f')),
    ('la-hšîš', 'l’herbe', dict(gender='m')),
    ('bagra', 'vache', dict(gender='f', notes='Annexion : bagret-el-fellâh, bgart-i')),
])
block(12, 3, 44, 'L', '58', [
    ('qawi', 'fort, qui est intense', dict(pos='adj', notes='Féminin qawiya, aussi entendu gwiya')),
    ('hârr', 'chaud, brûlant, piquant', dict(pos='adj', notes='Féminin hârra')),
    ('mahrûq', 'brûlé', dict(pos='participe passif')),
])
block(12, 3, 44, 'L', '58', [
    ('ngsam', 'se diviser en', dict(notes='inaccompli ingsam ela-')),
    ('nbet', 'pousser, germer', dict(notes='inaccompli inbet')),
    ('frâh', 'se réjouir', dict(notes='inaccompli ifrah')),
    ('tâh', 'tomber', dict(notes='inaccompli itîh')),
    ('sâb', 'tomber (en parlant de la pluie)', dict(notes='inaccompli isûb')),
    ('smen', 'grossir', dict(notes='inaccompli ismen')),
], pos='verbe')
block(12, 3, 44, 'L', '58', [
    ('aktar men', 'plus que…'),
    ('ela-hsâb', 'selon…, suivant…'),
    ('zyâda ela', 'de plus que, en supplément sur'),
], pos='expression')
NUM1119 = [
    ('hdâš', 'onze', None), ('tnâš', 'douze', 'OCR partiel ; à confirmer'),
    ('tlâtaš', 'treize', 'OCR illisible ; forme reconstituée d’après la série, à confirmer'),
    ('rbetâš', 'quatorze', None), ('hmestâš', 'quinze', None), ('settâš', 'seize', None),
    ('sbetâš', 'dix-sept', None), ('tmentâš', 'dix-huit', None), ('tsetâš', 'dix-neuf', None),
]
for form, gloss, note in NUM1119:
    v(12, form, gloss, 'numéral', pdf=3, printed=45, side='R', par='61',
      notes=(note + ' ; ' if note else '') + 'Suivi d’un nom au singulier sans article, souvent avec -en- de liaison')

# ---- Leçon 13
block(13, 4, 47, 'R', '63', [
    ('el-hobz', 'le pain'),
    ('el-flâha', 'la culture, la récolte (de céréales)'),
    ('el-hsâd', 'la moisson'),
    ('ed-drâs', 'le battage (du blé)'),
    ('eâmel', 'ouvrier', dict(plural='eummâl')),
    ('jiha', 'côté, direction, région', dict(gender='f')),
    ('gemh', 'blé', dict(notes='Le livre donne deux prononciations : gemh / qemh')),
    ('škâra', 'sac', dict(gender='f', plural='škâyer', notes='Emprunt, entre crochets dans le livre')),
    ('mathana', 'moulin', dict(notes='Nom de lieu de la racine thn, moudre')),
    ('rahhây', 'meunier'),
    ('el-hebbâz', 'le boulanger'),
    ('hedma', 'travail, ouvrage', dict(gender='f', notes='Avec suffixe : hedmt-o')),
    ('el-lil', 'la nuit'),
    ('maemel', 'atelier, usine'),
    ('kelba', 'chienne', dict(gender='f')),
    ('el-farrân', 'le four, fournil', dict(notes='Emprunt, entre crochets dans le livre')),
    ('es-shâna', 'la chaleur'),
    ('heddâm', 'travailleur', dict(plural='heddâma')),
    ('el-baraka', 'la bénédiction (de Dieu)'),
    ('hânût', 'magasin, boutique', dict(plural='hwânet')),
    ('ed-drâfa', 'la politesse'),
])
block(13, 5, 48, 'L', '63', [
    ('kemmel', 'achever', dict(notes='inaccompli ikemmel')),
    ('jây', 'venant', dict(pos='participe actif', notes='Participe actif de ja, iji')),
    ('sâf', 'voir, apercevoir', dict(notes='inaccompli isûf')),
    ('sket', 'se taire', dict(notes='inaccompli iskut')),
    ('nbah', 'aboyer contre, après qn', dict(notes='inaccompli inbah f-')),
    ('dres', 'battre (le grain)', dict(notes='inaccompli idres')),
    ('hmel', 'porter', dict(notes='inaccompli ihmel')),
    ('than', 'moudre', dict(notes='inaccompli ithan')),
    ('ejen', 'pétrir', dict(notes='inaccompli yasjen')),
    ('snae', 'confectionner, fabriquer', dict(notes='inaccompli isnae')),
    ('bâe', 'vendre', dict(notes='inaccompli ibîe')),
    ('sellem', 'saluer', dict(notes='inaccompli isellem')),
], pos='verbe')
block(13, 5, 48, 'L', '63', [
    ('drûk-', 'être sur le point de', dict(notes='Suivi d’un verbe à l’inaccompli')),
    ('bâš-', 'afin de, pour que', dict(notes='Suivi d’un verbe à l’inaccompli')),
    ('elli', 'qui, celui qui', dict(pos='relatif', notes='Voir §94, leçon 19')),
    ('hda', 'à côté de'),
], pos='expression')

# ---- Leçon 14
block(14, 6, 51, 'R', '68', [
    ('zenqa', 'rue', dict(gender='f', plural='znûq', notes='Emprunt, entre crochets dans le livre')),
    ('wilâya', 'département, région', dict(gender='f')),
    ('Wahrân', 'Oran', dict(pos='nom propre')),
    ('lyemna', 'la droite'),
    ('lesra', 'la gauche', dict(notes='Dans le texte 68 : ela-l-yesra')),
    ('dyâr', 'maisons', dict(pos='nom collectif', notes='Pluriel de dâr')),
    ('byad', 'le blanc'),
    ('es-sfar', 'le jaune'),
    ('lawn', 'couleur', dict(plural='lwân')),
    ('hânût', 'boutique', dict(gender='f', plural='hwânet', notes='Repris de la leçon 13 ; ici marqué féminin')),
    ('el-eid', 'la fête (musulmane)'),
    ('el-hallâq', 'le coiffeur'),
    ('el-jazzâr', 'le boucher'),
    ('el-hayyât', 'le tailleur'),
    ('el-borgo', 'le calicot', dict(notes='Emprunt, entre crochets dans le livre')),
    ('lkettân', 'tissu (de coton)', dict(notes='Emprunt, entre crochets dans le livre')),
    ('damm', 'sang'),
    ('baqqâl', 'marchand de légumes'),
    ('karrôsa', 'voiture, véhicule', dict(plural='krâres', notes='Emprunt entre crochets ; OCR partiel, à confirmer')),
])
block(14, 7, 52, 'L', '68', [
    ('wâsee', 'vaste', dict(pos='adj')),
    ('ktîr', 'nombreux, abondant', dict(pos='adj')),
    ('twîl', 'long', dict(pos='adj')),
    ('erîd', 'large', dict(pos='adj')),
    ('mbayyad', 'peint, enduit', dict(pos='participe passif')),
    ('âhor', 'autre', dict(pos='adj', notes='Féminin ohra, pluriel ohrîn')),
    ('mtîn', 'solide', dict(pos='adj')),
    ('jdid', 'neuf', dict(pos='adj')),
    ('hmar', 'rouge', dict(pos='adj')),
    ('hdar', 'vert', dict(pos='adj')),
    ('mhayyar', 'choisi', dict(pos='participe passif')),
    ('keddâb', 'menteur', dict(pos='adj')),
    ('mdayyeg', 'étroit', dict(pos='participe passif')),
])
block(14, 7, 52, 'L', '68', [
    ('sken', 'habiter', dict(notes='inaccompli iskun')),
    ('sâhed', 'assister à, apercevoir, contempler', dict(notes='inaccompli isâhed')),
    ('breq', 'allumer, briller, étinceler', dict(notes='inaccompli ibreq')),
    ('hatt', 'poser, installer', dict(notes='inaccompli ihott')),
    ('hayyat', 'coudre, confectionner', dict(notes='inaccompli ihayyat')),
    ('jâz', 'passer', dict(notes='inaccompli ijûz')),
    ('habbar', 'informer', dict(notes='inaccompli ihabbar')),
], pos='verbe')
block(14, 7, 52, 'L', '68', [
    ('ela-l-yemna', 'à droite'),
    ('ki-', 'comme (comparaison)'),
    ('qbal-', 'avant'),
], pos='préposition')

# ---- Leçon 15
block(15, 9, 57, 'R', '73', [
    ('es-sâea', 'l’heure, la montre'),
    ('eâref', 'sachant', dict(pos='participe actif')),
    ('mâši', 'allant, marchant', dict(pos='participe actif')),
    ('mjammae', 'réuni', dict(pos='participe passif')),
    ('rjâl', 'hommes', dict(pos='nom collectif', notes='Pluriel de râjel')),
    ('rboe', 'un quart (d’heure)'),
    ('sâdati', 'messieurs, mes seigneurs', dict(pos='nom collectif', notes='Pluriel de sîdi')),
    ('fadl', 'grâce, bonté', dict(notes='men-fadl-ek : s’il te plaît')),
    ('dqâyeq', 'minutes', dict(pos='nom collectif', notes='Pluriel de dqîqa')),
    ('ed-drâri', 'les enfants', dict(pos='nom collectif')),
    ('noss', 'une demi-(heure)'),
    ('râbeh', 'gagnant, victorieux, lauréat', dict(pos='participe actif')),
    ('mtihân', 'examen, concours'),
    ('el-fadda', 'l’argent (métal précieux)'),
    ('sâea', 'heure', dict(gender='f', plural='swâyee')),
])
block(15, 9, 57, 'R', '73', [
    ('gassar', 'parler, bavarder, converser', dict(notes='inaccompli igassar')),
    ('jâweb', 'répondre à', dict(notes='inaccompli ijâweb')),
    ('rham', 'faire miséricorde (en parlant de Dieu)', dict(notes='inaccompli irham')),
    ('jbed', 'tirer, attirer', dict(notes='inaccompli ijbed')),
    ('sbar', 'patienter', dict(notes='inaccompli isbar')),
    ('njah', 'réussir', dict(notes='inaccompli yanjah')),
], pos='verbe')
block(15, 9, 57, 'R', '73', [
    ('gêr', 'moins, sauf, si ce n’est que'),
    ('u-', 'voici (tant de temps) que', dict(notes='OCR partiel ; à confirmer')),
    ('illa', 'ne… que (après une négation)', dict(notes='OCR partiel ; voir §106 a')),
    ('el-haqq', 'effectivement, en vérité, en effet'),
    ('men-hna ela-', 'd’ici (tant de temps)'),
    ('ela-', 'à (telle heure)', dict(notes='Suivi d’un nombre avec l’article')),
    ('b-ad-dabt', 'juste, exactement'),
    ('ida', 'si (condition potentielle)', dict(notes='Se construit souvent avec un accompli à valeur de présent-futur')),
], pos='expression')

# ---- Leçon 16
block(16, 12, 62, 'L', '78', [
    ('tâjer', 'commerçant', dict(plural='tujjâr')),
    ('ganî', 'riche', dict(pos='adj')),
    ('zâyla', 'bête de trait', dict(gender='f', plural='zwâyel')),
    ('hayl', 'chevaux', dict(pos='nom collectif')),
    ('hmâr', 'âne', dict(plural='hmîr')),
    ('bgel', 'mulet', dict(plural='bgâl')),
    ('gnem', 'moutons', dict(pos='nom collectif')),
    ('ibel', 'chameaux', dict(pos='nom collectif')),
    ('hatra', 'fois', dict(gender='f', plural='htrât')),
    ('tijâra', 'commerce', dict(gender='f')),
    ('sahrâ', 'Sahara, désert', dict(gender='f')),
    ('drâham', 'argent, fonds', dict(pos='nom collectif', notes='Pluriel ; déjà signalé en leçon 9 (partie 01)')),
    ('zerbîya', 'tapis', dict(gender='f', plural='zrâbi', notes='Déjà étudié leçon 5 (partie 01)')),
    ('usâda', 'coussin', dict(gender='f', plural='usâyed')),
    ('mdarrba', 'matelas', dict(gender='f', plural='mdarrbât')),
    ('hrîr', 'soie'),
    ('qatêfa', 'velours'),
    ('hêt', 'mur', dict(plural='hyôt')),
    ('taswîra', 'image, tableau', dict(gender='f', plural='tsâwir')),
    ('tbae', 'sorte, modèle', dict(plural='tbâe')),
    ('el-mâkla', 'le manger, la nourriture'),
    ('tâbla', 'table', dict(gender='f', plural='twâbel', notes='Emprunt, entre crochets dans le livre')),
    ('kursi', 'chaise', dict(plural='krâsa')),
    ('sni', 'plateau', dict(plural='snâwi')),
    ('nhâs', 'cuivre'),
    ('eabd', 'serviteur (de couleur)', dict(plural='eabîd')),
    ('hdîma', 'servante', dict(gender='f', plural='hdîmât')),
    ('meskîn', 'pauvre, malheureux', dict(pos='adj', plural='msâken')),
])
block(16, 12, 62, 'L', '78', [
    ('mša', 'aller, marcher, partir', dict(notes='inaccompli imši')),
    ('mreffeh', 'riche, fortuné', dict(pos='participe passif')),
    ('sawwar', 'gagner, réaliser un profit', dict(notes='inaccompli isawwar')),
    ('mgatté', 'recouvert', dict(pos='participe passif', notes='Pluriel en -én au lieu de -în')),
    ('staejab', 's’étonner, éprouver de l’admiration', dict(notes='inaccompli istaejab')),
    ('hdem', 'travailler pour le compte de, au service de', dict(notes='inaccompli ihdem ela-')),
    ('eâš', 'bien vivre, vivre', dict(notes='inaccompli ieîš')),
    ('eâyeš', 'vivant', dict(pos='participe actif')),
], pos='verbe')
block(16, 12, 62, 'L', '78', [
    ('lûkân… la-', 'si (condition irréelle)', dict(notes='Ne pas confondre le la- de la principale avec le lâ- de l’impératif négatif')),
    ('hetta', 'jusqu’à, même'),
    ('temma', 'là, là-bas'),
], pos='expression')

# ---- Leçon 17
block(17, 14, 67, 'R', '83', [
    ('bennây', 'maçon'),
    ('ešiya', 'soir, soirée', dict(gender='f')),
    ('jiha', 'côté', dict(gender='f', plural='jnâb', notes='Repris de la leçon 13')),
    ('râs', 'tête', dict(plural='ryûs', notes='Déjà étudié leçon 3 (partie 01)')),
    ('tbêb', 'médecin', dict(plural='tebbâ', notes='Pluriel OCR partiel, à confirmer')),
    ('warga', 'feuille', dict(gender='f', plural='wrâq')),
    ('mumarrida', 'infirmière', dict(gender='f', plural='mumarridât')),
    ('mharma', 'foulard, voile', dict(gender='f', plural='mhârem')),
    ('fomm', 'bouche', dict(gender='m')),
    ('lsân', 'langue', dict(gender='m')),
    ('gmeja', 'chemise', dict(gender='f', plural='gmâyej')),
    ('sdar', 'poitrine', dict(plural='sdûr')),
    ('dwâ', 'médicament, remède'),
])
block(17, 15, 68, 'L', '83', [
    ('dâyeh', 'atteint de vertige', dict(pos='participe actif')),
    ('fâyeg', 'éveillé', dict(pos='participe actif')),
    ('mréd', 'malade', dict(pos='adj', plural='morda', notes='Déjà étudié leçon 4 (partie 01)')),
    ('dihân', 'ayant mal à la tête, la tête lourde', dict(pos='adj')),
    ('lâbes', 'vêtu', dict(pos='participe actif')),
    ('mahlûl', 'ouvert', dict(pos='participe passif')),
    ('byad', 'blanc', dict(pos='adj', notes='Féminin bêda ; repris de la leçon 14')),
])
block(17, 15, 68, 'L', '83', [
    ('teaššâ', 'souper', dict(notes='inaccompli itteaššâ')),
    ('neas', 'dormir', dict(notes='inaccompli ineas')),
    ('bât', 'passer la nuit', dict(notes='inaccompli ibât')),
    ('sbah', 'être le matin, devenir', dict(notes='inaccompli isbah')),
    ('ujas', 'faire mal (en parlant d’un organe)', dict(notes='inaccompli yujas')),
    ('nâda', 'appeler, faire appeler qn', dict(notes='inaccompli inâdi l-')),
    ('stenna', 'attendre', dict(notes='inaccompli istenna')),
    ('jles', 's’asseoir', dict(notes='inaccompli ijles')),
    ('herrej', 'faire sortir', dict(notes='inaccompli iherrej')),
    ('nehha', 'ôter', dict(notes='inaccompli inehhi')),
    ('sannat', 'ausculter, écouter', dict(notes='OCR partiel ; à confirmer')),
    ('seal', 'tousser', dict(notes='inaccompli iseal')),
    ('zâd', 'augmenter, ajouter', dict(notes='inaccompli izid ; OCR partiel')),
    ('ineffes', 'respirer', dict(notes='inaccompli itneffes')),
    ('šfa', 'guérir', dict(notes='inaccompli išfa')),
], pos='verbe')
block(17, 15, 68, 'L', '83', [
    ('ma-hâyen bâs', 'il n’y a pas de mal'),
    ('ma-elik bâs', 'tu n’as rien de grave', dict(notes='Mot à mot : pas sur toi de mal')),
    ('qbal-', 'avant (quelque chose)'),
    ('qbal-men-', 'avant (quelqu’un)'),
    ('hna', 'ici'),
    ('hnak', 'là-bas'),
], pos='expression')

# ---- Leçon 18
block(18, 16, 71, 'R', '87', [
    ('hôt', 'frères, frères et sœurs', dict(pos='nom collectif', notes='Pluriel de hô')),
    ('hto', 'sœur', dict(gender='f', plural='hwât', notes='OCR de la forme isolée partiel ; forme du texte 87')),
    ('najjâr', 'menuisier'),
    ('meallem', 'patron'),
    ('dinâr', 'dinar', dict(plural='dnânir')),
    ('tâleb', 'étudiant', dict(plural='tolba')),
    ('muhâmi', 'avocat'),
    ('durûs', 'études, cours', dict(pos='nom collectif', notes='Pluriel de dars')),
    ('el-eâm el-jây', 'l’an prochain', dict(notes='Littéralement : l’an le venant')),
    ('el-eâm l-awwel', 'l’an passé', dict(notes='Littéralement : l’an le premier')),
    ('Layla', 'Leïla (prénom féminin)', dict(pos='nom propre', gender='f')),
    ('tilmîd', 'élève', dict(plural='tlâmîd')),
    ('tlemsân', 'Tlemcen', dict(pos='nom propre')),
])
block(18, 16, 71, 'R', '87', [
    ('ahsan', 'meilleur', dict(pos='adj')),
    ('eazîm', 'grand, formidable', dict(pos='adj')),
    ('eulya', 'plus haute, supérieure', dict(pos='adj', gender='f', notes='Féminin de aela')),
    ('mhayyar', 'le plus choisi, le meilleur', dict(pos='participe passif', notes='Repris de la leçon 14')),
    ('hnîn ela-', 'plus tendre que', dict(pos='adj')),
    ('tânawî', 'secondaire', dict(pos='adj', notes='Féminin tânawîya ; dérivé de tânî, second')),
    ('agbah men-', 'plus méchant que', dict(pos='adj')),
    ('eâqel', 'raisonnable, gentil, sage', dict(pos='participe actif')),
])
block(18, 16, 71, 'R', '87', [
    ('rbah', 'gagner (un salaire), réussir', dict(notes='inaccompli irbah')),
    ('thallas men-', 'achever, régler, payer qch.', dict(notes='Verbe hallas, leçon 9')),
    ('tzawwej', 'se marier', dict(notes='inaccompli itzawwej')),
    ('šbah', 'ressembler à', dict(notes='inaccompli išbah l-')),
    ('dres', 'étudier', dict(notes='inaccompli idrus ; repris de la leçon 13')),
    ('nbaga', 'convenir', dict(notes='inaccompli yanbagi')),
], pos='verbe')
block(18, 17, 72, 'L', '87', [
    ('ma-kân-š metl-', 'il n’y a pas comme'),
    ('ki-ma yanbagi', 'impeccablement (comme il convient)'),
    ('el-kull', 'la totalité, en totalité', dict(notes='Déjà étudié leçon 10 (partie 01)')),
    ('b-ez-zâf', 'beaucoup, très', dict(notes='Déjà étudié leçon 7 (partie 01)')),
    ('metl-', 'comme'),
    ('kîf-', 'comme'),
], pos='expression')
DIZAINES = [('eašrîn', 'vingt'), ('tlâtîn', 'trente'), ('rabeîn', 'quarante'), ('hemsîn', 'cinquante'),
            ('settîn', 'soixante'), ('sebeîn', 'soixante-dix'), ('tmânîn', 'quatre-vingts'), ('tesɛîn', 'quatre-vingt-dix')]
for form, gloss in DIZAINES:
    v(18, form, gloss, 'numéral', pdf=15, printed=68, side='L', par='85',
      notes='De 30 à 90 : unité + suffixe -în ; 20 : eašra + suffixe du duel -în')
for form, gloss, note in [('mya', 'cent', None), ('mîtîn', 'deux cents', 'Duel de mya'),
                          ('alef', 'mille', None), ('alfîn', 'deux mille', 'Duel de alef'),
                          ('alâf', 'milliers', 'Pluriel de alef, employé de 3 000 à 10 000')]:
    v(18, form, gloss, 'numéral', pdf=17, printed=73, side='R', par='90', notes=note)
ORDINAUX = [('awwel', 'premier', 'Forme spéciale'), ('tânî', 'deuxième, second', None),
            ('tâlet', 'troisième', None), ('râbeɛ', 'quatrième', None), ('hâmes', 'cinquième', None),
            ('sâtes', 'sixième', None), ('sâbeɛ', 'septième', None), ('tâmen', 'huitième', None),
            ('tâsee', 'neuvième', None), ('eâšer', 'dixième', None),
            ('tâli', 'dernier', 'À ne pas confondre avec tânî, second')]
for form, gloss, note in ORDINAUX:
    v(18, form, gloss, 'adj ordinal', pdf=18, printed=74, side='L', par='91',
      notes=(note + ' ; ' if note else '') + 'Forme du participe actif ; féminin en -a, pluriel en -în')

# ---- Leçon 19
block(19, 19, 77, 'R', '93', [
    ('ûrubbâ', 'Europe', dict(pos='nom propre')),
    ('bayyâd', 'peintre', dict(plural='bayyâdîn', notes='Le livre note : pluriel én = în')),
    ('menjem', 'mine', dict(plural='mnâjem')),
    ('masnae', 'usine', dict(plural='msânee')),
    ('sedd', 'barrage', dict(plural='sdûd')),
    ('el-katra', 'la majorité'),
    ('gâleb', '(la) plupart'),
    ('hîn', 'moment', dict(plural='ahyân')),
    ('sanea', 'métier', dict(gender='f', notes='Synonyme herfa')),
    ('mihna', 'profession', dict(gender='f', plural='mihan')),
    ('mihnî', 'professionnel', dict(pos='adj')),
    ('suhûla', 'facilité', dict(gender='f')),
    ('kayfîya', 'manière, procédé', dict(gender='f')),
    ('herfa', 'métier', dict(gender='f', plural='hiraf')),
    ('hdîd', 'fer, acier'),
    ('ujra', 'salaire', dict(gender='f', plural='wjûr')),
    ('barîd', 'poste'),
    ('aqrab', 'proche parent', dict(plural='aqârib')),
    ('zawja', 'épouse', dict(gender='f', plural='zawjât')),
    ('eâyla', 'famille', dict(gender='f', plural='eâylât', notes='Le livre donne aussi eâila')),
    ('bâhira', 'bateau', dict(gender='f')),
    ('tayyâra', 'avion', dict(gender='f')),
    ('watan', 'patrie'),
    ('hbîb', 'ami', dict(plural='hbâb')),
    ('eâda', 'coutume', dict(gender='f', plural='eâdât')),
    ('gorba', 'solitude, éloignement', dict(gender='f')),
])
block(19, 19, 77, 'R', '93', [
    ('šayyed', 'monter, édifier', dict(notes='inaccompli išayyed')),
    ('sâb', 'trouver', dict(notes='inaccompli isêb ; homonyme de sâb, tomber (pluie), leçon 12')),
    ('eâwen', 'aider', dict(notes='inaccompli ieâwen')),
    ('qbad', 'toucher, percevoir', dict(notes='inaccompli iqbad')),
    ('rsel', 'envoyer, expédier', dict(notes='inaccompli irsel')),
    ('trek', 'laisser, abandonner', dict(notes='inaccompli itrek')),
    ('rkeb', 'monter sur, prendre (un véhicule)', dict(notes='inaccompli irkeb')),
    ('rjae', 'revenir', dict(notes='inaccompli irjae ; déjà étudié leçon 9 (partie 01)')),
    ('muwâlef bi-', 'habitué à', dict(pos='participe passif')),
], pos='verbe')
block(19, 19, 77, 'R', '93', [
    ('b-ez-zâf', 'beaucoup', dict(notes='Repris des leçons 7 et 18')),
    ('men-', 'parmi, de', dict(notes='Avec un pluriel')),
    ('aw', 'ou, ou bien', dict(pos='conjonction', notes='Variante de wella, leçon 10')),
    ('f-el-gâleb el-ahyân', 'la plupart du temps'),
    ('blâ', 'sans', dict(pos='préposition')),
    ('ma-… -gêr', 'ne… que', dict(pos='négation')),
    ('hosôs', 'surtout, particulièrement', dict(pos='adverbe')),
    ('b-suhûla', 'facilement'),
    ('tumma', 'ensuite', dict(pos='adverbe')),
    ('derwaq', 'maintenant', dict(pos='adverbe')),
], pos='expression')

# ---- Leçon 20
block(20, 22, 82, 'L', '98', [
    ('mdîna', 'ville', dict(gender='f', plural='mdûn', notes='Déjà étudié leçon 6 (partie 01)')),
    ('šatt', 'bord, rivage'),
    ('le-bhar', 'la mer', dict(gender='m')),
    ('rukkâb', 'voyageurs', dict(pos='nom collectif', notes='Pluriel de râkeb')),
    ('marsa', 'port, quai', dict(gender='f')),
    ('hbel', 'corde', dict(notes='Diminutif hbîla')),
    ('hajra', 'pierre', dict(gender='f', notes='Diminutif hjîra')),
    ('hawma', 'quartier', dict(gender='f')),
    ('haqîba', 'valise', dict(gender='f', plural='hqâyeb')),
    ('goffa', 'couffin', dict(gender='f', plural='gfef', notes='Déjà étudié leçon 9 (partie 01) : el-goffa')),
    ('el-qbayliya', 'la langue kabyle'),
])
block(20, 22, 82, 'L', '98', [
    ('râkeb', 'voyageur, passager', dict(pos='participe actif')),
    ('manšûr', 'tendu, étendu', dict(pos='participe passif')),
    ('mnaššar', 'étalé', dict(pos='participe passif')),
    ('mahtût', 'posé, disposé', dict(pos='participe passif')),
    ('mdarraj', 'étagé', dict(pos='participe passif')),
    ('msettef', 'rangé, ordonné', dict(pos='participe passif')),
    ('jdîd', 'neuf, nouveau', dict(pos='adj', plural='jdâd')),
    ('qdîm', 'vieux, ancien', dict(pos='adj', plural='qdâm')),
    ('šahîd', 'martyr', dict(plural='šuhadâ')),
])
block(20, 22, 82, 'L', '98', [
    ('staejab', 's’étonner, s’émerveiller de', dict(notes='inaccompli istaejab men ; repris de la leçon 16')),
    ('tgarrab', 's’approcher de', dict(notes='inaccompli itgarrab men')),
    ('teâwen', 's’aider', dict(notes='inaccompli iteâwen')),
    ('bân', 'apparaître à qn', dict(notes='inaccompli ibân l-')),
    ('nzel', 'descendre (d’un véhicule)', dict(notes='inaccompli inzel')),
    ('tlae', 'monter, gravir', dict(notes='inaccompli itlae')),
    ('hbat', 'descendre', dict(notes='inaccompli ihbat')),
    ('tkellem', 'parler, s’exprimer', dict(notes='Repris de la leçon 11')),
    ('hallâ', 'laisser', dict(notes='inaccompli ihallî ; OCR partiel, à confirmer')),
    ('hawwes', 'se promener, chercher', dict(notes='inaccompli ihawwes')),
], pos='verbe')
block(20, 22, 82, 'L', '98', [
    ('bâed-', 'certain, certains, certaine, certaines'),
    ('bin… u-', 'entre… et…'),
    ('fûq', 'au-dessus'),
], pos='expression')

# ---- Leçon 21
block(21, 24, 87, 'R', '103', [
    ('sâhel', 'rivage, bord de mer', dict(gender='m')),
    ('dâlya', 'vigne', dict(gender='f')),
    ('šjâr', 'arbres', dict(pos='nom collectif', notes='Pluriel de šajra')),
    ('šîna', 'orange, oranger', dict(gender='f')),
    ('qâres', 'citron, mandarine, citronnier, mandarinier', dict(gender='m')),
    ('šeîr', 'orge', dict(gender='m')),
    ('karmûs', 'figue, figuier', dict(gender='m')),
    ('zîtûn', 'olive, olivier', dict(gender='m')),
    ('dašra', 'hameau', dict(gender='f', plural='dsûr')),
    ('es-sâba', 'la récolte de blé'),
    ('jâr', 'voisin', dict(gender='m', plural='jîrân')),
    ('menjel', 'faucille', dict(gender='m', plural='mnâjel')),
    ('ejûz', 'vieille femme', dict(gender='f', plural='ejâyez')),
])
block(21, 24, 87, 'R', '103', [
    ('zrae', 'semer', dict(notes='inaccompli izrae')),
    ('gres', 'planter', dict(notes='inaccompli igres')),
    ('tlemm', 'se réunir, se rassembler', dict(notes='inaccompli itlemm')),
    ('wjad', 'être prête (en parlant d’une chose)', dict(notes='inaccompli ywjad')),
    ('tâb', 'mûrir, être mûre (en parlant d’une chose)', dict(notes='inaccompli itôb')),
    ('bqa', 'rester, être en reste', dict(notes='inaccompli ibqa')),
    ('gead', 'rester, être assis', dict(notes='inaccompli igead')),
    ('sallâ', 'faire la Prière, bénir', dict(notes='inaccompli isallâ')),
    ('hsad', 'moissonner, faucher', dict(notes='inaccompli ihsad')),
], pos='verbe')
block(21, 24, 87, 'R', '103', [
    ('f-el-gâleb', 'la plupart du temps'),
    ('ki-', 'comme, lorsque', dict(notes='Suivi d’un verbe ; repris de la leçon 14')),
    ('men-hna', 'par ici, d’ici'),
], pos='expression')
block(21, 24, 87, 'R', '104', [
    ('yâ-', 'ô… (vocatif)', dict(notes='Déjà étudié leçon 4 (partie 01) ; voir §104 a')),
    ('ayya-', 'allons ! allons-y ! en avant !', dict(notes='Avec un verbe à l’inaccompli')),
    ('yâ-lâh', 'allons ! allons-y ! en avant !', dict(notes='Variante de ayya- ; déjà vu leçon 9 (partie 01)')),
    ('lâ-budda', 'il faut, c’est nécessaire !'),
    ('hâ-', 'voici (le, la, les)', dict(notes='Avec un pronom personnel isolé de 3e personne ; déjà vu leçon 8')),
    ('yâ-saedi', 'à ma chance ! quelle chance !'),
    ('yâ-hasra', 'hélas ! (soupir de regret sur le temps jadis)'),
], pos='expression')
block(21, 25, 88, 'L', '106', [
    ('lâ-… u-là-', 'ni… ni…', dict(pos='négation', notes='Négation répétée avec noms ou adjectifs au pluriel')),
    ('lâ', 'non', dict(pos='négation', notes='Négation isolée')),
    ('wâh', 'oui', dict(notes='Affirmation isolée ; selon les régions')),
    ('yêh', 'oui', dict(notes='Affirmation isolée ; selon les régions')),
    ('aywâ', 'oui', dict(notes='Affirmation isolée ; selon les régions')),
    ('neam', 'oui ; présent !', dict(notes='Affirmation isolée ; signifie aussi : présent')),
], pos='expression')

# ---------------------------------------------------------------- grammaire
R = []


def r(lesson, par, title, summary, examples, pdf, printed, side, notes=None):
    R.append(dict(lesson=lesson, par=par, title=title, summary=summary, examples=examples,
                  pdf=pdf, printed=printed, side=side, notes=notes))


r(11, '56', 'L’impératif',
  'L’impératif n’existe qu’aux deuxièmes personnes. On l’obtient en supprimant le préfixe t- des deuxièmes personnes de l’inaccompli ; c’est une forme abrégée de l’inaccompli. Parfois une voyelle-préfixe i- ou e- apparaît.',
  [{'latin': 'kteb', 'fr': 'écris (m.)'}, {'latin': 'ketbi', 'fr': 'écris (f.)'},
   {'latin': 'ketbu', 'fr': 'écrivez'}, {'latin': 'arwah', 'fr': 'viens !'}, {'latin': 'agra', 'fr': 'lis !'}],
  1, 41, 'R')
r(11, '56bis', 'Impératif de 1re personne du pluriel et impératif négatif',
  'Pour « allons ! » (1re pers. plur.) et pour l’impératif négatif (interdiction), on emploie l’inaccompli : précédé de ayya- ou yâ-lâh pour l’injonction, précédé de lâ- (parfois ma-) pour l’interdiction, avec -š final.',
  [{'latin': 'ayya-nektbu', 'fr': 'écrivons !'}, {'latin': 'lâ-tketbu-š', 'fr': 'n’écrivez pas !'}],
  1, 41, 'R', notes='Paragraphe signalé comme N. B. dans le livre ; référencé §56 bis par la suite.')
r(12, '59', 'Le nom : le genre',
  'Deux genres : masculin et féminin. Sont féminins : a) les mots terminés par -a ou -â ; b) les noms désignant un être du sexe féminin ; c) quelques noms féminins par usage (parties doubles du corps, noms de lieux, noms liés au feu ou à la magie). Le -a final devient -et/-t en annexion ou devant suffixe.',
  [{'latin': 'eš-štâ', 'fr': 'l’hiver (f.)'}, {'latin': 'bagret-el-fellâh', 'fr': 'la vache du cultivateur'},
   {'latin': 'bgart-i', 'fr': 'ma vache'}, {'latin': 'yedd', 'fr': 'main (f.)'}],
  3, 44, 'L', notes='La finale -a se trouve aussi dans des masculins (bâšâ, hôja) et des pluriels de groupes humains.')
r(12, '59bis', 'Le nom : le genre (fin)',
  'Catégories traditionnelles de féminins : noms communs ou propres désignant le sol ou un lieu habité ; noms en rapport avec l’idée de feu, de signe néfaste ou de magie.',
  [{'latin': 'el-ard', 'fr': 'la terre'}, {'latin': 'el-blâd', 'fr': 'la ville, le village, le pays'},
   {'latin': 'eš-šems', 'fr': 'le soleil (f.)'}, {'latin': 'en-nâr', 'fr': 'le feu, l’enfer (f.)'},
   {'latin': 'el-harb', 'fr': 'la guerre (f.)'}],
  3, 45, 'R')
r(12, '61', 'La numération de 11 à 19',
  'Les nombres de 11 à 19 sont formés de l’unité + -âš, abréviation de eašra (dix). Employés isolément, ou à l’état construit suivis d’un nom au singulier sans article (et non au pluriel comme de 2 à 10), souvent avec une syllabe de liaison -en-.',
  [{'latin': 'hdâš', 'fr': 'onze'}, {'latin': 'tnâš-en-râjel', 'fr': 'douze hommes'},
   {'latin': 'tmentâš-en-šhar', 'fr': 'dix-huit mois'}],
  3, 45, 'R')
r(13, '64', 'Quelques catégories de substantifs',
  'a) Noms concrets : 3 consonnes avec voyelle intérieure (e de préférence) après la 1re, en général masculins. b) Noms d’artisan : consonne centrale doublée suivie de â, ou finale -î/-i. c) Noms de lieu, de temps ou d’instrument : préfixe me- ou ma-, parfois finale -a (féminin). d) Noms d’appareil ou d’engin : comme les noms d’artisan, mis au féminin.',
  [{'latin': 'weld', 'fr': 'garçon'}, {'latin': 'hebbâz', 'fr': 'boulanger'},
   {'latin': 'mekteb', 'fr': 'bureau'}, {'latin': 'mathana', 'fr': 'moulin'},
   {'latin': 'maemel', 'fr': 'atelier, usine'}, {'latin': 'sayyâra', 'fr': 'automobile'}],
  5, 48, 'L')
r(13, '64bis', 'Quelques catégories de substantifs (fin)',
  'e) Noms d’action ou d’état : e entre les 2e et 3e consonnes et -a final (féminins) ; parfois un seul des deux traits. Certains adjectifs et participes s’emploient aussi comme substantifs. Les emprunts étrangers sont signalés entre crochets dans le livre.',
  [{'latin': 'el-ktâba', 'fr': 'l’écriture'}, {'latin': 'ed-drâfa', 'fr': 'la politesse'},
   {'latin': 'ed-drâs', 'fr': 'le battage du blé'}, {'latin': 'es-sanea', 'fr': 'la fabrication, le métier'},
   {'latin': 'eâlem', 'fr': 'savant'}, {'latin': 'mektûb', 'fr': 'destin (écrit)'}],
  5, 49, 'R', notes='Le livre note que mašîna est aujourd’hui remplacé par âla.')
r(14, '69', 'Quelques catégories d’adjectifs',
  'a) Type courant : i ou é avant la dernière consonne. b) État physique ou moral : a/e après la 1re consonne et finale -ân. c) Intensité ou habitude : consonne centrale doublée + â. d) Origine ou appartenance : finale -î/-i ajoutée à un nom.',
  [{'latin': 'jdid', 'fr': 'neuf'}, {'latin': 'mtîn', 'fr': 'solide'},
   {'latin': 'farhân', 'fr': 'content'}, {'latin': 'kaslân', 'fr': 'paresseux'},
   {'latin': 'keddâb', 'fr': 'menteur'}, {'latin': 'hallâq', 'fr': 'coiffeur'}],
  7, 52, 'L')
r(14, '69bis', 'Quelques catégories d’adjectifs (fin)',
  'd) (suite) Adjectifs d’origine. e) Couleurs ou particularités physiques : a avant la dernière consonne. f) Anciens participes ayant gardé la forme. Tous forment leur féminin en -a, avec parfois modification vocalique interne ; leurs pluriels suivent les règles du pluriel des noms.',
  [{'latin': 'jazâiri', 'fr': 'algérien'}, {'latin': 'mzâbi', 'fr': 'mozabite'},
   {'latin': 'bahri', 'fr': 'marin'}, {'latin': 'hdar', 'fr': 'vert'},
   {'latin': 'hadra', 'fr': 'verte'}, {'latin': 'wâsee', 'fr': 'vaste'}],
  7, 53, 'R')
r(14, '71', 'Emploi de l’adjectif',
  'Adjectifs et participes se placent toujours après le nom. Comme épithète, ils s’accordent en genre et en nombre et prennent l’article si le nom est déterminé. Comme attribut, ils s’accordent mais ne prennent pas l’article.',
  [{'latin': 'el-borgo le-mtîn', 'fr': 'le calicot solide'},
   {'latin': 'wâhd-el-mdina sgêra', 'fr': 'un petit village'},
   {'latin': 'el-mselmin râhum gâedîn', 'fr': 'les Musulmans sont assis'}],
  7, 53, 'R')
r(14, '71bis', 'Emploi de l’adjectif (fin)',
  'L’attribut s’emploie dans une proposition sans verbe (être au présent sous-entendu) ou avec un verbe d’état. Les pluriels d’objets ou d’animaux entraînent souvent un accord au féminin singulier. Adjectifs et participes peuvent devenir substantifs.',
  [{'latin': 'le-hwânet mzewwga', 'fr': 'les boutiques sont décorées'},
   {'latin': 'la-byad', 'fr': 'le blanc'}, {'latin': 'el-eâlem', 'fr': 'le savant'}],
  8, 54, 'L')
r(15, '74', 'Le nom : le nombre',
  'Deux nombres : singulier et pluriel ; certains noms peuvent recevoir une terminaison de duel. Le pluriel se forme soit par addition d’un suffixe sans modification interne notable (pluriel externe), soit par modification intérieure notable sans terminaison (pluriel interne).',
  [{'latin': 'gâed / gâedîn', 'fr': 'assis / assis (pl.)'}, {'latin': 'ktâb / ktüb', 'fr': 'livre / livres'}],
  9, 57, 'R')
r(15, '76', 'Duel',
  'Le duel se forme avec la terminaison -în, identique à celle du pluriel externe masculin, mais réservé à certaines catégories : parties doubles du corps ; laps de temps, unités de poids ou de mesure, noms signifiant « fois ». Le -a final devient -t devant le suffixe. Certaines régions distinguent -ayn (duel) de -în (pluriel).',
  [{'latin': 'el-eînin', 'fr': 'les deux yeux'}, {'latin': 'el-yeddin', 'fr': 'les deux mains'},
   {'latin': 'sâtayn', 'fr': 'deux heures'}, {'latin': 'marrtin', 'fr': 'deux fois'}],
  10, 58, 'L')
r(15, '77', 'Pluriel externe',
  'Addition au singulier de -în, -a ou -ât selon la catégorie et le genre. a) Participes du verbe primitif employés comme participes ou adjectifs : -în aux deux genres.',
  [{'latin': 'gâed, pl. gâedîn', 'fr': 'assis, assises'}, {'latin': 'mahdûm, pl. mahdûmîn', 'fr': 'ouvragés, ouvragées'}],
  10, 58, 'L')
r(15, '77bis', 'Pluriel externe (fin)',
  'b) Adjectifs d’état physique ou moral : -în aux deux genres. c) Noms d’artisans et adjectifs d’intensité : -în ou -a au masculin. d) Adjectifs d’origine : masculin -iyîn, féminin -iyât. e) Participes des verbes dérivés : masculin -în, féminin -ât. f) Féminins en -a formés sur un masculin ou noms modernes : pluriel en -ât.',
  [{'latin': 'farhân, pl. farhânîn', 'fr': 'contents'}, {'latin': 'fellâh, pl. fellâhîn ou fellâha', 'fr': 'cultivateurs'},
   {'latin': 'jazâiri, pl. jazâiriyîn / jazâiriyât', 'fr': 'algériens / algériennes'},
   {'latin': 'mɛallim, pl. mɛallimîn / mɛallimât', 'fr': 'enseignants / enseignantes'},
   {'latin': 'kelba, pl. kelbât', 'fr': 'chiennes'}],
  10, 59, 'R')
r(16, '79', 'Pluriel interne',
  'Concerne la majorité des noms et adjectifs : modification intérieure notable du singulier. a) De nombreux noms de trois consonnes ou plus introduisent un â après les deux premières consonnes devenues consécutives.',
  [{'latin': 'bgel, pl. bgâl', 'fr': 'mulets'}, {'latin': 'sâheb, pl. shâb', 'fr': 'amis'},
   {'latin': 'bent, pl. bnât', 'fr': 'filles'}, {'latin': 'madrasa, pl. mdâres', 'fr': 'écoles'}],
  12, 62, 'L', notes='Le livre précise qu’il n’existe pas de règles absolues : le glossaire donne le pluriel en usage.')
r(16, '79bis', 'Pluriel interne (suite)',
  'a) (suite) Certains noms ajoutent î ou i avant la dernière consonne ; les noms à deux consonnes peuvent recevoir un w ou y supplémentaire ; certains prennent un u- initial. b) Adjectifs du type courant : â à la place du i/é du singulier. c) Noms à voyelle â/a : pluriel en û ou î. d) Adjectifs de couleur : o ou u entre les deux premières consonnes. e) Participes actifs devenus substantifs : u après la 1re consonne et â après la 2e radicale redoublée.',
  [{'latin': 'aqrab, pl. aqârib', 'fr': 'proches parents'}, {'latin': 'dâr, pl. dyâr', 'fr': 'maisons'},
   {'latin': 'weld, pl. ulâd', 'fr': 'garçons, fils'}, {'latin': 'kbir, pl. kbâr', 'fr': 'grands'},
   {'latin': 'ktâb, pl. ktüb', 'fr': 'livres'}, {'latin': 'hdar, pl. hodar', 'fr': 'verts'},
   {'latin': 'tâjer, pl. tujjâr', 'fr': 'commerçants'}],
  12, 63, 'R')
r(16, '79ter', 'Pluriel interne (fin)',
  'En résumé : voyelle longue (souvent â) après deux consonnes consécutives, ou modification de la voyelle intérieure, ou voyelle brève (o/u) après la 1re consonne. Il existe des exceptions, à apprendre avec le glossaire.',
  [{'latin': 'tfal, pl. taflân', 'fr': 'garçonnets'}, {'latin': 'fâr, pl. firân', 'fr': 'rats'},
   {'latin': 'eâlem, pl. eulamâ', 'fr': 'savants'}, {'latin': 'sadiq, pl. asdiqâ', 'fr': 'amis sincères'}],
  13, 64, 'L')
r(16, '81', 'Le collectif',
  'Nom considéré comme un singulier mais désignant une collectivité. a) Collectif dont le nom d’unité est tiré de la même racine par la terminaison -a : collectif le plus souvent masculin, parfois féminin ; le même nom désigne l’arbre et ses produits. b) Collectif sans nom d’unité de même racine : toujours féminin.',
  [{'latin': 'eš-šjar / šajra', 'fr': 'les arbres (m.) / un arbre (f.)'},
   {'latin': 'le-bgar / bagra', 'fr': 'les bovins / une vache'},
   {'latin': 'le-gnem', 'fr': 'les ovins (f.)'}, {'latin': 'en-nâs', 'fr': 'les gens (f. ou pluriel m.)'}],
  13, 64, 'L')
r(17, '85', 'La numération de 20 à 99',
  'Dizaines formées de l’unité + -în (20 : eašra + suffixe du duel). À partir de 21, on énonce d’abord les unités puis les dizaines, reliées par u-. Le nom qui suit reste au singulier sans article, comme à partir de 11.',
  [{'latin': 'wâhed u-eašrîn', 'fr': '21'}, {'latin': 'tnîn u-tlâtîn eâm', 'fr': '32 ans'},
   {'latin': 'hemsa u-rabeîn yôm', 'fr': '45 jours'}, {'latin': 'tmânîn râjel', 'fr': '80 hommes'}],
  15, 68, 'L')
r(17, '85bis', 'La numération de 20 à 99 (fin)',
  'Pour l’heure, on emploie un simple nombre avec l’article (1 à 12) ; u- (et) ou gêr (moins) précèdent les fractions d’heure ou les minutes, exprimées par un nombre sans article.',
  [{'latin': 'gêr-hemsa u-saɛrîn', 'fr': 'onze heures moins vingt-cinq'}],
  15, 69, 'R', notes='Exemple OCR partiel ; à confirmer sur le scan.')
r(18, '88', 'Comparatif et superlatif',
  'a) Comparatif de supériorité : forme aCCaC (akbar de kbir, asgar de sgêr), invariable, suivie de men. Plus fréquemment : adjectif ordinaire variable + expression de supériorité, d’égalité ou d’infériorité (ahsan men, aktar men, hêr men, agall men, metl-/kîf-). b) Superlatif relatif : adjectif ordinaire + expression marquant le caractère extrême.',
  [{'latin': 'Mahmûd akbar men Mohammed', 'fr': 'Mahmoud est plus grand que Mohammed'},
   {'latin': 'Mohammed hnîn ela-hôto', 'fr': 'Mohammed est plus tendre que ses frères'},
   {'latin': 'Layla eâqla kîf-ha', 'fr': 'Leïla est aussi sage qu’elle'},
   {'latin': 'Layla zîna b-ez-zâf', 'fr': 'Leïla est très jolie'}],
  17, 72, 'L')
r(18, '88bis', 'Comparatif et superlatif (fin)',
  'Le superlatif peut aussi s’exprimer par l’adjectif d’intensité, par un adjectif à sens superlatif, ou par le comparatif suivi d’un nom complément déterminatif. Précédé de l’article, le comparatif devient superlatif et varie en genre (akbar, f. kubra ; aela, f. eulya).',
  [{'latin': 'huwwa le-mhayyar', 'fr': 'c’est le meilleur'},
   {'latin': 'huwwa ahsan-najjâr', 'fr': 'c’est le meilleur menuisier'},
   {'latin': 'el-madrasa-l-kubra', 'fr': 'l’école la plus grande, supérieure'}],
  17, 73, 'R')
r(18, '90', 'La numération de 100 à l’infini',
  '100 = mya, 200 = mîtîn ; centaines suivantes : unité (3-9) à l’état construit + mya. 1000 = alef, 2000 = alfîn ; milliers suivants : unité (3-10) à l’état construit + alâf ; à partir de 11 000, retour au singulier alef. Au-dessus de 100, même ordre qu’en français, mais les unités précèdent les dizaines, liaison par u-, nom au singulier à partir de 11.',
  [{'latin': 'telt-e-mya', 'fr': '300'}, {'latin': 'telt-alâf', 'fr': '3 000'},
   {'latin': 'hdâš-alef', 'fr': '11 000'},
   {'latin': 'sebeɛ-alâf u-hems-e-mya u-setta u-sebeîn weld', 'fr': '7 576 garçons'}],
  17, 73, 'R')
r(18, '90bis', 'La numération de 100 à l’infini (fin)',
  'Pour les sommes d’argent, on compte parfois en dôro (unité ancienne valant 5 centimes), l’unité officielle étant le dinâr (pluriel danânir).',
  [{'latin': 'alef u-tmen-e-mya u-taseîn dôro', 'fr': '1 890 dôro, soit 9 450 centimes ou 94,5 dinars'}],
  18, 74, 'L', notes='Valeurs monétaires historiques ; ne pas transposer telles quelles dans l’application.')
r(18, '91', 'Les adjectifs numéraux ordinaux',
  'Ils ont la forme du participe actif du verbe primitif, sauf « premier » (awwel). Ils n’existent que jusqu’à « dixième » ; à partir de « onzième », on emploie le cardinal. Ils sont variables : féminin en -a, pluriel (rare) en -în. « Dernier » se dit tâli, à ne pas confondre avec tânî (second), dont on tire tânawî (secondaire).',
  [{'latin': 'huwwa r-râbeɛ', 'fr': 'c’est le quatrième'}, {'latin': 'el-bent et-tânya', 'fr': 'la deuxième fille'}],
  18, 74, 'L')
r(19, '94', 'Le pronom relatif',
  'Le relatif le plus courant est elli (variantes li, di), valable aux deux genres et aux deux nombres, quelle que soit sa fonction. a) Avec antécédent, celui-ci est un nom déterminé par le sens (en général avec article), un pronom personnel isolé ou un démonstratif.',
  [{'latin': 'el-eummâl elli hum shâb-sanea', 'fr': 'les ouvriers qui sont d’un métier'}],
  19, 77, 'R')
r(19, '94bis', 'Le pronom relatif (fin)',
  'b) Sans antécédent exprimé, elli sous-entend un démonstratif et signifie « celui qui, celle qui, ceux qui ». Pour une chose, le relatif peut être ma (ce que), à ne pas confondre avec la négation ma. La conjonction belli (que) introduit une subordonnée et n’a rien à voir avec le relatif.',
  [{'latin': 'elli igder iteallem herfa', 'fr': 'celui qui peut apprendre un métier'},
   {'latin': 'kâyen elli ihedmu', 'fr': 'il y en a qui travaillent'},
   {'latin': 'gûl-li ma emeltu yâmes', 'fr': 'dis-moi ce que vous avez fait hier'}],
  20, 78, 'L')
r(19, '96', 'La proposition relative',
  'La relative se construit comme les autres propositions, sans verbe ou avec verbe, en général dans l’ordre du français. Quand le relatif n’est plus sujet mais complément, on le rappelle dans la relative par un pronom suffixe de 3e personne accordé avec l’antécédent. a) Si elli équivaut à « que » (objet direct), le pronom se place après le verbe.',
  [{'latin': 'el-eummâl elli hum shâb-sanea', 'fr': 'les ouvriers qui sont d’un métier'}],
  20, 78, 'L')
r(19, '96bis', 'La proposition relative (fin)',
  'b) Si elli équivaut à « qui/quoi » après préposition, le pronom se place après la préposition. c) S’il équivaut à « dont », le pronom se place après le nom déterminé. C’est ce pronom de rappel qui indique la fonction du relatif ; avec ma, il n’apparaît pas.',
  [{'latin': 'el-weld elli drabtuh, huwwa weldi', 'fr': 'le garçon que vous avez frappé, c’est mon fils'},
   {'latin': 'el-bent elli hrejna meaha', 'fr': 'la fille avec qui nous sommes sortis'},
   {'latin': 'el-eummâl elli wlâdhum f-el-jazâir', 'fr': 'les ouvriers dont les enfants sont en Algérie'}],
  20, 79, 'R')
r(20, '99', 'Les indéfinis',
  'Principaux indéfinis : kull, wâhed/wâhda, bâed. a) kull s’emploie avec l’article après un nom lui-même déterminé (« tout, la totalité »), ou sans article devant un nom singulier sans article (« chaque »). Mot invariable.',
  [{'latin': 'le-mdîna l-kull', 'fr': 'toute la ville'}, {'latin': 'men-kull-jiha', 'fr': 'de chaque côté'}],
  22, 82, 'L')
r(20, '99bis', 'Les indéfinis (fin)',
  'b) wâhed/wâhda, non suivi d’un nom avec article, est un pronom indéfini (« un, un certain »). kull-wâhed = chacun ; wâhed… l-âhor = l’un… l’autre. c) bâed suivi d’un collectif ou d’un pluriel avec article = « certains ». L’expression alternée bâed + pronom suffixe + bâed marque la réciprocité.',
  [{'latin': 'wâhed sâhbi', 'fr': 'un mien ami'}, {'latin': 'bâed en-nâs', 'fr': 'certaines gens'},
   {'latin': 'bâed el-eammâla', 'fr': 'certains ouvriers'},
   {'latin': 'nteâwnu bâedna-bâed', 'fr': 'nous nous aidons l’un l’autre'}],
  22, 83, 'R')
r(20, '101', 'Les expressions indéfinies',
  'a) kull-ši = toute chose, tout : pronom indéfini, alors que kull est ailleurs adjectif. b) ši, après la négation ma-, = la moindre chose, rien ; le plus souvent dans une phrase négative.',
  [{'latin': 'hallîna kull-ši', 'fr': 'nous avons tout laissé'},
   {'latin': 'ma-emel ši', 'fr': 'il ne fait rien'}],
  22, 83, 'R', notes='Exemple b) reconstitué d’après §106 a ; formulation exacte à confirmer.')
r(20, '101bis', 'Les expressions indéfinies (fin)',
  'b) (suite) ši peut s’employer elliptiquement pour « rien (du tout) » ; variantes hetta-šay ou simplement šay ; synonyme courant : wâlu. c) hetta-hâd, après ma-, = la moindre personne, personne ; peut se réduire à hâd.',
  [{'latin': 'ma-šuft hetta-ši', 'fr': 'je n’ai rien vu'},
   {'latin': 'ma-šufna hetta-hâd', 'fr': 'nous n’avons vu personne'}],
  23, 84, 'L', notes='Synonyme « rien » partiellement illisible à l’OCR ; noté wâlu, à confirmer.')
r(21, '104', 'L’exclamation',
  'Trois sortes : a) particules du vocatif (yâ-) ; b) mots introduisant des impératifs ou nuançant le ton (ayya-, yâ-lâh, lâ-budda, hâ-, yâ-saedi, yâ-hasra) ; c) formules contenant le nom de Dieu, variables selon les circonstances. Les expressions de sentiment varient fortement d’une région à l’autre.',
  [{'latin': 'yâ-Mohammed', 'fr': 'ô Mohammed'}, {'latin': 'ayya-nketbu', 'fr': 'allons, écrivons !'},
   {'latin': 'yâ-hasra', 'fr': 'hélas !'}, {'latin': 'b-esm-ellâh', 'fr': 'au nom de Dieu !'}],
  24, 87, 'R')
r(21, '106', 'La négation (fin)',
  'a) Avec un verbe à l’accompli ou à l’inaccompli : ma-… + ši, šay, gêr, hetta, hetta-ši, hetta-hâd, illa. b) Impératif négatif : lâ-… -š (parfois ma-). c) Négation répétée avec noms ou adjectifs : lâ-… u-là-. Négation isolée : lâ (non) ; affirmation isolée : wâh, yêh, aywâ, neam (oui).',
  [{'latin': 'ma-ieamel hetta-ši', 'fr': 'il ne fait rien'},
   {'latin': 'ma-hrejna hetta kemmelna', 'fr': 'nous ne sommes sortis que lorsque nous eûmes fini'},
   {'latin': 'lâ-tadrab-ši', 'fr': 'ne frappe pas !'},
   {'latin': 'ma-eando lâ-sukna u-lâ-dâr', 'fr': 'il n’a ni appartement ni maison'}],
  25, 88, 'L')

# ---------------------------------------------------------------- exercices
E = []


def e(lesson, kind, par, prompt, items, pdf, printed, side):
    E.append(dict(lesson=lesson, kind=kind, par=par, prompt=prompt, items=items,
                  pdf=pdf, printed=printed, side=side))


e(11, 'version', '54bis', 'Traduire le texte 54 (Mohammed u-hô-h es-sgêr, commencé en partie 01).', [], 1, 40, 'L')
e(11, 'theme', '55', 'Mettre le texte 54 au féminin en supposant qu’à la place de Mohammed il s’agisse d’une fille, Fâtéma, ayant un petit frère.', [], 1, 40, 'L')
e(11, 'theme', '57', 'Traduire : Aimez-vous la lecture, ô mes enfants ? Nous aimons la lecture et l’écriture. Mohammed a dit à son frère : « Écris ton nom sur ce livre et va à l’école, ne t’amuse pas et apprends ta leçon ! ». La mère de Mohammed a dit à son fils : « Allons ! va au marché et achète-moi deux kilos de légumes verts. Va, mon fils, sois protégé de Dieu ! ». Notre père nous a dit : « Allez au cinéma ! ». Le maître a dit aux enfants : « Écrivons et lisons, apprenons notre leçon ! ». Soyez protégés de tout mal !', [], 1, 41, 'R')
e(11, 'conjugation', '57bis', 'Conjuguer les expressions suivantes : ana nahfad darsi ; ana leabt mɛa hô-ya ; ana kunt sâken ; nkûn mahfûd.', [], 1, 41, 'R')
e(12, 'version', '58bis', 'Traduire le texte 58 (es-sana w-el-fasl w-eš-šhar).', [], 3, 44, 'L')
e(12, 'questions', '60', 'Répondre : f-âš-men fasl râna ? f-âš-men fasl tebda l-madrasa ? weqtâš ifrah el-fellâh ? elaš ifrah ? f-eš-štâ wâš kâyen ? u-f-es-sêf âš kâyen ? f-el-hréf, el-hâl kêfâš ? weqtâš ja šhar ramdân f-hâd-el-eâm ? el-usbûe šhâl men-yôm fih ? es-sûq f-mdinat-na nhâr et-tlâta, u-hâd-eš-šhar bda b-et-tnin, ahseb šhâl men-sûq fih ? er-rûm b-âš ihseb es-sana ?', [], 3, 45, 'R')
e(12, 'theme', '62', 'Traduire : Cette année, nous irons à Alger au mois de Ramadan. Alger est une grande ville. Cet été, le soleil n’était pas fort à Rabat, mais cet hiver il y fait froid. La neige tombe en montagne ; dans notre ville, il pleut. Ce mois-ci, il pleut beaucoup, nous sommes contents, Dieu soit loué ! Le printemps est une bonne saison. Ce mois-ci, la pluie est tombée pendant quinze jours. Ô Mohammed, regarde les Européens, ils travaillent toute la journée et toi, tu ne travailles pas ! Courage, travaille et tu seras content ! Le vent était fort en cette matinée. Nous, les Musulmans, nous comptons l’année en fonction de la lune.', [], 3, 45, 'R')
e(13, 'version', '63bis', 'Traduire le texte 63 (el-hobz).', [], 5, 48, 'L')
e(13, 'questions', '65', 'Répondre : f-âš-men fasl idersu ? škûn ja eand el-fellâh nhâr-ed-drâs ? âš idersu ? âš ieammru b-el-gemh ? šhâl-men-yôm dersu ? eand-men ihemlu l-gemh ? âš isaneu b-el-gemh ? škûn huwwa l-hebbâz ? elaš hedmet-el-hebbâz seɛba ? elaš el-hebbâz râjel mabrûk eand-le-ɛyâb ? âš idehlu w-ihorju n-nâs ?', [], 5, 49, 'R')
e(13, 'questions', '66', 'Dites à quelle catégorie appartiennent les noms suivants et à quoi vous le reconnaissez ; vérifiez au glossaire.',
  ['farrân', 'melf', 'sfânji', 'matrag', 'hsâb', 'hzâna', 'msîd', 'haffâf', 'tayyâra', 'kebš', 'jeld', 'mekteb', 'manzel', 'wejh', 'bâtie', 'slâma', 'dars', 'qrâya', 'klâm', 'telj', 'mesjed', 'heddâm'],
  5, 49, 'R')
e(13, 'theme', '67', 'Traduire : Le boulanger. Le boulanger est un brave homme, un homme au cœur généreux. Il travaille la nuit entière pour faire le pain. Dans la journée, il se tient dans la boutique. Il est assis près de la planche sur laquelle se trouve le pain et il le vend. Les gens entrent dans la boutique, le saluent avec politesse et sortent contents. Quand il a achevé son travail dans la boutique, il rentre dans son fournil pour la fabrication du pain.', [], 5, 49, 'R')
e(14, 'version', '68bis', 'Traduire le texte 68 (f-ez-zenqa).', [], 7, 52, 'L')
e(14, 'questions', '70', 'Répondre : f-âš-men blâd teskun ? âš-men zenqa ? šhâl f-ez-zenqa ? eand-men teskun ? u-hâd-el-blâd wén jât ? wâš hiyya blâd kbîra wella sgêra ? âš râha mzewwga hânût el-jazzâr ? el-jazzâr âš ibîe ? u-hânût el-baqqâl âš-men lawn râha ? škûn ihabbar eand el-mhayyar ? el-hayyât, wén hatt el-mašîna ?', [], 7, 53, 'R')
e(14, 'theme', '72', 'Traduire : Toi, tu habites dans un village du département d’Alger ; moi, une ville du département d’Oran. Dans ton village, les rues sont étroites et les gens ne peuvent pas y passer. À vrai dire, il y a aussi dans ton village une grand-rue large et longue. À droite et à gauche, les magasins sont décorés. Regarde le coiffeur comme il est content ! Son magasin est neuf et brille comme le soleil ; sa gandoura est blanche comme la neige. Le boucher est un homme grossier, mais généreux.', [], 8, 54, 'L')
e(15, 'version', '73bis', 'Traduire le texte 73 (es-sâɛa).', [], 9, 57, 'R')
e(15, 'questions', '75', 'Répondre : weqtâš hrej Mohammed men dâro ? layn kân mâši ? škûn šâf f-ez-zenqa ? âš kânet es-sâɛa ? šhâl kânu l-hayyâtîn mjammɛîn u-ma-šâfu-hâd ? elaš ma-šâfu-hâd ? šhâl jâz men-tfal f-rboe sâɛa ? âš-men sâɛa dhel Mohammed l-qâɛat-ed-dars ? wâš išri-lo bâbâh baɛd-le-mtihân ?', [], 10, 58, 'L')
e(15, 'theme', '77ter', 'Traduire : Mardi matin, nous sommes sortis de chez nous et nous ne savions pas l’heure qu’il était. Nous avons vu deux vendeuses assises conversant. Mon frère leur a demandé : « Que le salut soit sur vous ! Quelle heure est-il, s’il vous plaît ? ». Elles lui ont répondu : « Il est sept heures et demie, monsieur ! ». Nous sommes sortis de chez nous, les ouvriers, à onze heures juste. Vous avez de jolis cartables.', [], 10, 59, 'R')
e(16, 'version', '78bis', 'Traduire le texte 78 (ɛammi Milûd).', [], 12, 62, 'L')
e(16, 'questions', '80', 'Répondre : škûn ɛammi Milûd ? wâš ibîe w-išri ? layn mša wâhd-el-hatra ? w-šhâl-men-bît eando f-dâro ? kêfâš râhum duk-el-byût ? wâš kâyen f-el-byût ? ela-l-hyôt, wâš kâyen ? wâš kâyen f-bît-el-mâkla ? škûn ihdem elih ? elaš igûlu-lo « le-hšâyši » ? šhâl-men-dâr eando ? wén jâw duk-ed-dyâr ? ɛammi Milûd, râjel mreffeh wella meskîn ?', [], 13, 64, 'L')
e(16, 'theme', '82', 'Traduire : Le riche commerçant. Ton oncle Abdallah vend et achète les moutons. Ainsi, il gagne beaucoup d’argent. Les gens le saluent parce qu’il a cinq maisons, trois automobiles, quatre serviteurs et quatre servantes. Sa maison se compose de huit pièces. Dans ces pièces, il y a des tapis, des coussins et des plateaux en argent. Mais ton oncle Abdallah est un homme généreux, il ne fait pas de bien aux pauvres.', [], 13, 65, 'R')
e(16, 'questions', '82bis', 'Formez le pluriel des mots qui suivent et vérifiez au glossaire (récapitulation sur le pluriel).',
  ['hmar', 'sâken (substantif)', 'masnae', 'tûnsi', 'hebbâz', 'tbîb', 'sgêr', 'hmâr', 'mdîna', 'mustašfa', 'qesm'],
  13, 65, 'R')
e(17, 'version', '83bis', 'Traduire le texte 83 (ɛand-et-tbêb).', [], 15, 68, 'L')
e(17, 'questions', '84', 'a) Mettre le texte 83 au féminin en supposant que Kaddour le maçon soit remplacé par Zîneb-el-hayyâta (Zineb la couturière). b) Mettre le texte 83 au pluriel (jusqu’à « men hâd-el-jiha ») en supposant qu’il y ait deux maçons malades : Kaddour et Abdallah.', [], 15, 68, 'L')
e(17, 'theme', '86', 'Traduire : 5 Marocaines ; 8 cultivateurs rassemblés ; 9 Européens assis ; Mohammed était malade pendant 18 mois ; cet homme est âgé de … ans. Dans notre rue, il y a 85 Musulmans et environ 30 Chrétiens. Il est … du matin. Entrez, je vous en prie, monsieur, asseyez-vous là-bas, sur cette chaise. De quoi souffrez-vous ? Ma poitrine me fait mal. Mon père est entré … heures du soir. Je souffre de la tête. Mon … est cardiaque.', [], 15, 69, 'R')
e(18, 'version', '87bis', 'Traduire le texte 87 (Mohammed u-hôto).', [], 17, 72, 'L')
e(18, 'questions', '89', 'Répondre : Mohammed, šhâl f-ɛamro ? škûn huma hôto ? bâbâh âš snâɛto ? âš-men-najjâr huwwa f-el-mdîna ? škûn akbar men-Mohammed f-hôto ? hto le-kbîra âš tdir ? le-mhbayyar f-ed-drâri škûn huwwa ? weqtâš njah f-le-mtihân ? wén idrus el-eâm el-jây in-šâe-allâh ? hô-h ɛabd-el-qâder šhâl f-ɛamro ? u-Layla šhâl f-ɛamrha ? u-b-šhâl hiyya asgar men-hetha Zîneb ? Layla trûh l-el-madrasa-l-kubra wella l-el-madrasa-s-sgêra ?', [], 17, 73, 'R')
e(18, 'theme', '92', 'Traduire : Abdallah est âgé de 16 ans, il a une sœur plus jeune que lui ; sa sœur Fatma est âgée de 8 ans ; elle est plus raisonnable que lui et travaille bien à l’école : elle est la première en lecture, la troisième en calcul, la quatrième en écriture sur 42 filles. C’est une grande travailleuse et elle est très tendre. Son papa lui a acheté une montre de 85 dinars quand elle est entrée dans sa huitième année. Mohammed est le meilleur élève de sa classe.', [], 18, 74, 'L')
e(19, 'version', '93bis', 'Traduire le texte 93 (el-eâmel el-jazâiri).', [], 19, 77, 'R')
e(19, 'questions', '95', 'Répondre : elaš iji l-eâmel el-jazâiri l-ûrubbâ ? škûn trek temma f-blâdo ? wâš ieamlo l-jazâiri f-fransâ ? u-nta wâš tehdem ? u-enti wâš thedmi ? eand-men tehdem : f-šerka wella eand-mɛallem wella eand-el-bâylik ? men-el-jazâiriyin, kâyen b-ez-zâf elli teallmu herfa ? wâš ieamlu f-kull-šhar ? weqtâš irjae el-eâmel el-jazâiri l-el-watan ? škûn išûf f-blâdo ?', [], 20, 78, 'L')
e(19, 'theme', '97', 'Traduire : L’ouvrier qui a appris un bon métier gagne mieux que celui qui n’a rien appris. L’homme qui est venu hier est un bon ouvrier. La femme que tu as vue est très gentille. Les Musulmans dont les enfants ont appris le Coran sont de bons Musulmans. L’ami avec qui je suis sorti hier est menuisier. Ô mon fils, dis-moi ce que tu as appris aujourd’hui à l’école. Apprends ce que tu peux. Il est convenable d’apprendre un bon métier, si tu veux (gagner) un bon salaire.', [], 20, 79, 'R')
e(20, 'version', '98bis', 'Traduire le texte 98 (mdînat-el-jazâir).', [], 22, 82, 'L')
e(20, 'questions', '100', 'Répondre : el-jazâir, mdîna kêfâš ? mnin tusal l-el-eâséma b-el-bâhira, âš tšûf ? âš ibânu lek ez-znûq ? w-ed-dyâr âš ibânu lek ? mnin hbatu men-el-bâhira, layn dâru z-zûj es-shâb ? f-el-qahwa âš kânu : farhânîn wella lâ ? men-šhâl hâdi ma-šâfu l-gasba ? es-sâha le-kbîra âš ismha f-el-eâséma ? wén jât ?', [], 22, 83, 'R')
e(20, 'theme', '102', 'Traduire : Je suis arrivé à Alger samedi matin par le bateau et je me suis émerveillé par cette ville étagée à flanc de colline. Lorsque je suis descendu, j’ai dit à un homme : « Où se trouve la Place des Martyrs, s’il vous plaît ? ». Il m’a dit : « Montez de ce côté et vous trouverez cette place ! ». Tout est blanc et chacun se promène lentement. Tout me paraît beau, aussi bien le quartier ancien que le quartier nouveau.', [], 23, 84, 'L')
e(21, 'version', '103bis', 'Traduire le texte 103 (el-fellâh el-jazâiri).', [], 24, 87, 'R')
e(21, 'questions', '105', 'Répondre : wén iskun el-fellâh el-jazâiri ? elaš itlemmu l-fellâha w-isuknu f-dašra wella f-duwâr ? wâš izrae el-fellâh el-jazâiri ? wâš ieamlu sukkân ed-duwâr mnin es-sâba tâbet ? dak en-nhâr wâš ieamel el-fellâh môl-el-gemh ? er-rjâl wâš ilabsu ? en-nsâ u-l-ulâd wâš ijibu ? škûn igead f-ed-duwâr ? wâš igûlu en-nâs qbal la-ibda l-hsâd ?', [], 25, 88, 'L')
e(21, 'theme', '107', 'Traduire : Il nous faut nous aider les uns les autres dans l’agriculture. Le cultivateur algérien habite près de ses proches. Ainsi, ils forment un douar et pratiquent la culture collective. « Ô mes frères ! allons, la moisson est mûre. Au nom de Dieu ! ». Je n’ai vu personne. Ne travaillez pas ! N’écrivez rien, écoutez seulement. Voici le … Par Dieu, ne sortons pas ! Le blé est mûr. Les olives ne sont pas encore mûres.', [], 25, 88, 'L')
e(21, 'questions', '107bis', 'Mettez au pluriel les 2e et 3e paragraphes du texte 103, en supposant que plusieurs cultivateurs se proposent de moissonner leur blé.', [], 25, 88, 'L')

# ---------------------------------------------------------------- textes
# lesson, par, title, pdf, printed, side, completeness
T = [
    (12, '58', 'es-sana w-el-fasl w-eš-šhar', 2, 42, 'L', 'complete'),
    (13, '63', 'el-hobz', 4, 46, 'L', 'complete'),
    (14, '68', 'f-ez-zenqa', 6, 50, 'L', 'complete'),
    (15, '73', 'es-sâɛa', 8, 55, 'R', 'complete'),
    (16, '78', 'ɛammi Milûd', 11, 60, 'L', 'complete'),
    (17, '83', 'ɛand-et-tbêb', 14, 66, 'L', 'complete'),
    (18, '87', 'Mohammed u-hôto', 16, 70, 'L', 'complete'),
    (19, '93', 'el-eâmel el-jazâiri', 18, 75, 'R', 'complete'),
    (20, '98', 'mdînat-el-jazâir', 21, 80, 'L', 'complete'),
    (21, '103', 'el-fellâh el-jazâiri', 23, 85, 'R', 'complete'),
    (22, '108', 'kêfâš ibniw dâr', 25, 89, 'R', 'partial'),
]


def seg_sha() -> tuple[str, list[dict]]:
    h = hashlib.sha256()
    infos = []
    for name in SEGMENTS:
        p = ROOT / 'raw' / name
        b = p.read_bytes()
        h.update(b)
        infos.append(dict(filename=name, bytes=len(b), sha256=hashlib.sha256(b).hexdigest()))
    return h.hexdigest(), infos


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
    combined, seginfos = seg_sha()
    total_bytes = sum(s['bytes'] for s in seginfos)
    con.execute('''INSERT OR REPLACE INTO sources
        (source_id,book,part,title,author,publisher,edition,isbn,filename,sha256,bytes,pdf_pages,dialect,register,rights_note)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
        (SOURCE_ID, 'manuel-arabe-algerien', PART, m['title'], m['author'], m['publisher'],
         m['edition'], m['isbn'], ' + '.join(SEGMENTS), combined, total_bytes, 25, 'arq',
         m['register'],
         'Œuvre sous droit (Klincksieck). Usage interne/recherche ; publication app nécessite licence ou contenu original/licencié.'))

    # ---- purge ciblée partie 02 (idempotent, ne touche pas la partie 01)
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

    # ---- pages (25 pages PDF, 2 moitiés, pages imprimées 40 à 89)
    ocr_dir = ROOT / 'ocr' / 'partie-02-colonnes'
    metas = []
    for i in (1, 2, 3):
        metas.append(json.loads((ocr_dir / f'ocr-columns-seg{i}.json').read_text()))
    for meta in metas:
        seg_name = Path(meta['pdf']).name
        for p in meta['pages']:
            n = p['pdf_page']
            printed = p['printed_pages']
            for side, key in [('L', 'left'), ('R', 'right')]:
                info = p[key]
                con.execute('''INSERT INTO pages
                    (source_id,pdf_page,printed_page,side,ocr_file,ocr_langs,ocr_psm,ocr_chars,quality,pdf_file)
                    VALUES(?,?,?,?,?,?,?,?,?,?)''',
                    (SOURCE_ID, n, printed[0] if side == 'L' else printed[1], side, info['file'],
                     info['langs'], info['psm'], info['chars'], 'ocr_columns', seg_name))

    # ---- leçons
    lesson_ids = {}
    for no, title, sp, spn, ep, epn, comp, topics in LESSONS:
        note = None
        if no == 22:
            note = 'Leçon commencée à la fin de la partie 02 (§108, p. 89) ; suite attendue en partie 03. Titre partiellement illisible à l’OCR.'
        cur = con.execute('''INSERT INTO lessons
            (source_id,lesson_no,title_fr,topics,start_pdf_page,start_printed_page,end_pdf_page,end_printed_page,completeness,status,notes)
            VALUES(?,?,?,?,?,?,?,?,?,?,?)''',
            (SOURCE_ID, no, title, j(topics), sp, spn, ep, epn, comp, 'needs_review', note))
        lesson_ids[no] = cur.lastrowid
    # leçon 11 : commencée en partie 01, achevée ici
    row = con.execute('SELECT lesson_id FROM lessons WHERE source_id=? AND lesson_no=11', (PREV_SOURCE_ID,)).fetchone()
    if row is None:
        raise SystemExit('Leçon 11 de la partie 01 introuvable : ingérer la partie 01 d’abord.')
    lesson_ids[11] = row[0]
    con.execute('''UPDATE lessons SET completeness='complete', end_printed_page=41,
        notes='Leçon commencée en partie 01 (p. 39, §54) et achevée en partie 02 (p. 40-41, §54bis à 57bis). Données de la suite rattachées à la source partie-02.'
        WHERE lesson_id=?''', (lesson_ids[11],))

    # ---- sections
    for no, title, sp, spn, ep, epn, comp, topics in LESSONS:
        con.execute('''INSERT INTO lesson_sections
            (lesson_id,kind,paragraph_ref,title,pdf_page,printed_page,side,content_fr,status,notes)
            VALUES(?,?,?,?,?,?,?,?,?,?)''',
            (lesson_ids[no], 'grammar', None, title, sp, spn, 'L', title, 'needs_review',
             'Section repérée ; contenu détaillé dans grammar_rules/vocabulary. Source partie-02.'))
    con.execute('''INSERT INTO lesson_sections
        (lesson_id,kind,paragraph_ref,title,pdf_page,printed_page,side,content_fr,status,notes)
        VALUES(?,?,?,?,?,?,?,?,?,?)''',
        (lesson_ids[11], 'grammar', '54bis-57bis', 'L’impératif (suite de la leçon 11)', 1, 40, 'L',
         'Suite de la leçon 11 : version du texte 54, exercice de transposition au féminin, impératif (§56), thème (§57), exercice de conjugaison (§57bis).',
         'needs_review', 'Rattaché à la leçon 11 créée en partie 01 ; provenance partie-02, pages PDF 1, imprimées 40-41.'))

    # ---- vocabulaire (déduplication interne à la partie 02)
    # Une même forme reprise dans une leçon ultérieure = reprise pédagogique :
    # on garde une seule fiche et on trace les autres leçons en notes.
    # Les homonymes à sens distincts restent séparés (comme râh en partie 01).
    HOMONYMS = {'dres', 'sâb'}
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
    prev_forms = {r[0].strip().lower(): r[1] for r in con.execute(
        'SELECT form_latin, lesson_id FROM vocabulary WHERE source_id=?', (PREV_SOURCE_ID,))}
    for i, item in kept:
        lid = lesson_ids[item['lesson']]
        uid = f"tapiero-p02-l{item['lesson']:02d}-{slug(item['form'])}-{i:03d}"
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
        uid = f"tapiero-p02-rule-{item['par']}-{slug(item['title'])}"
        con.execute('''INSERT INTO grammar_rules
            (lesson_id,source_id,rule_uid,paragraph_ref,title,summary_fr,examples_json,pdf_page,printed_page,side,status,notes)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?)''',
            (lid, SOURCE_ID, uid, item['par'], item['title'], item['summary'], j(item['examples']),
             item['pdf'], item['printed'], item['side'], 'needs_review', item['notes']))

    # ---- exercices
    for item in E:
        lid = lesson_ids[item['lesson']]
        uid = f"tapiero-p02-ex-{item['par']}-{slug(item['prompt'][:40])}"
        con.execute('''INSERT INTO exercises
            (lesson_id,source_id,exercise_uid,kind,paragraph_ref,prompt_fr,items_json,pdf_page,printed_page,side,status)
            VALUES(?,?,?,?,?,?,?,?,?,?,?)''',
            (lid, SOURCE_ID, uid, item['kind'], item['par'], item['prompt'], j(item['items']),
             item['pdf'], item['printed'], item['side'], 'needs_review'))

    # ---- textes
    for lesson, par, title, pdf, printed, side, comp in T:
        lid = lesson_ids[lesson]
        uid = f"tapiero-p02-text-{par}"
        con.execute('''INSERT INTO study_texts
            (lesson_id,source_id,text_uid,paragraph_ref,title_latin,latin_text,ar_text,fr_translation,pdf_page,printed_page,side,status,notes)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)''',
            (lid, SOURCE_ID, uid, par, title, None, None, None, pdf, printed, side, 'needs_review',
             f'Texte {comp} ; transcription et traduction à produire et valider avant publication. OCR colonnes disponible en interne.'))

    # ---- tâches de relecture (périmètre partie 02 uniquement)
    def add_tasks(table, idcol, reason, priority):
        for row in con.execute(f'SELECT {idcol} FROM {table} WHERE source_id=?', (SOURCE_ID,)):
            con.execute('INSERT INTO review_tasks(object_type,object_id,reason,priority,status) VALUES(?,?,?,?,?)',
                        (table, row[0], reason, priority, 'open'))

    add_tasks('vocabulary', 'vocab_id', 'Validation native forme + sens + registre Tapiéro (partie 02)', 2)
    add_tasks('grammar_rules', 'rule_id', 'Validation native règle + exemples (partie 02)', 2)
    add_tasks('exercises', 'exercise_id', 'Validation consigne + corrigé à produire (partie 02)', 3)
    add_tasks('study_texts', 'text_id', 'Transcription/validation texte latin + arabe avant publication (partie 02)', 1)
    for no in [x[0] for x in LESSONS]:
        con.execute('INSERT INTO review_tasks(object_type,object_id,reason,priority,status) VALUES(?,?,?,?,?)',
                    ('lessons', lesson_ids[no], 'Validation pédagogique leçon (partie 02)', 3, 'open'))
    # reprises inter-parties à fusionner avant publication
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
                         f"Reprise pédagogique : forme déjà présente en partie 01 ; fusionner les fiches avant publication", 2, 'open'))

    con.execute('INSERT INTO processing_runs(part,step,finished_at,details_json) VALUES(?,?,datetime("now"),?)',
                (PART, 'ingestion_curated',
                 j(dict(segments=seginfos, sha256_combined=combined, vocab=len(kept),
                        vocab_dedup_removed=len(duplicates), rules=len(R), exercises=len(E),
                        texts=len(T), lessons_new=len(LESSONS), lesson_11_completed=True,
                        cross_part_reprises=len(reprises)))))
    con.commit()

    # ---- exports
    exp = ROOT / 'exports' / 'partie-02'
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
    dump('vocabulary', [dict(entry_uid=f"tapiero-p02-l{x['lesson']:02d}-{slug(x['form'])}-{i:03d}",
                             lesson_no=x['lesson'], form_latin=x['form'], form_ar=None, pos=x['pos'],
                             gender=x['gender'], plural=x['plural'], root=x['root'], gloss_fr=x['gloss'],
                             example_latin=x['ex'], example_fr=x['exfr'], pdf_page=x['pdf'],
                             printed_page=x['printed'], side=x['side'], paragraph_ref=x['par'],
                             status='needs_review', notes=x['notes']) for i, x in kept])
    dump('grammar_rules', [dict(rule_uid=f"tapiero-p02-rule-{x['par']}-{slug(x['title'])}",
                                lesson_no=x['lesson'], paragraph_ref=x['par'], title=x['title'],
                                summary_fr=x['summary'], examples=x['examples'], pdf_page=x['pdf'],
                                printed_page=x['printed'], side=x['side'], status='needs_review',
                                notes=x['notes']) for x in R])
    dump('exercises', [dict(exercise_uid=f"tapiero-p02-ex-{x['par']}-{slug(x['prompt'][:40])}",
                            lesson_no=x['lesson'], kind=x['kind'], paragraph_ref=x['par'],
                            prompt_fr=x['prompt'], items=x['items'], pdf_page=x['pdf'],
                            printed_page=x['printed'], side=x['side'], status='needs_review') for x in E])
    dump('study_texts_index', [dict(text_uid=f"tapiero-p02-text-{par}", lesson_no=lesson, paragraph_ref=par,
                                    title_latin=title, pdf_page=pdf, printed_page=printed, side=side,
                                    completeness=comp, status='needs_review', latin_text=None,
                                    ar_text=None, fr_translation=None) for lesson, par, title, pdf, printed, side, comp in T])
    counts = {t: con.execute(f'SELECT COUNT(*) FROM {t}').fetchone()[0]
              for t in ['sources', 'pages', 'lessons', 'lesson_sections', 'vocabulary',
                        'grammar_rules', 'exercises', 'study_texts', 'review_tasks']}
    per_source = {t: con.execute(f'SELECT COUNT(*) FROM {t} WHERE source_id=?', (SOURCE_ID,)).fetchone()[0]
                  for t in ['pages', 'lessons', 'vocabulary', 'grammar_rules', 'exercises', 'study_texts']}
    (exp / 'counts.json').write_text(json.dumps(dict(total=counts, partie_02=per_source,
                                                     vocab_dedup_removed=len(duplicates),
                                                     cross_part_reprises=len(reprises)),
                                                 ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(dict(total=counts, partie_02=per_source,
                          dedup_removed=duplicates, reprises=len(reprises)), ensure_ascii=False, indent=2))
    print('integrity', con.execute('PRAGMA integrity_check').fetchone()[0])
    print('fk', con.execute('PRAGMA foreign_key_check').fetchall())
    con.close()


if __name__ == '__main__':
    main()
