import { FastifyInstance } from 'fastify';
import { UnauthorizedError } from '../utils/errors';
import { submitLocalGameSchema, submitLocalTournamentSchema } from './local-games.schemas';
import { LocalGameSubmission, LocalTournamentSubmission } from '../types';

export default async function localGamesRoutes(fastify: FastifyInstance) {

	// POST /games/local - Submit local game result
	fastify.post('/games/local', {
		schema: submitLocalGameSchema
	}, (request, reply) => {
		const hostId = Number(request.headers['x-user-id']);
		if (!hostId) {
			throw new UnauthorizedError();
		}
		const submission = request.body as LocalGameSubmission;
		fastify.gameHistory.saveLocalGame(submission, hostId);
		return reply.code(204).send();
	});

	// POST /tournaments/local - Submit local tournament result
	fastify.post('/tournaments/local', {
		schema: submitLocalTournamentSchema
	}, (request, reply) => {
		const hostId = Number(request.headers['x-user-id']);
		if (!hostId) {
			throw new UnauthorizedError();
		}

		const submission = request.body as LocalTournamentSubmission;
		fastify.gameHistory.saveLocalTournament(submission, hostId);
		return reply.code(204).send();
	});
}
