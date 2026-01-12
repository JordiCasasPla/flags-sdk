import path from "node:path";
import { homedir } from "node:os";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

const CONFIG_DIR = path.join(homedir(), ".flags");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

export interface AuthConfig {
  key: string;
  type: "publishable" | "user"; // Prepared for future user tokens
  host?: string;
}

export interface GlobalConfig {
  auth?: AuthConfig;
  last_updated?: string;
}

export async function saveConfig(config: GlobalConfig): Promise<void> {
  if (!existsSync(CONFIG_DIR)) {
    await mkdir(CONFIG_DIR, { recursive: true });
  }

  const existingConfig = await loadConfig();
  const newConfig = { 
    ...existingConfig, 
    ...config,
    last_updated: new Date().toISOString()
  };

  await writeFile(CONFIG_FILE, JSON.stringify(newConfig, null, 2), "utf-8");
}

export async function loadConfig(): Promise<GlobalConfig> {
  if (!existsSync(CONFIG_FILE)) {
    return {};
  }

  try {
    const content = await readFile(CONFIG_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}
