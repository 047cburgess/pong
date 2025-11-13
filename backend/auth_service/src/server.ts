import fastify from "fastify";
import { apiGateway } from "./Api/ApiGateway";
import { AuthPlugin } from "./Api/AuthPuglin";

let isInitialized = false;
let clearIntervalHandle: NodeJS.Timeout | null = null;
const server = createServer();

export function initializeApp() {
	if (isInitialized) return;

	isInitialized = true;
	console.log('✅ App initialized');

}

export function createServer() {
	initializeApp();
	const server = fastify({ logger: false });

	server.register(AuthPlugin);
	server.register(apiGateway);

	server.addHook('onReady', () => {
		console.log('Server ready');
	});

	return server;
}

async function gracefulShutdown(server: any) {
	console.log("\n🛑 Shutting down server...");

	try {
		await server.close();
		console.log("✅ Fastify server closed");
	} catch (err) {
		console.error("⚠️ Error closing Fastify server:", err);
	}

	process.exit(0);
}

server.listen({ port: 3000, host: "0.0.0.0" })
	.then(() => console.log("✅ Serveur prêt sur http://localhost:3000"))
	.catch(console.error);

process.on("SIGINT", () => gracefulShutdown(server));
process.on("SIGTERM", () => gracefulShutdown(server));
