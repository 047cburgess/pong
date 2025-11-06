import { userId } from "../api/coreApi.js";
import { userApi } from "../api/UserApi.js";
import { userCache } from "../cache/UserCache.js";
import { FriendRequestReceivedData, FriendRequestRefusedOrCanceledData, FriendUpdateStatusData, FriendUpdateUsernameData} from "../types.js";
import { $, addFriend, addIncoming, removeUserFromList, renderFriendsLists } from "../ui/RenderFriends.js";
import { renderUserCard } from "../ui/RenderUser.js";

export interface Messages { type: MessagesTypes; data?: any; }
export enum MessagesTypes { 
	FRIENDREQUEST_ACCEPTED = "FRIENDREQUEST_ACCEPTED", 
	FRIENDREQUEST_REFUSED = "FRIENDREQUEST_REFUSED", 
	FRIENDREQUEST_CANCELED = "FRIENDREQUEST_CANCELED", 
	FRIENDREQUEST_RECEIVED = "FRIENDREQUEST_RECEIVED", 
	FRIEND_UPDATE_USERNAME = "FRIEND_UPDATE_USERNAME", 
	FRIEND_UPDATE_STATUS = "FRIEND_UPDATE_STATUS", 
	FRIEND_UPDATE_REMOVED = "FRIEND_UPDATE_REMOVED" 
};

export type IncomingMessage =
	| { type: MessagesTypes.FRIENDREQUEST_RECEIVED; data: FriendRequestReceivedData }
	| { type: MessagesTypes.FRIENDREQUEST_ACCEPTED; data: string }
	| { type: MessagesTypes.FRIENDREQUEST_REFUSED; data: FriendRequestRefusedOrCanceledData }
	| { type: MessagesTypes.FRIENDREQUEST_CANCELED; data: FriendRequestRefusedOrCanceledData }
	| { type: MessagesTypes.FRIEND_UPDATE_USERNAME; data: FriendUpdateUsernameData }
	| { type: MessagesTypes.FRIEND_UPDATE_STATUS; data: FriendUpdateStatusData }
	| { type: MessagesTypes.FRIEND_UPDATE_REMOVED; data: string };


export async function handleIncomingMessage(message: IncomingMessage) {
	const currentId = userId();
	const cache = userCache.get(currentId);
	if (!cache) return;

	switch (message.type) {

		case MessagesTypes.FRIENDREQUEST_RECEIVED: {
			const { from } = message.data;
			const res = await userApi.getUserByName(from);
			if (!res.errors.length && res.data){
				cache.incoming.set(from, res.data);
				addIncoming($('incomingList'), res.data);
			}
			break;
		}

		case MessagesTypes.FRIENDREQUEST_ACCEPTED: {
			const friendName = message.data;
			const res = await userApi.getUserByName(friendName);
			if (res.data) {
				cache.friends.set(friendName, res.data);
				cache.outgoing.delete(friendName);
				removeUserFromList('outgoingList', friendName);
				addFriend($('friendsList'), res.data);
			}
			break;
		}

		case MessagesTypes.FRIENDREQUEST_REFUSED:
		case MessagesTypes.FRIENDREQUEST_CANCELED: {
			const { name } = message.data;
			if (message.type === MessagesTypes.FRIENDREQUEST_REFUSED) {
				cache.outgoing.delete(name);
				removeUserFromList('outgoingList', name);
			} else {
				cache.incoming.delete(name);
				removeUserFromList('incomingList', name);
			}
			break;
		}

		case MessagesTypes.FRIEND_UPDATE_USERNAME: {
			const { prevname, newname } = message.data;
			const lists = [cache.friends, cache.incoming, cache.outgoing];
			for (const list of lists) {
				if (list.has(prevname)) {
					const friend = list.get(prevname)!;
					friend.name = newname;
					list.delete(prevname);
					list.set(newname, friend);
				}
			}
			renderFriendsLists(cache);
			break;
		}

		case MessagesTypes.FRIEND_UPDATE_STATUS: {
			const friendData = message.data;
			if (cache.friends.has(friendData.name)) {
				cache.friends.get(friendData.name)!.status = friendData.status;
				renderFriendsLists(cache);
			}
			break;
		}

		case MessagesTypes.FRIEND_UPDATE_REMOVED: {
			const friendName = message.data;
			cache.friends.delete(friendName);
			cache.incoming.delete(friendName);
			cache.outgoing.delete(friendName);
			renderFriendsLists(cache);
			break;
		}
	}

	renderUserCard(cache.user);
}
