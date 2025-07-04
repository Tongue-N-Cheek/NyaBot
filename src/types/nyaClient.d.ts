import type { NyaClient } from "../nyaClient.js";

declare module "discord.js" {
	interface CommandInteraction {
		client: NyaClient;
	}
}
