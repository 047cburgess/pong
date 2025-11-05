import { FriendManager, FriendRequestStatus } from "../Managers/FriendManager";
import { MessagesQueueManager, MessagesTypes } from "../Managers/MessagesQueueManager";
import { user_id, UserManager } from "../Managers/UserManager";
import { CommandBase, CommandManager, CommandResult } from "../Managers/CommandManager";
import { FriendRequestError } from "./RequestFriendCommand";

@CommandManager.register(UserManager, FriendManager, MessagesQueueManager)
export class RemoveFriendCommand extends CommandBase {
	constructor(
		private userManager: UserManager,
		private friendManager: FriendManager,
		private messageManager: MessagesQueueManager
	) { super() }

	execute(user_id: user_id, friend_id: user_id): CommandResult {
		const user = this.userManager.getUserByID(user_id);
		const userNode = this.friendManager.getUserNode(user_id);

		if (!user || !userNode)
			return { success: false, errors: [FriendRequestError.USER_UNDEFINED] };
		if (!userNode.friends.has(friend_id))
			return { success: false, errors: [FriendRequestError.FRIEND_NOT] };

		userNode.friends.delete(friend_id);

		if (this.userManager.hasCached(friend_id)) {
			this.messageManager.push(friend_id, { type: MessagesTypes.FRIEND_UPDATE_REMOVED, data: user.name })
		}

		this.friendManager.upsertUpdate({
			sender_id: user_id,
			receiver_id: friend_id,
			status: FriendRequestStatus.REFUSED
		});
		return ({ success: true, errors: [] });

	}
}