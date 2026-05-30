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
            <p className="eyebrow">Учебный тренажер</p>
            <h1 id="welcome-title">Anchor Pay</h1>
          </div>
        </div>
        <p className="lead">
          Nautical-themed fintech training simulator: роли, заявки,
          апелляции, ledger, аудит и учебные сценарии без реальных денег,
          backend-вызовов или production-данных.
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
          <span>модульных симуляторов</span>
        </div>
        <div>
          <span className="metric">0</span>
          <span>реальных API</span>
        </div>
      </div>
    </section>
  );
}
