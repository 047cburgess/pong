import fp from 'fastify-plugin';
import { GameServiceClient } from './game-service.client';

declare module 'fastify' {
	interface FastifyInstance {
		gameClient: GameServiceClient;
	}
}

export default fp(async (fastify) => {
	const client = new GameServiceClient();
	fastify.decorate('gameClient', client);
}, {name: 'gameClient'});
