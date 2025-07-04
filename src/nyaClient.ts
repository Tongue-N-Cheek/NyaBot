import { Client, Collection } from "discord.js";

import { RefreshCache } from "./cache.ts";
import type { Command } from "./types/command.ts";

export class NyaClient extends Client {
	public commands = new Collection<string, Command>();
	public data = RefreshCache();
}
