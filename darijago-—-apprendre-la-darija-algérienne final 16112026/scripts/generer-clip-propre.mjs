// Genere un clip avec prompt = TEXTE ARABE SEUL, puis l'emballe en WAV.
// Verifie ensuite le contenu avec Whisper (gate qualite).
import fs from 'node:fs/promises';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, apiVersion: 'v1beta' });

function pcmToWav(pcm, sampleRate = 24000, channels = 1) {
  const dataSize = pcm.length;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(channels, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * channels * 2, 28);
  buf.writeUInt16LE(channels * 2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);
  pcm.copy(buf, 44);
  return buf;
}

const AR = process.argv[2] || 'راني عطشان بزاف';
const OUT = process.argv[3] || 'verif-propre.wav';

const resp = await ai.models.generateContent({
  model: 'gemini-2.5-flash-preview-tts',
  contents: [{ role: 'user', parts: [{ text: AR }] }],
  config: {
    responseModalities: ['AUDIO'],
    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
  },
});

const part = resp.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
const b64 = part?.inlineData?.data;
if (!b64) {
  console.log('ECHEC: aucun audio');
  process.exit(1);
}

const pcm = Buffer.from(b64, 'base64');
const wav = pcmToWav(pcm);
await fs.writeFile(OUT, wav);
console.log(`OK -> ${OUT} (${Math.round(wav.length / 1024)} Ko, ${(pcm.length / 2 / 24000).toFixed(2)}s)`);