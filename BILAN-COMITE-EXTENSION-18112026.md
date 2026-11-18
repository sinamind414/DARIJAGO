# Extension du comité natif aux nouveaux scénarios (18/11/2026)

Suite du chantier scénarios : le lecteur :3920 ne couvrait que les 73 items initiaux.

## Livré

### 1. Extraction régénérée
`npx tsx scripts/extraire-items-validation.ts` → `items-a-valider.json`
- **97 items** : 42 phrases · **40 dialogues** · 15 exemples de grammaire
- (avant : 73 items / 16 dialogues)

### 2. Base du comité mise à jour
`python comite-natif/init-db.py`
- **97 items** chargés, tous `needs_review`
- **4 relecteurs** (1 par région : Alger, Oran, Constantine, Sud)

### 3. Correction d'idempotence (bug trouvé)
Le script recréait les 4 relecteurs à chaque exécution → 8 relecteurs (2 par région).
Corrigé : un seul relecteur par région, stable. Vérifié sur 2 exécutions consécutives :
`4 relecteurs / 97 items` à chaque fois ✅

## Vérification réelle
- API `/api/items` : 97 items, 40 dialogues ✅
- Nouveaux scénarios présents : `dialogue-belle-famille-repas-*`, `dialogue-condoleances-*`, etc. ✅
- Navigateur : filtre « Dialogues » → 40 boutons, including « Repas chez la belle-famille » ✅

## État
Le comité natif couvre désormais **tout le contenu dialogué de l'app** (10 scénarios).
Il reste à brancher de vrais relecteurs et à archiver les consentements écrits (action humaine).
