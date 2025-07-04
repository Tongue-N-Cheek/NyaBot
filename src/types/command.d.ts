import type { CommandInteraction, SharedSlashCommand, SlashCommandBuilder } from "discord.js";

export interface Command {
	data: SharedSlashCommand;
	Execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}
