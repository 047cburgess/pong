import { FastifyInstance } from 'fastify';
import { UnauthorizedError } from '../utils/errors';

export default async function eventsRoutes(fastify: FastifyInstance) {

	fastify.get('/events', async (request, reply) => {
		const userId = Number(request.headers['x-user-id']);
		if (!userId) {
			throw new UnauthorizedError('Unauthorized');
		}

		reply.raw.setHeader('Content-Type', 'text/event-stream');
		reply.raw.setHeader('Connection', 'keep-alive');
		reply.raw.write(':ping\n\n');

		fastify.eventManager.addConnection(userId, reply);

		fastify.log.info({ userId }, 'SSE connection established');

		// Detecting other issues - unclean closes
		const heartbeat = setInterval(() => {
			try {
				reply.raw.write(':ping\n\n');
			} catch (err) {
				clearInterval(heartbeat);
				fastify.eventManager.removeConnection(userId);
			}
		}, 30000);

		// Clean closes from client
		request.raw.on('close', () => {
			clearInterval(heartbeat);
			fastify.eventManager.removeConnection(userId);
			fastify.log.info({ userId }, 'SSE connection closed');
		});
	});
}
