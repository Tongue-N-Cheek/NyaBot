import type { IncomingMessage, ServerResponse } from "node:http";

import { sendResponse } from "../httpServer.ts";
import { sendError, validateHasJSONBody } from "../httpErrorHandler.ts";

export async function handleOpenProjectWebhook(
	request: IncomingMessage,
	response: ServerResponse<IncomingMessage>,
	_url: URL,
	_unhandledEndpoints: string[]
) {
	const body = await validateHasJSONBody(request, response);

	if (typeof (body) !== "object") {
		sendError(response, "Invalid body", 400);
		return;
	}

	console.log(body);
	sendResponse(response, undefined, 200);
}
