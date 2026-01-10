import { HttpClient } from './http-client';
import { isFlagEnabled } from './evaluate-flags';
import { Logger } from './utils';
import RateLimiter from "./rate-limiter";
import {
  type ClientConfig,
  type Flag,
  type FlagsContext,
  type FlagKey,
  type Events,
  type EventPayload,
  type CheckFlagAccessPayload,
} from './types';
import {
  DEFAULT_API_URL,
  DEFAULT_MAX_EVALUATIONS_BEFORE_REFRESH,
  DEFAULT_REFRESH_INTERVAL_MS,
  DEFAULT_TIMEOUT_MS,
  FLAG_EVENTS_PER_MIN,
} from "./constants";

export class HausesFlagsClient {
  private config: Required<Pick<ClientConfig, 'refreshIntervalMs' | 'maxEvaluationsBeforeRefresh' | 'debug'>> & Omit<ClientConfig, 'refreshIntervalMs' | 'maxEvaluationsBeforeRefresh' | 'debug'>;
  private flags: Flag[] = [];
  private lastRefreshedAt: number = 0;
  private evaluationCount: number = 0;
  private logger: Logger;
  private isFetching: boolean = false;
  private rateLimiter: RateLimiter;

  constructor(config: ClientConfig) {
    this.config = {
      refreshIntervalMs: DEFAULT_REFRESH_INTERVAL_MS,
      maxEvaluationsBeforeRefresh: DEFAULT_MAX_EVALUATIONS_BEFORE_REFRESH,
      debug: false,
      ...config,
    };

    this.logger = new Logger(this.config.debug);
    this.rateLimiter = new RateLimiter(FLAG_EVENTS_PER_MIN);

    if (config.defaultFlags) {
      this.flags = Object.values(config.defaultFlags);
    }

    this.initialize()
  }

  /**
   * Initializes the client by fetching flags for the first time.
   * This is optional - getFlag will fetch if needed, but calling this ensures flags are ready.
   */
  async initialize(): Promise<void> {
    await this.fetchFlags();
  }

  /**
   * Gets the evaluated value of a feature flag for the given context.
   * returns true/false safely.
   */
  getFlag(key: FlagKey, context: FlagsContext, defaultValue: boolean = false): boolean {
    try {
      // 1. Silent Refresh Check (Stale-While-Revalidate)
      // We check BEFORE evaluation, so if we just crossed the threshold, this call triggers the refresh
      this.checkAndRefreshToken();

      // 2. Evaluate
      const result = isFlagEnabled(key as string, this.flags, context);

      this.evaluationCount++;

      // Fire and forget event
      void this.sendEvent("check_flag_access", { flagKey: key as string, context });

      // If the flag doesn't exist in our rules, return default (which is passed in defaultValue, or false)
      const flagExists = this.flags.some(f => f.key === key);
      if (!flagExists) {
          return defaultValue;
      }

      return result.isEnabled;

    } catch (error) {
      this.logger.error(`Error evaluating flag ${key}`, error);
      return defaultValue;
    }
  }

  async fetchFlags(): Promise<void> {
    if (this.isFetching) return;

    try {
      this.isFetching = true;
      this.logger.log('Fetching flags...');

      const response = await HttpClient.get<Flag[]>({
        url: `${this.config.baseUrl || DEFAULT_API_URL}/flags`,
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'X-Source': 'node-sdk'
        },
        timeoutMs: DEFAULT_TIMEOUT_MS
      });

      if (response.ok && Array.isArray(response.data)) {
        this.flags = response.data;
        this.lastRefreshedAt = Date.now();
        this.evaluationCount = 0;
        this.logger.log(`Flags updated. Count: ${this.flags.length}`);
      } else {
        this.logger.error('Failed to fetch flags', response.status);
      }
    } catch (error) {
      this.logger.error('Network error fetching flags', error);
    } finally {
      this.isFetching = false;
    }
  }

  private checkAndRefreshToken() {
    const now = Date.now();
    const isStaleByTime = (now - this.lastRefreshedAt) > this.config.refreshIntervalMs;
    const isStaleByCount = this.evaluationCount >= this.config.maxEvaluationsBeforeRefresh;

    if ((isStaleByTime || isStaleByCount) && !this.isFetching) {
      this.logger.log('Flags are stale, triggering background refresh');
      void this.fetchFlags();
    }
  }

  /**
   * Helper to expose raw flags state (useful for debugging)
   */
  getRawFlags(): Flag[] {
    return this.flags;
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

      const response = await HttpClient.post({
        url: `${this.config.baseUrl || DEFAULT_API_URL}/events`,
        body: {
          event,
          payload,
          context: (payload as any).context, // context is part of payload for check_flag_access, but for user_context payload IS context.
                                             // Wait, the API expects { event, payload, context }.
                                             // For check_flag_access: payload is { flagKey, context }. So context is payload.context.
                                             // For user_context: payload is FlagsContext. So context is payload.
        },
        headers: {
            'Authorization': `Bearer ${this.config.secretKey}`,
            'X-Source': 'node-sdk'
        },
        timeoutMs: DEFAULT_TIMEOUT_MS
      });

      if (!response.ok) {
        // throw new Error("Failed to send event");
        this.logger.error("Failed to send event", response.status);
      }

      callback?.();
    } catch (e) {
      // Swallow errors for now
      this.logger.error("Unable to send event", e);
    }
  }
}
