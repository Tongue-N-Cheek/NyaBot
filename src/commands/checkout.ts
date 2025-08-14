import { SlashCommandBuilder, CommandInteraction, MessageFlags, EmbedBuilder } from "discord.js";

import { ArchiveSession, ClearActiveSession, GetActiveSession } from "../data.ts";
import { formatTime } from "../timeFormatter.ts";
import type { Command } from "../types/command.ts";

export const command = {
	data: new SlashCommandBuilder()
		.setName("checkout")
		.setDescription("Check out to stop logging your time and save it"),
	Execute: async (interaction: CommandInteraction) => {
		const activeSession = GetActiveSession(interaction.client, interaction.user.id);
		if (activeSession === undefined) {
			await interaction.reply({
				content: "You are not checked in! (/checkin to start logging your time)",
				flags: MessageFlags.Ephemeral
			});
			return;
		}

		const archive = ArchiveSession(
			interaction.client,
			interaction.user.id,
			activeSession.project,
			{
				start: activeSession.start,
				end: Math.floor(Date.now() / 1000).toString()
			}
		);

		ClearActiveSession(interaction.client, interaction.user.id);

		const time = Number(archive.end) - Number(archive.start);

		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setDescription(`Checked out! You logged ${formatTime(time)} for ${activeSession.project}`)
					.setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
					.setImage("https://raw.githubusercontent.com/Tongue-N-Cheek/NyaBot/refs/heads/main/resources/checkout.png")
					.setColor(0xFF0000)
			]
		});
	}
} satisfies Command;
