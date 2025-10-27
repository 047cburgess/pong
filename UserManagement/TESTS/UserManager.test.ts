import { UserManager } from "../UserData/UserManager";
import { UserStatus } from "../UserData/UserStatus";
import { UserData } from "../UserData/User";
import { DbManager } from "../MOCKS/MOCK_DbManager";

//claude generated tests
// ============ FONCTION DE PRINT ============


// ============ TESTS EXHAUSTIFS ============

function assert(condition: boolean, message: string) {
	if (!condition) {
		console.error(`❌ FAIL: ${message}`);
	} else {
		console.log(`✅ PASS: ${message}`);
	}
}

function runTests() {

	const db = new DbManager();
	const um = new UserManager(db);

	console.log("=== DÉBUT DES TESTS USERMANAGER ===\n");

	// Test 1: État initial
	console.log("--- État initial ---");
	um.printUserManager();

	// Test 2: createDefault
	console.log("--- Test createDefault ---");
	const user1 = um.createDefault(1, "Alice");
	assert(user1.user_id === 1, "user_id correct");
	assert(user1.name === "Alice", "name correct");
	assert(user1.status === UserStatus.ONLINE, "status ONLINE");
	assert(um.hasCached(1), "user en cache");
	assert(um.getCachedCount() === 1, "1 user en cache");
	um.printUserManager();

	// Test 3: createDefault sans nom
	console.log("--- Test createDefault sans nom ---");
	const user2 = um.createDefault(2);
	assert(user2.name.length > 0, "nom généré");
	assert(um.getCachedCount() === 2, "2 users en cache");
	um.printUserManager();

	// Test 4: resolveUsername
	console.log("--- Test resolveUsername ---");
	const id = um.resolveUsername("Alice");
	assert(id === 1, "resolve Alice -> 1");
	assert(um.resolveUsername("Unknown") === undefined, "resolve Unknown -> undefined");

	// Test 5: usernameExists
	console.log("--- Test usernameExists ---");
	assert(um.usernameExists("Alice"), "Alice existe");
	assert(!um.usernameExists("Bob"), "Bob n'existe pas");

	// Test 6: getOrLoadUserByID
	console.log("--- Test getOrLoadUserByID ---");
	const loaded = um.getOrLoadUserByID(1);
	assert(loaded?.user_id === 1, "load user1");
	assert(um.getOrLoadUserByID(999) === undefined, "load user inexistant");

	// Test 7: getOrLoadUserByName
	console.log("--- Test getOrLoadUserByName ---");
	const loadedByName = um.getOrLoadUserByName("Alice");
	assert(loadedByName?.user_id === 1, "load par nom");
	assert(um.getOrLoadUserByName("Unknown") === undefined, "load nom inexistant");

	// Test 8: getUserID, getUserByID, getUserByName
	console.log("--- Test getters ---");
	assert(um.getUserID("Alice") === 1, "getUserID");
	assert(um.getUserByID(1)?.name === "Alice", "getUserByID");
	assert(um.getUserByName("Alice")?.user_id === 1, "getUserByName");

	// Test 9: onUserSeen
	console.log("--- Test onUserSeen ---");
	const oldTime = user1.last_seen;
	const seenUser = um.onUserSeen(1);
	assert(seenUser.last_seen > oldTime, "last_seen mis à jour");
	assert(seenUser.status === UserStatus.ONLINE, "status ONLINE");
	um.printUserManager();

	// Test 10: toPublic
	console.log("--- Test toPublic ---");
	const pub = um.toPublic(user1);
	assert(pub.name === "Alice", "public name");
	assert(pub.status === UserStatus.ONLINE, "public status");
	assert(!("user_id" in pub), "pas de user_id dans public");

	// Test 11: getPublicByID, getPublicByUsername
	console.log("--- Test getPublic ---");
	const pub1 = um.getPublicByID(1);
	assert(pub1?.name === "Alice", "getPublicByID");
	const pub2 = um.getPublicByUsername("Alice");
	assert(pub2?.name === "Alice", "getPublicByUsername");
	assert(um.getPublicByID(999) === undefined, "getPublicByID inexistant");

	// Test 12: getPublicBatchByIDs
	console.log("--- Test getPublicBatchByIDs ---");
	const batch1 = um.getPublicBatchByIDs([1, 2, 999]);
	assert(batch1.length === 2, "batch de 2 users");
	assert(batch1[0]!.name === "Alice", "premier user");

	// Test 13: getPublicBatchByUsernames
	console.log("--- Test getPublicBatchByUsernames ---");
	const batch2 = um.getPublicBatchByUsernames(["Alice", user2.name, "Unknown"]);
	assert(batch2.length === 2, "batch de 2 users");

	// Test 14: unloadUser
	console.log("--- Test unloadUser ---");
	um.unloadUser(2);
	assert(um.getCachedCount() === 1, "user2 déchargé du cache");
	assert(!um.hasCached(2), "user2 plus en cache");
	um.printUserManager();

	// Test 15: removeUser
	console.log("--- Test removeUser ---");
	um.removeUser(1);
	assert(um.getCachedCount() === 0, "user1 supprimé du cache");
	um.printUserManager();

	// Test 16: clearCache
	console.log("--- Test clearCache ---");
	um.createDefault(3, "Charlie");
	um.printUserManager();
	um.clearCache();
	assert(um.getCachedCount() === 0, "cache vidé");
	um.printUserManager();

	// Test 17: unloadInactiveUsers
	console.log("--- Test unloadInactiveUsers ---");
	const user4 = um.createDefault(4, "Dave");
	user4.last_seen = Date.now() - 1000 * 60 * 10; // 10 min ago
	um.printUserManager();
	um.unloadInactiveUsers();
	assert(!um.hasCached(4), "user inactif déchargé");
	um.printUserManager();

	console.log("=== FIN DES TESTS ===");
}

// ============ EXPORT ============

export { runTests};

if (require.main === module) {
	runTests();
}
