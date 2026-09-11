import { GetNyaClient } from "./nyaClient.ts";

import type { TaskRelationsData } from "./types/data.js";
import type { Project } from "./types/projects.js";

export interface CreateAssetResponse {
	id: string;
}

export type CreateTasksResponse = Array<{
	id: string;
	task_type_name: string;
}>;

export class CreateAssetRequest {
	private Name: string;
	private Description: string;
	private Data: object;
	private bIsShared: boolean;
	private SourceId: string;
	private EpisodeId?: string;

	public constructor(name: string, description: string)
	public constructor(
		name: string,
		description: string,
		data?: object,
		bIsShared?: boolean,
		sourceId?: string,
		episodeId?: string
	) {
		this.Name = name;
		this.Description = description;
		this.Data = data ?? {};
		this.bIsShared = bIsShared ?? false;
		this.SourceId = sourceId ?? "";
		this.EpisodeId = episodeId;
	}

	public GetRequest() {
		return {
			name: this.Name,
			description: this.Description,
			data: this.Data,
			is_shared: this.bIsShared,
			source_id: this.SourceId,
			episode_id: this.EpisodeId,
		};
	}
}

export class KitsuClient {
	private Token: string;

	private ApiUrl: string;

	private TaskRelations: Record<Project, TaskRelationsData>;

	public static CreateDefault(): KitsuClient {
		return new KitsuClient(process.env.KITSU_TOKEN!, process.env.KITSU_API_URL!, GetNyaClient().data.taskRelations);
	}

	public constructor(token: string, apiUrl: string, taskRelations: Record<Project, TaskRelationsData>) {
		this.Token = token;
		this.ApiUrl = apiUrl;
		this.TaskRelations = taskRelations;
	}

	public async CreateAssetWithTasks(project: Project, op_AssetTypeId: number, assetInfo: CreateAssetRequest) {
		const kitsu_Data = await this.CreateAsset(project, op_AssetTypeId, assetInfo);
		return this.CreateTasks(kitsu_Data.id);
	}

	public async CreateAsset(project: Project, op_AssetTypeId: number, assetInfo: CreateAssetRequest) {
		const kitsu_ProjectId = this.TaskRelations[project].KITSU_PROJECT_ID;
		if (kitsu_ProjectId === "") throw new Error("No kitsu project id found");

		const kitsu_AssetTypeId = this.TaskRelations[project].assetTypeMap[`${op_AssetTypeId}`];
		if (kitsu_AssetTypeId === "")
			throw new Error(`No kitsu asset type id found for Open Project asset type id of ${op_AssetTypeId}`);

		return this.SendRequest(
			"POST",
			`/data/projects/${kitsu_ProjectId}/asset-types/${kitsu_AssetTypeId}/assets/new`,
			assetInfo.GetRequest()
		).then(response => {
			if (response.status >= 400) throw new Error(`Failed to create asset: ${response.statusText}`);
			return response.json() as Promise<CreateAssetResponse>;
		});
	}

	public async CreateTasks(kitsu_AssetId: string) {
		return this.SendRequest("POST", `/data/entities/${kitsu_AssetId}/tasks`)
			.then(response => {
				if (response.status >= 400) throw new Error(`Failed to create tasks: ${response.statusText}`);
				return response.json() as Promise<CreateTasksResponse>;
			});
	}

	private async SendRequest(method: string, endpoint: string, body?: any) {
		console.log(`Sending ${method} request to kitsu: ${endpoint}`);

		return fetch(
			`${this.ApiUrl}${endpoint}`,
			{
				method: method,
				headers: {
					"Authorization": `Bearer ${this.Token}`,
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				body: body !== undefined ? JSON.stringify(body) : undefined
			})
			.then(response => {
				console.log(`Received status ${response.status} from kitsu: ${endpoint}`);
				return response;
			});
	}
}

let GlobalKitsuClient: KitsuClient | undefined = undefined;
export function GetGlobalKitsuClient(): KitsuClient {
	if (GlobalKitsuClient !== undefined) return GlobalKitsuClient;

	GlobalKitsuClient = KitsuClient.CreateDefault();
	return GlobalKitsuClient;
}
