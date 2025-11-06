import { userId } from "../api/coreApi.js";
import { friendsApi } from "../api/FriendsApi.js";
import { userApi } from "../api/UserApi.js";
import { userCache } from "../cache/UserCache.js";
import { FriendRequestError } from "../types.js";
import { renderFriendsLists } from "../ui/RenderFriends.js";

function getFriendRequestErrorMessage(error: FriendRequestError): string {
	switch (error) {
		case FriendRequestError.REQUEST_SELF:
			return "You cannot send a friend request to yourself.";
		case FriendRequestError.REQUEST_ALREADY:
			return "A friend request has already been sent to this user.";
		case FriendRequestError.REQUEST_UNDEFINED:
			return "The friend request is invalid or no longer exists.";
		case FriendRequestError.USER_UNDEFINED:
			return "The specified user could not be found.";
		case FriendRequestError.FRIEND_ALREADY:
			return "You are already friends with this user.";
		case FriendRequestError.FRIEND_NOT:
			return "You are not friends with this user.";
		default:
			return "An unknown error occurred while sending the friend request.";
	}
}
// could return the friendata directly when making friendrequests
export async function sendRequest(username: string): Promise<string | null> {
	const user_id = userId();
	const res = await friendsApi.send(username, user_id);

	if (res.status === 204) {
		let user = userCache.get(user_id);
		if (!user) return null;
		const res2 = await userApi.getUserByName(username);
		if (res2.data) user.outgoing.set(username, res2.data);
		renderFriendsLists(user);
		return null; // succès
	}

	if (res.errors?.length) {
		return getFriendRequestErrorMessage(res.errors[0]);
	}

	return "An unknown error occurred while sending the friend request.";
}

export async function acceptRequest(username: string) {
	const user_id = userId();
	const res = await friendsApi.accept(username, user_id);
	let user = userCache.get(user_id);
	if (!user)
		return;
	if (res.status === 204) {
		const friendata = user.incoming.get(username);
		if (!friendata)
			return; //could be replaced by fetching the data of this specific user
		user.friends.set(username, friendata!);
	}
	user.incoming.delete(username);
	renderFriendsLists(user);
}

export async function declineRequest(username: string) {
	const user_id = userId();
	const res = await friendsApi.decline(username, user_id);
	let user = userCache.get(user_id);
	if (!user)
		return;
	user.incoming.delete(username);
	renderFriendsLists(user);
}

export async function cancelRequest(username: string) {
	const user_id = userId();
	const res = await friendsApi.cancel(username, user_id);
	let user = userCache.get(user_id);
	if (!user)
		return;
	user.outgoing.delete(username);
	renderFriendsLists(user);
}

export async function removeFriend(username: string) {
	const user_id = userId();
	const res = await friendsApi.remove(username, user_id);
	//no status check cause if error it means the client cache is wrong
	// therefore friend must be removed anyway
	let user = userCache.get(user_id);
	if (!user)
		return;
	user.friends.delete(username);
	renderFriendsLists(user);
}
