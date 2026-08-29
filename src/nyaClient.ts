import { Client, Collection } from "discord.js";

import { RefreshCache } from "./cache.ts";

import type { Command } from "./types/command.ts";

export class NyaClient extends Client {
	public commands = new Collection<string, Command>();
	public data = RefreshCache();
}

export function GetNyaClient(): NyaClient {
	if (GlobalClient !== undefined) return GlobalClient;
	throw new Error("No client found");
}

export function CreateNyaClient(...args: ConstructorParameters<typeof NyaClient>): NyaClient {
	if (GlobalClient !== undefined) return GlobalClient;

	GlobalClient = new NyaClient(...args);
	return GlobalClient;
}

export let GlobalClient: NyaClient | undefined = undefined;
