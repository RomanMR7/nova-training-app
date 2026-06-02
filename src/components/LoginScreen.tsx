import { FormEvent, useState } from "react";
import {
  authenticateTrainingUser,
  trainingUsers,
  type TrainingSessionUser
} from "../training-users";
import {
  getSupabaseModeLabel,
  isSupabaseConfigured,
  signInTrainingEmployee
} from "../lib/supabase";

interface LoginScreenProps {
  onLogin: (user: TrainingSessionUser) => void | Promise<void>;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const centralizedMode = isSupabaseConfigured();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const user = centralizedMode
        ? await signInTrainingEmployee(email, password)
        : authenticateTrainingUser(email, password);

      if (!user) {
        setError("Неверный email или пароль для учебного входа.");
        return;
      }

      await onLogin(user);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Не удалось войти в учебный тренажер."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-copy">
          <div className="brand-lockup large">
            <img
              alt=""
              className="brand-mark"
              src="./anchor-pay-logo.png"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
            <div>
              <p className="eyebrow">Учебный тренажер рабочего места</p>
              <h1 id="login-title">Anchor Pay</h1>
            </div>
          </div>
          <p className="lead">
            Учебная среда для PSP-процессов: роли, verification, teamlead- и
            trader-команды, shop, requisites, api_key и orders изучаются только
            на учебных данных. Нет реальных денег, реальных платежных API или
            подключения к production-системам.
          </p>
          <div className="safety-strip" aria-label="Ограничения тренажера">
            <span>{getSupabaseModeLabel()}</span>
            <span>Нет реальных платежей</span>
            <span>Учебная статистика</span>
          </div>
          <div className={`mode-note ${centralizedMode ? "positive" : "warning"}`}>
            {centralizedMode
              ? "Вход идет через Supabase Auth. ADMIN создает учебные аккаунты и видит статистику по сотрудникам."
              : "Supabase env не задан. Сейчас включен offline demo: локальные аккаунты и прогресс только в этом браузере."}
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input
              autoComplete="username"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            <span>Пароль</span>
            <input
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error ? (
            <div className="feedback negative" role="alert">
              {error}
            </div>
          ) : null}
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Входим..." : "Войти в тренажер"}
          </button>
        </form>
      </section>

      <section className="demo-accounts" aria-labelledby="demo-title">
        <div className="section-heading">
          <p className="eyebrow">
            {centralizedMode ? "Централизованный вход" : "Offline demo"}
          </p>
          <h2 id="demo-title">
            {centralizedMode ? "Как получить доступ" : "Локальные учебные аккаунты"}
          </h2>
          <p>
            {centralizedMode
              ? "Используйте email и временный пароль, которые выдал администратор обучения. Пароль не хранится в таблицах приложения."
              : "Эти аккаунты работают только без Supabase-конфига. Пароль одинаковый: Training123!, но он не подставляется автоматически."}
          </p>
        </div>
        {centralizedMode ? (
          <div className="demo-account-grid">
            <article className="demo-account-card static">
              <strong>Один Vercel URL</strong>
              <span>Все сотрудники входят по одной ссылке.</span>
              <span>Маршрут определяется ролью аккаунта.</span>
            </article>
            <article className="demo-account-card static">
              <strong>ADMIN</strong>
              <span>Создает сотрудников, блокирует доступ и экспортирует CSV.</span>
              <span>Обычные роли не видят статистику.</span>
            </article>
          </div>
        ) : (
          <div className="demo-account-grid">
            {trainingUsers.map((user) => (
              <button
                className="demo-account-card"
                key={user.id}
                type="button"
                onClick={() => {
                  setEmail(user.email);
                  setPassword("");
                  setError("");
                }}
              >
                <strong>{user.displayName}</strong>
                <span>{user.email}</span>
                <span>{user.roleLabel}</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
