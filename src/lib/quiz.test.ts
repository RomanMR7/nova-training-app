import { describe, expect, it } from "vitest";
import { scoreQuiz } from "./quiz";
import type { QuizQuestion } from "../training-content";

const questions: QuizQuestion[] = [
  {
    id: "q1",
    question: "Первый вопрос",
    options: [
      { id: "a", text: "Верно" },
      { id: "b", text: "Неверно" }
    ],
    correctOptionId: "a",
    explanation: "Пояснение"
  },
  {
    id: "q2",
    question: "Второй вопрос",
    options: [
      { id: "a", text: "Неверно" },
      { id: "b", text: "Верно" }
    ],
    correctOptionId: "b",
    explanation: "Пояснение"
  }
];

describe("scoreQuiz", () => {
  it("counts correct answers and calculates percentage", () => {
    const result = scoreQuiz(questions, { q1: "a", q2: "a" });

    expect(result.correct).toBe(1);
    expect(result.total).toBe(2);
    expect(result.percentage).toBe(50);
    expect(result.details[0]).toMatchObject({ isCorrect: true });
    expect(result.details[1]).toMatchObject({ isCorrect: false });
  });
});

