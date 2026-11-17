import type {
  AppLanguage,
  ArabiziSound,
  DarijaPhrase,
  DialogueScenario,
  LearningModule,
} from '../types/darija';
import { UI_TRANSLATIONS } from './translations';

type NonFrenchLanguage = Exclude<AppLanguage, 'fr'>;

interface ModuleTranslation {
  title: string;
  subtitle: string;
  contextLabel: string;
}

interface SoundTranslation {
  name: string;
  pronunciationTip: string;
  exampleMeaning: string;
}

interface PhraseTranslation {
  meaning: string;
  literalMeaning?: string;
  regionalNote: string;
  breakdown: string[];
}

interface ScenarioTranslation {
  title: string;
  setting: string;
  partnerRole: string;
  objective: string;
  openingTranslation: string;
  openingTip: string;
  starterMeanings: string[];
}

const MODULE_TRANSLATIONS: Record<
  NonFrenchLanguage,
  Record<string, ModuleTranslation>
> = {
  en: {
    salutations: {
      title: 'Greetings & Politeness',
      subtitle: 'Say hello and ask how someone is',
      contextLabel: 'Daily life · Algiers, Oran & Constantine',
    },
    presentation: {
      title: 'Introductions & Family',
      subtitle: 'Name, origin, and loved ones',
      contextLabel: 'Socializing · Everyday introductions',
    },
    cafe: {
      title: 'Café & Restaurant',
      subtitle: 'Order drinks and enjoy a meal',
      contextLabel: 'Hospitality · Cafés & dining',
    },
    marche: {
      title: 'Market, Prices & Directions',
      subtitle: 'Bargain and ask the way',
      contextLabel: 'Shopping & Getting around',
    },
    quotidien: {
      title: 'Everyday Expressions',
      subtitle: 'Essential reflex phrases',
      contextLabel: 'Spontaneity · Speak like a local',
    },
    verbes: {
      title: 'Verbs & Useful Phrases',
      subtitle: 'Understand and ask questions',
      contextLabel: 'Autonomy · Spoken fluency',
    },
    'bensedira-base': {
      title: 'Ben Sedira · Verbs & Essentials',
      subtitle: 'Buy, help, time, and spoken contractions',
      contextLabel: 'Ben Sedira Dictionary (1910) · File 1',
    },
  },
  es: {
    salutations: {
      title: 'Saludos y Cortesía',
      subtitle: 'Saludar y preguntar cómo está alguien',
      contextLabel: 'Vida diaria · Argel, Orán y Constantina',
    },
    presentation: {
      title: 'Presentarse y Familia',
      subtitle: 'Nombre, origen y seres queridos',
      contextLabel: 'Encuentros · Diálogos sociales',
    },
    cafe: {
      title: 'En el Café y Restaurante',
      subtitle: 'Pedir y disfrutar la comida',
      contextLabel: 'Hospitalidad · Terrazas y mesas',
    },
    marche: {
      title: 'Mercado, Precios y Orientación',
      subtitle: 'Regatear y preguntar el camino',
      contextLabel: 'Compras y Desplazamientos',
    },
    quotidien: {
      title: 'Expresiones Cotidianas',
      subtitle: 'Frases reflejo indispensables',
      contextLabel: 'Espontaneidad · Hablar como un local',
    },
    verbes: {
      title: 'Verbos y Frases Útiles',
      subtitle: 'Comprender y hacer preguntas',
      contextLabel: 'Autonomía · Expresión oral',
    },
    'bensedira-base': {
      title: 'Ben Sedira · Verbos y Claves',
      subtitle: 'Comprar, ayudar, tiempo y contracciones',
      contextLabel: 'Diccionario Ben Sedira (1910) · Archivo 1',
    },
  },
  de: {
    salutations: {
      title: 'Begrüßung & Höflichkeit',
      subtitle: 'Grüßen und nach dem Befinden fragen',
      contextLabel: 'Alltag · Algier, Oran & Constantine',
    },
    presentation: {
      title: 'Vorstellen & Familie',
      subtitle: 'Name, Herkunft und Angehörige',
      contextLabel: 'Begegnungen · Alltagsgespräche',
    },
    cafe: {
      title: 'Im Café & Restaurant',
      subtitle: 'Bestellen und das Essen genießen',
      contextLabel: 'Gastfreundschaft · Cafés & Tische',
    },
    marche: {
      title: 'Markt, Preise & Orientierung',
      subtitle: 'Handeln und nach dem Weg fragen',
      contextLabel: 'Einkauf & Unterwegs',
    },
    quotidien: {
      title: 'Alltagsausdrücke',
      subtitle: 'Unverzichtbare Redewendungen',
      contextLabel: 'Spontanität · Sprechen wie Einheimische',
    },
    verbes: {
      title: 'Verben & Nützliche Sätze',
      subtitle: 'Verstehen und Fragen stellen',
      contextLabel: 'Selbstständigkeit · Mündlicher Ausdruck',
    },
    'bensedira-base': {
      title: 'Ben Sedira · Verben & Grundlagen',
      subtitle: 'Kaufen, helfen, Zeit und Verschmelzungen',
      contextLabel: 'Ben Sedira Wörterbuch (1910) · Datei 1',
    },
  },
  it: {
    salutations: {
      title: 'Saluti & Cortesia',
      subtitle: 'Salutare e chiedere come va',
      contextLabel: 'Vita quotidiana · Algeri, Orano & Costantina',
    },
    presentation: {
      title: 'Presentarsi & Famiglia',
      subtitle: 'Nome, origine e familiari',
      contextLabel: 'Incontri · Dialoghi sociali',
    },
    cafe: {
      title: 'Al Bar & Ristorante',
      subtitle: 'Ordinare e apprezzare il pasto',
      contextLabel: 'Convivialità · Bar e tavole',
    },
    marche: {
      title: 'Mercato, Prezzi & Orientamento',
      subtitle: 'Contrattare e chiedere la strada',
      contextLabel: 'Acquisti & Spostamenti',
    },
    quotidien: {
      title: 'Espressioni Quotidiane',
      subtitle: 'Parole riflesso indispensabili',
      contextLabel: 'Spontaneità · Parlare come un locale',
    },
    verbes: {
      title: 'Verbi & Frasi Utili',
      subtitle: 'Capire e fare domande',
      contextLabel: 'Autonomia · Espressione orale',
    },
    'bensedira-base': {
      title: 'Ben Sedira · Verbi & Basi',
      subtitle: 'Comprare, aiutare, tempo e contrazioni',
      contextLabel: 'Dizionario Ben Sedira (1910) · File 1',
    },
  },
  nl: {
    salutations: {
      title: 'Begroetingen & Beleefdheid',
      subtitle: 'Groeten en vragen hoe het gaat',
      contextLabel: 'Dagelijks leven · Algiers, Oran & Constantine',
    },
    presentation: {
      title: 'Voorstellen & Familie',
      subtitle: 'Naam, afkomst en naasten',
      contextLabel: 'Ontmoetingen · Sociale gesprekken',
    },
    cafe: {
      title: 'In het Café & Restaurant',
      subtitle: 'Bestellen en van het eten genieten',
      contextLabel: 'Gastvrijheid · Terrassen & tafels',
    },
    marche: {
      title: 'Markt, Prijzen & Richting',
      subtitle: 'Afdingen en de weg vragen',
      contextLabel: 'Winkelen & Vervoer',
    },
    quotidien: {
      title: 'Dagelijkse Uitdrukkingen',
      subtitle: 'Onmisbare reflexzinnen',
      contextLabel: 'Spontaniteit · Spreken als een local',
    },
    verbes: {
      title: 'Werkwoorden & Nuttige Zinnen',
      subtitle: 'Begrijpen en vragen stellen',
      contextLabel: 'Zelfstandigheid · Spreekvaardigheid',
    },
    'bensedira-base': {
      title: 'Ben Sedira · Werkwoorden & Basis',
      subtitle: 'Kopen, helpen, tijd en samentrekkingen',
      contextLabel: 'Ben Sedira Woordenboek (1910) · Bestand 1',
    },
  },
  zh: {
    salutations: {
      title: '问候与礼貌用语',
      subtitle: '打招呼与寒暄近况',
      contextLabel: '日常生活 · 阿尔及尔、奥兰与君士坦丁',
    },
    presentation: {
      title: '自我介绍与家庭',
      subtitle: '姓名、籍贯与亲友',
      contextLabel: '社交场合 · 日常交流',
    },
    cafe: {
      title: '咖啡馆与餐厅',
      subtitle: '点餐与称赞美食',
      contextLabel: '待客之道 · 露台与餐桌',
    },
    marche: {
      title: '集市、价格与问路',
      subtitle: '讨价还价与询问路线',
      contextLabel: '购物与出行',
    },
    quotidien: {
      title: '日常高频表达',
      subtitle: '脱口而出的地道口头禅',
      contextLabel: '自然交流 · 像本地人一样说话',
    },
    verbes: {
      title: '常用动词与实用句',
      subtitle: '表达理解与主动提问',
      contextLabel: '自主交流 · 口语表达',
    },
    'bensedira-base': {
      title: 'Ben Sedira · 核心动词与基础',
      subtitle: '购买、协助、时间表达与口语缩合',
      contextLabel: 'Ben Sedira 词典 (1910) · 第1册',
    },
  },
};

const SOUND_TRANSLATIONS: Record<
  NonFrenchLanguage,
  Record<string, SoundTranslation>
> = {
  en: {
    '3': {
      name: 'Ayn (3ayn)',
      pronunciationTip:
        'A deep guttural sound made by gently tightening the back of the throat, like a resonant "a" from deep inside.',
      exampleMeaning: 'Glad to see you safe / Welcome',
    },
    '7': {
      name: 'Emphatic Ha (7a)',
      pronunciationTip:
        'A strong, dry breathy "h" from deep in the throat, like fogging up glasses with warm breath.',
      exampleMeaning: 'Good morning',
    },
    '9': {
      name: 'Qaf (9af)',
      pronunciationTip:
        'A deep "k" pronounced far back on the soft palate near the uvula. Often pronounced "g" in some regions.',
      exampleMeaning: 'Coffee',
    },
    'kh / 5': {
      name: 'Kha',
      pronunciationTip:
        'A soft raspy sound at the back of the palate, similar to Spanish "j" or German "ch" in "Bach".',
      exampleMeaning: 'My brother (or friendly address)',
    },
    gh: {
      name: 'Ghayn',
      pronunciationTip:
        'Very close to the French uvular "r" in "Paris" or "regarder", voiced smoothly from the throat.',
      exampleMeaning: 'Expensive (fem.)',
    },
    ch: {
      name: 'Chin',
      pronunciationTip:
        'Identical to English "sh" in "shoe" or "share". Very common at the start of questions (Wach, Ch7al).',
      exampleMeaning: 'How much is this?',
    },
  },
  es: {
    '3': {
      name: 'Ayn (3ayn)',
      pronunciationTip:
        'Sonido gutural profundo que se produce cerrando suavemente el fondo de la garganta, como una «a» intensa.',
      exampleMeaning: 'Me alegra verte sano y salvo / Bienvenido',
    },
    '7': {
      name: 'Ha enfática (7a)',
      pronunciationTip:
        'Exhalación fuerte y seca desde el fondo de la garganta, como al echar vaho sobre unas gafas.',
      exampleMeaning: 'Buenos días (por la mañana)',
    },
    '9': {
      name: 'Qaf (9af)',
      pronunciationTip:
        'Una «k» muy grave pronunciada al fondo del paladar, cerca de la úvula. A veces suena como «g».',
      exampleMeaning: 'Café',
    },
    'kh / 5': {
      name: 'Kha',
      pronunciationTip:
        'Sonido raspado suave al fondo del paladar, muy parecido a la «j» española en «jamón».',
      exampleMeaning: 'Mi hermano (o trato amistoso)',
    },
    gh: {
      name: 'Ghayn',
      pronunciationTip:
        'Muy similar a la «r» gutural francesa de «Paris», pronunciada con suavidad.',
      exampleMeaning: 'Cara (precio alto)',
    },
    ch: {
      name: 'Chin',
      pronunciationTip:
        'Como la «sh» inglesa en «show». Muy frecuente al inicio de preguntas (Wach, Ch7al).',
      exampleMeaning: '¿Cuánto cuesta esto?',
    },
  },
  de: {
    '3': {
      name: 'Ayn (3ayn)',
      pronunciationTip:
        'Tiefer Kehllaut, der durch sanftes Verengen des Rachens entsteht, wie ein gepresstes „a“ aus dem Bauch.',
      exampleMeaning: 'Schön, dich wohlbehalten zu sehen / Willkommen',
    },
    '7': {
      name: 'Emphatisches Ha (7a)',
      pronunciationTip:
        'Kräftiges, trockenes Hauchen aus dem tiefen Rachen, als würde man eine Brille anhauchen.',
      exampleMeaning: 'Guten Morgen',
    },
    '9': {
      name: 'Qaf (9af)',
      pronunciationTip:
        'Ein sehr tiefes „k“, ganz hinten am Gaumen gesprochen. In manchen Regionen auch als „g“ gesprochen.',
      exampleMeaning: 'Kaffee',
    },
    'kh / 5': {
      name: 'Kha',
      pronunciationTip:
        'Weicher Reibelaut hinten am Gaumen, genau wie das deutsche „ch“ in „Bach“.',
      exampleMeaning: 'Mein Bruder (oder freundliche Anrede)',
    },
    gh: {
      name: 'Ghayn',
      pronunciationTip:
        'Sehr ähnlich dem gerollten/uvularen deutschen „r“ in „rot“, sanft im Rachen gesprochen.',
      exampleMeaning: 'Teuer (fem.)',
    },
    ch: {
      name: 'Chin',
      pronunciationTip:
        'Identisch mit dem deutschen „sch“ in „Schule“. Sehr häufig am Anfang von Fragen (Wach, Ch7al).',
      exampleMeaning: 'Wie viel kostet das?',
    },
  },
  it: {
    '3': {
      name: 'Ayn (3ayn)',
      pronunciationTip:
        'Suono gutturale profondo prodotto stringendo dolcemente la gola, come una «a» appoggiata.',
      exampleMeaning: 'Felice di vederti sano e salvo / Benvenuto',
    },
    '7': {
      name: 'Ha enfatica (7a)',
      pronunciationTip:
        'Espirazione forte e secca dal fondo della gola, come quando si alita sugli occhiali per pulirli.',
      exampleMeaning: 'Buongiorno (mattina)',
    },
    '9': {
      name: 'Qaf (9af)',
      pronunciationTip:
        'Una «k» molto profonda pronunciata in fondo al palato. Spesso pronunciata «g» in alcune regioni.',
      exampleMeaning: 'Caffè',
    },
    'kh / 5': {
      name: 'Kha',
      pronunciationTip:
        'Suono aspirato morbido in fondo al palato, simile alla «j» spagnola o al «ch» tedesco in «Bach».',
      exampleMeaning: 'Mio fratello (o appellativo amichevole)',
    },
    gh: {
      name: 'Ghayn',
      pronunciationTip:
        'Molto vicino alla «r» moscia francese in «Paris», pronunciata dolcemente.',
      exampleMeaning: 'Cara (prezzo alto)',
    },
    ch: {
      name: 'Chin',
      pronunciationTip:
        'Identico al gruppo italiano «sc» di «scena». Molto frequente all’inizio delle domande (Wach, Ch7al).',
      exampleMeaning: 'Quanto costa questo?',
    },
  },
  nl: {
    '3': {
      name: 'Ayn (3ayn)',
      pronunciationTip:
        'Diepe keelklank gemaakt door de achterkant van de keel zacht aan te spannen, als een diepe "a".',
      exampleMeaning: 'Blij je gezond te zien / Welkom',
    },
    '7': {
      name: 'Emfatische Ha (7a)',
      pronunciationTip:
        'Krachtige, droge ademstoot vanuit de keel, alsof je op een bril ademt om die te poetsen.',
      exampleMeaning: 'Goedemorgen',
    },
    '9': {
      name: 'Qaf (9af)',
      pronunciationTip:
        'Een diepe "k" helemaal achter in de mond bij de huig. In sommige regio’s uitgesproken als "g".',
      exampleMeaning: 'Koffie',
    },
    'kh / 5': {
      name: 'Kha',
      pronunciationTip:
        'Zachte schrapende klank achter in de keel, vergelijkbaar met de harde Nederlandse "g" of "ch" in "acht".',
      exampleMeaning: 'Mijn broer (of vriendelijke aanspreekvorm)',
    },
    gh: {
      name: 'Ghayn',
      pronunciationTip:
        'Lijkt sterk op de zachte brouwende "r" in het Frans ("Paris") of zuidelijk Nederlands.',
      exampleMeaning: 'Duur (vrouwelijk)',
    },
    ch: {
      name: 'Chin',
      pronunciationTip:
        'Gelijk aan "sj" in "sjaal" of Engels "sh". Komt vaak voor aan het begin van vragen (Wach, Ch7al).',
      exampleMeaning: 'Hoeveel kost dit?',
    },
  },
  zh: {
    '3': {
      name: 'Ayn（3ayn 喉音）',
      pronunciationTip:
        '收紧咽喉深处发出的浑厚浊喉音，类似于从胸腔深处发出的重读“a”。',
      exampleMeaning: '很高兴见到你平安归来 / 欢迎',
    },
    '7': {
      name: '重读 Ha（7a）',
      pronunciationTip:
        '从咽喉深处用力呼出的干脆气音，就像往眼镜片上哈气时的感觉。',
      exampleMeaning: '早上好',
    },
    '9': {
      name: 'Qaf（9af）',
      pronunciationTip:
        '在软腭最深处接近小舌的位置发出的低沉“k”音；在部分地区常读作“g”。',
      exampleMeaning: '咖啡',
    },
    'kh / 5': {
      name: 'Kha',
      pronunciationTip:
        '舌根靠后摩擦软腭发出的清擦音，接近汉语拼音的“h”或德语“Bach”中的“ch”。',
      exampleMeaning: '我的兄弟（或友好称呼）',
    },
    gh: {
      name: 'Ghayn',
      pronunciationTip:
        '接近法语“Paris”中的小舌颤音“r”，发音柔和连贯。',
      exampleMeaning: '昂贵的（阴性）',
    },
    ch: {
      name: 'Chin',
      pronunciationTip:
        '与英语“shoe”中的“sh”相同，常出现在疑问词开头（如 Wach、Ch7al）。',
      exampleMeaning: '这个多少钱？',
    },
  },
};

const PHRASE_TRANSLATIONS: Record<
  NonFrenchLanguage,
  Record<string, PhraseTranslation>
> = {
  en: {
    'sal-1': {
      meaning: 'Hello, how are you?',
      literalMeaning: 'Peace be upon you, what is new with you?',
      regionalNote:
        'In Algiers and the Center people say "Wach rak?" (masc.) / "Wach raki?" (fem.). In Oran and the West, "Ki rak?" is very common.',
      breakdown: ['Hello (greeting)', 'what / how', 'are you (masc.)'],
    },
    'sal-2': {
      meaning: 'I am fine, thank God. And you?',
      literalMeaning: 'No harm, praise be to God. And you?',
      regionalNote:
        'Universal reply across Algeria. Use "W nta?" when speaking to a man and "W nti?" to a woman.',
      breakdown: ['Good / no harm', 'thank God', 'And you (masc.)'],
    },
    'sal-3': {
      meaning: 'Good morning — Bright morning (reply)',
      literalMeaning: 'Morning of goodness — Morning of light',
      regionalNote:
        'In the afternoon and evening, replace "Sba7" with "Msa": "Msa el khir" (Good evening).',
      breakdown: ['Morning', 'goodness', 'light'],
    },
    'sal-4': {
      meaning: 'Thank you, bless your health',
      literalMeaning: 'You did well, may God give you health',
      regionalNote:
        '"Sahit" (masc.) / "Sahiti" (fem.) is the warmest, most authentic way to say thank you in Algeria.',
      breakdown: ['Thank you / well done', 'may He give you', 'health'],
    },
    'sal-5': {
      meaning: 'Excuse me brother, is it alright / sorry?',
      literalMeaning: 'Forgive me my brother, no problem?',
      regionalNote:
        'People warmly call a man "khouya" (my brother) and a woman "khti" (my sister) out of respect and friendliness.',
      breakdown: ['Excuse me / sorry', 'my brother', 'no problem / is it okay'],
    },
    'sal-6': {
      meaning: 'Goodbye, take care',
      literalMeaning: 'With peace, in God’s protection',
      regionalNote:
        'To say "see you soon", people often add "Men ba3d inchallah" or "Thalla fi ro7ek" (take care of yourself).',
      breakdown: ['Goodbye (with peace)', 'in the protection', 'of God'],
    },
    'pres-1': {
      meaning: 'What is your name? My name is Karim',
      regionalNote:
        'In some provinces you also hear "Wasmek?", a quick contraction of "Wach ismek?".',
      breakdown: ['What', 'your name', 'My name is'],
    },
    'pres-2': {
      meaning: 'Where are you from? I am from Algiers / Algeria',
      regionalNote:
        '"Dzayer" refers to both the capital city Algiers (El Bahdja) and the country Algeria.',
      breakdown: ['Where from', 'you (masc.)', 'I am from Algiers / Algeria'],
    },
    'pres-3': {
      meaning: 'Very nice to meet you!',
      regionalNote:
        '"Bezzaf" means "a lot / very". It is one of the most frequent words in Algerian Darija.',
      breakdown: ['Honored / pleased', 'very much'],
    },
    'pres-4': {
      meaning: 'This is our home, welcome',
      regionalNote:
        '"Mar7ba bik" (to one person) or "Mar7ba bikoum" (to several) expresses warm Algerian hospitality.',
      breakdown: ['This is', 'our house', 'welcome to you all'],
    },
    'pres-5': {
      meaning: 'Mom and Dad are at home',
      regionalNote:
        '"Yemma" (mom) is typically Algerian/Maghrebi, affectionate and used every day.',
      breakdown: ['Mom', 'and dad', 'are at home'],
    },
    'pres-6': {
      meaning: 'I have two brothers and a little sister',
      regionalNote:
        '"3andi" means "I have", and "zouj" means "two" (widely used across the Maghreb).',
      breakdown: ['I have', 'two brothers', 'and my little sister'],
    },
    'cafe-1': {
      meaning: 'Give me a half-and-half coffee (latte), please',
      regionalNote:
        '"Ta3ich" (lit. "may you live") is the warm everyday equivalent of "please".',
      breakdown: ['Give me', 'half-and-half coffee', 'please'],
    },
    'cafe-2': {
      meaning: 'I would like a glass of mint tea',
      regionalNote:
        '"Bghit" (I want / would like) comes from "bgha". You also hear "N7ab" (I would like).',
      breakdown: ['I would like', 'a glass of tea', 'with mint'],
    },
    'cafe-3': {
      meaning: 'This food is really delicious!',
      regionalNote:
        '"Bnin" (masc.) / "Bnina" (fem.) means "tasty, delicious". Essential at the table!',
      breakdown: ['This food', 'delicious', 'very / a lot'],
    },
    'cafe-4': {
      meaning: 'Enjoy your meal / Cheers! — Thank you',
      regionalNote:
        'You say "Bsa7tek" after a meal, coffee, haircut, or any new purchase.',
      breakdown: ['To your health / enjoy', 'May God keep you safe'],
    },
    'cafe-5': {
      meaning: 'Bring me cold water, please',
      regionalNote:
        '"Men fadlek" is the polite standard way to say "please", useful in formal settings or restaurants.',
      breakdown: ['Bring me', 'cold water', 'please'],
    },
    'cafe-6': {
      meaning: 'How much is the bill, brother?',
      regionalNote:
        '"El 7sab" means "the bill / check". You can also say "Ch7al khallas?" (How much do I pay?).',
      breakdown: ['How much', 'the bill', 'my brother'],
    },
    'mar-1': {
      meaning: 'How much is this? — It is a bit expensive',
      regionalNote:
        '"Chwiya" means "a little". Essential for softening a remark or bargaining with a smile.',
      breakdown: ['How much', 'this', 'a bit expensive (fem.)'],
    },
    'mar-2': {
      meaning: 'Lower the price a bit for me, I am a regular customer!',
      regionalNote:
        'At the market or local shops, a smile with "Naqasli chwiya" always opens friendly negotiation.',
      breakdown: ['Lower for me', 'a little', 'I am a customer'],
    },
    'mar-3': {
      meaning: 'Where is the market, please?',
      regionalNote:
        '"Win" (where) + "ja" (is located) is the standard structure for asking where a place is.',
      breakdown: ['Where', 'is located', 'the market'],
    },
    'mar-4': {
      meaning: 'Go straight ahead, then turn right',
      regionalNote: '"Limin" = right, "Lisar" = left, "Qbala" = straight ahead.',
      breakdown: ['Go straight', 'then', 'turn right'],
    },
    'mar-5': {
      meaning: 'Is it close to here, or very far?',
      regionalNote: '"Hna" = here, "Lhih" = over there, "Qrib" = near, "B3id" = far.',
      breakdown: ['Here close', 'or', 'very far'],
    },
    'mar-6': {
      meaning: 'Drop me off here, please (taxi / bus)',
      regionalNote:
        'The magic phrase in Algerian taxis or buses to ask the driver to stop right here.',
      breakdown: ['Drop me off', 'here', 'please'],
    },
    'quot-1': {
      meaning: 'There is / There is not',
      regionalNote:
        'Negation in Darija often wraps a word with "ma ... che": kan (there is) → ma kanche (there is not).',
      breakdown: ['There is / available', 'There is not'],
    },
    'quot-2': {
      meaning: 'It is okay, everything will work out',
      regionalNote:
        '"Ma3lich" expresses calm reassurance, acceptance, or saying "no worries".',
      breakdown: ['No worries / it is fine', 'everything', 'God will provide'],
    },
    'quot-3': {
      meaning: 'What is new today?',
      regionalNote: 'A very natural greeting among friends or coworkers in the morning.',
      breakdown: ['What is there', 'new', 'today'],
    },
    'quot-4': {
      meaning: 'I am coming right now, wait a little',
      regionalNote:
        '"Doka" (or "Dork" in East/Central Algeria) means "now / right away".',
      breakdown: ['Now', 'I am coming', 'be patient a bit'],
    },
    'quot-5': {
      meaning: 'Honestly that is true, you are completely right',
      regionalNote:
        '"3andek el 7a9" (you are right) comes up constantly in friendly conversations.',
      breakdown: ['Honestly / really', 'true', 'you are right'],
    },
    'quot-6': {
      meaning: 'God willing, we will meet tomorrow',
      regionalNote: '"Ghodwa" = tomorrow, "El bare7" = yesterday, "El youm" = today.',
      breakdown: ['God willing', 'tomorrow', 'we meet'],
    },
    'verb-1': {
      meaning: 'I did not understand, speak slowly please',
      regionalNote:
        'The most useful phrase while learning! "Fhamt" (I understood) → "Ma fhamtche" (I did not understand).',
      breakdown: ['I did not understand', 'speak (imperative)', 'slowly'],
    },
    'verb-2': {
      meaning: 'I am learning to speak Darija',
      regionalNote:
        'Saying this almost always brings a big smile and warm encouragement in Algeria!',
      breakdown: ['I am learning', 'to speak', 'Darija'],
    },
    'verb-3': {
      meaning: 'What is this in Darija?',
      regionalNote: 'You can also ask "Kifech tgoulou l’hada?" (How do you call this?).',
      breakdown: ['What is', 'this', 'in Darija'],
    },
    'verb-4': {
      meaning: 'I am going to work',
      regionalNote:
        'For a woman, adjust the participle: "Rani ray7a" (I am going) instead of "raye7".',
      breakdown: ['I am going', 'to work'],
    },
    'verb-5': {
      meaning: 'I know a little, but still learning',
      regionalNote: '"Bessa7" means "but / however", and "Mazal" means "still / not yet".',
      breakdown: ['I know', 'a little', 'but still'],
    },
    'verb-6': {
      meaning: 'Repeat this word for me, please',
      regionalNote:
        '"3awed" comes from the verb to repeat/redo. Super helpful to lock in pronunciation.',
      breakdown: ['Repeat for me', 'this word', 'please'],
    },
    'bs7-1': {
      meaning: 'I buy bread, I bought milk',
      literalMeaning: 'Verb to buy: nechri (present), chrit (past), chra (he bought)',
      regionalNote:
        'Ben Sedira’s classic preface rule: defective verbs in -a take -i in the present (nechri) and -it in the past (chrit).',
      breakdown: ['I buy (1st pres.)', 'the bread', 'I bought the milk'],
    },
    'bs7-2': {
      meaning: 'Help me with this matter, my friend',
      regionalNote: 'From the verb nâouen / âouent / âouen (to help). Plural of s’ah’eb is s’h’ab.',
      breakdown: ['Help me', 'in this matter', 'my friend'],
    },
    'bs7-3': {
      meaning: 'Go in peace — Stay well (goodbye)',
      regionalNote:
        'Traditional reciprocal farewell noted by Ben Sedira: the traveler says “abqa âla kheir” and the host replies “emchi besselama”.',
      breakdown: ['Go in peace', 'stay in goodness'],
    },
    'bs7-4': {
      meaning: 'Why did you come early? To learn',
      regionalNote:
        'Classic Algerian contractions: “âlach” (âla + ayy chay = why) and “bach” (bi + ayy chay = in order to).',
      breakdown: ['Why', 'did you come early', 'so that I learn'],
    },
    'bs7-5': {
      meaning: 'How old are you? I am twenty years old',
      regionalNote:
        'From 11 to 99, nouns like “sna” (year) stay singular after the number (e.g. âchrin sna).',
      breakdown: ['How much', 'in your age', 'I have twenty years'],
    },
    'bs7-6': {
      meaning: 'From January to spring, the weather is nice',
      regionalNote:
        'Algerian solar months from Ben Sedira (p. XLVII): iennar (Jan), fourar (Feb), mar’res (Mar), r’oucht (Aug), jenber (Dec).',
      breakdown: ['From January', 'to spring (solar article)', 'the weather is good'],
    },
  },
  es: {
    'sal-1': {
      meaning: 'Hola, ¿cómo estás?',
      literalMeaning: 'La paz sobre ti, ¿qué hay de nuevo?',
      regionalNote:
        'En Argel y el Centro se dice «Wach rak?» (hombre) / «Wach raki?» (mujer). En Orán es muy común «Ki rak?».',
      breakdown: ['Hola (saludo)', 'qué / cómo', 'estás (masc.)'],
    },
    'sal-2': {
      meaning: 'Estoy bien, gracias a Dios. ¿Y tú?',
      literalMeaning: 'Sin mal, alabado sea Dios. ¿Y tú?',
      regionalNote:
        'Respuesta universal en toda Argelia. Se usa «W nta?» para hombre y «W nti?» para mujer.',
      breakdown: ['Bien / sin mal', 'gracias a Dios', '¿Y tú? (masc.)'],
    },
    'sal-3': {
      meaning: 'Buenos días — Buenos días luminosos (respuesta)',
      literalMeaning: 'Mañana de bien — Mañana de luz',
      regionalNote:
        'Por la tarde y noche se cambia «Sba7» por «Msa»: «Msa el khir» (Buenas tardes/noches).',
      breakdown: ['Mañana', 'el bien', 'la luz'],
    },
    'sal-4': {
      meaning: 'Gracias, que Dios te dé salud',
      literalMeaning: 'Acertaste, que Él te dé salud',
      regionalNote:
        '«Sahit» (masc.) / «Sahiti» (fem.) es la forma más cálida y auténtica de dar las gracias en Argelia.',
      breakdown: ['Gracias / bien hecho', 'que te dé', 'la salud'],
    },
    'sal-5': {
      meaning: 'Disculpa hermano, ¿no pasa nada / perdón?',
      literalMeaning: 'Perdóname hermano mío, ¿sin problema?',
      regionalNote:
        'Es habitual llamar «khouya» (hermano) a un hombre y «khti» (hermana) a una mujer por cercanía y respeto.',
      breakdown: ['Disculpa / perdón', 'mi hermano', 'no pasa nada'],
    },
    'sal-6': {
      meaning: 'Adiós, cuídate',
      literalMeaning: 'Con paz, bajo la protección de Dios',
      regionalNote:
        'Para decir «hasta luego», se añade «Men ba3d inchallah» o «Thalla fi ro7ek» (cuídate).',
      breakdown: ['Adiós (con paz)', 'bajo protección', 'de Dios'],
    },
    'pres-1': {
      meaning: '¿Cómo te llamas? Me llamo Karim',
      regionalNote:
        'En algunas regiones también se oye «Wasmek?», contracción rápida de «Wach ismek?».',
      breakdown: ['Qué / cuál', 'tu nombre', 'Yo me llamo'],
    },
    'pres-2': {
      meaning: '¿De dónde eres? Soy de Argel / Argelia',
      regionalNote:
        '«Dzayer» designa tanto la ciudad de Argel como todo el país (Argelia).',
      breakdown: ['De dónde', 'tú (masc.)', 'Soy de Argel / Argelia'],
    },
    'pres-3': {
      meaning: '¡Encantado/a de conocerte!',
      regionalNote:
        '«Bezzaf» significa «mucho / muy». Es una de las palabras más usadas en dariya argelina.',
      breakdown: ['Honrados / encantados', 'mucho'],
    },
    'pres-4': {
      meaning: 'Esta es nuestra casa, bienvenidos',
      regionalNote:
        '«Mar7ba bik» (a una persona) o «Mar7ba bikoum» (a varias) expresa la hospitalidad argelina.',
      breakdown: ['Esta es', 'nuestra casa', 'bienvenidos'],
    },
    'pres-5': {
      meaning: 'Mamá y papá están en casa',
      regionalNote: '«Yemma» (mamá) es cariñoso y muy típico del Magreb.',
      breakdown: ['Mamá', 'y papá', 'están en casa'],
    },
    'pres-6': {
      meaning: 'Tengo dos hermanos y una hermana pequeña',
      regionalNote: '«3andi» significa «tengo», y «zouj» significa «dos».',
      breakdown: ['Tengo', 'dos hermanos', 'y mi hermana pequeña'],
    },
    'cafe-1': {
      meaning: 'Dame un café cortado (mitad y mitad), por favor',
      regionalNote:
        '«Ta3ich» (lit. «que vivas») es el equivalente cálido y diario de «por favor».',
      breakdown: ['Dame', 'café mitad y mitad', 'por favor'],
    },
    'cafe-2': {
      meaning: 'Quisiera un vaso de té a la menta',
      regionalNote: '«Bghit» (quiero/quisiera) viene de «bgha». También se usa «N7ab».',
      breakdown: ['Quisiera', 'un vaso de té', 'con menta'],
    },
    'cafe-3': {
      meaning: '¡Esta comida está buenísima!',
      regionalNote: '«Bnin» (masc.) / «Bnina» (fem.) significa «sabroso, delicioso».',
      breakdown: ['Esta comida', 'deliciosa', 'muy / mucho'],
    },
    'cafe-4': {
      meaning: '¡Buen provecho! — Gracias',
      regionalNote: 'Se dice «Bsa7tek» tras una comida, un café o una compra nueva.',
      breakdown: ['A tu salud / disfruta', 'Que Dios te proteja'],
    },
    'cafe-5': {
      meaning: 'Tráeme agua fría, por favor',
      regionalNote: '«Men fadlek» es la forma cortés estándar de decir «por favor».',
      breakdown: ['Tráeme', 'agua fría', 'por favor'],
    },
    'cafe-6': {
      meaning: '¿Cuánto es la cuenta, hermano?',
      regionalNote: '«El 7sab» es «la cuenta». También se dice «Ch7al khallas?».',
      breakdown: ['Cuánto', 'la cuenta', 'mi hermano'],
    },
    'mar-1': {
      meaning: '¿Cuánto cuesta esto? — Es un poco caro',
      regionalNote: '«Chwiya» significa «un poco». Muy útil para negociar con amabilidad.',
      breakdown: ['A cuánto', 'esto', 'un poco caro (fem.)'],
    },
    'mar-2': {
      meaning: '¡Bájame un poco el precio, soy cliente habitual!',
      regionalNote: 'En el mercado, una sonrisa con «Naqasli chwiya» abre siempre el trato.',
      breakdown: ['Rebájame', 'un poco', 'soy cliente'],
    },
    'mar-3': {
      meaning: '¿Dónde está el mercado, por favor?',
      regionalNote: '«Win» (dónde) + «ja» (queda/está) es la estructura clave para ubicar lugares.',
      breakdown: ['Dónde', 'queda / está', 'el mercado'],
    },
    'mar-4': {
      meaning: 'Ve todo recto y luego gira a la derecha',
      regionalNote: '«Limin» = derecha, «Lisar» = izquierda, «Qbala» = todo recto.',
      breakdown: ['Ve recto', 'después', 'gira a la derecha'],
    },
    'mar-5': {
      meaning: '¿Está cerca de aquí o muy lejos?',
      regionalNote: '«Hna» = aquí, «Lhih» = allí, «Qrib» = cerca, «B3id» = lejos.',
      breakdown: ['Aquí cerca', 'o bien', 'muy lejos'],
    },
    'mar-6': {
      meaning: 'Déjame aquí, por favor (taxi / autobús)',
      regionalNote: 'La frase mágica en taxis o autobuses argelinos para pedir parar.',
      breakdown: ['Bájame', 'aquí', 'por favor'],
    },
    'quot-1': {
      meaning: 'Hay / No hay',
      regionalNote:
        'La negación suele rodear la palabra con «ma ... che»: kan (hay) → ma kanche (no hay).',
      breakdown: ['Hay / disponible', 'No hay'],
    },
    'quot-2': {
      meaning: 'No pasa nada, todo se arreglará',
      regionalNote: '«Ma3lich» transmite calma, tolerancia o «no te preocupes».',
      breakdown: ['No pasa nada', 'todo', 'Dios lo arreglará'],
    },
    'quot-3': {
      meaning: '¿Qué hay de nuevo hoy?',
      regionalNote: 'Expresión muy natural entre amigos o colegas por la mañana.',
      breakdown: ['Qué hay', 'nuevo', 'hoy'],
    },
    'quot-4': {
      meaning: 'Ya voy ahora mismo, espera un poco',
      regionalNote: '«Doka» (o «Dork» en el Este/Centro) significa «ahora mismo».',
      breakdown: ['Ahora', 'estoy llegando', 'espera un poco'],
    },
    'quot-5': {
      meaning: 'De verdad es cierto, tienes toda la razón',
      regionalNote: '«3andek el 7a9» (tienes razón) se usa muchísimo en charlas cotidianas.',
      breakdown: ['De verdad', 'cierto', 'tienes razón'],
    },
    'quot-6': {
      meaning: 'Si Dios quiere, nos vemos mañana',
      regionalNote: '«Ghodwa» = mañana, «El bare7» = ayer, «El youm» = hoy.',
      breakdown: ['Si Dios quiere', 'mañana', 'nos encontramos'],
    },
    'verb-1': {
      meaning: 'No entendí, habla despacio por favor',
      regionalNote:
        '¡La frase más valiosa al aprender! «Fhamt» (entendí) → «Ma fhamtche» (no entendí).',
      breakdown: ['No entendí', 'habla (imperativo)', 'despacio'],
    },
    'verb-2': {
      meaning: 'Estoy aprendiendo a hablar dariya',
      regionalNote: '¡Decir esto casi siempre despierta sonrisas y ánimo en Argelia!',
      breakdown: ['Estoy aprendiendo', 'a hablar', 'la dariya'],
    },
    'verb-3': {
      meaning: '¿Qué es esto en dariya?',
      regionalNote: 'También puedes decir «Kifech tgoulou l’hada?» (¿Cómo llamáis a esto?).',
      breakdown: ['Qué es', 'esto', 'en dariya'],
    },
    'verb-4': {
      meaning: 'Voy al trabajo',
      regionalNote: 'Para mujer se concuerda el participio: «Rani ray7a» en lugar de «raye7».',
      breakdown: ['Estoy yendo', 'al trabajo'],
    },
    'verb-5': {
      meaning: 'Sé un poco, pero aún me falta',
      regionalNote: '«Bessa7» significa «pero», y «Mazal» significa «todavía».',
      breakdown: ['Sé', 'un poco', 'pero todavía'],
    },
    'verb-6': {
      meaning: 'Repíteme esta palabra, por favor',
      regionalNote: '«3awed» viene de repetir/rehacer. Muy útil para memorizar la pronunciación.',
      breakdown: ['Repíteme', 'esta palabra', 'por favor'],
    },
    'bs7-1': {
      meaning: 'Compro el pan, compré la leche',
      literalMeaning: 'Verbo comprar: nechri (presente), chrit (pasado), chra (compró)',
      regionalNote: 'Regla clave de Ben Sedira: los verbos defectivos en -a toman -i en presente y -it en pasado.',
      breakdown: ['Compro (1.ª pres.)', 'el pan', 'compré la leche'],
    },
    'bs7-2': {
      meaning: 'Ayúdame con este asunto, amigo mío',
      regionalNote: 'Del verbo nâouen / âouent / âouen (ayudar). El plural de s’ah’eb es s’h’ab.',
      breakdown: ['Ayúdame', 'en este asunto', 'mi amigo'],
    },
    'bs7-3': {
      meaning: 'Ve en paz — Quédate con bien (adiós)',
      regionalNote: 'Despedida recíproca clásica recogida por Ben Sedira.',
      breakdown: ['Ve con paz', 'quédate con bien'],
    },
    'bs7-4': {
      meaning: '¿Por qué viniste temprano? Para aprender',
      regionalNote: 'Contracciones argelinas: «âlach» (por qué) y «bach» (para que).',
      breakdown: ['Por qué', 'viniste temprano', 'para aprender'],
    },
    'bs7-5': {
      meaning: '¿Cuántos años tienes? Tengo veinte años',
      regionalNote: 'De 11 a 99, el sustantivo «sna» (año) permanece en singular.',
      breakdown: ['Cuánto', 'en tu edad', 'tengo veinte años'],
    },
    'bs7-6': {
      meaning: 'De enero a la primavera, hace buen tiempo',
      regionalNote: 'Meses solares argelinos: iennar (enero), fourar (febrero), mar’res (marzo), jenber (diciembre).',
      breakdown: ['Desde enero', 'hasta la primavera', 'el tiempo es bueno'],
    },
  },
  de: {
    'sal-1': {
      meaning: 'Hallo, wie geht es dir?',
      literalMeaning: 'Friede sei mit euch, was gibt es Neues?',
      regionalNote:
        'In Algier sagt man „Wach rak?“ (m.) / „Wach raki?“ (w.). In Oran hört man oft „Ki rak?“.',
      breakdown: ['Hallo (Gruß)', 'was / wie', 'bist du (m.)'],
    },
    'sal-2': {
      meaning: 'Mir geht es gut, Gott sei Dank. Und dir?',
      literalMeaning: 'Kein Übel, Lob sei Gott. Und du?',
      regionalNote:
        'Universelle Antwort in ganz Algerien. „W nta?“ für Männer, „W nti?“ für Frauen.',
      breakdown: ['Gut / kein Übel', 'Gott sei Dank', 'Und du? (m.)'],
    },
    'sal-3': {
      meaning: 'Guten Morgen — Strahlender Morgen (Antwort)',
      literalMeaning: 'Morgen des Guten — Morgen des Lichts',
      regionalNote:
        'Nachmittags und abends ersetzt man „Sba7“ durch „Msa“: „Msa el khir“ (Guten Abend).',
      breakdown: ['Morgen', 'das Gute', 'das Licht'],
    },
    'sal-4': {
      meaning: 'Danke, Gott schenke dir Gesundheit',
      literalMeaning: 'Gut gemacht, möge Er dir Gesundheit geben',
      regionalNote:
        '„Sahit“ (m.) / „Sahiti“ (w.) ist die herzlichste Art, in Algerien Danke zu sagen.',
      breakdown: ['Danke / bravo', 'möge Er dir geben', 'Gesundheit'],
    },
    'sal-5': {
      meaning: 'Entschuldige Bruder, ist es in Ordnung?',
      literalMeaning: 'Verzeih mir mein Bruder, kein Problem?',
      regionalNote:
        'Aus Freundlichkeit nennt man Männer „khouya“ (mein Bruder) und Frauen „khti“ (meine Schwester).',
      breakdown: ['Entschuldige', 'mein Bruder', 'kein Problem'],
    },
    'sal-6': {
      meaning: 'Auf Wiedersehen, pass auf dich auf',
      literalMeaning: 'Mit Frieden, in Gottes Schutz',
      regionalNote:
        'Für „bis später“ sagt man oft „Men ba3d inchallah“ oder „Thalla fi ro7ek“.',
      breakdown: ['Auf Wiedersehen', 'im Schutz', 'Gottes'],
    },
    'pres-1': {
      meaning: 'Wie heißt du? Ich heiße Karim',
      regionalNote: 'In manchen Regionen hört man auch „Wasmek?“ als Kurzform von „Wach ismek?“.',
      breakdown: ['Was / wie', 'dein Name', 'Ich heiße'],
    },
    'pres-2': {
      meaning: 'Woher kommst du? Ich komme aus Algier / Algerien',
      regionalNote: '„Dzayer“ bezeichnet sowohl die Stadt Algier als auch das ganze Land Algerien.',
      breakdown: ['Woher', 'du (m.)', 'Ich bin aus Algier / Algerien'],
    },
    'pres-3': {
      meaning: 'Sehr erfreut, dich kennenzulernen!',
      regionalNote: '„Bezzaf“ bedeutet „viel / sehr“ und ist eines der häufigsten Darija-Wörter.',
      breakdown: ['Geehrt / erfreut', 'sehr'],
    },
    'pres-4': {
      meaning: 'Das ist unser Haus, herzlich willkommen',
      regionalNote: '„Mar7ba bik“ (einzeln) oder „Mar7ba bikoum“ (mehrere) drückt Gastfreundschaft aus.',
      breakdown: ['Dies ist', 'unser Haus', 'willkommen euch'],
    },
    'pres-5': {
      meaning: 'Mama und Papa sind zu Hause',
      regionalNote: '„Yemma“ (Mama) ist liebevoll und typisch algerisch/maghrebinisch.',
      breakdown: ['Mama', 'und Papa', 'sind zu Hause'],
    },
    'pres-6': {
      meaning: 'Ich habe zwei Brüder und eine kleine Schwester',
      regionalNote: '„3andi“ heißt „ich habe“, und „zouj“ bedeutet „zwei“.',
      breakdown: ['Ich habe', 'zwei Brüder', 'und meine kleine Schwester'],
    },
    'cafe-1': {
      meaning: 'Gib mir bitte einen Milchkaffee (halb Kaffee, halb Milch)',
      regionalNote: '„Ta3ich“ (wörtl. „mögest du leben“) ist das herzliche Alltagswort für „bitte“.',
      breakdown: ['Gib mir', 'Halb-und-Halb-Kaffee', 'bitte'],
    },
    'cafe-2': {
      meaning: 'Ich hätte gern ein Glas Minztee',
      regionalNote: '„Bghit“ (ich möchte) kommt von „bgha“. Man hört auch „N7ab“.',
      breakdown: ['Ich möchte', 'ein Glas Tee', 'mit Minze'],
    },
    'cafe-3': {
      meaning: 'Dieses Essen ist wirklich köstlich!',
      regionalNote: '„Bnin“ (m.) / „Bnina“ (w.) bedeutet „lecker, köstlich“.',
      breakdown: ['Dieses Essen', 'köstlich', 'sehr'],
    },
    'cafe-4': {
      meaning: 'Guten Appetit / Wohl bekomms! — Danke',
      regionalNote: '„Bsa7tek“ sagt man nach dem Essen, Kaffee, Haarschnitt oder einem neuen Kauf.',
      breakdown: ['Auf deine Gesundheit', 'Gott schütze dich'],
    },
    'cafe-5': {
      meaning: 'Bring mir bitte kaltes Wasser',
      regionalNote: '„Men fadlek“ ist die höfliche Standardform für „bitte“.',
      breakdown: ['Bring mir', 'kaltes Wasser', 'bitte'],
    },
    'cafe-6': {
      meaning: 'Wie viel macht die Rechnung, Bruder?',
      regionalNote: '„El 7sab“ heißt „die Rechnung“. Auch üblich: „Ch7al khallas?“.',
      breakdown: ['Wie viel', 'die Rechnung', 'mein Bruder'],
    },
    'mar-1': {
      meaning: 'Wie viel kostet das? — Es ist etwas teuer',
      regionalNote: '„Chwiya“ heißt „ein bisschen“ — perfekt zum freundlichen Verhandeln.',
      breakdown: ['Wie viel', 'dies', 'etwas teuer (w.)'],
    },
    'mar-2': {
      meaning: 'Mach mir einen besseren Preis, ich bin Stammkunde!',
      regionalNote: 'Auf dem Markt öffnet ein Lächeln mit „Naqasli chwiya“ jedes Gespräch.',
      breakdown: ['Senke mir', 'ein bisschen', 'ich bin Kunde'],
    },
    'mar-3': {
      meaning: 'Wo ist bitte der Markt?',
      regionalNote: '„Win“ (wo) + „ja“ (liegt) ist die Standardfrage nach dem Ort.',
      breakdown: ['Wo', 'liegt', 'der Markt'],
    },
    'mar-4': {
      meaning: 'Geh geradeaus, dann biege rechts ab',
      regionalNote: '„Limin“ = rechts, „Lisar“ = links, „Qbala“ = geradeaus.',
      breakdown: ['Geh geradeaus', 'danach', 'bieg rechts ab'],
    },
    'mar-5': {
      meaning: 'Ist es hier in der Nähe oder sehr weit?',
      regionalNote: '„Hna“ = hier, „Lhih“ = dort, „Qrib“ = nah, „B3id“ = weit.',
      breakdown: ['Hier nah', 'oder', 'sehr weit'],
    },
    'mar-6': {
      meaning: 'Lass mich bitte hier aussteigen (Taxi / Bus)',
      regionalNote: 'Der Zaubersatz im algerischen Taxi oder Bus zum sofortigen Anhalten.',
      breakdown: ['Lass mich raus', 'hier', 'bitte'],
    },
    'quot-1': {
      meaning: 'Es gibt / Es gibt nicht',
      regionalNote: 'Verneinung umrahmt das Wort mit „ma ... che“: kan → ma kanche.',
      breakdown: ['Es gibt / verfügbar', 'Es gibt nicht'],
    },
    'quot-2': {
      meaning: 'Kein Problem, alles wird gut',
      regionalNote: '„Ma3lich“ drückt Gelassenheit, Toleranz oder „macht nichts“ aus.',
      breakdown: ['Macht nichts', 'alles', 'Gott richtet es'],
    },
    'quot-3': {
      meaning: 'Was gibt es heute Neues?',
      regionalNote: 'Sehr natürlicher Gruß morgens unter Freunden oder Kollegen.',
      breakdown: ['Was gibt es', 'Neues', 'heute'],
    },
    'quot-4': {
      meaning: 'Ich komme sofort, hab kurz Geduld',
      regionalNote: '„Doka“ (oder „Dork“ im Osten/Zentrum) bedeutet „jetzt / sofort“.',
      breakdown: ['Jetzt', 'ich bin unterwegs', 'gedulde dich kurz'],
    },
    'quot-5': {
      meaning: 'Wirklich wahr, du hast völlig recht',
      regionalNote: '„3andek el 7a9“ (du hast recht) fällt ständig in Gesprächen.',
      breakdown: ['Wirklich', 'wahr', 'du hast recht'],
    },
    'quot-6': {
      meaning: 'So Gott will, treffen wir uns morgen',
      regionalNote: '„Ghodwa“ = morgen, „El bare7“ = gestern, „El youm“ = heute.',
      breakdown: ['So Gott will', 'morgen', 'treffen wir uns'],
    },
    'verb-1': {
      meaning: 'Ich habe nicht verstanden, sprich bitte langsam',
      regionalNote: 'Der wertvollste Lernsatz! „Fhamt“ (verstanden) → „Ma fhamtche“ (nicht verstanden).',
      breakdown: ['Nicht verstanden', 'sprich (Imperativ)', 'langsam'],
    },
    'verb-2': {
      meaning: 'Ich lerne gerade Darija zu sprechen',
      regionalNote: 'Dieser Satz sorgt in Algerien fast immer für ein Lächeln und Ermutigung!',
      breakdown: ['Ich lerne', 'zu sprechen', 'Darija'],
    },
    'verb-3': {
      meaning: 'Was ist das auf Darija?',
      regionalNote: 'Man kann auch sagen: „Kifech tgoulou l’hada?“ (Wie nennt ihr das?).',
      breakdown: ['Was ist', 'das', 'auf Darija'],
    },
    'verb-4': {
      meaning: 'Ich gehe zur Arbeit',
      regionalNote: 'Für Frauen heißt es angepasst: „Rani ray7a“ statt „raye7“.',
      breakdown: ['Ich gehe gerade', 'zur Arbeit'],
    },
    'verb-5': {
      meaning: 'Ich weiß ein wenig, aber noch nicht alles',
      regionalNote: '„Bessa7“ bedeutet „aber“, „Mazal“ bedeutet „noch / noch nicht“.',
      breakdown: ['Ich weiß', 'ein wenig', 'aber noch'],
    },
    'verb-6': {
      meaning: 'Wiederhole mir dieses Wort bitte',
      regionalNote: '„3awed“ kommt von wiederholen — sehr hilfreich beim Einprägen.',
      breakdown: ['Wiederhole mir', 'dieses Wort', 'bitte'],
    },
    'bs7-1': {
      meaning: 'Ich kaufe das Brot, ich habe die Milch gekauft',
      literalMeaning: 'Verb kaufen: nechri (Präsens), chrit (Präteritum), chra (er kaufte)',
      regionalNote: 'Ben-Sedira-Regel: Verben auf -a erhalten -i im Präsens und -it im Präteritum.',
      breakdown: ['Ich kaufe (1. Präs.)', 'das Brot', 'ich kaufte die Milch'],
    },
    'bs7-2': {
      meaning: 'Hilf mir bei dieser Sache, mein Freund',
      regionalNote: 'Vom Verb nâouen / âouent / âouen (helfen).',
      breakdown: ['Hilf mir', 'bei dieser Sache', 'mein Freund'],
    },
    'bs7-3': {
      meaning: 'Geh in Frieden — Bleib wohlauf (Abschied)',
      regionalNote: 'Traditioneller wechselseitiger Abschied nach Ben Sedira.',
      breakdown: ['Geh in Frieden', 'bleib im Guten'],
    },
    'bs7-4': {
      meaning: 'Warum bist du früh gekommen? Um zu lernen',
      regionalNote: 'Typische Verschmelzungen: „âlach“ (warum) und „bach“ (damit / um zu).',
      breakdown: ['Warum', 'kamst du früh', 'um zu lernen'],
    },
    'bs7-5': {
      meaning: 'Wie alt bist du? Ich bin zwanzig Jahre alt',
      regionalNote: 'Nach Zahlen von 11 bis 99 bleibt „sna“ (Jahr) im Singular.',
      breakdown: ['Wie viel', 'in deinem Alter', 'ich bin zwanzig Jahre'],
    },
    'bs7-6': {
      meaning: 'Von Januar bis Frühling ist das Wetter schön',
      regionalNote: 'Algerische Sonnenmonate: iennar (Jan.), fourar (Feb.), mar’res (März), jenber (Dez.).',
      breakdown: ['Von Januar', 'bis Frühling', 'das Wetter ist gut'],
    },
  },
  it: {
    'sal-1': {
      meaning: 'Ciao, come stai?',
      literalMeaning: 'La pace su di voi, che c’è di nuovo?',
      regionalNote:
        'Ad Algeri si dice «Wach rak?» (uomo) / «Wach raki?» (donna). A Orano si sente spesso «Ki rak?».',
      breakdown: ['Ciao (saluto)', 'che / come', 'stai (masc.)'],
    },
    'sal-2': {
      meaning: 'Tutto bene, grazie a Dio. E tu?',
      literalMeaning: 'Nessun male, lode a Dio. E tu?',
      regionalNote:
        'Risposta universale in tutta l’Algeria. Si usa «W nta?» per uomo e «W nti?» per donna.',
      breakdown: ['Bene / nessun male', 'grazie a Dio', 'E tu? (masc.)'],
    },
    'sal-3': {
      meaning: 'Buongiorno (mattina) — Mattina luminosa (risposta)',
      literalMeaning: 'Mattina di bontà — Mattina di luce',
      regionalNote:
        'Pomeriggio e sera si sostituisce «Sba7» con «Msa»: «Msa el khir» (Buonasera).',
      breakdown: ['Mattina', 'il bene', 'la luce'],
    },
    'sal-4': {
      meaning: 'Grazie, che Dio ti dia salute',
      literalMeaning: 'Hai fatto bene, che Egli ti dia salute',
      regionalNote:
        '«Sahit» (masc.) / «Sahiti» (fem.) è il modo più caloroso e autentico di ringraziare.',
      breakdown: ['Grazie / bravo', 'che ti dia', 'la salute'],
    },
    'sal-5': {
      meaning: 'Scusami fratello, non fa niente / permesso?',
      literalMeaning: 'Perdonami fratello mio, nessun problema?',
      regionalNote:
        'Si chiama comunemente un uomo «khouya» (mio fratello) e una donna «khti» (mia sorella).',
      breakdown: ['Scusami', 'mio fratello', 'non importa'],
    },
    'sal-6': {
      meaning: 'Arrivederci, stammi bene',
      literalMeaning: 'Con la pace, sotto la protezione di Dio',
      regionalNote:
        'Per dire «a presto» si aggiunge «Men ba3d inchallah» o «Thalla fi ro7ek» (abbi cura di te).',
      breakdown: ['Arrivederci', 'nella protezione', 'di Dio'],
    },
    'pres-1': {
      meaning: 'Come ti chiami? Mi chiamo Karim',
      regionalNote: 'In alcune zone si sente anche «Wasmek?», contrazione rapida di «Wach ismek?».',
      breakdown: ['Quale / che', 'tuo nome', 'Io mi chiamo'],
    },
    'pres-2': {
      meaning: 'Di dove sei? Sono di Algeri / dell’Algeria',
      regionalNote: '«Dzayer» indica sia la città di Algeri sia l’intero paese (Algeria).',
      breakdown: ['Da dove', 'tu (masc.)', 'Sono di Algeri / Algeria'],
    },
    'pres-3': {
      meaning: 'Molto piacere di conoscerti!',
      regionalNote: '«Bezzaf» significa «molto / tanto». È tra le parole più usate in darija.',
      breakdown: ['Onorati / lieti', 'molto'],
    },
    'pres-4': {
      meaning: 'Questa è casa nostra, benvenuti',
      regionalNote: '«Mar7ba bik» (sing.) o «Mar7ba bikoum» (plur.) esprime l’ospitalità algerina.',
      breakdown: ['Questa è', 'casa nostra', 'benvenuti a voi'],
    },
    'pres-5': {
      meaning: 'Mamma e papà sono a casa',
      regionalNote: '«Yemma» (mamma) è affettuoso e tipico del Maghreb.',
      breakdown: ['Mamma', 'e papà', 'sono a casa'],
    },
    'pres-6': {
      meaning: 'Ho due fratelli e una sorella piccola',
      regionalNote: '«3andi» significa «ho», e «zouj» significa «due».',
      breakdown: ['Ho', 'due fratelli', 'e mia sorella piccola'],
    },
    'cafe-1': {
      meaning: 'Dammi un caffè macchiato (metà e metà), per favore',
      regionalNote: '«Ta3ich» (lett. «che tu viva») è l’equivalente caloroso di «per favore».',
      breakdown: ['Dammi', 'caffè metà e metà', 'per favore'],
    },
    'cafe-2': {
      meaning: 'Vorrei un bicchiere di tè alla menta',
      regionalNote: '«Bghit» (voglio / vorrei) viene da «bgha». Si usa anche «N7ab».',
      breakdown: ['Vorrei', 'un bicchiere di tè', 'alla menta'],
    },
    'cafe-3': {
      meaning: 'Questo piatto è davvero delizioso!',
      regionalNote: '«Bnin» (masc.) / «Bnina» (fem.) vuol dire «gustoso, delizioso».',
      breakdown: ['Questo cibo', 'delizioso', 'molto'],
    },
    'cafe-4': {
      meaning: 'Buon appetito / Alla salute! — Grazie',
      regionalNote: 'Si dice «Bsa7tek» dopo un pasto, un caffè o un nuovo acquisto.',
      breakdown: ['Alla tua salute / goditi', 'Che Dio ti protegga'],
    },
    'cafe-5': {
      meaning: 'Portami dell’acqua fresca, per favore',
      regionalNote: '«Men fadlek» è la forma cortese standard per «per favore».',
      breakdown: ['Portami', 'acqua fresca', 'per favore'],
    },
    'cafe-6': {
      meaning: 'Quant’è il conto, fratello?',
      regionalNote: '«El 7sab» significa «il conto». Si dice anche «Ch7al khallas?».',
      breakdown: ['Quanto', 'il conto', 'mio fratello'],
    },
    'mar-1': {
      meaning: 'Quanto costa questo? — È un po’ caro',
      regionalNote: '«Chwiya» vuol dire «un po’», ideale per trattare con il sorriso.',
      breakdown: ['A quanto', 'questo', 'un po’ caro (fem.)'],
    },
    'mar-2': {
      meaning: 'Abbassami un po’ il prezzo, sono un cliente abituale!',
      regionalNote: 'Al mercato un sorriso con «Naqasli chwiya» apre sempre la trattativa.',
      breakdown: ['Abbassami', 'un po’', 'sono cliente'],
    },
    'mar-3': {
      meaning: 'Dov’è il mercato, per favore?',
      regionalNote: '«Win» (dove) + «ja» (si trova) è la formula esatta per localizzare un luogo.',
      breakdown: ['Dove', 'si trova', 'il mercato'],
    },
    'mar-4': {
      meaning: 'Vai sempre dritto, poi gira a destra',
      regionalNote: '«Limin» = destra, «Lisar» = sinistra, «Qbala» = dritto.',
      breakdown: ['Vai dritto', 'poi', 'gira a destra'],
    },
    'mar-5': {
      meaning: 'È qui vicino o molto lontano?',
      regionalNote: '«Hna» = qui, «Lhih» = là, «Qrib» = vicino, «B3id» = lontano.',
      breakdown: ['Qui vicino', 'oppure', 'molto lontano'],
    },
    'mar-6': {
      meaning: 'Fammi scendere qui per favore (taxi / bus)',
      regionalNote: 'Frase indispensabile su taxi o autobus in Algeria per chiedere la fermata.',
      breakdown: ['Fammi scendere', 'qui', 'per favore'],
    },
    'quot-1': {
      meaning: 'C’è / Non c’è',
      regionalNote: 'La negazione avvolge la parola con «ma ... che»: kan → ma kanche.',
      breakdown: ['C’è / disponibile', 'Non c’è'],
    },
    'quot-2': {
      meaning: 'Non fa niente, tutto si sistemerà',
      regionalNote: '«Ma3lich» esprime calma, pazienza o «nessun problema».',
      breakdown: ['Non importa', 'tutto', 'Dio provvederà'],
    },
    'quot-3': {
      meaning: 'Che c’è di nuovo oggi?',
      regionalNote: 'Espressione molto naturale tra amici o colleghi al mattino.',
      breakdown: ['Cosa c’è', 'di nuovo', 'oggi'],
    },
    'quot-4': {
      meaning: 'Arrivo subito, pazienta un attimo',
      regionalNote: '«Doka» (o «Dork») significa «adesso / subito».',
      breakdown: ['Adesso', 'sto arrivando', 'aspetta un po’'],
    },
    'quot-5': {
      meaning: 'Davvero è vero, hai proprio ragione',
      regionalNote: '«3andek el 7a9» (hai ragione) ricorre spesso nelle chiacchierate.',
      breakdown: ['Davvero', 'vero', 'hai ragione'],
    },
    'quot-6': {
      meaning: 'Se Dio vuole, ci vediamo domani',
      regionalNote: '«Ghodwa» = domani, «El bare7» = ieri, «El youm» = oggi.',
      breakdown: ['Se Dio vuole', 'domani', 'ci incontriamo'],
    },
    'verb-1': {
      meaning: 'Non ho capito, parla lentamente per favore',
      regionalNote: 'La frase più preziosa mentre impari! «Fhamt» → «Ma fhamtche».',
      breakdown: ['Non ho capito', 'parla (imperativo)', 'lentamente'],
    },
    'verb-2': {
      meaning: 'Sto imparando a parlare la darija',
      regionalNote: 'Dirlo suscita quasi sempre un grande sorriso e incoraggiamento in Algeria!',
      breakdown: ['Sto imparando', 'a parlare', 'la darija'],
    },
    'verb-3': {
      meaning: 'Cos’è questo in darija?',
      regionalNote: 'Puoi anche chiedere «Kifech tgoulou l’hada?» (Come chiamate questo?).',
      breakdown: ['Cos’è', 'questo', 'in darija'],
    },
    'verb-4': {
      meaning: 'Sto andando al lavoro',
      regionalNote: 'Per una donna si accorda il participio: «Rani ray7a» invece di «raye7».',
      breakdown: ['Sto andando', 'al lavoro'],
    },
    'verb-5': {
      meaning: 'Ne so un po’, ma devo ancora imparare',
      regionalNote: '«Bessa7» significa «ma / però», e «Mazal» significa «ancora».',
      breakdown: ['So', 'un po’', 'ma ancora'],
    },
    'verb-6': {
      meaning: 'Ripetimi questa parola per favore',
      regionalNote: '«3awed» viene dal verbo ripetere — utilissimo per memorizzare i suoni.',
      breakdown: ['Ripetimi', 'questa parola', 'per favore'],
    },
    'bs7-1': {
      meaning: 'Compro il pane, ho comprato il latte',
      literalMeaning: 'Verbo comprare: nechri (presente), chrit (passato), chra (ha comprato)',
      regionalNote: 'Regola di Ben Sedira: i verbi in -a prendono -i al presente e -it al passato.',
      breakdown: ['Compro (1ª pres.)', 'il pane', 'ho comprato il latte'],
    },
    'bs7-2': {
      meaning: 'Aiutami in questa faccenda, amico mio',
      regionalNote: 'Dal verbo nâouen / âouent / âouen (aiutare).',
      breakdown: ['Aiutami', 'in questa cosa', 'mio amico'],
    },
    'bs7-3': {
      meaning: 'Vai in pace — Resta nel bene (arrivederci)',
      regionalNote: 'Saluto reciproco tradizionale documentato da Ben Sedira.',
      breakdown: ['Vai con pace', 'resta nel bene'],
    },
    'bs7-4': {
      meaning: 'Perché sei venuto presto? Per imparare',
      regionalNote: 'Contrazioni algerine: «âlach» (perché) e «bach» (per / affinché).',
      breakdown: ['Perché', 'sei venuto presto', 'per imparare'],
    },
    'bs7-5': {
      meaning: 'Quanti anni hai? Ho vent’anni',
      regionalNote: 'Da 11 a 99 il sostantivo «sna» (anno) resta al singolare.',
      breakdown: ['Quanto', 'nella tua età', 'ho venti anni'],
    },
    'bs7-6': {
      meaning: 'Da gennaio alla primavera, il tempo è bello',
      regionalNote: 'Mesi solari algerini: iennar (gennaio), fourar (febbraio), mar’res (marzo), jenber (dicembre).',
      breakdown: ['Da gennaio', 'alla primavera', 'il tempo è bello'],
    },
  },
  nl: {
    'sal-1': {
      meaning: 'Hallo, hoe gaat het met je?',
      literalMeaning: 'Vrede zij met u, wat is er nieuw?',
      regionalNote:
        'In Algiers zegt men "Wach rak?" (man) / "Wach raki?" (vrouw). In Oran hoor je vaak "Ki rak?".',
      breakdown: ['Hallo (groet)', 'wat / hoe', 'ben je (m.)'],
    },
    'sal-2': {
      meaning: 'Het gaat goed, godzijdank. En met jou?',
      literalMeaning: 'Geen kwaad, lof zij God. En jij?',
      regionalNote:
        'Universeel antwoord in heel Algerije. "W nta?" tegen een man, "W nti?" tegen een vrouw.',
      breakdown: ['Goed / geen kwaad', 'godzijdank', 'En jij? (m.)'],
    },
    'sal-3': {
      meaning: 'Goedemorgen — Stralende morgen (antwoord)',
      literalMeaning: 'Morgen van goedheid — Morgen van licht',
      regionalNote:
        'In de middag en avond vervang je "Sba7" door "Msa": "Msa el khir" (Goedenavond).',
      breakdown: ['Morgen', 'het goede', 'het licht'],
    },
    'sal-4': {
      meaning: 'Bedankt, moge God je gezondheid geven',
      literalMeaning: 'Goed gedaan, moge Hij je gezondheid schenken',
      regionalNote:
        '"Sahit" (m.) / "Sahiti" (v.) is de warmste en meest authentieke manier om dankjewel te zeggen.',
      breakdown: ['Bedankt / bravo', 'moge Hij geven', 'de gezondheid'],
    },
    'sal-5': {
      meaning: 'Sorry broer, is het goed / pardon?',
      literalMeaning: 'Vergeef me mijn broer, geen probleem?',
      regionalNote:
        'Uit respect en warmte noemt men een man "khouya" (mijn broer) en een vrouw "khti" (mijn zus).',
      breakdown: ['Sorry / pardon', 'mijn broer', 'geen probleem'],
    },
    'sal-6': {
      meaning: 'Tot ziens, pas goed op jezelf',
      literalMeaning: 'Met vrede, onder Gods bescherming',
      regionalNote:
        'Voor "tot straks" voegt men vaak "Men ba3d inchallah" of "Thalla fi ro7ek" toe.',
      breakdown: ['Tot ziens', 'in bescherming', 'van God'],
    },
    'pres-1': {
      meaning: 'Hoe heet je? Ik heet Karim',
      regionalNote: 'In sommige regio’s hoor je ook "Wasmek?", de snelle samentrekking van "Wach ismek?".',
      breakdown: ['Wat', 'jouw naam', 'Ik heet'],
    },
    'pres-2': {
      meaning: 'Waar kom je vandaan? Ik kom uit Algiers / Algerije',
      regionalNote: '"Dzayer" verwijst zowel naar de stad Algiers als naar het hele land Algerije.',
      breakdown: ['Waarvandaan', 'jij (m.)', 'Ik kom uit Algiers / Algerije'],
    },
    'pres-3': {
      meaning: 'Aangenaam kennis te maken!',
      regionalNote: '"Bezzaf" betekent "veel / erg". Een van de meest gebruikte woorden in Darija.',
      breakdown: ['Vereerd / blij', 'heel erg'],
    },
    'pres-4': {
      meaning: 'Dit is ons huis, wees welkom',
      regionalNote: '"Mar7ba bik" (enkelvoud) of "Mar7ba bikoum" (meervoud) toont Algerijnse gastvrijheid.',
      breakdown: ['Dit is', 'ons huis', 'welkom aan jullie'],
    },
    'pres-5': {
      meaning: 'Mama en papa zijn thuis',
      regionalNote: '"Yemma" (mama) is typisch Algerijns/Maghrebijns, liefdevol en alledaags.',
      breakdown: ['Mama', 'en papa', 'zijn thuis'],
    },
    'pres-6': {
      meaning: 'Ik heb twee broers en een zusje',
      regionalNote: '"3andi" betekent "ik heb", en "zouj" betekent "twee".',
      breakdown: ['Ik heb', 'twee broers', 'en mijn zusje'],
    },
    'cafe-1': {
      meaning: 'Geef me een koffie verkeerd (half-om-half), alsjeblieft',
      regionalNote: '"Ta3ich" (lett. "moge je leven") is het warme alledaagse woord voor "alsjeblieft".',
      breakdown: ['Geef me', 'koffie half-half', 'alsjeblieft'],
    },
    'cafe-2': {
      meaning: 'Ik wil graag een glas muntthee',
      regionalNote: '"Bghit" (ik wil graag) komt van "bgha". Men zegt ook "N7ab".',
      breakdown: ['Ik wil graag', 'een glas thee', 'met munt'],
    },
    'cafe-3': {
      meaning: 'Dit eten is echt heerlijk!',
      regionalNote: '"Bnin" (m.) / "Bnina" (v.) betekent "lekker, smakelijk".',
      breakdown: ['Dit eten', 'heerlijk', 'heel erg'],
    },
    'cafe-4': {
      meaning: 'Eet smakelijk / Geniet ervan! — Dank je',
      regionalNote: '"Bsa7tek" zeg je na een maaltijd, koffie, knipbeurt of nieuwe aankoop.',
      breakdown: ['Op je gezondheid', 'God zegene je'],
    },
    'cafe-5': {
      meaning: 'Breng me koud water, alstublieft',
      regionalNote: '"Men fadlek" is de beleefde standaardvorm voor "alstublieft".',
      breakdown: ['Breng me', 'koud water', 'alstublieft'],
    },
    'cafe-6': {
      meaning: 'Hoeveel is de rekening, broer?',
      regionalNote: '"El 7sab" betekent "de rekening". Ook: "Ch7al khallas?".',
      breakdown: ['Hoeveel', 'de rekening', 'mijn broer'],
    },
    'mar-1': {
      meaning: 'Hoeveel kost dit? — Het is een beetje duur',
      regionalNote: '"Chwiya" betekent "een beetje". Onmisbaar om vriendelijk af te dingen.',
      breakdown: ['Hoeveel', 'dit', 'een beetje duur (v.)'],
    },
    'mar-2': {
      meaning: 'Maak de prijs iets lager, ik ben vaste klant!',
      regionalNote: 'Op de markt opent een glimlach met "Naqasli chwiya" altijd het gesprek.',
      breakdown: ['Verlaag voor mij', 'een beetje', 'ik ben klant'],
    },
    'mar-3': {
      meaning: 'Waar is de markt, alsjeblieft?',
      regionalNote: '"Win" (waar) + "ja" (ligt) is de vaste structuur om de weg te vragen.',
      breakdown: ['Waar', 'ligt', 'de markt'],
    },
    'mar-4': {
      meaning: 'Ga rechtdoor, sla daarna rechtsaf',
      regionalNote: '"Limin" = rechts, "Lisar" = links, "Qbala" = rechtdoor.',
      breakdown: ['Ga rechtdoor', 'daarna', 'sla rechtsaf'],
    },
    'mar-5': {
      meaning: 'Is het hier dichtbij, of heel ver?',
      regionalNote: '"Hna" = hier, "Lhih" = daar, "Qrib" = dichtbij, "B3id" = ver.',
      breakdown: ['Hier dichtbij', 'of', 'heel ver'],
    },
    'mar-6': {
      meaning: 'Zet me hier af alsjeblieft (taxi / bus)',
      regionalNote: 'De toverzin in Algerijnse taxi’s of bussen om meteen te stoppen.',
      breakdown: ['Laat me uitstappen', 'hier', 'alsjeblieft'],
    },
    'quot-1': {
      meaning: 'Er is / Er is geen',
      regionalNote: 'Ontkenning omsluit vaak het woord met "ma ... che": kan → ma kanche.',
      breakdown: ['Er is / beschikbaar', 'Er is geen'],
    },
    'quot-2': {
      meaning: 'Geen probleem, alles komt goed',
      regionalNote: '"Ma3lich" drukt kalmte, begrip of "maakt niet uit" uit.',
      breakdown: ['Maakt niet uit', 'alles', 'God regelt het'],
    },
    'quot-3': {
      meaning: 'Wat is er nieuw vandaag?',
      regionalNote: 'Heel natuurlijke begroeting onder vrienden of collega’s in de ochtend.',
      breakdown: ['Wat is er', 'nieuw', 'vandaag'],
    },
    'quot-4': {
      meaning: 'Ik kom er meteen aan, even geduld',
      regionalNote: '"Doka" (of "Dork" in het Oosten/Centrum) betekent "nu / meteen".',
      breakdown: ['Nu', 'ik kom eraan', 'even geduld'],
    },
    'quot-5': {
      meaning: 'Echt waar, je hebt helemaal gelijk',
      regionalNote: '"3andek el 7a9" (je hebt gelijk) hoor je voortdurend in gesprekken.',
      breakdown: ['Echt waar', 'waar', 'je hebt gelijk'],
    },
    'quot-6': {
      meaning: 'Als God het wil, zien we elkaar morgen',
      regionalNote: '"Ghodwa" = morgen, "El bare7" = gisteren, "El youm" = vandaag.',
      breakdown: ['Als God wil', 'morgen', 'ontmoeten we elkaar'],
    },
    'verb-1': {
      meaning: 'Ik heb het niet begrepen, spreek langzaam alsjeblieft',
      regionalNote: 'De belangrijkste zin bij het leren! "Fhamt" → "Ma fhamtche".',
      breakdown: ['Niet begrepen', 'spreek (gebiedend)', 'langzaam'],
    },
    'verb-2': {
      meaning: 'Ik ben Darija aan het leren spreken',
      regionalNote: 'Deze zin tovert in Algerije bijna altijd een glimlach en aanmoediging tevoorschijn!',
      breakdown: ['Ik leer', 'te spreken', 'het Darija'],
    },
    'verb-3': {
      meaning: 'Wat is dit in het Darija?',
      regionalNote: 'Je kunt ook vragen "Kifech tgoulou l’hada?" (Hoe noemen jullie dit?).',
      breakdown: ['Wat is', 'dit', 'in het Darija'],
    },
    'verb-4': {
      meaning: 'Ik ga naar mijn werk',
      regionalNote: 'Voor een vrouw past men het deelwoord aan: "Rani ray7a" in plaats van "raye7".',
      breakdown: ['Ik ben op weg', 'naar het werk'],
    },
    'verb-5': {
      meaning: 'Ik weet een beetje, maar nog steeds aan het leren',
      regionalNote: '"Bessa7" betekent "maar", en "Mazal" betekent "nog / nog niet".',
      breakdown: ['Ik weet', 'een beetje', 'maar nog'],
    },
    'verb-6': {
      meaning: 'Herhaal dit woord voor me, alstublieft',
      regionalNote: '"3awed" komt van herhalen — erg handig om de uitspraak vast te leggen.',
      breakdown: ['Herhaal voor me', 'dit woord', 'alstublieft'],
    },
    'bs7-1': {
      meaning: 'Ik koop brood, ik heb melk gekocht',
      literalMeaning: 'Werkwoord kopen: nechri (tegenw.), chrit (verleden), chra (hij kocht)',
      regionalNote: 'Ben Sedira-regel: werkwoorden op -a krijgen -i in het heden en -it in het verleden.',
      breakdown: ['Ik koop (1e teg.)', 'het brood', 'ik kocht de melk'],
    },
    'bs7-2': {
      meaning: 'Help me bij deze zaak, mijn vriend',
      regionalNote: 'Van het werkwoord nâouen / âouent / âouen (helpen).',
      breakdown: ['Help me', 'bij deze zaak', 'mijn vriend'],
    },
    'bs7-3': {
      meaning: 'Ga in vrede — Blijf in het goede (tot ziens)',
      regionalNote: 'Traditionele wederzijdse groet volgens Ben Sedira.',
      breakdown: ['Ga in vrede', 'blijf in goedheid'],
    },
    'bs7-4': {
      meaning: 'Waarom ben je vroeg gekomen? Om te leren',
      regionalNote: 'Algerijnse samentrekkingen: "âlach" (waarom) en "bach" (om te).',
      breakdown: ['Waarom', 'kwam je vroeg', 'om te leren'],
    },
    'bs7-5': {
      meaning: 'Hoe oud ben je? Ik ben twintig jaar',
      regionalNote: 'Van 11 t/m 99 blijft "sna" (jaar) in het enkelvoud.',
      breakdown: ['Hoeveel', 'in jouw leeftijd', 'ik ben twintig jaar'],
    },
    'bs7-6': {
      meaning: 'Van januari tot de lente is het mooi weer',
      regionalNote: 'Algerijnse zonnemaanden: iennar (jan.), fourar (feb.), mar’res (mrt.), jenber (dec.).',
      breakdown: ['Vanaf januari', 'tot de lente', 'het weer is goed'],
    },
  },
  zh: {
    'sal-1': {
      meaning: '你好，你最近怎么样？',
      literalMeaning: '愿平安降临你们，你近况如何？',
      regionalNote:
        '在阿尔及尔和中部地区常说“Wach rak?”（男）/ “Wach raki?”（女）；在奥兰和西部常说“Ki rak?”。',
      breakdown: ['你好（问候）', '什么 / 怎样', '你是（阳性）'],
    },
    'sal-2': {
      meaning: '我很好，感谢真主。你呢？',
      literalMeaning: '一切无恙，赞美真主。你呢？',
      regionalNote:
        '全阿尔及利亚通用的回答。问男性用“W nta?”，问女性用“W nti?”。',
      breakdown: ['很好 / 无恙', '感谢真主', '你呢？（阳性）'],
    },
    'sal-3': {
      meaning: '早上好 — 晨光明媚（回应）',
      literalMeaning: '美好之晨 — 光明之晨',
      regionalNote: '下午和晚上把“Sba7”换成“Msa”：“Msa el khir”（晚上好）。',
      breakdown: ['早晨', '美好', '光明'],
    },
    'sal-4': {
      meaning: '谢谢，祝你健康',
      literalMeaning: '做得好，愿真主赐予你健康',
      regionalNote: '“Sahit”（男）/ “Sahiti”（女）是阿尔及利亚最热情地道的致谢方式。',
      breakdown: ['谢谢 / 太棒了', '愿赐予你', '健康'],
    },
    'sal-5': {
      meaning: '抱歉兄弟，没关系吧 / 借过？',
      literalMeaning: '请原谅我兄弟，不要紧吗？',
      regionalNote: '人们习惯亲切地称男性为“khouya”（我兄弟）、称女性为“khti”（我姐妹）。',
      breakdown: ['抱歉 / 劳驾', '我兄弟', '没关系 / 可以吗'],
    },
    'sal-6': {
      meaning: '再见，保重',
      literalMeaning: '带着平安离去，在真主护佑中',
      regionalNote: '说“待会儿见”常加上“Men ba3d inchallah”或“Thalla fi ro7ek”（保重）。',
      breakdown: ['再见（平安）', '在护佑中', '真主的'],
    },
    'pres-1': {
      meaning: '你叫什么名字？我叫卡里姆',
      regionalNote: '在部分省份也会听到“Wasmek?”，是“Wach ismek?”的快速缩略读法。',
      breakdown: ['什么', '你的名字', '我的名字是'],
    },
    'pres-2': {
      meaning: '你来自哪里？我来自阿尔及尔 / 阿尔及利亚',
      regionalNote: '“Dzayer”既指首都阿尔及尔，也指整个阿尔及利亚。',
      breakdown: ['从哪里', '你（阳性）', '我来自阿尔及尔/阿尔及利亚'],
    },
    'pres-3': {
      meaning: '很高兴认识你！',
      regionalNote: '“Bezzaf”意为“非常 / 很多”，是达里贾语中使用频率最高的词之一。',
      breakdown: ['荣幸 / 高兴', '非常'],
    },
    'pres-4': {
      meaning: '这是我们家，欢迎你们',
      regionalNote: '“Mar7ba bik”（单人）或“Mar7ba bikoum”（多人）体现阿尔及利亚的热情好客。',
      breakdown: ['这是', '我们的家', '欢迎你们'],
    },
    'pres-5': {
      meaning: '妈妈和爸爸都在家',
      regionalNote: '“Yemma”（妈妈）是马格里布地区非常有亲切感的日常称呼。',
      breakdown: ['妈妈', '和爸爸', '在家里'],
    },
    'pres-6': {
      meaning: '我有两个兄弟和一个小妹妹',
      regionalNote: '“3andi”意为“我有”，“zouj”意为“二 / 两个”。',
      breakdown: ['我有', '两个兄弟', '和我的小妹妹'],
    },
    'cafe-1': {
      meaning: '请给我来一杯半奶咖啡，谢谢',
      regionalNote: '“Ta3ich”（直译“愿你长寿”）是日常最暖心的“请 / 麻烦了”。',
      breakdown: ['给我', '半奶咖啡', '请'],
    },
    'cafe-2': {
      meaning: '我想要一杯薄荷茶',
      regionalNote: '“Bghit”（我想要）来自动词“bgha”，也可以说“N7ab”。',
      breakdown: ['我想要', '一杯茶', '加薄荷'],
    },
    'cafe-3': {
      meaning: '这道菜真好吃！',
      regionalNote: '“Bnin”（阳性）/ “Bnina”（阴性）表示“美味可口”。餐桌必备！',
      breakdown: ['这食物', '美味的', '非常'],
    },
    'cafe-4': {
      meaning: '请慢用 / 祝你愉快！— 谢谢',
      regionalNote: '用餐、喝咖啡、理发或买了新东西后都可以对人说“Bsa7tek”。',
      breakdown: ['祝你健康 / 享用', '愿真主保佑你'],
    },
    'cafe-5': {
      meaning: '请给我拿点冰水',
      regionalNote: '“Men fadlek”是较为正式或餐厅中标准的“请问 / 劳驾”。',
      breakdown: ['给我拿', '冰水', '请'],
    },
    'cafe-6': {
      meaning: '兄弟，一共多少钱（买单）？',
      regionalNote: '“El 7sab”意为“账单”，也可以说“Ch7al khallas?”。',
      breakdown: ['多少', '账单', '我兄弟'],
    },
    'mar-1': {
      meaning: '这个多少钱？— 有点贵',
      regionalNote: '“Chwiya”意为“一点点”，微笑讲价时非常有用。',
      breakdown: ['多少钱', '这个', '有点贵（阴性）'],
    },
    'mar-2': {
      meaning: '给我便宜一点吧，我是老顾客！',
      regionalNote: '在集市或小店，微笑着说“Naqasli chwiya”总能开启友好议价。',
      breakdown: ['给我减价', '一点', '我是顾客'],
    },
    'mar-3': {
      meaning: '请问市场在哪里？',
      regionalNote: '“Win”（哪里）+ “ja”（位于）是询问地点的标准句型。',
      breakdown: ['在哪里', '位于', '市场'],
    },
    'mar-4': {
      meaning: '一直往前走，然后向右转',
      regionalNote: '“Limin”= 右边，“Lisar”= 左边，“Qbala”= 直走。',
      breakdown: ['一直走', '然后', '向右转'],
    },
    'mar-5': {
      meaning: '离这里近，还是很远？',
      regionalNote: '“Hna”= 这里，“Lhih”= 那里，“Qrib”= 近，“B3id”= 远。',
      breakdown: ['这里近', '还是', '很远'],
    },
    'mar-6': {
      meaning: '请在这里让我下车（出租车 / 公交）',
      regionalNote: '在阿尔及利亚乘坐出租车或公交车时最实用的叫停句。',
      breakdown: ['让我下车', '这里', '请'],
    },
    'quot-1': {
      meaning: '有 / 没有',
      regionalNote: '达里贾语否定常在词前后加“ma ... che”：kan（有）→ ma kanche（没有）。',
      breakdown: ['有 / 可用', '没有'],
    },
    'quot-2': {
      meaning: '没关系，一切都会好起来的',
      regionalNote: '“Ma3lich”常用来安慰别人、表示体谅或“不要紧”。',
      breakdown: ['没关系', '一切', '真主会安排好'],
    },
    'quot-3': {
      meaning: '今天有什么新鲜事？',
      regionalNote: '朋友或同事早上见面时非常自然的寒暄方式。',
      breakdown: ['有什么', '新的', '今天'],
    },
    'quot-4': {
      meaning: '我马上就到，稍等一下',
      regionalNote: '“Doka”（东部/中部也说“Dork”）意为“现在 / 立刻”。',
      breakdown: ['现在', '我正在路上', '稍微等一下'],
    },
    'quot-5': {
      meaning: '真的没错，你说得太对了',
      regionalNote: '“3andek el 7a9”（你说得对）在日常聊天中出现频率极高。',
      breakdown: ['说真的', '对 / 真', '你有道理'],
    },
    'quot-6': {
      meaning: '但愿如此，我们明天见',
      regionalNote: '“Ghodwa”= 明天，“El bare7”= 昨天，“El youm”= 今天。',
      breakdown: ['若真主愿意', '明天', '我们见面'],
    },
    'verb-1': {
      meaning: '我没听懂，请说慢一点',
      regionalNote: '学习时最宝贵的一句话！“Fhamt”（听懂了）→ “Ma fhamtche”（没听懂）。',
      breakdown: ['我没听懂', '说（祈使）', '慢一点'],
    },
    'verb-2': {
      meaning: '我正在学习说达里贾语',
      regionalNote: '在阿尔及利亚说出这句话，几乎总能收获对方温暖的微笑和鼓励！',
      breakdown: ['我正在学', '说', '达里贾语'],
    },
    'verb-3': {
      meaning: '这个用达里贾语怎么说？',
      regionalNote: '也可以问“Kifech tgoulou l’hada?”（你们怎么称呼这个？）。',
      breakdown: ['是什么', '这个', '用达里贾语'],
    },
    'verb-4': {
      meaning: '我去上班',
      regionalNote: '女性说话时需使用阴性分词：“Rani ray7a” 而不是 “raye7”。',
      breakdown: ['我正在去', '去上班'],
    },
    'verb-5': {
      meaning: '我懂一点点，不过还要继续学',
      regionalNote: '“Bessa7”意为“但是 / 不过”，“Mazal”意为“还 / 尚未”。',
      breakdown: ['我知道', '一点点', '但还要继续'],
    },
    'verb-6': {
      meaning: '请帮我再重复一遍这个词',
      regionalNote: '“3awed”来自动词“重复/重做”，对记住准确发音非常有效。',
      breakdown: ['为我重复', '这个词', '请'],
    },
    'bs7-1': {
      meaning: '我买面包，我买了牛奶',
      literalMeaning: '动词“买”三态：nechri（现在）、chrit（过去）、chra（他买了）',
      regionalNote: 'Ben Sedira 序言核心规则：以 -a 结尾的缺尾动词现在时用 -i (nechri)，过去时用 -it (chrit)。',
      breakdown: ['我买（现在1人称）', '面包', '我买了牛奶'],
    },
    'bs7-2': {
      meaning: '我的朋友，帮我处理这件事吧',
      regionalNote: '来自动词 nâouen / âouent / âouen（帮助）。s’ah’eb 复数为 s’h’ab。',
      breakdown: ['帮我', '在这件事上', '我的朋友'],
    },
    'bs7-3': {
      meaning: '一路平安 — 顺遂安康（告别语）',
      regionalNote: 'Ben Sedira 词典记载的经典双人告别语：离别者说 abqa âla kheir，留守者回 emchi besselama。',
      breakdown: ['平安同行', '安康留驻'],
    },
    'bs7-4': {
      meaning: '你为什么来这么早？为了学习',
      regionalNote: '阿尔及利亚典型口语缩合：âlach（为什么）和 bach（为了）。',
      breakdown: ['为什么', '你来得早', '为了我学习'],
    },
    'bs7-5': {
      meaning: '你多大了？我二十岁',
      regionalNote: '11 到 99 之间，名词 sna（年）保持单数形式（如 âchrin sna）。',
      breakdown: ['多少', '在你的年龄里', '我二十岁'],
    },
    'bs7-6': {
      meaning: '从一月到春天，天气都很舒适',
      regionalNote: '阿尔及利亚太阳历月份：iennar（一月）、fourar（二月）、mar’res（三月）、jenber（十二月）。',
      breakdown: ['从一月', '到春天（太阳字母冠词）', '天气很好'],
    },
  },
};

const SCENARIO_TRANSLATIONS: Record<
  NonFrenchLanguage,
  Record<string, ScenarioTranslation>
> = {
  en: {
    'cafe-alger': {
      title: 'At a Café in Algiers',
      setting: 'Lively terrace near Grande Poste, Algiers',
      partnerRole: 'Warm-hearted waiter',
      objective: 'Greet, order coffee or mint tea, and ask for the bill.',
      openingTranslation: 'Hello brother, welcome! What are you drinking today?',
      openingTip: 'Reply by greeting Amine or ordering with "Bghit..." or "A3tini...".',
      starterMeanings: [
        'All good, thanks! Give me a half-and-half coffee, please.',
        'Good morning! I would like a glass of mint tea.',
        'How much is the bill, brother? Thank you very much.',
      ],
    },
    'marche-bab': {
      title: 'At the Neighborhood Market',
      setting: 'Fruit & Deglet Nour dates stall',
      partnerRole: 'Smiling vendor',
      objective: 'Ask the price, bargain politely with "Naqasli chwiya", and thank her.',
      openingTranslation: 'Welcome my son! Look at these dates, fresh and super delicious!',
      openingTip: 'Ask the price with "Bch7al hada?" then try "Naqasli chwiya".',
      starterMeanings: [
        'Good morning auntie! How much per kilo for these dates?',
        'A bit expensive auntie, lower the price a little please!',
        'Thank you auntie, bless your health! Goodbye.',
      ],
    },
    'rencontre-famille': {
      title: 'Meeting Friends & Introductions',
      setting: 'Welcome at Algerian friends’ home',
      partnerRole: 'Childhood friend in Oran',
      objective: 'Introduce yourself, say where you are from, and say you are learning Darija.',
      openingTranslation: 'Hi! How are you? Welcome to our home, nice to meet you!',
      openingTip: 'In Oran people say "Ki rak?" instead of "Wach rak?". Reply "Labès, metcharfin bezzaf!".',
      starterMeanings: [
        'I am great, thank God! Very nice to meet you, my name is Samy.',
        'I am learning to speak Darija, still getting the hang of it!',
        'I did not quite catch that, speak slowly please.',
      ],
    },
    'taxi-orientation': {
      title: 'In a Taxi & Directions',
      setting: 'Downtown Constantine',
      partnerRole: 'Taxi driver',
      objective: 'Ask for directions, check distance, and ask to be dropped off.',
      openingTranslation: 'Hello brother! Where are you heading today?',
      openingTip: 'Ask if a place is nearby ("Hna qrib wella b3id?") or say where to stop ("Habatni hna").',
      starterMeanings: [
        'Hello! Where is the market? Is it close or far?',
        'Go straight ahead, then turn right.',
        'Drop me off right here please, thanks brother!',
      ],
    },
  },
  es: {
    'cafe-alger': {
      title: 'En un café de Argel',
      setting: 'Terraza animada cerca de la Grande Poste, Argel',
      partnerRole: 'Camarero amable',
      objective: 'Saludar, pedir un café o té a la menta y pedir la cuenta.',
      openingTranslation: '¡Hola hermano, bienvenido! ¿Qué vas a tomar hoy?',
      openingTip: 'Responde saludando a Amine o pide con «Bghit...» o «A3tini...».',
      starterMeanings: [
        '¡Todo bien, gracias! Dame un café mitad y mitad, por favor.',
        '¡Buenos días! Quisiera un vaso de té a la menta.',
        '¿Cuánto es la cuenta, hermano? Muchas gracias.',
      ],
    },
    'marche-bab': {
      title: 'En el mercado del barrio',
      setting: 'Puesto de frutas y dátiles Deglet Nour',
      partnerRole: 'Vendedora sonriente',
      objective: 'Preguntar el precio, regatear con «Naqasli chwiya» y agradecer.',
      openingTranslation: '¡Bienvenido hijo! ¡Mira estos dátiles, frescos y deliciosos!',
      openingTip: 'Pregunta el precio con «Bch7al hada?» y prueba luego «Naqasli chwiya».',
      starterMeanings: [
        '¡Buenos días tía! ¿A cuánto el kilo de estos dátiles?',
        'Un poco caro tía, ¡bájame un poco el precio por favor!',
        '¡Muchas gracias tía, que tengas salud! Adiós.',
      ],
    },
    'rencontre-famille': {
      title: 'Encuentro y Presentaciones',
      setting: 'Bienvenida en casa de amigos argelinos',
      partnerRole: 'Amiga de infancia en Orán',
      objective: 'Presentarte, decir de dónde vienes y contar que aprendes dariya.',
      openingTranslation: '¡Hola! ¿Cómo estás? ¡Bienvenido a nuestra casa, encantada!',
      openingTip: 'En Orán se dice «Ki rak?» en vez de «Wach rak?». Responde «Labès, metcharfin bezzaf!».',
      starterMeanings: [
        '¡Bien, gracias a Dios! Encantado, me llamo Samy.',
        'Estoy aprendiendo a hablar dariya, ¡todavía poco a poco!',
        'No entendí bien, habla despacio por favor.',
      ],
    },
    'taxi-orientation': {
      title: 'En taxi y Orientación',
      setting: 'Centro de Constantina',
      partnerRole: 'Taxista',
      objective: 'Pedir indicaciones, preguntar si está lejos y pedir parar.',
      openingTranslation: '¡Hola hermano! ¿A dónde vas hoy?',
      openingTip: 'Pregunta si queda cerca («Hna qrib wella b3id?») o pide bajar («Habatni hna»).',
      starterMeanings: [
        '¡Hola! ¿Dónde está el mercado? ¿Está cerca o lejos?',
        'Ve todo recto, después gira a la derecha.',
        '¡Déjame aquí por favor, gracias hermano!',
      ],
    },
  },
  de: {
    'cafe-alger': {
      title: 'Im Café in Algier',
      setting: 'Belebte Terrasse nahe der Grande Poste, Algier',
      partnerRole: 'Herzlicher Kellner',
      objective: 'Grüßen, Kaffee oder Minztee bestellen und nach der Rechnung fragen.',
      openingTranslation: 'Hallo Bruder, willkommen! Was möchtest du heute trinken?',
      openingTip: 'Antworte Amine mit einem Gruß oder bestelle mit „Bghit...“ / „A3tini...“.',
      starterMeanings: [
        'Alles gut, danke! Gib mir bitte einen Milchkaffee.',
        'Guten Morgen! Ich möchte gern ein Glas Minztee.',
        'Wie viel macht die Rechnung, Bruder? Vielen Dank.',
      ],
    },
    'marche-bab': {
      title: 'Auf dem Viertelmarkt',
      setting: 'Stand mit Obst und Deglet-Nour-Datteln',
      partnerRole: 'Lächelnde Händlerin',
      objective: 'Nach dem Preis fragen, höflich mit „Naqasli chwiya“ handeln und danken.',
      openingTranslation: 'Willkommen mein Sohn! Schau dir diese Datteln an, frisch und köstlich!',
      openingTip: 'Frag mit „Bch7al hada?“ nach dem Preis und probiere dann „Naqasli chwiya“.',
      starterMeanings: [
        'Guten Morgen Tante! Wie viel kostet das Kilo dieser Datteln?',
        'Etwas teuer Tante, mach mir den Preis bitte etwas günstiger!',
        'Danke sehr Tante, bleib gesund! Auf Wiedersehen.',
      ],
    },
    'rencontre-famille': {
      title: 'Treffen & Kennenlernen',
      setting: 'Zu Gast bei algerischen Freunden',
      partnerRole: 'Jugendfreundin in Oran',
      objective: 'Sich vorstellen, Herkunft nennen und sagen, dass man Darija lernt.',
      openingTranslation: 'Hallo! Wie geht’s? Willkommen bei uns, sehr erfreut!',
      openingTip: 'In Oran sagt man „Ki rak?“ statt „Wach rak?“. Antworte mit „Labès, metcharfin bezzaf!“.',
      starterMeanings: [
        'Mir geht’s gut, Gott sei Dank! Sehr erfreut, ich heiße Samy.',
        'Ich lerne gerade Darija sprechen, aber es dauert noch etwas!',
        'Ich habe nicht gut verstanden, sprich bitte langsam.',
      ],
    },
    'taxi-orientation': {
      title: 'Im Taxi & Wegbeschreibung',
      setting: 'Stadtzentrum von Constantine',
      partnerRole: 'Taxifahrer',
      objective: 'Nach dem Weg fragen, Entfernung prüfen und um Ausstieg bitten.',
      openingTranslation: 'Hallo Bruder! Wohin fährst du heute?',
      openingTip: 'Frag ob es nah ist („Hna qrib wella b3id?“) oder sag wo du raus willst („Habatni hna“).',
      starterMeanings: [
        'Hallo! Wo ist der Markt? Ist es nah oder weit?',
        'Fahr geradeaus, dann bieg rechts ab.',
        'Lass mich bitte hier aussteigen, danke Bruder!',
      ],
    },
  },
  it: {
    'cafe-alger': {
      title: 'Al bar ad Algeri',
      setting: 'Terrazza vivace vicino alla Grande Poste, Algeri',
      partnerRole: 'Cameriere cordiale',
      objective: 'Salutare, ordinare un caffè o un tè alla menta e chiedere il conto.',
      openingTranslation: 'Ciao fratello, benvenuto! Cosa prendi oggi da bere?',
      openingTip: 'Rispondi salutando Amine o ordina con «Bghit...» o «A3tini...».',
      starterMeanings: [
        'Tutto bene grazie! Dammi un caffè metà e metà, per favore.',
        'Buongiorno! Vorrei un bicchiere di tè alla menta.',
        'Quant’è il conto fratello? Grazie mille.',
      ],
    },
    'marche-bab': {
      title: 'Al mercato di quartiere',
      setting: 'Bancarella di frutta e datteri Deglet Nour',
      partnerRole: 'Commerciante sorridente',
      objective: 'Chiedere il prezzo, contrattare gentilmente con «Naqasli chwiya» e ringraziare.',
      openingTranslation: 'Benvenuto figliolo! Guarda questi datteri, freschi e buonissimi!',
      openingTip: 'Chiedi il prezzo con «Bch7al hada?» poi prova «Naqasli chwiya».',
      starterMeanings: [
        'Buongiorno zia! Quanto costa al chilo questi datteri?',
        'Un po’ caro zia, abbassami un po’ il prezzo per favore!',
        'Grazie mille zia, che tu stia bene! Arrivederci.',
      ],
    },
    'rencontre-famille': {
      title: 'Incontri & Presentazioni',
      setting: 'Accoglienza a casa di amici algerini',
      partnerRole: 'Amica d’infanzia a Orano',
      objective: 'Presentarsi, dire da dove vieni e spiegare che stai imparando la darija.',
      openingTranslation: 'Ciao! Come stai? Benvenuto a casa nostra, piacere!',
      openingTip: 'A Orano si dice «Ki rak?» invece di «Wach rak?». Rispondi «Labès, metcharfin bezzaf!».',
      starterMeanings: [
        'Bene grazie a Dio! Molto piacere, mi chiamo Samy.',
        'Sto imparando a parlare la darija, ma serve ancora un po’!',
        'Non ho capito bene, parla lentamente per favore.',
      ],
    },
    'taxi-orientation': {
      title: 'In taxi & Orientamento',
      setting: 'Centro di Costantina',
      partnerRole: 'Tassista',
      objective: 'Chiedere indicazioni, sapere se è lontano e chiedere di fermarsi.',
      openingTranslation: 'Ciao fratello! Dove vai oggi?',
      openingTip: 'Chiedi se è vicino («Hna qrib wella b3id?») o indica dove scendere («Habatni hna»).',
      starterMeanings: [
        'Ciao! Dov’è il mercato? È vicino o lontano?',
        'Vai dritto, poi gira a destra.',
        'Fammi scendere qui per favore, grazie fratello!',
      ],
    },
  },
  nl: {
    'cafe-alger': {
      title: 'In een café in Algiers',
      setting: 'Levendig terras bij Grande Poste, Algiers',
      partnerRole: 'Hartelijke ober',
      objective: 'Groeten, koffie of muntthee bestellen en om de rekening vragen.',
      openingTranslation: 'Hallo broer, welkom! Wat wil je vandaag drinken?',
      openingTip: 'Groet Amine terug of bestel met "Bghit..." of "A3tini...".',
      starterMeanings: [
        'Gaat goed, bedankt! Geef me een koffie half-om-half alsjeblieft.',
        'Goedemorgen! Ik wil graag een glas muntthee.',
        'Hoeveel is de rekening broer? Hartelijk bedankt.',
      ],
    },
    'marche-bab': {
      title: 'Op de buurtmarkt',
      setting: 'Kraam met fruit en Deglet Nour-dadels',
      partnerRole: 'Glimlachende koopvrouw',
      objective: 'Naar de prijs vragen, beleefd afdingen met "Naqasli chwiya" en bedanken.',
      openingTranslation: 'Welkom jongen! Kijk naar deze dadels, vers en superlekker!',
      openingTip: 'Vraag de prijs met "Bch7al hada?" en probeer daarna "Naqasli chwiya".',
      starterMeanings: [
        'Goedemorgen tante! Hoeveel kost een kilo van deze dadels?',
        'Een beetje duur tante, doe er iets van de prijs af alsjeblieft!',
        'Bedankt tante, blijf gezond! Tot ziens.',
      ],
    },
    'rencontre-famille': {
      title: 'Ontmoeting & Voorstellen',
      setting: 'Welkom thuis bij Algerijnse vrienden',
      partnerRole: 'Jeugdvriendin in Oran',
      objective: 'Jezelf voorstellen, vertellen waar je vandaan komt en dat je Darija leert.',
      openingTranslation: 'Hoi! Hoe gaat het? Welkom bij ons thuis, aangenaam!',
      openingTip: 'In Oran zegt men "Ki rak?" in plaats van "Wach rak?". Antwoord met "Labès, metcharfin bezzaf!".',
      starterMeanings: [
        'Goed, godzijdank! Aangenaam, ik heet Samy.',
        'Ik leer Darija spreken, maar ik moet nog veel oefenen!',
        'Ik begreep het niet goed, spreek langzaam alsjeblieft.',
      ],
    },
    'taxi-orientation': {
      title: 'In de taxi & Richting',
      setting: 'Centrum van Constantine',
      partnerRole: 'Taxichauffeur',
      objective: 'De weg vragen, checken of het ver is en vragen om te stoppen.',
      openingTranslation: 'Hallo broer! Waar ga je vandaag naartoe?',
      openingTip: 'Vraag of het dichtbij is ("Hna qrib wella b3id?") of geef aan waar je uitstapt ("Habatni hna").',
      starterMeanings: [
        'Hallo! Waar is de markt? Is het dichtbij of ver?',
        'Ga rechtdoor, sla daarna rechtsaf.',
        'Zet me hier af alsjeblieft, bedankt broer!',
      ],
    },
  },
  zh: {
    'cafe-alger': {
      title: '在阿尔及尔的咖啡馆',
      setting: '阿尔及尔大邮局附近热闹的露天咖啡座',
      partnerRole: '热情的侍应生',
      objective: '打招呼、点一杯咖啡或薄荷茶，并结账。',
      openingTranslation: '你好兄弟，欢迎光临！今天想喝点什么？',
      openingTip: '先向 Amine 问好，或用“Bghit...” / “A3tini...”点单。',
      starterMeanings: [
        '挺好的谢谢！请给我来一杯半奶咖啡。',
        '早上好！我想要一杯薄荷茶。',
        '兄弟，账单多少钱？非常感谢。',
      ],
    },
    'marche-bab': {
      title: '在街区集市',
      setting: '水果与 Deglet Nour 椰枣摊位',
      partnerRole: '微笑的摊主阿姨',
      objective: '询问价格、用“Naqasli chwiya”礼貌讲价并道谢。',
      openingTranslation: '欢迎孩子！看看这椰枣，新鲜又香甜！',
      openingTip: '先用“Bch7al hada?”问价，再试试说“Naqasli chwiya”。',
      starterMeanings: [
        '早上好阿姨！这椰枣一公斤多少钱？',
        '阿姨有点贵呢，请稍微便宜一点吧！',
        '谢谢阿姨，祝您健康！再见。',
      ],
    },
    'rencontre-famille': {
      title: '朋友聚会与自我介绍',
      setting: '做客阿尔及利亚朋友家中',
      partnerRole: '奥兰的童年好友',
      objective: '自我介绍、说明来自哪里，并告诉对方自己正在学达里贾语。',
      openingTranslation: '嗨！你好吗？欢迎来我们家，很高兴认识你！',
      openingTip: '在奥兰常说“Ki rak?”而不是“Wach rak?”。可以回答“Labès, metcharfin bezzaf!”。',
      starterMeanings: [
        '挺好的感谢真主！很高兴认识你，我叫萨米。',
        '我正在学说达里贾语，不过还在起步阶段！',
        '我没太听明白，请说慢一点。',
      ],
    },
    'taxi-orientation': {
      title: '乘出租车与问路',
      setting: '君士坦丁市中心',
      partnerRole: '出租车司机',
      objective: '询问路线、确认距离，并让司机在指定位置停车。',
      openingTranslation: '你好兄弟！今天去哪里呀？',
      openingTip: '可以问地方远不远（“Hna qrib wella b3id?”），或示意下车（“Habatni hna”）。',
      starterMeanings: [
        '你好！市场在哪里？离这里近还是远？',
        '一直往前走，然后向右转。',
        '请在这里让我下车，谢谢兄弟！',
      ],
    },
  },
};

const DIFFICULTY_LABEL: Record<AppLanguage, Record<DarijaPhrase['difficulty'], string>> = {
  fr: { Débutant: 'Débutant', Intermédiaire: 'Intermédiaire' },
  en: { Débutant: 'Beginner', Intermédiaire: 'Intermediate' },
  es: { Débutant: 'Principiante', Intermédiaire: 'Intermedio' },
  de: { Débutant: 'Anfänger', Intermédiaire: 'Mittelstufe' },
  it: { Débutant: 'Principiante', Intermédiaire: 'Intermedio' },
  nl: { Débutant: 'Beginner', Intermédiaire: 'Gemiddeld' },
  zh: { Débutant: '初级', Intermédiaire: '中级' },
};

export function getLocalizedSound(sound: ArabiziSound, lang: AppLanguage): ArabiziSound {
  if (lang === 'fr') return sound;
  const tr = SOUND_TRANSLATIONS[lang][sound.symbol];
  if (!tr) return sound;
  return {
    ...sound,
    name: tr.name,
    pronunciationTip: tr.pronunciationTip,
    exampleFrench: tr.exampleMeaning,
  };
}

export function getLocalizedPhrase(phrase: DarijaPhrase, lang: AppLanguage): DarijaPhrase {
  if (lang === 'fr') return phrase;
  const tr = PHRASE_TRANSLATIONS[lang][phrase.id];
  if (!tr) return phrase;
  return {
    ...phrase,
    frenchMeaning: tr.meaning,
    literalMeaning: tr.literalMeaning ?? undefined,
    regionalNote: tr.regionalNote,
    difficulty: (DIFFICULTY_LABEL[lang][phrase.difficulty] ??
      phrase.difficulty) as DarijaPhrase['difficulty'],
    breakdown: phrase.breakdown.map((token, idx) => ({
      ...token,
      french: tr.breakdown[idx] ?? token.french,
    })),
  };
}

export function getLocalizedModule(
  mod: LearningModule,
  lang: AppLanguage
): LearningModule {
  if (lang === 'fr') return mod;
  const tr = MODULE_TRANSLATIONS[lang][mod.id];
  return {
    ...mod,
    title: tr?.title ?? mod.title,
    subtitle: tr?.subtitle ?? mod.subtitle,
    contextLabel: tr?.contextLabel ?? mod.contextLabel,
    phrases: mod.phrases.map((p) => getLocalizedPhrase(p, lang)),
  };
}

export function getLocalizedScenario(
  scenario: DialogueScenario,
  lang: AppLanguage
): DialogueScenario {
  if (lang === 'fr') return scenario;
  const tr = SCENARIO_TRANSLATIONS[lang][scenario.id];
  if (!tr) return scenario;
  return {
    ...scenario,
    title: tr.title,
    setting: tr.setting,
    partnerRole: tr.partnerRole,
    objective: tr.objective,
    openingTurn: {
      ...scenario.openingTurn,
      frenchTranslation: tr.openingTranslation,
      coachingTip: tr.openingTip,
    },
    starterSuggestions: scenario.starterSuggestions.map((s, idx) => ({
      ...s,
      frenchMeaning: tr.starterMeanings[idx] ?? s.frenchMeaning,
    })),
  };
}

export function getOfflineFallbackDialogueReply(
  scenario: DialogueScenario,
  userInput: string,
  lang: AppLanguage
): {
  replyDarija: string;
  replyArabic: string;
  replyFrench: string;
  coachingTip: string;
  suggestedReplies: DialogueScenario['starterSuggestions'];
} {
  const localized = getLocalizedScenario(scenario, lang);
  const lower = userInput.toLowerCase();

  const priceTexts: Record<AppLanguage, { meaning: string; tip: string; s1: string; s2: string }> = {
    fr: {
      meaning: 'C’est à 200 dinars mon frère, sois le bienvenu !',
      tip: 'Tu peux répondre « Sahit, ya3tik essa7a! » ou négocier avec « Naqasli chwiya ».',
      s1: 'Baisse-moi un peu le prix s’il te plaît !',
      s2: 'Merci mon frère, porte-toi bien ! Au revoir.',
    },
    en: {
      meaning: 'It is 200 dinars my brother, you are welcome!',
      tip: 'You can reply "Sahit, ya3tik essa7a!" or bargain with "Naqasli chwiya".',
      s1: 'Lower the price a little please!',
      s2: 'Thank you brother, take care! Goodbye.',
    },
    es: {
      meaning: 'Son 200 dinares hermano, ¡sé bienvenido!',
      tip: 'Puedes responder «Sahit, ya3tik essa7a!» o negociar con «Naqasli chwiya».',
      s1: '¡Bájame un poco el precio por favor!',
      s2: '¡Gracias hermano, cuídate! Adiós.',
    },
    de: {
      meaning: 'Das kostet 200 Dinar mein Bruder, willkommen!',
      tip: 'Du kannst mit „Sahit, ya3tik essa7a!“ antworten oder mit „Naqasli chwiya“ handeln.',
      s1: 'Mach mir den Preis bitte etwas günstiger!',
      s2: 'Danke Bruder, mach’s gut! Auf Wiedersehen.',
    },
    it: {
      meaning: 'Sono 200 dinari fratello, benvenuto!',
      tip: 'Puoi rispondere «Sahit, ya3tik essa7a!» o trattare con «Naqasli chwiya».',
      s1: 'Abbassami un po’ il prezzo per favore!',
      s2: 'Grazie fratello, stammi bene! Arrivederci.',
    },
    nl: {
      meaning: 'Dat is 200 dinar mijn broer, welkom!',
      tip: 'Je kunt antwoorden met "Sahit, ya3tik essa7a!" of afdingen met "Naqasli chwiya".',
      s1: 'Maak de prijs iets lager alsjeblieft!',
      s2: 'Bedankt broer, het beste! Tot ziens.',
    },
    zh: {
      meaning: '兄弟，200 第纳尔，欢迎光临！',
      tip: '你可以回复“Sahit, ya3tik essa7a!”或用“Naqasli chwiya”讲价。',
      s1: '请稍微便宜一点吧！',
      s2: '谢谢兄弟，保重！再见。',
    },
  };

  const cafeTexts: Record<AppLanguage, { meaning: string; tip: string; s1: string; s2: string }> = {
    fr: {
      meaning: 'Avec plaisir mon frère ! Je t’en apporte une bien chaude tout de suite.',
      tip: 'Quand quelqu’un te rend service, réponds chaleureusement « Sahit » ou « Ya3tik essa7a ».',
      s1: 'Merci ! Apporte-moi un peu d’eau fraîche avec, s’il te plaît.',
      s2: 'C’est combien l’addition mon frère ?',
    },
    en: {
      meaning: 'With pleasure my brother! I will bring you a hot one right away.',
      tip: 'When someone helps you, warmly reply "Sahit" or "Ya3tik essa7a".',
      s1: 'Thanks! Bring me some cold water with it, please.',
      s2: 'How much is the bill, brother?',
    },
    es: {
      meaning: '¡Con mucho gusto hermano! Enseguida te traigo uno bien caliente.',
      tip: 'Cuando alguien te ayuda, responde con calidez «Sahit» o «Ya3tik essa7a».',
      s1: '¡Gracias! Tráeme un poco de agua fría con ello, por favor.',
      s2: '¿Cuánto es la cuenta, hermano?',
    },
    de: {
      meaning: 'Sehr gern mein Bruder! Ich bringe dir sofort einen heißen.',
      tip: 'Wenn dir jemand hilft, antworte herzlich mit „Sahit“ oder „Ya3tik essa7a“.',
      s1: 'Danke! Bring mir bitte noch etwas kaltes Wasser dazu.',
      s2: 'Wie viel macht die Rechnung, Bruder?',
    },
    it: {
      meaning: 'Con piacere fratello! Te ne porto subito uno bello caldo.',
      tip: 'Quando qualcuno ti aiuta, rispondi calorosamente «Sahit» o «Ya3tik essa7a».',
      s1: 'Grazie! Portami anche un po’ d’acqua fresca, per favore.',
      s2: 'Quant’è il conto, fratello?',
    },
    nl: {
      meaning: 'Met plezier mijn broer! Ik breng je er meteen een lekker warm.',
      tip: 'Als iemand je helpt, antwoord dan hartelijk met "Sahit" of "Ya3tik essa7a".',
      s1: 'Bedankt! Breng me er alsjeblieft wat koud water bij.',
      s2: 'Hoeveel is de rekening, broer?',
    },
    zh: {
      meaning: '没问题兄弟！马上给你端一杯热腾腾的过来。',
      tip: '别人为你服务时，热情地回复“Sahit”或“Ya3tik essa7a”。',
      s1: '谢谢！请顺便给我带点冰水。',
      s2: '兄弟，一共多少钱？',
    },
  };

  const defaultTexts: Record<AppLanguage, { meaning: string; tip: string }> = {
    fr: {
      meaning: 'Bravo ! Tu parles déjà très bien la darija !',
      tip: 'Continue la conversation en posant une question avec « Wach… » ou « Ch7al… ».',
    },
    en: {
      meaning: 'Great job! You already speak Darija very well!',
      tip: 'Keep the conversation going by asking a question with "Wach…" or "Ch7al…".',
    },
    es: {
      meaning: '¡Bravo! ¡Ya hablas muy bien la dariya!',
      tip: 'Continúa la charla haciendo una pregunta con «Wach…» o «Ch7al…».',
    },
    de: {
      meaning: 'Super! Du sprichst schon sehr gut Darija!',
      tip: 'Führe das Gespräch weiter mit einer Frage mit „Wach…“ oder „Ch7al…“.',
    },
    it: {
      meaning: 'Bravo! Parli già molto bene la darija!',
      tip: 'Continua la conversazione facendo una domanda con «Wach…» o «Ch7al…».',
    },
    nl: {
      meaning: 'Geweldig! Je spreekt al heel goed Darija!',
      tip: 'Ga verder door een vraag te stellen met "Wach…" of "Ch7al…".',
    },
    zh: {
      meaning: '太棒了！你的达里贾语说得真不错！',
      tip: '试着用“Wach…”或“Ch7al…”继续提问互动吧。',
    },
  };

  if (
    lower.includes('ch7al') ||
    lower.includes('7sab') ||
    lower.includes('prix') ||
    lower.includes('bch7al')
  ) {
    const p = priceTexts[lang];
    return {
      replyDarija: 'Hada b 200 dinar khouya, mar7ba bik!',
      replyArabic: 'هذا بـ 200 دينار خويا، مرحبا بيك!',
      replyFrench: p.meaning,
      coachingTip: p.tip,
      suggestedReplies: [
        {
          darijaLatin: 'Naqasli chwiya ta3ich, rani zbon!',
          darijaArabic: 'نقصلي شوية تعيش، راني زبون!',
          frenchMeaning: p.s1,
        },
        {
          darijaLatin: 'Sahit khouya, ya3tik essa7a! Beslama.',
          darijaArabic: 'صحيت خويا، يعطيك الصحة! بسلامة.',
          frenchMeaning: p.s2,
        },
      ],
    };
  }

  if (lower.includes('qahwa') || lower.includes('atay')) {
    const c = cafeTexts[lang];
    return {
      replyDarija: '3la rassi khouya! Doka njiblak wahda skhouna.',
      replyArabic: 'على راسي خويا! دوكا نجيبلك واحدة سخونة.',
      replyFrench: c.meaning,
      coachingTip: c.tip,
      suggestedReplies: [
        {
          darijaLatin: 'Sahit! Jibli chwiya ma bared m3aha ta3ich.',
          darijaArabic: 'صحيت! جيبلي شوية ما بارد معاها تعيش.',
          frenchMeaning: c.s1,
        },
        {
          darijaLatin: 'Ch7al el 7sab khouya?',
          darijaArabic: 'شحال الحساب خويا؟',
          frenchMeaning: c.s2,
        },
      ],
    };
  }

  const d = defaultTexts[lang];
  return {
    replyDarija: 'Ya3tik essa7a! Rak tahder el darija mli7 bezzaf!',
    replyArabic: 'يعطيك الصحة! راك تهدر الدارجة مليح بزاف!',
    replyFrench: d.meaning,
    coachingTip: d.tip,
    suggestedReplies: localized.starterSuggestions.slice(1),
  };
}

export function getUiStrings(lang: AppLanguage) {
  return UI_TRANSLATIONS[lang];
}
