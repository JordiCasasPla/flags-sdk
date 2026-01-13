const STORAGE_KEY_PREFIX = "flags-sdk-override:";

/**
 * Dispatch a custom event to notify listeners of override changes
 */
function dispatchOverrideChangeEvent() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("flags-override-changed"));
  }
}

/**
 * Get a flag override from sessionStorage
 * @param key - The flag key
 * @returns The override value or null if not set
 */
export function getOverride(key: string): boolean | null {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return null;
  }

  const storageKey = `${STORAGE_KEY_PREFIX}${key}`;
  const value = sessionStorage.getItem(storageKey);

  if (value === null) {
    return null;
  }

  return value === "true";
}

/**
 * Set a flag override in sessionStorage
 * @param key - The flag key
 * @param value - The override value
 */
export function setOverride(key: string, value: boolean): void {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return;
  }

  const storageKey = `${STORAGE_KEY_PREFIX}${key}`;
  sessionStorage.setItem(storageKey, value.toString());
  dispatchOverrideChangeEvent();
}

/**
 * Clear a specific flag override from sessionStorage
 * @param key - The flag key
 */
export function clearOverride(key: string): void {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return;
  }

  const storageKey = `${STORAGE_KEY_PREFIX}${key}`;
  sessionStorage.removeItem(storageKey);
  dispatchOverrideChangeEvent();
}

/**
 * Clear all flag overrides from sessionStorage
 */
export function clearAllOverrides(): void {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return;
  }

  const keysToRemove: string[] = [];

  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
      keysToRemove.push(key);
    }
  }

  for (const key of keysToRemove) {
    sessionStorage.removeItem(key);
  }
  
  dispatchOverrideChangeEvent();
}

/**
 * Get all flag overrides from sessionStorage
 * @returns A map of flag keys to their override values
 */
export function getAllOverrides(): Record<string, boolean> {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return {};
  }

  const overrides: Record<string, boolean> = {};

  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
      const flagKey = key.replace(STORAGE_KEY_PREFIX, "");
      const value = sessionStorage.getItem(key);
      if (value !== null) {
        overrides[flagKey] = value === "true";
      }
    }
  }

  return overrides;
}

/**
 * Check if a flag has an override set
 * @param key - The flag key
 * @returns True if an override exists
 */
export function hasOverride(key: string): boolean {
  return getOverride(key) !== null;
}
