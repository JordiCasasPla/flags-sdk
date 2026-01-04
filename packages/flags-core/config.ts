import { version } from "./package.json";

export const API_BASE_URL = "http://app.flags.hauses.dev/api/sdk";
export const APP_BASE_URL = "http://app.flags.hauses.dev/api/sdk";

export const SDK_VERSION_HEADER_NAME = "hauses-flags-sdk-version";

export const SDK_VERSION = `browser-sdk/${version}`;
export const FLAG_EVENTS_PER_MIN = 1;
export const FLAGS_EXPIRE_MS = 30 * 24 * 60 * 60 * 1000; // expire entirely after 30 days

export const IS_SERVER = typeof window === "undefined";
