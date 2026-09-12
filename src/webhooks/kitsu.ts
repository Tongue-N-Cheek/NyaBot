import { GetProjectFromKitsuProjectId, GetTaskRelationsData } from "../data.ts";
import { GetGlobalOPClient } from "../openprojectClient.ts";

export interface TaskStatusChangedEvent {
	new_task_status_id: string;
	project_id: string;
	task_id: string;
}

export function OnTaskStatusChanged(data: TaskStatusChangedEvent) {
	const project = GetProjectFromKitsuProjectId(data.project_id);
	if (project === undefined) return;

	const taskRelations = GetTaskRelationsData(project);
	const op_WPId = taskRelations.taskRelations[data.task_id];
	if (op_WPId === undefined) return;

	const op_statusId = taskRelations.statusMap[data.new_task_status_id];
	if (op_statusId === undefined) return;

	const op_Client = GetGlobalOPClient();
	op_Client.UpdateWorkPackageStatus(op_WPId, op_statusId);
}
