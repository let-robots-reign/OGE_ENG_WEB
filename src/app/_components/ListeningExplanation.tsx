type ListeningExplanationProps = {
  userAnswers: (number | null)[];
  correctAnswers: number[];
  explanation: string[];
  questions: {
    question: string | undefined;
    options: string[];
  }[];
};

function injectAccentTag(
  text: string,
  accentChar: string,
  tag: string,
): string {
  const regex = new RegExp(`\\${accentChar}(.*?)\\${accentChar}`, "g");
  return text.replace(regex, `<${tag}>$1</${tag}>`);
}

export function ListeningExplanation({
  userAnswers,
  correctAnswers,
  explanation,
  questions,
}: ListeningExplanationProps) {
  const explanationsArray = explanation.map((exp) =>
    injectAccentTag(exp, "|", "strong"),
  );

  const getOptionText = (
    questionIndex: number,
    optionIndex: number | null | undefined,
  ) => {
    if (optionIndex === null || optionIndex === undefined) return "Нет ответа";
    return questions[questionIndex]?.options[optionIndex - 1] ?? "Нет ответа";
  };

  return (
    <div>
      {questions.map((q, index) => {
        const correctAnswer = correctAnswers[index];
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === correctAnswer;

        return (
          <div
            key={index}
            className="my-4 border-b border-line pb-4 text-[18px] last:border-b-0 [&_p]:mb-2"
          >
            <p>
              <strong>{index + 1})</strong> {q.question}
            </p>
            <p>
              <span className={isCorrect ? "text-ok" : "text-err"}>
                Ваш ответ: {getOptionText(index, userAnswer)}
              </span>
            </p>
            {!isCorrect && (
              <p>Правильный ответ: {getOptionText(index, correctAnswer)}</p>
            )}
            <p>
              <b>Пояснение:</b>
            </p>
            <p
              dangerouslySetInnerHTML={{
                __html: explanationsArray[index] ?? "",
              }}
            ></p>
          </div>
        );
      })}
    </div>
  );
}
