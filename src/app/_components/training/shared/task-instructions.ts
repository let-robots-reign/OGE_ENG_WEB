import type { AudioTaskType, ReadingTaskType } from "@/server/db/schema";

export interface TaskInstruction {
  heading: string;
  hint: string;
}

export const LISTENING_INSTRUCTIONS: Record<AudioTaskType, TaskInstruction> = {
  multiple_choice: {
    heading:
      "Вы услышите четыре коротких текста, обозначенных буквами А, B, C, D.",
    hint: "В заданиях 1–4 запишите цифру 1, 2 или 3, соответствующую выбранному варианту ответа.",
  },
  matching: {
    heading:
      "Вы услышите пять высказываний, обозначенных буквами А, B, C, D, E.",
    hint: "В задании 5 подберите к каждому высказыванию соответствующую рубрику из списка 1–6. Каждую рубрику можно использовать только один раз.",
  },
  gap_fill: {
    heading: "Вы услышите интервью. Занесите данные в таблицу.",
    hint: "В заданиях 6–11 впишите не более одного слова (без артиклей) из прозвучавшего текста. Числа необходимо записывать буквами.",
  },
};

export const READING_INSTRUCTIONS: Record<ReadingTaskType, TaskInstruction> = {
  matching: {
    heading: "Установите соответствие между текстами и заголовками.",
    hint: "Каждому тексту подберите один подходящий вопрос-заголовок. Один заголовок останется лишним.",
  },
  true_false: {
    heading:
      "Прочитайте текст и определите, какие из утверждений 13–19 соответствуют содержанию текста.",
    hint: "Для каждого утверждения выберите: 1 — True, 2 — False, 3 — Not stated.",
  },
};
