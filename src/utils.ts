import type { CommandInteraction, GuildMember } from "discord.js";

export function GetNicknameFromInteraction(interaction: CommandInteraction) {
	return (
		interaction.member === null
			? interaction.user.displayName
			: (
				("nick" in interaction.member
					? interaction.member.nick
					: (interaction.member as GuildMember).nickname)
				?? interaction.user.displayName
			)
	);
}
