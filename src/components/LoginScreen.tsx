import { FormEvent, useState } from "react";
import {
  authenticateTrainingUser,
  trainingUsers,
  type TrainingSessionUser
} from "../training-users";

interface LoginScreenProps {
  onLogin: (user: TrainingSessionUser) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("trader@training.local");
  const [password, setPassword] = useState("Training123!");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const user = authenticateTrainingUser(email, password);

    if (!user) {
      setError("Неверный email или пароль для учебного входа.");
      return;
    }

    setError("");
    onLogin(user);
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
            Безопасная гавань для практики: роли, заявки, апелляции, ledger и
            уведомления изучаются только на учебных данных. Нет реальных денег,
            реальных API-вызовов или подключения к backend.
          </p>
          <div className="safety-strip" aria-label="Ограничения тренажера">
            <span>Локальный прогресс</span>
            <span>Нет реальных платежей</span>
            <span>Нет backend-вызовов</span>
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
          <button className="primary-button" type="submit">
            Войти в тренажер
          </button>
        </form>
      </section>

      <section className="demo-accounts" aria-labelledby="demo-title">
        <div className="section-heading">
          <p className="eyebrow">Учебные учетные записи</p>
          <h2 id="demo-title">Учебные аккаунты</h2>
          <p>
            Все аккаунты локальные. Пароль одинаковый: <strong>Training123!</strong>
          </p>
        </div>
        <div className="demo-account-grid">
          {trainingUsers.map((user) => (
            <button
              className="demo-account-card"
              key={user.id}
              type="button"
              onClick={() => {
                setEmail(user.email);
                setPassword("Training123!");
                setError("");
              }}
            >
              <strong>{user.displayName}</strong>
              <span>{user.email}</span>
              <span>{user.roleLabel}</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
