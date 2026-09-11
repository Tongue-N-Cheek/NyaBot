import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";

import { CheckDotenv } from "./errorChecker.ts";
import { Projects } from "./projects.ts";

import type { ActiveSessionsData, HoursData, PrefsData, TaskRelationsData } from "./types/data.ts";
import type { Project } from "./types/projects.ts";
import type { NyaClient } from "./nyaClient.ts";

export interface DataCache {
	activeSessions: ActiveSessionsData;
	prefs: PrefsData;
	hours: Record<Project, HoursData>;
	taskRelations: Record<Project, TaskRelationsData>;
}

export function RefreshCache(): DataCache {
	CheckDotenv();

	const dataDirRaw = process.env.DATA_DIR || "./data";

	const dataDir = isAbsolute(dataDirRaw) ? dataDirRaw : join(import.meta.dirname, "..", dataDirRaw);
	if (!existsSync(dataDir)) {
		console.warn(`No data directory found. Creating directory at ${dataDir}`);
		mkdirSync(dataDir, { recursive: true });
	}

	const projectSessionDir = join(dataDir, "sessions");
	if (!existsSync(projectSessionDir)) {
		console.warn(`No sessions directory found. Creating directory at ${projectSessionDir}`);
		mkdirSync(projectSessionDir, { recursive: true });
	}

	const taskRelationsDir = join(dataDir, "services");
	if (!existsSync(taskRelationsDir)) {
		console.warn(`No services directory found. Creating directory at ${taskRelationsDir}`);
		mkdirSync(taskRelationsDir, { recursive: true });
	}

	const sessionsJson = join(dataDir, "currentSessions.json");
	const prefsJson = join(dataDir, "prefs.json");

	let activeSessions: ActiveSessionsData = {};
	let prefs: PrefsData = {};
	let hours = Object.fromEntries(Projects.map(project => [project, {}])) as Record<Project, HoursData>;
	let taskRelations = Object.fromEntries(Projects.map(project => [project, {}])) as Record<Project, TaskRelationsData>;

	if (!existsSync(sessionsJson)) {
		console.warn(`No activeSessions.json found. Writing empty activeSessions.json to ${dataDir}`);
		writeFileSync(sessionsJson, JSON.stringify(activeSessions));
	}
	if (!existsSync(prefsJson)) {
		console.warn(`No prefs.json found. Writing empty prefs.json to ${dataDir}`);
		writeFileSync(prefsJson, JSON.stringify(prefs));
	}

	for (const project of Projects) {
		const projectJson = join(dataDir, `sessions/${project}.json`);
		if (!existsSync(projectJson)) {
			console.warn(`No ${project}.json found. Writing empty ${project}.json to ${projectSessionDir}`);
			writeFileSync(projectJson, JSON.stringify(hours[project]));
		}

		const taskRelationsJson = join(dataDir, `services/${project}_taskRelations.json`);
		if (!existsSync(taskRelationsJson)) {
			console.warn(`No ${project}_taskRelations.json found. Writing empty ${project}_taskRelations.json to ${taskRelationsDir}`);
			const defaultData: TaskRelationsData = {
				OP_ART_ASSET_WP_TYPE_ID: -1,
				OP_PROJECT_ID: -1,
				OP_USER_STORY_WP_TYPE_ID: -1,
				KITSU_PROJECT_ID: "",
				assetTypeMap: {},
				statusMap: {},
				assetRelations: {},
				taskRelations: {},
			};
			writeFileSync(taskRelationsJson, JSON.stringify(defaultData));
		}
	}

	activeSessions = JSON.parse(readFileSync(sessionsJson, "utf-8"));
	prefs = JSON.parse(readFileSync(prefsJson, "utf-8"));

	for (const project of Projects) {
		hours[project] = JSON.parse(readFileSync(join(dataDir, `sessions/${project}.json`), "utf-8"));
		taskRelations[project] = JSON.parse(readFileSync(join(dataDir, `services/${project}_taskRelations.json`), "utf-8"));
	}

	return { activeSessions, prefs, hours, taskRelations };
}

export function WriteCache(client: NyaClient) {
	const dataDirRaw = process.env.DATA_DIR || "./data";
	const dataDir = isAbsolute(dataDirRaw) ? dataDirRaw : join(import.meta.dirname, "..", dataDirRaw);

	writeFileSync(join(dataDir, "currentSessions.json"), JSON.stringify(client.data.activeSessions));
	writeFileSync(join(dataDir, "prefs.json"), JSON.stringify(client.data.prefs));
	for (const project of Projects) {
		writeFileSync(join(dataDir, `sessions/${project}.json`), JSON.stringify(client.data.hours[project]));
		writeFileSync(join(dataDir, `services/${project}_taskRelations.json`), JSON.stringify(client.data.taskRelations[project]));
	}
}
