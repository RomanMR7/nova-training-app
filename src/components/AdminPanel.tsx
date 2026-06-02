import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  callAdminTrainingUsers,
  downloadCsv,
  exportStatsCsv,
  isSupabaseConfigured,
  listTrainingStats,
  type TrainingStatsRow
} from "../lib/supabase";
import { roles } from "../training-content";
import {
  roleLabelToId,
  roleToLabel,
  type TrainingRoleId,
  type TrainingSessionUser
} from "../training-users";

interface AdminPanelProps {
  currentUser: TrainingSessionUser;
  onBack: () => void;
}

interface EmployeeFormState {
  email: string;
  displayName: string;
  role: TrainingRoleId;
  temporaryPassword: string;
  note: string;
}

const emptyEmployeeForm: EmployeeFormState = {
  email: "",
  displayName: "",
  role: "support",
  temporaryPassword: "",
  note: ""
};

export function AdminPanel({ currentUser, onBack }: AdminPanelProps) {
  const [rows, setRows] = useState<TrainingStatsRow[]>([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<EmployeeFormState>(emptyEmployeeForm);
  const [resetPasswords, setResetPasswords] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const configured = isSupabaseConfigured();

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return rows;
    }

    return rows.filter((row) =>
      [row.email, row.display_name, row.role, row.note]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [query, rows]);

  async function refreshStats() {
    if (!configured) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      const nextRows = await listTrainingStats(currentUser);
      setRows(nextRows);
      setStatus(`Статистика обновлена: ${nextRows.length} сотрудников.`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Не удалось загрузить статистику.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setStatus("");

    try {
      await callAdminTrainingUsers(
        currentUser,
        {
          action: "create",
          email: form.email,
          displayName: form.displayName,
          role: form.role,
          temporaryPassword: form.temporaryPassword,
          note: form.note
        },
        "POST"
      );
      setForm(emptyEmployeeForm);
      setStatus("Сотрудник создан. Передайте временный пароль вне этого приложения.");
      await refreshStats();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Не удалось создать сотрудника.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePatchUser(row: TrainingStatsRow, patch: Record<string, unknown>) {
    setLoading(true);
    setError("");
    setStatus("");

    try {
      await callAdminTrainingUsers(
        currentUser,
        {
          action: "update",
          id: row.id,
          ...patch
        },
        "PATCH"
      );
      setStatus("Профиль сотрудника обновлен.");
      await refreshStats();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Не удалось обновить сотрудника.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(row: TrainingStatsRow) {
    const temporaryPassword = resetPasswords[row.id];
    if (!temporaryPassword) {
      setError("Введите временный пароль для сброса.");
      return;
    }

    setLoading(true);
    setError("");
    setStatus("");
    try {
      await callAdminTrainingUsers(
        currentUser,
        {
          action: "resetPassword",
          authUserId: row.auth_user_id,
          temporaryPassword
        },
        "PATCH"
      );
      setResetPasswords((current) => ({ ...current, [row.id]: "" }));
      setStatus("Временный пароль обновлен. Он не сохраняется в приложении.");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Не удалось сбросить пароль.");
    } finally {
      setLoading(false);
    }
  }

  function handleExportCsv() {
    downloadCsv("anchor-pay-training-stats.csv", exportStatsCsv(filteredRows));
  }

  return (
    <section className="screen-stack" aria-labelledby="admin-title">
      <div className="module-header">
        <button className="ghost-button" type="button" onClick={onBack}>
          К дашборду
        </button>
        <span className="role-badge">ADMIN</span>
      </div>

      <div className="section-heading">
        <p className="eyebrow">Центр обучения</p>
        <h1 id="admin-title">Сотрудники и статистика</h1>
        <p>
          ADMIN создает учебные аккаунты, назначает роли, блокирует
          доступ и смотрит прогресс сотрудников. Пароли не экспортируются и не
          сохраняются в таблицах приложения.
        </p>
      </div>

      {!configured ? (
        <div className="access-denied">
          <h2>Supabase не настроен</h2>
          <p>
            Для централизованных аккаунтов нужны `VITE_SUPABASE_URL` и
            `VITE_SUPABASE_ANON_KEY` в Vercel. Offline fallback остается
            доступным через прямое открытие `index.html`.
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="feedback negative" role="alert">
          {error}
        </div>
      ) : null}
      {status ? (
        <div className="feedback positive" role="status">
          {status}
        </div>
      ) : null}

      <section className="dashboard-section" aria-labelledby="create-employee-title">
        <div className="module-card-head">
          <div>
            <p className="eyebrow">Аккаунты сотрудников</p>
            <h2 id="create-employee-title">Создать учебный аккаунт</h2>
          </div>
          <span className="status-pill">Supabase Auth</span>
        </div>
        <form className="admin-form" onSubmit={handleCreateEmployee}>
          <label>
            <span>Email</span>
            <input
              autoComplete="off"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
            />
          </label>
          <label>
            <span>Имя</span>
            <input
              autoComplete="off"
              value={form.displayName}
              onChange={(event) =>
                setForm((current) => ({ ...current, displayName: event.target.value }))
              }
            />
          </label>
          <label>
            <span>Роль</span>
            <select
              value={form.role}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  role: event.target.value as TrainingRoleId
                }))
              }
            >
              {roles.map((role) => (
                <option key={role} value={roleLabelToId[role]}>
                  {role}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Временный пароль</span>
            <input
              autoComplete="new-password"
              type="password"
              value={form.temporaryPassword}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  temporaryPassword: event.target.value
                }))
              }
            />
          </label>
          <label className="full-span">
            <span>Заметка</span>
            <input
              value={form.note}
              onChange={(event) =>
                setForm((current) => ({ ...current, note: event.target.value }))
              }
            />
          </label>
          <button className="primary-button" type="submit" disabled={!configured || loading}>
            Создать сотрудника
          </button>
        </form>
      </section>

      <section className="dashboard-section" aria-labelledby="stats-title">
        <div className="module-card-head">
          <div>
            <p className="eyebrow">Статистика</p>
            <h2 id="stats-title">Все сотрудники</h2>
          </div>
          <div className="dashboard-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={refreshStats}
              disabled={!configured || loading}
            >
              Обновить
            </button>
            <button
              className="primary-button"
              type="button"
              onClick={handleExportCsv}
              disabled={filteredRows.length === 0}
            >
              Экспорт CSV
            </button>
          </div>
        </div>
        <div className="reference-toolbar single">
          <label>
            <span>Поиск</span>
            <input
              placeholder="email, имя, роль, заметка..."
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>

        <div className="employee-grid">
          {filteredRows.map((row) => {
            const progressRows = row.training_progress ?? [];
            const moduleCount = progressRows.reduce(
              (sum, progress) => sum + progress.completed_modules.length,
              0
            );
            const simulationCount = progressRows.reduce(
              (sum, progress) => sum + progress.completed_simulations.length,
              0
            );
            const bestFinalScore = progressRows.reduce(
              (max, progress) => Math.max(max, progress.final_quiz_score),
              0
            );

            return (
              <article className="reference-card employee-card" key={row.id}>
                <div className="module-card-head">
                  <div>
                    <h2>{row.display_name}</h2>
                    <p>{row.email}</p>
                  </div>
                  <span className={`status-pill ${row.is_active ? "done" : ""}`}>
                    {row.is_active ? "Активен" : "Заблокирован"}
                  </span>
                </div>
                <dl className="definition-list">
                  <dt>Роль</dt>
                  <dd>{roleToLabel(row.role)}</dd>
                  <dt>Модули</dt>
                  <dd>{moduleCount}</dd>
                  <dt>Симуляции</dt>
                  <dd>{simulationCount}</dd>
                  <dt>Финальная проверка</dt>
                  <dd>{bestFinalScore}%</dd>
                </dl>
                <div className="admin-actions">
                  <select
                    aria-label="Изменить роль"
                    value={row.role}
                    onChange={(event) =>
                      handlePatchUser(row, { role: event.target.value as TrainingRoleId })
                    }
                    disabled={loading}
                  >
                    {roles.map((role) => (
                      <option key={role} value={roleLabelToId[role]}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => handlePatchUser(row, { isActive: !row.is_active })}
                    disabled={loading}
                  >
                    {row.is_active ? "Заблокировать" : "Разблокировать"}
                  </button>
                </div>
                <div className="admin-actions">
                  <input
                    aria-label="Новый временный пароль"
                    autoComplete="new-password"
                    placeholder="Новый временный пароль"
                    type="password"
                    value={resetPasswords[row.id] ?? ""}
                    onChange={(event) =>
                      setResetPasswords((current) => ({
                        ...current,
                        [row.id]: event.target.value
                      }))
                    }
                  />
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => handleResetPassword(row)}
                    disabled={loading}
                  >
                    Сбросить пароль
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}
