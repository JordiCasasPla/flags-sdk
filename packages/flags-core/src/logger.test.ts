import { expect, test, mock } from "bun:test";
import { FlagsClient } from "./browser-client";
import type { Logger } from "./logger";
import { FLAG_EVENTS_PER_MIN } from "../config";

const mockLogger: Logger = {
    debug: mock(() => { }),
    info: mock(() => { }),
    warn: mock(() => { }),
    error: mock(() => { }),
};

test("FlagsClient uses provided logger", () => {
    const client = new FlagsClient("pk_test", {}, { logger: mockLogger });

    // Force rate limit
    for (let i = 0; i < FLAG_EVENTS_PER_MIN + 5; i++) {
        // @ts-ignore - reaching into private for testing or just trigger event
        // We can trigger sendEvent via getFlag if we mock fetch/response or just ignore error
        // But wait, getFlag calls sendEvent which calls rateLimiter.
        client.getFlag("test-flag");
    }

    expect(mockLogger.warn).toHaveBeenCalled();
});
