# Analyse fonctionnelle — DARIJA : Arabe algérien (DZ)

> Objectif : comprendre le modèle pour construire une application originale.
> On ne copie pas le nom, le code, les textes, les audio, les icônes ou l’identité visuelle exacte.

## 1. Informations publiques observées

- Nom : **DARIJA : Arabe algérien (DZ)**
- Développeur : amccreateur
- Catégorie : Enseignement
- Téléchargements indiqués : **5 k+**
- Modèle économique : **gratuit avec publicités + achats intégrés / Premium sans pub à vie**
- Mise à jour indiquée sur la fiche : **12 novembre 2026**
- Site associé : https://amccreateur.github.io/darija-app

## 2. Promesse produit

L’application annonce 4 grands modes :

1. **Arabe algérien / darija** : vocabulaire et expressions du quotidien.
2. **Arabe religieux** : prières, invocations, vocabulaire islamique.
3. **Arabe littéraire** : arabe classique / moderne standard.
4. **Fiqh malikite** : purification, prière, zakat, jeûne, convenances.

Fonctions mises en avant :

- audio pour chaque mot/expression ;
- quiz après leçon ;
- quiz bilan ;
- phonétique simple ;
- progression sauvegardée ;
- rappels quotidiens ;
- leçons courtes.

## 3. Écrans observés dans les captures

### A. Écran Dialogue

Éléments visibles :

- barre supérieure verte ;
- bouton retour/menu ;
- titre de la leçon ;
- sous-titre du mode : “Dialogue” ;
- niveau affiché : débutant ;
- image/emoji contextuel ;
- lecteur audio avec vitesse 1.0x ;
- boutons :
  - masquer le vocabulaire ;
  - voir la traduction ;
- texte du dialogue en phonétique ;
- mots colorés selon leur état : nouveau / déjà vu.

**Idée à reprendre :** apprendre dans un contexte conversationnel, pas seulement des mots isolés.

### B. Écran Flashcards / Vocabulaire

Éléments visibles :

- titre de leçon ;
- score en étoiles ;
- barre de progression ;
- compteur : 1 / 15 ;
- grande carte centrale ;
- emoji/image ;
- mot en arabe ;
- phonétique ;
- traduction masquée derrière un bouton ;
- bouton audio ;
- flèches précédent/suivant ;
- indicateurs de cartes.

**Idée à reprendre :** carte simple = image + arabe + phonétique + traduction + audio.

### C. Écran Théorie

Éléments visibles :

- carte mot/image ;
- bloc explicatif ;
- tableau ou exemples ;
- structure très scolaire : notion → exemple → traduction.

**Idée à reprendre :** une mini-théorie avant les cartes et le quiz.

### D. Écran Quiz

Éléments visibles :

- titre de leçon ;
- score ;
- barre de progression ;
- compteur : 1 / 12 ;
- question ;
- 4 choix de réponse ;
- bouton “Vérifier” désactivé tant qu’aucune réponse n’est choisie.

**Idée à reprendre :** quiz à choix multiples, validation explicite, progression visible.

## 4. Parcours utilisateur probable

```text
Accueil / Menu
   ↓
Choix du mode : darija, religieux, littéraire, fiqh
   ↓
Choix d’un thème
   ↓
Théorie courte
   ↓
Flashcards avec audio
   ↓
Dialogue contextualisé
   ↓
Quiz de leçon
   ↓
Quiz bilan / score / étoiles
   ↓
Progression + rappels
```

## 5. Points forts du modèle

- Très simple à comprendre.
- Audio au cœur de l’apprentissage.
- Phonétique utile pour les débutants.
- Quiz et progression donnent un sentiment d’avancement.
- Les dialogues rendent le contenu plus vivant.
- Le modèle gratuit + premium est facile à comprendre.
- La niche “darija algérienne” est claire.

## 6. Limites / opportunités pour faire mieux

### À améliorer

- La fiche Google Play indique que les données ne peuvent pas être supprimées : c’est un point faible confiance/conformité.
- Les 4 modes peuvent disperser le produit.
- Le site public mentionne un contenu encore limité : salutations, famille, possessifs, plus de 30 mots.
- Pas de preuve publique d’une correction de prononciation par IA.
- Pas de preuve publique d’un mode hors-ligne complet.
- Pas de preuve publique de variantes régionales.
- Le design très coloré peut être modernisé.

### Différenciation possible

- Commencer uniquement par la **darija algérienne quotidienne**.
- Audio natif validé, lent et normal.
- Double écriture : arabe + phonétique.
- Révision espacée : l’app fait revenir les mots oubliés.
- Dialogues par situation : marché, taxi, famille, travail, téléphone.
- Mode hors-ligne.
- Suppression du compte et des données.
- Plus tard : tuteur IA, feedback de prononciation, studio voix off.

## 7. Ce qu’il faut “cloner” fonctionnellement

À reprendre comme mécaniques génériques :

- menu par modules ;
- leçons courtes ;
- théorie → cartes → dialogue → quiz ;
- audio par mot ;
- traduction masquable ;
- phonétique ;
- score/étoiles ;
- progression ;
- rappels ;
- premium sans pub.

À ne pas copier :

- nom exact ;
- logo ;
- textes de leçons ;
- dialogues ;
- enregistrements audio ;
- images/icônes propriétaires ;
- code source ;
- identité visuelle exacte.

## 8. MVP conseillé pour ton application

### Nom de travail

**DarijaPro** ou **Dzair Lingua** — à valider juridiquement plus tard.

### Cible

Grand public : débutants, diaspora, voyageurs, personnes curieuses.

### Contenu MVP

- 6 thèmes :
  1. salutations ;
  2. famille ;
  3. temps et heures ;
  4. marché / achats ;
  5. transport ;
  6. téléphone / messages.
- 60 à 120 expressions.
- Audio natif pour chaque expression.
- 1 mini-théorie par thème.
- 1 dialogue par thème.
- 5 à 10 quiz par thème.
- Révision espacée simple.

### Écrans MVP

1. Onboarding.
2. Accueil.
3. Liste des modules.
4. Détail leçon.
5. Théorie.
6. Flashcards.
7. Dialogue.
8. Quiz.
9. Résultat.
10. Progression.
11. Profil / réglages.
12. Premium.

### Monétisation

- Gratuit : quelques leçons, rappels, progression.
- Premium : tout le contenu, hors-ligne, sans pub, révision avancée.
- Éviter de mettre trop de pub au début.

## 9. Architecture technique recommandée

Pour Android + iOS :

- **Flutter** ou **React Native / Expo**.
- Base locale : SQLite.
- Backend : Supabase ou Firebase.
- Audio : fichiers natifs hébergés + cache local.
- Analytics : minimal, respectueux de la vie privée.
- Paiement mobile : Google Play Billing + App Store IAP.
- Plus tard : paiement web local CIB/Edahabia si pertinent.

## 10. Prochaine étape

Le prototype HTML ci-joint montre une version originale du parcours :

```text
Accueil → Leçon → Théorie → Cartes → Dialogue → Quiz → Résultat
```

Il sert à valider l’idée avant de développer l’application mobile réelle.
