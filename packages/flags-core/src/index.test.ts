import { describe, expect, test } from "bun:test";
import { IS_SERVER } from "../config";

describe("Core Configuration", () => {
  test("IS_SERVER should be true in test environment", () => {
    expect(IS_SERVER).toBe(true);
  });
});
