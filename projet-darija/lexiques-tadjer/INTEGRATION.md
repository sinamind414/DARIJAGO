# Intégration des Lexiques Tadjer (2010-2012) — 4ᵉ base du projet

**Date :** 15 novembre 2026
**Fichier reçu :** `dictionnaire-algerien-francais.pdf`
**Copie canonique :** `lexiques-tadjer/raw/lexiques-tadjer-2010-2012.pdf`
**SHA-256 :** `50cdfdbb79112119892e1beaba338a545f9a05a3b1e65e86cc8ddf156a51a79d`
**Taille :** 3 376 342 octets — 44 pages

---

## 1. C'est une vraie nouvelle source

Vérifié par SHA-256 contre les **3 bases existantes** : absent partout.
Ce n'est ni Ben Sedira 1910, ni Tapiéro 1971/1978, ni AZIRI 2012.

Malgré le nom du fichier, **ce n'est pas un dictionnaire classique** : c'est une
**compilation de 25 lexiques thématiques** publiés par **Saïd Tadjer Jr.** sur son
blog entre **2010 et 2012**, réunis dans un seul PDF (métadonnée interne :
`Djazayriyate.doc`, décembre 2012).

### Pourquoi cette source compte

| | |
|---|---|
| **Registre** | darija **moderne** (2010-2012), pas historique |
| **Translittération latine** | **fournie par l'auteur** — ce qui manquait dans les 3 autres bases |
| **Thèmes** | mécanique auto, médecine, cuisine, argot algérois, marine, plantes… |
| **Extraction** | **texte natif du PDF, aucun OCR** |

C'est la première source du projet à donner **à la fois** le français, la
translittération latine **et** l'arabe, sur du vocabulaire contemporain.

---

## 2. Résultat

```
Base créée              lexiques-tadjer/db/lexiques.sqlite
Entrées                 1 707
Variantes               2 230  (une entrée peut donner plusieurs mots)
Sections                22
Récits complets         2      (contes, stockés à part, non découpés en fiches)
Avec latin              1 639  (96,0 %)
Avec arabe              1 356  (79,4 %)
Tâches de revue         1 707
Statut                  100 % needs_review, 0 app_ready
Integrity check         ok
Taille                  1 290 240 octets
MD5                     56af53fd898548ebfeac0b03dbe95013
```

### Contenu par section

| Section | Entrées | Pages PDF |
|---|---|---|
| Noms courants | 297 | 5–8 |
| Termes médicaux | 266 | 9–13 |
| Verbes les plus courants | 229 | 2–4 |
| Plantes | 116 | 19–21 |
| Lexique algérois « Belda » | 105 | 35–37 |
| Adjectifs et qualités | 73 | 4–5 |
| Corps humain | 65 | 13–14 |
| القاموس الهدّار | 60 | 34–35 |
| Épices, herbes & condiments | 53 | 15–16 |
| Kouzina — ustensiles de cuisine | 53 | 17–18 |
| Moteur Mercedes M130 + pièces mécaniques | 50 | 31–32 |
| Expressions usuelles | 49 | 38 |
| Hôtel - Camping | 48 | 27–28 |
| À la montagne | 40 | 26 |
| La terre | 37 | 25 |
| Lexique pratique de la cuisine | 35 | 16 |
| Marine | 34 | 29–31 |
| Ħchảwech w εchàcheb | 26 | 21–24 |
| Adjectifs possessifs | 23 | 8–9 |
| Vélo électrique | 23 | 33 |
| Monnaie d'hier et d'aujourd'hui | 19 | 40–41 |
| Lézards d'Algérie | 6 | 39 |

**Contrôle de complétude :** toutes les listes numérotées sont extraites à
**100 %, aucun numéro manquant** — verbes 1→229, noms 1→297, médecine 1→266,
adjectifs 1→73, plantes 1→116, épices 1→53, mécanique 1→50.

> **Écart constaté dans la source :** le titre annonce « 273 verbes », la liste
> réelle s'arrête à **229**. Ce n'est pas une perte d'extraction (aucun numéro
> manquant entre 1 et 229) : la compilation est incomplète par rapport à son
> titre. Les 44 verbes annoncés en plus ne sont pas dans ce PDF.

---

## 3. Les cinq difficultés techniques réelles

Le PDF a un calque texte, mais il est **mal ordonné**. Cinq problèmes ont dû être
résolus, chacun vérifié sur les données :

### 3.1 Deux colonnes
612 × 792 pt, coupure à x = 300. Lecture colonne par colonne, jamais ligne à
travers la page.

### 3.2 L'arabe sortait à l'envers
Les spans sont triés par x croissant (ordre **visuel**). L'arabe se lit
droite→gauche : l'ordre **logique** est l'inverse. `lahb el bul` ressortait en
`الب + لهب` au lieu de `لهب + الب`.

Correction : regroupement des spans en *runs* de même écriture, inversion des
runs arabes. Les spans purement blancs sont **neutres** — sinon ils cassaient
les groupes et chaque mot arabe restait isolé, donc à l'envers.

### 3.3 Le numéro passait après le texte
Le numéro d'entrée et son libellé sont dans **deux blocs séparés**, à des y
différents de 0,8 pt. Trier par y puis x plaçait parfois `5.` **après**
`adorer = …`, et l'entrée n'était pas reconnue.

Correction : regroupement par **bande y** (tolérance 4 pt), puis tri par x à
l'intérieur de la bande. Gain immédiat : +56 entrées récupérées.

### 3.4 Numéros en police 12 et numéros sans point
14 entrées médicales avaient leur numéro en **Times New Roman 12** (filtré comme
titre) ; la liste mécanique utilise `34 pipe d'admission` **sans point**.
Les deux cas sont maintenant gérés. Médecine est passée de 252 à **266/266**.

### 3.5 Formes de présentation arabes
**8 722 caractères** en U+FE70–FEFF (formes liées). Normalisation **NFKC** —
transformation déterministe, pas une invention. Le **tatweel** (U+0640,
allongement typographique) est retiré de la forme normalisée ; la forme brute
est conservée dans `variants.ar_raw`.

---

## 4. Limite importante : l'arabe de la source est imparfait

Ce point est à connaître avant tout usage.

Le calque texte du PDF **perd des lettres arabes**. Exemple vérifié caractère par
caractère, page 10, entrée « brucellose » :

- attendu : `مرض الحليب`
- caractères réellement présents dans le PDF : `م ـ ـ ر ض ل ح ل ي ـ ـ ب`
- **l'alef de « الحليب » est absent du fichier**, pas de l'extraction

Résultat obtenu : `مرضالحليب` → `مرضلحليب`. L'ordre des mots est correct, mais
la lettre manquante ne peut pas être retrouvée par lecture du texte : elle est
dans l'image, pas dans le calque.

**Conséquence :** les **1 356 formes arabes** portent le signalement
`arabe_source_a_verifier`. Elles sont exploitables comme aide, **pas** comme
texte de référence.

**En revanche la translittération latine est fiable** (1 639 entrées) : c'est
l'apport principal de cette source, et c'est ce qui manquait au projet.

---

## 5. Chaîne de qualité

| Signalement | Nombre |
|---|---|
`arabe_source_a_verifier` | 1 356 |
`continuation_a_verifier` | 300 |
`sans_arabe` (latin seul, normal) | 313 |
`aucune_variante` | 38 |
`sans_latin` | 30 |
`terme_fr_manquant` | 10 |

**1 707 tâches de revue** créées, une par fiche. Aucune fiche n'est `app_ready`.

Champs laissés **NULL** volontairement : pas de région, pas de niveau de
registre, pas d'exemple inventé, pas de forme arabe reconstituée.

---

## 6. Place dans le projet

| Base | Source | Registre | Apport |
|---|---|---|---|
| `dictionnaire.sqlite` | Ben Sedira **1910** | historique | les mots (9 622) |
| `manuel.sqlite` | Tapiéro **1971/1978** | pédagogique | la grammaire (850 fiches, 30 leçons) |
| `locutions.sqlite` | AZIRI **2012** | patrimonial | les tournures (7 123) |
| **`lexiques.sqlite`** | **Tadjer 2010-2012** | **moderne** | **le vocabulaire contemporain + latin (1 707)** |

**Ordre de consultation recommandé pour l'application :**
1. **Tadjer** pour un mot moderne du quotidien, avec sa translittération ;
2. **AZIRI** pour une tournure idiomatique ;
3. **Tapiéro** pour la construction grammaticale ;
4. **Ben Sedira** en dernier : registre historique, à moderniser.

Ne jamais mélanger les registres dans une même sortie sans le signaler.

---

## 7. Traçabilité, droits, reproductibilité

### Provenance
Chaque fiche porte : `pdf_page`, `column` (L/R), `entry_no`, `section_id`.
Citation : *Tadjer, Lexiques algériens (2010-2012), section \<section\>, p. \<page PDF\>, entrée \<n°\>*.

### Droits
Compilation d'un **auteur identifié**, publiée sur son blog. **Non libre de
droits par défaut.** Usage interne et recherche ; toute publication dans
DARIJAGO nécessite **l'accord de Saïd Tadjer Jr.** ou une réécriture originale.
Contrairement aux trois autres sources, ici l'auteur est vivant et joignable :
**une demande d'autorisation est réaliste**. Mention inscrite dans
`sources.rights_note`.

### Idempotence
Deux exécutions : run 1 = 1 707 entrées / 2 230 variantes ; run 2 = **0 / 0**.
FTS5 reconstruite par `rebuild`, jamais par `DELETE` (leçon de la base AZIRI).

### Scripts
| Fichier | Rôle |
|---|---|
| `scripts/extraire_lexiques.py` | extraction v10.0.0 (bidi, colonnes, sections) |
| `scripts/ingerer_lexiques.py` | ingestion idempotente + FTS5 |

Données intermédiaires : `text/lexiques-extrait.jsonl` (1 707 lignes),
`text/extraction-stats.json`, `text/recits.json`.

---

## 8. Prochaine étape utile

Le lot le plus rentable pour l'application, dans l'ordre :

1. **Expressions usuelles (49) + verbes (229)** → base d'un MVP conversationnel.
   Le latin est fiable, l'arabe est à reprendre.
2. **Noms courants (297)** → vocabulaire de survie quotidien.
3. **Argot algérois (165)** → différenciant fort, mais à valider par un natif
   d'Alger : registre très localisé, et certains termes sont datés ou crus.

Chaîne obligatoire : `needs_review → corrected → native_validated → app_ready`.

**Tant que ce n'est pas fait, aucune de ces fiches ne doit apparaître dans
l'application.**
