
export function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function invariant(condition: any, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }

  return
}

export class Logger {
  private debug: boolean;

  constructor(debug: boolean = false) {
    this.debug = debug;
  }

  log(message: string, ...args: any[]) {
    if (this.debug) {
      console.log(`[HausesFlags] ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]) {
    // Always log errors, but prefix them so they're traceable
    console.error(`[HausesFlags Error] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]) {
    console.warn(`[HausesFlags Warn] ${message}`, ...args);
  }
}
