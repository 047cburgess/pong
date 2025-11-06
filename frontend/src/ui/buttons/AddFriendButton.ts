import { sendRequest } from "../../handlers/FriendHandlers.js";

export function initAddFriendBtn() {
	const addBtn = document.getElementById('addFriendBtn');
	const section = document.getElementById('friendsSection');

	if (!section || !addBtn) return;

	let inputWrapper: HTMLDivElement | null = null;
	addBtn.addEventListener('click', () => {
		if (inputWrapper) return;

		inputWrapper = document.createElement('div');
		inputWrapper.className = 'mt-2 flex items-center gap-2';

		inputWrapper.innerHTML = `
			<input id="newFriendInput" type="text" placeholder="Enter username"
				class="border rounded px-2 py-1 flex-1">
			<button id="confirmAddFriend" class="bg-blue-500 text-white px-2 py-1 rounded">Send</button>
			<div id="friendErrorMsg" class="text-red-500 text-sm ml-2"></div>
		`;

		section.appendChild(inputWrapper);

		const input = inputWrapper.querySelector('#newFriendInput') as HTMLInputElement;
		const confirmBtn = inputWrapper.querySelector('#confirmAddFriend') as HTMLButtonElement;
		const errorMsg = inputWrapper.querySelector('#friendErrorMsg') as HTMLDivElement;

		const cleanup = () => {
			if (inputWrapper) {
				inputWrapper.remove();
				inputWrapper = null;
			}
		};

		confirmBtn.addEventListener('click', async () => {
			const username = input.value.trim();
			if (!username) return;

			const msg = await sendRequest(username);
			if (msg) {
				errorMsg.textContent = msg;
			} else {
				cleanup();
			}
		});
	});
}