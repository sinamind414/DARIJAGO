// Test definitif : prompt = TEXTE ARABE SEUL (aucune instruction, aucun prefixe).
import fs from 'node:fs/promises';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, apiVersion: 'v1beta' });

const AR = 'راني عطشان بزاف';
const MODELES = ['gemini-2.5-flash-preview-tts', 'gemini-2.5-pro-preview-tts'];

for (const modele of MODELES) {
  try {
    const resp = await ai.models.generateContent({
      model: modele,
      contents: [{ role: 'user', parts: [{ text: AR }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    const b64 = resp.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!b64) {
      console.log(`${modele} : AUCUN AUDIO -> ${JSON.stringify(resp).slice(0, 300)}`);
      continue;
    }
    const nom = `verif-propre-${modele}.wav`;
    await fs.writeFile(nom, Buffer.from(b64, 'base64'));
    console.log(`${modele} : OK -> ${nom}`);
  } catch (err) {
    console.log(`${modele} : ERREUR ${err instanceof Error ? err.message : err}`);
  }
  await new Promise((r) => setTimeout(r, 3000));
}