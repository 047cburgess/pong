import { FastifyInstance } from "fastify";
import { createServer } from "./server"; // Ton fichier serveur

interface RequestOptions {
	method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	url: string;
	headers?: Record<string, string>;
	body?: any;
	query?: Record<string, string>;
}

interface Response {
	statusCode: number;
	headers: Record<string, any>;
	body: any;
	rawBody: string;
}

export class APITestClient {
	private app: FastifyInstance;
	private defaultHeaders: Record<string, string> = {};
	private senderId?: number;

	constructor() {
		this.app = createServer();
	}

	// Définir des headers par défaut (ex: authentification)
	setDefaultHeaders(headers: Record<string, string>) {
		this.defaultHeaders = { ...this.defaultHeaders, ...headers };
		return this;
	}

	// Définir le sender_id par défaut (simule l'authentification)
	setSenderId(senderId: number | null) {
		if (senderId)
			this.senderId = senderId;
		return this;
	}

	async request(options: RequestOptions): Promise<Response> {
		try {
			console.log('[CLIENT] Starting request...');
			const { method, url, headers = {}, body, query } = options;

			let fullUrl = url;
			if (query) {
				const queryString = new URLSearchParams(query).toString();
				fullUrl += `?${queryString}`;
			}

			console.log(`\n📤 ${method} ${fullUrl}`);
			console.log('Headers:', { ...this.defaultHeaders, ...headers });
			if (body) console.log('Body:', body);
			if (this.senderId) console.log('Sender ID:', this.senderId);

			console.log('[CLIENT] About to inject request...');

			// Injecter sender_id via header pour les tests
			const finalHeaders = {
				...this.defaultHeaders,
				...headers
			};

			if (this.senderId !== undefined) {
				finalHeaders['x-test-sender-id'] = this.senderId.toString();
			}
			console.log('[CLIENT] Injecting')
			const response = await this.app.inject({
				method,
				url: fullUrl,
				headers: finalHeaders,
				payload: body
			});
			console.log('[CLIENT] Request injected successfully');

			const result: Response = {
				statusCode: response.statusCode,
				headers: response.headers,
				body: response.body ? this.tryParseJSON(response.body) : null,
				rawBody: response.body
			};

			console.log(`📥 Response ${result.statusCode}`);
			console.log('Body:', result.body);
			return result;
		} catch (error) {
			console.error('[CLIENT] ❌ REQUEST FAILED:', error);
			throw error;
		}
	}

	// Méthodes helper pour chaque type de requête
	async get(user_id: number | null, url: string, options: Partial<RequestOptions> = {}) {
		this.setSenderId(user_id);
		return this.request({ method: 'GET', url, ...options });
	}

	async post(user_id: number | null, url: string, body?: any, options: Partial<RequestOptions> = {}) {
		this.setSenderId(user_id);
		return this.request({ method: 'POST', url, body, ...options });
	}

	async put(user_id: number | null, url: string, body?: any, options: Partial<RequestOptions> = {}) {
		this.setSenderId(user_id);
		return this.request({ method: 'PUT', url, body, ...options });
	}

	async delete(user_id: number | null, url: string, options: Partial<RequestOptions> = {}) {
		this.setSenderId(user_id);
		return this.request({ method: 'DELETE', url, ...options });
	}

	// Helper pour parser JSON
	private tryParseJSON(str: string) {
		try {
			return JSON.parse(str);
		} catch {
			return str;
		}
	}

	// Fermer le serveur (utile pour les tests)
	async close() {
		await this.app.close();
	}
}

// ========== TESTS INTERACTIFS ==========

async function runTests() {
	const client = new APITestClient();


	console.log('=== TEST SUITE ===\n');

	//Custom test :
	console.log('');

	console.log('🧪 Test 1: Get user Data (id 1)');
	let result = await client.get(1, '/user');
	console.assert(result.statusCode === 200, '❌ Should return 200');
	console.log(result.statusCode === 200 ? '✅ PASS' : '❌ FAIL');

	console.log('Creating New Users');
	await client.get(2, '/user');
	await client.get(3, '/user');
	await client.get(4, '/user');

	console.log('🧪 Test 2: Change username (id 1)');
	result = await client.put(1, '/user/username', { username: "Wayden" });
	console.assert(result.statusCode === 204, '❌ Should return 204');
	console.log(result.statusCode === 204 ? '✅ PASS' : '❌ FAIL');

	console.log('🧪 Test 3: Change Same username (id 2)');
	result = await client.put(2, '/user/username', { username: "Wayden" });
	console.assert(result.statusCode !== 204, '❌ Should not return 204');
	console.log(result.statusCode !== 204 ? '✅ PASS' : '❌ FAIL');

	console.log('🧪 Test 3: Change Wrong username (id 2)');
	result = await client.put(2, '/user/username', { username: "                    *Wayden*" });
	console.assert(result.statusCode !== 204, '❌ Should not return 204');
	console.log(result.statusCode !== 204 ? '✅ PASS' : '❌ FAIL');

	console.log('Changing Usernames');
	await client.put(2, '/user/username', { username: "user2" });
	await client.put(3, '/user/username', { username: "user3" });
	await client.put(4, '/user/username', { username: "user4" });

	console.log('🧪 Test 4: Get user_id (username : Wayden)');
	result = await client.put(null, '/user/Wayden/id');
	console.assert(result.statusCode === 200, '❌ Should return 200');
	console.log(result.statusCode === 200 ? '✅ PASS' : '❌ FAIL');

	console.log('🧪 Test 5: Add Friend (id 1 to user2)');
	result = await client.post(1, '/user/friends/request/outgoing/user2');
	console.assert(result.statusCode === 200, '❌ Should return 200');
	console.log(result.statusCode === 200 ? '✅ PASS' : '❌ FAIL');

	console.log('🧪 Test 6: get notifications (id 2)')
	result = await client.get(2, '/user/friends/notifications');
	console.assert(result.statusCode === 200, '❌ Should return 200');
	console.log(result.statusCode === 200 ? '✅ PASS' : '❌ FAIL');

	console.log('🧪 Test 7: AcceptRequest (id 2 <= Wayden)')
	result = await client.put(2, '/user/friends/request/Wayden');
	console.assert(result.statusCode === 204, '❌ Should return 204');
	console.log(result.statusCode === 204 ? '✅ PASS' : '❌ FAIL');

	console.log('🧪 Test 8: AcceptRequest again (id 2 <= Wayden)')
	result = await client.put(2, '/user/friends/request/Wayden');
	console.assert(result.statusCode !== 204, '❌ Should not return 204');
	console.log(result.statusCode !== 204 ? '✅ PASS' : '❌ FAIL');

	console.log('🧪 Test 9: Remove Friend (id 2 <= Wayden)')
	result = await client.delete(2, '/user/friends/Wayden');
	console.assert(result.statusCode === 204, '❌ Should return 204');
	console.log(result.statusCode === 204 ? '✅ PASS' : '❌ FAIL');

	console.log(' get notifications (id 1)')
	await client.get(1, '/user/friends/notifications');

	console.log('asking friends (id2 => everyone)')
	await client.post(2, '/user/friends/request/outgoing/Wayden');
	await client.post(2, '/user/friends/request/outgoing/user3');
	await client.post(2, '/user/friends/request/outgoing/user4');

	console.log('🧪 Test 10: GetOutgoing (id 2)')
	result = await client.get(2, '/user/friends/requests/outgoing');
	console.assert(result.statusCode === 200, '❌ Should return 200');
	console.log(result.statusCode === 200 ? '✅ PASS' : '❌ FAIL');

	console.log('🧪 Test 11: GetIncoming (id 4)')
	result = await client.get(4, '/user/friends/requests');
	console.assert(result.statusCode === 200, '❌ Should return 200');
	console.log(result.statusCode === 200 ? '✅ PASS' : '❌ FAIL');

	console.log('🧪 Test 12: RefuseRequest (id 3 <= user2)')
	result = await client.delete(3, '/user/friends/request/user2');
	console.assert(result.statusCode === 204, '❌ Should return 204');
	console.log(result.statusCode === 204 ? '✅ PASS' : '❌ FAIL');

	console.log('🧪 Test 13: CancelRequest (id 4 <= user2)')
	result = await client.delete(2, '/user/friends/request/outgoing/user4');
	console.assert(result.statusCode === 204, '❌ Should return 204');
	console.log(result.statusCode === 204 ? '✅ PASS' : '❌ FAIL');

	console.log("wayden accept request from user2")
	await client.put(1, "/user/friends/request/user2");

	console.log('🧪 Test 14: getfriends (id 2)')
	result = await client.get(2, '/user/friends');
	console.assert(result.statusCode === 200, '❌ Should return 200');
	console.log(result.statusCode === 200 ? '✅ PASS' : '❌ FAIL');

	await client.post(2, '/user/friends/request/outgoing/user3');
	await client.post(2, '/user/friends/request/outgoing/user4');

	console.log('🧪 Test 14: removeUser (id 2)')
	result = await client.get(2, '/user/friends');
	console.assert(result.statusCode === 200, '❌ Should return 200');
	console.log(result.statusCode === 200 ? '✅ PASS' : '❌ FAIL');

	client.delete(2, "/user");

	await client.close();
	console.log('\n=== TESTS COMPLETE ===');
}

// Exporter pour utilisation
export { runTests };

// Pour lancer: 
// import { runTests } from './apiTestClient';
runTests();