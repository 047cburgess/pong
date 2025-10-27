import { user_id } from "../UserData/User";
import { UserManager } from "../UserData/UserManager";
import { CommandBase, CommandManager, CommandResult } from "./CommandManager"
import { FriendRequestError } from "./RequestFriendCommand";

@CommandManager.register(UserManager)
export class GetUserIdCommand extends CommandBase {

	constructor(private userManager: UserManager) { super() }

	execute(username: string): CommandResult<user_id> {
		console.log('[Command] GetUseriD  START'); //debug
		const user = this.userManager.getOrLoadUserByName(username);
		if (!user)
			return { success: false, errors: [FriendRequestError.USER_UNDEFINED] };
		this.userManager.printUserManager();//debug
		console.log('[Command] GetuserID END'); //debug
		return { success: true, errors: [], data: user.user_id };
	}
}