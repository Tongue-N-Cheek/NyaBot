import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags, AttachmentBuilder, EmbedBuilder } from "discord.js";

import { GetActiveSession, GetPrefs, SetActiveSession } from "../data.ts";
import { Projects } from "../projects.ts";
import type { Command } from "../types/command.ts";
import type { Project } from "../types/projects.js";

export const command = {
	data: new SlashCommandBuilder()
		.setName("checkin")
		.setDescription("Check in to start logging your time")
		.addStringOption(option => {
			return option
				.setName("project")
				.setDescription("The project you are working on (optional)")
				.setChoices(...Projects.map(project => ({ name: project, value: project })))
		}),
	Execute: async (interaction: ChatInputCommandInteraction) => {
		const activeSession = GetActiveSession(interaction.client, interaction.user.id);
		if (activeSession !== undefined) {
			await interaction.reply({
				content: "You are already checked in!"
					+ ` (Started at <t:${activeSession.start}:t> for ${activeSession.project})`,
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
				reminderMinutes: Number(process.env.DEFAULT_REMINDER_MINUTES)
			}
		);

		SetActiveSession(
			interaction.client,
			interaction.user.id,
			{
				project: prefs.lastProject,
				start: Math.floor(Date.now() / 1000).toString()
			}
		);

		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setDescription(`Checked in for ${prefs.lastProject}!`)
					.setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
					.setImage("https://raw.githubusercontent.com/Tongue-N-Cheek/NyaBot/refs/heads/main/resources/checkin.png")
					.setColor(0x00FF00)
			]
		});
	}
} satisfies Command;
