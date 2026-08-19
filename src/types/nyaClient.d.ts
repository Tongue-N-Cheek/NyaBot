import type { NyaClient } from "../nyaClient.ts";

declare module "discord.js" {
	interface CommandInteraction {
		client: NyaClient;
	}
}
