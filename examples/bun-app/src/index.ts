import { HausesFlagsClient } from "node-sdk";
const MAX_INTERVAL_MS = 50_000;

// Initialize the client
const client = new HausesFlagsClient({
  secretKey: "test-api-key",
  debug: true
});

console.log("🚀 Client initialized");

// Mock context for a user
const context = {
  user: {
    key: "user-123",
  },
  company: {
    key: "company-456",
  },
};

console.log("\n--- Checking flags ---");

const featureEnabled = client.getFlag("test", context, false);
console.log(`[Flag] new-feature: ${featureEnabled ? "✅ Enabled" : "❌ Disabled"}`);

const betaAccess = client.getFlag("beta-access", context, false);
console.log(`[Flag] beta-access: ${betaAccess ? "✅ Enabled" : "❌ Disabled"}`);


console.log("Waiting for flag checks... (Press Ctrl+C to stop)");
