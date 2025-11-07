import { apiCall } from "./coreApi.js";
import { PublicInfo, user_id } from "../types.js";

export const friendsApi = {
	getFriends: (id?: user_id) => apiCall<PublicInfo[]>("GET", "/user/friends", id),
	getIncoming: (id?: user_id) => apiCall<PublicInfo[]>("GET", "/user/friends/requests", id),
	getOutgoing: (id?: user_id) => apiCall<PublicInfo[]>("GET", "/user/friends/requests/outgoing", id),
	accept: (u: string, id?: user_id) => apiCall("PUT", `/user/friends/requests/${u}`, id),
	decline: (u: string, id?: user_id) => apiCall("DELETE", `/user/friends/requests/${u}`, id),
	cancel: (u: string, id?: user_id) => apiCall("DELETE", `/user/friends/requests/outgoing/${u}`, id),
	remove: (u: string, id?: user_id) => apiCall("DELETE", `/user/friends/${u}`, id),
	send: (u: string, id?: user_id) => apiCall("POST", `/user/friends/requests/outgoing/${u}`, id),
};