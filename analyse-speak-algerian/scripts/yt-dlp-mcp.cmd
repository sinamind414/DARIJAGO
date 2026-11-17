@echo off
rem Shim lanceur MCP yt-dlp : garantit que yt-dlp/ffmpeg/deno sont dans le PATH
rem quel que soit l'etat du PATH herite du service OpenCode.
set "PATH=%PATH%;C:\Users\zakaria\AppData\Local\Microsoft\WinGet\Packages\yt-dlp.yt-dlp_Microsoft.Winget.Source_8wekyb3d8bbwe"
set "PATH=%PATH%;C:\Users\zakaria\AppData\Local\Microsoft\WinGet\Packages\yt-dlp.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-N-127043-g5a54fcf75e-win64-gpl\bin"
set "PATH=%PATH%;C:\Users\zakaria\AppData\Local\Microsoft\WinGet\Packages\DenoLand.Deno_Microsoft.Winget.Source_8wekyb3d8bbwe"
call npx -y @kevinwatt/yt-dlp-mcp@latest %*
