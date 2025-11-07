
import './api/coreApi.js';
import './api/FriendsApi.js';
import './api/UserApi.js';

import './cache/requestCache.js';
import './cache/UserCache.js';

import './types.js';

import './client.js';

import './ui/RenderUser.js';
import './ui/RenderFriends.js';

import './ui/buttons/AddFriendButton.js';
import './ui/buttons/EditUsernameButton.js';
import './ui/buttons/NotificationsButton.js';
import './ui/buttons/UploadAvatarButton.js';


import './handlers/FriendHandlers.js';
import './handlers/NotificationsHandlers.js';
import './handlers/UsernameHandlers.js';


import { userId } from "./api/coreApi.js";
import { userApi } from "./api/UserApi.js";
import { init_usercache, userCache } from "./cache/UserCache.js";
import { initAddFriendBtn } from "./ui/buttons/AddFriendButton.js";
import { initEditUsernameBtn } from "./ui/buttons/EditUsernameButton.js";
import { initNotificationsBtn } from "./ui/buttons/NotificationsButton.js";
import { initUploadAvatarBtn } from "./ui/buttons/UploadAvatarButton.js";
import { renderFriendsLists } from "./ui/RenderFriends.js";
import { renderUserCard } from "./ui/RenderUser.js";


async function loadUserData(user_id: number = userId(), force : boolean = false) {
	if (!userCache.has(user_id) || force === true) {
		const cachedata = await init_usercache(user_id);
		if (!cachedata) {
			console.error(`Failed to load user cache for id=${user_id}`);
			return;
		}
		userCache.set(user_id, cachedata);
	}

	const cachedata = userCache.get(user_id)!;
	renderUserCard(cachedata.user);
	renderFriendsLists(cachedata);
}


export function initUserSelect(containerId: string, maxUserId: number = 5) {
	const select = document.getElementById(containerId) as HTMLSelectElement;
	if (!select) throw new Error(`No select element with id=${containerId}`);

	select.innerHTML = ''; // reset
	for (let i = 1; i <= maxUserId; i++) {
		const opt = document.createElement('option');
		opt.value = i.toString();
		opt.textContent = `User ${i}`;
		select.appendChild(opt);
	}

	select.addEventListener('change', async () => {
		const userId = Number(select.value);
		if (!userId) return;
		await loadUserData(userId, true);
	});

	select.value = '1';
	loadUserData(1);
}


document.addEventListener('DOMContentLoaded', () => {
	initUserSelect('userSelect');
	initAddFriendBtn();
	initEditUsernameBtn();
	initNotificationsBtn();
	initUploadAvatarBtn();
	initDeleteUserBtn();

});

export function initRefreshBtn(){
	const refreshBtn = document.getElementById("refreshBtn") as HTMLButtonElement | null;
	if (!refreshBtn) return;

	refreshBtn.addEventListener("click", async () => {
		const id = userId();
		loadUserData(id, true);
	});
}

export function initDeleteUserBtn() {
	const deleteBtn = document.getElementById("deleteUserBtn") as HTMLButtonElement | null;
	if (!deleteBtn) return;

	deleteBtn.addEventListener("click", async () => {
		const id = userId();
		if (!id) return alert("❌ User ID manquant");

		if (!confirm("Voulez-vous vraiment supprimer votre compte ? Cette action est irréversible.")) return;

		try {
			const res = await userApi.removeUser(id);
			if (res.status === 204) {
				// suppression locale du cache
				userCache.delete(id);
				alert("✅ Compte supprimé avec succès");
				location.reload(); // ou redirection vers page login
			} else {
				console.error("Erreur suppression :", res.errors);
				alert("❌ Échec de la suppression du compte");
			}
		} catch (err: any) {
			console.error("Erreur API deleteUser :", err.message);
			alert("❌ Erreur lors de la suppression du compte");
		}
	});
}