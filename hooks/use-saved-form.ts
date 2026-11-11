"use client";
import * as React from "react";
import {
	afterSave,
	applyBackup,
	Backup,
	backupDiffers,
	changedFields,
	FormValues,
	Keys,
	makeBackup,
	rebase,
	sendable,
} from "@/lib/form-saving/compare";
import { draftKey, purgeOldDrafts, readDraft, removeDraft, writeDraft } from "@/lib/form-saving/draft-storage";
import { describeSaveError, retryDelay } from "@/lib/form-saving/save-errors";
import useAppSelector from "@/store/hooks";

/**
 * How a form saves. The rule for picking one lives in each screen, and it's always the same:
 * if guests can't see it yet, it saves itself ("auto"); if they can, you press Save ("manual").
 * Either way, unsaved changes are kept on this device until they're saved, and offered back after a crash,
 * a closed tab or a sign-out.
 */
export type SaveMode = "auto" | "manual";

export type SaveState = "idle" | "saving" | "saved" | "retrying" | "offline" | "failed";

export type SaveStatus = {
	state: SaveState;
	/** When the last save finished, in ms. */
	savedAt: number | null;
	/** Why the last save didn't go through. */
	message?: string;
	/** How many changed fields are waiting on a fix (0 until the form has paused). */
	held: number;
};

type Options<T extends FormValues> = {
	/** What the server has, in the form's shape; null while it loads. Keep it memoized. */
	server: T | null;
	/** A new key (another event, a reopened dialog) starts the form over from `server`. */
	resetKey: string;
	mode: SaveMode;
	/** Names this form's backup on the device, like `event-details:<id>`; null keeps no backup. */
	backup: string | null;
	/** Display-only fields: never compared, never overwritten by the server. */
	ignore?: Keys<T>;
	/** Fields that are only saved together, like start, end and doors. */
	groups?: readonly Keys<T>[];
	/** Fields that can't be saved as they are. Read when saving, so it can use other state. */
	invalid?: (values: T) => (keyof T)[];
	/**
	 * Sends `next` to the server; only the fields that differ from `base` need to go.
	 * Leave it out when the screen saves on its own (the ticket panels) and calls `markSaved` after.
	 */
	save?: (next: T, base: T) => Promise<void>;
	/** Picked pictures that aren't saved yet. They count as unsaved but can't be kept on the device. */
	unsavedFiles?: boolean;
	/** Runs once after the saves in a burst have finished, to refresh other screens. */
	onSettled?: () => void;
	/** Pause before saving itself, in ms. */
	delay?: number;
};

type State<T> = { key: string; values: T | null; base: T | null };

const NONE: readonly never[] = [];

export default function useSavedForm<T extends FormValues>(options: Options<T>) {
	const { server, resetKey, mode, delay = 1000 } = options;
	const ignore = options.ignore ?? (NONE as Keys<T>);
	const { account } = useAppSelector("account");
	const storageKey = options.backup && account?.id ? draftKey(account.id, options.backup) : null;

	// Saves outlive renders, so async work reads the latest options and state through refs.
	const opts = React.useRef(options);
	opts.current = options;
	const keyRef = React.useRef(storageKey);
	keyRef.current = storageKey;

	const [form, setForm] = React.useState<State<T>>(() => ({ key: resetKey, values: server, base: server }));
	const latest = React.useRef(form);
	const mounted = React.useRef(true);
	/** The person has edited since the form last started over; resets and server updates don't count. */
	const touched = React.useRef(false);

	/** Every state change goes through here, so queued saves never read a stale base. */
	const commit = React.useCallback((update: (prev: State<T>) => State<T>) => {
		const next = update(latest.current);
		if (next === latest.current) return;
		latest.current = next;
		if (mounted.current) setForm(next);
	}, []);

	const [status, setStatus] = React.useState<SaveStatus>({ state: "idle", savedAt: null, held: 0 });
	const setStatusSafe = React.useCallback((update: React.SetStateAction<SaveStatus>) => {
		if (mounted.current) setStatus(update);
	}, []);
	const [heldVisible, setHeldVisible] = React.useState(false);
	const [offer, setOffer] = React.useState<Backup<T> | null>(null);

	const timer = React.useRef<number | undefined>(undefined);
	const retryTimer = React.useRef<number | undefined>(undefined);
	const attempts = React.useRef(0);
	const chain = React.useRef<Promise<unknown>>(Promise.resolve());
	const savedSinceSettle = React.useRef(false);

	const isDirty = React.useCallback((state: State<T> = latest.current) => {
		if (!state.values || !state.base) return false;
		return changedFields(state.values, state.base, opts.current.ignore ?? NONE).length > 0;
	}, []);

	// ---- the device backup -------------------------------------------------------------------------------------

	const writeBackup = React.useCallback(() => {
		const key = keyRef.current;
		const { values, base } = latest.current;
		if (!key || !touched.current || !values || !base) return;
		const backup = makeBackup({
			values,
			base,
			ignore: opts.current.ignore,
			files: opts.current.unsavedFiles,
			now: Date.now(),
		});
		if (backup) writeDraft(key, backup);
		else removeDraft(key);
	}, []);

	React.useEffect(() => {
		const id = window.setTimeout(writeBackup, 400);
		return () => window.clearTimeout(id);
	}, [form.values, form.base, writeBackup]);

	// ---- following the server -----------------------------------------------------------------------------------

	React.useEffect(() => {
		if (!server) {
			// Closed (a panel) or still loading: keep what's on screen, but remember the form has moved on,
			// so it starts over when it's next given values. Keep the last keystrokes first.
			if (latest.current.key !== resetKey) {
				writeBackup();
				commit((prev) => ({ ...prev, key: resetKey }));
			}
			return;
		}
		if (latest.current.key !== resetKey || !latest.current.base) {
			// Keep the last few keystrokes before starting over (closing a dialog, say).
			writeBackup();
			touched.current = false;
			window.clearTimeout(timer.current);
			window.clearTimeout(retryTimer.current);
			attempts.current = 0;
			setHeldVisible(false);
			setStatusSafe({ state: "idle", savedAt: null, held: 0 });
			commit(() => ({ key: resetKey, values: server, base: server }));
			return;
		}
		commit((prev) => {
			if (!prev.values || !prev.base) return prev;
			const merged = rebase({ values: prev.values, base: prev.base, server, ignore: opts.current.ignore });
			return merged.values === prev.values && merged.base === prev.base ? prev : { ...prev, ...merged };
		});
	}, [server, resetKey, commit, setStatusSafe, writeBackup]);

	// When the form starts over, offer back anything kept from last time, unless the server already has it.
	// This runs after the effect above, so it compares against the base the form just started from.
	const hasServer = server !== null;
	React.useEffect(() => {
		purgeOldDrafts();
		const startedWith = latest.current.base;
		if (!storageKey || !startedWith) return setOffer(null);
		const kept = readDraft(storageKey) as Backup<T> | null;
		if (kept && !backupDiffers(kept, startedWith, opts.current.ignore)) {
			removeDraft(storageKey);
			return setOffer(null);
		}
		setOffer(kept);
	}, [storageKey, resetKey, hasServer]);

	const restore = React.useCallback(() => {
		if (!offer) return;
		touched.current = true;
		commit((prev) => (prev.values ? { ...prev, values: applyBackup(prev.values, offer) } : prev));
		setOffer(null);
	}, [offer, commit]);

	const discard = React.useCallback(() => {
		// Once the person has typed again, the backup holds those new changes, so leave it.
		if (keyRef.current && !touched.current) removeDraft(keyRef.current);
		setOffer(null);
	}, []);

	// ---- saving -------------------------------------------------------------------------------------------------

	/** Saves whatever can be saved now. True when nothing is left unsaved. */
	const saveNow = React.useCallback(async (): Promise<boolean> => {
		window.clearTimeout(retryTimer.current);
		const o = opts.current;
		const state = latest.current;
		if (!state.values || !state.base || state.key !== o.resetKey) return true;

		const { next, sent, held } = sendable({
			values: state.values,
			base: state.base,
			groups: o.groups,
			invalid: o.invalid?.(state.values) ?? [],
			ignore: o.ignore,
		});
		if (!sent.length) return held.length === 0;

		const key = keyRef.current;
		setStatusSafe((prev) => ({ ...prev, state: "saving", message: undefined }));
		try {
			await o.save?.(next, state.base);
		} catch (error) {
			// The device backup still has the change, whether or not this screen is still open.
			const failure = describeSaveError(error);
			const offline = typeof navigator !== "undefined" && !navigator.onLine;
			if (failure.kind === "retry" && !offline && mounted.current) {
				retryTimer.current = window.setTimeout(() => void enqueue(), retryDelay(attempts.current++));
			}
			setStatusSafe((prev) => ({
				...prev,
				state: offline ? "offline" : failure.kind === "retry" ? "retrying" : "failed",
				message: failure.message,
			}));
			return false;
		}

		attempts.current = 0;
		savedSinceSettle.current = true;
		commit((prev) =>
			prev.key === state.key && prev.base ? { ...prev, base: afterSave(prev.base, next, sent) } : prev
		);
		if (key) {
			const { values, base } = latest.current;
			const rest = values && base ? makeBackup({ values, base, ignore: o.ignore, now: Date.now() }) : null;
			if (rest) writeDraft(key, rest);
			else removeDraft(key);
		}
		setStatusSafe((prev) => ({ ...prev, state: "saved", savedAt: Date.now(), message: undefined }));
		return held.length === 0 && !isDirty();
	}, [commit, isDirty, setStatusSafe]); // eslint-disable-line react-hooks/exhaustive-deps -- enqueue is stable

	/** One save at a time, in order. Refreshes other screens once the queue is empty. */
	const enqueue = React.useCallback((): Promise<boolean> => {
		const run = chain.current.then(saveNow, saveNow);
		chain.current = run;
		run.then(() => {
			if (chain.current === run && savedSinceSettle.current) {
				savedSinceSettle.current = false;
				opts.current.onSettled?.();
			}
		});
		return run;
	}, [saveNow]);

	/** Queues other saving work, like a cover upload, behind the field saves so they can't race. */
	const run = React.useCallback(
		(task: () => Promise<void>) => {
			const job = chain.current.then(async () => {
				setStatusSafe((prev) => ({ ...prev, state: "saving", message: undefined }));
				try {
					await task();
					savedSinceSettle.current = true;
					setStatusSafe((prev) => ({ ...prev, state: "saved", savedAt: Date.now(), message: undefined }));
				} catch (error) {
					setStatusSafe((prev) => ({ ...prev, state: "failed", message: describeSaveError(error).message }));
					throw error;
				}
			});
			chain.current = job.catch(() => undefined);
			return job;
		},
		[setStatusSafe]
	);

	/** Manual mode: saves every change, or returns false when something needs fixing first. Throws if the save fails. */
	const submit = React.useCallback(async (): Promise<boolean> => {
		const o = opts.current;
		const state = latest.current;
		if (!state.values || !state.base) return false;
		if (o.invalid?.(state.values).length) {
			setHeldVisible(true);
			return false;
		}
		const job = chain.current.then(async () => {
			const current = latest.current;
			if (!current.values || !current.base) return false;
			if (!isDirty(current) && !opts.current.unsavedFiles) return true;
			const values = current.values;
			const key = keyRef.current;
			setStatusSafe((prev) => ({ ...prev, state: "saving", message: undefined }));
			try {
				await opts.current.save?.(values, current.base);
			} catch (error) {
				setStatusSafe((prev) => ({ ...prev, state: "failed", message: describeSaveError(error).message }));
				throw error;
			}
			commit((prev) => (prev.key === current.key ? { ...prev, base: values } : prev));
			if (key) removeDraft(key);
			setHeldVisible(false);
			setStatusSafe((prev) => ({ ...prev, state: "saved", savedAt: Date.now(), message: undefined }));
			opts.current.onSettled?.();
			return true;
		});
		chain.current = job.catch(() => undefined);
		return job;
	}, [commit, isDirty, setStatusSafe]);

	/** For screens that save on their own: what's on screen is saved now, so the backup can go. */
	const markSaved = React.useCallback(() => {
		commit((prev) => (prev.values ? { ...prev, base: prev.values } : prev));
		if (keyRef.current) removeDraft(keyRef.current);
		setHeldVisible(false);
	}, [commit]);

	/** Saves anything pending right away (before publishing or leaving). True when nothing is left unsaved. */
	const flush = React.useCallback(async (): Promise<boolean> => {
		window.clearTimeout(timer.current);
		if (opts.current.mode === "manual") return !isDirty() && !opts.current.unsavedFiles;
		setHeldVisible(true);
		const saved = await enqueue();
		return saved && !isDirty();
	}, [enqueue, isDirty]);

	// Saves itself a moment after the last change.
	React.useEffect(() => {
		if (mode !== "auto" || !touched.current || !isDirty()) return;
		timer.current = window.setTimeout(() => {
			setHeldVisible(true);
			void enqueue();
		}, delay);
		return () => window.clearTimeout(timer.current);
	}, [form.values, mode, delay, enqueue, isDirty]);

	// Leaving the tab, closing it or going offline and back: keep the backup current and save what's pending.
	React.useEffect(() => {
		const away = () => {
			writeBackup();
			if (opts.current.mode === "auto" && isDirty()) {
				window.clearTimeout(timer.current);
				void enqueue();
			}
		};
		const onVisibility = () => document.visibilityState === "hidden" && away();
		const onOnline = () => opts.current.mode === "auto" && isDirty() && void enqueue();
		window.addEventListener("pagehide", away);
		document.addEventListener("visibilitychange", onVisibility);
		window.addEventListener("online", onOnline);
		return () => {
			window.removeEventListener("pagehide", away);
			document.removeEventListener("visibilitychange", onVisibility);
			window.removeEventListener("online", onOnline);
		};
	}, [enqueue, isDirty, writeBackup]);

	// Closing the screen (switching tabs unmounts it) saves what's pending; the backup covers a failure.
	React.useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
			window.clearTimeout(timer.current);
			window.clearTimeout(retryTimer.current);
			writeBackup();
			if (opts.current.mode === "auto" && isDirty()) void enqueue();
		};
	}, [enqueue, isDirty, writeBackup]);

	// ---- what the screen reads ----------------------------------------------------------------------------------

	const setValues = React.useCallback(
		(action: T | ((prev: T) => T)) => {
			touched.current = true;
			commit((prev) => {
				if (!prev.values) return prev;
				const values = typeof action === "function" ? action(prev.values) : action;
				return values === prev.values ? prev : { ...prev, values };
			});
		},
		[commit]
	);

	const { values, base } = form;
	const live =
		values && base
			? sendable({ values, base, groups: options.groups, invalid: options.invalid?.(values) ?? [], ignore })
			: null;
	const dirty = Boolean(live && (live.sent.length || live.held.length));
	const failing = status.state === "retrying" || status.state === "offline" || status.state === "failed";
	// A form with no server values is closed (a cancelled panel) or loading: its typing is in the backup, so leaving is fine.
	const unsafeToLeave =
		server !== null &&
		(mode === "manual"
			? dirty || Boolean(options.unsavedFiles)
			: Boolean(live?.held.length) || (dirty && failing) || Boolean(options.unsavedFiles));

	React.useEffect(() => {
		if (!unsafeToLeave) return;
		const warn = (e: BeforeUnloadEvent) => e.preventDefault();
		window.addEventListener("beforeunload", warn);
		return () => window.removeEventListener("beforeunload", warn);
	}, [unsafeToLeave]);

	/** Leaving a field saves straight away instead of waiting for the pause. */
	const onBlurCapture = React.useCallback(() => {
		if (opts.current.mode !== "auto" || !touched.current || !isDirty()) return;
		window.clearTimeout(timer.current);
		setHeldVisible(true);
		void enqueue();
	}, [enqueue, isDirty]);

	return {
		values,
		setValues,
		/** What the server has, as far as this form knows. */
		base,
		dirty,
		unsafeToLeave,
		status: { ...status, held: heldVisible ? (live?.held.length ?? 0) : 0 } as SaveStatus,
		/** Show errors for fields that can't be saved yet (after a pause, a blur, or pressing Save). */
		showErrors: heldVisible,
		isSaving: status.state === "saving",
		submit,
		markSaved,
		flush,
		retry: enqueue,
		run,
		/** Changes kept on the device from last time, waiting for Restore or Discard. */
		offer,
		restore,
		discard,
		/** Spread on the <form> so leaving a field saves it. */
		formProps: { onBlurCapture },
	};
}

export type SavedForm<T extends FormValues> = ReturnType<typeof useSavedForm<T>>;
