import { ManagerBase } from "../Commands/CommandManager";
import { DbManager } from "../MOCKS/MOCK_DbManager";
import { ManagerRegistry } from "../ManagerRegistry";
import { UserStatus } from "./UserStatus";
import { user_id, UserData, PublicUserData } from "./User";
import { generateUsername } from "./UsernameGenerator";

const OFFLINE_THRESHOLD = 1000 * 60 * 5; // 5 minutes sans activité

@ManagerRegistry.register(DbManager)
export class UserManager extends ManagerBase {
	private users: Map<user_id, UserData> = new Map();
	private nameToId: Map<string, user_id> = new Map();
	private toSave: UserData[] = [];
	private toRemove: UserData[] = [];

	constructor(private db: DbManager) {
		super();
	}

	// ---------------- Cache Utils ----------------

	private addToCache(user: UserData) {
		this.users.set(user.user_id, user);
		this.nameToId.set(user.name, user.user_id);
	}

	private removeFromCache(user: UserData) {
		this.users.delete(user.user_id);
		this.nameToId.delete(user.name);
	}

	removeName(username: string) {
		this.nameToId.delete(username);
	}

	hasCached(id: user_id): boolean {
		return this.users.has(id);
	}

	getCachedCount(): number {
		return this.users.size;
	}

	clearCache(): void {
		this.users.clear();
		this.nameToId.clear();
	}

	// ---------------- Resolution / Lookup ----------------

	resolveUsername(username: string): user_id | undefined {
		const cached = this.nameToId.get(username);
		if (cached) return cached;

		const user = this.db.getUserByName(username);
		if (user) {
			this.addToCache(user);
			return user.user_id;
		}
		return undefined;
	}

	usernameExists(username: string): boolean {
		if (this.nameToId.has(username)) return true;
		return this.db.hasUserByName(username);
	}

	getOrLoadUserByID(id: user_id): UserData | undefined {
		let user = this.users.get(id);
		if (!user) {
			user = this.db.getUserById(id);
			if (user) this.addToCache(user);
		}
		return user;
	}

	getOrLoadUserByName(username: string): UserData | undefined {
		const id = this.nameToId.get(username);
		if (id) return this.getOrLoadUserByID(id);

		const user = this.db.getUserByName(username);
		if (user) this.addToCache(user);
		return user;
	}

	// ---------------- Lifecycle ----------------

	createDefault(id: user_id, name?: string): UserData {
		const timestamp = Date.now();
		const user: UserData = {
			user_id: id,
			name: name ?? generateUsername(timestamp), //idk should we give a random username until chaged ?
			status: UserStatus.ONLINE,
			last_seen: timestamp,
		};
		this.addToCache(user);
		this.db.saveUser(user);
		return user;
	}

	//idk could be batch saved
	saveUser(id: user_id) {
		const user = this.users.get(id);
		if (user) this.db.saveUser(user);
	}

	removeUser(id: user_id) {
		this.unloadUser(id);
		this.db.removeUser(id);
	}

	saveAll() {
		for (const user of this.toSave) {
			this.db.saveUser(user);
		}
	}

	unloadUser(id: user_id) {
		const user = this.users.get(id);
		if (!user) return;
		this.db.saveUser(user);
		this.removeFromCache(user);
	}

	unloadInactiveUsers() {
		const now = Date.now();
		for (const user of this.users.values()) {
			if (now - user.last_seen > OFFLINE_THRESHOLD) {
				user.status = UserStatus.OFFLINE;
				this.unloadUser(user.user_id);
			}
		}
	}

	// ---------------- Ping / Seen ----------------

	onUserSeen(id: user_id): UserData {
		let user = this.users.get(id);
		if (!user) {
			user = this.getOrLoadUserByID(id) ?? this.createDefault(id);
		}
		user.last_seen = Date.now();
		user.status = UserStatus.ONLINE;
		return user;
	}

	// ---------------- Internal Tools ----------------

	getUserID(username: string): user_id | undefined {
		return this.nameToId.get(username);
	}

	getUserByID(id: user_id): UserData | undefined {
		return this.users.get(id);
	}

	getUserByName(username: string): UserData | undefined {
		const id = this.nameToId.get(username);
		return id ? this.users.get(id) : undefined;
	}

	// ---------------- Tools for PublicUserData -------------
	toPublic(user: UserData): PublicUserData {
		return {
			name: user.name,
			status: user.status,
			last_seen: user.last_seen
		};
	}

	getPublicByID(id: user_id): PublicUserData | undefined {
		const user = this.getOrLoadUserByID(id);
		return user ? this.toPublic(user) : undefined;
	}

	getPublicByUsername(username: string): PublicUserData | undefined {
		const user = this.getOrLoadUserByName(username);
		return user ? this.toPublic(user) : undefined;
	}

	getPublicBatchByIDs(ids: user_id[]): PublicUserData[] {
		const result: PublicUserData[] = [];
		for (const id of ids) {
			const user = this.getOrLoadUserByID(id);
			if (user) result.push(this.toPublic(user));
		}
		return result;
	}

	getPublicBatchByUsernames(usernames: string[]): PublicUserData[] {
		const result: PublicUserData[] = [];
		for (const name of usernames) {
			const user = this.getOrLoadUserByName(name);
			if (user) result.push(this.toPublic(user));
		}
		return result;
	}

	printUserManager() {
		console.log("\n╔════════════════════════════════════════╗");
		console.log("║         USER MANAGER STATE             ║");
		console.log("╚════════════════════════════════════════╝");

		console.log(`\n📊 Number of users in cache: ${this.getCachedCount()}`);

		console.log("\n👤 Cached users:");

		if (this.users.size === 0) {
			console.log("  (empty)");
		} else {
			for (const [id, user] of this.users.entries()) {
				console.log(`  • ID: ${id}`);
				console.log(`    Name: ${user.name}`);
				console.log(`    Status: ${UserStatus[user.status]}`);
				console.log(`    Last activity: ${new Date(user.last_seen).toLocaleString()}`);
			}
		}
		console.log("\n🔗 Name -> ID Map:");
		if (this.nameToId.size === 0) {
			console.log("  (empty)");
		} else {
			for (const [name, id] of this.nameToId.entries()) {
				console.log(`  • "${name}" -> ${id}`);
			}
		}
		console.log("\n" + "═".repeat(42) + "\n");
	}

}

