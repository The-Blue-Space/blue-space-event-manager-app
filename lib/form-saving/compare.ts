/**
 * The comparing and merging behind useSavedForm, kept free of React and imports so it can be tested on its own.
 *
 * Words used here:
 * - values: what the form shows now.
 * - base: what we believe the server has, in the form's own shape. It moves when a save succeeds.
 * - server: the latest copy the app has loaded from the server.
 */

export type FormValues = Record<string, unknown>;
export type Keys<T> = readonly (keyof T)[];

/**
 * Deep equality where strings compare trimmed: a trailing space typed mid-word isn't a change,
 * so it's never saved on its own or wiped by the server sending back the trimmed text.
 */
export function sameValue(a: unknown, b: unknown): boolean {
	if (typeof a === "string" && typeof b === "string") return a.trim() === b.trim();
	if (a === b) return true;
	if (a === null || b === null || typeof a !== "object" || typeof b !== "object") return false;
	if (Array.isArray(a) || Array.isArray(b)) {
		if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
		return a.every((item, index) => sameValue(item, b[index]));
	}
	const left = a as Record<string, unknown>;
	const right = b as Record<string, unknown>;
	const keys = Object.keys(left);
	return keys.length === Object.keys(right).length && keys.every((key) => sameValue(left[key], right[key]));
}

/** Fields whose value differs from the base, leaving out display-only fields. */
export function changedFields<T extends FormValues>(values: T, base: T, ignore: Keys<T> = []): (keyof T)[] {
	return (Object.keys(values) as (keyof T)[]).filter(
		(key) => !ignore.includes(key) && !sameValue(values[key], base[key])
	);
}

/**
 * Takes in what changed on the server without losing what the user is typing:
 * a field the user hasn't touched follows the server; a field they've changed keeps their value.
 * Returns the same objects when nothing moved, so React can skip the update.
 */
export function rebase<T extends FormValues>(input: { values: T; base: T; server: T; ignore?: Keys<T> }) {
	const { values, base, server, ignore = [] } = input;
	let nextValues = values;
	let nextBase = base;
	for (const key of Object.keys(server) as (keyof T)[]) {
		if (ignore.includes(key) || sameValue(server[key], base[key])) continue;
		if (sameValue(values[key], base[key])) {
			if (nextValues === values) nextValues = { ...values };
			nextValues[key] = server[key];
		}
		if (nextBase === base) nextBase = { ...base };
		nextBase[key] = server[key];
	}
	return { values: nextValues, base: nextBase };
}

/**
 * Splits unsaved changes into what can be saved now and what has to wait.
 * Fields in a group only make sense together (start, end and doors; all the venue fields), so a group
 * is sent whole, and held back whole while any field in it is invalid.
 */
export function sendable<T extends FormValues>(input: {
	values: T;
	base: T;
	groups?: readonly Keys<T>[];
	invalid?: Keys<T>;
	ignore?: Keys<T>;
}) {
	const { values, base, groups = [], invalid = [], ignore = [] } = input;
	const changed = changedFields(values, base, ignore);
	const send = new Set<keyof T>();
	const held = new Set<keyof T>();
	for (const key of changed) {
		const group = groups.find((fields) => fields.includes(key)) ?? [key];
		const target = group.some((field) => invalid.includes(field)) ? held : send;
		for (const field of group) {
			if (target === send || changed.includes(field)) target.add(field);
		}
	}
	const next = { ...base };
	for (const key of ignore) next[key] = values[key];
	for (const key of send) next[key] = values[key];
	return { next, sent: [...send], held: [...held] };
}

/** The base after a save: the fields that were sent now match what the server has. */
export function afterSave<T extends FormValues>(base: T, next: T, sent: Keys<T>): T {
	if (!sent.length) return base;
	const merged = { ...base };
	for (const key of sent) merged[key] = next[key];
	return merged;
}

// ---------------------------------------------------------------------------------------------------------------
// Device backups

export const BACKUP_VERSION = 1;
export const BACKUP_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export type Backup<T extends FormValues = FormValues> = {
	v: number;
	savedAt: number;
	/** Only the changed fields, so restoring never overwrites what changed elsewhere since. */
	fields: Partial<T>;
	/** True when pictures were picked but not saved; those aren't kept, so the restore note says so. */
	files?: boolean;
};

export function makeBackup<T extends FormValues>(input: {
	values: T;
	base: T;
	ignore?: Keys<T>;
	files?: boolean;
	now: number;
}): Backup<T> | null {
	const { values, base, ignore = [], files, now } = input;
	const changed = changedFields(values, base, ignore);
	// Pictures alone aren't worth a backup: they can't be kept, so there would be nothing to restore.
	if (!changed.length) return null;
	const fields: Partial<T> = {};
	for (const key of changed) fields[key] = values[key];
	// Display-only fields ride along so the restored form looks the way it was left.
	for (const key of ignore) fields[key] = values[key];
	return { v: BACKUP_VERSION, savedAt: now, fields, ...(files ? { files: true } : {}) };
}

/** Checks the shape of something read back from storage. */
export function parseBackup(raw: unknown, now: number): Backup | null {
	if (!raw || typeof raw !== "object") return null;
	const backup = raw as Backup;
	if (backup.v !== BACKUP_VERSION || typeof backup.savedAt !== "number") return null;
	if (!backup.fields || typeof backup.fields !== "object" || Array.isArray(backup.fields)) return null;
	if (now - backup.savedAt > BACKUP_TTL_MS || backup.savedAt > now + 60_000) return null;
	return backup;
}

/** False once the server already has every field in the backup (the app closed between saving and cleaning up). */
export function backupDiffers<T extends FormValues>(backup: Backup<T>, server: T, ignore: Keys<T> = []): boolean {
	return (Object.keys(backup.fields) as (keyof T)[]).some(
		(key) => !ignore.includes(key) && key in server && !sameValue(backup.fields[key], server[key])
	);
}

/** Puts the kept fields back over the form, skipping any the form no longer has. */
export function applyBackup<T extends FormValues>(values: T, backup: Backup<T>): T {
	const restored = { ...values };
	for (const key of Object.keys(backup.fields) as (keyof T)[]) {
		if (key in values) restored[key] = backup.fields[key] as T[keyof T];
	}
	return restored;
}
