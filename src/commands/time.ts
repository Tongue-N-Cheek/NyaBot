import { SlashCommandBuilder, CommandInteraction, EmbedBuilder, MessageFlags } from "discord.js";

import { GetHistory } from "../data.ts";
import { formatTime } from "../timeFormatter.ts";
import type { Command } from "../types/command.js";

export const command = {
	data: new SlashCommandBuilder()
		.setName("time")
		.setDescription("View total time logged for a project"),
	Execute: async (interaction: CommandInteraction) => {
		const history = GetHistory(interaction.client, interaction.user.id);

		const timeTotals = Object.entries(history)
			.map(([project, history]) => ({
				project,
				time: history.reduce((total, session) => {
					return total + Number(session.end) - Number(session.start);
				}, 0)
			}))
			.sort((a, b) => b.time - a.time);

		const total = timeTotals.reduce((total, session) => total + session.time, 0);

		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle("Time Logged")
					.setDescription(
						timeTotals.map(({ project, time }, index) => {
							return `${index + 1}. ${project}: ${formatTime(time)}`;
						}).join("\n")
					)
					.setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
					.setFooter({ text: `Total: ${Math.floor(total / 60 / 60)} hours` })
					.setColor(0x0099ff)
			],
			flags: MessageFlags.Ephemeral
		});
	}
} satisfies Command;
