import subprocess, os
os.chdir(r"C:\Users\zakaria\Documents\APPLICATION DARIJAGO")
for rel in ["analyse-audio-ia/clipwing-skills", "analyse-audio-ia/earshot", "scripts/telecharger-sfx-openverse.py"]:
    subprocess.run(["git", "rm", "--cached", "-q", rel], check=False)
# ajouter au gitignore
gi = ".gitignore"
txt = open(gi, encoding="utf-8").read()
if "analyse-audio-ia/" not in txt:
    with open(gi, "a", encoding="utf-8") as f:
        f.write("\n# Clones d'outils audio externes (evaluation, non integres)\nanalyse-audio-ia/\n")
subprocess.run(["git", "add", "-A"], check=False)
subprocess.run(["git", "commit", "-m", "chore: exclure clones audio externes du suivi git"], check=False)
subprocess.run(["git", "push", "origin", "main"], check=False)
print(subprocess.check_output(["git", "log", "-1", "--oneline"]).decode())
