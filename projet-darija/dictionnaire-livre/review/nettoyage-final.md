# Nettoyage final — vérification complète du workspace

Date : 2026-11-14
Périmètre : `/home/user` (projet darija + analyses closes)

## Résumé

Le workspace avait déjà été nettoyé à la fin de la partie 10 (64 fichiers, 72,5 Mo supprimés). Cette passe de contrôle a trouvé peu de déchets supplémentaires, mais a permis de compacter la base, réparer une incohérence et rafraîchir les archives.

| Action | Détail | Gain |
|---|---|---:|
| Script de nettoyage conservateur | 0 fichier restant à supprimer (déjà propre) | 0 o |
| Compactage SQLite (`VACUUM`) | 9 117 696 → 7 852 032 octets | 1 265 664 o |
| Suppression dumps API bruts VoiceStudio | `upstream/tree.json`, `upstream/latest-release.json` (analyse close, re-téléchargeables) | 1 618 816 o |
| Archives reconstruites | zip projet + zip skill régénérés après compactage | 26 708 o |
| Réexport OCR manquant (réparation) | 180 fichiers `.txt` régénérés depuis la base pour les parties 02 et 03 | −215 014 o |

**Gain net : environ 2,6 Mo.** Espace total du workspace : **110,7 Mo** (contre 116 Mo avant).

## Réparation effectuée

Les textes OCR des parties **02** et **03** n'existaient que dans la base SQLite, pas sur disque (180 pages). Ils ont été réexportés depuis `pages.ocr_text` vers `ocr/partie-02/` et `ocr/partie-03/`. Aucune donnée n'avait été perdue.

Résultat : les **864 pages** de la base ont désormais leur fichier `.txt` correspondant.

## Vérifications après nettoyage

| Contrôle | Résultat |
|---|---|
| `PRAGMA integrity_check` | ok |
| `PRAGMA foreign_key_check` | aucune erreur |
| Sources PDF | 10 |
| SHA256 des 10 PDF canoniques vs base | tous concordants |
| Pages | 864 |
| Entrées totales | 9622 |
| Entrées algériennes actives | 8819 |
| Supplément tunisien séparé | 400 |
| Règles skill | 72 |
| Recherche plein texte FTS | fonctionnelle |
| Entrées `app_ready` | 0 (normal, validation native à faire) |
| Archive projet | 973 fichiers, test d'intégrité ok |
| Archive skill | 8 fichiers, test d'intégrité ok |
| Fichiers OCR orphelins | 0 |
| Pages sans fichier OCR | 0 |
| PDF uploadés en double | 0 (dossier `uploads` vide) |
| Caches Python / node_modules | 0 |
| Dossiers vides | 0 |

## Conservé volontairement

- `raw/partie-01.pdf` → `raw/partie-10.pdf` : sources canoniques, vérifiées par SHA256.
- `db/dictionnaire.sqlite` : base de travail complète.
- `backups/dictionnaire-avant-partie-10.sqlite` : backup de sécurité le plus récent.
- `ocr/partie-01` → `ocr/partie-10` : 864 textes OCR, traçabilité page par page.
- `exports/` : exports par partie, masters, supplément tunisien, échantillons app, aperçus.
- `review/` : rapports de curation des 10 parties + bilan final + rapports de nettoyage.
- `scripts/` : les 6 scripts du pipeline réutilisable.
- `skills/darija-algerienne/` + `agent-darija/` : skill et références agent.
- `analyse-app/`, `analyse-rea/`, `analyse-voicestudio/Bilan-VoiceStudio-Darija.md` : analyses livrées.
- `dictionnaire-livre-partie-10.zip` : archive consolidée unique.

## Doublons restants, assumés

Les trois exports du supplément tunisien sont identiques aujourd'hui :

```text
exports/partie-10-supplement-tunis-entries-brutes.{json,csv}
exports/dictionnaire-supplement-tunis-brut.{json,csv}
exports/dictionnaire-supplement-tunis-actif.{json,csv}
```

Ils sont conservés car ils ont des rôles distincts (export par partie / master brut / master actif) et divergeront dès que la curation du supplément tunisien commencera. Volume négligeable : environ 435 Ko.

## Archives à jour

```text
projet-darija/dictionnaire-livre-partie-10.zip   38 900 515 octets   973 fichiers
projet-darija/skills/darija-algerienne-skill.zip     15 315 octets     8 fichiers
```

## Commande pour relancer le nettoyage

```bash
cd projet-darija/dictionnaire-livre
python scripts/nettoyer_fichiers.py \
  --root . \
  --uploads /home/user/uploads \
  --project /home/user/projet-darija \
  --latest-zip /home/user/projet-darija/dictionnaire-livre-partie-10.zip
```

Ajouter `--dry-run` pour voir la liste sans rien supprimer.

## État

Workspace propre, base intègre, archives à jour. Prêt pour la phase suivante : validation native des entrées.
