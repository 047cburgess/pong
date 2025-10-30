import axios, { AxiosInstance } from 'axios';
import { NewGameResponse, NewGameRequest, GameKey } from '../types';
import { z } from 'zod';

const gameKeySchema = z.object({
	key: z.string(),
	gameId: z.string(),
	expires: z.string().transform(str => new Date(str))
});

const createGameResponseSchema = z.object({
	keys: z.array(gameKeySchema)
});

export class GameServiceClient {
	private client: AxiosInstance;

	constructor() {
		const baseURL = process.env.GAME_SERVICE_URL || 'http://game-service:3001';

		this.client = axios.create({
			baseURL,
			timeout: 5000,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// Create a new game
	async createGame(request: NewGameRequest): Promise<NewGameResponse> {
		try {
			const response = await this.client.post('/internal/games/create', request);
			return createGameResponseSchema.parse(response.data); // will throw exception if wrong
		} catch (err: any) {
			throw new Error(`Failed to communicate with game service: ${err.message}`);
		}
	}
}

// TODO: getting status of ongoing game if needed -> tbc
