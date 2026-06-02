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
  canOpenAdminPanel: boolean;
  onOpenAdminPanel: () => void;
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
  canOpenAdminPanel,
  onOpenAdminPanel,
  onChangeRole
}: DashboardProps) {
  const [query, setQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const completedCount = modules.filter((module) =>
    progress.completedModules.includes(module.id)
  ).length;
  const percent =
    modules.length === 0 ? 0 : Math.round((completedCount / modules.length) * 100);
  const remainingCount = Math.max(modules.length - completedCount, 0);
  const nextModule = modules.find(
    (module) => !progress.completedModules.includes(module.id)
  );
  const scenarioModules = modules.filter((module) => module.scenario);
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
          <p className="eyebrow">Anchor Pay training simulator</p>
          <h1 id="dashboard-title">Учебная смена</h1>
          <p>
            Рабочий маршрут для роли <strong>{role}</strong>. Все операции
            учебные: без реальных денег, production-пользователей и платежных
            API. Прогресс может храниться локально или синхронизироваться в
            учебном Supabase.
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
            Финальная проверка
          </button>
          {canOpenAdminPanel ? (
            <button className="secondary-button" type="button" onClick={onOpenAdminPanel}>
              Админ-панель
            </button>
          ) : null}
          <button className="primary-button" type="button" onClick={onOpenFinal}>
            Итоги
          </button>
        </div>
      </div>

      <section className="dashboard-section today-panel" aria-labelledby="today-title">
        <div className="section-heading">
          <p className="eyebrow">Сегодня в обучении</p>
          <h2 id="today-title">Безопасная практика PSP-процессов</h2>
          <p>
            Начните с следующего модуля, затем закрепите решение в симуляции и
            проверьте себя в финальной проверке.
          </p>
        </div>
        <div className="today-grid">
          <article className="dock-card">
            <span className="metric">{remainingCount}</span>
            <span>модулей осталось</span>
          </article>
          <article className="dock-card">
            <span className="metric">{scenarioModules.length}</span>
            <span>симуляций доступно</span>
          </article>
          <article className="dock-card">
            <span className="metric">{percent}%</span>
            <span>прогресс маршрута</span>
          </article>
          <article className="dock-card next-card">
            <strong>{nextModule?.title ?? "Маршрут закрыт"}</strong>
            <span>
              {nextModule
                ? "Следующий учебный модуль по роли"
                : "Можно перейти к повторению и финальной проверке"}
            </span>
            {nextModule ? (
              <button
                className="primary-button"
                type="button"
                onClick={() => onOpenModule(nextModule.id)}
              >
                Открыть модуль
              </button>
            ) : (
              <button className="primary-button" type="button" onClick={onOpenCertification}>
                Финальная проверка
              </button>
            )}
          </article>
        </div>
      </section>

      <section className="dashboard-section progress-panel" aria-label="Прогресс">
        <div className="progress-label">
          <span>Прогресс</span>
          <strong>{completedCount} из {modules.length} модулей</strong>
        </div>
        <div className="progress-track" aria-hidden="true">
          <span style={{ width: `${percent}%` }} />
        </div>
      </section>

      <section className="dashboard-section" aria-labelledby="route-title">
        <div className="module-card-head">
          <div>
            <p className="eyebrow">Мой маршрут</p>
            <h2 id="route-title">Учебные модули роли</h2>
          </div>
          <span className="role-badge">{role}</span>
        </div>

        <div className="reference-toolbar">
        <label>
          <span>Поиск по модулям</span>
          <input
            aria-label="Поиск по модулям"
            placeholder="verification, shop, device, api_key..."
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

      <section className="dashboard-section" aria-labelledby="sim-title">
        <div className="module-card-head">
          <div>
            <p className="eyebrow">Практические симуляции</p>
            <h2 id="sim-title">Решения без риска для денег и данных</h2>
          </div>
          <span className="status-pill">{scenarioModules.length} сценариев</span>
        </div>
        <div className="simulation-strip">
          {scenarioModules.slice(0, 4).map((module) => (
            <button
              className="simulation-teaser"
              key={module.id}
              type="button"
              onClick={() => onOpenModule(module.id)}
            >
              <strong>{module.scenario?.title ?? module.title}</strong>
              <span>{module.title}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="dashboard-section action-harbor" aria-label="Справочник и финальная проверка">
        <button className="quick-link" type="button" onClick={onOpenReference}>
          <strong>Справочник</strong>
          <span>Статусы, роли, процессы, ошибки, эскалации и шпаргалка</span>
        </button>
        <button className="quick-link" type="button" onClick={onOpenCertification}>
          <strong>Финальная проверка</strong>
          <span>Ролевой учебный результат сохраняется в текущем режиме</span>
        </button>
        <button className="quick-link" type="button" onClick={onOpenFinal}>
          <strong>Прогресс</strong>
          <span>Завершенные модули, квизы, симуляции и результат проверки</span>
        </button>
        {canOpenAdminPanel ? (
          <button className="quick-link" type="button" onClick={onOpenAdminPanel}>
            <strong>Сотрудники и статистика</strong>
            <span>Создание аккаунтов, блокировки, роли, CSV и общий прогресс</span>
          </button>
        ) : null}
      </section>
    </section>
  );
}
