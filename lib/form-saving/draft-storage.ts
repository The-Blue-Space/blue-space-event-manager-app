import { Backup, BACKUP_TTL_MS, parseBackup } from "./compare";

/**
 * Unsaved form changes kept on this device, in localStorage. It's synchronous, so a write made as the
 * tab closes still lands. Every call is guarded: private windows and full storage just mean no backup.
 */

const PREFIX = "bs:draft:v1:";

/** One key per person and form, so two people sharing a browser never see each other's changes. */
export const draftKey = (userId: string, scope: string) => `${PREFIX}${userId}:${scope}`;

export function readDraft(key: string): Backup | null {
	try {
		const raw = window.localStorage.getItem(key);
		if (!raw) return null;
		const backup = parseBackup(JSON.parse(raw), Date.now());
		if (!backup) window.localStorage.removeItem(key);
		return backup;
	} catch {
		return null;
	}
}

export function writeDraft(key: string, backup: Backup) {
	try {
		window.localStorage.setItem(key, JSON.stringify(backup));
	} catch {
		// Storage is full or blocked; the form still works, it just isn't backed up.
	}
}

export function removeDraft(key: string) {
	try {
		window.localStorage.removeItem(key);
	} catch {
		// Nothing to clean up if storage can't be reached.
	}
}

function draftKeys(): string[] {
	try {
		return Object.keys(window.localStorage).filter((key) => key.startsWith(PREFIX));
	} catch {
		return [];
	}
}

/** Signing out removes that person's backups: a profile backup can hold their email and phone. */
export function clearDrafts(userId: string) {
	for (const key of draftKeys()) {
		if (key.startsWith(`${PREFIX}${userId}:`)) removeDraft(key);
	}
}

let purged = false;

/** Drops backups past their 14 days, once per page load. */
export function purgeOldDrafts() {
	if (purged) return;
	purged = true;
	const now = Date.now();
	for (const key of draftKeys()) {
		try {
			const raw = window.localStorage.getItem(key);
			const savedAt = raw ? (JSON.parse(raw) as { savedAt?: unknown }).savedAt : undefined;
			if (typeof savedAt !== "number" || now - savedAt > BACKUP_TTL_MS) removeDraft(key);
		} catch {
			removeDraft(key);
		}
	}
}
