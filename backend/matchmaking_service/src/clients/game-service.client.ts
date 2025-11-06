import axios, { AxiosInstance } from 'axios';
import { NewGameResponse, NewGameRequest, NewTournamentGameRequest, NewTournamentGameResponse } from '../types';

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

	// Create a new custom/matchmaking game (classic mode)
	async createGame(request: NewGameRequest): Promise<NewGameResponse> {
		try {
			const response: NewGameResponse = await this.client.post('/internal/games/classic/create', request);
			return response;
		} catch (err: any) {
			throw new Error(`Failed to communicate with game service: ${err.message}`);
		}
	}

	// Create a new tournament game (tournament mode)
	async createTournamentGame(request: NewTournamentGameRequest): Promise<NewTournamentGameResponse> {
		try {
			const response: NewTournamentGameResponse = await this.client.post('/internal/games/tournament/create', request);
			return response;
		} catch (err: any) {
			throw new Error(`Failed to communicate with game service: ${err.message}`);
		}
	}
}

