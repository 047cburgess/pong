export type user_id = number

export enum MessagesTypes {
	FRIENDREQUEST_ACCEPTED = "FRIENDREQUEST_ACCEPTED",
	FRIENDREQUEST_REFUSED = "FRIENDREQUEST_REFUSED",
	FRIENDREQUEST_CANCELED = "FRIENDREQUEST_CANCELED",
	FRIENDREQUEST_RECEIVED = "FRIENDREQUEST_RECEIVED",
	FRIEND_UPDATE_USERNAME = "FRIEND_UPDATE_USERNAME",
	FRIEND_UPDATE_STATUS = "FRIEND_UPDATE_STATUS",
	FRIEND_UPDATE_REMOVED = "FRIEND_UPDATE_REMOVED"
}

export enum FriendRequestError {
	REQUEST_SELF = "SelfRequest",
	REQUEST_ALREADY = "AlreadyRequested",
	REQUEST_UNDEFINED = "UndefinedRequest",
	USER_UNDEFINED = "UndefinedUser",
	FRIEND_ALREADY = "AlreadyFriend",
	FRIEND_NOT = "NotFriend"
}

export enum UserStatus {
	OFFLINE = 0,
	ONLINE = 1
}

export interface PublicUserData {
	name: string;
	status: UserStatus;
	last_seen: number;
}

export interface Messages {
	type: MessagesTypes;
	data?: any;
}

export interface FriendRequestReceivedData {
	from: string;
}

export interface FriendRequestRefusedOrCanceledData {
	name: string;
}

export interface FriendUpdateUsernameData {
	prevname: string;
	newname: string;
}

export interface FriendUpdateStatusData {
	id: number;
	name: string;
	status: number;
}