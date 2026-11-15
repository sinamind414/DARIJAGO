import type { AppLanguage } from '../types/darija';

export interface OralExerciseTranslations {
  cardTitle: string;
  cardSubtitle: string;
  badgeLabel: string;
  localeLabel: string;
  localeArDz: string;
  localeFr: string;
  nativeStepLabel: string;
  listenNative: string;
  listeningNative: string;
  listenSlow: string;
  recordStepLabel: string;
  startRecord: string;
  stopRecord: string;
  listeningLive: string;
  liveTranscriptLabel: string;
  compareTitle: string;
  playMine: string;
  playingMine: string;
  compareSequence: string;
  comparingSequence: string;
  noRecordingYet: string;
  clearAttempt: string;
  scoreLabel: (score: number) => string;
  tierExcellent: string;
  tierGood: string;
  tierRetry: string;
  recognizedTextLabel: string;
  wordMatchTitle: string;
  xpEarnedNote: string;
  unsupportedSpeechNote: string;
  micDeniedNote: string;
  noSpeechNote: string;
  networkSpeechNote: string;
  manualFallbackLabel: string;
  manualFallbackPlaceholder: string;
  manualFallbackButton: string;
}

export const ORAL_TRANSLATIONS: Record<AppLanguage, OralExerciseTranslations> = {
  fr: {
    cardTitle: 'Exercice de répétition orale',
    cardSubtitle:
      'Écoutez le modèle natif, enregistrez votre voix via l’API Web Speech et comparez votre prononciation mot par mot.',
    badgeLabel: 'Web Speech API',
    localeLabel: 'Reconnaissance',
    localeArDz: 'Darija / Arabe (ar-DZ)',
    localeFr: 'Phonétique (fr-FR)',
    nativeStepLabel: '1. Modèle natif',
    listenNative: 'Écouter natif',
    listeningNative: 'Lecture natif…',
    listenSlow: '0,75×',
    recordStepLabel: '2. Votre voix',
    startRecord: 'S’enregistrer',
    stopRecord: 'Arrêter',
    listeningLive: 'Écoute en cours… parlez clairement',
    liveTranscriptLabel: 'Capté en direct :',
    compareTitle: '3. Comparaison & Prononciation',
    playMine: 'Écouter ma voix',
    playingMine: 'Lecture en cours…',
    compareSequence: 'Comparer natif → ma voix',
    comparingSequence: 'Comparaison…',
    noRecordingYet: 'Enregistrez une phrase pour réécouter votre voix face au modèle natif.',
    clearAttempt: 'Effacer',
    scoreLabel: (score) => `Proximité : ${score} %`,
    tierExcellent: 'Très proche du modèle natif !',
    tierGood: 'Compréhensible — affinez les mots en ambre.',
    tierRetry: 'Réécoutez le modèle à 0,75× et réessayez.',
    recognizedTextLabel: 'Transcription Web Speech :',
    wordMatchTitle: 'Repères mot par mot',
    xpEarnedNote: '+10 XP validés pour cet entraînement oral.',
    unsupportedSpeechNote:
      'La reconnaissance vocale Web Speech n’est pas disponible dans ce navigateur. Vous pouvez tout de même enregistrer/réécouter votre voix ou tester la comparaison ci-dessous.',
    micDeniedNote:
      'Accès au microphone refusé ou indisponible. Vérifiez les autorisations du navigateur.',
    noSpeechNote:
      'Aucune parole détectée. Rapprochez-vous du micro et répétez la phrase.',
    networkSpeechNote:
      'Le service de reconnaissance Web Speech du navigateur est temporairement indisponible.',
    manualFallbackLabel: 'Simulateur de comparaison (si micro indisponible)',
    manualFallbackPlaceholder: 'Tapez ce que vous venez de prononcer…',
    manualFallbackButton: 'Comparer',
  },
  en: {
    cardTitle: 'Oral Repetition Exercise',
    cardSubtitle:
      'Listen to the native model, record your voice with the Web Speech API, and compare your pronunciation side by side.',
    badgeLabel: 'Web Speech API',
    localeLabel: 'Recognition',
    localeArDz: 'Darija / Arabic (ar-DZ)',
    localeFr: 'Phonetic (fr-FR)',
    nativeStepLabel: '1. Native model',
    listenNative: 'Listen native',
    listeningNative: 'Playing native…',
    listenSlow: '0.75×',
    recordStepLabel: '2. Your voice',
    startRecord: 'Record voice',
    stopRecord: 'Stop',
    listeningLive: 'Listening… speak clearly',
    liveTranscriptLabel: 'Live transcript:',
    compareTitle: '3. Side-by-Side Comparison',
    playMine: 'Play my voice',
    playingMine: 'Playing…',
    compareSequence: 'Compare native → mine',
    comparingSequence: 'Comparing…',
    noRecordingYet: 'Record your voice to compare it directly against the native audio.',
    clearAttempt: 'Clear',
    scoreLabel: (score) => `Match: ${score}%`,
    tierExcellent: 'Spot on! Very close to native pronunciation.',
    tierGood: 'Clear enough — refine the highlighted words.',
    tierRetry: 'Play the 0.75× native audio once more and try again.',
    recognizedTextLabel: 'Web Speech transcript:',
    wordMatchTitle: 'Word-by-word check',
    xpEarnedNote: '+10 XP awarded for this speaking drill.',
    unsupportedSpeechNote:
      'Web Speech recognition is unavailable in this browser. You can still record/replay audio or test text comparison below.',
    micDeniedNote:
      'Microphone access denied or unavailable. Check browser microphone permissions.',
    noSpeechNote:
      'No speech detected. Speak closer to the microphone and try again.',
    networkSpeechNote:
      'Browser Web Speech recognition service is temporarily unreachable.',
    manualFallbackLabel: 'Comparison fallback (when mic is unavailable)',
    manualFallbackPlaceholder: 'Type what you spoke to test comparison…',
    manualFallbackButton: 'Compare',
  },
  es: {
    cardTitle: 'Ejercicio de repetición oral',
    cardSubtitle:
      'Escucha el modelo nativo, graba tu voz con la API Web Speech y compara tu pronunciación palabra por palabra.',
    badgeLabel: 'Web Speech API',
    localeLabel: 'Reconocimiento',
    localeArDz: 'Dariya / Árabe (ar-DZ)',
    localeFr: 'Fonética (fr-FR)',
    nativeStepLabel: '1. Modelo nativo',
    listenNative: 'Escuchar nativo',
    listeningNative: 'Reproduciendo…',
    listenSlow: '0,75×',
    recordStepLabel: '2. Tu voz',
    startRecord: 'Grabarse',
    stopRecord: 'Detener',
    listeningLive: 'Escuchando… habla con claridad',
    liveTranscriptLabel: 'Captado en directo:',
    compareTitle: '3. Comparación lado a lado',
    playMine: 'Escuchar mi voz',
    playingMine: 'Reproduciendo…',
    compareSequence: 'Comparar nativo → mi voz',
    comparingSequence: 'Comparando…',
    noRecordingYet: 'Graba tu voz para compararla directamente con el audio nativo.',
    clearAttempt: 'Borrar',
    scoreLabel: (score) => `Similitud: ${score} %`,
    tierExcellent: '¡Muy cerca del modelo nativo!',
    tierGood: 'Comprensible — afina las palabras resaltadas.',
    tierRetry: 'Vuelve a escuchar a 0,75× e inténtalo de nuevo.',
    recognizedTextLabel: 'Transcripción Web Speech:',
    wordMatchTitle: 'Análisis palabra por palabra',
    xpEarnedNote: '+10 XP sumados por este ejercicio oral.',
    unsupportedSpeechNote:
      'El reconocimiento Web Speech no está disponible en este navegador. Aún puedes grabar o probar la comparación abajo.',
    micDeniedNote: 'Acceso al micrófono denegado o no disponible.',
    noSpeechNote: 'No se detectó voz. Acércate al micrófono y repite la frase.',
    networkSpeechNote: 'El servicio Web Speech no está disponible temporalmente.',
    manualFallbackLabel: 'Comparador alternativo (sin micrófono)',
    manualFallbackPlaceholder: 'Escribe lo que pronunciaste…',
    manualFallbackButton: 'Comparar',
  },
  de: {
    cardTitle: 'Mündliche Wiederholungsübung',
    cardSubtitle:
      'Höre das Muttersprachler-Audio, nimm deine Stimme per Web Speech API auf und vergleiche deine Aussprache direkt.',
    badgeLabel: 'Web Speech API',
    localeLabel: 'Erkennung',
    localeArDz: 'Darija / Arabisch (ar-DZ)',
    localeFr: 'Phonetik (fr-FR)',
    nativeStepLabel: '1. Muttersprachler',
    listenNative: 'Nativ anhören',
    listeningNative: 'Wiedergabe…',
    listenSlow: '0,75×',
    recordStepLabel: '2. Deine Stimme',
    startRecord: 'Aufnehmen',
    stopRecord: 'Stoppen',
    listeningLive: 'Aufnahme läuft… sprich deutlich',
    liveTranscriptLabel: 'Live erkannt:',
    compareTitle: '3. Direkter Vergleich',
    playMine: 'Meine Stimme',
    playingMine: 'Wiedergabe…',
    compareSequence: 'Nativ → Meine Stimme',
    comparingSequence: 'Vergleiche…',
    noRecordingYet: 'Nimm einen Versuch auf, um ihn mit dem Original zu vergleichen.',
    clearAttempt: 'Löschen',
    scoreLabel: (score) => `Trefferquote: ${score} %`,
    tierExcellent: 'Sehr nah an der Originalaussprache!',
    tierGood: 'Gut verständlich — verfeinere die markierten Wörter.',
    tierRetry: 'Höre dir 0,75× noch einmal an und wiederhole.',
    recognizedTextLabel: 'Web-Speech-Transkript:',
    wordMatchTitle: 'Wort-für-Wort-Prüfung',
    xpEarnedNote: '+10 XP für diese Sprechübung gutgeschrieben.',
    unsupportedSpeechNote:
      'Web-Speech-Erkennung wird von diesem Browser nicht unterstützt. Du kannst unten trotzdem testen.',
    micDeniedNote: 'Mikrofonzugriff verweigert oder nicht verfügbar.',
    noSpeechNote: 'Keine Sprache erkannt. Bitte erneut versuchen.',
    networkSpeechNote: 'Der Web-Speech-Dienst ist vorübergehend nicht erreichbar.',
    manualFallbackLabel: 'Vergleichstest (ohne Mikrofon)',
    manualFallbackPlaceholder: 'Gesprochenen Text eingeben…',
    manualFallbackButton: 'Vergleichen',
  },
  it: {
    cardTitle: 'Esercizio di ripetizione orale',
    cardSubtitle:
      'Ascolta il modello nativo, registra la tua voce con la Web Speech API e confronta la pronuncia parola per parola.',
    badgeLabel: 'Web Speech API',
    localeLabel: 'Riconoscimento',
    localeArDz: 'Darija / Arabo (ar-DZ)',
    localeFr: 'Fonetica (fr-FR)',
    nativeStepLabel: '1. Modello nativo',
    listenNative: 'Ascolta nativo',
    listeningNative: 'Riproduzione…',
    listenSlow: '0,75×',
    recordStepLabel: '2. La tua voce',
    startRecord: 'Registra',
    stopRecord: 'Ferma',
    listeningLive: 'Ascolto attivo… parla chiaramente',
    liveTranscriptLabel: 'Rilevato in diretta:',
    compareTitle: '3. Confronto diretto',
    playMine: 'Ascolta mia voce',
    playingMine: 'Riproduzione…',
    compareSequence: 'Confronta nativo → mia',
    comparingSequence: 'Confronto…',
    noRecordingYet: 'Registra la tua voce per confrontarla con l’audio nativo.',
    clearAttempt: 'Cancella',
    scoreLabel: (score) => `Precisione: ${score}%`,
    tierExcellent: 'Molto vicino alla pronuncia nativa!',
    tierGood: 'Comprensibile — perfeziona le parole evidenziate.',
    tierRetry: 'Riascolta a 0,75× e riprova.',
    recognizedTextLabel: 'Trascrizione Web Speech:',
    wordMatchTitle: 'Verifica parola per parola',
    xpEarnedNote: '+10 XP assegnati per questo esercizio orale.',
    unsupportedSpeechNote:
      'Il riconoscimento Web Speech non è supportato da questo browser. Puoi comunque registrare o confrontare qui sotto.',
    micDeniedNote: 'Accesso al microfono negato o non disponibile.',
    noSpeechNote: 'Nessun parlato rilevato. Riprova più vicino al microfono.',
    networkSpeechNote: 'Servizio Web Speech temporaneamente non raggiungibile.',
    manualFallbackLabel: 'Confronto alternativo (senza microfono)',
    manualFallbackPlaceholder: 'Scrivi ciò che hai pronunciato…',
    manualFallbackButton: 'Confronta',
  },
  nl: {
    cardTitle: 'Mondelinge herhalingsoefening',
    cardSubtitle:
      'Luister naar de moedertaalspreker, neem je stem op met de Web Speech API en vergelijk je uitspraak woord voor woord.',
    badgeLabel: 'Web Speech API',
    localeLabel: 'Herkenning',
    localeArDz: 'Darija / Arabisch (ar-DZ)',
    localeFr: 'Fonetisch (fr-FR)',
    nativeStepLabel: '1. Moedertaalvoorbeeld',
    listenNative: 'Luister voorbeeld',
    listeningNative: 'Speelt af…',
    listenSlow: '0,75×',
    recordStepLabel: '2. Jouw stem',
    startRecord: 'Opnemen',
    stopRecord: 'Stoppen',
    listeningLive: 'Luisteren… spreek duidelijk',
    liveTranscriptLabel: 'Live herkend:',
    compareTitle: '3. Directe vergelijking',
    playMine: 'Mijn stem afspelen',
    playingMine: 'Speelt af…',
    compareSequence: 'Vergelijk natief → mijn',
    comparingSequence: 'Vergelijken…',
    noRecordingYet: 'Neem eerst op om je stem met de originele audio te vergelijken.',
    clearAttempt: 'Wissen',
    scoreLabel: (score) => `Gelijkenis: ${score}%`,
    tierExcellent: 'Heel dicht bij de moedertaaluitspraak!',
    tierGood: 'Goed verstaanbaar — verfijn de gemarkeerde woorden.',
    tierRetry: 'Luister nog eens op 0,75× en probeer opnieuw.',
    recognizedTextLabel: 'Web Speech-transcript:',
    wordMatchTitle: 'Woord-voor-woordcontrole',
    xpEarnedNote: '+10 XP verdiend voor deze spreekoefening.',
    unsupportedSpeechNote:
      'Web Speech-herkenning wordt niet ondersteund in deze browser. Je kunt wel opnemen of hieronder vergelijken.',
    micDeniedNote: 'Microfoontoegang geweigerd of niet beschikbaar.',
    noSpeechNote: 'Geen spraak gedetecteerd. Probeer het opnieuw.',
    networkSpeechNote: 'Web Speech-service is tijdelijk onbereikbaar.',
    manualFallbackLabel: 'Vergelijkingshulp (zonder microfoon)',
    manualFallbackPlaceholder: 'Typ wat je hebt uitgesproken…',
    manualFallbackButton: 'Vergelijken',
  },
  zh: {
    cardTitle: '口语跟读对比练习',
    cardSubtitle:
      '先听地道母语示范，再使用 Web Speech API 录制你的声音，并与原生发音逐词对比。',
    badgeLabel: 'Web Speech API',
    localeLabel: '识别模式',
    localeArDz: '达里贾语 / 阿拉伯语 (ar-DZ)',
    localeFr: '法语拼读音标 (fr-FR)',
    nativeStepLabel: '1. 母语示范',
    listenNative: '听母语原声',
    listeningNative: '正在播放…',
    listenSlow: '0.75×',
    recordStepLabel: '2. 录制发音',
    startRecord: '开始录音',
    stopRecord: '停止',
    listeningLive: '正在聆听… 请清晰朗读',
    liveTranscriptLabel: '实时识别结果：',
    compareTitle: '3. 发音对比回放',
    playMine: '回放我的录音',
    playingMine: '正在播放…',
    compareSequence: '连续对比：原声 → 我的',
    comparingSequence: '对比播放中…',
    noRecordingYet: '请先录制一遍发音，即可与母语原声并排对比回放。',
    clearAttempt: '清除',
    scoreLabel: (score) => `匹配度：${score}%`,
    tierExcellent: '非常接近母语者的地道发音！',
    tierGood: '表达清晰，可重点打磨橙色标注词。',
    tierRetry: '建议先听 0.75× 慢速示范后再试一次。',
    recognizedTextLabel: 'Web Speech 识别文本：',
    wordMatchTitle: '逐词匹配分析',
    xpEarnedNote: '本次口语跟读已获得 +10 XP。',
    unsupportedSpeechNote:
      '当前浏览器不支持 Web Speech 语音识别。你仍可录音回放或在下方测试文本对比。',
    micDeniedNote: '无法访问麦克风，请检查浏览器权限设置。',
    noSpeechNote: '未检测到语音，请靠近麦克风再试一次。',
    networkSpeechNote: '浏览器语音识别服务暂时不可用。',
    manualFallbackLabel: '对比模拟器（无麦克风时可用）',
    manualFallbackPlaceholder: '输入你刚才读出的内容进行对比…',
    manualFallbackButton: '立即对比',
  },
};
