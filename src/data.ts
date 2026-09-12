import { WriteCache } from "./cache.ts";

import { GetNyaClient, type NyaClient } from "./nyaClient.ts";
import { Projects } from "./projects.ts";
import type { ActiveSessionsData, HoursData, Prefs, TaskRelationsData } from "./types/data.ts";
import type { Project } from "./types/projects.ts";

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

export function SetPref<T extends keyof Prefs>(client: NyaClient, discordId: string, key: T, value: Prefs[T]) {
	client.data.prefs[discordId][key] = value;
	WriteCache(client);
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

export function ArchiveSession(
	client: NyaClient,
	discordId: string,
	project: Project,
	hoursData: HoursData[string][number]
) {
	client.data.hours[project][discordId] ??= [];
	client.data.hours[project][discordId].push(hoursData);
	WriteCache(client);
	return client.data.hours[project][discordId].at(-1)!;
}

export function EditSession(
	client: NyaClient,
	discordId: string,
	original: HoursData[string][number],
	edited: HoursData[string][number]
) {
	const history = Object.entries(GetHistory(client, discordId));

	let sessionIndex = -1;
	const project = history.find(([_, sessions]) => {
		return sessions.some((session, i) => {
			const matches = session.start === original.start && session.end === original.end;
			if (matches) sessionIndex = i;
			return matches;
		});
	})![0] as Project;

	if (sessionIndex === -1) return false;

	client.data.hours[project][discordId]![sessionIndex] = edited;
	WriteCache(client);
	return true;
}

export function DeleteSession(
	client: NyaClient,
	discordId: string,
	hoursData: HoursData[string][number]
) {
	const history = Object.entries(GetHistory(client, discordId));

	let sessionIndex = -1;
	const project = history.find(([_, sessions]) => {
		return sessions.some((session, i) => {
			const matches = session.start === hoursData.start && session.end === hoursData.end;
			if (matches) sessionIndex = i;
			return matches;
		});
	})![0] as Project;

	if (sessionIndex === -1) return false;

	client.data.hours[project][discordId]!.splice(sessionIndex, 1);
	WriteCache(client);
	return true;
}

export function GetHistory(
	client: NyaClient,
	discordId: string
) {
	return Object.fromEntries(Object.entries(client.data.hours)
		.map(([project, userSessions]) => [
			project,
			Object.entries(userSessions)
				.filter(([discordId2]) => discordId2 === discordId)
				.flatMap(([_, history]) => history)
		])) as Record<Project, HoursData[string]>;
}

export function GetHasAnyData(client: NyaClient): boolean {
	return Object.keys(client.data.hours).some(project => Object.keys(client.data.hours[project as Project]).length > 0);
}

export function GetProjectFromOpProjectId(op_projectId: number): Project | undefined {
	const client = GetNyaClient();
	return Projects.find(project => client.data.taskRelations[project].OP_PROJECT_ID === op_projectId) as Project;
}

export function GetProjectFromKitsuProjectId(kitsu_projectId: string): Project | undefined {
	const client = GetNyaClient();
	return Projects.find(project => client.data.taskRelations[project].KITSU_PROJECT_ID === kitsu_projectId) as Project;
}

export function GetTaskRelationsData(project: Project): TaskRelationsData {
	const client = GetNyaClient();
	return client.data.taskRelations[project];
}

export function AddAssetRelation(project: Project, op_WPId: number, kitsu_AssetId: string) {
	const client = GetNyaClient();
	client.data.taskRelations[project].assetRelations[op_WPId] = kitsu_AssetId;

	WriteCache(client);
}

export function AddTaskRelation(project: Project, kitsu_TaskId: string, op_WPId: number) {
	const client = GetNyaClient();
	client.data.taskRelations[project].taskRelations[kitsu_TaskId] = op_WPId;

	WriteCache(client);
}
