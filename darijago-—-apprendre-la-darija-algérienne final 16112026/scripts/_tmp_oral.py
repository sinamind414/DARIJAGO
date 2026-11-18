import sys, re
sys.stdout.reconfigure(encoding="utf-8")
p = "src/i18n/oralTranslations.ts"
s = open(p, encoding="utf-8").read()

# Remplacements de libelles pour clarifier que le score mesure la transcription, pas la prononciation
remplacements = [
    # FR
    ("compareTitle: '3. Comparaison & Prononciation'", "compareTitle: '3. Comparaison des transcriptions'"),
    ("scoreLabel: (score) => `ProximitǸ : ${score} %`", "scoreLabel: (score) => `Correspondance de transcription : ${score} %`"),
    ("tierExcellent: 'TrǸs proche du modǸle natif !'", "tierExcellent: 'Transcription trǸs proche du modǸle !'"),
    ("tierGood: 'ComprǸhensible Ǧ?" },{", "tierGood: 'Transcription comprǸhensible Ǧ?" },{"),
    ("'comparez votre prononciation mot par mot.'", "'comparez les transcriptions mot par mot (cela ne mesure pas l’accent).'"),
]
n=0
for old,new in remplacements:
    c=s.count(old)
    if c:
        s=s.replace(old,new); n+=c
        print(f"{c}x {old[:55]}")
open(p,"w",encoding="utf-8").write(s)
print("total:",n)
