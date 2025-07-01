import { SlashCommandBuilder, CommandInteraction } from "discord.js";

import type { Command } from "../types/command.ts";

export const command = {
	data: new SlashCommandBuilder()
		.setName("checkout")
		.setDescription("Check out to stop logging your time and save it"),
	Execute: async (interaction: CommandInteraction) => {
		await interaction.reply(`checkout was run by ${interaction.user.username}`);
	}
} satisfies Command;
