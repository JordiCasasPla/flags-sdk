import { FLAG_EVENTS_PER_MIN } from "../config";
import type { FlagsContext } from "./context";
import { HttpClient, type HttpClientOptions } from "./http-client";
import { ConsoleLogger, type Logger } from "./logger";
import { getAllOverrides, getOverride } from "./override-flags";
import RateLimiter from "./rate-limiter";

type Events = "user_context" | "check_flag_access";

type CheckFlagAccessPayload = {
  flagKey: string;
  context: FlagsContext;
};

type EventPayload<T extends Events> = T extends "user_context"
  ? FlagsContext
  : T extends "check_flag_access"
  ? CheckFlagAccessPayload
  : never;

export interface Flag {
  /**
   * This is the key of the feature flag
   */
  key: string;
  /**
   * Handles the value of feature flag
   * @default false
   */
  isEnabled: boolean;
}

export type RawFlags = Record<string, Flag>;

export function parseFlagsResponse(data: Awaited<Promise<Flag[]>>): RawFlags {
  if (!data || !Array.isArray(data)) {
    throw new Error("Invalid flags response");
  }

  const flags: RawFlags = {};
  for (const flag of data) {
    flags[flag.key] = flag;
  }

  return flags;
}

export interface FlagsClientOptions extends HttpClientOptions {
  logger?: Logger;
}

/**
 * @internal
 * For v1 lets ommit frontend cache so the cliens will fetch api directlly and api with redis will
 * handle reate limits and caching lets focus now in serve featureFlags
 */
export class FlagsClient {
  private initialized = false;

  private fetchedFlags: RawFlags = {};
  private rateLimiter: RateLimiter;
  private httpClient: HttpClient;
  private logger: Logger;

  /**
   * Initializes the Flags client
   * @param publishableKey this is the publishable key to make requests to the api
   * @param context this context is used for the targeting and event tracking
   * @param options this is the options for the http client and logger
   */
  constructor(
    publishableKey: string,
    private context: FlagsContext,
    options?: FlagsClientOptions,
  ) {
    this.logger = options?.logger ?? new ConsoleLogger();
    this.httpClient = new HttpClient(publishableKey, options);
    this.rateLimiter = new RateLimiter(FLAG_EVENTS_PER_MIN, this.logger);
  }

  async initialize() {
    if (this.initialized) {
      throw new Error("FlagsClient is already initialized");
    }
    this.initialized = true;
    await this.fetchFlags();
  }

  setContext(context: FlagsContext) {
    this.context = context;
  }

  getFlags() {
    const overrides = getAllOverrides();
    const mergedFlags: RawFlags = { ...this.fetchedFlags };

    for (const [key, isEnabled] of Object.entries(overrides)) {
      if (mergedFlags[key]) {
        mergedFlags[key] = { ...mergedFlags[key], isEnabled };
      } else {
        mergedFlags[key] = { key, isEnabled };
      }
    }

    return mergedFlags;
  }

  getFlag(key: string): boolean {
    const override = getOverride(key);
    if (override !== null) {
      return override;
    }

    const flag = this.fetchedFlags[key];
    const isEnabled = flag?.isEnabled ?? false;

    void this.sendEvent("check_flag_access", { flagKey: key, context: this.context });

    return isEnabled;
  }

  isInitialized() {
    return this.initialized;
  }

  async fetchFlags() {
    try {
      const canFetch = this.rateLimiter.rateLimited("fetch_flags", () => true);

      if (!canFetch) {
        return this.fetchedFlags;
      }

      const response = await this.httpClient.post({
        path: "flags",
        body: this.context,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch flags");
      }

      const flags = parseFlagsResponse(await response.json());

      this.fetchedFlags = flags;
      return flags;
    } catch {
      this.logger.error("Error fetching flags");
    }
  }

  async sendEvent(
    event: Events,
    payload: EventPayload<Events>,
    callback?: () => void,
  ) {
    try {
      const rateLimitKey =
        event === "check_flag_access"
          ? `${event}:${(payload as CheckFlagAccessPayload).flagKey}`
          : event;

      const canFetch = this.rateLimiter.rateLimited(rateLimitKey, () => true);

      if (!canFetch) {
        return;
      }

      const response = await this.httpClient.post({
        path: "/events",
        body: {
          event,
          payload,
          context: this.context,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to send event");
      }

      callback?.();
    } catch {
      // Swallow errors for now
      this.logger.error("Unable to send event");
    }
  }
}
