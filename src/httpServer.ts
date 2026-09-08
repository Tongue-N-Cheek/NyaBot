import { createServer, type IncomingMessage, type ServerResponse } from "http";

import { Router } from "./httpRouter.ts";
import { KnownError } from "./httpErrorHandler.ts";
import { GetHasAnyData } from "./data.ts";
import { GetNyaClient } from "./nyaClient.ts";
import { handleOpenProjectWebhook } from "./webhooks/openproject.ts";

const router = new Router(
	{
		GET: send404
	},
	{
		"healthcheck": handleHealthcheck,
		"smoketest": handleSmoketest,
		"webhook": handleWebhook
	}
);

const webhookRouter = new Router(
	send404,
	{
		"openproject": handleOpenProjectWebhook
	}
);

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
		if (error instanceof KnownError) return;
		console.error("Uncaught error", error);
	}
});

server.on("error", error => console.error(error));

async function send404(
	_request: IncomingMessage,
	response: ServerResponse<IncomingMessage>,
	_url: URL,
	_unhandledEndpoints: string[]
) {
	sendResponse(response, undefined, 404);
}

async function handleHealthcheck(
	_request: IncomingMessage,
	response: ServerResponse<IncomingMessage>,
	_url: URL,
	_unhandledEndpoints: string[]
) {
	sendResponse(response);
}

async function handleSmoketest(
	_request: IncomingMessage,
	response: ServerResponse<IncomingMessage>,
	_url: URL,
	_unhandledEndpoints: string[]
) {
	sendResponse(response, undefined, GetHasAnyData(GetNyaClient()) ? 200 : 500);
}

async function handleWebhook(
	request: IncomingMessage,
	response: ServerResponse<IncomingMessage>,
	url: URL,
	unhandledEndpoints: string[]
) {
	await webhookRouter.route(request, response, url, unhandledEndpoints);
}

export function sendResponse(
	response: ServerResponse<IncomingMessage>,
	data?: Object | undefined,
	statusCode: number = 200
) {
	response.writeHead(statusCode);

	if (data !== undefined) {
		response
			.setHeader("content-type", "application/json")
			.end(JSON.stringify(data));
	}
	else response.end();
}
