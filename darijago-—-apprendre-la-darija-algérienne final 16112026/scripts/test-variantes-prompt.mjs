// Test A/B/C : quelle formulation de prompt fait dire a Gemini UNIQUEMENT la phrase ?
import fs from 'node:fs/promises';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, apiVersion: 'v1beta' });

const AR = 'راني عطشان بزاف';
const VARIANTES = {
  A_arabic_only: {
    text: AR,
    style: null,
  },
  B_arabic_only_with_style: {
    text: AR,
    style: 'Native Algerian Darija speaker pronouncing naturally and clearly with authentic Maghrebi cadence.',
  },
  C_prefix_say: {
    text: `Say in Algerian Darija: ${AR}`,
    style: null,
  },
};

for (const [nom, v] of Object.entries(VARIANTES)) {
  try {
    const parts = [{ text: v.text }];
    if (v.style) parts[0].speechMetadata = { style: v.style };

    const resp = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [{ role: 'user', parts }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    const b64 = resp.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!b64) {
      console.log(`${nom} : AUCUN AUDIO`);
      continue;
    }
    await fs.writeFile(`verif-variante-${nom}.wav`, Buffer.from(b64, 'base64'));
    console.log(`${nom} : OK -> verif-variante-${nom}.wav`);
  } catch (err) {
    console.log(`${nom} : ERREUR ${err instanceof Error ? err.message : err}`);
  }
  await new Promise((r) => setTimeout(r, 4000));
}