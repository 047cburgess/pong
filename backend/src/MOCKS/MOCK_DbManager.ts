import { ManagerBase } from "../Managers/CommandManager";
import { UserData, user_id } from "../Managers/UserManager";
import { FriendRequest } from "../Managers/FriendManager";

//@ManagerRegistry.register()
export class DbManager extends ManagerBase {
	// In-memory storage
	private users: Map<user_id, UserData> = new Map();
	private usersByName: Map<string, UserData> = new Map();
	private friendRequests: Map<string, FriendRequest> = new Map(); // key: request_id "min:max"

	// Spy/Stats pour vérifier les appels
	public stats = {
		getUserByIdCalls: 0,
		getUserByNameCalls: 0,
		hasUserByNameCalls: 0,
		saveUserCalls: 0,
		removeUserCalls: 0,
		getFriendRequestsCalls: 0,
		saveFriendRequestsCalls: 0,
		removeFriendRequestsCalls: 0,
		removeAllUserFriendRequestsCalls: 0,
		saveUsersCalls: 0,
	};

	public shouldFailOnSave = false;
	public shouldFailOnLoad = false;

	constructor() { super(); }

	// ================= HELPERS =================

	private makeRequestId(a: user_id, b: user_id): string {
		return a < b ? `${a}:${b}` : `${b}:${a}`;
	}

	private cloneFriend(req: FriendRequest): FriendRequest {
		return { ...req };
	}

	// ================= RESET / SEED =================

	reset(): void {
		this.users.clear();
		this.usersByName.clear();
		this.friendRequests.clear();
		this.resetStats();
	}

	resetStats(): void {
		Object.keys(this.stats).forEach(k => (this.stats as any)[k] = 0);
	}

	seed(users: UserData[], requests: Omit<FriendRequest, 'request_id'>[] = []): void {
		for (const u of users) {
			this.users.set(u.id, { ...u });
			this.usersByName.set(u.name, { ...u });
		}
		for (const r of requests) {
			const id = this.makeRequestId(r.sender_id, r.receiver_id);
			this.friendRequests.set(id, { ...r, request_id: id });
		}
	}

	// ================= USER OPS =================

	getUserById(id: user_id): UserData | undefined {
		this.stats.getUserByIdCalls++;
		const u = this.users.get(id);
		return u ? { ...u } : undefined;
	}

	getUserByName(name: string): UserData | undefined {
		this.stats.getUserByNameCalls++;
		const u = this.usersByName.get(name);
		return u ? { ...u } : undefined;
	}

	hasUserByName(name: string): boolean {
		this.stats.hasUserByNameCalls++;
		return this.usersByName.has(name);
	}

	saveUser(user: UserData): void {
		this.stats.saveUserCalls++;
		const old = this.users.get(user.id);
		if (old && old.name !== user.name) this.usersByName.delete(old.name);
		const clone = { ...user };
		this.users.set(user.id, clone);
		this.usersByName.set(user.name, clone);
	}

	removeUser(id: user_id): void {
		this.stats.removeUserCalls++;
		const u = this.users.get(id);
		if (!u) return;
		this.users.delete(id);
		this.usersByName.delete(u.name);
		this.RemoveAllUserFriendRequests(id);
	}

	// ================= FRIEND OPS =================

	getFriendRequest(user: user_id, friend: user_id): FriendRequest | undefined {
		const id = this.makeRequestId(user, friend);
		const r = this.friendRequests.get(id);
		return r ? { ...r } : undefined;
	}

	getFriendRequestsForUser(user_id: user_id): FriendRequest[] {
		this.stats.getFriendRequestsCalls++;
		const res: FriendRequest[] = [];
		for (const r of this.friendRequests.values()) {
			if (r.sender_id === user_id || r.receiver_id === user_id) res.push(this.cloneFriend(r));
		}
		return res;
	}

	saveFriendRequests(requests: FriendRequest[]): void {
		this.stats.saveFriendRequestsCalls++;
		for (const r of requests) {
			this.friendRequests.set(r.request_id, r);
		}
	}

	RemoveFriendRequests(request_ids: string[]): void {
		this.stats.removeFriendRequestsCalls++;
		for (const id of request_ids) this.friendRequests.delete(id);
	}

	RemoveAllUserFriendRequests(user_id: user_id): void {
		this.stats.removeAllUserFriendRequestsCalls++;
		const toDelete: string[] = [];
		for (const [id, r] of this.friendRequests.entries()) {
			if (r.sender_id === user_id || r.receiver_id === user_id) toDelete.push(id);
		}
		for (const id of toDelete) this.friendRequests.delete(id);
	}

	// ================= BATCH USERS =================

	saveUsers(users: UserData[]): void {
		this.stats.saveUsersCalls++;
		for (const u of users) this.saveUser(u);
	}

	// ================= DEBUG / UTIL =================

	print(): void {
		console.log("=== MOCK DB STATE ===");
		console.log("Users:");
		for (const u of this.users.values()) {
			console.log(`  [${u.id}] ${u.name} (last_seen: ${u.last_seen})`);
		}
		console.log("Friend Requests:");
		for (const r of this.friendRequests.values()) {
			console.log(`  ${r.sender_id} -> ${r.receiver_id} [${r.request_id}] (status: ${r.status})`);
		}
		console.log("====================");
	}

	printStats(): void {
		console.log("=== Mock Stats ===");
		console.log(JSON.stringify(this.stats, null, 2));
	}
	
	saveAll() {
		
	}
}
