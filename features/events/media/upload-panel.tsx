"use client";
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import classNames from "classnames";
import { AlertCircle, Check, ImageIcon, Info, Play, Video, X } from "lucide-react";
import { compressImage } from "@/lib/compress-image";
import ensureError from "@/lib/ensure-error";
import { replaceMediaFile, uploadMedia } from "@/services/media";
import { EventMedia } from "@/types/event-media.types";

export const MAX_PHOTOS = 6;
const MB = 1024 * 1024;
const PHOTO_LIMIT = 10 * MB;
const VIDEO_LIMIT = 100 * MB;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

export const formatSize = (bytes: number) => (bytes >= MB ? `${(bytes / MB).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

type Row = {
	key: string;
	file: File;
	preview?: string;
	/** waiting, uploading (with percent), done (with the place it took), failed or skipped (with why) */
	state: "waiting" | "uploading" | "done" | "failed" | "skipped";
	percent: number;
	note?: string;
};

const isHeic = (file: File) => /\.(heic|heif)$/i.test(file.name) || /heic|heif/i.test(file.type);

/** Why a photo can't be added, before it's uploaded. Big photos are shrunk instead of refused. */
function photoProblem(file: File) {
	if (isHeic(file)) return "This is an iPhone HEIC photo. Save it as JPG and add it again.";
	if (!PHOTO_TYPES.includes(file.type)) return "This isn’t a photo we can use. Add a JPG, PNG, GIF or WebP.";
	return "";
}

function videoProblem(file: File) {
	if (!VIDEO_TYPES.includes(file.type)) return "This isn’t a video we can use. Add an MP4, MOV or WebM.";
	if (file.size > VIDEO_LIMIT) return `This video is ${formatSize(file.size)}. Videos can be up to 100 MB, so trim it or save a smaller copy.`;
	return "";
}

function DropZone({ kind, onFiles, disabled }: { kind: "photos" | "video"; onFiles: (files: File[]) => void; disabled?: boolean }) {
	const input = React.useRef<HTMLInputElement>(null);
	const [over, setOver] = React.useState(false);
	const Icon = kind === "photos" ? ImageIcon : Video;
	return (
		<div
			onDragOver={(e) => {
				e.preventDefault();
				if (!disabled) setOver(true);
			}}
			onDragLeave={() => setOver(false)}
			onDrop={(e) => {
				e.preventDefault();
				setOver(false);
				if (!disabled) onFiles(Array.from(e.dataTransfer.files));
			}}
			className={classNames(
				"grid justify-items-center gap-3 rounded-xl border border-dashed px-5 py-7 text-center transition-colors duration-150",
				over ? "border-primary-500 bg-auth-info-soft" : "border-auth-field bg-auth-page",
				disabled && "opacity-60"
			)}
		>
			<span aria-hidden="true" className="grid size-11 place-items-center rounded-xl bg-auth-info-soft text-primary-500">
				<Icon className="size-5" />
			</span>
			<p className="text-[15px] font-bold text-auth-ink">{kind === "photos" ? "Drop photos here" : "Drop a video here"}</p>
			<button
				type="button"
				disabled={disabled}
				onClick={() => input.current?.click()}
				className="h-10 rounded-lg border border-auth-field bg-white px-3.5 text-[14px] font-semibold text-auth-ink hover:border-auth-field-hover disabled:cursor-not-allowed"
			>
				{kind === "photos" ? "Choose photos" : "Choose a video"}
			</button>
			<p className="text-[13px] text-auth-muted">
				{kind === "photos" ? "JPG, PNG, GIF or WebP. You can pick several at once." : "MP4, MOV or WebM, up to 100 MB."}
			</p>
			<input
				ref={input}
				type="file"
				hidden
				multiple={kind === "photos"}
				accept={kind === "photos" ? "image/jpeg,image/png,image/gif,image/webp,.heic,.heif" : "video/mp4,video/quicktime,video/webm"}
				onChange={(e) => {
					onFiles(Array.from(e.target.files ?? []));
					e.target.value = "";
				}}
			/>
		</div>
	);
}

function FileRow({ row, kind, onRemove }: { row: Row; kind: "photos" | "video"; onRemove: () => void }) {
	const failed = row.state === "failed";
	return (
		<li className="flex items-start gap-3 py-3">
			{row.preview && !failed ? (
				// eslint-disable-next-line @next/next/no-img-element
				<img src={row.preview} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
			) : (
				<span aria-hidden="true" className={classNames("grid size-12 shrink-0 place-items-center rounded-lg", failed ? "bg-auth-error-soft text-auth-error" : "bg-auth-info-soft text-primary-500")}>
					{kind === "photos" ? <ImageIcon className="size-5" /> : <Video className="size-5" />}
				</span>
			)}
			<div className="grid min-w-0 flex-1 gap-1">
				<p className="truncate text-[14px] font-semibold text-auth-ink">{row.file.name}</p>
				{row.state === "uploading" ? (
					<div className="flex items-center gap-3">
						<div className="h-1 flex-1 overflow-hidden rounded-full bg-auth-info-soft" role="progressbar" aria-valuenow={row.percent} aria-valuemin={0} aria-valuemax={100} aria-label={`Uploading ${row.file.name}`}>
							<div className="h-full rounded-full bg-primary-500 transition-[width] duration-200" style={{ width: `${row.percent}%` }} />
						</div>
						<span className="text-[13px] font-semibold text-auth-ink">{row.percent}%</span>
					</div>
				) : failed || row.state === "skipped" ? (
					<p className={classNames("flex items-start gap-1.5 text-[13px] leading-snug", failed ? "text-auth-error" : "text-auth-muted")}>
						{failed ? <AlertCircle aria-hidden="true" className="mt-px size-3.5 shrink-0" /> : <Info aria-hidden="true" className="mt-px size-3.5 shrink-0" />}
						{row.note}
					</p>
				) : (
					<p className="text-[13px] text-auth-muted">{row.state === "waiting" ? `${formatSize(row.file.size)} · waiting` : formatSize(row.file.size)}</p>
				)}
			</div>
			{row.state === "done" ? (
				<span className="flex shrink-0 items-center gap-1 text-[13px] font-semibold text-auth-success">
					<Check aria-hidden="true" className="size-4" />
					{row.note}
				</span>
			) : failed || row.state === "skipped" ? (
				<button type="button" onClick={onRemove} className="shrink-0 rounded-md px-2 py-1 text-[13px] font-semibold text-auth-muted hover:bg-auth-page hover:text-auth-ink">
					Remove
				</button>
			) : null}
		</li>
	);
}

type PanelProps = {
	open: boolean;
	onClose: () => void;
	eventId: string;
	eventTitle: string;
	/** Called after each file lands, so the page behind can update. */
	onUploaded: () => void;
};

/** Adds photos: drop several, see each one's progress, and why a file wasn't added. */
export function PhotosPanel({ open, onClose, eventId, eventTitle, onUploaded, photosNow }: PanelProps & { photosNow: number }) {
	const [rows, setRows] = React.useState<Row[]>([]);
	const busy = rows.some((row) => row.state === "uploading" || row.state === "waiting");
	const queue = React.useRef<Promise<void>>(Promise.resolve());
	const placed = React.useRef(photosNow);

	React.useEffect(() => {
		if (open) {
			setRows([]);
			placed.current = photosNow;
		}
		// Only reset when the panel opens.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	const update = (key: string, patch: Partial<Row>) => setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));

	const add = (files: File[]) => {
		const fresh: Row[] = files.map((file) => {
			const problem = photoProblem(file);
			const row: Row = { key: `${file.name}-${file.size}-${Math.random()}`, file, state: problem ? "failed" : "waiting", percent: 0, note: problem };
			if (!problem) row.preview = URL.createObjectURL(file);
			return row;
		});
		setRows((current) => [...current, ...fresh]);
		for (const row of fresh.filter((item) => item.state === "waiting")) {
			queue.current = queue.current.then(async () => {
				if (placed.current >= MAX_PHOTOS) {
					update(row.key, { state: "skipped", note: `Not added. There’s room for ${MAX_PHOTOS} photos, and this would be the ${placed.current + 1}th.` });
					return;
				}
				update(row.key, { state: "uploading", percent: 0 });
				try {
					const file = row.file.size > PHOTO_LIMIT ? await compressImage(row.file, { targetSizeBytes: 9.5 * MB }) : row.file;
					await uploadMedia(eventId, file, "image", { onProgress: (percent) => update(row.key, { percent }) });
					placed.current += 1;
					update(row.key, { state: "done", percent: 100, note: `Added as ${placed.current}` });
					onUploaded();
				} catch (error) {
					update(row.key, { state: "failed", note: ensureError(error).message || "This photo didn’t upload. Try again." });
				}
			});
		}
	};

	const done = rows.filter((row) => row.state === "done").length;
	const uploading = rows.filter((row) => row.state === "uploading" || row.state === "waiting").length;
	const status = rows.length ? [`${done} of ${rows.length} added.`, uploading ? `${uploading} ${uploading === 1 ? "is" : "are"} uploading.` : ""].filter(Boolean).join(" ") : "";

	return (
		<Panel open={open} onClose={onClose} title="Add photos" subtitle={`${eventTitle} · up to ${MAX_PHOTOS} photos`} status={status} busy={busy} doneLabel="Done">
			<DropZone kind="photos" onFiles={add} disabled={placed.current >= MAX_PHOTOS && !busy} />
			{rows.length > 0 && (
				<section aria-labelledby="photo-files" className="grid gap-1">
					<h3 id="photo-files" className="text-[13px] font-semibold">
						{rows.length === 1 ? "1 photo" : `${rows.length} photos`}
					</h3>
					<ul className="divide-y divide-auth-info-soft border-y border-auth-info-soft" aria-live="polite">
						{rows.map((row) => (
							<FileRow key={row.key} row={row} kind="photos" onRemove={() => setRows((current) => current.filter((item) => item.key !== row.key))} />
						))}
					</ul>
				</section>
			)}
		</Panel>
	);
}

/** Adds the video, or replaces it while the current one stays up until the new one has uploaded. */
export function VideoPanel({ open, onClose, eventId, eventTitle, onUploaded, current }: PanelProps & { current?: EventMedia }) {
	const [rows, setRows] = React.useState<Row[]>([]);
	const abort = React.useRef<AbortController | null>(null);
	const busy = rows.some((row) => row.state === "uploading");

	React.useEffect(() => {
		if (open) setRows([]);
	}, [open]);

	const update = (key: string, patch: Partial<Row>) => setRows((list) => list.map((row) => (row.key === key ? { ...row, ...patch } : row)));

	const add = async (files: File[]) => {
		const file = files[0];
		if (!file || busy) return;
		const problem = videoProblem(file);
		const row: Row = { key: `${file.name}-${Math.random()}`, file, state: problem ? "failed" : "uploading", percent: 0, note: problem };
		setRows((list) => [...list.filter((item) => item.state === "failed"), row]);
		if (problem) return;
		abort.current = new AbortController();
		const progress = { onProgress: (percent: number) => update(row.key, { percent }), signal: abort.current.signal };
		try {
			if (current) await replaceMediaFile(eventId, current.id, file, progress);
			else await uploadMedia(eventId, file, "video", progress);
			update(row.key, { state: "done", percent: 100, note: current ? "Replaced" : "Added" });
			onUploaded();
		} catch (error) {
			const cancelled = abort.current?.signal.aborted;
			update(row.key, { state: "failed", note: cancelled ? "Upload cancelled." : ensureError(error).message || "This video didn’t upload. Try again." });
		} finally {
			abort.current = null;
		}
	};

	const uploadingRow = rows.find((row) => row.state === "uploading");
	const status = uploadingRow
		? current
			? "Uploading. The new video replaces the current one when it’s done."
			: "Uploading. Keep this open until it’s done."
		: "";

	return (
		<Panel
			open={open}
			onClose={onClose}
			title={current ? "Replace the video" : "Add a video"}
			subtitle={eventTitle}
			status={status}
			busy={busy}
			doneLabel="Done"
			onCancelUpload={busy ? () => abort.current?.abort() : undefined}
		>
			{current && (
				<section aria-labelledby="current-video" className="grid gap-2">
					<h3 id="current-video" className="text-[13px] font-semibold">
						Current video
					</h3>
					<div className="flex items-center gap-3 rounded-xl border border-auth-line p-2.5">
						<span aria-hidden="true" className="grid h-14 w-24 shrink-0 place-items-center rounded-lg bg-[#191837] text-white">
							<Play className="size-4 fill-current" />
						</span>
						<span className="grid min-w-0">
							<span className="truncate text-[14px] font-semibold">{current.file_name}</span>
							<span className="text-[13px] text-auth-muted">{formatSize(current.file_size)}</span>
						</span>
					</div>
					<p className="text-[13px] text-auth-muted">It stays up until the new video has finished uploading.</p>
				</section>
			)}
			<DropZone kind="video" onFiles={add} disabled={busy} />
			{rows.length > 0 && (
				<ul className="divide-y divide-auth-info-soft border-y border-auth-info-soft" aria-live="polite">
					{rows.map((row) => (
						<FileRow key={row.key} row={row} kind="video" onRemove={() => setRows((list) => list.filter((item) => item.key !== row.key))} />
					))}
				</ul>
			)}
		</Panel>
	);
}

/** The right-hand panel these uploads share: no Save, because each file saves as it lands. */
function Panel({
	open,
	onClose,
	title,
	subtitle,
	status,
	busy,
	doneLabel,
	onCancelUpload,
	children,
}: {
	open: boolean;
	onClose: () => void;
	title: string;
	subtitle: string;
	status: string;
	busy: boolean;
	doneLabel: string;
	onCancelUpload?: () => void;
	children: React.ReactNode;
}) {
	return (
		<DialogPrimitive.Root open={open} onOpenChange={(next) => !next && !busy && onClose()}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[rgba(25,24,55,0.35)] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
				<DialogPrimitive.Content
					aria-describedby={undefined}
					className="fixed inset-y-0 right-0 z-50 flex w-[480px] max-w-full flex-col bg-white font-manrope text-auth-ink shadow-[-24px_0_64px_-24px_rgba(25,24,55,0.45)] duration-200 ease-out data-[state=open]:animate-in data-[state=open]:slide-in-from-right focus:outline-none motion-reduce:animate-none"
				>
					<header className="flex items-start gap-4 border-b border-auth-info-soft px-6 pb-4 pt-5">
						<div className="min-w-0 flex-1">
							<DialogPrimitive.Title className="text-[18px] font-bold">{title}</DialogPrimitive.Title>
							<p className="mt-1 truncate text-[14px] text-auth-muted">{subtitle}</p>
						</div>
						<DialogPrimitive.Close aria-label="Close" disabled={busy} className="-mr-2 grid size-9 shrink-0 place-items-center rounded-lg text-auth-muted hover:bg-auth-page hover:text-auth-ink disabled:opacity-50">
							<X aria-hidden="true" className="size-5" />
						</DialogPrimitive.Close>
					</header>
					<div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-7 pt-5">{children}</div>
					<footer className="flex flex-wrap items-center gap-3 border-t border-auth-line px-6 py-4">
						<p role="status" className="min-w-[160px] flex-1 text-[13px] text-auth-muted">
							{status}
						</p>
						{onCancelUpload ? (
							<button type="button" onClick={onCancelUpload} className="h-11 rounded-lg px-4 text-[15px] font-semibold text-auth-muted hover:bg-auth-page hover:text-auth-ink">
								Cancel upload
							</button>
						) : (
							<button type="button" onClick={onClose} disabled={busy} className="h-11 rounded-lg bg-primary-500 px-5 text-[15px] font-semibold text-white hover:bg-primary-600 disabled:cursor-wait disabled:opacity-70">
								{doneLabel}
							</button>
						)}
					</footer>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}
