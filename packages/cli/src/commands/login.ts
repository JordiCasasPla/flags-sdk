import http from "node:http";
import { APP_BASE_URL } from "@hauses/flags-core";
import { Command } from "commander";
import open from "open";
import { saveConfig } from "../utils/config";

const LOGIN_PORT = 8910;
const LOGIN_CALLBACK_URL = `http://localhost:${LOGIN_PORT}`;
const AUTH_URL = APP_BASE_URL.replace("/api/sdk", "/api/cli/login");

export const loginCommand = new Command("login")
  .description("Login to Flags CLI")
  .action(async () => {
    console.log("Waiting for authentication...");

    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url || "", `http://localhost:${LOGIN_PORT}`);
      const token = url.searchParams.get("token");
      const error = url.searchParams.get("error");

      if (error) {
        console.error(`Authentication failed: ${error}`);
        server.close();
        process.exit(1);
      }

      if (token) {
        try {
          await saveConfig({
            auth: {
              key: token,
              type: "user"
            }
          });
          console.log("Successfully logged in!");

          setTimeout(() => {
            server.close();
            process.exit(0);
          }, 100);

          res.writeHead(200, { "Content-Type": "text/html" });
          res.end("<html><body><h1>Authentication successful!</h1><p>You can close this tab and return to the terminal.</p></body></html>");
          return;
        } catch (err) {
          console.error("Failed to save credentials:", err);
          res.writeHead(500);
          res.end("Internal Server Error");
          return;
        }
      }

      res.writeHead(400);
      res.end("Missing token");
    });

    server.listen(LOGIN_PORT, () => {
      const loginUrl = `${AUTH_URL}?callback=${LOGIN_CALLBACK_URL}`;
      console.log(`Opening browser: ${loginUrl}`);
      open(loginUrl);
    });
  });
