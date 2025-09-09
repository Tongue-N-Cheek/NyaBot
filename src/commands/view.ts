import { SlashCommandBuilder, MessageFlags, PermissionFlagsBits, ChatInputCommandInteraction, EmbedBuilder, GuildMember } from "discord.js";
import { Temporal } from "temporal-polyfill";

import { GetHistory } from "../data.ts";
import { formatTime } from "../timeFormatter.ts";
import type { Command } from "../types/command.js";

export const command = {
	data: new SlashCommandBuilder()
		.setName("view")
		.setDescription("View total time logged for a particular person (Admin only)")
		.addUserOption(option => option
			.setName("user")
			.setDescription("The user to view the time for")
			.setRequired(true)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	Execute: async (interaction: ChatInputCommandInteraction) => {
		const user = interaction.options.getUser("user");

		if (user === null) {
			await interaction.reply({
				content: "Invalid user! (/view <user>)",
				flags: MessageFlags.Ephemeral
			});
			return;
		}

		const history = Object.entries(GetHistory(interaction.client, user.id));

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

		const member = interaction.options.getMember("user");
		const nickname = member === null
			? user.displayName
			: (
				("nick" in member
					? member.nick
					: (member as GuildMember).nickname)
				?? user.displayName
			);

		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setAuthor({
						name: nickname,
						iconURL: user.displayAvatarURL()
					})
					.setTitle(`Time Logged for ${nickname}`)
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
			]
		});
	}
} satisfies Command;
