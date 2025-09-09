import { Temporal } from "temporal-polyfill";

import { Projects } from "./projects.ts";
import type { Command } from "./types/command.ts";

export function CheckDotenv() {
	CheckExists("DISCORD_TOKEN");
	CheckExists("DISCORD_CLIENT_ID");
	CheckExists("DISCORD_GUILD_ID");
	CheckExists("COMMANDS_DIR");
	CheckExists("DATA_DIR");
	CheckExists("TIMEZONE");
	try {
		Temporal.Now.zonedDateTimeISO(process.env.TIMEZONE);
	} catch {
		throw new Error("TIMEZONE is not a valid timezone");
	}
	CheckEnum("START_OF_WEEK", ["1", "2", "3", "4", "5", "6", "7"], "START_OF_WEEK is not a valid day of the week (1-7)");
	CheckEnum("DEFAULT_PROJECT", Projects, "DEFAULT_PROJECT is not a valid project");
	CheckInteger("DEFAULT_REMINDER_MINUTES");
	CheckBounds("DEFAULT_REMINDER_MINUTES", 0, undefined);
	CheckInteger("MAXIMUM_IMMEDIATE_TIME_SECONDS");
	CheckBounds("MAXIMUM_IMMEDIATE_TIME_SECONDS", -1, undefined);
}

function CheckExists(key: string, errorMessage?: string) {
	if (!(key in process.env)) throw new Error(errorMessage ?? `${key} not found in .env`);
}

function CheckEnum(key: string, enumValues: string[], errorMessage?: string) {
	CheckExists(key, errorMessage);
	if (!enumValues.includes(process.env[key]!)) throw new Error(errorMessage ?? `${key} is not a valid value`);
}

function CheckNumber(key: string, errorMessage?: string) {
	CheckExists(key, errorMessage);
	if (isNaN(Number(process.env[key]))) throw new Error(errorMessage ?? `${key} is not a number`);
}

function CheckInteger(key: string, errorMessage?: string) {
	CheckNumber(key, errorMessage);
	if (Math.floor(Number(process.env[key])) - Number(process.env[key])) throw new Error(errorMessage ?? `${key} is not an integer`);
}

function CheckBounds(key: string, min?: number, max?: number, errorMessage?: string) {
	CheckNumber(key, errorMessage);
	if (
		(min !== undefined && Number(process.env[key]) < min)
		|| (max !== undefined && Number(process.env[key]) > max)
	) {
		throw new Error(errorMessage ?? `${key} must be between ${min} and ${max}`);
	}
}

type ValidatedCommand = { isValid: true; command: Command } | { isValid: false; command: any };

export function CheckCommand(command: any): ValidatedCommand {
	if (!("data" in command)) return { isValid: false, command };
	if (!("Execute" in command)) return { isValid: false, command };

	return { isValid: true, command };
}
