import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { ManagerRegistry } from "./ManagerRegistry";
import { ManagerBase } from "./CommandManager";

const AVAILABLE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];

@ManagerRegistry.register()
export class AvatarManager extends ManagerBase {
	private AVATAR_DIR = path.join(process.cwd(), "uploads/avatars");
	private DEFAULT_AVATAR = "default.webp";

	constructor() {
		super();
		this.ensureDir();
	}

	private async ensureDir() {
		await fs.mkdir(this.AVATAR_DIR, { recursive: true });
	}

	async findAvatarFile(username: string): Promise<string> {
		const filename = `${username}.webp`;
		const fullPath = path.join(this.AVATAR_DIR, filename);

		try {
			await fs.access(fullPath);
			return filename;
		} catch {
			return this.DEFAULT_AVATAR;
		}
	}

	async saveAvatar(username: string, fileBuffer: Buffer, mimetype?: string): Promise<string> {
		const filename = `${username}.webp`;
		const fullPath = path.join(this.AVATAR_DIR, filename);

		try {
			const webpBuffer = await sharp(fileBuffer)
				.webp({ quality: 90 })
				.toBuffer();

			await fs.writeFile(fullPath, webpBuffer);
			return filename;
		} catch (err) {
			console.error("[AvatarManager] Failed to save avatar:", err);
			throw new Error("SAVE_FAILED");
		}
	}

	async renameAvatar(oldname: string, newname: string): Promise<void> {
		const oldPath = path.join(this.AVATAR_DIR, `${oldname}.webp`);
		const newPath = path.join(this.AVATAR_DIR, `${newname}.webp`);

		try {
			await fs.access(oldPath);
			await fs.rename(oldPath, newPath);
		} catch {}
	}

	async removeAvatar(username: string): Promise<void> {
		const filePath = path.join(this.AVATAR_DIR, `${username}.webp`);
		try {
			await fs.unlink(filePath);
		} catch {}
	}

	saveAll() {
		// Not implemented
	}
}
