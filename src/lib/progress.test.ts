import { beforeEach, describe, expect, it } from "vitest";
import {
  loadProgress,
  markModuleCompleted,
  resetCurrentUserProgress,
  resetProgress,
  saveQuizScore,
  selectRole
} from "./progress";

describe("progress persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves selected role and completed modules in localStorage", () => {
    selectRole("Трейдер", "trader@training.local");
    markModuleCompleted("payment-orders", "trader@training.local", "Трейдер");

    const progress = loadProgress("trader@training.local", "Трейдер");
    const merchantProgress = loadProgress("trader@training.local", "Мерчант");

    expect(progress.selectedRole).toBe("Трейдер");
    expect(progress.completedModules).toContain("payment-orders");
    expect(merchantProgress.completedModules).not.toContain("payment-orders");
  });

  it("saves quiz score and resets progress", () => {
    saveQuizScore(
      "platform-overview",
      {
        total: 2,
        correct: 2,
        percentage: 100,
        details: []
      },
      "support@training.local",
      "Саппорт"
    );

    expect(
      loadProgress("support@training.local", "Саппорт").quizScores["platform-overview"]
        .percentage
    ).toBe(100);
    resetCurrentUserProgress("support@training.local", "Саппорт");
    expect(
      loadProgress("support@training.local", "Саппорт").quizScores["platform-overview"]
    ).toBeUndefined();
    resetProgress();
  });
});
