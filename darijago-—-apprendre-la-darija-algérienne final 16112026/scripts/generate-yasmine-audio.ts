import 'dotenv/config';
import { execFile } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { GoogleGenAI } from '@google/genai';
import { ARABIZI_SOUNDS, CURRICULUM_MODULES } from '../src/data/curriculum';
import { BEN_SEDIRA_DICTIONARY } from '../src/data/benSediraDictionary';
import { TADJER_VERBS } from '../src/data/tadjerVerbs';
import { TAPIERO_VERBS } from '../src/data/tapieroVerbs';
import { buildVerbConjugationIndex } from '../src/utils/conjugationLogic';
import { formatBenSediraLatinForSpeech } from '../src/utils/darijaSpeechFormat';

const execFileAsync = promisify(execFile);

const ROOT_DIR = process.cwd();
const AUDIO_CACHE_DIR = path.join(ROOT_DIR, '.audio-cache');
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'audio', 'yasmine');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json');
/** Modele TTS : 2.5-flash-preview-tts (quota dispo) ; 3.8-flash-lite-tts = quota epuise. */
const TTS_MODEL = process.env.DARIJA_TTS_MODEL || 'gemini-2.5-flash-preview-tts';

export interface YasmineManifestClip {
  id: string;
  ar: string;
  lat: string;
  speed: 'normal' | 'slow';
  file: string;
  mimeType: string;
  bytes: number;
  category: 'lesson' | 'sound' | 'dictionary' | 'conjugation';
}

export interface YasmineStaticManifest {
  version: number;
  voice: 'Kore';
  speakerName: string;
  city: string;
  generatedAt: string;
  totalTargets: number;
  clips: YasmineManifestClip[];
}

interface ClipTarget {
  ar: string;
  lat: string;
  speed: 'normal' | 'slow';
  category: YasmineManifestClip['category'];
}

function formatServerSpokenTarget(textArabic?: string, textLatin?: string): string {
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

function buildServerDiskCacheHash(ar: string, lat: string, slow: boolean): string {
  return crypto
    .createHash('sha256')
    .update(
      JSON.stringify({
        v: 5,
        spokenText: formatServerSpokenTarget(ar, lat),
        textLatin: lat.trim(),
        slow,
        voiceName: 'Kore',
      })
    )
    .digest('hex');
}

function buildStaticClipId(ar: string, lat: string, speed: 'normal' | 'slow'): string {
  return crypto
    .createHash('sha256')
    .update(
      JSON.stringify({
        v: 1,
        voice: 'Kore',
        speed,
        ar: ar.trim(),
        lat: formatBenSediraLatinForSpeech(lat),
      })
    )
    .digest('hex')
    .slice(0, 16);
}

function collectTargets(): ClipTarget[] {
  const seen = new Set<string>();
  const targets: ClipTarget[] = [];

  const pushTarget = (
    ar: string,
    lat: string,
    category: YasmineManifestClip['category'],
    speed: 'normal' | 'slow' = 'normal'
  ) => {
    const cleanAr = ar.trim();
    const cleanLat = formatBenSediraLatinForSpeech(lat);
    if (!cleanAr && !cleanLat) return;
    const id = buildStaticClipId(cleanAr, cleanLat, speed);
    if (seen.has(id)) return;
    seen.add(id);
    targets.push({ ar: cleanAr, lat: cleanLat, speed, category });
  };

  // 1. All core lesson phrases (7 modules · 42 phrases)
  for (const mod of CURRICULUM_MODULES) {
    for (const phrase of mod.phrases) {
      pushTarget(phrase.darijaArabic, phrase.darijaLatin, 'lesson', 'normal');
    }
  }

  // 2. All Arabizi sound examples
  for (const sound of ARABIZI_SOUNDS) {
    pushTarget(sound.exampleArabic, sound.exampleDarija, 'sound', 'normal');
  }

  // 3. Phrase breakdown words
  for (const mod of CURRICULUM_MODULES) {
    for (const phrase of mod.phrases) {
      for (const part of phrase.breakdown) {
        pushTarget(part.arabic, part.darija, 'dictionary', 'normal');
      }
    }
  }

  // 4. Story focus words & core dictionary examples
  pushTarget('كول', 'koul', 'dictionary', 'normal');
  pushTarget('أتاي', 'atay', 'dictionary', 'normal');
  pushTarget('شحال', 'ch7al', 'dictionary', 'normal');
  pushTarget('لاباس', 'Labes', 'dictionary', 'normal');

  // 5. Verb conjugation index + examples
  for (const item of buildVerbConjugationIndex(BEN_SEDIRA_DICTIONARY)) {
    pushTarget(
      item.arabicTriple.spokenTripleArabic,
      item.entry.darijaLatin,
      'conjugation',
      'normal'
    );
    if (item.entry.conjugation) {
      pushTarget(
        item.arabicTriple.present1sArabic,
        item.entry.conjugation.present1s,
        'conjugation',
        'normal'
      );
      pushTarget(
        item.arabicTriple.past1sArabic,
        item.entry.conjugation.past1s,
        'conjugation',
        'normal'
      );
      pushTarget(
        item.arabicTriple.past3msArabic,
        item.entry.conjugation.past3ms,
        'conjugation',
        'normal'
      );
    }
    if (item.entry.exampleDarija) {
      pushTarget(
        item.entry.exampleArabic ?? '',
        item.entry.exampleDarija,
        'dictionary',
        'normal'
      );
    }
  }

  for (const list of [BEN_SEDIRA_DICTIONARY, TAPIERO_VERBS, TADJER_VERBS]) {
    for (const entry of list) {
      pushTarget(entry.darijaArabic, entry.darijaLatin, 'dictionary', 'normal');
      if (entry.exampleDarija) {
        pushTarget(entry.exampleArabic ?? '', entry.exampleDarija, 'dictionary', 'normal');
      }
    }
  }

  return targets;
}

async function fileExists(p: string): Promise<boolean> {
  try {
    const stat = await fs.stat(p);
    return stat.size > 0;
  } catch {
    return false;
  }
}

async function convertWavToMp3(wavPath: string, mp3Path: string): Promise<number> {
  await execFileAsync('ffmpeg', [
    '-y',
    '-i',
    wavPath,
    '-ac',
    '1',
    '-ar',
    '24000',
    '-c:a',
    'libmp3lame',
    '-b:a',
    '32k',
    mp3Path,
  ]);
  const stat = await fs.stat(mp3Path);
  return stat.size;
}

/** Enveloppe du PCM L16 dans un conteneur WAV lisible par ffmpeg et les navigateurs. */
function pcmToWav(pcm: Buffer, sampleRate = 24000, channels = 1): Buffer {
  const dataSize = pcm.length;
  const out = Buffer.alloc(44 + dataSize);
  out.write('RIFF', 0);
  out.writeUInt32LE(36 + dataSize, 4);
  out.write('WAVE', 8);
  out.write('fmt ', 12);
  out.writeUInt32LE(16, 16);
  out.writeUInt16LE(1, 20);
  out.writeUInt16LE(channels, 22);
  out.writeUInt32LE(sampleRate, 24);
  out.writeUInt32LE(sampleRate * channels * 2, 28);
  out.writeUInt16LE(channels * 2, 32);
  out.writeUInt16LE(16, 34);
  out.write('data', 36);
  out.writeUInt32LE(dataSize, 40);
  pcm.copy(out, 44);
  return out;
}

async function generateWithGeminiKore(
  ai: GoogleGenAI,
  target: ClipTarget
): Promise<Buffer | null> {
  const spokenText = formatServerSpokenTarget(target.ar, target.lat);
  if (!spokenText) return null;

  // IMPORTANT : le prompt ne contient QUE le texte a prononcer.
  // Toute instruction ajoutee est lue a voix haute par le modele TTS (defaut constate).
  const response = await ai.models.generateContent({
    model: TTS_MODEL,
    contents: [{ role: 'user', parts: [{ text: spokenText }] }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const part = response.candidates?.[0]?.content?.parts?.find(
    (p: { inlineData?: { data?: string } }) => p.inlineData?.data
  );
  const base64 = part?.inlineData?.data;
  if (!base64) return null;

  const pcm = Buffer.from(base64, 'base64');
  const mt = (part?.inlineData?.mimeType || '').toLowerCase();
  const isRawPcm = mt.includes('l16') || mt.includes('pcm') || mt === '';
  return isRawPcm ? pcmToWav(pcm) : pcm;
}

async function main() {
  const shouldGenerate = process.argv.includes('--generate');
  const maxGenerateArg = process.argv.find((arg) => arg.startsWith('--limit='));
  const maxGenerate = maxGenerateArg ? Number(maxGenerateArg.split('=')[1]) : 500;
  const delayArg = process.argv.find((arg) => arg.startsWith('--delay='));
  const delayMs = delayArg ? Number(delayArg.split('=')[1]) : 15000;
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(AUDIO_CACHE_DIR, { recursive: true });

  const targets = collectTargets();
  const apiKey = process.env.GEMINI_API_KEY;
  const ai =
    shouldGenerate && apiKey && apiKey !== 'MY_GEMINI_API_KEY'
      ? new GoogleGenAI({ apiKey, apiVersion: 'v1beta' })
      : null;

  const clips: YasmineManifestClip[] = [];
  let generatedCount = 0;
  let exportedFromCache = 0;
  let quotaStopped = false;

  for (const target of targets) {
    const id = buildStaticClipId(target.ar, target.lat, target.speed);
    const mp3Filename = `${id}.mp3`;
    const mp3Path = path.join(OUTPUT_DIR, mp3Filename);

    if (await fileExists(mp3Path)) {
      const stat = await fs.stat(mp3Path);
      clips.push({
        id,
        ar: target.ar,
        lat: target.lat,
        speed: target.speed,
        file: `/audio/yasmine/${mp3Filename}`,
        mimeType: 'audio/mpeg',
        bytes: stat.size,
        category: target.category,
      });
      continue;
    }

    // Check server disk cache (.audio-cache) under both normalized and raw latin keys
    const candidateDiskHashes = Array.from(
      new Set([
        buildServerDiskCacheHash(target.ar, target.lat, target.speed === 'slow'),
        buildServerDiskCacheHash(target.ar, target.lat.trim(), target.speed === 'slow'),
      ])
    );

    let matchedWavPath: string | null = null;
    for (const diskHash of candidateDiskHashes) {
      const wavCandidate = path.join(AUDIO_CACHE_DIR, `${diskHash}.wav`);
      if (await fileExists(wavCandidate)) {
        matchedWavPath = wavCandidate;
        break;
      }
    }

    if (matchedWavPath) {
      const bytes = await convertWavToMp3(matchedWavPath, mp3Path);
      exportedFromCache += 1;
      clips.push({
        id,
        ar: target.ar,
        lat: target.lat,
        speed: target.speed,
        file: `/audio/yasmine/${mp3Filename}`,
        mimeType: 'audio/mpeg',
        bytes,
        category: target.category,
      });
      continue;
    }

    if (ai && !quotaStopped && generatedCount < maxGenerate) {
      let attempt = 0;
      const maxAttempts = 4;
      while (attempt < maxAttempts && generatedCount < maxGenerate && !quotaStopped) {
        attempt += 1;
        try {
          const wavBuf = await generateWithGeminiKore(ai, target);
          if (wavBuf && wavBuf.length > 44) {
            const diskHash = candidateDiskHashes[0];
            const wavPath = path.join(AUDIO_CACHE_DIR, `${diskHash}.wav`);
            await fs.writeFile(wavPath, wavBuf);
            const bytes = await convertWavToMp3(wavPath, mp3Path);
            generatedCount += 1;
            clips.push({
              id,
              ar: target.ar,
              lat: target.lat,
              speed: target.speed,
              file: `/audio/yasmine/${mp3Filename}`,
              mimeType: 'audio/mpeg',
              bytes,
              category: target.category,
            });
          }
          break;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes('429') || msg.toLowerCase().includes('quota')) {
            if (attempt >= maxAttempts) {
              quotaStopped = true;
              console.warn(
                `Gemini TTS quota reached after ${attempt} attempts; stopping new generations cleanly.`
              );
            } else {
              const waitMs = 65_000;
              console.warn(
                `Quota/429 sur "${target.lat}" (essai ${attempt}/${maxAttempts}) — pause de 65 s puis nouvelle tentative...`
              );
              await sleep(waitMs);
            }
          } else {
            console.warn(`Failed clip ${target.lat}:`, msg);
            break;
          }
        }
      }
      if (quotaStopped) break;
      // Respect du quota gratuit : pause entre chaque generation
      if (delayMs > 0) await sleep(delayMs);
    }
  }

  const manifest: YasmineStaticManifest = {
    version: 1,
    voice: 'Kore',
    speakerName: 'Yasmine',
    city: 'Alger',
    generatedAt: new Date().toISOString(),
    totalTargets: targets.length,
    clips,
  };

  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(
    `Yasmine manifest written: ${clips.length} bundled clips (${exportedFromCache} exported from cache, ${generatedCount} newly generated) out of ${targets.length} total targets.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
