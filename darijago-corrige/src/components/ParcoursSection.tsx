import { useState } from 'react';
import {
  ArrowRight,
  BookMarked,
  BookOpenCheck,
  CheckCircle2,
  Compass,
  MessageSquare,
  Sparkles,
  Table2,
  Volume2,
  X,
} from 'lucide-react';
import { CURRICULUM_MODULES } from '../data/curriculum';
import { getCulturalStories } from '../data/stories';
import type { AppLanguage, CulturalStory, UserProgressState } from '../types/darija';
import { getLocalizedModule } from '../i18n/curriculumTranslations';
import { EXPERIENCE_TRANSLATIONS } from '../i18n/experienceTranslations';
import { BEN_SEDIRA_TRANSLATIONS } from '../i18n/benSediraTranslations';
import { computeModuleProgress } from '../utils/darijaLogic';
import { playDarijaPronunciation } from '../utils/audioPlayer';
import { DialogueSimulator } from './DialogueSimulator';
import { BenSediraGrammarGuide } from './BenSediraGrammarGuide';
import { BenSediraConjugationTable } from './BenSediraConjugationTable';

type ParcoursSubTab = 'path' | 'grammar' | 'conjugation' | 'stories' | 'dialogues';

interface ParcoursSectionProps {
  language: AppLanguage;
  progress: UserProgressState;
  onSelectUnitForLearn: (moduleId: string) => void;
  onMarkStoryRead: (storyId: string, xpReward: number) => void;
  onDialogueTurn: (amount: number) => void;
  onConjugationXp?: (amount: number) => void;
}

function StoryIllustration({
  story,
  onClose,
  closeAria,
}: {
  story: CulturalStory;
  onClose?: () => void;
  closeAria: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="relative h-48 sm:h-56 w-full overflow-hidden rounded-t-3xl bg-gradient-to-br from-[#EFE3C8] via-[#E3CCA2] to-[#C68335]/35 dark:from-[#26221A] dark:via-[#2E261B] dark:to-[#1B221D]">
      {story.imageUrl && !imgFailed ? (
        <img
          src={story.imageUrl}
          alt={story.title}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/80 dark:bg-[#171E1B]/80 border border-[#E4DFD2] dark:border-[#2A352F] flex items-center justify-center mb-2">
            <Sparkles className="w-7 h-7 text-[#C68335]" aria-hidden="true" />
          </div>
          <p className="font-display text-lg font-extrabold text-[#23201C] dark:text-slate-100">
            {story.focusWord.darijaLatin}
          </p>
          <p className="font-arabic text-xl text-[#4E6231] dark:text-[#A5C178]" lang="ar">
            {story.focusWord.darijaArabic}
          </p>
        </div>
      )}

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={closeAria}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 dark:bg-[#171E1B]/95 border border-[#E4DFD2] dark:border-[#2A352F] text-[#23201C] dark:text-slate-100 flex items-center justify-center shadow-sm hover:bg-white cursor-pointer"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export function ParcoursSection({
  language,
  progress,
  onSelectUnitForLearn,
  onMarkStoryRead,
  onDialogueTurn,
  onConjugationXp,
}: ParcoursSectionProps) {
  const expT = EXPERIENCE_TRANSLATIONS[language];
  const pT = expT.parcours;
  const bsT = BEN_SEDIRA_TRANSLATIONS[language];

  const [subTab, setSubTab] = useState<ParcoursSubTab>('path');
  const stories = getCulturalStories(language);
  const [activeStoryId, setActiveStoryId] = useState<string>(stories[0].id);
  const [playingStoryWordId, setPlayingStoryWordId] = useState<string | null>(null);

  const localizedModules = CURRICULUM_MODULES.map((m) =>
    getLocalizedModule(m, language)
  );
  const activeStory =
    stories.find((s) => s.id === activeStoryId) ?? stories[0];
  const activeStoryRead = progress.readStoryIds.includes(activeStory.id);

  const handlePlayFocusWord = (story: CulturalStory) => {
    void playDarijaPronunciation({
      textArabic: story.focusWord.darijaArabic,
      textLatin: story.focusWord.darijaLatin,
      language,
      onStart: () => setPlayingStoryWordId(story.id),
      onEnd: () => setPlayingStoryWordId(null),
    });
  };

  return (
    <section
      aria-label={pT.pageTitle}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-6"
    >
      {/* Page Title + Dialect Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#23201C] dark:text-slate-50 tracking-tight">
            {pT.pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#686259] dark:text-slate-400 max-w-2xl">
            {pT.pageSubtitle}
          </p>
        </div>

        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] text-xs font-semibold text-[#4E6231] dark:text-[#A5C178] shrink-0">
          <span
            aria-hidden="true"
            className="w-4 h-4 rounded-full overflow-hidden border border-[#E4DFD2] dark:border-[#2A352F] inline-flex shrink-0"
          >
            <span className="w-1/2 h-full bg-[#0E7C47]" />
            <span className="w-1/2 h-full bg-white relative flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D92B22] -ml-1" />
            </span>
          </span>
          <span>{expT.dialectBadge}</span>
        </span>
      </div>

      {/* 5 Sub-Tabs: Guided Path | Grammar & Verbs | Conjugation Table | Fenêtre sur l'Algérie | Dialogues */}
      <div
        role="tablist"
        aria-label={pT.pageTitle}
        className="flex flex-wrap sm:inline-flex items-center gap-1 p-1.5 sm:p-1 rounded-2xl sm:rounded-full bg-[#E9E4D8] dark:bg-[#171E1B] border border-[#DFD9CA] dark:border-[#2A352F] max-w-full"
      >
        <button
          type="button"
          role="tab"
          data-testid="parcours-subtab-path"
          aria-selected={subTab === 'path'}
          onClick={() => setSubTab('path')}
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
            subTab === 'path'
              ? 'bg-white dark:bg-[#26322B] text-[#23201C] dark:text-white shadow-xs'
              : 'text-[#686259] dark:text-slate-400 hover:text-[#23201C] dark:hover:text-slate-100'
          }`}
        >
          <Compass className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{pT.tabPath}</span>
        </button>

        <button
          type="button"
          role="tab"
          data-testid="parcours-subtab-grammar"
          aria-selected={subTab === 'grammar'}
          onClick={() => setSubTab('grammar')}
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
            subTab === 'grammar'
              ? 'bg-white dark:bg-[#26322B] text-[#23201C] dark:text-white shadow-xs'
              : 'text-[#686259] dark:text-slate-400 hover:text-[#23201C] dark:hover:text-slate-100'
          }`}
        >
          <BookMarked className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{bsT.parcoursSubtabGrammar}</span>
        </button>

        <button
          type="button"
          role="tab"
          data-testid="parcours-subtab-conjugation"
          aria-selected={subTab === 'conjugation'}
          onClick={() => setSubTab('conjugation')}
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
            subTab === 'conjugation'
              ? 'bg-white dark:bg-[#26322B] text-[#23201C] dark:text-white shadow-xs'
              : 'text-[#686259] dark:text-slate-400 hover:text-[#23201C] dark:hover:text-slate-100'
          }`}
        >
          <Table2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{bsT.parcoursSubtabConjugation}</span>
        </button>

        <button
          type="button"
          role="tab"
          data-testid="parcours-subtab-stories"
          aria-selected={subTab === 'stories'}
          onClick={() => setSubTab('stories')}
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
            subTab === 'stories'
              ? 'bg-white dark:bg-[#26322B] text-[#23201C] dark:text-white shadow-xs'
              : 'text-[#686259] dark:text-slate-400 hover:text-[#23201C] dark:hover:text-slate-100'
          }`}
        >
          <BookOpenCheck className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{pT.tabStories}</span>
        </button>

        <button
          type="button"
          role="tab"
          data-testid="parcours-subtab-dialogues"
          aria-selected={subTab === 'dialogues'}
          onClick={() => setSubTab('dialogues')}
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
            subTab === 'dialogues'
              ? 'bg-white dark:bg-[#26322B] text-[#23201C] dark:text-white shadow-xs'
              : 'text-[#686259] dark:text-slate-400 hover:text-[#23201C] dark:hover:text-slate-100'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{pT.tabDialogues}</span>
        </button>
      </div>

      {/* SUB-TAB 1: Guided Path + 3-Step Method + Featured Story Card */}
      {subTab === 'path' && (
        <div className="space-y-6">
          {/* 3-Step Oral Method Strip */}
          <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-5 space-y-4">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#5C723C] dark:text-[#A5C178]">
              {pT.methodPillarsTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pT.methodPillars.map((pillar) => (
                <div
                  key={pillar.step}
                  className="p-4 rounded-xl bg-[#F5F1E8]/70 dark:bg-[#1D2622] border border-[#E4DFD2] dark:border-[#2A352F] space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#C68335]">
                      {pillar.step}
                    </span>
                    <h3 className="font-display text-sm font-bold text-[#23201C] dark:text-slate-100">
                      {pillar.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[#686259] dark:text-slate-400 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 6 Structured Units Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {localizedModules.map((mod) => {
              const stats = computeModuleProgress(mod, progress);
              const completed = stats.total > 0 && stats.mastered === stats.total;
              return (
                <article
                  key={mod.id}
                  className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F5F1E8] dark:bg-[#1D2622] text-[#4E6231] dark:text-[#A5C178]">
                        {mod.number}
                      </span>
                      <span className="text-xs font-semibold tabular-nums text-[#686259] dark:text-slate-400">
                        {pT.unitPhrasesCount(stats.mastered, stats.total)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-display text-lg font-bold text-[#23201C] dark:text-slate-100">
                        {mod.title}
                      </h3>
                      <p className="text-xs text-[#686259] dark:text-slate-400 leading-relaxed">
                        {mod.subtitle}
                      </p>
                    </div>

                    <div className="w-full h-1.5 bg-[#EFECE4] dark:bg-[#2A352F] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#5C723C] dark:bg-[#A5C178] transition-all duration-200"
                        style={{ width: `${stats.percent}%` }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    data-testid={`parcours-unit-${mod.id}`}
                    onClick={() => onSelectUnitForLearn(mod.id)}
                    className={`w-full inline-flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                      completed
                        ? 'bg-[#E5EBD6] dark:bg-[#273322] text-[#4E6231] dark:text-[#A5C178]'
                        : 'bg-[#5C723C] hover:bg-[#4E6231] text-white'
                    }`}
                  >
                    <span>{pT.unitOpenLesson}</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </article>
              );
            })}
          </div>

          {/* Cultural Window Spotlight */}
          <div className="bg-[#F7F9F2] dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <p className="text-[11px] font-bold tracking-wider uppercase text-[#C68335]">
                {stories[0].category}
              </p>
              <h3 className="font-display text-lg font-bold text-[#23201C] dark:text-slate-100">
                {stories[0].title}
              </h3>
              <p className="text-xs text-[#686259] dark:text-slate-400">
                {pT.storiesSectionSubtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveStoryId(stories[0].id);
                setSubTab('stories');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C68335] hover:bg-[#B2732B] text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>{pT.storyOpenCta}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Fenêtre sur l'Algérie (matching Screenshot 2) */}
      {subTab === 'stories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Story Selector List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="px-1">
              <h2 className="font-display text-lg font-bold text-[#23201C] dark:text-slate-100">
                {pT.storiesSectionTitle}
              </h2>
              <p className="text-xs text-[#686259] dark:text-slate-400 mt-0.5">
                {pT.storiesSectionSubtitle}
              </p>
            </div>

            <div className="space-y-2.5">
              {stories.map((story) => {
                const isSelected = story.id === activeStory.id;
                const isRead = progress.readStoryIds.includes(story.id);
                return (
                  <button
                    key={story.id}
                    type="button"
                    data-testid={`story-card-${story.id}`}
                    onClick={() => setActiveStoryId(story.id)}
                    className={`w-full text-left p-4 rounded-2xl border cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-[#F7F9F2] dark:bg-[#1D2622] border-[#5C723C]'
                        : 'bg-white dark:bg-[#171E1B] border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-[#C68335] truncate">
                        {story.focusWord.darijaLatin} · {story.focusWord.meaning}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold shrink-0 ${
                          isRead
                            ? 'text-[#4E6231] dark:text-[#A5C178]'
                            : 'text-[#686259] dark:text-slate-400'
                        }`}
                      >
                        {isRead && <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />}
                        <span>{isRead ? pT.storyReadBadge : pT.storyNewBadge}</span>
                      </span>
                    </div>
                    <p className="font-display text-sm font-bold text-[#23201C] dark:text-slate-100">
                      {story.title}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Cultural Story Reader matching Screenshot 2 */}
          <article
            data-testid={`story-reader-${activeStory.id}`}
            className="lg:col-span-8 bg-[#F5F1E8] dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-3xl overflow-hidden shadow-sm"
          >
            <StoryIllustration
              story={activeStory}
              closeAria={pT.storyCloseAria}
              onClose={() => setSubTab('path')}
            />

            <div className="p-6 sm:p-8 space-y-5 bg-white/80 dark:bg-[#171E1B]">
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#C68335]">
                  {activeStory.category}
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#23201C] dark:text-slate-50 leading-tight [text-wrap:balance]">
                  {activeStory.title}
                </h2>
              </div>

              {/* Focus Word Audio Pill matching Screenshot 2 ("koul  manger  🔊") */}
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white dark:bg-[#1D2622] border border-[#E4DFD2] dark:border-[#2A352F] shadow-xs">
                <span className="font-display text-base font-extrabold text-[#4E6231] dark:text-[#A5C178]">
                  {activeStory.focusWord.darijaLatin}
                </span>
                <span className="text-sm font-medium text-[#3B556E] dark:text-slate-300">
                  {activeStory.focusWord.meaning}
                </span>
                <button
                  type="button"
                  onClick={() => handlePlayFocusWord(activeStory)}
                  aria-label={activeStory.focusWord.darijaLatin}
                  className={`w-8 h-8 rounded-full inline-flex items-center justify-center cursor-pointer ${
                    playingStoryWordId === activeStory.id
                      ? 'bg-[#5C723C] text-white'
                      : 'bg-[#E5EBD6] dark:bg-[#273322] text-[#4E6231] dark:text-[#A5C178] hover:bg-[#DAE3C6]'
                  }`}
                >
                  <Volume2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              {/* Narrative Paragraph */}
              <p className="text-sm sm:text-base text-[#23201C] dark:text-slate-200 leading-relaxed">
                {activeStory.body}
              </p>

              {/* Warm Ochre CTA matching Screenshot 2 ("J'ai lu · +10 XP") */}
              <div className="pt-2">
                <button
                  type="button"
                  data-testid="story-mark-read-btn"
                  disabled={activeStoryRead}
                  onClick={() =>
                    onMarkStoryRead(activeStory.id, activeStory.xpReward)
                  }
                  className={`w-full py-3.5 px-6 rounded-2xl font-display text-sm sm:text-base font-bold inline-flex items-center justify-center gap-2 cursor-pointer ${
                    activeStoryRead
                      ? 'bg-[#E5EBD6] dark:bg-[#273322] text-[#4E6231] dark:text-[#A5C178] cursor-default'
                      : 'bg-[#C68335] hover:bg-[#B2732B] text-white shadow-xs'
                  }`}
                >
                  {activeStoryRead && (
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  )}
                  <span>
                    {activeStoryRead
                      ? pT.storyAlreadyReadCta
                      : pT.storyReadCta(activeStory.xpReward)}
                  </span>
                </button>
              </div>
            </div>
          </article>
        </div>
      )}

      {/* SUB-TAB 2: Ben Sedira Grammar & Conjugation */}
      {subTab === 'grammar' && <BenSediraGrammarGuide language={language} />}

      {/* SUB-TAB 3: Interactive Verb Conjugation Table */}
      {subTab === 'conjugation' && (
        <BenSediraConjugationTable
          language={language}
          onEarnXp={onConjugationXp}
        />
      )}

      {/* SUB-TAB 4: Local Dialogues */}
      {subTab === 'dialogues' && (
        <DialogueSimulator language={language} onEarnXp={onDialogueTurn} />
      )}
    </section>
  );
}
