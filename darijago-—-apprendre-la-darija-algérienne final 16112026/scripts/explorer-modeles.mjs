// Explore la reponse brute de models.list + teste les modeles TTS candidats.
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, apiVersion: 'v1beta' });

const res = await ai.models.list();
console.log('--- REPONSE BRUTE (2000 car.) ---');
console.log(JSON.stringify(res).slice(0, 2000));