// Test TTS : genere un clip via le serveur et verifie le format audio.
const resp = await fetch('http://localhost:3000/api/tts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    textArabic: 'راني عطشان بزاف',
    textLatin: 'rani atchan bezzaf',
    slow: false,
    language: 'fr',
    voiceName: 'Kore',
  }),
});
const data = await resp.json();
if (data.audioBase64) {
  console.log('OK - audio genere');
  console.log('  mimeType :', data.mimeType);
  console.log('  cached   :', data.cached);
  console.log('  taille   :', Math.round(data.audioBase64.length * 0.75), 'octets');
} else {
  console.log('ECHEC :', JSON.stringify(data));
}
