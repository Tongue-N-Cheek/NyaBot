import { Events, GatewayIntentBits, MessageFlags } from "discord.js";

import { CheckDotenv } from "./errorChecker.ts";
import { GetCommands } from "./getCommands.ts";
import { CreateNyaClient } from "./nyaClient.ts";
import { server } from "./httpServer.ts";
import { GetGlobalKitsuClient } from "./kitsuClient.ts";
import { OnTaskStatusChanged } from "./webhooks/kitsu.ts";

CheckDotenv();

const client = CreateNyaClient({
	intents: [GatewayIntentBits.Guilds]
});

client.commands = await GetCommands();

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	console.log(`Command ${interaction.commandName} was run by ${interaction.user.id}`);
	const command = interaction.client.commands.get(interaction.commandName);
	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.Execute(interaction);
	} catch (error) {
		console.error("Internal error while executing command:\n", error);
		try {
			await interaction.reply({
				content: "There was an error while executing this command!",
				flags: MessageFlags.Ephemeral
			});
		} catch { }
	}
});

server.listen(process.env.HTTP_SERVER_PORT, () => {
	console.log(`HTTP server listening on port ${process.env.HTTP_SERVER_PORT}`);
});

const kitsuClient = GetGlobalKitsuClient();
kitsuClient.AddEventListener("task:status-changed", data => OnTaskStatusChanged(data));

client.login(process.env.DISCORD_TOKEN);
