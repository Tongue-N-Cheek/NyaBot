import type { CommandInteraction, SlashCommandBuilder } from "discord.js";

export interface Command {
	data: SlashCommandBuilder;
	Execute: (interaction: CommandInteraction) => Promise<void>;
}
