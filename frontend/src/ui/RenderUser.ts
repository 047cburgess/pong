import { PublicUserData } from "../types.js";



export function renderUserCard(user: PublicUserData) {
  const avatar = document.getElementById('userAvatar') as HTMLImageElement | null;
  const username = document.getElementById('usernameField') as HTMLInputElement | null;
  const status = document.getElementById('userStatus') as HTMLDivElement | null;

  if (!avatar || !username || !status) return; // sécurité

  avatar.src = `/user/avatars/${user.name}.webp`;
  username.value = user.name;
  status.textContent = `Status: ${user.status}`;
}