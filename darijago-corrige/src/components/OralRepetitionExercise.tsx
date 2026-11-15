import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeftRight,
  CheckCircle2,
  Mic,
  Play,
  RotateCcw,
  Square,
  Turtle,
  Volume2,
} from 'lucide-react';
import type { AppLanguage, DarijaPhrase } from '../types/darija';
import { ORAL_TRANSLATIONS } from '../i18n/oralTranslations';
import { playDarijaPronunciation, stopAllAudio } from '../utils/audioPlayer';
import {
  comparePronunciation,
  formatRecordingDuration,
  getSpeechRecognitionConstructor,
  type PronunciationComparisonResult,
  type SpeechRecognitionLocale,
  type WebSpeechRecognitionInstance,
} from '../utils/pronunciationLogic';

interface OralRepetitionExerciseProps {
  phrase: DarijaPhrase;
  language: AppLanguage;
  onPracticeSuccess: () => void;
}

export function OralRepetitionExercise({
  phrase,
  language,
  onPracticeSuccess,
}: OralRepetitionExerciseProps) {
  const oT = ORAL_TRANSLATIONS[language];
  const speechSupported = Boolean(getSpeechRecognitionConstructor());

  const [recognitionLocale, setRecognitionLocale] =
    useState<SpeechRecognitionLocale>('ar-DZ');
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedDurationSec, setRecordedDurationSec] = useState(0);
  const [comparison, setComparison] =
    useState<PronunciationComparisonResult | null>(null);
  const [awardedForAttempt, setAwardedForAttempt] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const [playbackMode, setPlaybackMode] = useState<
    'native' | 'native-slow' | 'mine' | 'compare-native' | 'compare-mine' | null
  >(null);

  const [manualText, setManualText] = useState('');

  const recognitionRef = useRef<WebSpeechRecognitionInstance | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const compareTimerRef = useRef<number | null>(null);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);
  const recordedUrlRef = useRef<string | null>(null);
  const startTimestampRef = useRef<number>(0);

  const stopRecordingTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopCompareTimer = useCallback(() => {
    if (compareTimerRef.current !== null) {
      window.clearTimeout(compareTimerRef.current);
      compareTimerRef.current = null;
    }
  }, []);

  const stopUserAudio = useCallback(() => {
    if (userAudioRef.current) {
      userAudioRef.current.pause();
      userAudioRef.current.currentTime = 0;
      userAudioRef.current = null;
    }
  }, []);

  const releaseMediaTracks = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  const stopAllCapture = useCallback(() => {
    stopRecordingTimer();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore stop errors on already-ended recognition
      }
      recognitionRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    mediaRecorderRef.current = null;
    releaseMediaTracks();
    setIsRecording(false);
  }, [releaseMediaTracks, stopRecordingTimer]);

  useEffect(() => {
    return () => {
      stopAllCapture();
      stopAllAudio();
      stopUserAudio();
      stopCompareTimer();
      if (recordedUrlRef.current) {
        URL.revokeObjectURL(recordedUrlRef.current);
        recordedUrlRef.current = null;
      }
    };
  }, [stopAllCapture, stopCompareTimer, stopUserAudio]);

  const applyComparison = useCallback(
    (transcript: string) => {
      const result = comparePronunciation(transcript, phrase);
      setComparison(result);
      if (result.score >= 60 && !awardedForAttempt) {
        setAwardedForAttempt(true);
        onPracticeSuccess();
      }
    },
    [awardedForAttempt, onPracticeSuccess, phrase]
  );

  const handlePlayNative = (slow: boolean) => {
    stopCompareTimer();
    stopUserAudio();
    void playDarijaPronunciation({
      textArabic: phrase.darijaArabic,
      textLatin: phrase.darijaLatin,
      phoneticFrench: phrase.phoneticFrench,
      slow,
      language,
      onStart: () => setPlaybackMode(slow ? 'native-slow' : 'native'),
      onEnd: () =>
        setPlaybackMode((cur) =>
          cur === 'native' || cur === 'native-slow' ? null : cur
        ),
    });
  };

  const playRecordedAudio = (
    mode: 'mine' | 'compare-mine',
    onFinish?: () => void
  ) => {
    if (!recordedAudioUrl) {
      onFinish?.();
      return;
    }
    stopAllAudio();
    stopUserAudio();
    const audio = new Audio(recordedAudioUrl);
    userAudioRef.current = audio;
    setPlaybackMode(mode);
    audio.onended = () => {
      userAudioRef.current = null;
      setPlaybackMode(null);
      onFinish?.();
    };
    audio.onerror = () => {
      userAudioRef.current = null;
      setPlaybackMode(null);
      onFinish?.();
    };
    void audio.play().catch(() => {
      userAudioRef.current = null;
      setPlaybackMode(null);
      onFinish?.();
    });
  };

  const handleCompareSideBySide = () => {
    if (!recordedAudioUrl) return;
    stopCompareTimer();
    stopUserAudio();
    void playDarijaPronunciation({
      textArabic: phrase.darijaArabic,
      textLatin: phrase.darijaLatin,
      phoneticFrench: phrase.phoneticFrench,
      slow: false,
      language,
      onStart: () => setPlaybackMode('compare-native'),
      onEnd: () => {
        compareTimerRef.current = window.setTimeout(() => {
          playRecordedAudio('compare-mine');
        }, 420);
      },
    });
  };

  const handleClearAttempt = () => {
    stopAllCapture();
    stopCompareTimer();
    stopUserAudio();
    if (recordedUrlRef.current) {
      URL.revokeObjectURL(recordedUrlRef.current);
      recordedUrlRef.current = null;
    }
    setRecordedAudioUrl(null);
    setRecordedDurationSec(0);
    setInterimTranscript('');
    setComparison(null);
    setSpeechError(null);
    setManualText('');
  };

  const handleToggleRecord = async () => {
    if (isRecording) {
      stopAllCapture();
      return;
    }

    stopCompareTimer();
    stopAllAudio();
    stopUserAudio();
    setPlaybackMode(null);
    setSpeechError(null);
    setInterimTranscript('');

    if (recordedUrlRef.current) {
      URL.revokeObjectURL(recordedUrlRef.current);
      recordedUrlRef.current = null;
    }
    setRecordedAudioUrl(null);
    setRecordedDurationSec(0);
    setComparison(null);

    const SpeechCtor = getSpeechRecognitionConstructor();
    let startedAnyCapture = false;

    if (
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      typeof MediaRecorder !== 'undefined'
    ) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        const recorder = new MediaRecorder(stream);
        chunksRef.current = [];

        recorder.ondataavailable = (ev) => {
          if (ev.data.size > 0) chunksRef.current.push(ev.data);
        };

        recorder.onstop = () => {
          const duration = Math.max(
            1,
            Math.round((Date.now() - startTimestampRef.current) / 1000)
          );
          if (chunksRef.current.length > 0) {
            const blob = new Blob(chunksRef.current, {
              type: recorder.mimeType || 'audio/webm',
            });
            const url = URL.createObjectURL(blob);
            recordedUrlRef.current = url;
            setRecordedAudioUrl(url);
            setRecordedDurationSec(duration);
          }
          releaseMediaTracks();
        };

        mediaRecorderRef.current = recorder;
        recorder.start();
        startedAnyCapture = true;
      } catch {
        setSpeechError(oT.micDeniedNote);
      }
    }

    if (SpeechCtor) {
      try {
        const recognition = new SpeechCtor();
        recognition.lang = recognitionLocale;
        recognition.interimResults = true;
        recognition.continuous = false;
        recognition.maxAlternatives = 3;

        let latestBest = '';
        let finalized = false;

        recognition.onresult = (event) => {
          let interim = '';
          let finalCandidate = '';

          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            if (!result || result.length === 0) continue;
            if (result.isFinal) {
              let bestAlt = result[0].transcript;
              let bestScore = comparePronunciation(bestAlt, phrase).score;
              for (let a = 1; a < result.length; a++) {
                const altText = result[a]?.transcript ?? '';
                const altScore = comparePronunciation(altText, phrase).score;
                if (altScore > bestScore) {
                  bestScore = altScore;
                  bestAlt = altText;
                }
              }
              finalCandidate += ` ${bestAlt}`;
            } else {
              interim += ` ${result[0].transcript}`;
            }
          }

          const combined = `${finalCandidate} ${interim}`.trim();
          latestBest = combined;
          setInterimTranscript(combined);

          if (finalCandidate.trim()) {
            finalized = true;
            applyComparison(finalCandidate.trim());
          }
        };

        recognition.onerror = (ev) => {
          if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
            setSpeechError(oT.micDeniedNote);
          } else if (ev.error === 'no-speech') {
            setSpeechError(oT.noSpeechNote);
          } else if (ev.error === 'network') {
            setSpeechError(oT.networkSpeechNote);
          } else if (ev.error !== 'aborted') {
            setSpeechError(oT.networkSpeechNote);
          }
        };

        recognition.onend = () => {
          if (!finalized && latestBest.trim()) {
            finalized = true;
            applyComparison(latestBest.trim());
          }
          recognitionRef.current = null;
          if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state !== 'inactive'
          ) {
            try {
              mediaRecorderRef.current.stop();
            } catch {
              // ignore
            }
          }
          stopRecordingTimer();
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        startedAnyCapture = true;
      } catch {
        setSpeechError(oT.unsupportedSpeechNote);
      }
    } else if (!startedAnyCapture) {
      setSpeechError(oT.unsupportedSpeechNote);
    }

    if (startedAnyCapture) {
      startTimestampRef.current = Date.now();
      setElapsedSec(0);
      setIsRecording(true);
      timerRef.current = window.setInterval(() => {
        setElapsedSec((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleManualCompare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) return;
    setSpeechError(null);
    setInterimTranscript(manualText.trim());
    applyComparison(manualText.trim());
  };

  const tierTone =
    comparison?.tier === 'excellent'
      ? 'bg-[#F7F9F2] dark:bg-[#202B1E] border-[#C7D2B0] dark:border-[#3D4F30] text-[#4E6231] dark:text-[#A5C178]'
      : comparison?.tier === 'good'
        ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-[#A86B22] dark:text-amber-300'
        : 'bg-red-50/70 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-[#B9382C] dark:text-red-300';

  const tierSummary =
    comparison?.tier === 'excellent'
      ? oT.tierExcellent
      : comparison?.tier === 'good'
        ? oT.tierGood
        : oT.tierRetry;

  return (
    <section
      data-testid="oral-repetition-exercise"
      aria-label={oT.cardTitle}
      className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-5 sm:p-6 space-y-5"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base sm:text-lg font-extrabold text-[#23201C] dark:text-slate-100">
              {oT.cardTitle}
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F5F1E8] dark:bg-[#1D2622] border border-[#E4DFD2] dark:border-[#2A352F] text-[#4E6231] dark:text-[#A5C178]">
              {oT.badgeLabel}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#686259] dark:text-slate-400">
            {oT.cardSubtitle}
          </p>
        </div>

        {/* Recognition Locale Pill Switch */}
        <div
          role="group"
          aria-label={oT.localeLabel}
          className="inline-flex items-center gap-1 p-1 rounded-full bg-[#EFECE4] dark:bg-[#1D2622] border border-[#E4DFD2] dark:border-[#2A352F]"
        >
          {(
            [
              { code: 'ar-DZ' as const, label: oT.localeArDz },
              { code: 'fr-FR' as const, label: oT.localeFr },
            ] as const
          ).map((item) => {
            const active = recognitionLocale === item.code;
            return (
              <button
                key={item.code}
                type="button"
                data-testid={`oral-locale-${item.code}`}
                onClick={() => setRecognitionLocale(item.code)}
                disabled={isRecording}
                aria-pressed={active}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60 ${
                  active
                    ? 'bg-white dark:bg-[#26322B] text-[#23201C] dark:text-white shadow-xs'
                    : 'text-[#686259] dark:text-slate-400 hover:text-[#23201C] dark:hover:text-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 1 & Step 2 Side-by-Side Studio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Step 1: Native Model */}
        <div className="p-4 rounded-2xl bg-[#F7F9F2] dark:bg-[#1D2622] border border-[#E4DFD2] dark:border-[#2A352F] space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="block text-xs font-bold uppercase tracking-wider text-[#4E6231] dark:text-[#A5C178]">
              {oT.nativeStepLabel}
            </span>

            <div className="space-y-1">
              <p className="font-display text-base font-bold text-[#23201C] dark:text-slate-100">
                {phrase.darijaLatin}
              </p>
              <p
                className="font-arabic text-base text-[#686259] dark:text-slate-300 text-left"
                lang="ar"
                dir="rtl"
              >
                {phrase.darijaArabic}
              </p>
              <p className="text-xs font-mono text-[#4E6231] dark:text-[#A5C178]">
                [{phrase.phoneticFrench}]
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              data-testid="oral-play-native-btn"
              onClick={() => handlePlayNative(false)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                playbackMode === 'native' || playbackMode === 'compare-native'
                  ? 'bg-[#4E6231] text-white'
                  : 'bg-[#5C723C] hover:bg-[#4E6231] text-white'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                {playbackMode === 'native' || playbackMode === 'compare-native'
                  ? oT.listeningNative
                  : oT.listenNative}
              </span>
            </button>

            <button
              type="button"
              data-testid="oral-play-slow-btn"
              onClick={() => handlePlayNative(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border whitespace-nowrap shrink-0 cursor-pointer ${
                playbackMode === 'native-slow'
                  ? 'bg-[#5C723C] text-white border-[#5C723C]'
                  : 'bg-white dark:bg-[#171E1B] border-[#E4DFD2] dark:border-[#2A352F] text-[#23201C] dark:text-slate-200 hover:border-[#5C723C]'
              }`}
            >
              <Turtle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{oT.listenSlow}</span>
            </button>
          </div>
        </div>

        {/* Step 2: Record Your Voice */}
        <div className="p-4 rounded-2xl bg-[#F5F1E8]/70 dark:bg-[#1D2622] border border-[#E4DFD2] dark:border-[#2A352F] space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C68335] dark:text-amber-400">
                {oT.recordStepLabel}
              </span>
              {(isRecording || recordedDurationSec > 0) && (
                <span className="font-mono text-xs font-semibold tabular-nums text-[#23201C] dark:text-slate-200">
                  {formatRecordingDuration(
                    isRecording ? elapsedSec : recordedDurationSec
                  )}
                </span>
              )}
            </div>

            {isRecording ? (
              <p
                role="status"
                className="text-xs font-medium text-[#C68335] dark:text-amber-300"
              >
                {oT.listeningLive}
              </p>
            ) : interimTranscript ? (
              <p className="text-xs text-[#23201C] dark:text-slate-200">
                <span className="text-[#686259] dark:text-slate-400">
                  {oT.liveTranscriptLabel}{' '}
                </span>
                <span className="font-semibold">
                  « <bdi>{interimTranscript}</bdi> »
                </span>
              </p>
            ) : (
              <p className="text-xs text-[#686259] dark:text-slate-400">
                {oT.noRecordingYet}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              data-testid="oral-record-btn"
              onClick={handleToggleRecord}
              aria-pressed={isRecording}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                isRecording
                  ? 'bg-[#B9382C] hover:bg-[#9E2E24] text-white'
                  : 'bg-[#C68335] hover:bg-[#B2732B] text-white'
              }`}
            >
              {isRecording ? (
                <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
              ) : (
                <Mic className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <span>{isRecording ? oT.stopRecord : oT.startRecord}</span>
            </button>

            {(recordedAudioUrl || comparison || speechError) && !isRecording && (
              <button
                type="button"
                data-testid="oral-clear-btn"
                onClick={handleClearAttempt}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-[#E4DFD2] dark:border-[#2A352F] bg-white dark:bg-[#171E1B] text-[#686259] dark:text-slate-300 hover:text-[#23201C] dark:hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{oT.clearAttempt}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Step 3: Side-by-Side Audio Comparator & Word-by-Word Score */}
      {(recordedAudioUrl || comparison) && (
        <div
          data-testid="oral-comparison-panel"
          className="p-4 rounded-2xl bg-[#F5F1E8]/50 dark:bg-[#131916] border border-[#E4DFD2] dark:border-[#2A352F] space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#23201C] dark:text-slate-200">
              {oT.compareTitle}
            </h4>

            {recordedAudioUrl && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  data-testid="oral-play-mine-btn"
                  onClick={() => playRecordedAudio('mine')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border whitespace-nowrap shrink-0 cursor-pointer ${
                    playbackMode === 'mine' || playbackMode === 'compare-mine'
                      ? 'bg-[#C68335] text-white border-[#C68335]'
                      : 'bg-white dark:bg-[#171E1B] border-[#E4DFD2] dark:border-[#2A352F] text-[#23201C] dark:text-slate-100 hover:border-[#C68335]'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                  <span>
                    {playbackMode === 'mine' || playbackMode === 'compare-mine'
                      ? oT.playingMine
                      : oT.playMine}
                  </span>
                </button>

                <button
                  type="button"
                  data-testid="oral-compare-btn"
                  onClick={handleCompareSideBySide}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#5C723C] hover:bg-[#4E6231] text-white whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>
                    {playbackMode === 'compare-native' ||
                    playbackMode === 'compare-mine'
                      ? oT.comparingSequence
                      : oT.compareSequence}
                  </span>
                </button>
              </div>
            )}
          </div>

          {comparison && (
            <div className="space-y-3">
              <div
                role="status"
                data-testid="oral-comparison-score"
                className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-2 ${tierTone}`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    {comparison.tier === 'excellent' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    )}
                    <span className="text-sm font-bold">{tierSummary}</span>
                  </div>
                  <p className="text-xs opacity-90">
                    {oT.recognizedTextLabel} « <bdi>{comparison.transcript}</bdi> »
                  </p>
                  {awardedForAttempt && (
                    <p className="text-xs font-semibold">{oT.xpEarnedNote}</p>
                  )}
                </div>

                <span className="font-display text-lg font-extrabold tabular-nums">
                  {oT.scoreLabel(comparison.score)}
                </span>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-[#686259] dark:text-slate-400">
                  {oT.wordMatchTitle}
                </p>
                <div
                  dir={comparison.scriptMode === 'arabic' ? 'rtl' : 'ltr'}
                  className="flex flex-wrap gap-2"
                >
                  {comparison.tokenMatches.map((item, idx) => (
                    <span
                      key={`${item.token}-${idx}`}
                      lang={comparison.scriptMode === 'arabic' ? 'ar' : undefined}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        item.matched
                          ? 'bg-[#E5EBD6]/80 dark:bg-[#243220] border-[#C7D2B0] dark:border-[#3D4F30] text-[#4E6231] dark:text-[#A5C178]'
                          : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-[#A86B22] dark:text-amber-300'
                      }`}
                    >
                      {item.matched ? (
                        <CheckCircle2 className="w-3 h-3 shrink-0" aria-hidden="true" />
                      ) : (
                        <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
                      )}
                      <span>{item.token}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Web Speech Capability Notice + Fallback Text Comparator */}
      {(!speechSupported || speechError) && (
        <div
          role="status"
          data-testid="oral-speech-notice"
          className="p-3.5 rounded-xl bg-[#F5F1E8] dark:bg-[#1D2622] border border-[#E4DFD2] dark:border-[#2A352F] space-y-3 text-xs text-[#686259] dark:text-slate-300"
        >
          <div className="flex items-start gap-2">
            <AlertCircle
              className="w-4 h-4 text-[#C68335] dark:text-amber-400 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <p>{speechError || oT.unsupportedSpeechNote}</p>
          </div>

          <form
            onSubmit={handleManualCompare}
            className="flex flex-col sm:flex-row gap-2"
          >
            <label htmlFor={`oral-fallback-${phrase.id}`} className="sr-only">
              {oT.manualFallbackLabel}
            </label>
            <input
              id={`oral-fallback-${phrase.id}`}
              data-testid="oral-fallback-input"
              type="text"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder={oT.manualFallbackPlaceholder}
              className="flex-1 px-3 py-2 rounded-xl border border-[#E4DFD2] dark:border-[#2A352F] bg-white dark:bg-[#171E1B] text-[#23201C] dark:text-slate-100 placeholder:text-[#8E867B] focus:outline-none focus:ring-2 focus:ring-[#5C723C]"
            />
            <button
              type="submit"
              data-testid="oral-fallback-submit"
              className="px-4 py-2 rounded-xl bg-[#5C723C] hover:bg-[#4E6231] text-white font-semibold whitespace-nowrap shrink-0 cursor-pointer"
            >
              {oT.manualFallbackButton}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
