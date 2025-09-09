import type { Project } from "./projects.js";

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
