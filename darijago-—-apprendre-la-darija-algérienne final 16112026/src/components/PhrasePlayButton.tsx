import { useSyncExternalStore } from 'react';
import { Play, Square, Volume2 } from 'lucide-react';
import type { AppLanguage, DarijaPhrase } from '../types/darija';
import { EXPERIENCE_TRANSLATIONS } from '../i18n/experienceTranslations';
import {
  getWebSpeechPlaybackSnapshot,
  startPhraseWebSpeechPlayback,
  stopWebSpeechPlayback,
  subscribeWebSpeechPlayback,
  type WebSpeechScriptMode,
} from '../utils/webSpeechPlayer';

export interface PhrasePlayButtonProps {
  phrase: Pick<
    DarijaPhrase,
    'id' | 'darijaArabic' | 'darijaLatin' | 'phoneticFrench'
  >;
  language: AppLanguage;
  playbackId?: string;
  variant?: 'icon' | 'pill';
  size?: 'sm' | 'md';
  slow?: boolean;
  preferScript?: 'auto' | WebSpeechScriptMode;
  ariaLabelPlay?: string;
  ariaLabelStop?: string;
  testId?: string;
  onBeforePlay?: () => void;
  onComplete?: () => void;
}

export function PhrasePlayButton({
  phrase,
  language,
  playbackId,
  variant = 'icon',
  size = 'sm',
  slow = false,
  preferScript = 'auto',
  ariaLabelPlay,
  ariaLabelStop,
  testId,
  onBeforePlay,
  onComplete,
}: PhrasePlayButtonProps) {
  const t = EXPERIENCE_TRANSLATIONS[language].learn;
  const effectiveId =
    playbackId ?? `${variant}-${phrase.id}-${slow ? 'slow' : 'normal'}`;

  const playbackState = useSyncExternalStore(
    subscribeWebSpeechPlayback,
    getWebSpeechPlaybackSnapshot,
    getWebSpeechPlaybackSnapshot
  );

  const isPlaying = playbackState.activeId === effectiveId;
  const progress = isPlaying ? playbackState.progress : 0;

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopWebSpeechPlayback();
      return;
    }

    onBeforePlay?.();
    startPhraseWebSpeechPlayback({
      playbackId: effectiveId,
      darijaArabic: phrase.darijaArabic,
      darijaLatin: phrase.darijaLatin,
      phoneticFrench: phrase.phoneticFrench,
      slow,
      language,
      preferScript,
      onComplete,
    });
  };

  const ariaLabel = isPlaying
    ? ariaLabelStop ?? t.stopPhraseAria(phrase.darijaLatin)
    : ariaLabelPlay ?? t.playPhraseAria(phrase.darijaLatin);

  if (variant === 'pill') {
    return (
      <button
        type="button"
        data-testid={testId ?? `phrase-play-pill-${phrase.id}`}
        data-playback-state={isPlaying ? 'playing' : 'idle'}
        data-speech-script={isPlaying ? playbackState.scriptMode ?? '' : ''}
        data-speech-lang={isPlaying ? playbackState.matchedVoiceLang ?? '' : ''}
        data-speech-voice={isPlaying ? playbackState.matchedVoiceName ?? '' : ''}
        data-speech-progress={progress}
        aria-pressed={isPlaying}
        aria-label={ariaLabel}
        title={ariaLabel}
        onClick={handleTogglePlay}
        className={`relative overflow-hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
          isPlaying
            ? 'bg-[#B7410E] text-white border-[#B7410E]'
            : 'bg-white dark:bg-[#1D2622] border-[#E4DFD2] dark:border-[#2A352F] text-[#8C2F18] dark:text-[#E8A184] hover:border-[#B7410E]'
        }`}
      >
        {isPlaying ? (
          <Square className="w-3 h-3 fill-current shrink-0" aria-hidden="true" />
        ) : (
          <Volume2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        )}
        <span>{isPlaying ? t.webSpeechPlayingLabel : t.webSpeechPlayLabel}</span>
        {isPlaying && (
          <span
            aria-hidden="true"
            className="absolute left-0 bottom-0 h-0.5 bg-[#DAE3C6] transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        )}
      </button>
    );
  }

  const iconBoxSize = size === 'md' ? 'w-8 h-8' : 'w-7 h-7';

  return (
    <button
      type="button"
      data-testid={testId ?? `phrase-play-btn-${phrase.id}`}
      data-playback-state={isPlaying ? 'playing' : 'idle'}
      data-speech-script={isPlaying ? playbackState.scriptMode ?? '' : ''}
      data-speech-lang={isPlaying ? playbackState.matchedVoiceLang ?? '' : ''}
      data-speech-voice={isPlaying ? playbackState.matchedVoiceName ?? '' : ''}
      data-speech-progress={progress}
      aria-pressed={isPlaying}
      aria-label={ariaLabel}
      title={ariaLabel}
      onClick={handleTogglePlay}
      className={`relative overflow-hidden ${iconBoxSize} rounded-lg border inline-flex items-center justify-center shrink-0 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B7410E] ${
        isPlaying
          ? 'bg-[#B7410E] text-white border-[#B7410E]'
          : 'border-[#E4DFD2] dark:border-[#2A352F] bg-[#F5F1E8]/70 dark:bg-[#171E1B] text-[#8C2F18] dark:text-[#E8A184] hover:border-[#B7410E]'
      }`}
    >
      {isPlaying ? (
        <Square className="w-3 h-3 fill-current" aria-hidden="true" />
      ) : size === 'md' ? (
        <Volume2 className="w-4 h-4" aria-hidden="true" />
      ) : (
        <Play className="w-3.5 h-3.5 fill-current ml-0.5" aria-hidden="true" />
      )}
      {isPlaying && (
        <span
          aria-hidden="true"
          className="absolute left-0 bottom-0 h-0.5 bg-[#DAE3C6] transition-all duration-75"
          style={{ width: `${progress}%` }}
        />
      )}
    </button>
  );
}
