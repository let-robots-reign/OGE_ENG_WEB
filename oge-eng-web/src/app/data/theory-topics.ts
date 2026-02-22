export const theoryTopics = {
  general: {
    title: "Общая информация об экзамене",
    topics: [
      { id: "procedure", title: "Порядок проведения" },
      { id: "listening", title: "Аудирование" },
      { id: "reading", title: "Чтение" },
      { id: "language-material", title: "Языковой материал" },
      { id: "writing", title: "Письмо" },
    ],
  },
  "use-of-english": {
    title: "Языковой материал",
    topics: [
      { id: "plural-nouns", title: "Множественное число существительных" },
      { id: "ordinal-numerals", title: "Порядковые числительные" },
      { id: "possessive-pronouns", title: "Притяжательные местоимения" },
      { id: "object-pronouns", title: "Объектные местоимения" },
      { id: "reflexive-pronouns", title: "Возвратные местоимения" },
      { id: "passive-voice", title: "Пассивный залог" },
      { id: "i-wish-v2", title: "I wish + V2" },
      { id: "conditional-real", title: "Условное предложение (реальное)" },
      { id: "conditional-unreal", title: "Условное предложение (нереальное)" },
      { id: "to-be-forms", title: "Формы глагола to be" },
      { id: "modal-verbs", title: "Модальные глаголы" },
      { id: "present-simple", title: "Настоящее простое" },
      { id: "present-continuous", title: "Настоящее продолженное" },
      { id: "present-perfect", title: "Настоящее совершённое" },
      { id: "past-simple", title: "Прошедшее простое" },
      { id: "past-continuous", title: "Прошедшее продолженное" },
      { id: "past-perfect", title: "Прошедшее совершённое" },
      { id: "future-simple", title: "Будущее простое" },
      {
        id: "adjectives-comparison",
        title: "Степени сравнения прилагательных",
      },
      { id: "would-v", title: "Would + V" },
    ],
  },
  writing: {
    title: "Письмо",
    topics: [
      { id: "writing-algorithm", title: "Алгоритм написания" },
      { id: "cliche-phrases", title: "Фразы-клише" },
      { id: "linking-words", title: "Слова-связки" },
    ],
  },
};

export type CategorySlug = keyof typeof theoryTopics;
