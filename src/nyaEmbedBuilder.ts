import { type CommandInteraction, EmbedBuilder } from "discord.js";

import { GetNicknameFromInteraction } from "./utils.ts";

export function CreateDefaultEmbed(interaction: CommandInteraction) {
	return new EmbedBuilder()
		.setAuthor({
			name: GetNicknameFromInteraction(interaction),
			iconURL: interaction.user.displayAvatarURL()
		});
}
