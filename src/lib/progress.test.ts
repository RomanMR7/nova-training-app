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
    selectRole("TRADER", "trader@training.local");
    markModuleCompleted("trader-requisites", "trader@training.local", "TRADER");

    const progress = loadProgress("trader@training.local", "TRADER");
    const merchantProgress = loadProgress("trader@training.local", "MERCHANT");

    expect(progress.selectedRole).toBe("TRADER");
    expect(progress.completedModules).toContain("trader-requisites");
    expect(merchantProgress.completedModules).not.toContain("trader-requisites");
  });

  it("saves quiz score and resets progress", () => {
    saveQuizScore(
      "psp-role-map",
      {
        total: 2,
        correct: 2,
        percentage: 100,
        details: []
      },
      "support@training.local",
      "SUPPORT"
    );

    expect(
      loadProgress("support@training.local", "SUPPORT").quizScores["psp-role-map"]
        .percentage
    ).toBe(100);
    resetCurrentUserProgress("support@training.local", "SUPPORT");
    expect(
      loadProgress("support@training.local", "SUPPORT").quizScores["psp-role-map"]
    ).toBeUndefined();
    resetProgress();
  });
});
