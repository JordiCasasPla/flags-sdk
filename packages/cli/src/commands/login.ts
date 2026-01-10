import { Command } from "commander";
import open from "open";
import { saveConfig } from "../utils/config";
import { APP_BASE_URL } from "@hauses/flags-core";

const LOGIN_PORT = 8910;
const LOGIN_CALLBACK_URL = `http://localhost:${LOGIN_PORT}`;
// Assuming APP_BASE_URL points to api/sdk, we need the app url. 
// Based on grep output: https://app.flags.hauses.dev/api/sdk
// We want: https://app.flags.hauses.dev/cli/login
const AUTH_URL = APP_BASE_URL.replace("/api/sdk", "/cli/login");

export const loginCommand = new Command("login")
  .description("Login to Flags")
  .action(async () => {
    console.log("Waiting for authentication...");

    const server = Bun.serve({
      port: LOGIN_PORT,
      async fetch(req) {
        const url = new URL(req.url);
        const key = url.searchParams.get("key");

        if (key) {
          try {
            await saveConfig({ 
              auth: {
                key,
                type: "publishable",
                host: APP_BASE_URL
              }
            });
            console.log("✅ Successfully logged in!");
            
            // Allow time for the response to be sent before shutting down
            setTimeout(() => {
                server.stop();
                process.exit(0);
            }, 100);

            return new Response(
              "<html><body><h1>Authentication successful!</h1><p>You can close this tab and return to the terminal.</p><script>window.close()</script></body></html>",
              { headers: { "Content-Type": "text/html" } }
            );
          } catch (error) {
            console.error("❌ Failed to save credentials", error);
            return new Response("Internal Server Error", { status: 500 });
          }
        }

        return new Response("Missing key parameter", { status: 400 });
      },
    });

    const loginUrl = `${AUTH_URL}?callback=${LOGIN_CALLBACK_URL}`;
    console.log(`Opening browser to: ${loginUrl}`);
    await open(loginUrl);
    
    // Keep process alive
  });
