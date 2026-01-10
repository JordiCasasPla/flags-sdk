import { test, expect } from "bun:test";
import { isFlagEnabled } from "./evaluate-flags";
import type { Flag, FlagsContext } from "./types";

// Test data
const basicFlag: Flag = {
  key: "test-flag",
  name: "Test Flag",
  isEnabled: false,
  isArchived: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  rules: [
    {
      operator: "ALL",
    },
  ],
};

const userContext: FlagsContext = {
  user: { key: "user-123" },
  company: { key: "company-456" },
};

const companyContext: FlagsContext = {
    user: { key: "user-999" },
    company: { key: "company-789" },
};


test("Legacy: ALL operator enables flag for everyone", () => {
  const result = isFlagEnabled("test-flag", [basicFlag], userContext);
  expect(result.isEnabled).toBe(true);
});

test("Legacy: NONE operator disables flag for everyone", () => {
  const noneFlag: Flag = { ...basicFlag, rules: [{ operator: "NONE" }] };
  const result = isFlagEnabled("test-flag", [noneFlag], userContext);
  expect(result.isEnabled).toBe(false);
});

test("Legacy: SOME operator with userIds", () => {
  const someFlag: Flag = {
    ...basicFlag,
    rules: [
      {
        operator: "SOME",
        userIds: ["user-123", "user-456"],
      },
    ],
  };

  // Match
  expect(isFlagEnabled("test-flag", [someFlag], userContext).isEnabled).toBe(true);

  // No match
  expect(
    isFlagEnabled("test-flag", [someFlag], { ...userContext, user: { key: "other" } }).isEnabled
  ).toBe(false);
});

test("Legacy: SOME operator with companyIds", () => {
  const someFlag: Flag = {
    ...basicFlag,
    rules: [
      {
        operator: "SOME",
        companyIds: ["company-456"],
      },
    ],
  };

  // Match
  expect(isFlagEnabled("test-flag", [someFlag], userContext).isEnabled).toBe(true);

  // No match
  expect(
    isFlagEnabled("test-flag", [someFlag], { ...userContext, company: { key: "other" } })
      .isEnabled
  ).toBe(false);
});

test("Legacy: SOME operator with Rollout Percentage", () => {
    // We need a specific key/user pair that we know hashes to < 50% (or > 50%)
    // With sha256:
    // hash("rollout-flag.user-1") -> ...
    // Let's rely on deterministic behavior.

    const rolloutFlag: Flag = {
        ...basicFlag,
        key: 'rollout-flag',
        rules: [{
            operator: 'SOME',
            rolloutPercentage: 100
        }]
    }

    expect(isFlagEnabled('rollout-flag', [rolloutFlag], userContext).isEnabled).toBe(true);

    const noRolloutFlag: Flag = {
        ...basicFlag,
        key: 'rollout-flag',
        rules: [{
            operator: 'SOME',
            rolloutPercentage: 0
        }]
    }
    expect(isFlagEnabled('rollout-flag', [noRolloutFlag], userContext).isEnabled).toBe(false);
});

test("Legacy: SOME operator mixed (User OR Company)", () => {
    const mixedFlag: Flag = {
        ...basicFlag,
        rules: [{
            operator: 'SOME',
            userIds: ['user-123'], // Match
            companyIds: ['company-999'] // No match
        }]
    };

    expect(isFlagEnabled('test-flag', [mixedFlag], userContext).isEnabled).toBe(true);

    const mixedFlag2: Flag = {
        ...basicFlag,
        rules: [{
            operator: 'SOME',
            userIds: ['user-999'], // No match
            companyIds: ['company-456'] // Match
        }]
    };
    expect(isFlagEnabled('test-flag', [mixedFlag2], userContext).isEnabled).toBe(true);
});
