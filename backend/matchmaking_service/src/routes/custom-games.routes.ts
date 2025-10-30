import { FastifyInstance } from 'fastify';
import { createCustomGameSchema, joinGameSchema, declineGameSchema } from './custom-games.schemas';
import { UnauthorizedError } from '../utils/errors';
import { UserId } from '../types';

// TODO: Authentication -> should be a prehandler rather than being mixed in. Here temp.
export default async function customGamesRoutes(fastify: FastifyInstance) {

	// POST /games/create - Create custom game
	fastify.post('/games/create', {
		schema: createCustomGameSchema
	}, async (request) => {
		const hostId = Number(request.headers['x-user-id']);
		if (!hostId) {
			throw new UnauthorizedError();
		}
		const { numberOfPlayers, invitedPlayerIds } = request.body as {
			numberOfPlayers: number;
			invitedPlayerIds: UserId[];
		};
		const hostKey = await fastify.customGameManager.createGame(
			hostId,
			invitedPlayerIds,
			numberOfPlayers
		);
		return hostKey;
	});

	// POST /games/{gameId}/join - Accept game invite
	fastify.post<{ Params: { gameId: string } }>('/games/:gameId/join', {
		schema: joinGameSchema
	}, async (request) => {
		const playerId = Number(request.headers['x-user-id']);
		if (!playerId) {
			throw new UnauthorizedError();
		}
		const gameId = request.params.gameId;
		const playerKey = fastify.customGameManager.acceptInvite(gameId, playerId);
		return playerKey; // automatically does success
	});

	// DELETE /games/{gameId}/decline - Decline game invite
	fastify.delete<{ Params: { gameId: string } }>('/games/:gameId/decline', {
		schema: declineGameSchema
	}, async (request, reply) => {
		const playerId = Number(request.headers['x-user-id']);
		if (!playerId) {
			throw new UnauthorizedError();
		}
		const gameId = request.params.gameId;
		fastify.customGameManager.declineInvite(gameId, playerId); // business logic errors thrown inside
		return reply.code(204).send(); // more explicit 204 for no content
	});
}
