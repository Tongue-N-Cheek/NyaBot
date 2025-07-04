import { Projects } from "./projects.ts";
import type { Command } from "./types/command.ts";

export function CheckDotenv() {
	if (!("DISCORD_TOKEN" in process.env)) throw new Error("DISCORD_TOKEN not found in .env");
	if (!("DISCORD_CLIENT_ID" in process.env)) throw new Error("DISCORD_CLIENT_ID not found in .env");
	if (!("DISCORD_GUILD_ID" in process.env)) throw new Error("DISCORD_GUILD_ID not found in .env");
	if (!("COMMANDS_DIR" in process.env)) throw new Error("COMMANDS_DIR not found in .env");
	if (!("DATA_DIR" in process.env)) throw new Error("DATA_DIR not found in .env");
	if (!("DEFAULT_PROJECT" in process.env)) throw new Error("DEFAULT_PROJECT not found in .env");
	if (!Projects.includes(process.env.DEFAULT_PROJECT as any)) throw new Error("DEFAULT_PROJECT is not a valid project");
	if (!("DEFAULT_REMINDER_MINUTES" in process.env)) throw new Error("DEFAULT_REMINDER_MINUTES not found in .env");
	if (isNaN(Number(process.env.DEFAULT_REMINDER_MINUTES))) throw new Error("DEFAULT_REMINDER_MINUTES is not a number");
	if (Number(process.env.DEFAULT_REMINDER_MINUTES) < 0) throw new Error("DEFAULT_REMINDER_MINUTES cannot be negative");
}

type ValidatedCommand = { isValid: true; command: Command } | { isValid: false; command: any };

export function CheckCommand(command: any): ValidatedCommand {
	if (!("data" in command)) return { isValid: false, command };
	if (!("Execute" in command)) return { isValid: false, command };

	return { isValid: true, command };
}
