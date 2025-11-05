import Fastify from "fastify"
import { CommandManager } from "./Managers/CommandManager";
import { ManagerRegistry } from "./Managers/ManagerRegistry";
import { avatarPlugin } from "./API/AvatarPlugin";
import { userPlugin } from "./API/UserPlugin";
import { friendPlugin } from "./API/FriendPlugin";
import { ClearCacheCommand } from "./Commands/ClearCacheCommand";
import fastifyStatic from "@fastify/static";
import { join } from "path";
import fastifyMultipart from "@fastify/multipart";
import fastifyFormbody from "@fastify/formbody";

let isInitialized = false;
let clearIntervalHandle: NodeJS.Timeout | null = null;
const server = createServer();

export function initializeApp() {
	if (isInitialized) return;

	const mr = new ManagerRegistry();
	new CommandManager(mr);

	isInitialized = true;
	console.log('✅ App initialized');

	clearIntervalHandle = setInterval(() => {
		CommandManager.get(ClearCacheCommand).execute();

	}, 10 * 60 * 1000);
}

export function createServer() {
	initializeApp();
	const server = Fastify({ logger: false });

	server.register(fastifyStatic, {
		root: join(__dirname, "public"),
	});

	server.register(userPlugin);
	server.register(friendPlugin);
	server.register(avatarPlugin);

	server.addHook('onReady', () => {
		console.log('Server ready, content type parsers:', server.hasContentTypeParser('multipart/form-data'));
	});

	return server;
}

async function gracefulShutdown(server: any) {
	console.log("\n🛑 Shutting down server...");

	if (clearIntervalHandle) {
		clearInterval(clearIntervalHandle);
		clearIntervalHandle = null;
		console.log("🧹 Cleared interval");
	}

	CommandManager.get(ClearCacheCommand).execute();

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