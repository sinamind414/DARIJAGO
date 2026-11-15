import type { AppLanguage } from '../types/darija';

export interface ExperienceTranslations {
  dialectBadge: string;
  learn: {
    greeting: string;
    learnedCount: (mastered: number, total: number) => string;
    sessionCounter: (current: number, total: number) => string;
    playCardAria: (phrase: string) => string;
    playSlowAria: (phrase: string) => string;
    showDetails: string;
    hideDetails: string;
    showPractice: string;
    hidePractice: string;
    unitSheetButton: string;
  };
  parcours: {
    pageTitle: string;
    pageSubtitle: string;
    tabPath: string;
    tabStories: string;
    tabDialogues: string;
    storiesSectionTitle: string;
    storiesSectionSubtitle: string;
    storyReadBadge: string;
    storyNewBadge: string;
    storyOpenCta: string;
    storyReadCta: (xp: number) => string;
    storyAlreadyReadCta: string;
    storyCloseAria: string;
    unitOpenLesson: string;
    unitPhrasesCount: (mastered: number, total: number) => string;
    methodPillarsTitle: string;
    methodPillars: Array<{ step: string; title: string; desc: string }>;
  };
  quizTab: {
    tabQuiz: string;
    tabDictation: string;
    tabLexicon: string;
  };
  progres: {
    pageTitle: string;
    pageSubtitle: string;
    statMastered: string;
    statDueToday: string;
    statScheduled: string;
    statStoriesRead: string;
    srsCardTitle: string;
    srsCardSubtitle: string;
    srsReviewNow: string;
  };
  profil: {
    pageTitle: string;
    pageSubtitle: string;
    languageTitle: string;
    languageDesc: string;
    appearanceTitle: string;
    appearanceDesc: string;
    darkLabel: string;
    lightLabel: string;
    notificationsTitle: string;
    notificationsDesc: string;
    goalTitle: string;
    goalDesc: (goal: number) => string;
    goalManageLink: string;
    resetTitle: string;
    resetDesc: string;
    resetButton: string;
    resetConfirmPrompt: string;
    resetConfirmYes: string;
    resetConfirmCancel: string;
    resetDoneMessage: string;
  };
}

export const EXPERIENCE_TRANSLATIONS: Record<AppLanguage, ExperienceTranslations> = {
  fr: {
    dialectBadge: 'Darija (Algérie)',
    learn: {
      greeting: 'Bonjour',
      learnedCount: (m, t) => `${m} / ${t} expressions maîtrisées`,
      sessionCounter: (c, t) => `${c} / ${t}`,
      playCardAria: (p) => `Écouter : ${p}`,
      playSlowAria: (p) => `Écouter lentement : ${p}`,
      showDetails: 'Détails mot à mot & culture',
      hideDetails: 'Masquer les détails',
      showPractice: 'Pratiquer à l’oral ou à l’écrit',
      hidePractice: 'Masquer la pratique',
      unitSheetButton: 'Changer d’unité',
    },
    parcours: {
      pageTitle: 'Parcours',
      pageSubtitle: 'Suivez la méthode orale pas à pas : unités guidées, fenêtres culturelles sur l’Algérie et dialogues du quotidien.',
      tabPath: 'Parcours guidé',
      tabStories: 'Fenêtre sur l’Algérie',
      tabDialogues: 'Dialogues locaux',
      storiesSectionTitle: 'Fenêtre sur l’Algérie',
      storiesSectionSubtitle: 'Des récits culturels courts pour retenir les mots clés dans leur contexte algérien (+10 XP).',
      storyReadBadge: 'Lu',
      storyNewBadge: 'À découvrir',
      storyOpenCta: 'Lire l’histoire',
      storyReadCta: (xp) => `J’ai lu · +${xp} XP`,
      storyAlreadyReadCta: 'Histoire déjà validée',
      storyCloseAria: 'Fermer la fenêtre culturelle',
      unitOpenLesson: 'Étudier cette unité',
      unitPhrasesCount: (m, t) => `${m} / ${t} phrases`,
      methodPillarsTitle: 'La méthode orale en 3 temps',
      methodPillars: [
        { step: '01', title: 'Écouter & Décoder', desc: 'Audio clair et repères arabizi (3, 7, 9) sans alphabet bloquant.' },
        { step: '02', title: 'Répéter & Contextualiser', desc: 'Mise en situation réelle à Alger, Oran et Constantine.' },
        { step: '03', title: 'Ancrer par l’espacement', desc: 'Révisions planifiées au bon moment selon votre mémorisation.' },
      ],
    },
    quizTab: {
      tabQuiz: 'Quiz actif',
      tabDictation: 'Dictée',
      tabLexicon: 'Lexique & Sons 3, 7, 9',
    },
    progres: {
      pageTitle: 'Progrès',
      pageSubtitle: 'Suivez votre rythme quotidien, vos révisions espacées et vos jalons débloqués.',
      statMastered: 'Phrases maîtrisées',
      statDueToday: 'À réviser aujourd’hui',
      statScheduled: 'Révisions planifiées',
      statStoriesRead: 'Histoires lues',
      srsCardTitle: 'Répétition espacée',
      srsCardSubtitle: 'Votre file de révision s’adapte automatiquement à chaque note et réponse de quiz.',
      srsReviewNow: 'Réviser dans Apprendre',
    },
    profil: {
      pageTitle: 'Profil & Préférences',
      pageSubtitle: 'Réglez votre langue d’interface, l’apparence, les alertes et votre objectif XP quotidien.',
      languageTitle: 'Langue d’apprentissage',
      languageDesc: 'Adapte immédiatement toutes les explications, traductions et histoires culturelles.',
      appearanceTitle: 'Thème d’affichage',
      appearanceDesc: 'Basculez entre le thème sable lumineux et le mode sombre.',
      darkLabel: 'Mode sombre',
      lightLabel: 'Mode clair',
      notificationsTitle: 'Alertes & rappels bureau',
      notificationsDesc: 'Recevez un rappel discret lorsque vous débloquez un succès ou atteignez votre objectif XP.',
      goalTitle: 'Objectif XP quotidien',
      goalDesc: (g) => `Objectif actuel : ${g} XP par jour.`,
      goalManageLink: 'Ajuster dans Progrès',
      resetTitle: 'Réinitialiser la progression',
      resetDesc: 'Efface vos XP, phrases maîtrisées, révisions planifiées et histoires lues sur cet appareil.',
      resetButton: 'Réinitialiser mes données',
      resetConfirmPrompt: 'Confirmer la réinitialisation complète de votre progression ?',
      resetConfirmYes: 'Oui, réinitialiser',
      resetConfirmCancel: 'Annuler',
      resetDoneMessage: 'Votre progression a bien été réinitialisée.',
    },
  },
  en: {
    dialectBadge: 'Darija (Algeria)',
    learn: {
      greeting: 'Hello',
      learnedCount: (m, t) => `${m} / ${t} phrases mastered`,
      sessionCounter: (c, t) => `${c} / ${t}`,
      playCardAria: (p) => `Listen: ${p}`,
      playSlowAria: (p) => `Listen slowly: ${p}`,
      showDetails: 'Word breakdown & culture',
      hideDetails: 'Hide details',
      showPractice: 'Speaking & typing practice',
      hidePractice: 'Hide practice',
      unitSheetButton: 'Switch unit',
    },
    parcours: {
      pageTitle: 'Learning Path',
      pageSubtitle: 'Follow the spoken method step by step: structured units, Algerian cultural windows, and local dialogues.',
      tabPath: 'Guided Path',
      tabStories: 'Window on Algeria',
      tabDialogues: 'Local Dialogues',
      storiesSectionTitle: 'Window on Algeria',
      storiesSectionSubtitle: 'Short cultural stories to anchor essential Darija words in real Algerian context (+10 XP).',
      storyReadBadge: 'Read',
      storyNewBadge: 'Discover',
      storyOpenCta: 'Read story',
      storyReadCta: (xp) => `I read it · +${xp} XP`,
      storyAlreadyReadCta: 'Story completed',
      storyCloseAria: 'Close cultural story',
      unitOpenLesson: 'Study this unit',
      unitPhrasesCount: (m, t) => `${m} / ${t} phrases`,
      methodPillarsTitle: 'The 3-step spoken method',
      methodPillars: [
        { step: '01', title: 'Listen & Decode', desc: 'Natural audio with Arabizi markers (3, 7, 9) so nothing blocks your reading.' },
        { step: '02', title: 'Speak in Context', desc: 'Realistic neighborhood scenarios across Algiers, Oran, and Constantine.' },
        { step: '03', title: 'Retain with SRS', desc: 'Smart review intervals tailored to how well you remember.' },
      ],
    },
    quizTab: {
      tabQuiz: 'Active Quiz',
      tabDictation: 'Dictation',
      tabLexicon: 'Lexicon & 3, 7, 9 Sounds',
    },
    progres: {
      pageTitle: 'Progress',
      pageSubtitle: 'Track your daily XP target, 7-day trend, spaced repetition queue, and unlocked milestones.',
      statMastered: 'Mastered phrases',
      statDueToday: 'Due today',
      statScheduled: 'Scheduled reviews',
      statStoriesRead: 'Stories read',
      srsCardTitle: 'Spaced repetition queue',
      srsCardSubtitle: 'Your queue updates automatically from your recall ratings and quiz answers.',
      srsReviewNow: 'Review in Learn',
    },
    profil: {
      pageTitle: 'Profile & Preferences',
      pageSubtitle: 'Customize your learning language, theme, desktop alerts, and daily XP goal.',
      languageTitle: 'Learning language',
      languageDesc: 'Instantly switches all explanations, translations, and cultural stories.',
      appearanceTitle: 'Display theme',
      appearanceDesc: 'Switch between warm sand light mode and deep charcoal dark mode.',
      darkLabel: 'Dark mode',
      lightLabel: 'Light mode',
      notificationsTitle: 'Desktop alerts',
      notificationsDesc: 'Get notified when you unlock an achievement or hit your daily XP goal.',
      goalTitle: 'Daily XP goal',
      goalDesc: (g) => `Current target: ${g} XP per day.`,
      goalManageLink: 'Edit in Progress',
      resetTitle: 'Reset progress',
      resetDesc: 'Clears XP, mastered phrases, review schedule, and read stories on this device.',
      resetButton: 'Reset my data',
      resetConfirmPrompt: 'Confirm resetting all your learning progress?',
      resetConfirmYes: 'Yes, reset',
      resetConfirmCancel: 'Cancel',
      resetDoneMessage: 'Your progress has been reset.',
    },
  },
  es: {
    dialectBadge: 'Dariya (Argelia)',
    learn: {
      greeting: 'Hola',
      learnedCount: (m, t) => `${m} / ${t} expresiones dominadas`,
      sessionCounter: (c, t) => `${c} / ${t}`,
      playCardAria: (p) => `Escuchar: ${p}`,
      playSlowAria: (p) => `Escuchar lento: ${p}`,
      showDetails: 'Desglose y nota cultural',
      hideDetails: 'Ocultar detalles',
      showPractice: 'Practicar voz o escritura',
      hidePractice: 'Ocultar práctica',
      unitSheetButton: 'Cambiar unidad',
    },
    parcours: {
      pageTitle: 'Ruta de aprendizaje',
      pageSubtitle: 'Sigue el método oral paso a paso: unidades guiadas, relatos sobre Argelia y diálogos reales.',
      tabPath: 'Ruta guiada',
      tabStories: 'Ventana a Argelia',
      tabDialogues: 'Diálogos locales',
      storiesSectionTitle: 'Ventana a Argelia',
      storiesSectionSubtitle: 'Relatos breves para recordar palabras clave en su contexto argelino (+10 XP).',
      storyReadBadge: 'Leído',
      storyNewBadge: 'Descubrir',
      storyOpenCta: 'Leer relato',
      storyReadCta: (xp) => `Lo he leído · +${xp} XP`,
      storyAlreadyReadCta: 'Relato completado',
      storyCloseAria: 'Cerrar relato cultural',
      unitOpenLesson: 'Estudiar unidad',
      unitPhrasesCount: (m, t) => `${m} / ${t} frases`,
      methodPillarsTitle: 'El método oral en 3 pasos',
      methodPillars: [
        { step: '01', title: 'Escuchar y descifrar', desc: 'Audio natural y guía arabizi (3, 7, 9) sin barreras.' },
        { step: '02', title: 'Practicar en contexto', desc: 'Escenarios cotidianos de Argel, Orán y Constantina.' },
        { step: '03', title: 'Fijar con repetición', desc: 'Repasos programados en el momento justo según tu memoria.' },
      ],
    },
    quizTab: {
      tabQuiz: 'Quiz activo',
      tabDictation: 'Dictado',
      tabLexicon: 'Léxico y Sonidos 3, 7, 9',
    },
    progres: {
      pageTitle: 'Progreso',
      pageSubtitle: 'Consulta tu meta diaria, tendencia semanal, cola espaciada y logros desbloqueados.',
      statMastered: 'Frases dominadas',
      statDueToday: 'Pendientes hoy',
      statScheduled: 'Repasos programados',
      statStoriesRead: 'Relatos leídos',
      srsCardTitle: 'Repetición espaciada',
      srsCardSubtitle: 'Tu cola se actualiza automáticamente según tus repasos y aciertos en quiz.',
      srsReviewNow: 'Repasar en Aprender',
    },
    profil: {
      pageTitle: 'Perfil y Preferencias',
      pageSubtitle: 'Configura tu idioma, tema, alertas de escritorio y meta diaria de XP.',
      languageTitle: 'Idioma de aprendizaje',
      languageDesc: 'Adapta al instante todas las explicaciones, traducciones y relatos.',
      appearanceTitle: 'Tema visual',
      appearanceDesc: 'Alterna entre modo claro cálido y modo oscuro.',
      darkLabel: 'Modo oscuro',
      lightLabel: 'Modo claro',
      notificationsTitle: 'Alertas de escritorio',
      notificationsDesc: 'Recibe un aviso al desbloquear un logro o cumplir tu meta diaria.',
      goalTitle: 'Meta diaria de XP',
      goalDesc: (g) => `Meta actual: ${g} XP al día.`,
      goalManageLink: 'Ajustar en Progreso',
      resetTitle: 'Reiniciar progreso',
      resetDesc: 'Borra XP, frases dominadas, repasos y relatos leídos en este dispositivo.',
      resetButton: 'Reiniciar mis datos',
      resetConfirmPrompt: '¿Confirmas el reinicio completo de tu progreso?',
      resetConfirmYes: 'Sí, reiniciar',
      resetConfirmCancel: 'Cancelar',
      resetDoneMessage: 'Tu progreso se ha reiniciado.',
    },
  },
  de: {
    dialectBadge: 'Darija (Algerien)',
    learn: {
      greeting: 'Hallo',
      learnedCount: (m, t) => `${m} / ${t} Ausdrücke gemeistert`,
      sessionCounter: (c, t) => `${c} / ${t}`,
      playCardAria: (p) => `Anhören: ${p}`,
      playSlowAria: (p) => `Langsam anhören: ${p}`,
      showDetails: 'Wortanalyse & Kultur',
      hideDetails: 'Details ausblenden',
      showPractice: 'Sprechen & Schreiben üben',
      hidePractice: 'Übung ausblenden',
      unitSheetButton: 'Einheit wechseln',
    },
    parcours: {
      pageTitle: 'Lernpfad',
      pageSubtitle: 'Schritt für Schritt zur gesprochenen Darija: Einheiten, algerische Kulturfenster und Dialoge.',
      tabPath: 'Geführter Pfad',
      tabStories: 'Fenster nach Algerien',
      tabDialogues: 'Lokale Dialoge',
      storiesSectionTitle: 'Fenster nach Algerien',
      storiesSectionSubtitle: 'Kurze Kulturgeschichten, um Schlüsselwörter im echten Kontext zu behalten (+10 XP).',
      storyReadBadge: 'Gelesen',
      storyNewBadge: 'Entdecken',
      storyOpenCta: 'Geschichte lesen',
      storyReadCta: (xp) => `Gelesen · +${xp} XP`,
      storyAlreadyReadCta: 'Geschichte abgeschlossen',
      storyCloseAria: 'Kulturgeschichte schließen',
      unitOpenLesson: 'Einheit lernen',
      unitPhrasesCount: (m, t) => `${m} / ${t} Sätze`,
      methodPillarsTitle: 'Die 3-Schritte-Sprechmethode',
      methodPillars: [
        { step: '01', title: 'Hören & Entschlüsseln', desc: 'Klares Audio mit Arabizi-Hinweisen (3, 7, 9).' },
        { step: '02', title: 'Im Alltag anwenden', desc: 'Echte Situationen aus Algier, Oran und Constantine.' },
        { step: '03', title: 'Mit Intervallen festigen', desc: 'Intelligente Wiederholung genau im passenden Moment.' },
      ],
    },
    quizTab: {
      tabQuiz: 'Aktives Quiz',
      tabDictation: 'Diktat',
      tabLexicon: 'Lexikon & Laute 3, 7, 9',
    },
    progres: {
      pageTitle: 'Fortschritt',
      pageSubtitle: 'Verfolge dein Tagesziel, 7-Tage-XP, Wiederholungen und freigeschaltete Erfolge.',
      statMastered: 'Gemeisterte Sätze',
      statDueToday: 'Heute fällig',
      statScheduled: 'Geplante Wiederholungen',
      statStoriesRead: 'Gelesene Geschichten',
      srsCardTitle: 'Verteilte Wiederholung',
      srsCardSubtitle: 'Deine Warteschlange passt sich automatisch an deine Bewertungen und Quizze an.',
      srsReviewNow: 'Jetzt in Lernen üben',
    },
    profil: {
      pageTitle: 'Profil & Einstellungen',
      pageSubtitle: 'Passe Lernsprache, Erscheinungsbild, Hinweise und Tagesziel an.',
      languageTitle: 'Lernsprache',
      languageDesc: 'Passt sofort alle Erklärungen, Übersetzungen und Geschichten an.',
      appearanceTitle: 'Darstellung',
      appearanceDesc: 'Wechsle zwischen hellem Sand-Design und Dunkelmodus.',
      darkLabel: 'Dunkelmodus',
      lightLabel: 'Hellmodus',
      notificationsTitle: 'Desktop-Hinweise',
      notificationsDesc: 'Erhalte Meldungen bei neuen Erfolgen oder erreichtem XP-Tagesziel.',
      goalTitle: 'Tägliches XP-Ziel',
      goalDesc: (g) => `Aktuelles Ziel: ${g} XP pro Tag.`,
      goalManageLink: 'In Fortschritt ändern',
      resetTitle: 'Fortschritt zurücksetzen',
      resetDesc: 'Löscht XP, gemeisterte Sätze, Wiederholungen und gelesene Geschichten lokal.',
      resetButton: 'Daten zurücksetzen',
      resetConfirmPrompt: 'Möchtest du deinen gesamten Fortschritt wirklich zurücksetzen?',
      resetConfirmYes: 'Ja, zurücksetzen',
      resetConfirmCancel: 'Abbrechen',
      resetDoneMessage: 'Dein Fortschritt wurde zurückgesetzt.',
    },
  },
  it: {
    dialectBadge: 'Darija (Algeria)',
    learn: {
      greeting: 'Ciao',
      learnedCount: (m, t) => `${m} / ${t} espressioni acquisite`,
      sessionCounter: (c, t) => `${c} / ${t}`,
      playCardAria: (p) => `Ascolta: ${p}`,
      playSlowAria: (p) => `Ascolta lentamente: ${p}`,
      showDetails: 'Analisi parola per parola & cultura',
      hideDetails: 'Nascondi dettagli',
      showPractice: 'Pratica vocale o scritta',
      hidePractice: 'Nascondi pratica',
      unitSheetButton: 'Cambia unità',
    },
    parcours: {
      pageTitle: 'Percorso',
      pageSubtitle: 'Segui il metodo orale passo dopo passo: unità guidate, racconti sull’Algeria e dialoghi.',
      tabPath: 'Percorso guidato',
      tabStories: 'Finestra sull’Algeria',
      tabDialogues: 'Dialoghi locali',
      storiesSectionTitle: 'Finestra sull’Algeria',
      storiesSectionSubtitle: 'Brevi racconti culturali per ricordare le parole chiave nel contesto algerino (+10 XP).',
      storyReadBadge: 'Letto',
      storyNewBadge: 'Scopri',
      storyOpenCta: 'Leggi la storia',
      storyReadCta: (xp) => `Ho letto · +${xp} XP`,
      storyAlreadyReadCta: 'Storia completata',
      storyCloseAria: 'Chiudi racconto culturale',
      unitOpenLesson: 'Studia unità',
      unitPhrasesCount: (m, t) => `${m} / ${t} frasi`,
      methodPillarsTitle: 'Il metodo orale in 3 fasi',
      methodPillars: [
        { step: '01', title: 'Ascoltare & Decodificare', desc: 'Audio autentico e guida arabizi (3, 7, 9).' },
        { step: '02', title: 'Parlare in contesto', desc: 'Situazioni reali tra Algeri, Orano e Costantina.' },
        { step: '03', title: 'Consolidare nel tempo', desc: 'Ripassi programmati al momento giusto secondo la tua memoria.' },
      ],
    },
    quizTab: {
      tabQuiz: 'Quiz attivo',
      tabDictation: 'Dettato',
      tabLexicon: 'Lessico & Suoni 3, 7, 9',
    },
    progres: {
      pageTitle: 'Progressi',
      pageSubtitle: 'Monitora obiettivo giornaliero, andamento 7 giorni, coda di ripasso e traguardi.',
      statMastered: 'Frasi acquisite',
      statDueToday: 'Da rivedere oggi',
      statScheduled: 'Ripassi programmati',
      statStoriesRead: 'Storie lette',
      srsCardTitle: 'Ripetizione dilazionata',
      srsCardSubtitle: 'La coda si aggiorna automaticamente in base alle valutazioni e ai quiz.',
      srsReviewNow: 'Rivedi in Impara',
    },
    profil: {
      pageTitle: 'Profilo & Preferenze',
      pageSubtitle: 'Gestisci lingua, tema, notifiche desktop e obiettivo XP giornaliero.',
      languageTitle: 'Lingua di apprendimento',
      languageDesc: 'Adatta subito tutte le spiegazioni, traduzioni e storie culturali.',
      appearanceTitle: 'Tema visivo',
      appearanceDesc: 'Passa dal tema chiaro sabbia al tema scuro.',
      darkLabel: 'Modalità scura',
      lightLabel: 'Modalità chiara',
      notificationsTitle: 'Avvisi desktop',
      notificationsDesc: 'Ricevi una notifica quando sblocchi un traguardo o completi l’obiettivo XP.',
      goalTitle: 'Obiettivo XP giornaliero',
      goalDesc: (g) => `Obiettivo attuale: ${g} XP al giorno.`,
      goalManageLink: 'Modifica in Progressi',
      resetTitle: 'Reimposta progressi',
      resetDesc: 'Cancella XP, frasi acquisite, ripassi programmati e storie lette su questo dispositivo.',
      resetButton: 'Reimposta dati',
      resetConfirmPrompt: 'Confermi di voler reimpostare tutti i tuoi progressi?',
      resetConfirmYes: 'Sì, reimposta',
      resetConfirmCancel: 'Annulla',
      resetDoneMessage: 'I tuoi progressi sono stati reimpostati.',
    },
  },
  nl: {
    dialectBadge: 'Darija (Algerije)',
    learn: {
      greeting: 'Hallo',
      learnedCount: (m, t) => `${m} / ${t} uitdrukkingen beheerst`,
      sessionCounter: (c, t) => `${c} / ${t}`,
      playCardAria: (p) => `Luister: ${p}`,
      playSlowAria: (p) => `Langzaam luisteren: ${p}`,
      showDetails: 'Woorduitleg & cultuur',
      hideDetails: 'Details verbergen',
      showPractice: 'Spreek- en schrijfoefening',
      hidePractice: 'Oefening verbergen',
      unitSheetButton: 'Module wisselen',
    },
    parcours: {
      pageTitle: 'Leerpad',
      pageSubtitle: 'Volg de spreekmethode stap voor stap: modules, Algerijnse verhalen en praktijkdialogen.',
      tabPath: 'Begeleid leerpad',
      tabStories: 'Venster op Algerije',
      tabDialogues: 'Lokale dialogen',
      storiesSectionTitle: 'Venster op Algerije',
      storiesSectionSubtitle: 'Korte culturele verhalen om kernwoorden in echte context te onthouden (+10 XP).',
      storyReadBadge: 'Gelezen',
      storyNewBadge: 'Ontdekken',
      storyOpenCta: 'Lees verhaal',
      storyReadCta: (xp) => `Gelezen · +${xp} XP`,
      storyAlreadyReadCta: 'Verhaal voltooid',
      storyCloseAria: 'Verhaal sluiten',
      unitOpenLesson: 'Module openen',
      unitPhrasesCount: (m, t) => `${m} / ${t} zinnen`,
      methodPillarsTitle: 'De 3-stappen spreekmethode',
      methodPillars: [
        { step: '01', title: 'Luisteren & Ontcijferen', desc: 'Duidelijke audio met Arabizi-cijfers (3, 7, 9).' },
        { step: '02', title: 'Oefenen in context', desc: 'Alledaagse scènes uit Algiers, Oran en Constantine.' },
        { step: '03', title: 'Borgen met herhaling', desc: 'Slimme herhalingsplanning afgestemd op je geheugen.' },
      ],
    },
    quizTab: {
      tabQuiz: 'Actieve quiz',
      tabDictation: 'Dictee',
      tabLexicon: 'Woordenlijst & Klanken 3, 7, 9',
    },
    progres: {
      pageTitle: 'Voortgang',
      pageSubtitle: 'Volg je dagdoel, 7-daagse XP-trend, herhalingswachtrij en behaalde mijlpalen.',
      statMastered: 'Beheerste zinnen',
      statDueToday: 'Vandaag herhalen',
      statScheduled: 'Geplande herhalingen',
      statStoriesRead: 'Gelezen verhalen',
      srsCardTitle: 'Gespreide herhaling',
      srsCardSubtitle: 'Je wachtrij wordt automatisch bijgewerkt vanuit lessen en quizzen.',
      srsReviewNow: 'Herhalen in Leren',
    },
    profil: {
      pageTitle: 'Profiel & Voorkeuren',
      pageSubtitle: 'Pas leertaal, thema, bureaubladmeldingen en dagelijks XP-doel aan.',
      languageTitle: 'Leertaal',
      languageDesc: 'Past direct alle uitleg, vertalingen en verhalen aan.',
      appearanceTitle: 'Weergavethema',
      appearanceDesc: 'Wissel tussen warm licht thema en donkere modus.',
      darkLabel: 'Donkere modus',
      lightLabel: 'Lichte modus',
      notificationsTitle: 'Bureaubladmeldingen',
      notificationsDesc: 'Ontvang een melding bij nieuwe prestaties of het behalen van je dagdoel.',
      goalTitle: 'Dagelijks XP-doel',
      goalDesc: (g) => `Huidig doel: ${g} XP per dag.`,
      goalManageLink: 'Aanpassen in Voortgang',
      resetTitle: 'Voortgang resetten',
      resetDesc: 'Wist XP, beheerste zinnen, herhalingen en gelezen verhalen op dit apparaat.',
      resetButton: 'Gegevens resetten',
      resetConfirmPrompt: 'Weet je zeker dat je al je voortgang wilt resetten?',
      resetConfirmYes: 'Ja, resetten',
      resetConfirmCancel: 'Annuleren',
      resetDoneMessage: 'Je voortgang is gereset.',
    },
  },
  zh: {
    dialectBadge: '达里贾语（阿尔及利亚）',
    learn: {
      greeting: '你好',
      learnedCount: (m, t) => `已掌握 ${m} / ${t} 句表达`,
      sessionCounter: (c, t) => `${c} / ${t}`,
      playCardAria: (p) => `听取发音：${p}`,
      playSlowAria: (p) => `慢速听取：${p}`,
      showDetails: '逐词拆解与文化笔记',
      hideDetails: '收起详情',
      showPractice: '口语与拼写练习',
      hidePractice: '收起练习',
      unitSheetButton: '切换单元',
    },
    parcours: {
      pageTitle: '学习路线',
      pageSubtitle: '循序渐进的口语学习法：结构化单元、阿尔及利亚文化之窗与真实情景对话。',
      tabPath: '引导路线',
      tabStories: '阿尔及利亚之窗',
      tabDialogues: '地道对话',
      storiesSectionTitle: '阿尔及利亚之窗',
      storiesSectionSubtitle: '短小精悍的文化故事，帮你在地道语境中记住核心词汇 (+10 XP)。',
      storyReadBadge: '已读',
      storyNewBadge: '探索',
      storyOpenCta: '阅读故事',
      storyReadCta: (xp) => `已读 · +${xp} XP`,
      storyAlreadyReadCta: '已完成阅读',
      storyCloseAria: '关闭文化故事',
      unitOpenLesson: '学习此单元',
      unitPhrasesCount: (m, t) => `已掌握 ${m} / ${t} 句`,
      methodPillarsTitle: '三步口语学习法',
      methodPillars: [
        { step: '01', title: '听音与解码', desc: '清晰语音搭配 Arabizi 数字（3, 7, 9）拼写提示。' },
        { step: '02', title: '语境开口练', desc: '还原阿尔及尔、奥兰与君士坦丁的日常场景。' },
        { step: '03', title: '间隔复习巩固', desc: '根据你的记忆曲线智能安排下一次复习节奏。' },
      ],
    },
    quizTab: {
      tabQuiz: '主动测验',
      tabDictation: '听写模式',
      tabLexicon: '词库与 3, 7, 9 发音',
    },
    progres: {
      pageTitle: '学习进度',
      pageSubtitle: '查看每日 XP 目标、7 天成长曲线、间隔复习队列与已解锁成就。',
      statMastered: '已掌握句子',
      statDueToday: '今日待复习',
      statScheduled: '已排期复习',
      statStoriesRead: '已读故事',
      srsCardTitle: '间隔重复队列',
      srsCardSubtitle: '复习队列会根据你的记忆评分与测验结果自动更新。',
      srsReviewNow: '前往学习页复习',
    },
    profil: {
      pageTitle: '个人与偏好设置',
      pageSubtitle: '设置界面语言、主题外观、桌面通知与每日 XP 目标。',
      languageTitle: '学习语言',
      languageDesc: '即时切换所有课程讲解、释义与文化故事。',
      appearanceTitle: '显示主题',
      appearanceDesc: '在暖沙浅色模式与深色模式之间切换。',
      darkLabel: '深色模式',
      lightLabel: '浅色模式',
      notificationsTitle: '桌面提醒',
      notificationsDesc: '在解锁成就或完成每日 XP 目标时接收提醒。',
      goalTitle: '每日 XP 目标',
      goalDesc: (g) => `当前目标：每日 ${g} XP。`,
      goalManageLink: '前往进度页调整',
      resetTitle: '重置学习进度',
      resetDesc: '清除本设备上的 XP、已掌握句子、复习计划与故事阅读记录。',
      resetButton: '重置我的数据',
      resetConfirmPrompt: '确定要清空所有学习进度吗？',
      resetConfirmYes: '确认重置',
      resetConfirmCancel: '取消',
      resetDoneMessage: '学习进度已重置。',
    },
  },
};
