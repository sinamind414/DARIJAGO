// Liste les modeles TTS disponibles et leur etat.
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, apiVersion: 'v1beta' });

try {
  const res = await ai.models.list();
  const models = res.models ?? [];
  const tts = models.filter((m) => /tts|speech|audio/i.test(m.name || ''));
  console.log(`Total modeles: ${models.length} | candidats TTS: ${tts.length}`);
  for (const m of tts) {
    console.log(`- ${m.name} | ${m.displayName ?? ''}`);
  }
} catch (err) {
  console.log('ERREUR:', err instanceof Error ? err.message : err);
}