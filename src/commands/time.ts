import { SlashCommandBuilder, CommandInteraction, MessageFlags } from "discord.js";

import { GetHistory } from "../data.ts";
import { formatTime } from "../timeFormatter.ts";
import { CreateDefaultEmbed } from "../nyaEmbedBuilder.ts";

import type { Command } from "../types/command.ts";

export const command = {
	data: new SlashCommandBuilder()
		.setName("time")
		.setDescription("View your time logged"),
	Execute: async (interaction: CommandInteraction) => {
		const history = Object.entries(GetHistory(interaction.client, interaction.user.id));

		const startOfWeek = Number(process.env.START_OF_WEEK);
		const now = Temporal.Now.zonedDateTimeISO(process.env.TIMEZONE).subtract({ days: 1 });
		let weekCutoff = now.toPlainDate();

		while (weekCutoff.dayOfWeek !== startOfWeek) weekCutoff = weekCutoff.subtract({ days: 1 });

		const startOfWeekMidnight = Math.floor(
			weekCutoff
				.toPlainDateTime("00:00")
				.toZonedDateTime(now.timeZoneId)
				.toInstant()
				.epochMilliseconds
			/ 1000
		);

		const timeTotalsPerProject = history
			.map(([project, history]) => ({
				project,
				weekTime: history.reduce((total, session) => {
					if (Number(session.start) < startOfWeekMidnight) return total;
					return total + Number(session.end) - Number(session.start);
				}, 0),
				totalTime: history.reduce((total, session) => {
					return total + Number(session.end) - Number(session.start);
				}, 0)
			}))
			.sort((a, b) => b.weekTime - a.weekTime);

		const weekTotal = timeTotalsPerProject.reduce((total, session) => total + session.weekTime, 0);
		const overallTotal = timeTotalsPerProject.reduce((total, session) => total + session.totalTime, 0);

		await interaction.reply({
			embeds: [
				CreateDefaultEmbed(interaction)
					.setTitle("Time Logged")
					.setDescription(
						timeTotalsPerProject.map(({ project, weekTime, totalTime }, index) => {
							return (
								`${index + 1}. ${project}: ${formatTime(totalTime)}`
								+ (weekTime === 0 ? "" : `\n  - This week: ${formatTime(weekTime)}`)
							);
						}).join("\n")
					)
					.setFooter({
						text:
							`Across all projects: ${formatTime(overallTotal)}`
							+ (weekTotal === 0 ? "" : `\nThis Week: ${formatTime(weekTotal)}`)
					})
					.setColor(0x0099ff)
			],
			flags: MessageFlags.Ephemeral
		});
	}
} satisfies Command;
