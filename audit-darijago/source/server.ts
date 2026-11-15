import 'dotenv/config';
import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const AUDIO_CACHE_DIR = path.join(__dirname, '.audio-cache');
const ALLOWED_VOICES = new Set(['Kore', 'Charon', 'Puck', 'Fenrir', 'Zephyr']);
const inFlightTtsRequests = new Map<string, Promise<{ audioBase64: string; mimeType: string } | null>>();

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function getAiTtsClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    apiVersion: 'v1beta',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const LANGUAGE_NAMES: Record<string, string> = {
  fr: 'French',
  en: 'English',
  es: 'Spanish',
  de: 'German',
  it: 'Italian',
  nl: 'Dutch',
  zh: 'Simplified Chinese',
};

function getLearnerLanguageName(lang?: string): string {
  if (!lang) return 'French';
  return LANGUAGE_NAMES[lang] ?? 'French';
}

function sanitizeVoiceName(voiceName?: string): string {
  if (voiceName && ALLOWED_VOICES.has(voiceName)) {
    return voiceName;
  }
  return 'Kore';
}

function formatSpokenTarget(textArabic?: string, textLatin?: string): string {
  const cleanArabic = (textArabic || '')
    .replace(/\s*\/\s*/g, '، ')
    .replace(/\(.*?\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const cleanLatin = (textLatin || '')
    .replace(/\s*\/\s*/g, ', ')
    .replace(/\(.*?\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanArabic && cleanLatin) {
    return cleanArabic;
  }
  return cleanArabic || cleanLatin;
}

function buildTtsCacheKey(params: {
  spokenText: string;
  textLatin?: string;
  slow: boolean;
  voiceName: string;
}): string {
  return crypto
    .createHash('sha256')
    .update(
      JSON.stringify({
        v: 2,
        spokenText: params.spokenText,
        textLatin: (params.textLatin || '').trim(),
        slow: params.slow,
        voiceName: params.voiceName,
      })
    )
    .digest('hex');
}

async function readCachedWavBase64(cacheKey: string): Promise<string | null> {
  try {
    const filePath = path.join(AUDIO_CACHE_DIR, `${cacheKey}.wav`);
    const buf = await fs.readFile(filePath);
    if (buf.length > 44) {
      return buf.toString('base64');
    }
    return null;
  } catch {
    return null;
  }
}

async function writeCachedWavBase64(cacheKey: string, base64Audio: string): Promise<void> {
  try {
    await fs.mkdir(AUDIO_CACHE_DIR, { recursive: true });
    const filePath = path.join(AUDIO_CACHE_DIR, `${cacheKey}.wav`);
    await fs.writeFile(filePath, Buffer.from(base64Audio, 'base64'));
  } catch {
    // non-fatal disk cache write failure
  }
}

async function generateOrFetchNativeTts(params: {
  textArabic?: string;
  textLatin?: string;
  slow?: boolean;
  language?: string;
  voiceName?: string;
}): Promise<{
  audioBase64?: string;
  mimeType?: string;
  cached?: boolean;
  voiceName: string;
  fallbackRecommended?: boolean;
  reason?: string;
}> {
  const voiceName = sanitizeVoiceName(params.voiceName);
  const slow = Boolean(params.slow);
  const spokenText = formatSpokenTarget(params.textArabic, params.textLatin);

  if (!spokenText) {
    return {
      voiceName,
      fallbackRecommended: true,
      reason: 'Texte requis pour la lecture audio.',
    };
  }

  const cacheKey = buildTtsCacheKey({
    spokenText,
    textLatin: params.textLatin,
    slow,
    voiceName,
  });

  const cachedBase64 = await readCachedWavBase64(cacheKey);
  if (cachedBase64) {
    return {
      audioBase64: cachedBase64,
      mimeType: 'audio/wav',
      cached: true,
      voiceName,
    };
  }

  const ai = getAiTtsClient();
  if (!ai) {
    return {
      voiceName,
      fallbackRecommended: true,
      reason: 'Service vocal Gemini non configuré, lecture locale activée.',
    };
  }

  const existingPromise = inFlightTtsRequests.get(cacheKey);
  if (existingPromise) {
    const shared = await existingPromise;
    if (shared) {
      return {
        audioBase64: shared.audioBase64,
        mimeType: shared.mimeType,
        cached: false,
        voiceName,
      };
    }
  }

  const generationPromise = (async () => {
    const learnerLang = getLearnerLanguageName(params.language);
    const latinHint = (params.textLatin || '')
      .replace(/\s*\/\s*/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();

    const styleInstruction = slow
      ? `Native Algerian Darija speaker pronouncing slowly and clearly for a ${learnerLang} learner, articulating every syllable cleanly without extra words.`
      : 'Native Algerian Darija speaker pronouncing naturally and clearly with authentic Maghrebi cadence, speaking only the requested phrase.';

    const promptText =
      latinHint && params.textArabic?.trim()
        ? `Pronounce only this Algerian Darija expression (phonetic guide: "${latinHint}"):\n${spokenText}`
        : `Pronounce only this Algerian Darija expression:\n${spokenText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: promptText,
              speechMetadata: {
                style: styleInstruction,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    const base64Audio = part?.inlineData?.data;
    if (!base64Audio) {
      return null;
    }
    const mimeType = part?.inlineData?.mimeType || 'audio/wav';
    await writeCachedWavBase64(cacheKey, base64Audio);
    return { audioBase64: base64Audio, mimeType };
  })();

  inFlightTtsRequests.set(cacheKey, generationPromise);
  try {
    const generated = await generationPromise;
    if (!generated) {
      return {
        voiceName,
        fallbackRecommended: true,
        reason: 'Audio non généré par le modèle.',
      };
    }
    return {
      audioBase64: generated.audioBase64,
      mimeType: generated.mimeType,
      cached: false,
      voiceName,
    };
  } finally {
    inFlightTtsRequests.delete(cacheKey);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '8mb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, aiConfigured: Boolean(getAiClient()) });
  });

  // 1. Algerian Darija Text-to-Speech via Gemini TTS (with persistent WAV cache)
  app.post('/api/tts', async (req, res) => {
    try {
      const { textArabic, textLatin, slow, language, voiceName } = req.body as {
        textArabic?: string;
        textLatin?: string;
        slow?: boolean;
        language?: string;
        voiceName?: string;
      };

      const spoken = formatSpokenTarget(textArabic, textLatin);
      if (!spoken) {
        return res.status(400).json({ error: 'Texte requis pour la lecture audio.' });
      }

      const result = await generateOrFetchNativeTts({
        textArabic,
        textLatin,
        slow,
        language,
        voiceName,
      });

      return res.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur audio inconnue';
      return res.json({
        fallbackRecommended: true,
        reason: message,
      });
    }
  });

  // 1a. Binary WAV GET endpoint for direct browser Cache API persistence
  app.get('/api/tts/clip', async (req, res) => {
    try {
      const textArabic = typeof req.query.ar === 'string' ? req.query.ar : '';
      const textLatin = typeof req.query.lat === 'string' ? req.query.lat : '';
      const slow = req.query.speed === 'slow' || req.query.slow === 'true' || req.query.slow === '1';
      const language = typeof req.query.lang === 'string' ? req.query.lang : 'fr';
      const voiceName = typeof req.query.voice === 'string' ? req.query.voice : 'Kore';

      const spoken = formatSpokenTarget(textArabic, textLatin);
      if (!spoken) {
        return res.status(400).json({ error: 'Texte requis pour la lecture audio.' });
      }

      const result = await generateOrFetchNativeTts({
        textArabic,
        textLatin,
        slow,
        language,
        voiceName,
      });

      if (!result.audioBase64) {
        res.setHeader('X-Darija-Fallback', 'browser-speech');
        return res.status(204).end();
      }

      const audioBuffer = Buffer.from(result.audioBase64, 'base64');
      res.setHeader('Content-Type', result.mimeType || 'audio/wav');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('X-Darija-Voice', result.voiceName);
      return res.status(200).send(audioBuffer);
    } catch {
      res.setHeader('X-Darija-Fallback', 'browser-speech');
      return res.status(204).end();
    }
  });

  // 1b. Batch preload native speaker WAV clips for an active verb (optionally returning audio payloads for browser Cache API)
  app.post('/api/tts/preload', async (req, res) => {
    try {
      const { items, language, voiceName, includeAudio } = req.body as {
        items?: Array<{ textArabic?: string; textLatin?: string; slow?: boolean; voiceName?: string }>;
        language?: string;
        voiceName?: string;
        includeAudio?: boolean;
      };
      if (!Array.isArray(items) || items.length === 0) {
        return res.json({ preloaded: 0, clips: [] });
      }

      const capped = items.slice(0, 12);
      let preloaded = 0;
      let rateLimited = false;
      const clips: Array<{
        textArabic: string;
        textLatin: string;
        slow: boolean;
        voiceName: string;
        audioBase64: string;
        mimeType: string;
      }> = [];

      for (const item of capped) {
        try {
          const effectiveVoice = sanitizeVoiceName(item.voiceName || voiceName);
          const effectiveSlow = Boolean(item.slow);
          const result = await generateOrFetchNativeTts({
            textArabic: item.textArabic,
            textLatin: item.textLatin,
            slow: effectiveSlow,
            language,
            voiceName: effectiveVoice,
          });
          if (result.audioBase64) {
            preloaded += 1;
            if (includeAudio) {
              clips.push({
                textArabic: (item.textArabic || '').trim(),
                textLatin: (item.textLatin || '').trim(),
                slow: effectiveSlow,
                voiceName: result.voiceName,
                audioBase64: result.audioBase64,
                mimeType: result.mimeType || 'audio/wav',
              });
            }
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : '';
          if (msg.includes('429') || msg.toLowerCase().includes('quota')) {
            rateLimited = true;
            // Continue loop only for items that might already be cached on disk,
            // or break if we prefer; checking disk cache is fast, wait:
            // generateOrFetchNativeTts checks disk cache BEFORE calling Gemini!
          }
        }
      }
      return res.json({ preloaded, clips, rateLimited });
    } catch {
      return res.json({ preloaded: 0, clips: [], rateLimited: false });
    }
  });

  // 2. Interactive Algerian Darija Roleplay Dialogue
  app.post('/api/dialogue', async (req, res) => {
    try {
      const {
        scenarioTitle,
        partnerName,
        partnerRole,
        setting,
        history,
        userMessage,
        language,
      } = req.body as {
        scenarioTitle: string;
        partnerName: string;
        partnerRole: string;
        setting: string;
        history: Array<{ speaker: string; darijaLatin: string; frenchTranslation: string }>;
        userMessage: string;
        language?: string;
      };

      if (!userMessage || !userMessage.trim()) {
        return res.status(400).json({ error: 'Message cannot be empty.' });
      }

      const ai = getAiClient();
      if (!ai) {
        return res.status(503).json({
          error: 'Conversational assistant offline.',
          fallbackRecommended: true,
        });
      }

      const learnerLang = getLearnerLanguageName(language);
      const historySummary = (history || [])
        .slice(-6)
        .map((h) => `${h.speaker === 'learner' ? 'Learner' : partnerName}: ${h.darijaLatin} (${h.frenchTranslation})`)
        .join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Context: ${scenarioTitle} — ${setting}.
Your role: ${partnerName}, ${partnerRole} in Algeria.
Recent history:
${historySummary}

Learner message: "${userMessage.trim()}"

Reply as ${partnerName} in natural Algerian Darija (written in readable Arabizi with 3, 7, 9 where needed, and Arabic script). Then provide a natural translation in ${learnerLang}, a short 1-sentence coaching tip in ${learnerLang}, and 2 suggested Darija replies with their meanings in ${learnerLang}.`,
        config: {
          systemInstruction:
            `You are a warm, encouraging Algerian speaker helping a ${learnerLang} learner speak authentic Algerian Darija (Algiers/Oran/Constantine). Keep replies concise, natural, and encouraging. Write translations and coaching tips strictly in ${learnerLang}.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              replyDarija: {
                type: Type.STRING,
                description: 'Reply in Algerian Darija (clear Latin alphabet / Arabizi).',
              },
              replyArabic: {
                type: Type.STRING,
                description: 'Same reply in Arabic script.',
              },
              replyFrench: {
                type: Type.STRING,
                description: `Natural translation in ${learnerLang}.`,
              },
              coachingTip: {
                type: Type.STRING,
                description: `Short practical tip in ${learnerLang} (max 140 characters).`,
              },
              suggestedReplies: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    darijaLatin: { type: Type.STRING },
                    darijaArabic: { type: Type.STRING },
                    frenchMeaning: {
                      type: Type.STRING,
                      description: `Meaning in ${learnerLang}.`,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const raw = (response.text ?? '{}').trim();
      const parsed = JSON.parse(raw);
      return res.json(parsed);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Dialogue error';
      return res.status(500).json({ error: message, fallbackRecommended: true });
    }
  });

  // 3. Spoken Audio Transcription & Pronunciation Feedback
  app.post('/api/pronunciation-check', async (req, res) => {
    try {
      const { audioBase64, mimeType, targetDarija, targetFrench, language } = req.body as {
        audioBase64?: string;
        mimeType?: string;
        targetDarija: string;
        targetFrench: string;
        language?: string;
      };

      if (!audioBase64 || !targetDarija) {
        return res.status(400).json({ error: 'Audio recording and target phrase required.' });
      }

      const ai = getAiClient();
      if (!ai) {
        return res.status(503).json({
          error: 'Voice analysis unavailable without configured API key.',
        });
      }

      const learnerLang = getLearnerLanguageName(language);

      const transcriptionResp = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'audio/webm',
                data: audioBase64,
              },
            },
            {
              text: `Transcribe this audio of a learner trying to pronounce the Algerian Darija phrase: "${targetDarija}".`,
            },
          ],
        },
      });

      const transcript = (transcriptionResp.text ?? '').trim();

      const evalResp = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Target Algerian Darija phrase: "${targetDarija}" (meaning in ${learnerLang}: "${targetFrench}").
Heard / transcribed: "${transcript || '(inaudible)'}".
Kindly evaluate whether the pronunciation is understandable and give one concise tip (1-2 sentences) strictly in ${learnerLang} to improve their Algerian accent.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isGood: { type: Type.BOOLEAN },
              feedback: { type: Type.STRING },
            },
          },
        },
      });

      const evaluation = JSON.parse((evalResp.text ?? '{}').trim()) as {
        isGood?: boolean;
        feedback?: string;
      };

      return res.json({
        transcript,
        isGood: Boolean(evaluation.isGood),
        feedback: evaluation.feedback || '',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Voice analysis error';
      return res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`darijaGO server listening on http://localhost:${PORT}`);
  });
}

startServer();
