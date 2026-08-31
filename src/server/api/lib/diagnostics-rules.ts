// Fixed teaching content for this version of the diagnostic. Changes to a rule
// or answer key must be reviewed with the question and its accepted alternatives.
export const grammarRules: Record<
  number,
  Array<{ topic: string; explanation: string }>
> = {
  1: [
    {
      topic: "Imperatives",
      explanation:
        "Для запрета используй do not (don't) + начальную форму глагола: do not touch.",
    },
    {
      topic: "Plural nouns",
      explanation: "У tooth неправильная форма множественного числа: teeth.",
    },
  ],
  2: [
    {
      topic: "Possessive pronouns",
      explanation:
        "После is здесь нет существительного, поэтому нужна самостоятельная форма mine, а не my.",
    },
    {
      topic: "Possessive pronouns",
      explanation:
        "Yours заменяет сочетание your book и употребляется без существительного.",
    },
  ],
  3: [
    {
      topic: "Conditional 2",
      explanation:
        "Для воображаемой ситуации в настоящем после if используй Past Simple: if I had.",
    },
    {
      topic: "Conditional 2",
      explanation:
        "В результате воображаемого условия используй would + начальную форму: would travel.",
    },
  ],
  4: [
    {
      topic: "Modal verbs",
      explanation:
        "Отрицательная форма can — cannot или can't. Вспомогательный do не нужен.",
    },
    {
      topic: "Present Continuous",
      explanation:
        "Действие происходит сейчас: she is having a shower. Используй is + глагол с -ing.",
    },
  ],
  5: [
    {
      topic: "Passive Voice",
      explanation:
        "Ужин готовят: подлежащее dinner получает действие. Для регулярного действия в пассиве используй is + V3: is cooked.",
    },
    {
      topic: "Superlative adjectives",
      explanation:
        "В скобках прямо указана превосходная степень. У famous она образуется с most; перед этой формой здесь нужен the: the most famous.",
    },
  ],
  6: [
    {
      topic: "Superlative adjectives",
      explanation:
        "Эверест сравнивается со всеми горами на Земле. Превосходная степень high — the highest.",
    },
  ],
  7: [
    {
      topic: "Conditional 1",
      explanation:
        "В реальном условии о будущем после if используй Present Simple, а не will: does not rain.",
    },
    {
      topic: "Conditional 1",
      explanation:
        "В главной части условия о будущем используй will + начальную форму: will go.",
    },
  ],
  8: [
    {
      topic: "Present Perfect",
      explanation:
        "Работа уже закончена, и результат важен сейчас. Используй have + V3: have finished. Have been — форма глагола be, а здесь нужно передать действие finish.",
    },
  ],
  9: [
    {
      topic: "Demonstrative pronouns",
      explanation: "Для множественного числа вместо that используй those.",
    },
    {
      topic: "Plural nouns",
      explanation:
        "После both of those нужно множественное число. К dress добавь -es: dresses.",
    },
    {
      topic: "Present Simple",
      explanation:
        "Think здесь выражает мнение. С I используй форму Present Simple think.",
    },
    {
      topic: "Comparative adjectives",
      explanation:
        "Слово than указывает на сравнение. В pretty буква y меняется на i перед -er: prettier.",
    },
  ],
  10: [
    {
      topic: "Personal pronouns",
      explanation:
        "После tell нужна объектная форма местоимения they: tell them.",
    },
    {
      topic: "Plural nouns",
      explanation:
        "В скобках указано множественное число. В party согласная + y меняется на -ies: parties. Без этого указания единственное число тоже было бы возможно.",
    },
    {
      topic: "Reported speech",
      explanation:
        "После I promised I будущее обещание передаётся через would: I promised I would not tell. Второе I уже есть в предложении.",
    },
  ],
  11: [
    {
      topic: "Future Simple",
      explanation:
        "Next year указывает на будущее. После she hopes здесь подходит will + начальная форма: will dress.",
    },
    {
      topic: "Reflexive pronouns",
      explanation:
        "Сестра будет одеваться сама. Для she возвратное местоимение — herself.",
    },
  ],
  12: [
    {
      topic: "Past Simple",
      explanation:
        "Встреча с Майком — отдельное событие в прошлом. Прошедшая форма see — saw.",
    },
    {
      topic: "Past Continuous",
      explanation:
        "Ожидание автобуса было в процессе в момент встречи: he was waiting. Используй was + глагол с -ing.",
    },
  ],
  13: [
    {
      topic: "Past Perfect",
      explanation:
        "Фильм начался раньше нашего прибытия. Для более раннего действия в прошлом используй had + V3: had started.",
    },
  ],
  14: [
    {
      topic: "Gerunds",
      explanation:
        "В look forward to слово to — предлог. После него нужна форма с -ing: look forward to seeing.",
    },
    {
      topic: "Personal pronouns",
      explanation: "После seeing нужна объектная форма we: seeing us.",
    },
  ],
  15: [
    {
      topic: "Possessive pronouns",
      explanation: "Перед существительным room используй притяжательное our.",
    },
    {
      topic: "Possessive pronouns",
      explanation:
        "Theirs заменяет their room и употребляется без существительного.",
    },
    {
      topic: "Possessive pronouns",
      explanation:
        "Ours заменяет our room и является подлежащим следующего предложения.",
    },
    {
      topic: "Ordinal numbers",
      explanation:
        "Номер этажа передаётся порядковым числительным: the third floor.",
    },
  ],
  16: [
    {
      topic: "Present Continuous",
      explanation:
        "Здесь спрашивают о планах на вечер. В вопросе Present Continuous поставь are перед you: What are you doing tonight?",
    },
    {
      topic: "Present Continuous",
      explanation:
        "Для запланированного действия подходит Present Continuous: I am staying. С I используй am + глагол с -ing.",
    },
    {
      topic: "Gerunds",
      explanation:
        "После finish употребляется форма глагола с -ing: finish cleaning. Это правило сочетания глаголов, а не указание на время действия.",
    },
  ],
};
