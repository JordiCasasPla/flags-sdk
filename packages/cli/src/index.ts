#!/usr/bin/env node
import { Command } from "commander";
import { pullCommand } from "./commands/pull";
import { loginCommand } from "./commands/login";

const version = "0.1.0";

const program = new Command();

program
  .name("flags-cli")
  .description("CLI to generate types for Flags SDK")
  .version(version);

program.addCommand(loginCommand);
program.addCommand(pullCommand);

program.parse();
