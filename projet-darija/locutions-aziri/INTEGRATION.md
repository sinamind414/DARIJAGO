# Rapport d'intégration — Locutions AZIRI 2012

**Date :** 15 novembre 2026
**Fichier reçu :** `445733267-Dictionnaire-des-locutions-de-l-arabe-dialectal-algerien.pdf` (1 634 686 octets)

## 1. Vérifications préalables

| Contrôle | Résultat |
|---|---|
| SHA-256 | `5f1f792254f47397696ecafee8af5a2702a4c6cec024692140bdeda313799da7` |
| Déjà présent dans `dictionnaire.sqlite` (10 sources) ? | **Non** |
| Déjà présent dans `manuel.sqlite` (5 sources) ? | **Non** |
| Conclusion | Nouveau fichier, aucune réingestion |

## 2. Découverte déterminante

**Le PDF est en texte sélectionnable, pas scanné.** Producteur : Adobe PDF Library 10.0.1, créé le 17/07/2013. 415 483 caractères extractibles sur 492 pages.

Conséquence : **aucun OCR n'a été nécessaire.** C'est la première source du projet dans ce cas. Les deux précédentes (Ben Sedira 1910, Tapiéro) sont des scans dont l'OCR arabe est inutilisable — ici, l'arabe vocalisé est natif et exact.

## 3. Méthode d'extraction

La structure du document est portée par les **polices de caractères**, ce qui permet un parsing fiable sans heuristique fragile :

| Police | Taille | Position | Rôle |
|---|---|---|---|
| Andalus | 72 | centré | Lettre-section (ا, ب, …) |
| TraditionalArabic-Bold | 18 | centré (x≈224) | **Racine** (vedette) |
| TraditionalArabic-Bold | 18 | gauche (x≈71) | **Locution** |
| TraditionalArabic | 18 | dans le flux | Arabe cité dans une glose |
| TimesNewRomanPS* | 12 | dans le flux | **Glose française** |

Périmètre traité : pages 11 à 484 (le dictionnaire). Écartés : avant-propos et introduction (p. 1-10), bibliographie (p. 485-487), pages blanches (p. 488-492). 14 pages vides détectées et ignorées.

## 4. Résultats

| Métrique | Valeur |
|---|---|
| Locutions extraites | **7 123** |
| Racines | **2 248** |
| Pages traitées | 462 |
| Avec glose française | 7 073 (**99,3 %**) |
| Doublons fusionnés | 37 |
| Entrées sans aucun signalement | 7 014 (**98,5 %**) |
| Tâches de revue créées | 7 126 |
| Dont priorité haute | 110 |
| Taille de la base | 4 603 904 octets |

## 5. Anomalies — signalées, jamais corrigées en silence

| Signalement | Nombre | Décision |
|---|---|---|
| `ligature_lam_alef_a_verifier` | 60 | Le PDF encode mal la ligature lam-alef (`األجل` pour `الأجل`). Forme d'origine **conservée**, tâche haute priorité. Pas de correction automatique : elle aurait pu altérer des formes correctes. |
| `glose_absente_ou_trop_courte` | 50 | Glose à compléter depuis la page source. |
| `glose_separee_du_champ_arabe` | 2 | Du français avait bavé dans le champ arabe ; séparé automatiquement, marqué à vérifier. |

Après traitement : **0 locution ne contient de caractère latin parasite.**

## 6. Idempotence — vérifiée

| Passage | Entrées avant | Insérées | Ignorées | Entrées après |
|---|---|---|---|---|
| 1 | 0 | 7 123 | 0 | 7 123 |
| 2 | 7 123 | **0** | 7 123 | 7 123 |

`PRAGMA integrity_check` → `ok`. Index FTS5 reconstruit à chaque passage (`rebuild`), jamais dupliqué.

## 7. Tests de recherche réels

| Requête | Résultat obtenu |
|---|---|
| FTS `refusé` | مَا بَا شِي → « il a refusé » (p. 11) |
| FTS `argent` | بَحَّرْ درَاهْمُه → « il a perdu son argent, celui qui jette son argent à la mer » (p. 22) |
| FTS `قلب` | فصَد علَى قَلبْ فالَن → « deviner ce que quelqu'un a dans le cœur » (p. 343) |

Racines les plus fournies : راح (53 locutions), صح (35), حال (33), عان (33), قطع (33), طرق (31), ضرب (30), طيح (27).

## 8. Ce qui n'a PAS été fait — volontairement

- **Aucune translittération latine générée.** `translit_latin` est vide sur les 7 123 entrées. La produire automatiquement puis la présenter comme issue du livre serait malhonnête.
- **Aucun sens, exemple ou note d'usage inventé.** Les champs `region`, `register_modern`, `usage_note` sont vides.
- **Aucune entrée marquée validée.** Les 7 123 sont `needs_review`, aucune `app_ready`.
- **Aucune correction silencieuse de l'arabe.**

## 9. Traçabilité

Chaque entrée porte : fichier source + SHA-256, `pdf_page`, `printed_page`, `root_ar`, `letter_section`, `parser_version`, `extraction_flags`, `status`. La chaîne de revue est `needs_review → corrected → native_validated → app_ready`.

## 10. Droits et registre

- **Droits :** œuvre sous droit, Éditions ANEP 2012. Usage interne/recherche. Publication dans une app soumise à licence. Mention stockée en base.
- **Registre :** patrimonial. L'auteur écrit lui-même qu'il décrit « l'arabe parlé par nos aïeux ». Ne pas présenter comme darija moderne sans validation entrée par entrée.

## 11. Fichiers livrés

```
locutions-aziri/
├── README.md                        mode d'emploi complet
├── INTEGRATION.md                   ce rapport
├── raw/locutions-aziri-2012.pdf     PDF canonique (1,6 Mo)
├── db/locutions.sqlite              base (4,6 Mo)
├── scripts/extraire_locutions.py    extraction idempotente
├── scripts/ingerer_locutions.py     ingestion idempotente
└── text/
    ├── locutions-extrait.jsonl      7 123 entrées brutes
    ├── extraction-stats.json        compteurs
    └── pages/p011.txt … p484.txt    texte par page (preuve)
```

Skill mis à jour : `skills/darija-algerienne/SKILL.md` **v1.7.0 → v1.8.0**, avec les règles d'usage de la base et la répartition des rôles entre les trois sources.

## 12. Apport au projet

| Base | Rôle | Force | Faiblesse |
|---|---|---|---|
| Ben Sedira 1910 | Les **mots** (9 622 entrées FR→DZ) | Volume | OCR bruité, 0 sens structuré |
| Tapiéro 1971/2002 | La **grammaire** (850 vocab, 86 règles, 30 leçons) | Structure pédagogique | OCR, 0 forme arabe |
| **AZIRI 2012** | **Les tournures** (7 123 locutions AR→FR) | **Sans OCR, arabe vocalisé, expressions idiomatiques** | Pas de latin, registre patrimonial |

C'est la pièce qui manquait : pour qu'un agent écrive « il a perdu son argent » comme **« بَحَّرْ درَاهْمُه »** (littéralement « il a jeté son argent à la mer ») au lieu d'un mot-à-mot. Pour un usage publicitaire, c'est exactement le niveau de langue recherché.

**Prochaine étape recommandée :** faire valider par un locuteur natif un noyau de 300 à 500 locutions fréquentes, en renseignant `register_modern` (encore vivant / vieilli) et `translit_latin`. C'est ce noyau, et non les 7 123 entrées, qui deviendra utilisable en production.
