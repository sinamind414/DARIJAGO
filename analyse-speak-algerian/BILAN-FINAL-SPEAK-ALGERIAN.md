# Analyse de speak-algerian.com — et bilan final DZLingo / Speak Algerian / DARIJAGO

**Date de l'analyse :** 15 novembre 2026
**Cible :** https://www.speak-algerian.com/
**Méthode :** lecture des pages publiques, inspection du bundle JavaScript et de sa source map publique, interrogation **en lecture seule** de l'API publique, tests navigateur (Chromium mobile + desktop), audit d'accessibilité axe-core, recherche web (réseaux sociaux, boutique,mentions légales).
**Périmètre :** aucune donnée du site n'a été créée, modifiée ou supprimée. Aucun compte payant n'a été souscrit. Les tests d'écriture ont été faits uniquement avec des charges invalides ou des identifiants inexistants.

---

## 1. Verdict en une phrase

**Speak Algerian n'est pas une application : c'est le produit d'appel d'une professeure de darija qui vend déjà des cours vidéo à 280 £.** Le site est techniquement fragile et commercialement sous-exploité, mais il est adossé à la plus grosse audience communautaire des trois acteurs comparés. C'est un concurrent **marketing**, pas un concurrent **produit**.

---

## 2. Identité et modèle économique

| Élément | Constat |
|---|---|
| Marque | Speak Algerian |
| Fondatrice | Jamilah, professeure de derja en ligne depuis 2022 |
| Dialecte | **Alger uniquement** (« Learn the Algiers dialect ») |
| Langue du produit | **Anglais seulement** |
| Contact | speakalgerian.contact@gmail.com (aucune adresse postale, aucun numéro d'entreprise) |
| Droit applicable | Angleterre et Pays de Galles (CGU §12) |
| CGU / confidentialité | Datées du **27 novembre 2024**, non mises à jour depuis |
| Fabrication | Badge « Made with Emergent » — app générée sur **emergent.sh** (builder IA no-code) |
| Hébergement | Cloudflare + `dzspeak.emergent.host` (plateforme Emergent) |

**Le point clé à comprendre :** le site web à 9,99 £/mois n'est pas le business. Le business est sur `stan.store/speakalgerian` :

| Produit | Prix |
|---|---|
| From Silent to Speaking (cours vidéo 8 h) | 97,99 £ |
| Intensive Video Course 1.0 | 219,99 £ |
| Intensive Video Course 2.0 | 159,99 £ |
| Ultimate Package (35 h +) | 279,99 £ (barré 379,99 £) |
| Complete Collection (5 PDF) | 99,99 £ |
| Pack débutant 2-en-1 | 49,98 £ |
| PDF à l'unité | 9,99 £ à 24,99 £ |
| Cours particuliers 1:1 | sur demande |
| Guide de démarrage | gratuit (capture d'e-mail) |

L'application web sert à **retenir l'audience entre deux achats de cours** et à justifier l'écosystème. C'est une stratégie « créateur → audience → produits », inverse de la stratégie « produit → acquisition payante » de DZLingo.

---

## 3. Contenu réel (mesuré, pas déclaré)

L'API publique `/api/vocabulary` expose l'intégralité du catalogue. Voici ce qu'il contient réellement :

| Métrique | Valeur mesurée |
|---|---|
| Entrées | **386** |
| Catégories | **14** |
| Audio présent | **385 / 386** (99,7 %) |
| Script arabe | 386 / 386 |
| Prononciation latine | 386 / 386 |
| Phrase d'exemple | **175 / 386** (45 %) — 211 manquantes |
| Type de mot renseigné | 60 / 386 (16 %) |
| Niveau | 283 débutant, 103 intermédiaire, **0 avancé** |
| Doublons de vedette | 1 (« romania » ×2) |
| Traductions anglaises identiques | 16 |
| Dernière entrée créée | **21 février 2026** |
| Dernière modification | **21 février 2026** |

Répartition : Numbers 101, Daily Life 92, Food 51, Countries 36, Family 19, Introducing 17, Greetings 16, Special Occasions 16, Emotions 12, Days of the week 7, Question words 7, Ramadan 6, Prepositions 4, **Adjectives 2**.

### Écarts entre le discours et les données

| Affiché sur le site | Réalité mesurée |
|---|---|
| « 1000+ Vocabulary Words » (accueil) | **386** |
| « All 250+ vocabulary words » (offre Stripe) | 386 (l'offre est plus pessimiste que l'accueil) |
| « New vocab added weekly » | **aucune entrée depuis le 21/02/2026**, soit ~9 mois |
| « Join thousands of learners » | « 500+ Active Learners » sur la même page |
| « 95% Success Rate » | 92,6 % mesuré sur 13 869 tentatives cumulées |
| « All 5 interactive games » (offre Stripe) | **6 jeux** dans le code |

### Ce qui est réellement bon

- **L'audio est natif et réel.** 385 fichiers MP3 hébergés sur Cloudinary (128 kbps, 48 kHz, mono, ~2 s), enregistrés par la professeure. C'est un vrai actif, difficile à copier, et supérieur à du TTS.
- **Un module de grammaire ciblé et utile** : les possessifs, en 2 leçons (terminaisons directes `-i / -na / -ek / -koum / -ou / -ha / -houm`, puis forme indirecte `diyal / ta3`). C'est le seul point de grammaire traité, mais il est bien fait.
- **6 jeux** : Flashcards, QCM, Texte à trous, Memory Match / Speed Match, Prononciation, Jeu des possessifs.
- **Suivi de progression** : série de jours (streak), 4 succès, statistiques hebdomadaires, taux de réussite par catégorie.
- **Un mécanisme d'engagement malin** : « 7-Day Streak Competition » — 7 jours d'affilée = tirage au sort pour gagner le pack vidéo + tous les PDF. Ça pousse l'usage quotidien **et** ça fait la promotion des produits payants chers.

### Ce qui manque

- Aucune conjugaison (annoncée comme « future feature » dans l'offre Stripe).
- Aucun dialogue, aucune situation de conversation, aucune histoire.
- Pas de reconnaissance vocale : la « prononciation » est une **auto-notation de 1 à 5 étoiles**, pas une évaluation.
- Repli TTS navigateur (`speechSynthesis`) quand l'audio manque, avec sélection de voix arabe → sinon française → sinon anglaise. Qualité non maîtrisée.
- Pas de répétition espacée algorithmique : les flashcards font un « tas de mots à revoir » dans la session, sans planification dans le temps.
- Aucune notion de région, de registre, ni de source linguistique.

---

## 4. Prix et conversion

| | Speak Algerian |
|---|---|
| Offre unique | **9,99 £ / mois** (~11,95 €) |
| Annuel | **néant** |
| À vie | **néant** |
| Essai gratuit | **néant** |
| Version gratuite | **néant** — tout le contenu est derrière le paywall |
| Promo | `OPENING50` : −50 % le 1er mois |
| Autres | remise étudiante récurrente, accès gratuit à vie offert manuellement par l'admin |
| Paiement | Stripe |
| Remboursement | **aucun** (CGU §4.2) |

**C'est le point faible commercial majeur.** Aucun visiteur ne peut essayer quoi que ce soit : `/vocabulary`, `/games`, `/progress` redirigent tous vers la connexion, puis vers « Subscription Required ». Le tunnel est : réseau social → site → inscription → paiement, sans aucune étape d'essai. Sur un marché où DZLingo offre 6 leçons + 3 leçons de grammaire + 7 situations gratuitement, c'est un handicap de conversion net.

Annualisé : 119,88 £ ≈ **143 €/an**, contre **59,99 €/an** chez DZLingo. Speak Algerian est **2,4× plus cher** pour 386 mots contre ~2 971.

---

## 5. Audience et traction

| Canal | Mesure |
|---|---|
| Instagram @speakalgerian | **33 726 abonnés**, 154 suivis |
| TikTok @speakalgerian | **21,2 K abonnés**, 176,1 K likes |
| YouTube @speakalgerian | **4,38 K abonnés**, 44 vidéos, 158 944 vues, chaîne créée le 23/05/2022 |
| Apprenants déclarés | 500+ actifs |
| Usage cumulé mesuré | 13 869 tentatives de quiz, 0 mot jamais étudié |
| Boutique | Stan Store (cours, PDF, 1:1) |

**Comparaison d'audience :** Instagram 33,7 K contre 2,2 K pour DZLingo, soit **15× plus**. Un post Instagram de juillet 2024 affiche 1 370 649 vues. C'est l'actif le plus solide de Speak Algerian, et de loin.

**Positionnement d'audience très clair et différent de DZLingo :** elle cible les **diaspora anglophone** — conjoints d'Algériens, enfants de la diaspora, personnes « nées à l'étranger ». Elle a même une série **Speak Algerian Kids** sur YouTube (épisodes de 6 à 25 min, 3 K à 11 K vues). DZLingo cible la **diaspora francophone**. Les deux ne se battent pas sur le même public.

**Aucun avis indépendant trouvé** (Trustpilot, Reddit, app stores) : pas d'app mobile, donc pas de notes ; pas de fiche Trustpilot. Seule trace communautaire : des recommandations organiques sur r/algeria (« There is a TikTok creator who specifically teaches Derja from Algiers… She is called Jamilah Speak Algerian »).

---

## 6. Technique et SEO

### Stack

- Front : React (Create React App), Tailwind, shadcn/ui, Radix, lucide-react, axios, react-router.
- Back : FastAPI + MongoDB Atlas (déclaré dans la politique de confidentialité).
- Auth : JWT maison + Google OAuth via `auth.emergentagent.com`.
- Audio : Cloudinary. Paiement : Stripe.
- Généré et hébergé par **Emergent.sh** (abonnement ~20 $/mois + 50 crédits/mois pour garder une app déployée).

### SEO : quasi inexistant

| Test | Résultat |
|---|---|
| `<title>` | **« Emergent | Fullstack App »** (jamais personnalisé) |
| `<meta description>` | **« A product of emergent.sh »** |
| `robots.txt` | inexistant (renvoie le HTML de l'app) |
| `sitemap.xml` | inexistant (renvoie le HTML de l'app) |
| Rendu | 100 % client (SPA) : aucun contenu indexable |
| `<h1>` sur l'accueil | **absent** (le titre est une image) |
| `lang` | `en` |
| Recherche `site:speak-algerian.com` | **0 résultat** |
| Pages publiques indexables | 0 contenu pédagogique |

**Conclusion SEO : le site est invisible sur Google.** Toute l'acquisition vient des réseaux sociaux. C'est exactement l'inverse du pari de DZLingo (119 pages publiques, 1 162 URLs de mots). Aucun des deux n'a une stratégie SEO complète, mais DZLingo a au moins une surface indexable.

### Performance

- Bundle JS : **671 Ko** non compressé, en un seul fichier, pas de code splitting.
- CSS : 76 Ko.
- Chargement mesuré (networkidle) : 1,1 à 2,5 s. Correct.
- **Pas de PWA** : ni `manifest.json`, ni service worker → pas d'installation, pas d'offline.
- **Pas d'app mobile** iOS ou Android.

### Accessibilité (axe-core, WCAG 2.1 AA, mobile)

Sur l'accueil, `/pricing` et `/login`, **3 violations récurrentes** :
- `image-alt` (critique) — le logo/badge sans texte alternatif ;
- `button-name` (critique) — bouton sans nom accessible ;
- `color-contrast` (sérieux).

Peu de violations, mais ce sont des critiques faciles à corriger.

---

## 7. Sécurité et conformité — constats sérieux

> Ces constats sont rapportés à titre d'analyse concurrentielle et défensive. **Aucune exploitation n'a été réalisée.** Ils ne doivent pas être reproduits sur DARIJAGO.

| # | Constat | Gravité |
|---|---|---|
| 1 | **Le catalogue payant est lisible sans authentification.** `GET /api/vocabulary` renvoie les 386 entrées **avec les URLs audio**, sans jeton. Le paywall n'est appliqué que côté navigateur (`ProtectedRoute.jsx`). | **Critique** — le produit payant est téléchargeable gratuitement |
| 2 | **Les routes d'écriture du vocabulaire ne renvoient pas 401.** `POST`, `PUT`, `DELETE` sur `/api/vocabulary` répondent par des erreurs de validation (422 / 400 / 404) et non par une erreur d'authentification, ce qui indique que le handler s'exécute sans contrôle d'accès. Testé uniquement avec charges invalides / identifiants inexistants. | **Critique** |
| 3 | Une route `POST /api/admin/reset-vocabulary` existe et est appelée par le front **sans en-tête d'autorisation**. Non testée (destructive). | **Élevée, à vérifier** |
| 4 | **Source map publique** : `main.c81e7dad.js.map` (2,98 Mo) expose les **56 fichiers source** de l'app, dont `AdminDashboard.jsx`, `services/api.js`, `AuthContext.js`. | Élevée — facilite 1, 2 et 3 |
| 5 | Jeton JWT stocké dans `localStorage` (et non en cookie httpOnly) → exposition en cas de XSS. | Moyenne |
| 6 | **Aucun CSP, aucun `X-Frame-Options`** → clickjacking possible. HSTS et `nosniff` sont présents. | Moyenne |
| 7 | **Aucun bandeau de consentement** alors que la plateforme pose des cookies de suivi (`__emg_vid` 12 mois, `__emg_sid` 30 min) dès la première requête. | Moyenne (RGPD / ePrivacy) |
| 8 | Sous-traitants **non déclarés** dans la politique de confidentialité : **Cloudinary** (audio) et **Emergent** (hébergement). Seuls Stripe, MongoDB Atlas et Google sont listés. | Moyenne (RGPD art. 28) |
| 9 | Aucune mention d'identité légale (raison sociale, SIRET/Company number, adresse). Simple adresse Gmail. | Moyenne |
| 10 | Les routes d'administration sensibles (`/api/admin/stats`, `/api/admin/users`) renvoient bien **401**. Le contrôle existe donc, mais il n'est pas appliqué partout. | Point positif partiel |

**Enseignement direct pour DARIJAGO :** un paywall front-end ne protège rien. Toute route servant du contenu payant doit vérifier le jeton **côté serveur**, et les source maps ne doivent jamais être déployées en production.

---

## 8. Bilan comparatif final — les trois acteurs

### Tableau de synthèse

| Critère | **DZLingo** | **Speak Algerian** | **DARIJAGO (état actuel)** |
|---|---|---|---|
| **Statut** | En ligne, publié | En ligne, publié | **Non publié** (corrigé, prêt à déployer) |
| **Canaux** | Web + Android + iOS | Web uniquement | Web uniquement (build validé) |
| **Éditeur** | Auto-entrepreneur FR (SIRET) | Créatrice UK, pas d'entité déclarée | À définir |
| **Public visé** | Diaspora **francophone** | Diaspora **anglophone** + enfants | Francophone + 6 autres langues d'UI |
| **Dialecte** | Algérien général | **Alger** uniquement | Algérien, sources Ben Sedira 1910 |
| **Langues d'interface** | 7 | **1 (anglais)** | **7** |
| **Volume lexical** | ~2 971 mots annoncés | **386 mesurés** | **2 297 entrées** (2 121 verbes + 176 dictionnaire) |
| **Leçons / thèmes** | 66 thèmes, 392 leçons | 14 catégories, 2 leçons de grammaire | 7 modules, 42 phrases, 4 dialogues, 3 histoires |
| **Situations de conversation** | 24 scénarios | **0** | 4 dialogues |
| **Grammaire** | 14 leçons | Possessifs seulement | Guide + tables de conjugaison |
| **Conjugaison** | Non détaillé | **Absent** (annoncé) | **2 121 verbes** — atout unique |
| **Audio natif** | Oui (fichiers MP3 réels) | **Oui, 385/386** | **Non** (TTS Gemini non validé) |
| **Couverture audio** | Partielle | **99,7 %** | 0 % natif |
| **Jeux / exercices** | Quiz, parcours | **6 jeux** | Quiz, dictée, répétition orale, flashcards |
| **Compte + progression** | Oui | Oui (streak, succès, stats) | **Non** |
| **Paiement** | Stripe + IAP | Stripe | **Non** |
| **Version gratuite** | 6 leçons + 3 grammaire + 7 situations | **Aucune** | N/A |
| **Prix mensuel** | 6,99 € | **9,99 £ ≈ 11,95 €** | À définir |
| **Prix annuel** | 59,99 € | **Néant** | À définir |
| **Prix à vie** | 99,99 € | **Néant** | À définir |
| **Traction déclarée** | ~9 371 apprenants | 500+ actifs | 0 |
| **Android** | 1 K+ téléchargements | — | — |
| **iOS** | 8 notes, 5,0/5 | — | — |
| **Instagram** | 2 161 | **33 726** | 0 |
| **TikTok** | 31 K–61 K vues/vidéo | 21,2 K abonnés | 0 |
| **YouTube** | Chaîne active | 4,38 K abonnés, 44 vidéos | 0 |
| **SEO** | 119 pages publiques, 1 162 URLs mots | **0 page indexable** | 0 (non publié) |
| **PWA / offline** | Non | Non | Partiel |
| **Sécurité paywall** | Serveur | **Front-end seulement** | À implémenter |
| **Sources linguistiques citées** | Non | Non | **Oui (Ben Sedira 1910, page + §)** |
| **Régions / registres** | Non | Non | Prévu, non implémenté |
| **Validation native** | Non documentée | Implicite (professeure native) | **Non faite** |

### Classement par axe

| Axe | 1er | 2e | 3e |
|---|---|---|---|
| **Distribution / audience** | **Speak Algerian** (33,7 K IG) | DZLingo | DARIJAGO |
| **Maturité commerciale** | **DZLingo** (3 plateformes, 3 formules, freemium) | Speak Algerian | DARIJAGO |
| **Volume de contenu** | **DZLingo** (~2 971) | DARIJAGO (2 297) | Speak Algerian (386) |
| **Profondeur linguistique** | **DARIJAGO** (2 121 verbes conjugués) | DZLingo | Speak Algerian |
| **Qualité audio** | **Speak Algerian** (99,7 % natif) | DZLingo | DARIJAGO (0 natif) |
| **Rigueur / traçabilité** | **DARIJAGO** (sources, pages, statuts) | — | — |
| **SEO / acquisition gratuite** | **DZLingo** | Speak Algerian (néant) | DARIJAGO (néant) |
| **Sécurité** | DZLingo | DARIJAGO (à faire) | **Speak Algerian** |
| **Engagement / gamification** | **Speak Algerian** (streak + concours) | DZLingo | DARIJAGO |

---

## 9. Ce que DARIJAGO doit prendre, et ce qu'elle doit éviter

### À reprendre de Speak Algerian

1. **L'audio natif exhaustif.** 385 enregistrements pour 386 mots, c'est ce qui rend le produit crédible. Objectif DARIJAGO : **100 % des 50 premières leçons couvertes par un locuteur natif**, et jamais présenter du TTS comme natif.
2. **Le concours de série (« 7-Day Streak Competition »).** Coût quasi nul, pousse l'usage quotidien, et met en avant les produits premium. À copier tel quel.
3. **Le funnel créateur.** Une incarnation humaine (« Jamilah, votre prof de derja ») convertit mieux qu'une marque anonyme. DARIJAGO doit avoir un visage, ou une voix.
4. **Le module possessifs.** Une leçon de grammaire ciblée, avec tableau de terminaisons et jeu associé, vaut mieux que dix leçons vagues. DARIJAGO a 2 121 verbes : le même format appliqué à la conjugaison serait imbattable.
5. **La niche enfants / diaspora.** Speak Algerian Kids fonctionne (3 K–11 K vues par épisode). Le segment « parents de la diaspora qui veulent transmettre » est sous-servi et émotionnellement fort.

### À reprendre de DZLingo

1. **Le freemium.** Sans contenu gratuit, pas de conversion et pas de SEO.
2. **Les trois formules** (mensuel / annuel / à vie). L'absence d'annuel chez Speak Algerian est une erreur de revenus.
3. **La surface SEO publique** : une page par mot, indexable.
4. **La présence sur les stores** : c'est là que se fait la découverte organique.

### À éviter absolument

1. **Le paywall front-end.** Toute route de contenu payant doit être authentifiée côté serveur.
2. **Les source maps en production.**
3. **Les compteurs marketing faux** (« 1000+ mots » pour 386). Sur un marché communautaire, se faire prendre en flagrant délit de gonflement détruit la confiance.
4. **Le gel du contenu.** 9 mois sans ajout alors que la promesse est « nouveau vocabulaire chaque semaine ».
5. **L'absence d'entité légale et de bandeau de consentement.**

---

## 10. Positionnement recommandé pour DARIJAGO

Les deux concurrents occupent des cases claires :

- **DZLingo = le généraliste francophone**, volume et distribution.
- **Speak Algerian = la professeure anglophone d'Alger**, communauté et audio natif.

**La case libre est la profondeur vérifiable.** Aucun des deux ne cite de source, ne distingue les régions, ne document la validation, ni ne traite la conjugaison sérieusement.

> **DARIJAGO — la darija algérienne en profondeur : conjugaison, régions, sources vérifiables, audio natif.**

Cinq différenciateurs à afficher et à tenir :

1. **Conjugaison** : 2 121 verbes, tableaux complets, exceptions assumées. Personne d'autre ne l'a.
2. **Régions** : Alger / Oran / Constantine / Est / Ouest / Sud. Les deux concurrents vendent un dialecte unique qui n'existe pas.
3. **Traçabilité** : chaque entrée cite sa source (ouvrage, page, §) et sa date de révision.
4. **Statut de validation** : `validé natif` / `à vérifier` / `historique (1910)` / `moderne`. Honnête, et personne ne le fait.
5. **Multilingue réel** : 7 langues d'UI là où Speak Algerian n'en a qu'une — mais il faut finir la traduction du **contenu**, pas seulement de l'interface.

---

## 11. Plan d'action en 5 phases

### Phase 1 — Publier (semaines 1–3)
- Déployer la version corrigée (build validé : lint 0, tests 50/50, audit 0 vulnérabilité).
- Nom de domaine, HTTPS, mentions légales, RGPD, bandeau de consentement.
- Analytics respectueux du consentement.
- **Compte utilisateur + progression persistante** (sinon aucun rétention possible).
- Corriger la marque incohérente « Speak Algeria / darijaGO » → **une seule marque**.

### Phase 2 — Rendre le contenu crédible (semaines 3–8)
- **Enregistrer 100 à 300 audios natifs** (priorité : les 50 premières leçons + les 500 mots les plus fréquents).
- Faire valider par un locuteur natif les 42 phrases, 4 dialogues, 3 histoires.
- Corriger la généralisation abusive du futur `ghadi` : le régionaliser.
- Retirer toute promesse non tenue (« intégralité du livre », « complet », « natif »).
- Ajouter le champ `statut`, `région`, `registre`, `source` à chaque entrée.

### Phase 3 — Monétiser (semaines 8–12)
- **Freemium** : module 1 + dictionnaire de base gratuits et indexables.
- Prix alignés : **6,99 €/mois, 59,99 €/an, 99,99 € à vie** (référence DZLingo, 2,4× moins cher que Speak Algerian à l'année).
- **Paywall côté serveur**, jamais côté client. Pas de source maps en production.
- Concours de série de 7 jours, à la Speak Algerian.

### Phase 4 — Mobile (semaines 12–20)
- Capacitor → iOS + Android à partir du build web existant.
- Synchronisation de progression, mode hors-ligne, PWA en amont.
- Fiches stores soignées, en français et en anglais.

### Phase 5 — Acquisition (en continu, dès la phase 1)
- **SEO** : une page publique par mot vedette et par verbe conjugué. C'est l'avantage structurel de DARIJAGO : 2 297 entrées = 2 297 pages potentielles, contre 166 chez DZLingo et 0 chez Speak Algerian.
- **TikTok / Instagram / Shorts** en français, 3 vidéos/semaine, format « un mot, une région, une nuance ».
- Cibler les **professeurs et créateurs** de la diaspora francophone (partenariats, affiliation).
- Ouverture anglaise en phase 2 de croissance : c'est le marché de Speak Algerian, mais son produit est faible — une version anglaise de DARIJAGO avec conjugaison serait immédiatement supérieure.

---

## 12. Verdict final

**Sur le produit, DARIJAGO peut battre les deux.** Son corpus (2 297 entrées, 2 121 verbes conjugués, sources documentées, 7 langues) est plus profond que celui de Speak Algerian (386 mots, 0 conjugaison) et plus rigoureux que celui de DZLingo (volume annoncé, aucune source).

**Sur le marché, DARIJAGO est dernière.** Elle n'est pas publiée, n'a pas de compte, pas de paiement, pas d'audio natif, pas un abonné. DZLingo a trois plateformes et un tunnel de paiement qui fonctionne. Speak Algerian a 33 726 personnes qui l'écoutent chaque semaine.

**L'écart à combler n'est pas linguistique, il est opérationnel.** Les deux concurrents ont prouvé qu'on peut vendre avec un produit médiocre : DZLingo avec un site PHP et des compteurs incohérents, Speak Algerian avec une app no-code dont le paywall est percé et le catalogue public. Aucun n'a de barrière technique.

**Ce qui départagera DARIJAGO, dans l'ordre :**
1. **Publier.** Tant que ce n'est pas en ligne, le reste ne compte pas.
2. **L'audio natif.** C'est le seul actif que les concurrents ont et qu'elle n'a pas. C'est aussi le plus long à produire : à lancer maintenant.
3. **La distribution.** 33 726 abonnés ne se rattrapent pas avec du SEO en six mois. Il faut une incarnation et un rythme de publication vidéo.
4. **La profondeur comme argument, pas comme excuse.** La conjugaison et les régions ne valent que si elles sont visibles dès la page d'accueil et démontrables en 30 secondes.

**Fenêtre de tir :** le marché est petit, les acteurs sont fragiles, et aucun n'a verrouillé la case « profondeur + vérifiabilité ». Elle est encore libre. Elle ne le restera pas si DZLingo ajoute la conjugaison ou si Speak Algerian traduit son produit en français.

---

## Annexe — Preuves conservées

| Fichier | Contenu |
|---|---|
| `preuves/vocabulaire-public-386.json` | Réponse brute de l'API publique (386 entrées) |
| `preuves/stats-vocabulaire.json` | Statistiques calculées |
| `preuves/sa-smoke.json` | Tests navigateur (5 pages, desktop + mobile) |
| `preuves/sa-axe.json` | Violations d'accessibilité axe-core |
| `preuves/sa-home-desktop.png` | Capture accueil desktop |
| `preuves/sa-home-mobile.png` | Capture accueil mobile |
| `preuves/sa-pricing-mobile.png` | Capture page tarif |
| `preuves/sa-vocabulary-mobile.png` | Mur de connexion sur `/vocabulary` |
| `preuves/sa-games-mobile.png` | Mur de connexion sur `/games` |

**Sources externes consultées :** speak-algerian.com (accueil, /pricing, /terms, /privacy, /login), API `dzspeak.emergent.host`, stan.store/speakalgerian, instagram.com/speakalgerian, tiktok.com/@speakalgerian, youtube.com/@speakalgerian, r/algeria, documentation Emergent.sh.
