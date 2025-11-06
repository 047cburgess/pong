
import { userId } from "../../api/coreApi.js";
import { friendsApi } from "../../api/FriendsApi.js";
import { handleIncomingMessage, IncomingMessage } from "../../handlers/NotificationsHandlers.js";


export function initNotificationsBtn() {
	const notifBtn = document.getElementById("notificationsBtn") as HTMLButtonElement | null;
	if (!notifBtn) return;

	notifBtn.addEventListener("click", async () => {
		const id = userId();
		const res = await friendsApi.getNotifications(id);
		if (res.status >= 400)
			return;

		const messages: IncomingMessage[] = res.data!;

		notifBtn.disabled = true;
		try {
			for (const message of messages) {
				await handleIncomingMessage(message);
			}
		} finally {
			notifBtn.disabled = false;
		}
	});
}