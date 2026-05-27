import { useMemo, useState } from "react";
import type { Role } from "../training-content";
import {
  decisionTrees,
  processMaps,
  quickReference,
  rolePlaybooks,
  roleSimulations,
  statusGlossary,
  trainingCases
} from "../reference-content";
import {
  canAccessRole,
  getAccessibleRoles,
  isTrainingAdmin,
  type TrainingSessionUser
} from "../training-users";

type ReferenceTab =
  | "playbooks"
  | "statuses"
  | "processes"
  | "decisions"
  | "simulations"
  | "cases"
  | "cheatsheet";

const tabs: Array<{ id: ReferenceTab; label: string }> = [
  { id: "playbooks", label: "Роли" },
  { id: "statuses", label: "Статусы" },
  { id: "processes", label: "Процессы" },
  { id: "decisions", label: "Если → то" },
  { id: "simulations", label: "Симуляции" },
  { id: "cases", label: "Кейсы" },
  { id: "cheatsheet", label: "Шпаргалка" }
];

interface ReferenceCenterProps {
  currentUser: TrainingSessionUser;
  role: Role | null;
  onBack: () => void;
}

function matchesSearch(values: string[], query: string) {
  if (!query.trim()) {
    return true;
  }

  const normalizedQuery = query.trim().toLocaleLowerCase("ru-RU");
  return values.some((value) =>
    value.toLocaleLowerCase("ru-RU").includes(normalizedQuery)
  );
}

export function ReferenceCenter({ currentUser, role, onBack }: ReferenceCenterProps) {
  const [activeTab, setActiveTab] = useState<ReferenceTab>("playbooks");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "Все">(role ?? "Все");
  const isAdmin = isTrainingAdmin(currentUser);
  const accessibleRoles = getAccessibleRoles(currentUser);
  const effectiveRoleFilter = isAdmin ? roleFilter : role ?? accessibleRoles[0];

  const filteredPlaybooks = useMemo(
    () =>
      rolePlaybooks.filter(
        (playbook) =>
          canAccessRole(currentUser, playbook.role) &&
          (effectiveRoleFilter === "Все" || playbook.role === effectiveRoleFilter) &&
          matchesSearch(
            [
              playbook.role,
              playbook.responsibility,
              ...playbook.firstChecks,
              ...playbook.dailyTasks,
              ...playbook.attentionStatuses,
              ...playbook.escalation
            ],
            query
          )
      ),
    [currentUser, effectiveRoleFilter, query]
  );

  const filteredSimulations = useMemo(
    () =>
      roleSimulations.filter(
        (simulation) =>
          canAccessRole(currentUser, simulation.role) &&
          (effectiveRoleFilter === "Все" || simulation.role === effectiveRoleFilter) &&
          matchesSearch(
            [
              simulation.title,
              simulation.role,
              simulation.situation,
              simulation.task,
              ...simulation.steps,
              ...simulation.choices.map((choice) => choice.text),
              simulation.explanation,
              simulation.expectedResult,
              simulation.commonWrongAction
            ],
            query
          )
      ),
    [currentUser, effectiveRoleFilter, query]
  );

  const filteredStatuses = useMemo(
    () =>
      statusGlossary.filter((status) =>
        matchesSearch(
          [
            status.group,
            status.code,
            status.label,
            status.meaning,
            status.visibleTo,
            status.changedBy,
            status.nextAction,
            status.commonMistake
          ],
          query
        )
      ),
    [query]
  );

  const filteredCases = useMemo(
    () =>
      trainingCases.filter(
        (item) =>
          canAccessRole(currentUser, item.role) &&
          (effectiveRoleFilter === "Все" || item.role === effectiveRoleFilter) &&
          matchesSearch(
            [
              item.title,
              item.situation,
              item.role,
              ...item.inspect,
              item.correctAction,
              item.incorrectAction,
              item.expectedResult
            ],
            query
          )
      ),
    [currentUser, effectiveRoleFilter, query]
  );

  const filteredProcesses = useMemo(
    () =>
      processMaps.filter((process) =>
        matchesSearch([process.title, ...process.steps, process.result], query)
      ),
    [query]
  );

  const filteredDecisions = useMemo(
    () =>
      decisionTrees.filter((tree) =>
        matchesSearch([tree.situation, ...tree.rules, tree.escalation], query)
      ),
    [query]
  );

  return (
    <section className="screen-stack" aria-labelledby="reference-title">
      <div className="module-header">
        <button className="ghost-button" type="button" onClick={onBack}>
          К дашборду
        </button>
        {role ? <span className="role-badge">{role}</span> : null}
      </div>

      <div className="section-heading">
        <p className="eyebrow">Справочник сотрудника</p>
        <h1 id="reference-title">Как работать в Nova</h1>
        <p>
          Быстрые ответы по ролям, статусам, процессам, спорным ситуациям и
          безопасным действиям. Все примеры учебные.
        </p>
      </div>

      <div className="reference-toolbar">
        <label>
          <span>Поиск</span>
          <input
            aria-label="Поиск по справочнику"
            placeholder="Статус, роль, webhook, ledger..."
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        {isAdmin ? (
          <label>
            <span>Роль</span>
            <select
              aria-label="Фильтр по роли"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as Role | "Все")}
            >
              <option>Все</option>
              {rolePlaybooks.map((playbook) => (
                <option key={playbook.role}>{playbook.role}</option>
              ))}
            </select>
          </label>
        ) : (
          <div className="locked-filter">
            <span>Роль</span>
            <strong>{role ?? accessibleRoles[0]}</strong>
          </div>
        )}
      </div>

      <div className="tab-row" role="tablist" aria-label="Разделы справочника">
        {tabs.map((tab) => (
          <button
            aria-selected={activeTab === tab.id}
            className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
            key={tab.id}
            role="tab"
            type="button"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "playbooks" ? (
        <div className="reference-grid">
          {filteredPlaybooks.map((playbook) => (
            <article className="reference-card wide" key={playbook.role}>
              <div className="module-card-head">
                <h2>{playbook.role}</h2>
                <span className="status-pill">Рабочий день</span>
              </div>
              <p>{playbook.responsibility}</p>
              <ReferenceList title="Что проверить после входа" items={playbook.firstChecks} />
              <ReferenceList title="Ежедневные задачи" items={playbook.dailyTasks} />
              <ReferenceList title="Что не делать" items={playbook.forbidden} />
              <ReferenceList
                title="Статусы с вниманием"
                items={playbook.attentionStatuses}
              />
              <ReferenceList title="Когда эскалировать" items={playbook.escalation} />
              <ReferenceList
                title="Чеклист в конце дня"
                items={playbook.endOfDayChecklist}
              />
              <section className="nested-section" aria-label="Как объяснить">
                <h3>Как объяснить коллеге или клиенту</h3>
                <p>{playbook.explainToColleague}</p>
              </section>
            </article>
          ))}
        </div>
      ) : null}

      {activeTab === "statuses" ? (
        <div className="status-grid">
          {filteredStatuses.map((status) => (
            <article className="reference-card" key={`${status.group}-${status.code}`}>
              <div className="module-card-head">
                <span className="status-pill">{status.group}</span>
                <strong>{status.code}</strong>
              </div>
              <h2>{status.label}</h2>
              <p>{status.meaning}</p>
              <dl className="definition-list">
                <dt>Кто видит</dt>
                <dd>{status.visibleTo}</dd>
                <dt>Кто меняет</dt>
                <dd>{status.changedBy}</dd>
                <dt>Следующее действие</dt>
                <dd>{status.nextAction}</dd>
                <dt>Частая ошибка</dt>
                <dd>{status.commonMistake}</dd>
              </dl>
            </article>
          ))}
        </div>
      ) : null}

      {activeTab === "processes" ? (
        <div className="reference-grid">
          {filteredProcesses.map((process) => (
            <article className="reference-card" key={process.id}>
              <h2>{process.title}</h2>
              <div className="process-map">
                {process.steps.map((step) => (
                  <span key={step}>{step}</span>
                ))}
              </div>
              <p className="result-note">{process.result}</p>
            </article>
          ))}
        </div>
      ) : null}

      {activeTab === "decisions" ? (
        <div className="reference-grid">
          {filteredDecisions.map((tree) => (
            <article className="reference-card" key={tree.id}>
              <h2>{tree.situation}</h2>
              <ol className="decision-list">
                {tree.rules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ol>
              <p className="result-note">{tree.escalation}</p>
            </article>
          ))}
        </div>
      ) : null}

      {activeTab === "cases" ? (
        <div className="reference-grid">
          {filteredCases.map((item) => (
            <article className="reference-card" key={item.id}>
              <div className="module-card-head">
                <h2>{item.title}</h2>
                <span className="role-badge">{item.role}</span>
              </div>
              <p>{item.situation}</p>
              <ReferenceList title="Что смотреть" items={item.inspect} />
              <dl className="definition-list">
                <dt>Правильное действие</dt>
                <dd>{item.correctAction}</dd>
                <dt>Неверное действие</dt>
                <dd>{item.incorrectAction}</dd>
                <dt>Ожидаемый результат</dt>
                <dd>{item.expectedResult}</dd>
              </dl>
            </article>
          ))}
        </div>
      ) : null}

      {activeTab === "simulations" ? (
        <div className="reference-grid">
          {filteredSimulations.map((simulation) => {
            const correctChoice = simulation.choices.find(
              (choice) => choice.id === simulation.correctChoiceId
            );

            return (
              <article className="reference-card simulation-card" key={simulation.id}>
                <div className="module-card-head">
                  <h2>{simulation.title}</h2>
                  <span className="role-badge">{simulation.role}</span>
                </div>
                <p>{simulation.situation}</p>
                <ReferenceList title="Задача" items={[simulation.task]} />
                <ReferenceList title="Шаги ученика" items={simulation.steps} />
                <section className="nested-section" aria-label="Варианты действий">
                  <h3>Варианты действий</h3>
                  <ul className="choice-list">
                    {simulation.choices.map((choice) => (
                      <li
                        className={
                          choice.id === simulation.correctChoiceId ? "is-correct" : ""
                        }
                        key={choice.id}
                      >
                        {choice.text}
                      </li>
                    ))}
                  </ul>
                </section>
                <dl className="definition-list">
                  <dt>Правильный выбор</dt>
                  <dd>{correctChoice?.text ?? simulation.correctChoiceId}</dd>
                  <dt>Почему</dt>
                  <dd>{simulation.explanation}</dd>
                  <dt>Ожидаемый результат</dt>
                  <dd>{simulation.expectedResult}</dd>
                  <dt>Частая ошибка</dt>
                  <dd>{simulation.commonWrongAction}</dd>
                </dl>
              </article>
            );
          })}
        </div>
      ) : null}

      {activeTab === "cheatsheet" ? (
        <div className="reference-grid">
          {quickReference.map((section) => (
            <article className="reference-card" key={section.title}>
              <ReferenceList title={section.title} items={section.items} />
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ReferenceList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="nested-section" aria-label={title}>
      <h3>{title}</h3>
      <ul className="rich-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
