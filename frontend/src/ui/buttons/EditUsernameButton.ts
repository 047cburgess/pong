import { userId } from "../../api/coreApi.js";
import { userCache } from "../../cache/UserCache.js";
import { handleUsernameErrors, onUsernameChange, UsernameErrors } from "../../handlers/UsernameHandlers.js";
import { renderUserCard } from "../RenderUser.js";


export function showUsernameError(message: string, targetEl: HTMLElement) {
	const existing = targetEl.parentElement?.querySelector(".username-error");
	if (existing) existing.remove();

	const errorEl = document.createElement("div");
	errorEl.className = "username-error text-red-500 text-sm mt-1 absolute bottom-0 left-0";
	errorEl.textContent = message;

	targetEl.parentElement?.appendChild(errorEl);

	setTimeout(() => {
		errorEl.remove();
	}, 4000);
}

export function initEditUsernameBtn() {
	const editBtn = document.getElementById('editUsernameBtn') as HTMLButtonElement | null;
	const usernameField = document.getElementById('usernameField') as HTMLInputElement | null;

	if (!editBtn || !usernameField) return;

	editBtn.addEventListener('click', () => {


		if (usernameField.readOnly === false) return;


		const oldUsername = usernameField.value;

		usernameField.readOnly = false;
		usernameField.focus();
		usernameField.classList.add('border', 'border-blue-400', 'rounded', 'px-1');

		const confirmBtn = document.createElement('button');
		const cancelBtn = document.createElement('button');
		confirmBtn.textContent = '✅';
		cancelBtn.textContent = '❌';
		confirmBtn.className = 'text-green-600 ml-2';
		cancelBtn.className = 'text-red-500 ml-1';

		editBtn.replaceWith(confirmBtn, cancelBtn);

		confirmBtn.addEventListener('click', async () => {
			const newUsername = usernameField.value.trim();
			if (!newUsername || newUsername === oldUsername) {
				cancelEdit();
				return;
			}

			confirmBtn.disabled = true;
			confirmBtn.textContent = "⏳";

			const errors = await onUsernameChange(newUsername);

			confirmBtn.disabled = false;
			confirmBtn.textContent = "✅";

			if (!errors) {
				exitEditMode();
			} else {
				handleUsernameErrors(errors as UsernameErrors[], usernameField);
				cancelEdit();
			}
		});

		cancelBtn.addEventListener('click', () => {
			usernameField.value = oldUsername;
			cancelEdit();
		});

		usernameField.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				confirmBtn.click();
			} else if (e.key === 'Escape') {
				e.preventDefault();
				cancelBtn.click();
			}
		});

		function exitEditMode() {
			usernameField!.readOnly = true;
			usernameField!.classList.remove('border', 'border-blue-400', 'rounded', 'px-1');
			restoreButton();
		}

		function cancelEdit() {
			usernameField!.readOnly = true;
			usernameField!.classList.remove('border', 'border-blue-400', 'rounded', 'px-1');
			restoreButton();
			const id = userId();
			const cachedata = userCache.get(id);
			if (cachedata) renderUserCard(cachedata.user); // refresh affichage
		}

		function restoreButton() {
			cancelBtn.remove();
			confirmBtn.remove();
			editBtn!.textContent = '✏️';
			usernameField!.parentElement?.appendChild(editBtn!);
		}
	});
}