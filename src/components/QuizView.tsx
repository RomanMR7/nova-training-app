import { useState } from "react";
import type { TrainingModule } from "../training-content";
import { type QuizAnswers, type QuizScore, isPassingScore, scoreQuiz } from "../lib/quiz";

interface QuizViewProps {
  module: TrainingModule;
  previousScore?: QuizScore;
  onBack: () => void;
  onSubmitScore: (score: QuizScore) => void;
}

export function QuizView({
  module,
  previousScore,
  onBack,
  onSubmitScore
}: QuizViewProps) {
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [score, setScore] = useState<QuizScore | null>(null);

  function handleSubmit() {
    const nextScore = scoreQuiz(module.quiz, answers);
    setScore(nextScore);
    onSubmitScore(nextScore);
  }

  const activeScore = score ?? previousScore;

  return (
    <section className="screen-stack" aria-labelledby="quiz-title">
      <div className="module-header">
        <button className="ghost-button" type="button" onClick={onBack}>
          К модулю
        </button>
        {activeScore ? (
          <span className={`status-pill ${isPassingScore(activeScore) ? "done" : ""}`}>
            {activeScore.percentage}%
          </span>
        ) : null}
      </div>

      <div className="section-heading">
        <p className="eyebrow">Мини-квиз</p>
        <h1 id="quiz-title">{module.title}</h1>
        <p>Ответьте на вопросы. Результат сохранится в localStorage.</p>
      </div>

      <div className="quiz-list">
        {module.quiz.map((question, questionIndex) => (
          <fieldset className="quiz-question" key={question.id}>
            <legend>
              {questionIndex + 1}. {question.question}
            </legend>
            {question.options.map((option) => (
              <label className="radio-row" key={option.id}>
                <input
                  checked={answers[question.id] === option.id}
                  name={question.id}
                  type="radio"
                  value={option.id}
                  onChange={() =>
                    setAnswers((current) => ({
                      ...current,
                      [question.id]: option.id
                    }))
                  }
                />
                <span>{option.text}</span>
              </label>
            ))}
            {score ? (
              <p className="question-explanation">{question.explanation}</p>
            ) : null}
          </fieldset>
        ))}
      </div>

      {score ? (
        <div className="result-panel" role="status">
          <h2>Результат квиза</h2>
          <p>
            Верно {score.correct} из {score.total}. Итог: {score.percentage}%.
          </p>
          <p>
            {isPassingScore(score)
              ? "Отлично, можно двигаться дальше."
              : "Стоит вернуться к модулю и повторить ключевые шаги."}
          </p>
        </div>
      ) : null}

      <button
        className="primary-button"
        type="button"
        onClick={handleSubmit}
        disabled={Object.keys(answers).length < module.quiz.length}
      >
        Проверить ответы
      </button>
    </section>
  );
}

