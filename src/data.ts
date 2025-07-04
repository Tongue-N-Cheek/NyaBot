import { WriteCache } from "./cache.ts";
import type { NyaClient } from "./nyaClient.ts";
import type { ActiveSessionsData, Prefs } from "./types/data.js";

export function GetPrefs(client: NyaClient, discordId: string): Prefs
export function GetPrefs(client: NyaClient, discordId: string, defaultPrefs: Prefs): Prefs
export function GetPrefs(client: NyaClient, discordId: string, defaultPrefs?: Prefs): Prefs {
	if (client.data.prefs[discordId] === undefined) {
		if (defaultPrefs === undefined) throw new Error(`No prefs found for ${discordId}`);
		client.data.prefs[discordId] = defaultPrefs;

		WriteCache(client);
	}
	return client.data.prefs[discordId];
}

export function GetActiveSession(
	client: NyaClient,
	discordId: string
): ActiveSessionsData[string] | undefined {
	return client.data.activeSessions[discordId];
}

export function SetActiveSession(
	client: NyaClient,
	discordId: string,
	sessionData: ActiveSessionsData[string]
) {
	client.data.activeSessions[discordId] = sessionData;
	WriteCache(client);
}

export function ClearActiveSession(
	client: NyaClient,
	discordId: string
) {
	delete client.data.activeSessions[discordId];
	WriteCache(client);
}
