import { PublicInfo } from "../types.js";



export function renderUserCard(user: PublicInfo) {
  const avatar = document.getElementById('userAvatar') as HTMLImageElement | null;
  const username = document.getElementById('usernameField') as HTMLInputElement | null;
  const status = document.getElementById('userStatus') as HTMLDivElement | null;

  if (!avatar || !username || !status) return; // sécurité

  avatar.src = `/user/avatars/${user.username}.webp`;
  username.value = user.username;
  status.textContent = `Status: ${user.lastSeen}`; // need to cahnge that
}