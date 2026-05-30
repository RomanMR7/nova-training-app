import { useState } from "react";
import { finalCertificationQuiz, roleFinalExams } from "../reference-content";
import type { QuizAnswers, QuizScore } from "../lib/quiz";
import { scoreQuiz } from "../lib/quiz";
import type { Role } from "../training-content";
import { roles } from "../training-content";
import {
  getAccessibleRoles,
  isTrainingAdmin,
  type TrainingSessionUser
} from "../training-users";

interface FinalCertificationQuizProps {
  currentUser: TrainingSessionUser;
  role: Role | null;
  previousScore?: QuizScore;
  getPreviousScore: (role: Role) => QuizScore | undefined;
  onBack: () => void;
  onSubmitScore: (score: QuizScore, role: Role) => void;
}

type ExamId = Role | "all";

export function FinalCertificationQuiz({
  currentUser,
  role,
  previousScore,
  getPreviousScore,
  onBack,
  onSubmitScore
}: FinalCertificationQuizProps) {
  const isAdmin = isTrainingAdmin(currentUser);
  const accessibleRoles = getAccessibleRoles(currentUser);
  const initialExam: ExamId = role ?? accessibleRoles[0] ?? "Администратор";
  const [selectedExam, setSelectedExam] = useState<ExamId>(initialExam);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [score, setScore] = useState<QuizScore | null>(null);
  const questions =
    selectedExam === "all" ? finalCertificationQuiz : roleFinalExams[selectedExam];
  const scoreRole: Role = selectedExam === "all" ? "Администратор" : selectedExam;
  const activeScore =
    score ?? (selectedExam === role ? previousScore : getPreviousScore(scoreRole));

  function handleExamChange(nextExam: ExamId) {
    setSelectedExam(nextExam);
    setAnswers({});
    setScore(null);
  }

  function handleSubmit() {
    const nextScore = scoreQuiz(questions, answers);
    setScore(nextScore);
    onSubmitScore(nextScore, scoreRole);
  }

  return (
    <section className="screen-stack" aria-labelledby="cert-title">
      <div className="module-header">
        <button className="ghost-button" type="button" onClick={onBack}>
          К дашборду
        </button>
        {activeScore ? (
          <span className="status-pill done">{activeScore.percentage}%</span>
        ) : null}
      </div>

      <div className="section-heading">
        <p className="eyebrow">Финальная проверка</p>
        <h1 id="cert-title">Учебный результат Anchor Pay</h1>
        <p>
          Ролевой экзамен проверяет сценарии, статусы, эскалации и безопасные
          действия. Результат сохраняется локально для текущего пользователя и
          роли.
        </p>
      </div>

      {isAdmin ? (
        <div className="exam-selector">
          <label>
            <span>Экзамен</span>
            <select
              aria-label="Выберите финальный экзамен"
              value={selectedExam}
              onChange={(event) => handleExamChange(event.target.value as ExamId)}
            >
              {roles.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
              <option value="all">Общий экзамен по всем ролям</option>
            </select>
          </label>
          <p>
            Администратор может пройти любой ролевой маршрут. Общий экзамен
            остается дополнительной проверкой по всем ролям.
          </p>
        </div>
      ) : (
        <div className="exam-selector">
          <span className="role-badge">{scoreRole}</span>
          <p>Учебный аккаунт видит только экзамен своей роли.</p>
        </div>
      )}

      <div className="quiz-list">
        {questions.map((question, questionIndex) => {
          const selected = answers[question.id];
          const showExplanation = Boolean(score) && selected !== question.correctOptionId;

          return (
            <fieldset className="quiz-question" key={question.id}>
              <legend>
                {questionIndex + 1}. {question.question}
              </legend>
              {question.options.map((option) => (
                <label className="radio-row" key={option.id}>
                  <input
                    checked={selected === option.id}
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
              {showExplanation ? (
                <p className="question-explanation">
                  Правильный ответ:{" "}
                  {
                    question.options.find(
                      (option) => option.id === question.correctOptionId
                    )?.text
                  }
                  . {question.explanation}
                </p>
              ) : null}
            </fieldset>
          );
        })}
      </div>

      {score ? (
        <div className="result-panel" role="status">
          <h2>Итоговый результат</h2>
          <p>
            Верно {score.correct} из {score.total}. Итог: {score.percentage}%.
          </p>
          <p>
            {score.percentage >= 80
              ? "Учебная проверка пройдена. Следующий шаг — практика под наблюдением наставника."
              : "Нужно повторить справочник, статусы и спорные сценарии, затем пройти проверку снова."}
          </p>
        </div>
      ) : null}

      <button
        className="primary-button"
        type="button"
        onClick={handleSubmit}
        disabled={Object.keys(answers).length < questions.length}
      >
        Проверить учебный результат
      </button>
    </section>
  );
}
