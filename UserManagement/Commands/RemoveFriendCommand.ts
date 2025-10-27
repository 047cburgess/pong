import { FriendManager, FriendRequestStatus } from "../Friend/FriendManager";
import { MessagesQueueManager, MessagesTypes } from "../MesssageQueue/MessagesQueueManager";
import { user_id } from "../UserData/User";
import { UserManager } from "../UserData/UserManager";
import { CommandBase, CommandManager, CommandResult } from "./CommandManager";
import { FriendRequestError } from "./RequestFriendCommand";

@CommandManager.register(UserManager, FriendManager, MessagesQueueManager)
export class RemoveFriendCommand extends CommandBase {
	constructor(
		private userManager: UserManager,
		private friendManager: FriendManager,
		private messageManager: MessagesQueueManager
	) { super() }

	execute(user_id: user_id, friend_id: user_id): CommandResult {
		console.log('[COMMAND] RemoveFriendCommand START'); //debug
		const user = this.userManager.getUserByID(user_id);
		const userNode = this.friendManager.getUserNode(user_id);
		const friendNode = this.friendManager.getUserNode(friend_id);

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

		this.friendManager.printFullState();//debug
		this.userManager.printUserManager();//debug
		console.log('[COMMAND] RemoveFriendCommand END'); //debug
		return ({ success: true, errors: [] });

	}
}