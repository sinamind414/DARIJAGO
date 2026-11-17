# Récupérer les PDF sources

Les 14 PDF sources (**53,9 Mo**) ont été retirés du workspace le **15 novembre 2026**
pour réduire le volume. **Ils ne sont pas perdus** : chacun a été vérifié
**MD5 par MD5** contre Google Drive avant suppression (14/14 identiques).

Le workspace est passé de **235 Mo à 58 Mo**.

---

## Où ils sont

Dossier Drive : **[APPLICATION DARIJAGO](https://drive.google.com/drive/folders/1BF81sQbz5icVl2nOFyJ2shsTo9C3J1JH)**

| Dossier Drive | Contenu |
|---|---|
| `LIVRE ARABE DARIJA ALGERIEN` | les 10 parties du dictionnaire Ben Sedira 1910 |
| `DEUXIEME LIVRE DARIJA` | Tapiéro, partie 01 (et les 6 autres fichiers du manuel) |
| **`03 - Sources PDF (sauvegarde complète)`** | AZIRI 2012, Lexiques Tadjer, Tapiéro scan complet 1978 |

Le dossier `03 - Sources PDF (sauvegarde complète)` a été créé exprès pour cette
sauvegarde : les 3 PDF qui n'étaient pas encore sur Drive y ont été envoyés
**avant** toute suppression.

---

## Comment les remettre

1. Ouvrir le dossier Drive correspondant.
2. Télécharger le fichier.
3. Le replacer dans le workspace au chemin indiqué ci-dessous (recréer le dossier `raw/`).
4. Vérifier que le MD5 correspond.

### Table de correspondance

| Chemin local à recréer | Nom sur Drive | MD5 |
|---|---|---|
| `dictionnaire-livre/raw/partie-01.pdf` | `Dictionnaire_…(1910)-1.pdf` | `727bb983a773b656946876d161cb2488` |
| `dictionnaire-livre/raw/partie-02.pdf` | `…(1910)-2.pdf` | `4f969121fae52c4c72b154acb434d773` |
| `dictionnaire-livre/raw/partie-03.pdf` | `…(1910)-3.pdf` | `785c637d4ae65cc587d310eea0ac036b` |
| `dictionnaire-livre/raw/partie-04.pdf` | `…(1910)-4.pdf` | `e0912fa314219d3546d7b1d91f6b5f2a` |
| `dictionnaire-livre/raw/partie-05.pdf` | `…(1910)-5.pdf` | `8913cdd39293511748819ac91b49276e` |
| `dictionnaire-livre/raw/partie-06.pdf` | `…(1910)-6.pdf` | `fc209301ae8181b8218ac6fba62ec2b7` |
| `dictionnaire-livre/raw/partie-07.pdf` | `…(1910)-7.pdf` | `0088ea6da8fafec26bcc22f74c20f6af` |
| `dictionnaire-livre/raw/partie-08.pdf` | `…(1910)-8.pdf` | `033a594d6c5677be181b9b83df6d366c` |
| `dictionnaire-livre/raw/partie-09.pdf` | `…(1910)-9.pdf` | `4e88f4c10029f97a8fb94ff0bb7ba27b` |
| `dictionnaire-livre/raw/partie-10.pdf` | `…(1910)-10.pdf` | `c03ba584880cc75bb0ffa12ed0abc043` |
| `manuel-arabe-algerien/raw/partie-01.pdf` | `Manuel-arab-algerien-1.pdf` | `575356481c506b7561c3adfe8aa7593e` |
| `manuel-arabe-algerien/scan-complet-2023/raw/tapiero-manuel-complet-1978.pdf` | `tapiero-manuel-complet-1978.pdf` | `66e76f975e6e257d9dde7372fbd67b95` |
| `locutions-aziri/raw/locutions-aziri-2012.pdf` | `locutions-aziri-2012.pdf` | `89c1be71d2da0c9b30ab9873fa908f85` |
| `lexiques-tadjer/raw/lexiques-tadjer-2010-2012.pdf` | `lexiques-tadjer-2010-2012.pdf` | `00e125b52c6ed8adeefcffcd95f4c6e2` |

La liste complète avec les identifiants Drive est aussi dans
`drive-manifest.json`, clé `restauration_pdf`.

### Vérifier un fichier remis en place

```bash
md5sum chemin/du/fichier.pdf
```

Comparer à la colonne MD5 ci-dessus.

---

## Ce qui n'a PAS été supprimé

Tout ce qui est nécessaire pour travailler reste en place :

- **les 4 bases SQLite** (`dictionnaire`, `manuel`, `locutions`, `lexiques`), intactes, `integrity_check = ok` ;
- la sauvegarde `manuel-arabe-algerien/db/backups/manuel-avant-scan-complet-*.sqlite` ;
- **les textes extraits** : OCR du 1910 et de Tapiéro, `locutions-extrait.jsonl`, `lexiques-extrait.jsonl` ;
- **les 25 scripts** d'extraction et d'ingestion ;
- les exports masters « actif » (CSV + JSON) ;
- tous les rapports `README.md` et `INTEGRATION.md`.

**Conséquence pratique :** on peut continuer à interroger, corriger et valider
les bases **sans les PDF**. Ils ne redeviennent nécessaires que pour
**relancer une extraction** ou **vérifier une page à l'œil** — par exemple pour
reprendre l'arabe défectueux des Lexiques Tadjer, ou l'arabe OCR du scan Tapiéro.

Dans ce cas, il suffit de récupérer **le seul PDF concerné**, pas les 14.
