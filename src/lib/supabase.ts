import type { QuizScore } from "./quiz";
import type { TrainingProgress } from "./progress";
import type { Role } from "../training-content";
import {
  createSessionUser,
  roleToId,
  roleToLabel,
  type TrainingRoleId,
  type TrainingSessionUser
} from "../training-users";

type SupabaseJson = Record<string, unknown>;

export interface SupabaseAuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  authUserId: string;
  email: string;
}

export interface TrainingProfileRow {
  id: string;
  auth_user_id: string;
  email: string;
  display_name: string;
  role: TrainingRoleId;
  is_active: boolean;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface TrainingProgressRow {
  id: string;
  user_id: string;
  role: TrainingRoleId;
  completed_modules: string[];
  completed_simulations: string[];
  quiz_scores: Record<string, QuizScore>;
  final_quiz_status: "not_started" | "passed" | "failed";
  final_quiz_score: number;
  last_activity_at: string | null;
  updated_at: string;
}

export interface TrainingStatsRow extends TrainingProfileRow {
  training_progress?: TrainingProgressRow[];
}

interface RequestOptions {
  method?: string;
  token?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "") ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getSupabaseModeLabel(): string {
  return isSupabaseConfigured()
    ? "Централизованный режим Supabase"
    : "Локальный учебный режим";
}

function requireSupabaseConfig() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase не настроен. Добавьте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY.");
  }
}

async function supabaseRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  requireSupabaseConfig();

  const response = await fetch(`${supabaseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      apikey: supabaseAnonKey,
      authorization: `Bearer ${options.token ?? supabaseAnonKey}`,
      "content-type": "application/json",
      ...(options.headers ?? {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      (body as SupabaseJson)?.msg ||
      (body as SupabaseJson)?.message ||
      (body as SupabaseJson)?.error_description ||
      text ||
      "Supabase request failed.";
    throw new Error(String(message));
  }

  return body as T;
}

export async function signInWithSupabase(
  email: string,
  password: string
): Promise<SupabaseAuthSession> {
  const body = await supabaseRequest<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user: { id: string; email?: string };
  }>("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: { email: email.trim().toLowerCase(), password }
  });

  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token,
    expiresAt: Date.now() + body.expires_in * 1000,
    authUserId: body.user.id,
    email: body.user.email ?? email.trim().toLowerCase()
  };
}

export async function refreshSupabaseSession(
  user: TrainingSessionUser
): Promise<TrainingSessionUser> {
  if (!user.supabaseRefreshToken) {
    return user;
  }

  if (user.supabaseExpiresAt && user.supabaseExpiresAt - Date.now() > 60_000) {
    return user;
  }

  const body = await supabaseRequest<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user: { id: string; email?: string };
  }>("/auth/v1/token?grant_type=refresh_token", {
    method: "POST",
    body: { refresh_token: user.supabaseRefreshToken }
  });

  return {
    ...user,
    supabaseAccessToken: body.access_token,
    supabaseRefreshToken: body.refresh_token,
    supabaseExpiresAt: Date.now() + body.expires_in * 1000
  };
}

export async function loadTrainingProfile(
  authUserId: string,
  token: string
): Promise<TrainingProfileRow> {
  const params = new URLSearchParams({
    auth_user_id: `eq.${authUserId}`,
    select: "*"
  });
  const rows = await supabaseRequest<TrainingProfileRow[]>(
    `/rest/v1/training_users?${params}`,
    { token }
  );

  if (!rows[0]) {
    throw new Error("Учебный профиль не найден. Попросите администратора создать профиль.");
  }
  if (!rows[0].is_active) {
    throw new Error("Учебный аккаунт заблокирован. Обратитесь к администратору.");
  }

  return rows[0];
}

export async function signInTrainingEmployee(
  email: string,
  password: string
): Promise<TrainingSessionUser> {
  const session = await signInWithSupabase(email, password);
  const profile = await loadTrainingProfile(session.authUserId, session.accessToken);

  return createSessionUser({
    id: profile.id,
    profileId: profile.id,
    authUserId: profile.auth_user_id,
    email: profile.email,
    displayName: profile.display_name,
    role: profile.role,
    note: profile.note,
    isActive: profile.is_active,
    source: "supabase",
    supabaseAccessToken: session.accessToken,
    supabaseRefreshToken: session.refreshToken,
    supabaseExpiresAt: session.expiresAt
  });
}

export async function refreshTrainingEmployeeSession(
  user: TrainingSessionUser
): Promise<TrainingSessionUser> {
  const session = await refreshSupabaseSession(user);
  if (!session.authUserId || !session.supabaseAccessToken) {
    throw new Error("Supabase session is missing auth user id or token.");
  }

  const profile = await loadTrainingProfile(
    session.authUserId,
    session.supabaseAccessToken
  );

  return createSessionUser({
    id: profile.id,
    profileId: profile.id,
    authUserId: profile.auth_user_id,
    email: profile.email,
    displayName: profile.display_name,
    role: profile.role,
    note: profile.note,
    isActive: profile.is_active,
    source: "supabase",
    supabaseAccessToken: session.supabaseAccessToken,
    supabaseRefreshToken: session.supabaseRefreshToken,
    supabaseExpiresAt: session.supabaseExpiresAt
  });
}

function progressFromRow(row: TrainingProgressRow | undefined, role: Role): TrainingProgress {
  return {
    selectedRole: role,
    completedModules: row?.completed_modules ?? [],
    completedSimulations: row?.completed_simulations ?? [],
    quizScores: row?.quiz_scores ?? {},
    finalQuizScore:
      row && row.final_quiz_status !== "not_started"
        ? {
            total: 100,
            correct: row.final_quiz_score,
            percentage: row.final_quiz_score,
            details: []
          }
        : undefined
  };
}

export async function loadSupabaseProgress(
  user: TrainingSessionUser,
  role: Role
): Promise<TrainingProgress> {
  if (!user.profileId || !user.supabaseAccessToken) {
    throw new Error("Supabase session is missing profile or token.");
  }

  const params = new URLSearchParams({
    user_id: `eq.${user.profileId}`,
    role: `eq.${roleToId(role)}`,
    select: "*"
  });
  const rows = await supabaseRequest<TrainingProgressRow[]>(
    `/rest/v1/training_progress?${params}`,
    { token: user.supabaseAccessToken }
  );

  return progressFromRow(rows[0], role);
}

export async function saveSupabaseProgress(
  user: TrainingSessionUser,
  role: Role,
  progress: TrainingProgress
): Promise<void> {
  if (!user.profileId || !user.supabaseAccessToken) {
    return;
  }

  const finalScore = progress.finalQuizScore?.percentage ?? 0;
  const finalStatus =
    progress.finalQuizScore === undefined
      ? "not_started"
      : finalScore >= 80
        ? "passed"
        : "failed";

  await supabaseRequest<TrainingProgressRow[]>(
    "/rest/v1/training_progress?on_conflict=user_id,role",
    {
      method: "POST",
      token: user.supabaseAccessToken,
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation"
      },
      body: {
        user_id: user.profileId,
        role: roleToId(role),
        completed_modules: progress.completedModules,
        completed_simulations: progress.completedSimulations,
        quiz_scores: progress.quizScores,
        final_quiz_status: finalStatus,
        final_quiz_score: finalScore,
        last_activity_at: new Date().toISOString()
      }
    }
  );
}

export async function listTrainingStats(
  user: TrainingSessionUser
): Promise<TrainingStatsRow[]> {
  if (!user.supabaseAccessToken) {
    return [];
  }

  const params = new URLSearchParams({
    select: "*,training_progress(*)",
    order: "created_at.desc"
  });

  return supabaseRequest<TrainingStatsRow[]>(`/rest/v1/training_users?${params}`, {
    token: user.supabaseAccessToken
  });
}

export async function callAdminTrainingUsers(
  user: TrainingSessionUser,
  body: unknown,
  method = "POST"
): Promise<SupabaseJson> {
  if (!user.supabaseAccessToken) {
    throw new Error("Нет активной Supabase-сессии администратора.");
  }

  const response = await fetch("/api/admin-training-users", {
    method,
    headers: {
      authorization: `Bearer ${user.supabaseAccessToken}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = (await response.json()) as SupabaseJson;
  if (!response.ok) {
    throw new Error(String(data.error ?? "Admin API request failed."));
  }

  return data;
}

export function csvEscape(value: unknown): string {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export function exportStatsCsv(rows: TrainingStatsRow[]): string {
  type ExportProgressRow = Pick<
    TrainingProgressRow,
    | "role"
    | "completed_modules"
    | "completed_simulations"
    | "final_quiz_status"
    | "final_quiz_score"
    | "last_activity_at"
  >;

  const header = [
    "email",
    "display_name",
    "role",
    "is_active",
    "completed_modules",
    "completed_simulations",
    "final_quiz_status",
    "final_quiz_score",
    "last_activity_at"
  ];
  const body = rows.flatMap((row) => {
    const progressRows: ExportProgressRow[] = row.training_progress?.length
      ? row.training_progress
      : [
          {
            role: row.role,
            completed_modules: [],
            completed_simulations: [],
            final_quiz_status: "not_started",
            final_quiz_score: 0,
            last_activity_at: null
          }
        ];

    return progressRows.map((progress) =>
      [
        row.email,
        row.display_name,
        roleToLabel(progress.role).toString(),
        row.is_active ? "active" : "blocked",
        progress.completed_modules.length,
        progress.completed_simulations.length,
        progress.final_quiz_status,
        progress.final_quiz_score,
        progress.last_activity_at ?? ""
      ]
        .map(csvEscape)
        .join(",")
    );
  });

  return [header.join(","), ...body].join("\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
