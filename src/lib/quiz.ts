import type { QuizQuestion } from "../training-content";

export type QuizAnswers = Record<string, string>;

export interface QuizDetail {
  questionId: string;
  selectedOptionId: string | null;
  correctOptionId: string;
  isCorrect: boolean;
}

export interface QuizScore {
  total: number;
  correct: number;
  percentage: number;
  details: QuizDetail[];
}

export function scoreQuiz(
  questions: QuizQuestion[],
  answers: QuizAnswers
): QuizScore {
  const details = questions.map((question) => {
    const selectedOptionId = answers[question.id] ?? null;

    return {
      questionId: question.id,
      selectedOptionId,
      correctOptionId: question.correctOptionId,
      isCorrect: selectedOptionId === question.correctOptionId
    };
  });

  const correct = details.filter((detail) => detail.isCorrect).length;
  const total = questions.length;

  return {
    total,
    correct,
    percentage: total === 0 ? 0 : Math.round((correct / total) * 100),
    details
  };
}

export function isPassingScore(score: QuizScore, threshold = 70): boolean {
  return score.percentage >= threshold;
}

