import type { Project } from "./projects.ts";

export interface HoursData {
	[discordUserId: string]: Array<{
		/** Unix UTC Epoch in seconds, e.g. `1751587335` */
		start: string;
		/** Unix UTC Epoch in seconds, e.g. `1751587335` */
		end: string;
	}>;
}

export interface ActiveSessionsData {
	[discordUserId: string]: {
		project: Project;
		/** Unix UTC Epoch in seconds, e.g. `1751587335` */
		start: string;
	}
}

export interface Prefs {
	lastProject: Project;
	reminderMinutes: number;
	immediateTimeTimeout: number;
}

export interface PrefsData {
	[discordUserId: string]: Prefs;
}

export interface TaskRelationsData {
	OP_PROJECT_ID: number; // Integer id
	KITSU_PROJECT_ID: string; // UUID

	OP_ART_ASSET_WP_TYPE_ID: number;
	OP_USER_STORY_WP_TYPE_ID: number;

	assetTypeMap: Record<string, string>; // "1" (OP) -> UUID (Kitsu)
	statusMap: Record<string, number>; // UUID (Kitsu) -> 8 (OP)

	assetRelations: Record<number, string>; // WP#123 (OP) -> UUID (Kitsu)
	taskRelations: Record<string, number>; // UUID (Kitsu) -> WP#123 (OP)
}
