import { type NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

// Define the expected payload structure for type safety
interface Part1Payload {
  id: number;
  text: string;
  userAnswer: string;
  originalText: string;
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

Your task is to analyze their answers to a grammar test and provide a detailed, question-by-question analysis, followed by a summary.

Your response must be structured as follows and written in Russian:

1.  **## Общий вывод**
    Краткий общий обзор твоих грамматических навыков на основе всего теста.

2.  **## Детальный разбор заданий**
    В этом разделе ты должен **проанализировать абсолютно каждое задание из обеих частей теста**, одно за другим.
    Создай подзаголовки для каждой части: \`### Часть 1\` и \`### Часть 2\`.
    Под каждым подзаголовком проанализируй все задания из соответствующей части.
    Для каждого задания укажи его номер.

    *   **Если ответ правильный:**
        *   Напиши "Результат: Правильно".
        *   Кратко похвали или объясни, почему это правильно.
        *   Покажи правильный ответ, используя тег: \`CORRECT[is walking]\`.

    *   **Если ответ неправильный (или пропущен):**
        *   Напиши "Результат: Ошибка".
        *   Покажи твой неверный ответ, используя тег: \`INCORRECT[walked]\` (используй \`INCORRECT[пусто]\` для пропущенных).
        *   Покажи правильный ответ, используя тег: \`CORRECT[is walking]\`.
        *   Подробно объясни грамматическое правило.

3.  **## Сильные стороны**
    На основе детального разбора выше, обобщи, какие грамматические темы ты, по-видимому, хорошо понимаешь.

4.  **## Слабые стороны**
    На основе детального разбора выше, обобщи, какие грамматические темы тебе нужно улучшить.

5.  **## Итоговое заключение и рекомендации**
    Заключительный параграф с общими выводами и планом обучения.

**КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА ФОРМАТИРОВАНИЯ:**

*   Используй теги \`CORRECT[]\` и \`INCORRECT[]\` **исключительно** для выделения самих слов/фраз-ответов.
*   Для заголовков разделов используй Markdown-разметку \`##\` или \`###\`.
*   **ЗАПРЕЩЕНО:** Не используй HTML-теги, \`**...**\`, или \`*...*\` для выделения.

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
