export const NOT_COMPLETED_TOPICS = [
  "Задание 5",
  "Задания 6-11",
  "Задания 13-19",
] as const;

export type Topic = {
  id: number;
  title: string;
  category: string;
  isActive: boolean;
  progress?: number | null;
  score?: number | null;
};

// ─── Audio / Reading task-card metadata ──────────────────────────────────────

export type TaskCardMeta = {
  kicker: string;
  range: string;
  title: string;
  desc: string;
  type: string;
  items: number;
  time: string;
  progress: number | null;
  tone: "indigo" | "warm" | "mint";
};

// TODO: is 'tone' used?
export const AUDIO_META: Record<string, TaskCardMeta> = {
  "Задания 1-4": {
    kicker: "№ 1",
    range: "Задания 1–4",
    title: "Короткие диалоги",
    desc: "Четыре коротких текста (А–D). Выбрать один из трёх вариантов ответа на каждый вопрос.",
    type: "Множественный выбор",
    items: 4,
    time: "8 мин",
    progress: null,
    tone: "indigo",
  },
  "Задание 5": {
    kicker: "№ 2",
    range: "Задание 5",
    title: "Сопоставление",
    desc: "Высказывания пяти разных людей (А–E). Подобрать к каждому соответствующую рубрику из списка 1–6.",
    type: "Соотнесение",
    items: 5,
    time: "10 мин",
    progress: null,
    tone: "warm",
  },
  "Задания 6-11": {
    kicker: "№ 3",
    range: "Задания 6–11",
    title: "Заполнение таблицы",
    desc: "Прослушайте интервью и впишите по одному слову в каждый пропуск. Числа записываются буквами.",
    type: "Краткий ответ",
    items: 6,
    time: "12 мин",
    progress: null,
    tone: "mint",
  },
};

export const AUDIO_EXAM = {
  kicker: "EXAM MODE",
  range: "Раздел целиком",
  title: "Все 11 заданий с таймером",
  desc: "Полный раздел по аудированию из реального экзамена. С таймером 30 минут — без подсказок.",
  type: "Экзаменационный режим",
  items: 11,
  time: "30 мин",
};

// TODO: check if the tips are valid
export const AUDIO_INFO = [
  {
    tag: "совет",
    title: "Стратегия",
    body: "Перед прослушиванием бегло прочитайте задание и подчеркните ключевые слова. Так проще удержать смысл при первом прослушивании.",
  },
  {
    tag: "формат",
    title: "Бланк ответов",
    body: "Ответы 1–4 — одна цифра. Ответ к 5 — последовательность из пяти цифр. 6–11 — одно слово без артикля.",
  },
  {
    tag: "произношение",
    title: "Тембр и акценты",
    body: "В ОГЭ встречаются дикторы с британским и нейтральным произношением. Тренируйтесь на обоих.",
  },
];

export const READING_META: Record<string, TaskCardMeta> = {
  "Задание 12": {
    kicker: "№ 12",
    range: "Задание 12",
    title: "Сопоставление текстов и вопросов",
    desc: "Шесть коротких текстов A–F и семь вопросов 1–7. К каждому тексту подобрать один вопрос, который раскрывается в его содержании. Один вопрос лишний.",
    type: "Сопоставление",
    items: 6,
    time: "12 мин",
    progress: null,
    tone: "indigo",
  },
  "Задания 13-19": {
    kicker: "№ 13–19",
    range: "Задания 13–19",
    title: "True / False / Not stated",
    desc: "Один развёрнутый текст и семь утверждений. Для каждого выбрать: соответствует тексту, не соответствует или информация в тексте не упомянута.",
    type: "Множественный выбор · 3 варианта",
    items: 7,
    time: "18 мин",
    progress: null,
    tone: "warm",
  },
};

export const READING_EXAM = {
  kicker: "EXAM MODE",
  range: "Раздел целиком",
  title: "Все 8 заданий с таймером",
  desc: "Полный раздел по чтению из реального экзамена: задание 12 + задания 13–19. Таймер 30 минут, без подсказок и без проверки до конца.",
  type: "Экзаменационный режим",
  items: 8,
  time: "30 мин",
};

export const READING_GENRES = [
  {
    tag: "научпоп",
    title: "Tourism & ecology",
    desc: "Тексты о видах туризма, экологии, путешествиях.",
  },
  {
    tag: "биография",
    title: "Personal stories",
    desc: "Рассказы о людях: хобби, профессии, увлечения.",
  },
  {
    tag: "наука",
    title: "Tech & language",
    desc: "Технологии, образование, изучение языков.",
  },
  {
    tag: "культура",
    title: "Culture & arts",
    desc: "Искусство, фестивали, исторические сюжеты.",
  },
];

export const READING_INFO = [
  {
    tag: "стратегия",
    title: "Сначала вопросы",
    body: "В задании 12 сперва бегло прочитайте все семь вопросов и подчеркните ключевые слова. Только потом возвращайтесь к текстам A–F.",
  },
  {
    tag: "формат",
    title: "Not stated ≠ False",
    body: "В заданиях 13–19 различайте: «не соответствует» — текст утверждает обратное, «не сказано» — текст просто молчит об этом факте.",
  },
  {
    tag: "темп",
    title: "Время на текст",
    body: "На задание 12 закладывайте ≈ 1.5 минуты на текст A–F. На длинный текст 13–19 — около 6 минут на чтение и 12 на ответы.",
  },
];

// ─── Use of English topic-row metadata ───────────────────────────────────────

export type UoeMeta = {
  en: string;
  desc: string;
  items: number;
  sample: { from: string; to: string } | null;
  score: number | null;
  mistakes?: number;
};

export const UOE_META: Record<string, UoeMeta> = {
  Словообразование: {
    en: "Word formation",
    desc: "Преобразование однокоренных слов: суффиксы и приставки, изменение части речи.",
    items: 15,
    sample: { from: "DECIDE", to: "decision" },
    score: null,
  },
  "Множественное число существительных": {
    en: "Plurals",
    desc: "Регулярные и нерегулярные формы: child → children, mouse → mice, sheep → sheep.",
    items: 15,
    sample: { from: "WOMAN", to: "women" },
    score: null,
  },
  "Порядковые числительные": {
    en: "Ordinal numerals",
    desc: "From one to one hundredth: first, second, twelfth, twentieth. Включая записи буквами.",
    items: 15,
    sample: { from: "TWO", to: "second" },
    score: null,
  },
  "Объектные местоимения": {
    en: "Object pronouns",
    desc: "me, you, him, her, us, them. Включая возвратные и притяжательные формы.",
    items: 15,
    sample: { from: "HE", to: "him" },
    score: null,
  },
  "Степени сравнения": {
    en: "Comparison · degrees",
    desc: "Сравнительная и превосходная степени прилагательных и наречий: good → better → best.",
    items: 15,
    sample: { from: "GOOD", to: "better" },
    score: null,
  },
  "Притяжательные и возвратные местоимения": {
    en: "Possessive & reflexive",
    desc: "my/mine, your/yours, his, her/hers. Возвратные: myself, yourself, himself, herself.",
    items: 15,
    sample: { from: "THEY", to: "their" },
    score: null,
  },
  "Пассивный залог": {
    en: "Passive voice",
    desc: "Преобразование активных конструкций в пассивные во всех временах, кроме Perfect Continuous.",
    items: 15,
    sample: { from: "BUILD", to: "was built" },
    score: null,
  },
  "Глагол to be": {
    en: "Verb to be",
    desc: "Спряжение to be в настоящем, прошедшем и будущем времени. Вспомогательная функция.",
    items: 15,
    sample: { from: "THEY", to: "are" },
    score: null,
  },
  "I wish + V2": {
    en: "I wish / If only",
    desc: "Выражение сожаления о настоящем и прошлом. I wish I knew. If only she had called.",
    items: 15,
    sample: { from: "KNOW", to: "knew" },
    score: null,
  },
  "Модальные глаголы": {
    en: "Modal verbs",
    desc: "can/could, must/have to, should, may/might. Выражение необходимости, возможности и совета.",
    items: 15,
    sample: { from: "ALLOW", to: "may" },
    score: null,
  },
  "Условное предложение (реальное)": {
    en: "Real conditionals",
    desc: "First conditional: If + Present Simple, will + V. Реальные и вероятные условия.",
    items: 15,
    sample: { from: "RAIN", to: "will cancel" },
    score: null,
  },
  "Условное предложение (нереальное)": {
    en: "Unreal conditionals",
    desc: "Second conditional: If + Past Simple, would + V. Воображаемые ситуации в настоящем.",
    items: 15,
    sample: { from: "WIN", to: "would travel" },
    score: null,
  },
  "Настоящее Простое/Продолженное": {
    en: "Present Simple & Continuous",
    desc: "Постоянные факты vs. действия в момент речи. He plays — He is playing. Stative verbs.",
    items: 15,
    sample: { from: "PLAY", to: "is playing" },
    score: null,
  },
  "Настоящее/Прошедшее Совершенное": {
    en: "Present & Past Perfect",
    desc: "Связь с настоящим (has done) vs. завершённость в прошлом (had done). Since, for, already.",
    items: 15,
    sample: { from: "FINISH", to: "has finished" },
    score: null,
  },
  "Прошедшее Простое": {
    en: "Past Simple",
    desc: "Завершённые действия в прошлом. Правильные и неправильные глаголы. Yesterday, last year.",
    items: 15,
    sample: { from: "GO", to: "went" },
    score: null,
  },
  "Прошедшее Продолженное": {
    en: "Past Continuous",
    desc: "Действие в процессе в определённый момент прошлого. I was reading when she called.",
    items: 15,
    sample: { from: "READ", to: "was reading" },
    score: null,
  },
  "Будущее Простое": {
    en: "Future Simple",
    desc: "will + V для предсказаний, спонтанных решений и обещаний. Shall в вопросах.",
    items: 15,
    sample: { from: "COME", to: "will come" },
    score: null,
  },
  "Would + V": {
    en: "Would + V",
    desc: "Прошедшее будущее, вежливые просьбы, привычные действия в прошлом. Would you like?",
    items: 15,
    sample: { from: "LIKE", to: "would like" },
    score: null,
  },
};

export const UOE_INFO = [
  {
    tag: "формат",
    title: "Открытый ответ",
    body: "Пишите одно слово — без пробелов и переносов. Числа записываются буквами. Регистр не важен.",
  },
  {
    tag: "совет",
    title: "Подсказка через лексику",
    body: "Если слово незнакомо, посмотрите на контекст — времена, рядом стоящие предлоги, артикли подскажут форму.",
  },
  {
    tag: "разбор",
    title: "После проверки",
    body: "Все ошибки можно посмотреть с правильными ответами и пояснениями. Похожие задания попадут в повтор.",
  },
];
