# VoiceStudio pour une voix off en darija algérienne

**Analyse réalisée le 14 novembre 2026**  
Dépôt : https://github.com/debpalash/VoiceStudio  
Code analysé : commit `da0b06a5bbe6caf4dc68c2c0954b288e21267272`  
Dernière version stable relevée : `v0.5.8`, publiée le 12 novembre 2026.

> Méthode : lecture du README, des guides, du catalogue de modèles, du registre de licences et de fichiers de code. Je n’ai pas installé les modèles ni exécuté de synthèse avec VoiceStudio. La qualité de l’accent algérien reste donc à valider par écoute.

## Verdict

**Oui, VoiceStudio mérite un essai pour la darija algérienne.** Son moteur par défaut, OmniVoice, référence explicitement « Algerian Arabic » avec l’identifiant `arq`. Le dépôt permet aussi le clonage à partir d’un court enregistrement, la création de voix, l’export WAV et l’automatisation par API ou MCP.

**Mais je ne recommande pas son moteur par défaut pour livrer directement des publicités payantes.** Le code de l’application est sous AGPL-3.0, tandis que les poids du modèle OmniVoice sont sous licence non commerciale. Ce sont deux questions distinctes. Une licence commerciale de VoiceStudio ne dégage pas automatiquement les droits sur les modèles tiers.

Pour démarrer simplement : utiliser Natiq pour les premières voix off commerciales, et tester VoiceStudio en parallèle. Pour une production locale destinée aux clients, étudier VoxCPM2 avec une référence en darija, après vérification des composants et un essai audio convaincant.

## 1. Ce que fait réellement le dépôt

VoiceStudio est un **studio de production vocale**, pas un agent publicitaire autonome :

- synthèse vocale à partir d’un texte ;
- clonage vocal avec un enregistrement de référence autorisé ;
- création de voix selon des attributs ou une description, suivant le moteur ;
- doublage, transcription, dictée et narration ;
- génération par lots et exports audio ;
- API locale et outils MCP pour connecter un autre programme.

L’interface de bureau communique avec un backend FastAPI. Les moteurs vocaux sont interchangeables. Pour ton projet, VoiceStudio serait la **brique audio** ; la rédaction du brief, le choix commercial, la validation et le montage vidéo restent à organiser autour.

Sources : [README](https://github.com/debpalash/VoiceStudio/blob/da0b06a5bbe6caf4dc68c2c0954b288e21267272/README.md), [API](https://github.com/debpalash/VoiceStudio/blob/da0b06a5bbe6caf4dc68c2c0954b288e21267272/docs/speech-platform.md), [MCP](https://github.com/debpalash/VoiceStudio/blob/da0b06a5bbe6caf4dc68c2c0954b288e21267272/docs/mcp.md).

## 2. Ce que « prend en charge la darija » signifie ici

Le catalogue distingue :

| Variété | Identifiant | Durée d’entraînement indiquée |
|---|---|---:|
| Algerian Arabic | `arq` | 9,64 h |
| Algerian Saharan Arabic | `aao` | 2,02 h |
| Standard Arabic | `arb` | 1 483,53 h |

Le code contient bien l’association `algerian arabic → arq`, et la fiche du modèle OmniVoice inclut également `arq`.

**C’est une prise en charge déclarée, pas une garantie de qualité.** Le volume consacré à l’algérien est faible comparé à celui de l’arabe standard. Il faut tester les tournures locales, les prix, les noms de marques et les mots français mélangés à la darija. Choisir « Arabic » ou « ar-DZ » dans un autre outil ne suffit pas à établir qu’il parle réellement algérien.

Le sélecteur de langue ne traduit pas le texte : fournis directement le script en darija, de préférence en caractères arabes.

Sources : [catalogue des langues](https://github.com/debpalash/VoiceStudio/blob/da0b06a5bbe6caf4dc68c2c0954b288e21267272/docs/languages.md), [table des langues du code](https://github.com/debpalash/VoiceStudio/blob/da0b06a5bbe6caf4dc68c2c0954b288e21267272/omnivoice/utils/lang_map.py), [fiche OmniVoice épinglée](https://huggingface.co/k2-fsa/OmniVoice/blob/c5fdb5ccb189668d56333f77ba2629f4cd7535f4/README.md).

## 3. Comparaison des options pertinentes

| Option | Intérêt pour ton projet | Limite importante |
|---|---|---|
| **OmniVoice, moteur par défaut** | Choix explicite `arq`, clonage court, WAV 24 kHz mono | Poids non commerciaux ; qualité algérienne à écouter |
| **OmniVoice GGUF** | Empreinte mémoire réduite, fonctionnement CPU possible | Même famille de modèle et restrictions non commerciales ; plus lent ou moins fidèle selon quantification |
| **VoxCPM2** | WAV 48 kHz, clonage et création de voix ; fiche amont Apache-2.0 | Arabe générique annoncé, pas une garantie de darija ; audit des composants encore incomplet dans le dépôt |
| **Natiq, service externe** | Spécialisé en algérien, API, styles publicité/reel ; FAQ autorisant les créations commerciales | Dépendance au service et aux crédits ; pas le moteur de VoiceStudio |

La fiche amont de VoxCPM2 annonce une utilisation commerciale sous Apache-2.0. Le registre de VoiceStudio signale néanmoins des composants et références à vérifier. **Ne pas confondre « candidat commercial intéressant » avec « ensemble du workflow juridiquement vérifié ».**

Sources : [guide OmniVoice](https://github.com/debpalash/VoiceStudio/blob/da0b06a5bbe6caf4dc68c2c0954b288e21267272/docs/engines/omnivoice.md), [guide VoxCPM2](https://github.com/debpalash/VoiceStudio/blob/da0b06a5bbe6caf4dc68c2c0954b288e21267272/docs/engines/voxcpm2.md), [fiche VoxCPM2 épinglée](https://huggingface.co/openbmb/VoxCPM2/blob/bffb3df5a29440629464e5e839f4d214c8714c3d/README.md), [registre des licences](https://github.com/debpalash/VoiceStudio/blob/da0b06a5bbe6caf4dc68c2c0954b288e21267272/backend/config/model_licenses.json), [Natiq](https://natiq.studio/fr/).

## 4. Licence : le piège à éviter

- **Application AGPL-3.0 :** utilisation commerciale possible selon ses termes. Si tu modifies le programme et le rends accessible à d’autres par réseau, l’obligation de fournir le code source correspondant peut s’appliquer.
- **Modèle par défaut :** poids CC-BY-NC, version non précisée dans la fiche consultée ; composants supplémentaires sous d’autres conditions. Le registre indique `commercial_inference: restricted` et `commercial_outputs: unknown`.
- **VoiceStudio Pro :** ne remplace pas les licences des poids et composants tiers.
- **Voix de référence :** obtenir l’autorisation de la personne, y compris pour une utilisation publicitaire. Ne pas utiliser une vidéo YouTube trouvée en ligne comme voix à cloner sans droits.

Pour des publicités facturées, ne pas considérer que « open source », « gratuit » ou « local » signifie automatiquement « autorisé pour ce travail commercial ».

Sources : [notice de licence](https://github.com/debpalash/VoiceStudio/blob/da0b06a5bbe6caf4dc68c2c0954b288e21267272/LICENSE-NOTICE.md), [registre des modèles](https://github.com/debpalash/VoiceStudio/blob/da0b06a5bbe6caf4dc68c2c0954b288e21267272/backend/config/model_licenses.json).

## 5. Besoins techniques pour un débutant

Pour Windows, le guide indique Windows 10/11 x64 et environ **10 Go d’espace libre** pour l’application, son environnement et les modèles. Un installateur est disponible : il n’est pas nécessaire de commencer par compiler le dépôt.

- OmniVoice standard : environ **6 Go de VRAM** recommandés sur GPU dédié.
- OmniVoice GGUF : alternative pour petite mémoire vidéo ou CPU, avec compromis de vitesse/qualité.
- VoxCPM2 : CUDA 12 recommandé pour la vitesse ; le catalogue indique environ 5 Go de poids à télécharger. Le guide ne donne pas de plancher de VRAM validé équivalent à celui d’OmniVoice.
- Les moteurs CPU légers conseillés pour les petits PC ne doivent pas être supposés compatibles avec `arq`.

La première génération peut être très lente à cause du téléchargement des poids. Ce n’est pas nécessairement un plantage.

Sources : [installation Windows](https://github.com/debpalash/VoiceStudio/blob/da0b06a5bbe6caf4dc68c2c0954b288e21267272/docs/install/windows.md), [catalogue des modèles](https://github.com/debpalash/VoiceStudio/blob/da0b06a5bbe6caf4dc68c2c0954b288e21267272/backend/config/models.yaml), [versions](https://github.com/debpalash/VoiceStudio/releases/tag/v0.5.8).

## 6. Essai recommandé avant toute installation lourde

Texte de test, sans prix ni promesse commerciale inventée :

> سلام عليكم، واش راكم؟ اليوم نحكيو على منتوج جديد. حابين تعرفو السعر والتفاصيل؟ ابعثولنا رسالة، ورانا هنا نجاوبوكم. مرحبا بكم!

Pour un essai technique non commercial avec OmniVoice :

1. Installer la version stable depuis les releases officielles, pas une archive inconnue trouvée dans une vidéo.
2. Sélectionner OmniVoice et la langue **Algerian Arabic / `arq`**.
3. Utiliser une voix de référence propre de 3 à 10 secondes, avec les droits nécessaires, ou un profil autorisé du dépôt.
4. Fournir la transcription exacte de cet extrait de référence.
5. Générer le texte de test et écouter la prononciation, le rythme et les mots français.
6. Comparer plusieurs prises avant de conclure. Garder le moteur, la référence, le texte et les paramètres identiques pour comparer équitablement.
7. Exporter en WAV pour le montage.

**Critère de réussite :** un locuteur algérien juge la voix naturelle et compréhensible, sans accent étranger gênant ni erreurs sur les mots importants. Un fichier audio qui se génère sans erreur n’est pas, à lui seul, un résultat acceptable pour un client.

## 7. Architecture conseillée pour ton activité

```text
Brief client en français ou en darija
                  ↓
Agent de rédaction : accroche, bénéfices vérifiés, appel à l’action
                  ↓
Validation humaine du texte et de l’offre
                  ↓
Moteur vocal : Natiq pour démarrer ; VoiceStudio après test et droits vérifiés
                  ↓
Écoute, corrections, export WAV
                  ↓
Montage avec visuels autorisés, sous-titres et musique autorisée
```

Pour une intégration future de VoiceStudio, appeler son API depuis un backend privé. Ne pas mettre sa clé dans le navigateur et ne pas exposer directement le port 3900 sur Internet. L’API et MCP existent, mais ils ne transforment pas automatiquement le studio en agent commercial complet.

## Décision pratique

1. **Pour écouter tout de suite :** essayer une voix directement avec l’outil vocal de cette conversation, distinct de VoiceStudio, sous réserve de disponibilité de l’algérien.
2. **Pour les premiers clients :** privilégier Natiq et son API spécialisée.
3. **Pour explorer le local :** tester `arq` dans VoiceStudio sans usage commercial par défaut.
4. **Pour une production locale commerciale :** évaluer VoxCPM2 avec une référence darija autorisée et vérifier les droits de la version exacte utilisée.
5. **Pour installer sur ton PC :** choisir la procédure selon Windows/macOS/Linux, la RAM et le GPU, plutôt que suivre aveuglément une ancienne vidéo.
