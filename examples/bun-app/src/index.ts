import { HausesFlagsClient } from "node-sdk";

const HAUSES_FLAGS_SECRET = process.env.HAUSES_FLAGS_SECRET;

if (!HAUSES_FLAGS_SECRET) {
  console.error("Please set the HAUSES_FLAGS_SECRET environment variable.");
  process.exit(1);
}

const client = new HausesFlagsClient({
  secretKey: process.env.HAUSES_FLAGS_SECRET!,
  debug: true
});

await client.initialize();


// Mock context for a user
const context = {
  user: {
    key: "user_12345",
  },
  company: {
    key: "company_67890",
  },
};

console.log("\n--- Checking flags ---");

const featureEnabled = client.getFlag("test", context, false);
console.log(`[Flag] test: ${featureEnabled ? "✅ Enabled" : "❌ Disabled"}`);

console.log("Waiting for flag checks... (Press Ctrl+C to stop)");
