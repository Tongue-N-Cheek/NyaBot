import { Collection } from "discord.js";
import { readdirSync } from "node:fs";
import { isAbsolute, join } from "node:path";

import { CheckCommand } from "./errorChecker.ts";

import type { Command } from "./types/command.ts";

export async function GetCommands() {
	const commandsDirRaw = process.env.COMMANDS_DIR || "commands";
	const commandsDir = isAbsolute(commandsDirRaw) ? commandsDirRaw : join(import.meta.dirname, commandsDirRaw);

	const commandModules = readdirSync(commandsDir).filter(file => file.endsWith(".ts"));
	const commands = new Collection<string, Command>();

	for (const commandFile of commandModules) {
		const command = (await import(`file://${join(commandsDir, commandFile)}`))?.command;

		const { isValid, command: validatedCommand } = CheckCommand(command);
		if (!isValid) {
			console.error(`Invalid command: ${commandFile}`);
			continue;
		}

		commands.set(validatedCommand.data.name, validatedCommand);
	}

	return commands;
}
