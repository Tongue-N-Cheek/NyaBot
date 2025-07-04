import { SlashCommandBuilder, CommandInteraction } from "discord.js";

import type { Command } from "../types/command.ts";
import { RefreshCache } from "../cache.ts";

export const command = {
	data: new SlashCommandBuilder()
		.setName("reset")
		.setDescription("Something borked? Reset me!"),
	Execute: async (interaction: CommandInteraction) => {
		interaction.client.data = RefreshCache();
		await interaction.reply(`Reset successful!`);
	}
} satisfies Command;
