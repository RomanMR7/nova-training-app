import type { Role } from "./training-content";

export type TrainingRoleId =
  | "admin"
  | "teamlead_manager"
  | "trader_manager"
  | "trader"
  | "merchant"
  | "merchant_manager"
  | "head_support"
  | "support";

export interface TrainingUser {
  id: string;
  email: string;
  displayName: string;
  role: TrainingRoleId;
  roleLabel: Role;
  password: string;
  accessibleRoles: TrainingRoleId[];
}

export type TrainingSessionSource = "local" | "supabase";

export type TrainingSessionUser = Omit<TrainingUser, "password"> & {
  source?: TrainingSessionSource;
  profileId?: string;
  authUserId?: string;
  isActive?: boolean;
  note?: string;
  supabaseAccessToken?: string;
  supabaseRefreshToken?: string;
  supabaseExpiresAt?: number;
};

export const roleIdToLabel: Record<TrainingRoleId, Role> = {
  admin: "ADMIN",
  teamlead_manager: "TEAMLEAD_MANAGER",
  trader_manager: "TRADER_MANAGER",
  trader: "TRADER",
  merchant: "MERCHANT",
  merchant_manager: "MERCHANT_MANAGER",
  head_support: "HEAD_SUPPORT",
  support: "SUPPORT"
};

export const roleLabelToId: Record<Role, TrainingRoleId> = {
  ADMIN: "admin",
  TEAMLEAD_MANAGER: "teamlead_manager",
  TRADER_MANAGER: "trader_manager",
  TRADER: "trader",
  MERCHANT: "merchant",
  MERCHANT_MANAGER: "merchant_manager",
  HEAD_SUPPORT: "head_support",
  SUPPORT: "support"
};

const allTrainingRoleIds: TrainingRoleId[] = [
  "admin",
  "teamlead_manager",
  "trader_manager",
  "trader",
  "merchant",
  "merchant_manager",
  "head_support",
  "support"
];

export const trainingUsers: TrainingUser[] = [
  {
    id: "training-admin",
    email: "admin@training.local",
    displayName: "Учебный ADMIN",
    role: "admin",
    roleLabel: "ADMIN",
    password: "Training123!",
    accessibleRoles: allTrainingRoleIds
  },
  {
    id: "training-teamlead-manager",
    email: "teamlead.manager@training.local",
    displayName: "Учебный TEAMLEAD_MANAGER",
    role: "teamlead_manager",
    roleLabel: "TEAMLEAD_MANAGER",
    password: "Training123!",
    accessibleRoles: ["teamlead_manager"]
  },
  {
    id: "training-trader-manager",
    email: "trader.manager@training.local",
    displayName: "Учебный TRADER_MANAGER",
    role: "trader_manager",
    roleLabel: "TRADER_MANAGER",
    password: "Training123!",
    accessibleRoles: ["trader_manager"]
  },
  {
    id: "training-trader",
    email: "trader@training.local",
    displayName: "Учебный TRADER",
    role: "trader",
    roleLabel: "TRADER",
    password: "Training123!",
    accessibleRoles: ["trader"]
  },
  {
    id: "training-merchant",
    email: "merchant@training.local",
    displayName: "Учебный MERCHANT",
    role: "merchant",
    roleLabel: "MERCHANT",
    password: "Training123!",
    accessibleRoles: ["merchant"]
  },
  {
    id: "training-merchant-manager",
    email: "merchant.manager@training.local",
    displayName: "Учебный MERCHANT_MANAGER",
    role: "merchant_manager",
    roleLabel: "MERCHANT_MANAGER",
    password: "Training123!",
    accessibleRoles: ["merchant_manager"]
  },
  {
    id: "training-head-support",
    email: "head.support@training.local",
    displayName: "Учебный HEAD_SUPPORT",
    role: "head_support",
    roleLabel: "HEAD_SUPPORT",
    password: "Training123!",
    accessibleRoles: ["head_support"]
  },
  {
    id: "training-support",
    email: "support@training.local",
    displayName: "Учебный SUPPORT",
    role: "support",
    roleLabel: "SUPPORT",
    password: "Training123!",
    accessibleRoles: ["support"]
  }
];

function normalizeEmail(email: string): string {
  return email.trim().toLocaleLowerCase("en-US");
}

function toSessionUser(user: TrainingUser): TrainingSessionUser {
  const { password: _password, ...sessionUser } = user;
  return { ...sessionUser, source: "local", isActive: true };
}

export function roleToId(role: Role | TrainingRoleId): TrainingRoleId {
  return role in roleIdToLabel ? (role as TrainingRoleId) : roleLabelToId[role as Role];
}

export function roleToLabel(role: Role | TrainingRoleId): Role {
  return role in roleIdToLabel ? roleIdToLabel[role as TrainingRoleId] : (role as Role);
}

export function authenticateTrainingUser(
  email: string,
  password: string
): TrainingSessionUser | null {
  const user = trainingUsers.find(
    (candidate) => normalizeEmail(candidate.email) === normalizeEmail(email)
  );

  if (!user || user.password !== password) {
    return null;
  }

  return toSessionUser(user);
}

export function getTrainingUserByEmail(email: string): TrainingSessionUser | null {
  const user = trainingUsers.find((item) => item.email === normalizeEmail(email));
  return user ? toSessionUser(user) : null;
}

export function canAccessRole(
  user: TrainingSessionUser | null,
  role: Role | TrainingRoleId
): boolean {
  if (!user) {
    return false;
  }

  return user.accessibleRoles.includes(roleToId(role));
}

export function getDefaultRoleForUser(user: TrainingSessionUser): Role {
  return roleToLabel(user.accessibleRoles[0] ?? user.role);
}

export function getAccessibleRoles(user: TrainingSessionUser): Role[] {
  return user.accessibleRoles.map((roleId) => roleIdToLabel[roleId]);
}

export function getAccessibleRoleIds(user: TrainingSessionUser): TrainingRoleId[] {
  return [...user.accessibleRoles];
}

export function isTrainingAdmin(user: TrainingSessionUser | null): boolean {
  return user?.role === "admin";
}

export function createSessionUser(params: {
  id: string;
  email: string;
  displayName: string;
  role: TrainingRoleId;
  source: TrainingSessionSource;
  profileId?: string;
  authUserId?: string;
  isActive?: boolean;
  note?: string;
  supabaseAccessToken?: string;
  supabaseRefreshToken?: string;
  supabaseExpiresAt?: number;
}): TrainingSessionUser {
  const accessibleRoles =
    params.role === "admin" ? allTrainingRoleIds : [params.role];

  return {
    id: params.id,
    email: normalizeEmail(params.email),
    displayName: params.displayName,
    role: params.role,
    roleLabel: roleIdToLabel[params.role],
    accessibleRoles,
    source: params.source,
    profileId: params.profileId,
    authUserId: params.authUserId,
    isActive: params.isActive ?? true,
    note: params.note,
    supabaseAccessToken: params.supabaseAccessToken,
    supabaseRefreshToken: params.supabaseRefreshToken,
    supabaseExpiresAt: params.supabaseExpiresAt
  };
}
