export const testUserAnswers = {
  part1: [
    {
      id: 1,
      text: "_____________ (not / touch) the dog! It has sharp _____________ (tooth).",
      userAnswers: ["Do not touch", "teeth"],
      correctAnswers: [["do not touch", "don't touch"], ["teeth"]],
      checkResults: [true, true],
    },
    {
      id: 2,
      text: "This book is _____________ (my), but where is _____________ (your)?",
      userAnswers: ["mine", "yours"],
      correctAnswers: [["mine"], ["yours"]],
      checkResults: [true, true],
    },
    {
      id: 3,
      text: "If I _____________ (have) a million dollars, I _____________ (travel) the world.",
      userAnswers: ["had", "would travel"],
      correctAnswers: [["had"], ["would travel"]],
      checkResults: [true, true],
    },
    {
      id: 4,
      text: "She _____________ (not / can) come to the phone right now. She _____________ (have) a shower.",
      userAnswers: ["cannot", "is having"],
      correctAnswers: [["cannot", "can't"], ["is having"]],
      checkResults: [true, true],
    },
    {
      id: 5,
      text: "Every evening, dinner at this hotel _____________ (cook) by _____________ (famous) Italian chef.",
      userAnswers: ["is cooked", "the famous"],
      correctAnswers: [["is cooked"], ["the most famous"]],
      checkResults: [true, false],
    },
    {
      id: 6,
      text: "Mount Everest is _____________ (high) mountain on Earth.",
      userAnswers: ["the highest"],
      correctAnswers: [["the highest"]],
      checkResults: [true],
    },
    {
      id: 7,
      text: "If it _____________ (not / rain) tomorrow, we _____________ (go) to the beach.",
      userAnswers: ["does not rain", "will go"],
      correctAnswers: [["does not rain"], ["will go"]],
      checkResults: [true, true],
    },
    {
      id: 8,
      text: "I feel great! I _____________ (finish) my work already.",
      userAnswers: ["have been"],
      correctAnswers: [["have finished"]],
      checkResults: [false],
    },
    {
      id: 9,
      text: "I like both of _____________ (that) _____________ (dress), but I _____________ (think) the blue one is _____________ (pretty) than the red one.",
      userAnswers: ["those", "dresses", "think", "prettier"],
      correctAnswers: [["those"], ["dresses"], ["think"], ["prettier"]],
      checkResults: [true, true, true, true],
    },
    {
      id: 10,
      text: "Please, don't tell _____________ (they) about the surprise _____________ (party). I promised _____________ (not / tell) anyone.",
      userAnswers: ["them", "party", "would not tell"],
      correctAnswers: [
        ["them"],
        ["parties"],
        ["would not tell", "wouldn't tell"],
      ],
      checkResults: [true, false, true],
    },
    {
      id: 11,
      text: "My little sister hopes she _____________ (dress) _____________ (she) without any help next year.",
      userAnswers: ["will dress", "herself"],
      correctAnswers: [["will dress"], ["herself"]],
      checkResults: [true, true],
    },
    {
      id: 12,
      text: "I _____________ (see) Mike while he _____________ (wait) for the bus.",
      userAnswers: ["saw", "was waiting"],
      correctAnswers: [["saw"], ["was waiting"]],
      checkResults: [true, true],
    },
    {
      id: 13,
      text: "By the time we arrived at the cinema, the film _____________ (start).",
      userAnswers: ["had started"],
      correctAnswers: [["had started"]],
      checkResults: [true],
    },
    {
      id: 14,
      text: "They are looking forward to _____________ (see) _____________ (we) at the party.",
      userAnswers: ["see", "us"],
      correctAnswers: [["seeing"], ["us"]],
      checkResults: [false, true],
    },
    {
      id: 15,
      text: "Is this _____________ (we) room? - No, it’s _____________ (their). _____________ (our) is on the _____________ (3) floor.",
      userAnswers: ["our", "theirs", "Ours", "third"],
      correctAnswers: [["our"], ["theirs"], ["ours"], ["third"]],
      checkResults: [true, true, true, true],
    },
    {
      id: 16,
      text: "What _____________ (you / do) tonight? - I _____________ (stay) home because I have to finish _____________ (clean) my room.",
      userAnswers: ["are you doing", "am staying", "cleaning"],
      correctAnswers: [
        ["are you doing"],
        ["am staying", "'m staying"],
        ["cleaning"],
      ],
      checkResults: [true, true, true],
    },
  ],
  part2: [
    {
      id: 1,
      text: "<p><b>Эти люди</b> – мои друзья. Посмотри на <b>них</b>!</p>",
      topics: ["Personal pronouns", "Demonstrative pronouns"],
      userTranslation: "That people are my friends. Look at them!",
    },
    {
      id: 2,
      text: "<p>Кот <b>не ловил мышей</b> на прошлой неделе.</p>",
      topics: ["Past Simple", "Plural nouns"],
      userTranslation: "The cat didn’t catch mice last week",
    },
    {
      id: 3,
      text: "<p>Они когда-нибудь <b>покупали</b> билеты <b>сами</b>? - Да. Брат сказал, что они <b>потратили слишком много</b> денег на билеты в кино <b>в</b> четверг.</p>",
      topics: [
        "Present Perfect",
        "Past Simple",
        "Reflexive pronouns",
        "Reported speech",
      ],
      userTranslation:
        "Have they ever bought tickets by themselves? Yes. Brother said that had spend too much money on tickets to the cinema on Thursday",
    },
    {
      id: 4,
      text: "<p>Мы <b>пойдём</b> в парк, если завтра <b>будет</b> солнечно.</p>",
      topics: ["Future Simple", "Conditional 1"],
      userTranslation: "We will go to the park if it is sunny tomorrow",
    },
    {
      id: 5,
      text: "<p>Если <b>бы</b> у меня <b>было</b> больше свободного времени, я <b>бы занимался</b> спортом.</p>",
      topics: ["Conditional 2"],
      userTranslation: "If I had more free time, I would do sports",
    },
    {
      id: 6,
      text: "<p><b>Те печенья испекла</b> моя бабушка.</p>",
      topics: ["Demonstrative pronouns", "Past Simple"],
      userTranslation: "Those cookies were baked by my grandma",
    },
    {
      id: 7,
      text: "<p><b>Мамина</b> подруга сказала, что <b>придёт позже</b>.</p>",
      topics: ["Possessive case", "Reported speech"],
      userTranslation: "My mother’s friend said that she would come later",
    },
    {
      id: 8,
      text: "<p>Это <b>самый плохой</b> фильм, который я когда-либо <b>видел</b>.</p>",
      topics: ["Superlative adjectives", "Present Perfect"],
      userTranslation: "This is the worst movie that I have ever seen",
    },
    {
      id: 9,
      text: "<p>Я бы хотел <b>добавить немного</b> сахара. - Извини, у нас осталось <b>очень мало</b>.</p>",
      topics: ["Would like", "Countable/uncountable nouns"],
      userTranslation:
        "I would like to add some sugar. Sorry, we have very little left",
    },
    {
      id: 10,
      text: "<p>Мы <b>собираемся переехать</b> в новый дом в следующем году.</p>",
      topics: ["To be going to"],
      userTranslation: "We are going to move to a new house next year",
    },
    {
      id: 11,
      text: "<p>Он опоздал на автобус, потому что <b>проспал</b>.</p>",
      topics: ["Past Simple"],
      userTranslation: "He missed the bus because he had overslept",
    },
    {
      id: 12,
      text: "<p>В холодильнике <b>очень мало</b> яблок.</p>",
      topics: ["There is/there are", "Countable/uncountable nouns"],
      userTranslation: "There are very few apples in the fridge",
    },
    {
      id: 13,
      text: "<p>Обычно он <b>работает</b> из дома, но сегодня он <b>встречается</b> с коллегами из других <b>стран</b> в офисе.</p>",
      topics: ["Present Simple", "Present Continuous"],
      userTranslation:
        "He usually works from home, but today he is meeting with colleagues from different countries in the office",
    },
    {
      id: 14,
      text: "<p>Я бы хотела(=I wish), чтобы у меня <b>была более комфортная</b> комната.</p>",
      topics: ["I wish"],
      userTranslation: "I wish I had a more comfortable room",
    },
    {
      id: 15,
      text: "<p>Здесь <b>холоднее</b>, чем вчера. - Правда? Я <b>закрою</b> окно.</p>",
      topics: [
        "Comparative adjectives",
        "Future Simple (spontaneous decision)",
      ],
      userTranslation:
        "It is colder here than yesterday. Really? I will close the window",
    },
  ],
};

import { DIAGNOSTICS_VERSION } from "@/shared/diagnostics-questions";
// Only answers cross the HTTP boundary. Historical sample text/keys above are
// retained for comparison, never trusted by the grading endpoint.
export const testStudentSubmission = {
  version: DIAGNOSTICS_VERSION as typeof DIAGNOSTICS_VERSION,
  part1: testUserAnswers.part1.map(({ id, userAnswers }) => ({
    id,
    userAnswers,
  })),
  part2: testUserAnswers.part2.map(({ id, userTranslation }) => ({
    id,
    userTranslation,
  })),
};
