import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from "discord.js";

import { GetActiveSession, GetPrefs, SetActiveSession, SetPref } from "../data.ts";
import { Projects } from "../projects.ts";
import { CreateDefaultEmbed } from "../nyaEmbedBuilder.ts";

import type { Command } from "../types/command.ts";
import type { Project } from "../types/projects.ts";

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
				lastProject: process.env.DEFAULT_PROJECT as Project,
				reminderMinutes: Number(process.env.DEFAULT_REMINDER_MINUTES),
				immediateTimeTimeout: 0
			}
		)

		const selectedProject = (interaction.options.getString("project") as Project) || prefs.lastProject;

		SetPref(interaction.client, interaction.user.id, "lastProject", selectedProject);

		SetActiveSession(
			interaction.client,
			interaction.user.id,
			{
				project: selectedProject,
				start: Math.floor(Date.now() / 1000).toString()
			}
		);

		await interaction.reply({
			embeds: [
				CreateDefaultEmbed(interaction)
					.setDescription(`Checked in for ${selectedProject}!`)
					.setImage("https://raw.githubusercontent.com/Tongue-N-Cheek/NyaBot/refs/heads/main/resources/checkin.png")
					.setColor(0x00FF00)
			],
			flags: MessageFlags.SuppressNotifications
		});
	}
} satisfies Command;
