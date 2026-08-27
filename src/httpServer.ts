import { createServer, type IncomingMessage, type ServerResponse } from "http";

import { Router } from "./httpRouter.ts";
import { sendError } from "./httpErrorHandler.ts";

const router = new Router({
	GET: handleIndex
}, {
	"healthcheck": handleHealthcheck
});

export const server = createServer(async (request, response) => {
	console.log(request.method, request.url);
	const url = new URL(`http://localhost${request.url}`);
	const endpoints = url.pathname.split("/").slice(1);

	try {
		await router.route(
			request,
			response,
			url,
			endpoints
		);
	} catch (error) {
		console.error("Uncaught error", error);
		sendError(response, error as string, 500);
	}
});

server.on("error", error => console.error(error));

async function handleIndex(
	_request: IncomingMessage,
	response: ServerResponse<IncomingMessage>,
	_url: URL,
	_unhandledEndpoints: string[]
) {
	sendResponse(response, {}, 404);
}

async function handleHealthcheck(
	_request: IncomingMessage,
	response: ServerResponse<IncomingMessage>,
	_url: URL,
	_unhandledEndpoints: string[]
) {
	sendResponse(response, {});
}

export function sendResponse(
	response: ServerResponse<IncomingMessage>,
	data: object,
	statusCode: number = 200
) {
	response.writeHead(statusCode).end(JSON.stringify(data));
}
