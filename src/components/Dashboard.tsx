import { useMemo, useState } from "react";
import type { Role, TrainingModule } from "../training-content";
import type { TrainingProgress } from "../lib/progress";

interface DashboardProps {
  role: Role;
  modules: TrainingModule[];
  progress: TrainingProgress;
  canChangeRole: boolean;
  onOpenModule: (moduleId: string) => void;
  onOpenFinal: () => void;
  onOpenReference: () => void;
  onOpenCertification: () => void;
  onChangeRole: () => void;
}

export function Dashboard({
  role,
  modules,
  progress,
  canChangeRole,
  onOpenModule,
  onOpenFinal,
  onOpenReference,
  onOpenCertification,
  onChangeRole
}: DashboardProps) {
  const [query, setQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const completedCount = modules.filter((module) =>
    progress.completedModules.includes(module.id)
  ).length;
  const percent =
    modules.length === 0 ? 0 : Math.round((completedCount / modules.length) * 100);
  const visibleModules = useMemo(
    () =>
      modules.filter((module) => {
        const queryMatch =
          !query.trim() ||
          [module.title, module.explanation, ...module.steps, ...module.mistakes]
            .join(" ")
            .toLocaleLowerCase("ru-RU")
            .includes(query.trim().toLocaleLowerCase("ru-RU"));
        const completed = progress.completedModules.includes(module.id);
        const filterMatch =
          moduleFilter === "all" ||
          (moduleFilter === "scenario" && Boolean(module.scenario)) ||
          (moduleFilter === "completed" && completed) ||
          (moduleFilter === "quiz-missing" && !progress.quizScores[module.id]);

        return queryMatch && filterMatch;
      }),
    [moduleFilter, modules, progress.completedModules, progress.quizScores, query]
  );

  return (
    <section className="screen-stack" aria-labelledby="dashboard-title">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">Учебный дашборд</p>
          <h1 id="dashboard-title">План обучения</h1>
          <p>
            Показаны модули для роли <strong>{role}</strong>. Все сценарии
            работают только с мок-данными.
          </p>
        </div>
        <div className="dashboard-actions">
          {canChangeRole ? (
            <button className="secondary-button" type="button" onClick={onChangeRole}>
              Сменить роль
            </button>
          ) : null}
          <button className="secondary-button" type="button" onClick={onOpenReference}>
            Справочник
          </button>
          <button className="secondary-button" type="button" onClick={onOpenCertification}>
            Сертификация
          </button>
          <button className="primary-button" type="button" onClick={onOpenFinal}>
            Итоги
          </button>
        </div>
      </div>

      <div className="progress-panel" aria-label="Прогресс обучения">
        <div className="progress-label">
          <span>{completedCount} из {modules.length} модулей завершено</span>
          <strong>{percent}%</strong>
        </div>
        <div className="progress-track" aria-hidden="true">
          <span style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="reference-toolbar">
        <label>
          <span>Поиск по модулям</span>
          <input
            aria-label="Поиск по модулям"
            placeholder="ledger, апелляция, webhook, статус..."
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label>
          <span>Фильтр</span>
          <select
            aria-label="Фильтр модулей"
            value={moduleFilter}
            onChange={(event) => setModuleFilter(event.target.value)}
          >
            <option value="all">Все модули роли</option>
            <option value="scenario">Со сценарием</option>
            <option value="quiz-missing">Квиз не пройден</option>
            <option value="completed">Завершенные</option>
          </select>
        </label>
      </div>

      <div className="quick-link-grid" aria-label="Быстрые ссылки">
        <button className="quick-link" type="button" onClick={onOpenReference}>
          <strong>Статусы и процессы</strong>
          <span>Глоссарий, карты процессов, деревья решений</span>
        </button>
        <button className="quick-link" type="button" onClick={onOpenReference}>
          <strong>Кейсы и шпаргалка</strong>
          <span>10 мок-ситуаций и правила безопасности</span>
        </button>
        <button className="quick-link" type="button" onClick={onOpenCertification}>
          <strong>Финальный квиз</strong>
          <span>Ролевой экзамен, результат сохраняется локально</span>
        </button>
      </div>

      <div className="module-grid">
        {visibleModules.map((module) => {
          const completed = progress.completedModules.includes(module.id);
          const quizScore = progress.quizScores[module.id];

          return (
            <article className="module-card" key={module.id}>
              <div className="module-card-head">
                <span className={`status-pill ${completed ? "done" : ""}`}>
                  {completed ? "Завершен" : "В плане"}
                </span>
                {module.scenario ? <span className="status-pill">Сценарий</span> : null}
              </div>
              <h2>{module.title}</h2>
              <p>{module.explanation}</p>
              <div className="module-meta">
                <span>{module.quiz.length} вопроса</span>
                <span>
                  {quizScore ? `Квиз: ${quizScore.percentage}%` : "Квиз не пройден"}
                </span>
              </div>
              <button
                className="secondary-button full-width"
                type="button"
                onClick={() => onOpenModule(module.id)}
              >
                Открыть модуль
              </button>
            </article>
          );
        })}
      </div>
      {visibleModules.length === 0 ? (
        <div className="content-panel" role="status">
          <h2>Ничего не найдено</h2>
          <p>Измените поисковый запрос или фильтр модулей.</p>
        </div>
      ) : null}
    </section>
  );
}
