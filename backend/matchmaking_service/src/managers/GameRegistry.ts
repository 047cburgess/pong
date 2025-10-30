import type { FastifyBaseLogger } from 'fastify';
import { GameId } from '../types';

export type GameType = 'custom' | 'queue' | 'tournament';

export interface GameRegistryEntry {
	type: GameType;
	createdAt: Date;
}

export class GameRegistry {
	private log: FastifyBaseLogger;
	private games: Map<GameId, GameRegistryEntry>;

	constructor(logger: FastifyBaseLogger) {
		this.log = logger;
		this.games = new Map();
	}

	register(gameId: GameId, type: GameType): void {
		this.games.set(gameId, { type, createdAt: new Date() });
		this.log.debug({ gameId, type }, 'Game registered');
	}

	get(gameId: GameId): GameRegistryEntry | undefined {
		return this.games.get(gameId);
	}

	has(gameId: GameId): boolean {
		return this.games.has(gameId);
	}

	unregister(gameId: GameId): boolean {
		const existed = this.games.delete(gameId);
		if (existed) {
			this.log.debug({ gameId }, 'Game unregistered');
		}
		return existed;
	}
}
