interface TheoryCard {
  id: string;
  title: string;
  trainingTopicTitle?: string;
}

interface TheoryTopic {
  title: string;
  topics: TheoryCard[];
}

// TODO: [backlog] make a trainingTopicKey instead of title (need to add a 'key' to training_topic table as well)
export const theoryTopics: Record<string, TheoryTopic> = {
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
      {
        id: "plural-nouns",
        title: "Множественное число существительных",
        trainingTopicTitle: "Множественное число существительных",
      },
      {
        id: "ordinal-numerals",
        title: "Порядковые числительные",
        trainingTopicTitle: "Порядковые числительные",
      },
      {
        id: "possessive-pronouns",
        title: "Притяжательные местоимения",
        trainingTopicTitle: "Притяжательные и возвратные местоимения",
      },
      {
        id: "object-pronouns",
        title: "Объектные местоимения",
        trainingTopicTitle: "Объектные местоимения",
      },
      {
        id: "reflexive-pronouns",
        title: "Возвратные местоимения",
        trainingTopicTitle: "Притяжательные и возвратные местоимения",
      },
      {
        id: "passive-voice",
        title: "Пассивный залог",
        trainingTopicTitle: "Пассивный залог",
      },
      {
        id: "i-wish-v2",
        title: "I wish + V2",
        trainingTopicTitle: "I wish + V2",
      },
      {
        id: "conditional-real",
        title: "Условное предложение (реальное)",
        trainingTopicTitle: "Условное предложение (реальное)",
      },
      {
        id: "conditional-unreal",
        title: "Условное предложение (нереальное)",
        trainingTopicTitle: "Условное предложение (нереальное)",
      },
      {
        id: "to-be-forms",
        title: "Формы глагола to be",
        trainingTopicTitle: "Глагол to be",
      },
      {
        id: "modal-verbs",
        title: "Модальные глаголы",
        trainingTopicTitle: "Модальные глаголы",
      },
      {
        id: "present-simple",
        title: "Настоящее простое",
        trainingTopicTitle: "Настоящее Простое/Продолженное",
      },
      {
        id: "present-continuous",
        title: "Настоящее продолженное",
        trainingTopicTitle: "Настоящее Простое/Продолженное",
      },
      {
        id: "present-perfect",
        title: "Настоящее совершённое",
        trainingTopicTitle: "Настоящее/Прошедшее Совершенное",
      },
      {
        id: "past-simple",
        title: "Прошедшее простое",
        trainingTopicTitle: "Прошедшее Простое",
      },
      {
        id: "past-continuous",
        title: "Прошедшее продолженное",
        trainingTopicTitle: "Прошедшее Продолженное",
      },
      {
        id: "past-perfect",
        title: "Прошедшее совершённое",
        trainingTopicTitle: "Настоящее/Прошедшее Совершенное",
      },
      {
        id: "future-simple",
        title: "Будущее простое",
        trainingTopicTitle: "Будущее Простое",
      },
      {
        id: "adjectives-comparison",
        title: "Степени сравнения прилагательных",
        trainingTopicTitle: "Степени сравнения",
      },
      { id: "would-v", title: "Would + V", trainingTopicTitle: "Would + V" },
    ],
  },
  writing: {
    title: "Письмо",
    topics: [
      {
        id: "writing-algorithm",
        title: "Алгоритм написания",
      },
      {
        id: "cliche-phrases",
        title: "Фразы-клише",
      },
      {
        id: "linking-words",
        title: "Слова-связки",
      },
    ],
  },
};

export type CategorySlug = keyof typeof theoryTopics;
