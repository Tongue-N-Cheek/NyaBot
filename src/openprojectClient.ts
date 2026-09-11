import { GetNyaClient } from "./nyaClient.ts";

import type { TaskRelationsData } from "./types/data.js";
import type { Project } from "./types/projects.js";

export interface CreateUserStoryResponse {
	id: number;
}

export class CreateUserStoryRequest {
	private Name: string;
	private Description: string;
	private Parent?: number;

	public constructor(
		name: string,
		description?: string,
		parent?: number
	) {
		this.Name = name;
		this.Description = description ?? "";
		this.Parent = parent;
	}

	public GetRequest(op_WPTypdeId: number) {

		return {
			subject: this.Name,
			description: {
				format: "markdown",
				raw: this.Description,
				html: `<p>${this.Description}</p>`
			},
			_links: {
				type: {
					href: `/api/v3/types/${op_WPTypdeId}`
				},
				parent: this.Parent !== undefined ? {
					href: `/api/v3/work_packages/${this.Parent}`
				} : undefined
			}
		};
	}
}

export class OpenProjectClient {
	private Token: string;

	private ApiUrl: string;

	private TaskRelations: Record<Project, TaskRelationsData>;

	public static CreateDefault(): OpenProjectClient {
		return new OpenProjectClient(process.env.OPENPROJECT_TOKEN!, process.env.OPENPROJECT_API_URL!, GetNyaClient().data.taskRelations);
	}

	public constructor(token: string, apiUrl: string, taskRelations: Record<Project, TaskRelationsData>) {
		this.Token = token;
		this.ApiUrl = apiUrl;
		this.TaskRelations = taskRelations;
	}

	public async CreateUserStory(project: Project, userStoryInfo: CreateUserStoryRequest) {
		return this.SendRequest("POST", `/projects/${this.TaskRelations[project].OP_PROJECT_ID}/work_packages`, userStoryInfo.GetRequest(this.TaskRelations[project].OP_USER_STORY_WP_TYPE_ID))
			.then(response => {
				if (response.status >= 400) throw new Error(`Failed to create tasks: ${response.statusText}`);
				return response.json() as Promise<CreateUserStoryResponse>;
			});
	}

	private async SendRequest(method: string, endpoint: string, body?: any) {
		console.log(`Sending ${method} request to open project: ${endpoint}`);

		return fetch(
			`${this.ApiUrl}${endpoint}`,
			{
				method: method,
				headers: {
					"Authorization": `Basic ${this.Token}`,
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				body: body !== undefined ? JSON.stringify(body) : undefined
			})
			.then(response => {
				console.log(`Received status ${response.status} from open project: ${endpoint}`);
				return response;
			});
	}
}

let GlobalOPClient: OpenProjectClient | undefined = undefined;
export function GetGlobalOPClient(): OpenProjectClient {
	if (GlobalOPClient !== undefined) return GlobalOPClient;

	GlobalOPClient = OpenProjectClient.CreateDefault();
	return GlobalOPClient;
}
