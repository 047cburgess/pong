import { FriendManager } from "../Managers/FriendManager";
import { MessagesQueueManager, MessagesTypes } from "../Managers/MessagesQueueManager";
import { user_id, UserManager, UserStatus } from "../Managers/UserManager";
import { CommandBase, CommandManager } from "../Managers/CommandManager";

@CommandManager.register(FriendManager, UserManager, MessagesQueueManager)
export class OnUserSeenCommand extends CommandBase {
	constructor(
		private friendManager: FriendManager,
		private userManager: UserManager,
		private notifManager: MessagesQueueManager) { super(); }

	execute(userId: user_id) {
		
		const previousStatus = this.userManager.getUserByID(userId)?.status || UserStatus.OFFLINE;
		const user = this.userManager.onUserSeen(userId);
		this.friendManager.loadUser(userId);

		if (previousStatus !== user.status) {
			const friends = this.friendManager.getFriendList(userId);
			for (const friendId of friends) {
				if (this.userManager.hasCached(friendId)) {
					this.notifManager.push(friendId, { type: MessagesTypes.FRIEND_UPDATE_STATUS, data: this.userManager.toPublic(user) });
				}
			}
		}
	}
}


/*
	Could add a OnFirstTimeSeeing to manage new usercreation

	onUserSeen, First try to load the users data into cache
	do nothing if already present
	then 


*/