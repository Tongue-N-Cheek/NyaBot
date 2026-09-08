import type { IncomingMessage, ServerResponse } from "node:http";

import { readBody } from "./httpUtil.ts";

export class KnownError extends Error { }

export function sendError(
	response: ServerResponse<IncomingMessage>,
	error: string,
	statusCode: number = 400
) {
	response.writeHead(statusCode, error).end(JSON.stringify({ error }));
}

export function validateContentType(
	request: IncomingMessage,
	response: ServerResponse<IncomingMessage>,
	expectedType: string | string[] = "application/json"
): void | never {
	if (typeof expectedType === "string") expectedType = [expectedType];

	const contentType = request.headers["content-type"];

	if (contentType === undefined || expectedType.indexOf(contentType) === -1) {
		const error = `Invalid content type, expected any of ${expectedType.join(", ")}`;
		sendError(response, error, 415);
		throw new KnownError(error);
	}
}

export async function validateHasBody(
	request: IncomingMessage,
	response: ServerResponse<IncomingMessage>
): Promise<any> | never {
	return readBody(request)
		.catch(error => {
			sendError(response, error, 400);
			throw new KnownError(error);
		});
}

export async function validateHasJSONBody(
	request: IncomingMessage,
	response: ServerResponse<IncomingMessage>
) {
	validateContentType(request, response, ["application/json", "application/hal+json"]);
	return validateHasBody(request, response);
}
