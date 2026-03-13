import { type NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

// Define the expected payload structure for type safety
interface Part1Payload {
  id: number;
  text: string; // The original text with blanks and hints, e.g., "I ___ (go) to school."
  userAnswers: string[]; // A clean array of user's answers, e.g., ["went"]
}

interface Part2Payload {
  id: number;
  text: string;
  userTranslation: string;
}

interface GroqApiPayload {
  part1: Part1Payload[];
  part2: Part2Payload[];
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const systemPrompt = `You are an expert English teacher writing feedback directly to a student. Address them as "you" (ты/твой).

Your task is to analyze their answers to a grammar test and provide a detailed, question-by-question analysis.

**DATA STRUCTURE:**
For Part 1, you will receive a 'text' with blanks (___) and hints in brackets, and a separate clean array 'userAnswers'. Each element in 'userAnswers' corresponds to a blank in the 'text'.

Your response must be structured as follows and written in Russian:

1.  **## Общий вывод**
    Краткий общий обзор твоих грамматических навыков.

2.  **## Детальный разбор заданий**
    Создай подзаголовки: \`### Часть 1\` и \`### Часть 2\`.
    Под каждым подзаголовком **проанализируй абсолютно каждое задание, одно за другим. Не группируй задания (например, "Задания 2-15"). Ты должен создать отдельную запись для каждого ID задания.**

    *   **Для Части 1:**
        *   Для каждого задания (с его \`id\`), сравни ответы из \`userAnswers\` с правильными ответами, которые можно определить из \`text\`.
        *   Если все ответы в задании верны, напиши "Результат: Правильно" и похвали.
        *   Если есть ошибки, напиши "Результат: Ошибка". Покажи неверный ответ, правильный и объясни правило.
    *   **Для Части 2:**
        *   Проанализируй перевод \`userTranslation\`.

3.  **## Сильные стороны**
    Обобщи, какие грамматические темы ты хорошо понимаешь.

4.  **## Слабые стороны**
    Обобщи, какие грамматические темы тебе нужно улучшить.

5.  **## Итоговое заключение и рекомендации**
    Заключительный параграф с планом обучения.

**КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА ФОРМАТИРОВАНИЯ:**

*   **ИСПОЛЬЗУЙ ТОЛЬКО ЭТИ ТЕГИ:** Для правильных ответов используй \`CORRECT[слово]\`, для неверных — \`INCORRECT[слово]\`.
*   **ЗАПРЕЩЕНО:** **Никогда не генерируй HTML-теги, такие как \`<span ...>\`**. Не используй Markdown-разметку \`**...**\` или \`*...*\` для выделения ответов.

Твой тон должен быть ободряющим, но четким.`;

export async function POST(req: NextRequest) {
  try {
    // Use the defined type for the request body for type safety
    const body = (await req.json()) as GroqApiPayload;
    const userAnswers = JSON.stringify(body, null, 2);

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Вот ответы студента на диагностический тест по грамматике. Пожалуйста, предоставь свой отзыв на основе инструкций.\n\n\`\`\`json\n${userAnswers}\n\`\`\``,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_completion_tokens: 8000,
      stream: false,
    });

    const aiResponse =
      chatCompletion.choices[0]?.message?.content ??
      "Не удалось получить ответ от AI.";

    return NextResponse.json({ feedback: aiResponse });
  } catch (error) {
    console.error("Error in GROQ API route:", error);
    // It's good practice to hide detailed errors in production
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 },
    );
  }
}
