# Analyse linguistique détaillée — échantillon de 2 vidéos

> Objectif : construire un agent qui parle/enseigne la darija algérienne.
> Corpus : transcriptions publiques ASR de deux vidéos.
> Limite : les transcriptions automatiques peuvent contenir des erreurs. Toute forme doit être validée par un locuteur natif avant production.

## Sources analysées

1. “15 expressions en algérien (et comment les nier !)”  
   https://www.youtube.com/watch?v=dJN9ZhMZK7o

2. “10 expressions algériennes : le secret pour mieux communiquer”  
   https://www.youtube.com/watch?v=326ptjErYq8

Les Shorts testés n’ont pas fourni de transcription exploitable via l’outil public.

## 1. Observations générales

L’échantillon montre une pédagogie très structurée :

```text
expression affirmative
→ traduction
→ forme négative
→ forme féminine
→ forme plurielle
→ exemple d’usage
```

L’agent doit reproduire cette logique, mais avec des exemples originaux.

## 2. Négation observée

### A. Négation verbale / état : ma ... ch

Formes observées ou normalisables :

| Affirmatif | Négatif | Sens |
|---|---|---|
| rani labas | ma ranich labas | je ne vais pas bien |
| 3andi el waqt | ma 3andich el waqt | je n’ai pas le temps |
| 3andek el haqq | ma 3andekch el haqq | tu n’as pas raison |
| rani wajed | ma ranich wajed | je ne suis pas prêt |
| 3andi zhar | ma 3andich zhar | je n’ai pas de chance |
| rani ferhan | ma ranich ferhan | je ne suis pas content |
| 3andi fik tiqa | ma 3andich tiqa fik | je n’ai pas confiance en toi |

Règle agent :

```text
ma + forme verbale / pseudo-verbale + ch
```

Attention : l’ASR peut écrire `ranish`, `mandish`, `andeksh`. Normaliser en `ranich`, `ma 3andich`, `ma 3andekch` pour la phonétique pédagogique.

### B. Négation d’existence : kayen → makanch

| Affirmatif | Négatif | Sens |
|---|---|---|
| kayen | makanch | il y a / il n’y a pas |
| kayena | makanch | il y a une femme / chose féminine ; négation souvent invariable |
| kayenin | makanch | il y a au pluriel |
| kayen blasa | makanch blasa | il y a une place / pas de place |
| kayen l7all | makanch 7all | il y a une solution / pas de solution |

Règle agent :

```text
kayen / kayena / kayenin
négation : makanch
```

### C. Négation adjectivale / nominale : mashi / machi

| Affirmatif | Négatif | Sens |
|---|---|---|
| hada melih | hada machi melih | ce n’est pas bien |
| hada sahel | hada machi sahel | ce n’est pas facile |
| hadi s7i7a | hadi machi s7i7a | ce n’est pas vrai |
| hada momken | hada machi momken | ce n’est pas possible |

Règle agent :

```text
mashi / machi + adjectif ou nom
```

Ne pas appliquer `ma ... ch` à tous les adjectifs.

## 3. Accord en genre

L’échantillon insiste sur masculin/féminin.

| Masculin | Féminin | Sens |
|---|---|---|
| rani wajed | rani wajda | je suis prêt / prête |
| rani ferhan | rani ferhana | je suis content / contente |
| hada sahel | hadi sahla | c’est facile |
| hadi meliha | — | c’est bon / bien, féminin |
| rani 7ayr | rani 7ayra | je suis perplexe |

Règle agent :

```text
Souvent ajouter -a au féminin pour les adjectifs.
Mais certaines expressions restent invariantes.
```

Expressions invariantes observées :

```text
ma3lich
3la slamtek
ya 7asra
y3tik sa7a
```

## 4. Pluriel

Formes observées :

| Singulier | Pluriel | Sens |
|---|---|---|
| kayen | kayenin | il y a |
| blasa | blayes | place / places |
| 7all | 7lul | solution / solutions |
| 3andek | 3andekum | tu as / vous avez |

Règle agent :

```text
Ne pas généraliser un seul pluriel.
Stocker les pluriels fréquents dans le lexique.
```

## 5. Expressions sociales / pragmatics

Expressions utiles observées :

| Expression | Sens | Usage |
|---|---|---|
| ma3lich | ce n’est pas grave | rassurer |
| 3la slamtek | bienvenue / bon rétablissement | retour de voyage, maladie |
| ya 7asra | nostalgie / regret | émotion |
| y3tik sa7a | merci / bravo | encouragement |
| rani labas | je vais bien | réponse à “comment ça va” |
| 3andek el haqq | tu as raison | accord |
| 3andi zhar | j’ai de la chance | chance |
| kayen l7all | il y a une solution | espoir / résolution |

Règle agent :

```text
Toujours donner le contexte social, pas seulement la traduction.
```

## 6. Code-switching français

Les vidéos mélangent français et darija :

```text
bienvenue, aujourd’hui, expression, masculin, féminin, commentaires
```

C’est normal dans un contenu pédagogique pour francophones.

Règle agent :

```text
Pour débutant francophone : explication en français + phrase en darija.
Pour conversation avancée : répondre principalement en darija.
```

## 7. Structure pédagogique observée

L’agent doit utiliser ce patron :

```text
1. Expression
2. Sens
3. Contexte
4. Forme négative si pertinente
5. Forme féminine si pertinente
6. Pluriel si pertinent
7. Exemple original
8. Mini-exercice
```

## 8. Ce que le skill doit éviter

- Copier les phrases exactes des vidéos comme contenu principal.
- Utiliser la signature ou la persona du créateur.
- Présenter une transcription ASR comme vérité absolue.
- Confondre `machi` et `ma ... ch`.
- Oublier l’accord féminin.
- Donner une forme régionale comme universelle.

## 9. Règles prioritaires pour l’agent

```text
Si existence → kayen / makanch
Si état personnel → rani / ma ranich
Si avoir → 3andi / ma 3andich
Si adjectif après hada/hadi → machi
Si féminin → souvent -a, mais vérifier lexique
Si pluriel → utiliser forme stockée, ne pas inventer
Si expression sociale → ajouter contexte d’usage
```

## 10. Prochaine étape corpus

Pour aller plus loin :

1. obtenir 10 à 30 transcriptions autorisées ;
2. nettoyer l’ASR ;
3. annoter token par token ;
4. valider avec locuteur natif ;
5. enrichir le lexique et les règles ;
6. créer des tests de non-régression.
