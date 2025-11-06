import { userId } from "../api/coreApi.js";
import { userApi } from "../api/UserApi.js";
import { userCache } from "../cache/UserCache.js";
import { showUsernameError } from "../ui/buttons/EditUsernameButton.js";

export enum UsernameErrors {
	TOO_SHORT = "TOO_SHORT",
	TOO_LONG = "TOO_LONG",
	INVALID_CHARACTERS = "INVALID_CHARACTERS",
	ALREADY_TAKEN = "ALREADY_TAKEN",
	DOES_NOT_EXIST = "DOES_NOT_EXIST",
}

export function handleUsernameErrors(errors: UsernameErrors[], targetEl: HTMLElement) {
	if (!errors.length) return;

	const messages = errors.map((err) => {
		switch (err) {
			case UsernameErrors.TOO_SHORT:
				return "Username is too short (minimum 3 characters).";
			case UsernameErrors.TOO_LONG:
				return "Username is too long (maximum 20 characters).";
			case UsernameErrors.INVALID_CHARACTERS:
				return "Username contains invalid characters (only letters, numbers and underscores are allowed).";
			case UsernameErrors.ALREADY_TAKEN:
				return "This username is already taken.";
			case UsernameErrors.DOES_NOT_EXIST:
				return "User does not exist.";
			default:
				return "Unknown error.";
		}
	});

	showUsernameError(messages.join(" "), targetEl);
}

export async function onUsernameChange(username: string): Promise<string[] | undefined> {
	const user_id = userId();
	const res = await userApi.changeUsername(username, user_id);
	if (res.status === 204) {
		userCache.get(user_id)!.user.name = username;
		return
	}
	else
		return res.errors;
}
