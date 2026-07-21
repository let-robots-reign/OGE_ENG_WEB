import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { and, eq } from "drizzle-orm";
import Groq from "groq-sdk";
import { diagnosticsSystemPrompt } from "@/server/api/lib/prompts/diagnostics";
import { userResults } from "@/server/db/schema";
import { Cerebras } from "@cerebras/cerebras_cloud_sdk";
import { GoogleGenAI } from "@google/genai";
import { env } from "@/env";

let groqClient: Groq | null = null;
const getGroq = () => {
  groqClient ??= new Groq({ apiKey: env.GROQ_API_KEY });
  return groqClient;
};

let cerebrasClient: Cerebras | null = null;
const getCerebras = () => {
  cerebrasClient ??= new Cerebras({ apiKey: env.CEREBRAS_API_KEY });
  return cerebrasClient;
};

let geminiClient: GoogleGenAI | null = null;
const getGemini = () => {
  geminiClient ??= new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  return geminiClient;
};

// const testUserAnswers = {
//   part1: [
//     {
//       id: 1,
//       text: "_____________ (not / touch) the dog! It has sharp _____________ (tooth).",
//       userAnswers: ["Do not touch", "teeth"],
//       correctAnswers: [["do not touch", "don't touch"], ["teeth"]],
//       checkResults: [true, true],
//     },
//     {
//       id: 2,
//       text: "This book is _____________ (my), but where is _____________ (your)?",
//       userAnswers: ["mine", "yours"],
//       correctAnswers: [["mine"], ["yours"]],
//       checkResults: [true, true],
//     },
//     {
//       id: 3,
//       text: "If I _____________ (have) a million dollars, I _____________ (travel) the world.",
//       userAnswers: ["had", "would travel"],
//       correctAnswers: [["had"], ["would travel"]],
//       checkResults: [true, true],
//     },
//     {
//       id: 4,
//       text: "She _____________ (not / can) come to the phone right now. She _____________ (have) a shower.",
//       userAnswers: ["cannot", "is having"],
//       correctAnswers: [["cannot", "can't"], ["is having"]],
//       checkResults: [true, true],
//     },
//     {
//       id: 5,
//       text: "Every evening, dinner at this hotel _____________ (cook) by _____________ (famous) Italian chef.",
//       userAnswers: ["is cooked", "the famous"],
//       correctAnswers: [["is cooked"], ["the most famous"]],
//       checkResults: [true, false],
//     },
//     {
//       id: 6,
//       text: "Mount Everest is _____________ (high) mountain on Earth.",
//       userAnswers: ["the highest"],
//       correctAnswers: [["the highest"]],
//       checkResults: [true],
//     },
//     {
//       id: 7,
//       text: "If it _____________ (not / rain) tomorrow, we _____________ (go) to the beach.",
//       userAnswers: ["does not rain", "will go"],
//       correctAnswers: [["does not rain"], ["will go"]],
//       checkResults: [true, true],
//     },
//     {
//       id: 8,
//       text: "I feel great! I _____________ (finish) my work already.",
//       userAnswers: ["have been"],
//       correctAnswers: [["have finished"]],
//       checkResults: [false],
//     },
//     {
//       id: 9,
//       text: "I like both of _____________ (that) _____________ (dress), but I _____________ (think) the blue one is _____________ (pretty) than the red one.",
//       userAnswers: ["those", "dresses", "think", "prettier"],
//       correctAnswers: [["those"], ["dresses"], ["think"], ["prettier"]],
//       checkResults: [true, true, true, true],
//     },
//     {
//       id: 10,
//       text: "Please, don't tell _____________ (they) about the surprise _____________ (party). I promised _____________ (not / tell) anyone.",
//       userAnswers: ["them", "party", "would not tell"],
//       correctAnswers: [
//         ["them"],
//         ["parties"],
//         ["would not tell", "wouldn't tell"],
//       ],
//       checkResults: [true, false, true],
//     },
//     {
//       id: 11,
//       text: "My little sister hopes she _____________ (dress) _____________ (she) without any help next year.",
//       userAnswers: ["will dress", "herself"],
//       correctAnswers: [["will dress"], ["herself"]],
//       checkResults: [true, true],
//     },
//     {
//       id: 12,
//       text: "I _____________ (see) Mike while he _____________ (wait) for the bus.",
//       userAnswers: ["saw", "was waiting"],
//       correctAnswers: [["saw"], ["was waiting"]],
//       checkResults: [true, true],
//     },
//     {
//       id: 13,
//       text: "By the time we arrived at the cinema, the film _____________ (start).",
//       userAnswers: ["had started"],
//       correctAnswers: [["had started"]],
//       checkResults: [true],
//     },
//     {
//       id: 14,
//       text: "They are looking forward to _____________ (see) _____________ (we) at the party.",
//       userAnswers: ["see", "us"],
//       correctAnswers: [["seeing"], ["us"]],
//       checkResults: [false, true],
//     },
//     {
//       id: 15,
//       text: "Is this _____________ (we) room? - No, it’s _____________ (their). _____________ (our) is on the _____________ (3) floor.",
//       userAnswers: ["our", "theirs", "Ours", "third"],
//       correctAnswers: [["our"], ["theirs"], ["ours"], ["third"]],
//       checkResults: [true, true, true, true],
//     },
//     {
//       id: 16,
//       text: "What _____________ (you / do) tonight? - I _____________ (stay) home because I have to finish _____________ (clean) my room.",
//       userAnswers: ["are you doing", "am staying", "cleaning"],
//       correctAnswers: [
//         ["are you doing"],
//         ["am staying", "'m staying"],
//         ["cleaning"],
//       ],
//       checkResults: [true, true, true],
//     },
//   ],
//   part2: [
//     {
//       id: 1,
//       text: "<p><b>Эти люди</b> – мои друзья. Посмотри на <b>них</b>!</p>",
//       topics: ["Personal pronouns", "Demonstrative pronouns"],
//       userTranslation: "That people are my friends. Look at them!",
//     },
//     {
//       id: 2,
//       text: "<p>Кот <b>не ловил мышей</b> на прошлой неделе.</p>",
//       topics: ["Past Simple", "Plural nouns"],
//       userTranslation: "The cat didn’t catch mice last week",
//     },
//     {
//       id: 3,
//       text: "<p>Они когда-нибудь <b>покупали</b> билеты <b>сами</b>? - Да. Брат сказал, что они <b>потратили слишком много</b> денег на билеты в кино <b>в</b> четверг.</p>",
//       topics: [
//         "Present Perfect",
//         "Past Simple",
//         "Reflexive pronouns",
//         "Reported speech",
//       ],
//       userTranslation:
//         "Have they ever bought tickets by themselves? Yes. Brother said that had spend too much money on tickets to the cinema on Thursday",
//     },
//     {
//       id: 4,
//       text: "<p>Мы <b>пойдём</b> в парк, если завтра <b>будет</b> солнечно.</p>",
//       topics: ["Future Simple", "Conditional 1"],
//       userTranslation: "We will go to the park if it is sunny tomorrow",
//     },
//     {
//       id: 5,
//       text: "<p>Если <b>бы</b> у меня <b>было</b> больше свободного времени, я <b>бы занимался</b> спортом.</p>",
//       topics: ["Conditional 2"],
//       userTranslation: "If I had more free time, I would do sports",
//     },
//     {
//       id: 6,
//       text: "<p><b>Те печенья испекла</b> моя бабушка.</p>",
//       topics: ["Demonstrative pronouns", "Past Simple"],
//       userTranslation: "Those cookies were baked by my grandma",
//     },
//     {
//       id: 7,
//       text: "<p><b>Мамина</b> подруга сказала, что <b>придёт позже</b>.</p>",
//       topics: ["Possessive case", "Reported speech"],
//       userTranslation: "My mother’s friend said that she would come later",
//     },
//     {
//       id: 8,
//       text: "<p>Это <b>самый плохой</b> фильм, который я когда-либо <b>видел</b>.</p>",
//       topics: ["Superlative adjectives", "Present Perfect"],
//       userTranslation: "This is the worst movie that I have ever seen",
//     },
//     {
//       id: 9,
//       text: "<p>Я бы хотел <b>добавить немного</b> сахара. - Извини, у нас осталось <b>очень мало</b>.</p>",
//       topics: ["Would like", "Countable/uncountable nouns"],
//       userTranslation:
//         "I would like to add some sugar. Sorry, we have very little left",
//     },
//     {
//       id: 10,
//       text: "<p>Мы <b>собираемся переехать</b> в новый дом в следующем году.</p>",
//       topics: ["To be going to"],
//       userTranslation: "We are going to move to a new house next year",
//     },
//     {
//       id: 11,
//       text: "<p>Он опоздал на автобус, потому что <b>проспал</b>.</p>",
//       topics: ["Past Simple"],
//       userTranslation: "He missed the bus because he had overslept",
//     },
//     {
//       id: 12,
//       text: "<p>В холодильнике <b>очень мало</b> яблок.</p>",
//       topics: ["There is/there are", "Countable/uncountable nouns"],
//       userTranslation: "There are very few apples in the fridge",
//     },
//     {
//       id: 13,
//       text: "<p>Обычно он <b>работает</b> из дома, но сегодня он <b>встречается</b> с коллегами из других <b>стран</b> в офисе.</p>",
//       topics: ["Present Simple", "Present Continuous"],
//       userTranslation:
//         "He usually works from home, but today he is meeting with colleagues from different countries in the office",
//     },
//     {
//       id: 14,
//       text: "<p>Я бы хотела(=I wish), чтобы у меня <b>была более комфортная</b> комната.</p>",
//       topics: ["I wish"],
//       userTranslation: "I wish I had a more comfortable room",
//     },
//     {
//       id: 15,
//       text: "<p>Здесь <b>холоднее</b>, чем вчера. - Правда? Я <b>закрою</b> окно.</p>",
//       topics: [
//         "Comparative adjectives",
//         "Future Simple (spontaneous decision)",
//       ],
//       userTranslation:
//         "It is colder here than yesterday. Really? I will close the window",
//     },
//   ],
// };

const part1Schema = z.array(
  z.object({
    id: z.number(),
    text: z.string(),
    userAnswers: z.array(z.string()),
    correctAnswers: z.array(z.array(z.string())),
    checkResults: z.array(z.boolean()),
  }),
);

const part2Schema = z.array(
  z.object({
    id: z.number(),
    text: z.string(),
    userTranslation: z.string(),
    topics: z.array(z.string()),
  }),
);

export const diagnosticsRouter = createTRPCRouter({
  hasCompletedDiagnostics: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.query.userResults.findFirst({
      where: and(
        eq(userResults.userId, ctx.session.user.id),
        eq(userResults.activityType, "diagnostics"),
      ),
    });
    return !!result;
  }),

  // Returns the user's most recent diagnostics feedback so they can revisit it.
  getDiagnosticsResult: protectedProcedure.query(async ({ ctx }) => {
    const row = await ctx.db.query.userResults.findFirst({
      where: and(
        eq(userResults.userId, ctx.session.user.id),
        eq(userResults.activityType, "diagnostics"),
      ),
      orderBy: (r, { desc }) => [desc(r.createdAt)],
    });

    if (!row) return null;

    const details = row.details as { feedback?: string } | null;
    return {
      feedback: details?.feedback ?? "",
      createdAt: row.createdAt,
    };
  }),

  checkGrammar: publicProcedure
    .input(z.object({ part1: part1Schema, part2: part2Schema }))
    .mutation(async ({ input }) => {
      const userAnswers = JSON.stringify(input, null, 2);
      // const userAnswers = JSON.stringify(testUserAnswers, null, 2);

      const userMessage = `Вот ответы студента на диагностический тест по грамматике. Пожалуйста, предоставь свой отзыв на основе инструкций.\n\n\`\`\`json\n${userAnswers}\n\`\`\``;

      let feedback: string | undefined;

      // 1. First try with Cerebras
      try {
        const completion = (await getCerebras().chat.completions.create({
          messages: [
            {
              role: "system",
              content: diagnosticsSystemPrompt,
            },
            {
              role: "user",
              content: userMessage,
            },
          ],
          model: "gpt-oss-120b",
          temperature: 0.15,
        })) as { choices?: Array<{ message?: { content?: string | null } }> };

        const content = completion.choices?.[0]?.message?.content;
        if (content) {
          feedback = content;
          console.log("Grammar check completed using Cerebras");
        }
      } catch (error) {
        console.error("Cerebras API error, falling back to Gemini:", error);
      }

      // 2. If Cerebras failed, trying Gemini
      if (!feedback) {
        try {
          const result = await getGemini().models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: userMessage }] }],
            config: {
              systemInstruction: diagnosticsSystemPrompt,
              temperature: 0.15,
              maxOutputTokens: 6000,
            },
          });

          const content = result?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (content) {
            feedback = content;
            console.log("Grammar check completed using Gemini");
          }
        } catch (error) {
          console.error("Gemini API error, falling back to Groq:", error);
        }
      }

      // 3. Last chance to get feedback using Groq
      if (!feedback) {
        try {
          const completion = await getGroq().chat.completions.create({
            messages: [
              {
                role: "system",
                content: diagnosticsSystemPrompt,
              },
              {
                role: "user",
                content: userMessage,
              },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.15,
            top_p: 0.9,
            presence_penalty: 0,
            frequency_penalty: 0,
            max_completion_tokens: 6000,
            stream: false,
          });

          const content = completion.choices[0]?.message?.content;
          if (content) {
            feedback = content;
            console.log("Grammar check completed using Groq");
          }
        } catch (error) {
          console.error("Groq API error:", error);
          // Проверяем, не является ли ошибка лимитом Groq (413)
          const isRateLimit =
            error instanceof Error && error.message.includes("413");

          if (isRateLimit) {
            throw new Error(
              "Сейчас проверяется слишком много работ 😅 Пожалуйста, подождите немного и нажмите кнопку снова.",
            );
          }

          // Для всех остальных ошибок (500, таймауты и т.д.)
          throw new Error(
            "Произошла ошибка во время анализа диагностики. Попробуйте позднее.",
          );
        }
      }

      if (!feedback) {
        throw new Error("Failed to get feedback from any AI model.");
      }

      return { feedback };
    }),
});
