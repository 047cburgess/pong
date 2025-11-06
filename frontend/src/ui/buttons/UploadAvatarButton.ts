import { userId } from "../../api/coreApi.js";

export function initUploadAvatarBtn() {
	const uploadBtn = document.getElementById("uploadAvatarBtn") as HTMLButtonElement | null;
	const fileInput = document.getElementById("avatarFileInput") as HTMLInputElement | null;
	const avatarImg = document.getElementById("userAvatar") as HTMLImageElement | null;

	if (!uploadBtn || !fileInput || !avatarImg) return;

	// Ouvre le sélecteur de fichier
	uploadBtn.addEventListener("click", () => fileInput.click());

	fileInput.addEventListener("change", async () => {
		const user_id = userId();
		if (!user_id) return alert("❌ User ID manquant");
		if (!fileInput.files || !fileInput.files.length) return alert("❌ Aucun fichier sélectionné");

		const file = fileInput.files[0];
		const formData = new FormData();
		formData.append("file", file!);

		// feedback UI
		uploadBtn.disabled = true;
		uploadBtn.textContent = "⏳";

		try {
			const res = await fetch(`/user/avatar`, {
				method: "POST",
				headers: {
					"x-user-id": String(user_id) // pas de Content-Type !
				},
				body: formData
			});

			if (res.ok) {
				avatarImg.src = URL.createObjectURL(file!);
			} else {
				console.error("Upload Failed", res.status);
			}
		} catch (err: any) {
			console.error("Erreur upload:", err.message);
		} finally {
			uploadBtn.disabled = false;
			uploadBtn.textContent = "📤";
			fileInput.value = "";
		}
	});
}