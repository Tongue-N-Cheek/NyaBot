import { SlashCommandBuilder, CommandInteraction } from "discord.js";

import type { Command } from "../types/command.ts";

export const command = {
	data: new SlashCommandBuilder()
		.setName("checkin")
		.setDescription("Check in to start logging your time"),
	Execute: async (interaction: CommandInteraction) => {
		await interaction.reply(`checkin was run by ${interaction.user.username}`);
	}
} satisfies Command;
