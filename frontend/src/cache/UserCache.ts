import { friendsApi } from "../api/FriendsApi.js";
import { userApi } from "../api/UserApi.js";
import { user_id, PublicInfo, Messages } from "../types.js";

export interface UserCacheData {
	user: PublicInfo;
	friends: Map<string, PublicInfo>;
	outgoing: Map<string, PublicInfo>;
	incoming: Map<string, PublicInfo>;
}

const cache = new Map<user_id, UserCacheData>();

export const userCache = {
	has: (id: user_id) => cache.has(id),
	get: (id: user_id) => cache.get(id),
	set: (id: user_id, data: UserCacheData) => cache.set(id, data),
	delete:(id : user_id) => cache.delete(id),
};

export async function init_usercache(user_id: number): Promise<UserCacheData | undefined> {
	const user = await userApi.getUser();
	if (user.status != 200) return;

	const [friends, outgoing, incoming] = await Promise.all([
		friendsApi.getFriends(),
		friendsApi.getOutgoing(),
		friendsApi.getIncoming(),
	]);

	if(friends.status >= 400 || outgoing.status >= 400 || incoming.status >= 400)
		return undefined;

	const friendMap = new Map<string, PublicInfo>(
		(friends.data ?? []).map(u => [u.username, u])
	);

	const outgoingMap = new Map<string, PublicInfo>(
		(outgoing.data ?? []).map(u => [u.username, u])
	);

	const incomingMap = new Map<string, PublicInfo>(
		(incoming.data ?? []).map(u => [u.username, u])
	);

	const cache: UserCacheData = {
		user : user.data!,
		friends: friendMap,
		outgoing: outgoingMap,
		incoming: incomingMap,
	};

	return cache;
}
