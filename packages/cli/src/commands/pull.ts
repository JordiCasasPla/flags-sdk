import { writeFile } from "node:fs/promises";
import path from "node:path";
import {
	APP_BASE_URL,
	HttpClient,
	parseFlagsResponse,
} from "@hauses/flags-core";
import { Command } from "commander";
import { loadConfig } from "../utils/config";

export const pullCommand = new Command("pull")
	.description("Fetch flags and generate TypeScript definitions")
	.option("-o, --out <path>", "Output file path", "./flags.d.ts")
	.action(async (options) => {
		const { out } = options;

		let key = null
		const config = await loadConfig();
		if (config.auth?.key) {
			key = config.auth.key;
			console.log("Using cached token");
		}

		if (!key) {
			console.error(
				"Token required. Run 'flags-cli login' first or use --key <token>",
			);
			process.exit(1);
		}

		try {
			console.log("Fetching flags...");
			const client = new HttpClient(key, { baseUrl: APP_BASE_URL.replace("/api/sdk", "/api/cli/") });

			const response = await client.post({
				path: "flags",
				body: {},
			});

			if (!response.ok) {
				throw new Error(
					`Failed to fetch flags: ${response.status} ${response.statusText}`,
				);
			}

			const data = await response.json();
			const flags = parseFlagsResponse(data);
			const flagKeys = Object.keys(flags);

			const typeDefinition = `import "@hauses/react-sdk";

declare module "@hauses/react-sdk" {
  export interface FlagValues {
${flagKeys.map((k) => `    "${k}": boolean;`).join("\n")}
  }
}
`;

			const outputPath = path.resolve(process.cwd(), out);
			await writeFile(outputPath, typeDefinition);

			console.log(`Generated: ${outputPath}`);
			console.log(`Found ${flagKeys.length} flags`);
		} catch (error) {
			console.error("Error:", error);
			process.exit(1);
		}
	});
