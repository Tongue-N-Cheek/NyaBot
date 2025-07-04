import "dotenv/config";

import { Events, GatewayIntentBits } from "discord.js";

import { CheckDotenv } from "./errorChecker.ts";
import { GetCommands } from "./getCommands.ts";
import { NyaClient } from "./nyaClient.ts";

CheckDotenv();

const client = new NyaClient({
	intents: [GatewayIntentBits.Guilds]
});

client.commands = await GetCommands();

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	console.log(`Command ${interaction.commandName} was run by ${interaction.user.tag}`);
	const command = interaction.client.commands.get(interaction.commandName);
	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.Execute(interaction);
	} catch (error) {
		console.error("Internal error while executing command:\n", error);
		await interaction.reply({
			content: "There was an error while executing this command!",
			ephemeral: true
		});
	}
});

client.login(process.env.DISCORD_TOKEN);
