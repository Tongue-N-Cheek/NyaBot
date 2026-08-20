import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";

import { CheckDotenv } from "./errorChecker.ts";
import { Projects } from "./projects.ts";

import type { ActiveSessionsData, HoursData, PrefsData } from "./types/data.ts";
import type { Project } from "./types/projects.ts";
import type { NyaClient } from "./nyaClient.ts";

export interface DataCache {
	activeSessions: ActiveSessionsData;
	prefs: PrefsData;
	hours: Record<Project, HoursData>;
}

export function RefreshCache(): DataCache {
	CheckDotenv();

	const rawDataDir = process.env.DATA_DIR || "./data";

	const dataDir = isAbsolute(rawDataDir) ? rawDataDir : join(import.meta.dirname, "..", rawDataDir);
	if (!existsSync(dataDir)) {
		console.warn(`No data directory found. Creating directory at ${dataDir}`);
		mkdirSync(dataDir, { recursive: true });
	}

	const projectSessionDir = join(dataDir, "sessions");
	if (!existsSync(projectSessionDir)) {
		console.warn(`No sessions directory found. Creating directory at ${projectSessionDir}`);
		mkdirSync(projectSessionDir, { recursive: true });
	}

	const sessionsJson = join(dataDir, "currentSessions.json");
	const prefsJson = join(dataDir, "prefs.json");

	let activeSessions: ActiveSessionsData = {};
	let prefs: PrefsData = {};
	let hours = Object.fromEntries(Projects.map(project => [project, {}])) as Record<Project, HoursData>;

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
			console.warn(`No ${project}.json found. Writing empty ${project}.json to ${dataDir}`);
			writeFileSync(projectJson, JSON.stringify(hours[project]));
		}
	}

	activeSessions = JSON.parse(readFileSync(sessionsJson, "utf-8"));
	prefs = JSON.parse(readFileSync(prefsJson, "utf-8"));

	for (const project of Projects) {
		hours[project] = JSON.parse(readFileSync(join(dataDir, `sessions/${project}.json`), "utf-8"));
	}

	return { activeSessions, prefs, hours };
}

export function WriteCache(client: NyaClient) {
	const dataDir = join(import.meta.dirname, "..", process.env.DATA_DIR || "data");
	writeFileSync(join(dataDir, "currentSessions.json"), JSON.stringify(client.data.activeSessions));
	writeFileSync(join(dataDir, "prefs.json"), JSON.stringify(client.data.prefs));
	for (const project of Projects) {
		writeFileSync(join(dataDir, `sessions/${project}.json`), JSON.stringify(client.data.hours[project]));
	}
}
