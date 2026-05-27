import type { Role } from "./training-content";

export type TrainingRoleId = "admin" | "support" | "merchant" | "trader" | "provider";

export interface TrainingUser {
  id: string;
  email: string;
  displayName: string;
  role: TrainingRoleId;
  roleLabel: Role;
  password: string;
  accessibleRoles: TrainingRoleId[];
}

export type TrainingSessionUser = Omit<TrainingUser, "password">;

export const roleIdToLabel: Record<TrainingRoleId, Role> = {
  admin: "Администратор",
  support: "Саппорт",
  merchant: "Мерчант",
  trader: "Трейдер",
  provider: "Провайдер"
};

export const roleLabelToId: Record<Role, TrainingRoleId> = {
  Администратор: "admin",
  Саппорт: "support",
  Мерчант: "merchant",
  Трейдер: "trader",
  Провайдер: "provider"
};

const allTrainingRoleIds: TrainingRoleId[] = [
  "admin",
  "support",
  "merchant",
  "trader",
  "provider"
];

export const trainingUsers: TrainingUser[] = [
  {
    id: "training-admin",
    email: "admin@training.local",
    displayName: "Учебный администратор",
    role: "admin",
    roleLabel: "Администратор",
    password: "Training123!",
    accessibleRoles: allTrainingRoleIds
  },
  {
    id: "training-support",
    email: "support@training.local",
    displayName: "Учебный саппорт",
    role: "support",
    roleLabel: "Саппорт",
    password: "Training123!",
    accessibleRoles: ["support"]
  },
  {
    id: "training-merchant",
    email: "merchant@training.local",
    displayName: "Учебный мерчант",
    role: "merchant",
    roleLabel: "Мерчант",
    password: "Training123!",
    accessibleRoles: ["merchant"]
  },
  {
    id: "training-trader",
    email: "trader@training.local",
    displayName: "Учебный трейдер",
    role: "trader",
    roleLabel: "Трейдер",
    password: "Training123!",
    accessibleRoles: ["trader"]
  },
  {
    id: "training-provider",
    email: "provider@training.local",
    displayName: "Учебный провайдер",
    role: "provider",
    roleLabel: "Провайдер",
    password: "Training123!",
    accessibleRoles: ["provider"]
  }
];

function normalizeEmail(email: string): string {
  return email.trim().toLocaleLowerCase("en-US");
}

function toSessionUser(user: TrainingUser): TrainingSessionUser {
  const { password: _password, ...sessionUser } = user;
  return sessionUser;
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
