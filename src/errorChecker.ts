import type { Command } from "./types/command.ts";

export function CheckDotenv() {
	if (!("DISCORD_TOKEN" in process.env)) throw new Error("DISCORD_TOKEN not found in .env");
	if (!("DISCORD_CLIENT_ID" in process.env)) throw new Error("DISCORD_CLIENT_ID not found in .env");
	if (!("DISCORD_GUILD_ID" in process.env)) throw new Error("DISCORD_GUILD_ID not found in .env");
	if (!("COMMANDS_DIR" in process.env)) throw new Error("COMMANDS_DIR not found in .env");
}

type ValidatedCommand = { isValid: true; command: Command } | { isValid: false; command: any };

export function CheckCommand(command: any): ValidatedCommand {
	if (!("data" in command)) return { isValid: false, command };
	if (!("Execute" in command)) return { isValid: false, command };

	return { isValid: true, command };
}
