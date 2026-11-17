@echo off
rem Reprend le telechargement du modele OmniVoice (2,45 Go) la ou il s'est arrete.
rem Le fichier partiel est conserve dans le cache HuggingFace.
set "URL=https://huggingface.co/k2-fsa/OmniVoice/resolve/main/model.safetensors"
set "SORTIE=C:\Users\zakaria\.cache\huggingface\hub\models--k2-fsa--OmniVoice\snapshots\c5fdb5ccb189668d56333f77ba2629f4cd7535f4\model.safetensors"
curl.exe -L -C - --retry 10 --retry-delay 3 --retry-all-errors -o "%SORTIE%" "%URL%"
echo Termine. Taille attendue : 2450 Mo.
pause
