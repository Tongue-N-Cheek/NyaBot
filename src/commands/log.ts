import { SlashCommandBuilder, MessageFlags, ChatInputCommandInteraction } from "discord.js";

import { ArchiveSession, GetActiveSession, GetPrefs, SetPref } from "../data.ts";
import { formatTime, parseTime } from "../timeFormatter.ts";
import type { Command } from "../types/command.js";
import type { Project } from "../types/projects.js";
import { CreateDefaultEmbed } from "../nyaEmbedBuilder.ts";

export const command = {
	data: new SlashCommandBuilder()
		.setName("log")
		.setDescription("Immediately log some time, in case you forgot to check in")
		.addStringOption(option => {
			return option.setName("time")
				.setDescription("The amount of time to log (hh:mm)")
				.setRequired(true)
		}),
	Execute: async (interaction: ChatInputCommandInteraction) => {		
		const activeSession = GetActiveSession(interaction.client, interaction.user.id);
		if (activeSession !== undefined) {
			await interaction.reply({
				content: "You can't log extra time when you're already checked in!",
				flags: MessageFlags.Ephemeral
			});
			return;
		}

		const extraTime = parseTime(interaction.options.getString("time")!);

		if (extraTime === undefined) {
			await interaction.reply({
				content: "Invalid time format! (/log <hh:mm:ss>)",
				flags: MessageFlags.Ephemeral
			});
			return;
		}

		if (extraTime <= 0) {
			await interaction.reply({
				content: "You have to add more than that to your time...",
				flags: MessageFlags.Ephemeral
			});
			return;
		}

		const maxTime = Number(process.env.MAXIMUM_IMMEDIATE_TIME_SECONDS);
		if (maxTime !== -1 && extraTime > maxTime) {
			await interaction.reply({
				content: `You can't log more than ${formatTime(maxTime)} at once!`,
				flags: MessageFlags.Ephemeral
			});
			return;
		}

		const prefs = GetPrefs(
			interaction.client,
			interaction.user.id,
			{
				lastProject: (interaction.options.getString("project") as Project)
					|| process.env.DEFAULT_PROJECT,
				reminderMinutes: Number(process.env.DEFAULT_REMINDER_MINUTES),
				immediateTimeTimeout: 0
			}
		);

		if (Math.floor(Date.now() / 1000) < prefs.immediateTimeTimeout) {
			await interaction.reply({
				content:
					"You're currently on a cooldown for logging extra time."
					+ ` You can log extra time again in ${
						formatTime(prefs.immediateTimeTimeout - Math.floor(Date.now() / 1000))
					}.`,
				flags: MessageFlags.Ephemeral
			});
			return;
		}

		ArchiveSession(
			interaction.client,
			interaction.user.id,
			prefs.lastProject,
			{
				start: (Math.floor(Date.now() / 1000) - extraTime).toString(),
				end: Math.floor(Date.now() / 1000).toString()
			}
		);

		SetPref(
			interaction.client,
			interaction.user.id,
			"immediateTimeTimeout",
			Math.floor(Date.now() / 1000) + extraTime
		);

		await interaction.reply({
			embeds: [
				CreateDefaultEmbed(interaction)
					.setDescription(`Immediately logged ${formatTime(extraTime)} for ${prefs.lastProject}!`)
					.setImage("https://raw.githubusercontent.com/Tongue-N-Cheek/NyaBot/refs/heads/main/resources/checkout.png")
					.setColor(0x00FF00)
			]
		});
	}
} satisfies Command;
