import { PublicInfo, user_id } from "../types.js";
import { apiCall } from "./coreApi.js";

export const userApi = {
	getUser: (id?:user_id) => apiCall<PublicInfo>('GET', `/user`, id),
	getUserByName: (username : string, id?:user_id) => apiCall<PublicInfo>('GET', `/user/${username}`, id),
	changeUsername: (username : string, id?:user_id) => apiCall('PUT', `/user/username`, id, {username : username}),
	removeUser: (id?:user_id) => apiCall('DELETE', `/user`, id),
	getUserId: (username : string, id?:user_id) => apiCall<user_id>('GET', `/user/${username}/id`, id)
}