import { useMemo, useState } from "react";
import type { Scenario } from "../training-content";

interface ScenarioSimulatorProps {
  scenario: Scenario;
  onBack: () => void;
  onFinish: () => void;
}

export function ScenarioSimulator({
  scenario,
  onBack,
  onFinish
}: ScenarioSimulatorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentStep = scenario.steps[currentIndex];
  const selectedOptionId = answers[currentStep.id];
  const selectedOption = currentStep.options.find(
    (option) => option.id === selectedOptionId
  );
  const correctCount = useMemo(
    () =>
      scenario.steps.filter((step) => {
        const answer = answers[step.id];
        return step.options.some((option) => option.id === answer && option.correct);
      }).length,
    [answers, scenario.steps]
  );
  const isLastStep = currentIndex === scenario.steps.length - 1;

  return (
    <section className="screen-stack" aria-labelledby="scenario-title">
      <div className="module-header">
        <button className="ghost-button" type="button" onClick={onBack}>
          К модулю
        </button>
        <span className="status-pill">Mock only</span>
      </div>

      <div className="section-heading">
        <p className="eyebrow">Симулятор</p>
        <h1 id="scenario-title">{scenario.title}</h1>
        <p>{scenario.summary}</p>
      </div>

      <div className="scenario-shell">
        <div className="scenario-progress">
          {scenario.steps.map((step, index) => (
            <span
              className={index === currentIndex ? "active" : ""}
              key={step.id}
              aria-label={`Шаг ${index + 1}`}
            />
          ))}
        </div>

        <div className="scenario-step">
          <span className="step-count">
            Шаг {currentIndex + 1} из {scenario.steps.length}
          </span>
          <h2>{currentStep.title}</h2>
          <p>{currentStep.instruction}</p>

          <div className="option-list">
            {currentStep.options.map((option) => (
              <button
                className={`option-button ${
                  selectedOptionId === option.id ? "is-selected" : ""
                }`}
                key={option.id}
                type="button"
                onClick={() =>
                  setAnswers((current) => ({
                    ...current,
                    [currentStep.id]: option.id
                  }))
                }
              >
                {option.label}
              </button>
            ))}
          </div>

          {selectedOption ? (
            <div
              className={`feedback ${selectedOption.correct ? "positive" : "negative"}`}
              role="status"
            >
              {selectedOption.feedback}
            </div>
          ) : null}
        </div>

        <div className="scenario-footer">
          <span>
            Верных решений: {correctCount} из {scenario.steps.length}
          </span>
          {isLastStep ? (
            <button
              className="primary-button"
              type="button"
              onClick={onFinish}
              disabled={!selectedOptionId}
            >
              Завершить сценарий
            </button>
          ) : (
            <button
              className="primary-button"
              type="button"
              onClick={() => setCurrentIndex((index) => index + 1)}
              disabled={!selectedOptionId}
            >
              Следующий шаг
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

