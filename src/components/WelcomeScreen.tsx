interface WelcomeScreenProps {
  hasProgress: boolean;
  onStart: () => void;
  onContinue: () => void;
}

export function WelcomeScreen({
  hasProgress,
  onStart,
  onContinue
}: WelcomeScreenProps) {
  return (
    <section className="welcome-screen" aria-labelledby="welcome-title">
      <div className="welcome-copy">
        <p className="eyebrow">Статичный учебный контур</p>
        <h1 id="welcome-title">Nova Training</h1>
        <p className="lead">
          Интерактивное обучение сотрудников работе с платформой Nova:
          роли, заявки, апелляции, ledger, аудит и мок-сценарии без
          подключения к production.
        </p>
        <div className="welcome-actions">
          <button className="primary-button" type="button" onClick={onStart}>
            Начать обучение
          </button>
          {hasProgress ? (
            <button className="secondary-button" type="button" onClick={onContinue}>
              Продолжить
            </button>
          ) : null}
        </div>
      </div>

      <div className="overview-panel" aria-label="Что входит в обучение">
        <div>
          <span className="metric">15</span>
          <span>модулей</span>
        </div>
        <div>
          <span className="metric">8</span>
          <span>симуляторов</span>
        </div>
        <div>
          <span className="metric">0</span>
          <span>реальных API</span>
        </div>
      </div>
    </section>
  );
}

