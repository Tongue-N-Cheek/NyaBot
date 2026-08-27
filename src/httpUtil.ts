import type { IncomingMessage } from "node:http";

export function readBody(request: IncomingMessage) {
	return new Promise((resolve, reject) => {
		let body = "";
		request.on("data", chunk => body += chunk);
		request.on("end", () => {
			if (!request.complete) {
				reject("Connection aborted");
				return;
			}
			try {
				resolve(JSON.parse(body));
			} catch (error) {
				reject(error);
			}
		});
		request.on("error", reject);
	});
}