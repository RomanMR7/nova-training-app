import { describe, expect, it } from "vitest";
import { roles } from "./training-content";
import {
  roleIdToLabel,
  roleLabelToId,
  trainingUsers,
  type TrainingRoleId
} from "./training-users";

describe("training role mapping", () => {
  const expectedMapping: Record<TrainingRoleId, (typeof roles)[number]> = {
    admin: "ADMIN",
    teamlead_manager: "TEAMLEAD_MANAGER",
    trader_manager: "TRADER_MANAGER",
    trader: "TRADER",
    merchant: "MERCHANT",
    merchant_manager: "MERCHANT_MANAGER",
    head_support: "HEAD_SUPPORT",
    support: "SUPPORT"
  };

  it("keeps role ids, labels, and demo users aligned", () => {
    expect(roleIdToLabel).toEqual(expectedMapping);

    for (const [roleId, roleLabel] of Object.entries(expectedMapping)) {
      expect(roleLabelToId[roleLabel]).toBe(roleId);
    }

    expect(trainingUsers.map((user) => user.role)).toEqual(Object.keys(expectedMapping));
    expect(roles).toEqual(Object.values(expectedMapping));
  });
});
