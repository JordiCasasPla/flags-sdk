import { ConsoleLogger, type Logger } from "./logger";

const ONE_SECOND_MS = 1000;
const ONE_MINUTE = 60 * ONE_SECOND_MS;

export default class RateLimiter {
  private events: Record<string, number[]> = {};

  constructor(
    private eventsPerMinute: number,
    private logger: Logger = new ConsoleLogger(),
  ) { }

  public rateLimited<R>(key: string, func: () => R): R | undefined {
    const date = Date.now();

    if (!this.events[key]) {
      this.events[key] = [];
    }

    const events = this.events[key];

    while (events.length > 0 && date - events[0]! > ONE_MINUTE) {
      events.shift();
    }

    if (events.length >= this.eventsPerMinute) {
      this.logger.warn(`Rate limit exceeded for key: ${key}`);
      return undefined;
    }

    events.push(date);
    return func();
  }
}
