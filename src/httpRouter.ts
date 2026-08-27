import type { IncomingMessage, ServerResponse } from "http";

import { sendError } from "./httpErrorHandler.ts";

export type Route = (
	request: IncomingMessage,
	response: ServerResponse<IncomingMessage>,
	url: URL,
	unhandledEndpoints: string[]
) => Promise<void>;

interface RouteMethod {
	GET?: Route;
	POST?: Route;
	DELETE?: Route;
	PATCH?: Route;
	PUT?: Route;
}

export class Router {
	private routes: Record<string, RouteMethod> = {};
	private defaultRoute: RouteMethod;

	public static createRouteMethod(route: Route) {
		return {
			GET: route,
			POST: route,
			DELETE: route,
			PATCH: route,
			PUT: route
		} as RouteMethod;
	}

	public static asRouteMethod(route: Route | RouteMethod) {
		return typeof route === "object"
			? route
			: Router.createRouteMethod(route);
	}

	public constructor(
		defaultRoute: Route | RouteMethod,
		routes?: Record<string, Route | RouteMethod>
	) {
		this.defaultRoute = Router.asRouteMethod(defaultRoute);

		if (!routes) return;
		for (const [key, route] of Object.entries(routes)) {
			this.routes[key] = Router.asRouteMethod(route);
		}
	}

	public async route(
		request: IncomingMessage,
		response: ServerResponse<IncomingMessage>,
		url: URL,
		unhandledEndpoints: string[]
	) {
		const method = request.method!;
		const endpoint = unhandledEndpoints.shift();

		let route = endpoint
			? this.routes[endpoint] as RouteMethod | undefined
			: this.defaultRoute;

		if (!route) {
			sendError(response, `Unhandled endpoint: ${endpoint}`, 404);
			return;
		}

		if (!(method in route)) {
			response.setHeader("allow", Object.keys(route).join(", "));
			sendError(response, `Method not allowed: ${method}`, 405);
			return;
		}

		return route[method as keyof RouteMethod]!(
			request,
			response,
			url,
			unhandledEndpoints
		);
	}
}