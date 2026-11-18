"use client";
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import classNames from "classnames";
import { AlertCircle, Check, ImageIcon, Upload, Video, X } from "lucide-react";
import ensureError from "@/lib/ensure-error";
import { uploadToAlbum } from "@/services/album";

const MB = 1024 * 1024;
const LIMIT = 50 * MB;

type Row = { key: string; file: File; state: "waiting" | "uploading" | "done" | "failed"; percent: number; note?: string };

function problemWith(file: File) {
	if (/\.(heic|heif)$/i.test(file.name) || /heic|heif/i.test(file.type)) return "This is an iPhone HEIC photo. Save it as JPG and add it again.";
	if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return "This isn’t a photo or video.";
	if (file.size > LIMIT) return `This file is ${(file.size / MB).toFixed(1)} MB. Files can be up to 50 MB.`;
	return "";
}

/** The organizer's upload: drop photos and videos, see each file's progress, and why a file failed. */
export default function UploadPanel({ open, onClose, eventId, eventTitle, room, onUploaded }: { open: boolean; onClose: () => void; eventId: string; eventTitle: string; room: number; onUploaded: () => void }) {
	const [rows, setRows] = React.useState<Row[]>([]);
	const [over, setOver] = React.useState(false);
	const input = React.useRef<HTMLInputElement>(null);
	const queue = React.useRef<Promise<void>>(Promise.resolve());
	const busy = rows.some((row) => row.state === "waiting" || row.state === "uploading");

	React.useEffect(() => {
		if (open) setRows([]);
	}, [open]);

	const update = (key: string, patch: Partial<Row>) => setRows((list) => list.map((row) => (row.key === key ? { ...row, ...patch } : row)));

	const add = (files: File[]) => {
		const fresh = files.map((file): Row => {
			const problem = problemWith(file);
			return { key: `${file.name}-${Math.random()}`, file, state: problem ? "failed" : "waiting", percent: 0, note: problem };
		});
		setRows((list) => [...list, ...fresh]);
		for (const row of fresh.filter((item) => item.state === "waiting")) {
			queue.current = queue.current.then(async () => {
				update(row.key, { state: "uploading" });
				try {
					await uploadToAlbum(eventId, row.file, (percent) => update(row.key, { percent }));
					update(row.key, { state: "done", percent: 100 });
					onUploaded();
				} catch (error) {
					update(row.key, { state: "failed", note: ensureError(error).message || "This file didn’t upload. Try again." });
				}
			});
		}
	};

	const done = rows.filter((row) => row.state === "done").length;
	const uploading = rows.filter((row) => row.state === "waiting" || row.state === "uploading").length;

	return (
		<DialogPrimitive.Root open={open} onOpenChange={(next) => !next && !busy && onClose()}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[rgba(25,24,55,0.35)]" />
				<DialogPrimitive.Content aria-describedby={undefined} className="fixed inset-y-0 right-0 z-50 flex w-[480px] max-w-full flex-col bg-white font-manrope text-auth-ink shadow-[-24px_0_64px_-24px_rgba(25,24,55,0.45)] focus:outline-none">
					<header className="flex items-start gap-4 border-b border-auth-info-soft px-6 pb-4 pt-5">
						<div className="min-w-0 flex-1">
							<DialogPrimitive.Title className="text-[18px] font-bold">Upload to the album</DialogPrimitive.Title>
							<p className="mt-1 truncate text-[14px] text-auth-muted">
								{eventTitle} · room for {room} more
							</p>
						</div>
						<DialogPrimitive.Close aria-label="Close" disabled={busy} className="-mr-2 grid size-9 place-items-center rounded-lg text-auth-muted hover:bg-auth-page hover:text-auth-ink disabled:opacity-50">
							<X aria-hidden="true" className="size-5" />
						</DialogPrimitive.Close>
					</header>
					<div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-7 pt-5">
						<div
							onDragOver={(e) => {
								e.preventDefault();
								setOver(true);
							}}
							onDragLeave={() => setOver(false)}
							onDrop={(e) => {
								e.preventDefault();
								setOver(false);
								add(Array.from(e.dataTransfer.files));
							}}
							className={classNames("grid justify-items-center gap-3 rounded-xl border border-dashed px-5 py-7 text-center", over ? "border-primary-500 bg-auth-info-soft" : "border-auth-field bg-auth-page")}
						>
							<span aria-hidden="true" className="grid size-11 place-items-center rounded-xl bg-auth-info-soft text-primary-500">
								<Upload className="size-5" />
							</span>
							<p className="text-[15px] font-bold">Drop photos and videos here</p>
							<button type="button" onClick={() => input.current?.click()} className="h-10 rounded-lg border border-auth-field bg-white px-3.5 text-[14px] font-semibold hover:border-auth-field-hover">
								Choose files
							</button>
							<p className="text-[13px] text-auth-muted">JPG, PNG, WebP, MP4 or MOV, up to 50 MB each.</p>
							<input
								ref={input}
								type="file"
								hidden
								multiple
								accept="image/*,video/mp4,video/quicktime,video/webm,.heic,.heif"
								onChange={(e) => {
									add(Array.from(e.target.files ?? []));
									e.target.value = "";
								}}
							/>
						</div>
						{rows.length > 0 && (
							<ul className="divide-y divide-auth-info-soft border-y border-auth-info-soft" aria-live="polite">
								{rows.map((row) => (
									<li key={row.key} className="flex items-start gap-3 py-3">
										<span aria-hidden="true" className={classNames("grid size-11 shrink-0 place-items-center rounded-lg", row.state === "failed" ? "bg-auth-error-soft text-auth-error" : "bg-auth-info-soft text-primary-500")}>
											{row.file.type.startsWith("video/") ? <Video className="size-5" /> : <ImageIcon className="size-5" />}
										</span>
										<div className="grid min-w-0 flex-1 gap-1">
											<p className="truncate text-[14px] font-semibold">{row.file.name}</p>
											{row.state === "uploading" ? (
												<div className="flex items-center gap-3">
													<div className="h-1 flex-1 overflow-hidden rounded-full bg-auth-info-soft" role="progressbar" aria-valuenow={row.percent} aria-valuemin={0} aria-valuemax={100} aria-label={`Uploading ${row.file.name}`}>
														<div className="h-full rounded-full bg-primary-500" style={{ width: `${row.percent}%` }} />
													</div>
													<span className="text-[13px] font-semibold">{row.percent}%</span>
												</div>
											) : row.state === "failed" ? (
												<p className="flex items-start gap-1.5 text-[13px] text-auth-error">
													<AlertCircle aria-hidden="true" className="mt-px size-3.5 shrink-0" />
													{row.note}
												</p>
											) : (
												<p className="text-[13px] text-auth-muted">{(row.file.size / MB).toFixed(1)} MB{row.state === "waiting" ? " · waiting" : ""}</p>
											)}
										</div>
										{row.state === "done" && (
											<span className="flex items-center gap-1 text-[13px] font-semibold text-auth-success">
												<Check aria-hidden="true" className="size-4" />
												Added
											</span>
										)}
									</li>
								))}
							</ul>
						)}
					</div>
					<footer className="flex items-center gap-3 border-t border-auth-line px-6 py-4">
						<p role="status" className="flex-1 text-[13px] text-auth-muted">
							{rows.length ? `${done} of ${rows.length} added.${uploading ? ` ${uploading} uploading.` : ""}` : ""}
						</p>
						<button type="button" onClick={onClose} disabled={busy} className="h-11 rounded-lg bg-primary-500 px-5 text-[15px] font-semibold text-white hover:bg-primary-600 disabled:cursor-wait disabled:opacity-70">
							Done
						</button>
					</footer>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}
