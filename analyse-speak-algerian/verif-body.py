import json, sys
sys.stdout.reconfigure(encoding="utf-8")
p = r"C:\Users\zakaria\Documents\APPLICATION DARIJAGO\darijago-—-apprendre-la-darija-algérienne final 16112026\body-test-native.json"
d = json.load(open(p, encoding="utf-8"))
print("TEXTE:", d["input"])
print("VOIX:", d["voice"])