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
          <p className="eyebrow">Локальный учебный вход</p>
          <h1 id="login-title">Nova Training</h1>
          <p className="lead">
            Это учебная авторизация только внутри браузера. Она не является
            production-логином, не обращается к backend и не защищает реальные
            данные.
          </p>
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
          <p className="eyebrow">Demo accounts</p>
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

