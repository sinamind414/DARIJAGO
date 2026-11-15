# Nettoyage workspace — demande utilisateur

## Résultat

- Workspace avant : environ **133 Mo**, 1 113 fichiers.
- Workspace après : environ **79 Mo**, 1 069 fichiers.
- Fichiers supprimés : **46**.
- Espace libéré : **56 311 959 octets**, soit environ **53,7 Mo**.
- Erreurs : aucune.

## Supprimé

1. Archives ZIP redondantes :
   - `dictionnaire-livre-partie-10.zip`
   - `manuel-arabe-algerien-partie-01.zip`
2. Exports intermédiaires du dictionnaire par partie :
   - `partie-*-entries-brutes.json`
   - `partie-*-entries-brutes.csv`
   - `partie-*-echantillon-app.json`
   - `partie-*-apercu.md`
3. Doublons exacts des exports tunisiens bruts, identiques aux exports actifs.
4. Caches Python éventuels.

## Conservé

- PDF sources canoniques : `dictionnaire-livre/raw/` et `manuel-arabe-algerien/raw/`.
- Bases SQLite : `dictionnaire.sqlite` et `manuel.sqlite`.
- Textes OCR utiles.
- Scripts réutilisables.
- Rapports et reviews.
- Exports masters du dictionnaire :
  - `dictionnaire-master-brut.json/csv`
  - `dictionnaire-master-actif.json/csv`
  - `dictionnaire-supplement-tunis-actif.json/csv`
- Exports structurés du manuel partie 01.
- Backups de sécurité récents :
  - `dictionnaire-avant-partie-10.sqlite`
  - `manuel-apres-partie-01.sqlite`
- Skill darija et références agent.

## Vérifications

- `PRAGMA integrity_check` : ok pour les deux bases.
- `PRAGMA foreign_key_check` : vide pour les deux bases.
- Les données supprimées restent régénérables depuis les bases SQLite et les dossiers sources.

## Script répétable

```bash
python /home/user/projet-darija/nettoyer_workspace.py --dry-run
python /home/user/projet-darija/nettoyer_workspace.py
```
