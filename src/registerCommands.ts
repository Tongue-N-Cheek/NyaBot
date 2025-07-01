import "dotenv/config";

import { REST, Routes } from "discord.js";

import { GetCommands } from "./getCommands.ts";
import { CheckDotenv } from "./errorChecker.ts";

CheckDotenv();

const commands = await GetCommands();
const rest = new REST().setToken(process.env.DISCORD_TOKEN || "");

console.log(`Invalidating guild slash command cache for guild id: ${process.env.DISCORD_GUILD_ID}`);

try {
	const data = await rest.put(
		Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID || "", process.env.DISCORD_GUILD_ID || ""),
		{ body: commands.map(command => command.data.toJSON()) }
	) as { length: number };

	console.log(`Finished. ${data.length} commands were registered.`);
} catch (error) {
	console.error(error);
}
