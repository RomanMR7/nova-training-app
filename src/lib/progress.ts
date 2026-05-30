import type { Role } from "../training-content";
import type { TrainingSessionUser } from "../training-users";
import { getTrainingUserByEmail, roleToId, roleToLabel } from "../training-users";
import type { QuizScore } from "./quiz";

const LEGACY_STORAGE_KEY = "nova-training-progress-v1";
const SESSION_KEY = "nova-training-session-v1";
const PROGRESS_PREFIX = "nova-training-progress-v2";

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface TrainingProgress {
  selectedRole: Role | null;
  completedModules: string[];
  completedSimulations: string[];
  quizScores: Record<string, QuizScore>;
  finalQuizScore?: QuizScore;
}

export const emptyProgress: TrainingProgress = {
  selectedRole: null,
  completedModules: [],
  completedSimulations: [],
  quizScores: {}
};

function getStorage(): StorageLike | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function normalizeProgress(value: Partial<TrainingProgress>): TrainingProgress {
  return {
    selectedRole: value.selectedRole ?? null,
    completedModules: Array.isArray(value.completedModules)
      ? [...new Set(value.completedModules)]
      : [],
    completedSimulations: Array.isArray(value.completedSimulations)
      ? [...new Set(value.completedSimulations)]
      : [],
    quizScores:
      value.quizScores && typeof value.quizScores === "object"
        ? value.quizScores
        : {},
    finalQuizScore: value.finalQuizScore
  };
}

function normalizeEmail(email: string): string {
  return email.trim().toLocaleLowerCase("en-US");
}

export function getUserRoleStorageKey(
  userEmail: string,
  role: Role,
  key: string
): string {
  return `${PROGRESS_PREFIX}:${normalizeEmail(userEmail)}:${roleToId(role)}:${key}`;
}

function getProgressStorageKey(userEmail?: string, role?: Role): string {
  if (!userEmail || !role) {
    return LEGACY_STORAGE_KEY;
  }

  return getUserRoleStorageKey(userEmail, role, "progress");
}

export function saveTrainingSession(
  user: TrainingSessionUser,
  storage = getStorage()
): TrainingSessionUser {
  storage?.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function getTrainingSession(storage = getStorage()): TrainingSessionUser | null {
  const raw = storage?.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as TrainingSessionUser;
    if (!parsed.email || !parsed.role || !Array.isArray(parsed.accessibleRoles)) {
      return null;
    }

    if (parsed.source === "supabase") {
      return parsed;
    }

    return getTrainingUserByEmail(parsed.email);
  } catch {
    return null;
  }
}

export function clearTrainingSession(storage = getStorage()): void {
  storage?.removeItem(SESSION_KEY);
}

export function loadProgress(
  userEmail?: string,
  role?: Role,
  storage = getStorage()
): TrainingProgress {
  if (!storage) {
    return { ...emptyProgress };
  }

  const raw = storage.getItem(getProgressStorageKey(userEmail, role));
  if (!raw) {
    try {
      const legacyRaw = userEmail && role ? storage.getItem(LEGACY_STORAGE_KEY) : null;
      const fallback = legacyRaw
        ? (JSON.parse(legacyRaw) as Partial<TrainingProgress>)
        : emptyProgress;
      return normalizeProgress({
        ...fallback,
        selectedRole: role ?? fallback.selectedRole ?? null
      });
    } catch {
      return normalizeProgress({ selectedRole: role ?? null });
    }
  }

  try {
    return normalizeProgress({
      ...(JSON.parse(raw) as Partial<TrainingProgress>),
      selectedRole: role ?? null
    });
  } catch {
    return { ...emptyProgress };
  }
}

export function saveProgress(
  progress: TrainingProgress,
  userEmail?: string,
  role?: Role,
  storage = getStorage()
): TrainingProgress {
  const normalized = normalizeProgress({
    ...progress,
    selectedRole: role ?? progress.selectedRole
  });
  storage?.setItem(getProgressStorageKey(userEmail, role), JSON.stringify(normalized));
  return normalized;
}

export function selectRole(
  role: Role,
  userEmail?: string,
  storage = getStorage()
): TrainingProgress {
  const progress = loadProgress(userEmail, role, storage);
  return saveProgress({ ...progress, selectedRole: role }, userEmail, role, storage);
}

export function markModuleCompleted(
  moduleId: string,
  userEmail?: string,
  role?: Role,
  storage = getStorage()
): TrainingProgress {
  const progress = loadProgress(userEmail, role, storage);
  return saveProgress(
    {
      ...progress,
      completedModules: [...new Set([...progress.completedModules, moduleId])]
    },
    userEmail,
    role,
    storage
  );
}

export function saveQuizScore(
  moduleId: string,
  score: QuizScore,
  userEmail?: string,
  role?: Role,
  storage = getStorage()
): TrainingProgress {
  const progress = loadProgress(userEmail, role, storage);
  return saveProgress(
    {
      ...progress,
      quizScores: {
        ...progress.quizScores,
        [moduleId]: score
      }
    },
    userEmail,
    role,
    storage
  );
}

export function markSimulationCompleted(
  simulationId: string,
  userEmail?: string,
  role?: Role,
  storage = getStorage()
): TrainingProgress {
  const progress = loadProgress(userEmail, role, storage);
  return saveProgress(
    {
      ...progress,
      completedSimulations: [
        ...new Set([...progress.completedSimulations, simulationId])
      ]
    },
    userEmail,
    role,
    storage
  );
}

export function saveFinalQuizScore(
  score: QuizScore,
  userEmail?: string,
  role?: Role,
  storage = getStorage()
): TrainingProgress {
  const progress = loadProgress(userEmail, role, storage);
  return saveProgress(
    {
      ...progress,
      finalQuizScore: score
    },
    userEmail,
    role,
    storage
  );
}

export function resetCurrentUserProgress(
  userEmail: string,
  role: Role,
  storage = getStorage()
): TrainingProgress {
  storage?.removeItem(getProgressStorageKey(userEmail, role));
  return { ...emptyProgress, selectedRole: role };
}

export function resetAllLocalTrainingData(storage = getStorage()): void {
  if (!storage || typeof window === "undefined") {
    return;
  }

  Object.keys(window.localStorage)
    .filter(
      (key) =>
        key.startsWith(PROGRESS_PREFIX) ||
        key === LEGACY_STORAGE_KEY ||
        key === SESSION_KEY
    )
    .forEach((key) => window.localStorage.removeItem(key));
}

export function resetProgress(storage = getStorage()): TrainingProgress {
  const session = getTrainingSession(storage);
  const role = session ? roleToLabel(session.role) : null;
  if (session && role) {
    return resetCurrentUserProgress(session.email, role, storage);
  }

  storage?.removeItem(LEGACY_STORAGE_KEY);
  return { ...emptyProgress };
}
