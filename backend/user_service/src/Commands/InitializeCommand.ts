import { CommandBase, CommandManager, CommandResult } from "../Managers/CommandManager";
import { user_id, UserManager } from "../Managers/UserManager";
import { UsernameErrors } from "./EditUsernameCommand";

@CommandManager.register(UserManager)
export class initializeCommand extends CommandBase {
	constructor(
		private userManager: UserManager
	) { super() }

	execute(user_id: user_id, username : string, avatarUrl?:string): CommandResult {
		const user = this.userManager.getPublicByID(user_id);
		if (user || !username || !user_id)
			return ({ success: false, errors: ["USER_ALREADY EXIST"] });
		const existing = this.userManager.usernameExists(username);
		if (existing) {
			return { success: false, errors: [UsernameErrors.ALREADY_TAKEN] };
		}
		this.userManager.createDefault(user_id, username, avatarUrl);
		return ({ success: true, errors: [] });
	}
}