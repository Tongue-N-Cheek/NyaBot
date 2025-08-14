import { SlashCommandBuilder, MessageFlags, ChatInputCommandInteraction } from "discord.js";

import { DeleteSession, EditSession, GetActiveSession, GetHistory } from "../data.ts";
import { formatTime, parseTime } from "../timeFormatter.ts";
import type { Command } from "../types/command.ts";

export const command = {
	data: new SlashCommandBuilder()
		.setName("editcheckout")
		.setDescription("Edit the end time of your previous session")
		.addStringOption(option => {
			return option.setName("reduce")
				.setDescription("The amount of time to subtract from your last session (hh:mm)")
				.setRequired(true)
		}),
	Execute: async (interaction: ChatInputCommandInteraction) => {
		const activeSession = GetActiveSession(interaction.client, interaction.user.id);
		if (activeSession !== undefined) {
			await interaction.reply({
				content: "You are already checked in! (/checkout to edit your time)",
				flags: MessageFlags.Ephemeral
			});
			return;
		}

		const history = Object.values(GetHistory(interaction.client, interaction.user.id)).flat();

		if (history.length === 0) {
			await interaction.reply({
				content: "You have not logged any time yet! (/checkin to start logging your time)",
				flags: MessageFlags.Ephemeral
			});
			return;
		}

		const pastSession = history.reduce((prev, session) => {
			return prev.end > session.end ? prev : session;
		});

		const endOffset = parseTime(interaction.options.getString("reduce")!);

		if (endOffset === undefined) {
			await interaction.reply({
				content: "Invalid time format! (/editcheckout <hh:mm:ss>)",
				flags: MessageFlags.Ephemeral
			});
			return;
		}

		if (endOffset === 0) {
			await interaction.reply({
				content: "That wouldn't edit anything...",
				flags: MessageFlags.Ephemeral
			});
			return;
		}

		const startTime = Number(pastSession.start);
		const endTime = Number(pastSession.end) - endOffset;

		if (endTime < startTime) {
			await interaction.reply({
				content: "You cannot have negative logged time...",
				flags: MessageFlags.Ephemeral
			});
			return;
		}

		if (endTime === startTime) {
			DeleteSession(interaction.client, interaction.user.id, pastSession);
			await interaction.reply("Successfully deleted your last session.");
		} else {
			EditSession(
				interaction.client,
				interaction.user.id,
				pastSession,
				{ ...pastSession, end: endTime.toString() }
			);

			await interaction.reply(
				`Successfully edited your last session. New logged time: ${formatTime(endTime - startTime)}`
			);
		}
	}
} satisfies Command;
