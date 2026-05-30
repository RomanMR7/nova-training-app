import type { Role, TrainingModule } from "../training-content";
import type { TrainingProgress } from "../lib/progress";
import type { QuizScore } from "../lib/quiz";

interface FinalResultProps {
  role: Role;
  modules: TrainingModule[];
  progress: TrainingProgress;
  storageLabel: string;
  onBack: () => void;
}

export function FinalResult({
  role,
  modules,
  progress,
  storageLabel,
  onBack
}: FinalResultProps) {
  const completedModules = modules.filter((module) =>
    progress.completedModules.includes(module.id)
  );
  const scores = modules
    .map((module) => progress.quizScores[module.id])
    .filter((score): score is QuizScore => Boolean(score));
  const averageScore =
    scores.length === 0
      ? 0
      : Math.round(
          scores.reduce((sum, score) => sum + score.percentage, 0) / scores.length
        );

  return (
    <section className="screen-stack" aria-labelledby="final-title">
      <div className="module-header">
        <button className="ghost-button" type="button" onClick={onBack}>
          К дашборду
        </button>
        <span className="role-badge">{role}</span>
      </div>

      <div className="section-heading">
        <p className="eyebrow">Итоги</p>
        <h1 id="final-title">Прогресс обучения</h1>
        <p>{storageLabel}</p>
      </div>

      <div className="result-grid">
        <div className="result-card">
          <span className="metric">{completedModules.length}</span>
          <span>завершено из {modules.length}</span>
        </div>
        <div className="result-card">
          <span className="metric">{averageScore}%</span>
          <span>средний результат квизов</span>
        </div>
        <div className="result-card">
          <span className="metric">
            {modules.filter((module) => module.scenario).length}
          </span>
          <span>доступных симуляторов</span>
        </div>
        <div className="result-card">
          <span className="metric">
            {progress.finalQuizScore ? `${progress.finalQuizScore.percentage}%` : "0%"}
          </span>
          <span>финальная проверка</span>
        </div>
      </div>

      <section className="content-panel" aria-labelledby="completed-title">
        <h2 id="completed-title">Завершенные модули</h2>
        {completedModules.length > 0 ? (
          <ul className="check-list">
            {completedModules.map((module) => (
              <li key={module.id}>{module.title}</li>
            ))}
          </ul>
        ) : (
          <p>Пока нет завершенных модулей.</p>
        )}
      </section>
    </section>
  );
}
