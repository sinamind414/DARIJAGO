import type { AppLanguage, CulturalStory } from '../types/darija';

const STORIES_BY_LANG: Record<AppLanguage, CulturalStory[]> = {
  fr: [
    {
      id: 'story-couscous',
      category: 'FENÊTRE SUR L’ALGÉRIE · MANGER & BOIRE',
      title: 'Koul ! Le couscous et ses mille noms',
      imageUrl: '/src/assets/images/story_couscous_algeria_1794664205490.jpg',
      focusWord: {
        darijaLatin: 'koul',
        darijaArabic: 'كول',
        meaning: 'manger',
      },
      body: 'Koul, mange ! En Algérie, le couscous change de nom selon les régions : seksu ou kseksou à Alger, ta`aam en Oranie, et parfois na’ma, « bénédiction », à Constantine. Les plus anciennes traces de couscoussiers ont été retrouvées dans des sépultures du IIIe siècle av. J.-C., à l’époque du roi berbère Massinissa. Depuis 2020, ses savoirs et pratiques sont inscrits par l’UNESCO au patrimoine culturel immatériel de l’humanité.',
      xpReward: 10,
    },
    {
      id: 'story-atay',
      category: 'FENÊTRE SUR L’ALGÉRIE · HOSPITALITÉ',
      title: 'Atay b na3na3 : l’art de l’accueil',
      imageUrl: '/src/assets/images/story_mint_tea_algiers_1794664206803.jpg',
      focusWord: {
        darijaLatin: 'atay',
        darijaArabic: 'أتاي',
        meaning: 'thé à la menthe',
      },
      body: 'En Algérie, refuser un verre d’atay est presque impensable : verser le thé de haut crée cette mousse légère (rezza) qui signe un accueil chaleureux. À Alger comme au Sud, on l’accompagne souvent de makrout ou de cacahuètes grillées en disant « Marhba bik » — sois le bienvenu.',
      xpReward: 10,
    },
    {
      id: 'story-souk',
      category: 'FENÊTRE SUR L’ALGÉRIE · VIE DE QUARTIER',
      title: 'Ch7al hada ? Négocier avec le sourire',
      focusWord: {
        darijaLatin: 'ch7al',
        darijaArabic: 'شحال',
        meaning: 'combien',
      },
      body: 'Au marché populaire, demander « Ch7al hada ? » ouvre toujours la discussion avec le commerçant. On commence par saluer poliment (« Salam khouya »), puis on glisse parfois un amical « Na9assli chwiya » (baisse un peu le prix). La négociation reste avant tout un moment de lien humain.',
      xpReward: 10,
    },
  ],
  en: [
    {
      id: 'story-couscous',
      category: 'WINDOW ON ALGERIA · FOOD & DRINK',
      title: 'Koul! Couscous and its thousand names',
      imageUrl: '/src/assets/images/story_couscous_algeria_1794664205490.jpg',
      focusWord: {
        darijaLatin: 'koul',
        darijaArabic: 'كول',
        meaning: 'eat',
      },
      body: 'Koul, eat! In Algeria, couscous changes names by region: seksu or kseksou in Algiers, ta`aam in Oran, and sometimes na’ma (“blessing”) in Constantine. The oldest traces of couscous steamers date back to 3rd-century BCE tombs from the time of Berber King Massinissa. Since 2020, its traditions have been listed by UNESCO as Intangible Cultural Heritage.',
      xpReward: 10,
    },
    {
      id: 'story-atay',
      category: 'WINDOW ON ALGERIA · HOSPITALITY',
      title: 'Atay b na3na3: the art of hospitality',
      imageUrl: '/src/assets/images/story_mint_tea_algiers_1794664206803.jpg',
      focusWord: {
        darijaLatin: 'atay',
        darijaArabic: 'أتاي',
        meaning: 'mint tea',
      },
      body: 'In Algeria, turning down a glass of atay is almost unheard of: pouring tea from high up creates a delicate foam (rezza) that signals warm hospitality. From Algiers to the Sahara, it is served with pastries or roasted peanuts alongside “Marhba bik” — welcome.',
      xpReward: 10,
    },
    {
      id: 'story-souk',
      category: 'WINDOW ON ALGERIA · NEIGHBORHOOD LIFE',
      title: 'Ch7al hada? Bargaining with a smile',
      focusWord: {
        darijaLatin: 'ch7al',
        darijaArabic: 'شحال',
        meaning: 'how much',
      },
      body: 'At a local market, asking “Ch7al hada?” starts a friendly chat with the vendor. Always begin with a warm greeting (“Salam khouya”), and if needed gently ask “Na9assli chwiya” (lower it a little). Bargaining in Algeria is above all a warm social exchange.',
      xpReward: 10,
    },
  ],
  es: [
    {
      id: 'story-couscous',
      category: 'VENTANA A ARGELIA · COMER Y BEBER',
      title: '¡Koul! El cuscús y sus mil nombres',
      imageUrl: '/src/assets/images/story_couscous_algeria_1794664205490.jpg',
      focusWord: {
        darijaLatin: 'koul',
        darijaArabic: 'كول',
        meaning: 'comer',
      },
      body: '¡Koul, come! En Argelia, el cuscús cambia de nombre según la región: seksu o kseksou en Argel, ta`aam en Orán y a veces na’ma («bendición») en Constantina. Las cuscuseras más antiguas datan del siglo III a. C., en tiempos del rey bereber Masinisa, y desde 2020 forman parte del patrimonio de la UNESCO.',
      xpReward: 10,
    },
    {
      id: 'story-atay',
      category: 'VENTANA A ARGELIA · HOSPITALIDAD',
      title: 'Atay b na3na3: el arte de recibir',
      imageUrl: '/src/assets/images/story_mint_tea_algiers_1794664206803.jpg',
      focusWord: {
        darijaLatin: 'atay',
        darijaArabic: 'أتاي',
        meaning: 'té a la menta',
      },
      body: 'Rechazar un vaso de atay en Argelia es casi impensable: servirlo desde alto crea una espuma ligera (rezza) símbolo de hospitalidad. Se acompaña con dulces tradicionales y un cordial «Marhba bik» (bienvenido).',
      xpReward: 10,
    },
    {
      id: 'story-souk',
      category: 'VENTANA A ARGELIA · VIDA LOCAL',
      title: '¿Ch7al hada? Regatear con una sonrisa',
      focusWord: {
        darijaLatin: 'ch7al',
        darijaArabic: 'شحال',
        meaning: 'cuánto',
      },
      body: 'En el mercado, preguntar «Ch7al hada?» abre una conversación cercana con el vendedor. Siempre se empieza saludando («Salam khouya») antes de pedir amablemente «Na9assli chwiya» (bájalo un poco).',
      xpReward: 10,
    },
  ],
  de: [
    {
      id: 'story-couscous',
      category: 'FENSTER NACH ALGERIEN · ESSEN & TRINKEN',
      title: 'Koul! Couscous und seine tausend Namen',
      imageUrl: '/src/assets/images/story_couscous_algeria_1794664205490.jpg',
      focusWord: {
        darijaLatin: 'koul',
        darijaArabic: 'كول',
        meaning: 'essen',
      },
      body: 'Koul, iss! In Algerien trägt Couscous je nach Region andere Namen: Seksu oder Kseksou in Algier, Ta`aam in Oran und in Constantine manchmal Na’ma („Segen“). Die ältesten Funde stammen aus dem 3. Jh. v. Chr. zur Zeit von König Massinissa und zählen seit 2020 zum UNESCO-Kulturerbe.',
      xpReward: 10,
    },
    {
      id: 'story-atay',
      category: 'FENSTER NACH ALGERIEN · GASTFREUNDSCHAFT',
      title: 'Atay b na3na3: Die Kunst des Willkommens',
      imageUrl: '/src/assets/images/story_mint_tea_algiers_1794664206803.jpg',
      focusWord: {
        darijaLatin: 'atay',
        darijaArabic: 'أتاي',
        meaning: 'Minztee',
      },
      body: 'Ein Glas Atay abzulehnen gilt in Algerien fast als unmöglich: Das Eingießen aus der Höhe bildet den feinen Schaum (Rezza) herzlicher Gastfreundschaft, begleitet von einem warmen „Marhba bik“.',
      xpReward: 10,
    },
    {
      id: 'story-souk',
      category: 'FENSTER NACH ALGERIEN · ALLTAG',
      title: 'Ch7al hada? Mit einem Lächeln handeln',
      focusWord: {
        darijaLatin: 'ch7al',
        darijaArabic: 'شحال',
        meaning: 'wie viel',
      },
      body: 'Auf dem Markt eröffnet „Ch7al hada?“ das Gespräch. Man grüßt zuerst freundlich („Salam khouya“) und bittet bei Bedarf charmant mit „Na9assli chwiya“ um einen kleinen Nachlass.',
      xpReward: 10,
    },
  ],
  it: [
    {
      id: 'story-couscous',
      category: 'FINESTRA SULL’ALGERIA · CIBO E BEVANDE',
      title: 'Koul! Il couscous e i suoi mille nomi',
      imageUrl: '/src/assets/images/story_couscous_algeria_1794664205490.jpg',
      focusWord: {
        darijaLatin: 'koul',
        darijaArabic: 'كول',
        meaning: 'mangiare',
      },
      body: 'Koul, mangia! In Algeria il couscous cambia nome in base alla regione: seksu o kseksou ad Algeri, ta`aam a Orano e talvolta na’ma («benedizione») a Costantina. Le tracce più antiche risalgono al III secolo a.C. ed è patrimonio UNESCO dal 2020.',
      xpReward: 10,
    },
    {
      id: 'story-atay',
      category: 'FINESTRA SULL’ALGERIA · OSPITALITÀ',
      title: 'Atay b na3na3: l’arte dell’accoglienza',
      imageUrl: '/src/assets/images/story_mint_tea_algiers_1794664206803.jpg',
      focusWord: {
        darijaLatin: 'atay',
        darijaArabic: 'أتاي',
        meaning: 'tè alla menta',
      },
      body: 'Rifiutare un bicchiere di atay in Algeria è quasi impensabile: versarlo dall’alto crea una schiuma leggera (rezza) simbolo di calore e accoglienza, insieme a un sincero «Marhba bik».',
      xpReward: 10,
    },
    {
      id: 'story-souk',
      category: 'FINESTRA SULL’ALGERIA · VITA DI QUARTIERE',
      title: 'Ch7al hada? Contrattare con il sorriso',
      focusWord: {
        darijaLatin: 'ch7al',
        darijaArabic: 'شحال',
        meaning: 'quanto',
      },
      body: 'Al mercato chiedere «Ch7al hada?» apre sempre il dialogo. Si saluta con rispetto («Salam khouya») e poi si chiede gentilmente «Na9assli chwiya» (abbassa un po’).',
      xpReward: 10,
    },
  ],
  nl: [
    {
      id: 'story-couscous',
      category: 'VENSTER OP ALGERIJE · ETEN & DRINKEN',
      title: 'Koul! Couscous en zijn duizend namen',
      imageUrl: '/src/assets/images/story_couscous_algeria_1794664205490.jpg',
      focusWord: {
        darijaLatin: 'koul',
        darijaArabic: 'كول',
        meaning: 'eten',
      },
      body: 'Koul, eet! In Algerije krijgt couscous per regio een andere naam: seksu of kseksou in Algiers, ta`aam in Oran en soms na’ma (‘zegen’) in Constantine. De oudste vondsten dateren uit de 3e eeuw v.Chr. en sinds 2020 staat het op de UNESCO-erfgoedlijst.',
      xpReward: 10,
    },
    {
      id: 'story-atay',
      category: 'VENSTER OP ALGERIJE · GASTVRIJHEID',
      title: 'Atay b na3na3: de kunst van gastvrijheid',
      imageUrl: '/src/assets/images/story_mint_tea_algiers_1794664206803.jpg',
      focusWord: {
        darijaLatin: 'atay',
        darijaArabic: 'أتاي',
        meaning: 'muntthee',
      },
      body: 'Een glas atay afslaan is in Algerije bijna ondenkbaar: van grote hoogte inschenken zorgt voor een zachte schuimkraag (rezza) als teken van warm welkom, altijd gevolgd door ‘Marhba bik’.',
      xpReward: 10,
    },
    {
      id: 'story-souk',
      category: 'VENSTER OP ALGERIJE · BUURTLEVEN',
      title: 'Ch7al hada? Onderhandelen met een glimlach',
      focusWord: {
        darijaLatin: 'ch7al',
        darijaArabic: 'شحال',
        meaning: 'hoeveel',
      },
      body: 'Op de markt begint het gesprek met ‘Ch7al hada?’. Groet eerst vriendelijk (‘Salam khouya’) en vraag eventueel beleefd ‘Na9assli chwiya’ (iets goedkoper).',
      xpReward: 10,
    },
  ],
  zh: [
    {
      id: 'story-couscous',
      category: '阿尔及利亚之窗 · 饮食文化',
      title: 'Koul！古斯古斯与它的千种名字',
      imageUrl: '/src/assets/images/story_couscous_algeria_1794664205490.jpg',
      focusWord: {
        darijaLatin: 'koul',
        darijaArabic: 'كول',
        meaning: '吃',
      },
      body: 'Koul，吃吧！在阿尔及利亚，古斯古斯在不同地区有着不同称呼：阿尔及尔叫 seksu 或 kseksou，奥兰叫 ta`aam，君士坦丁有时称作 na’ma（“恩赐”）。最古老的蒸锅遗迹可追溯至公元前 3 世纪柏柏尔国王马西尼萨时期，2020 年被列入联合国教科文组织非遗名录。',
      xpReward: 10,
    },
    {
      id: 'story-atay',
      category: '阿尔及利亚之窗 · 待客之道',
      title: 'Atay b na3na3：薄荷茶里的好客礼仪',
      imageUrl: '/src/assets/images/story_mint_tea_algiers_1794664206803.jpg',
      focusWord: {
        darijaLatin: 'atay',
        darijaArabic: 'أتاي',
        meaning: '薄荷茶',
      },
      body: '在阿尔及利亚，几乎没有人会拒绝一杯热腾腾的薄荷茶（atay）。高冲斟茶形成的细腻茶沫（rezza）象征诚挚欢迎，配上一句温暖的「Marhba bik」（欢迎你）。',
      xpReward: 10,
    },
    {
      id: 'story-souk',
      category: '阿尔及利亚之窗 · 市井生活',
      title: 'Ch7al hada？微笑着逛集市',
      focusWord: {
        darijaLatin: 'ch7al',
        darijaArabic: 'شحال',
        meaning: '多少钱',
      },
      body: '在阿尔及利亚集市里，一句「Ch7al hada？」就能开启与摊主的友好交谈。先礼貌问候「Salam khouya」，再温和地说一句「Na9assli chwiya」（便宜一点吧），讲价也是一种人情交流。',
      xpReward: 10,
    },
  ],
};

export function getCulturalStories(lang: AppLanguage): CulturalStory[] {
  return STORIES_BY_LANG[lang] ?? STORIES_BY_LANG.fr;
}
