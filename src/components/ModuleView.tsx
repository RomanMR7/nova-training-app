import type { TrainingModule } from "../training-content";
import type { QuizScore } from "../lib/quiz";
import { getModuleDeepDive } from "../reference-content";

interface ModuleViewProps {
  module: TrainingModule;
  completed: boolean;
  canOpenScenario: boolean;
  quizScore?: QuizScore;
  onBack: () => void;
  onComplete: () => void;
  onOpenScenario: () => void;
  onOpenQuiz: () => void;
}

export function ModuleView({
  module,
  completed,
  canOpenScenario,
  quizScore,
  onBack,
  onComplete,
  onOpenScenario,
  onOpenQuiz
}: ModuleViewProps) {
  const deepDive = getModuleDeepDive(module.id);

  return (
    <section className="screen-stack" aria-labelledby="module-title">
      <div className="module-header">
        <button className="ghost-button" type="button" onClick={onBack}>
          К дашборду
        </button>
        <span className={`status-pill ${completed ? "done" : ""}`}>
          {completed ? "Завершен" : "В процессе"}
        </span>
      </div>

      <div className="section-heading">
        <p className="eyebrow">Модуль</p>
        <h1 id="module-title">{module.title}</h1>
        <p>{module.explanation}</p>
      </div>

      <div className="content-layout">
        {deepDive ? (
          <section className="content-panel module-deep-dive" aria-labelledby="deep-title">
            <h2 id="deep-title">Рабочая карточка</h2>
            <p>{deepDive.purpose}</p>
            <dl className="definition-list">
              <dt>Кто использует</dt>
              <dd>{deepDive.users.join(", ")}</dd>
              <dt>Экран и карточка</dt>
              <dd>
                {deepDive.screen} → {deepDive.card}
              </dd>
              <dt>Эскалация</dt>
              <dd>{deepDive.escalationRule}</dd>
              <dt>Мини-пример</dt>
              <dd>{deepDive.miniExample}</dd>
            </dl>
            <div className="module-guide-grid">
              <GuideList title="Поля" items={deepDive.fieldsToCheck} />
              <GuideList title="Разрешено" items={deepDive.allowedActions} />
              <GuideList title="Блокируется" items={deepDive.blockedActions} />
              <GuideList title="Проверить после" items={deepDive.verifyAfterAction} />
            </div>
          </section>
        ) : null}

        <section className="content-panel" aria-labelledby="steps-title">
          <h2 id="steps-title">Практические шаги</h2>
          <ol className="rich-list">
            {module.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="content-panel" aria-labelledby="mistakes-title">
          <h2 id="mistakes-title">Частые ошибки</h2>
          <ul className="rich-list">
            {module.mistakes.map((mistake) => (
              <li key={mistake}>{mistake}</li>
            ))}
          </ul>
        </section>

        <section className="content-panel" aria-labelledby="checklist-title">
          <h2 id="checklist-title">Чеклист</h2>
          <ul className="check-list">
            {module.checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <div className="action-strip">
        {module.scenario && canOpenScenario ? (
          <button className="secondary-button" type="button" onClick={onOpenScenario}>
            Открыть симулятор
          </button>
        ) : null}
        <button className="secondary-button" type="button" onClick={onOpenQuiz}>
          {quizScore ? `Квиз пройден на ${quizScore.percentage}%` : "Пройти мини-квиз"}
        </button>
        <button className="primary-button" type="button" onClick={onComplete}>
          Отметить модуль завершенным
        </button>
      </div>
    </section>
  );
}

function GuideList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="nested-section">
      <h3>{title}</h3>
      <ul className="rich-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
