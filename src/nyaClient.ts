import { Client, Collection } from "discord.js";
import type { Command } from "./types/command.ts";

export class NyaClient extends Client {
	public commands = new Collection<string, Command>();
}
