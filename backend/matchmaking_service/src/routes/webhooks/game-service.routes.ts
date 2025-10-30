import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { GameResultWebhook } from '../../types';
import { gameResultWebhookSchema } from './game-service.schemas';

// TODO: update schema on typespec -> more standard apparently to just return 200 with whatever message rather than different status codes.
export default async function webhooksRoutes(fastify: FastifyInstance) {
	fastify.post<{
		Params: { gameId: string };
		Body: Omit<GameResultWebhook, 'id'>;
	}>('/webhooks/games/:gameId/result', {
		schema: gameResultWebhookSchema
	}, async (req, reply) => {
		const gameId = req.params.gameId;
		const gameResult: GameResultWebhook = {
			id: gameId,
			mode: req.body.mode,
			players: req.body.players,
			winnerId: req.body.winnerId,
			date: req.body.date,
			duration: req.body.duration
		};

		const gameEntry = fastify.gameRegistry.get(gameId);
		if (!gameEntry) {
			fastify.log.warn({ gameId }, 'Received result for unregistered game');
			return { message: 'Game not found.' };
		}

		try {
			switch (gameEntry.type) {
				case 'custom':
					fastify.customGameManager.handleGameComplete(gameResult);
					break;
				case 'queue':
					fastify.queueManager.handleGameComplete(gameResult);
					break;
				case 'tournament':
					// TODO: implement when tournament manager is ready
					fastify.log.warn({ gameId }, 'Received result for tournament game (not yet supported)');
					return { message: 'Tournament games not yet supported' };
			}

			return { message: 'Game result processed successfully' };
		} catch (error) {
			fastify.log.error({ gameId, error }, 'Failed to process game result');
			return { message: 'Failed to process game result' };
		}
	});
}
