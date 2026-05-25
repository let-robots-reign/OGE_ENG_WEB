import styles from "@/app/_components/TrainingPage.module.css";

export const processFeedback = (text: string): string => {
  if (!text) return "";
  return text
    .replace(
      /INCORRECT\[(.*?)\]/g,
      `<span class="${styles.incorrectAnswer}">$1</span>`,
    )
    .replace(
      /CORRECT\[(.*?)\]/g,
      `<span class="${styles.correctAnswer}">$1</span>`,
    );
};
