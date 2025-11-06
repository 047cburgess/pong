import { FriendManager } from "../Managers/FriendManager";
import { MessagesQueueManager } from "../Managers/MessagesQueueManager";
import { UserManager, user_id } from "../Managers/UserManager";
import { CancelFriendRequestCommand } from "./CancelFriendRequestCommand";
import { CommandBase, CommandManager, CommandResult } from "../Managers/CommandManager";
import { RefuseFriendRequestCommand } from "./RefuseFriendRequestCommand";
import { RemoveFriendCommand } from "./RemoveFriendCommand";

@CommandManager.register(UserManager, FriendManager, MessagesQueueManager)
export class RemoveUserCommand extends CommandBase {
	constructor(
		private userManager: UserManager,
		private friendManager: FriendManager,
		private messageManager: MessagesQueueManager
	) { super() }


	execute(user_id: user_id): CommandResult {
		const userNode = this.friendManager.getUserNode(user_id);
		if (userNode) {
			for (const id of userNode!.friends)
				CommandManager.get(RemoveFriendCommand).execute(user_id, id);
			for (const id of userNode.outgoingRequests)
				CommandManager.get(CancelFriendRequestCommand).execute(user_id, id);
			for (const id of userNode.incomingRequests)
				CommandManager.get(RefuseFriendRequestCommand).execute(user_id, id);
		}
		//this.avatarManager.removeAvatar(username); for when i implement the avatar manager
		this.userManager.removeUser(user_id);
		this.friendManager.removeUser(user_id);
		this.messageManager.clear(user_id);

		return { success: true, errors: [] };
	}
}