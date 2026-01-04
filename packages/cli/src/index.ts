#!/usr/bin/env node
import { Command } from "commander";
import { HttpClient, parseFlagsResponse } from "@hauses/flags-core";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const version = "0.1.0";

const program = new Command();

program
  .name("flags-cli")
  .description("CLI to generate types for Flags SDK")
  .version(version);

program
  .command("pull")
  .description("Fetch flags and generate TypeScript definitions")
  .option("-k, --key <key>", "Publishable Key")
  .option("-e, --env <variable>", "Environment variable name containing the key")
  .option("-o, --out <path>", "Output file path", "./flags.d.ts")
  .action(async (options) => {
    let { key, env, out } = options;

    // Priority: --key, then --env, then $VARIABLE syntax
    if (env) {
      key = process.env[env];
      if (!key) {
        console.error(`❌ Error: Environment variable ${env} is not set.`);
        process.exit(1);
      }
    } else if (key && key.startsWith("$")) {
      key = process.env[key.slice(1)];
    }

    if (!key) {
      console.error("❌ Error: Publishable Key is missing.");
      console.error("Use --key <key>, --env <variable>, or --key $VARIABLE");
      process.exit(1);
    }

    try {
      console.log("Fetching flags...");
      const client = new HttpClient(key);

      const response = await client.post({
        path: "flags",
        body: {},
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch flags: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      const flags = parseFlagsResponse(data as any);
      const flagKeys = Object.keys(flags);

      if (flagKeys.length === 0) {
        console.warn("Warning: No flags found.");
      }

      const typeDefinition = `import "@hauses/react-sdk";

      declare module "@hauses/react-sdk" {
        export interface FlagValues {
      ${flagKeys.map((key) => `    "${key}": boolean;`).join("\n")}
        }
      }
      `;

      const outputPath = path.resolve(process.cwd(), out);
      await writeFile(outputPath, typeDefinition);

      console.log(`✅ Successfully generated types at ${outputPath}`);
      console.log(`Found ${flagKeys.length} flags:`);
      flagKeys.forEach(key => console.log(` - ${key}`));

    } catch (error) {
      console.error("❌ Error generating types:", error);
      process.exit(1);
    }
  });

program.parse();
