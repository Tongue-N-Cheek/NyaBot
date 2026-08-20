import { Collection } from "discord.js";
import { readdirSync } from "node:fs";
import { isAbsolute, join } from "node:path";

import { CheckCommand } from "./errorChecker.ts";

import type { Command } from "./types/command.ts";

const commandExtension = /\.ts|\.js$/;

export async function GetCommands() {
	const commandsDirRaw = process.env.COMMANDS_DIR || "./commands";
	const commandsDir = isAbsolute(commandsDirRaw) ? commandsDirRaw : join(import.meta.dirname, commandsDirRaw);

	const commandModules = readdirSync(commandsDir).filter(file => commandExtension.test(file));
	const commands = new Collection<string, Command>();

	for (const commandFile of commandModules) {
		const command = (await import(`file://${join(commandsDir, commandFile)}`))?.command;

		const { isValid, command: validatedCommand } = CheckCommand(command);
		if (isValid) {
			console.log(`Registered command: ${validatedCommand.data.name}`);
		} else {
			console.error(`Invalid command: ${commandFile}`);
			continue;
		}

		commands.set(validatedCommand.data.name, validatedCommand);
	}

	console.log(`Registered ${commands.size} total commands.`);

	return commands;
}
