import type { FastifyInstance, FastifyBaseLogger } from 'fastify';
import { UserId, GameId, TournamentId, GameResultAPI, TournamentResultAPI, GameStatsAPI, DailyPlayerStatsAPI } from '../types';
import { NotFoundError } from '../utils/errors';

export class GameHistoryManager {
	private log: FastifyBaseLogger;
	private db: FastifyInstance['db'];

	constructor(db: FastifyInstance['db'], logger: FastifyBaseLogger) {
		this.log = logger;
		this.db = db;
	}

	private transformGameRow(row: any): GameResultAPI {
		const players = JSON.parse(row.players);
		return {
			id: row.game_id,
			players: players.map((p: any) => ({
				id: p.id,
				score: p.score,
			})),
			winnerId: row.winner_id,
			tournamentId: row.tournament_id,
			date: new Date(row.date),
			duration: row.duration,
		};
	}

	private transformTournamentRow(row: any): TournamentResultAPI {
		const semi1 = this.db.getGameById(row.semi1_id);
		const semi2 = this.db.getGameById(row.semi2_id);
		const final = this.db.getGameById(row.final_id);

		if (!semi1 || !semi2 || !final) {
			this.log.error({ tournamentId: row.tournament_id }, 'Tournament missing game data');
			throw new Error('Tournament data incomplete');
		}

		return {
			id: row.tournament_id,
			date: new Date(row.date),
			participants: JSON.parse(row.participants).map((p: any) => ({ id: p.id })),
			games: {
				semifinal1: this.transformGameRow(semi1),
				semifinal2: this.transformGameRow(semi2),
				final: this.transformGameRow(final),
			},
		};
	}

	/**
	 * Get paginated list of games for a player
	 * @param userId - The player's user ID
	 * @param page - Page number (1-indexed)
	 * @param perPage - Number of games per page
	 * @returns Array of game results in API format
	 */
	getPlayerGames(userId: UserId, page: number = 1, perPage: number = 25): GameResultAPI[] {
		const offset = (page - 1) * perPage;
		const rows = this.db.getGamesByPlayer(userId, perPage, offset);
		return rows.map(row => this.transformGameRow(row));
	}

	/**
	 * Get paginated list of tournaments for a player
	 * @param userId - The player's user ID
	 * @param page - Page number (1-indexed)
	 * @param perPage - Number of tournaments per page
	 * @returns Array of tournament results in API format
	 */
	getPlayerTournaments(userId: UserId, page: number = 1, perPage: number = 20): TournamentResultAPI[] {
		const offset = (page - 1) * perPage;
		const rows = this.db.getTournamentsByPlayer(userId, perPage, offset);
		return rows.map(row => this.transformTournamentRow(row));
	}

	/**
	 * Get comprehensive stats for a player
	 * - Lifetime win/draw/loss stats
	 * - Daily stats for last 7 days
	 * - 5 most recent games
	 * - 5 most recent tournaments
	 * @param userId - The player's user ID
	 * @returns Complete player statistics
	 */
	getPlayerStats(userId: UserId): GameStatsAPI {
		const lifetimeStats = this.db.getGameStatsByPlayer(userId);
		const dailyRows = this.db.getDailyStatsByPlayer(userId);
		const daily: DailyPlayerStatsAPI[] = dailyRows.slice(0, 7).map((row: any) => ({
			day: row.day,
			wins: row.wins,
			draws: row.draws,
			losses: row.losses,
		}));
		const recentGameRows = this.db.getRecentGamesByPlayer(userId, 5);
		const recentGames = recentGameRows.map(row => this.transformGameRow(row));
		const recentTournamentRows = this.db.getRecentTournamentsByPlayer(userId, 5);
		const recentTournaments = recentTournamentRows.map(row => this.transformTournamentRow(row));

		return {
			lifetime: {
				wins: lifetimeStats.wins || 0,
				draws: lifetimeStats.draws || 0,
				losses: lifetimeStats.losses || 0,
			},
			daily,
			recentGames,
			recentTournaments,
		};
	}

	/**
	 * Get a specific game by ID
	 * @param gameId - The game ID
	 * @returns Game result in API format
	 * @throws NotFoundError if game doesn't exist
	 */
	getGameById(gameId: GameId): GameResultAPI {
		const row = this.db.getGameById(gameId);
		if (!row) throw new NotFoundError('Game not found');
		return this.transformGameRow(row);
	}

	/**
	 * Get a specific tournament by ID with all its games
	 * @param tournamentId - The tournament ID
	 * @returns Tournament result in API format
	 * @throws NotFoundError if tournament doesn't exist
	 */
	getTournamentById(tournamentId: TournamentId): TournamentResultAPI {
		const row = this.db.getTournamentById(tournamentId);
		if (!row) throw new NotFoundError('Tournament not found');
		return this.transformTournamentRow(row);
	}
}
