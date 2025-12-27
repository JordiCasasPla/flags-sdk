import { test, expect } from "bun:test";
import { FlagsProvider, useFlags } from "./index";

test("React SDK exports", () => {
  expect(FlagsProvider).toBeDefined();
  expect(useFlags).toBeDefined();
});
