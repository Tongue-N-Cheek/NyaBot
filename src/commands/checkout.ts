import { SlashCommandBuilder, CommandInteraction, MessageFlags, EmbedBuilder } from "discord.js";

import { ArchiveSession, ClearActiveSession, GetActiveSession } from "../data.ts";
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
		const hours = Math.floor(time / 60 / 60);
		const minutes = Math.floor(time / 60) - hours * 60;
		const seconds = time - hours * 60 * 60 - minutes * 60;

		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setDescription(
						"Checked out! You logged "
						+ (hours > 0 ? `${hours} hour${hours > 1 ? "s" : ""}` : "")
						+ (hours > 0 && minutes > 0 && seconds > 0 ? ", " : (hours > 0 ? " and " : ""))
						+ (minutes > 0 ? `${minutes} minute${minutes > 1 ? "s" : ""}` : "")
						+ (hours > 0 && minutes > 0 && seconds > 0 ? ", and " : "")
						+ (seconds > 0 ? `${seconds} second${seconds > 1 ? "s" : ""}` : "")
						+ ` for ${activeSession.project}`
					)
					.setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
					.setImage("https://raw.githubusercontent.com/Tongue-N-Cheek/NyaBot/refs/heads/main/resources/checkout.png")
					.setColor(0xFF0000)
			]
		});
	}
} satisfies Command;
