import { UserCacheData } from "../cache/UserCache.js";
import { acceptRequest, cancelRequest, declineRequest, removeFriend } from "../handlers/FriendHandlers.js";
import { PublicUserData } from "../types.js";

type ButtonAction = 'accept' | 'decline' | 'cancel' | 'remove';

export function $(id : string) : HTMLElement | null { return document.getElementById(id); }

function createButton(label: string, action: ButtonAction, className: string, userName: string) {
	const btn = document.createElement('button');
	btn.textContent = label;
	btn.className = className; // ou verte selon label/action
	btn.dataset.action = action;
	btn.dataset.user = userName;
	return btn;
}


export function removeUserFromList(containerId: string, userName: string) {
	const container = $(containerId);
	if (!container) return;

	const userEl = Array.from(container.children).find((child) =>
		child.textContent?.includes(userName)
	);
	if (userEl) container.removeChild(userEl);
}

function renderIncomingList(incomingList: PublicUserData[]) {
	const container = $('incomingList');
	if (!container) return;
	container.innerHTML = '';

	for (const user of incomingList) {
		addIncoming(container, user);
	}
}

export function addIncoming(container: HTMLElement | null, user: PublicUserData) {
	if (!container) return;
	const el = document.createElement('div');
	el.className = 'flex justify-between border p-2 rounded';

	el.innerHTML = `
			<div class="flex items-center gap-3">
				<img src="/user/avatars/${user.name}.webp" class="w-8 h-8 rounded-full"/>
				<div class="font-medium">${user.name}</div>
			</div>
			<div class="space-x-2"></div>
		`;

	const buttonContainer = el.querySelector('div.space-x-2')!;
	buttonContainer.append(
		createButton('✔️', 'accept', 'text-green-500', user.name),
		createButton('❌', 'decline', 'text-red-500', user.name)
	);
	container.appendChild(el);
}


function renderOutgoingList(outgoingList: PublicUserData[]) {
	const container = $('outgoingList');
	if (!container) return;
	container.innerHTML = '';

	for (const user of outgoingList) {
		addOutgoing(container, user);
	}
}

export function addOutgoing(container: HTMLElement | null, user: PublicUserData) {
	if (!container) return;
	const el = document.createElement('div');
	el.className = 'flex justify-between border p-2 rounded';

	el.innerHTML = `
			<div class="flex items-center gap-3">
				<img src="/user/avatars/${user.name}.webp" class="w-8 h-8 rounded-full"/>
				<div class="font-medium">${user.name}</div>
			</div>
			<div class="space-x-2"></div>
		`;

	const buttonContainer = el.querySelector('div.space-x-2')!;
	buttonContainer.append(createButton('❌', 'cancel', 'text-red-500', user.name));

	container.appendChild(el);
}

// Friend List
function renderFriendList(friendList: PublicUserData[]) {
	const container = $('friendsList');
	if (!container) return;
	container.innerHTML = '';

	for (const user of friendList) {
		addFriend(container, user);
	}
}

export function addFriend(container: HTMLElement | null, user: PublicUserData) {
	if (!container) return;
	const el = document.createElement('div');
	el.className = 'flex justify-between border p-2 rounded';

	const isOnline = user.status === 1;
	const color = isOnline ? 'bg-green-500' : 'bg-gray-400';
	const lastSeenText = !isOnline
		? `<div class="text-xs text-gray-500">Last seen: ${new Date(user.last_seen).toLocaleString()}</div>`
		: '';

	el.innerHTML = `
			<div class="flex items-center gap-3">
				<img src="/user/avatars/${user.name}.webp" class="w-8 h-8 rounded-full"/>
				<div>
					<div class="flex items-center gap-2">
						<div class="font-medium">${user.name}</div>
						<div class="w-3 h-3 rounded-full ${color}"></div>
					</div>
					${lastSeenText}
				</div>
			</div>
			<div class="space-x-2"></div>
		`;

	const buttonContainer = el.querySelector('div.space-x-2')!;
	buttonContainer.append(createButton('❌', 'remove', 'text-red-500', user.name));

	container.appendChild(el);
}


export function renderFriendsLists(user: UserCacheData) {
	renderFriendList(Array.from(user.friends.values()))
	renderIncomingList(Array.from(user.incoming.values()));
	renderOutgoingList(Array.from(user.outgoing.values()));
}

document.addEventListener('click', (e) => {
	const target = e.target as HTMLElement;
	if (target.tagName !== 'BUTTON') return;

	const action = target.dataset.action as ButtonAction | undefined;
	const name = target.dataset.user;
	if (!action || !name) return;

	switch (action) {
		case 'accept':
			acceptRequest(name);
			removeUserFromList('incomingList', name); // supprime de l'affichage
			break;
		case 'decline':
			declineRequest(name);
			removeUserFromList('incomingList', name);
			break;
		case 'cancel':
			cancelRequest(name);
			removeUserFromList('outgoingList', name);
			break;
		case 'remove':
			removeFriend(name);
			removeUserFromList('friendsList', name);
			break;
	}
});