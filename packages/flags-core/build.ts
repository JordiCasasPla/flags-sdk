import { build } from "bun";

console.log(
  `
  ██╗  ██╗ █████╗ ██╗   ██╗███████╗███████╗███████╗    ███████╗██╗      █████╗  ██████╗ ███████╗
██║  ██║██╔══██╗██║   ██║██╔════╝██╔════╝██╔════╝    ██╔════╝██║     ██╔══██╗██╔════╝ ██╔════╝
███████║███████║██║   ██║███████╗█████╗  ███████╗    █████╗  ██║     ███████║██║  ███╗███████╗
██╔══██║██╔══██║██║   ██║╚════██║██╔══╝  ╚════██║    ██╔══╝  ██║     ██╔══██║██║   ██║╚════██║
██║  ██║██║  ██║╚██████╔╝███████║███████╗███████║    ██║     ███████╗██║  ██║╚██████╔╝███████║
╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝╚══════╝    ╚═╝     ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝
                                                                                                `,
);

const result = await build({
  entrypoints: ["./index.ts"],
  outdir: "./dist",
  minify: true,
  sourcemap: "external",
  target: "browser",
  format: "esm",
});

if (!result.success) {
  console.error("Build failed");
  for (const message of result.logs) {
    console.error(message);
  }
  process.exit(1);
}

console.log("Build complete ✅");
