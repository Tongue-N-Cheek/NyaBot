import type { IncomingMessage, ServerResponse } from "node:http";

import { readBody } from "./httpUtil.ts";

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
	expectedType: string = "application/json"
) {
	if (request.headers["content-type"] !== expectedType) {
		sendError(response, `Invalid content type, expected ${expectedType}`, 415);
		return false;
	}
	return true;
}

export async function validateHasBody(
	request: IncomingMessage,
	response: ServerResponse<IncomingMessage>
) {
	return readBody(request)
		.then(body => ({ body }))
		.catch(error => {
			sendError(response, error, 400);
			return {} as { body?: undefined };
		});
}
