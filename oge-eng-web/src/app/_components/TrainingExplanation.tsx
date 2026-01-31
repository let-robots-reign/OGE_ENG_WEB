import styles from "./TrainingExplanation.module.css";

type TrainingExplanationProps = {
  userAnswers: (string | null)[];
  correctAnswers: number[];
  explanation: string;
  headings: string[];
};

function injectAccentTag(
  text: string,
  accentChar: string,
  tag: string,
): string {
  const regex = new RegExp(`\\${accentChar}(.*?)\\${accentChar}`, "g");
  return text.replace(regex, `<${tag}>$1</${tag}>`);
}

export function TrainingExplanation({
  userAnswers,
  correctAnswers,
  explanation,
  headings,
}: TrainingExplanationProps) {
  const explanationsArray = explanation
    .split("\n---")
    .map((exp) => injectAccentTag(exp, "|", "strong"));

  const cleanUserAnswer = (answer: string | null | undefined) => {
    if (answer === null || answer === "" || answer === undefined) {
      return "Нет ответа";
    }
    const headingIndex = Number(answer) - 1;
    if (headings[headingIndex]) {
      return `${answer}. ${headings[headingIndex]}`;
    }
    return answer;
  };

  return (
    <div>
      {explanationsArray.map((exp, index) => {
        const correctAnswerNumber = correctAnswers[index];
        const userAnswer = userAnswers[index];

        return (
          <div key={index} className={styles.explanation}>
            <p>
              <span
                className={
                  parseInt(userAnswer ?? "") === correctAnswerNumber
                    ? styles.right
                    : styles.wrong
                }
              >
                <strong>{index + 1})</strong> {cleanUserAnswer(userAnswer)}
              </span>
            </p>
            <p>
              Правильный ответ:{" "}
              <strong>
                {correctAnswerNumber !== undefined
                  ? headings[correctAnswerNumber]
                  : "Нет данных"}
              </strong>
            </p>
            <p>
              <b>Пояснение:</b>
            </p>
            <p dangerouslySetInnerHTML={{ __html: exp }}></p>
          </div>
        );
      })}
    </div>
  );
}
