"use client";
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Download, Eye, EyeOff, Heart, MessageCircle, Star, Trash2, X } from "lucide-react";
import { AlbumItem, getAlbumComments } from "@/services/album";

const TIME_ZONE = "Africa/Lagos";
const fullWhen = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true, timeZone: TIME_ZONE });
const clock = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: TIME_ZONE });
const day = new Intl.DateTimeFormat("en-GB", { weekday: "short", hour: "numeric", minute: "2-digit", hour12: true, timeZone: TIME_ZONE });
const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE });

export const addedWhen = (iso: string) => fullWhen.format(new Date(iso)).replace(",", "").replace(" am", " AM").replace(" pm", " PM");
const commentWhen = (iso: string) =>
	dayKey.format(new Date(iso)) === dayKey.format(new Date()) ? clock.format(new Date(iso)) : day.format(new Date(iso)).replace(" am", " AM").replace(" pm", " PM");

const initials = (name: string) =>
	name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("") || "?";

type ViewerProps = {
	eventId: string;
	items: AlbumItem[];
	index: number | null;
	total: number;
	onIndex: (index: number | null) => void;
	onAction: (item: AlbumItem, action: "highlight" | "unhighlight" | "hide" | "unhide") => void;
	onDownload: (item: AlbumItem) => void;
	onDelete: (item: AlbumItem) => void;
};

const actionButton =
	"flex h-11 w-full items-center gap-3 rounded-lg border border-auth-field bg-white px-3.5 text-left text-[14px] font-semibold text-auth-ink transition-colors hover:border-auth-field-hover";

/** One photo or video, large on black, with who added it, its likes and comments, and the same actions as the grid. */
export default function Viewer({ eventId, items, index, total, onIndex, onAction, onDownload, onDelete }: ViewerProps) {
	const item = index === null ? null : items[index];
	const comments = useQuery({ queryKey: ["album-comments", eventId, item?.id], queryFn: () => getAlbumComments(eventId, item!.id), enabled: Boolean(item && item.comments > 0) });

	React.useEffect(() => {
		if (index === null) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "ArrowLeft" && index > 0) onIndex(index - 1);
			if (e.key === "ArrowRight" && index < items.length - 1) onIndex(index + 1);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [index, items.length, onIndex]);

	return (
		<DialogPrimitive.Root open={Boolean(item)} onOpenChange={(open) => !open && onIndex(null)}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.94)]" />
				<DialogPrimitive.Content aria-describedby={undefined} className="fixed inset-0 z-50 flex flex-col font-manrope lg:flex-row focus:outline-none">
					{item && (
						<>
							<div className="relative flex min-h-[45vh] flex-1 items-center justify-center p-6 lg:p-16">
								<DialogPrimitive.Title className="absolute left-5 top-5 text-[14px] font-bold text-white">
									{index! + 1} of {total}
								</DialogPrimitive.Title>
								<DialogPrimitive.Close aria-label="Close" className="absolute right-5 top-4 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
									<X aria-hidden="true" className="size-5" />
								</DialogPrimitive.Close>
								{index! > 0 && (
									<button type="button" aria-label="Previous" onClick={() => onIndex(index! - 1)} className="absolute left-5 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
										<ChevronLeft aria-hidden="true" className="size-5" />
									</button>
								)}
								{index! < items.length - 1 && (
									<button type="button" aria-label="Next" onClick={() => onIndex(index! + 1)} className="absolute right-5 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
										<ChevronRight aria-hidden="true" className="size-5" />
									</button>
								)}
								{item.media_type === "video" ? (
									<video key={item.id} src={item.file_url} controls autoPlay className="max-h-full max-w-full rounded-lg" />
								) : (
									// eslint-disable-next-line @next/next/no-img-element
									<img key={item.id} src={item.file_url} alt={`Added by ${item.uploader}`} className="max-h-full max-w-full rounded-lg object-contain" />
								)}
							</div>
							<aside className="grid w-full content-start gap-4 overflow-y-auto bg-white p-6 text-auth-ink lg:w-[360px]">
								<div className="flex items-center gap-3">
									<span aria-hidden="true" className="grid size-11 place-items-center rounded-full bg-primary-500 text-[14px] font-bold text-white">
										{initials(item.uploader)}
									</span>
									<div className="grid min-w-0">
										<p className="truncate text-[15px] font-bold">{item.by_organizer ? "You" : item.uploader}</p>
										<p className="text-[13px] text-auth-muted">
											{item.by_organizer ? "Organizer" : "Guest"} · added {addedWhen(item.uploaded_at)}
										</p>
									</div>
								</div>
								{(item.is_highlight || item.is_hidden) && (
									<span className={item.is_highlight ? "inline-flex w-fit items-center gap-1.5 rounded-full bg-auth-warning-soft px-2.5 py-1 text-[13px] font-bold text-auth-warning" : "inline-flex w-fit items-center gap-1.5 rounded-full bg-auth-info-soft px-2.5 py-1 text-[13px] font-bold text-primary-500"}>
										{item.is_highlight ? <Star aria-hidden="true" className="size-3.5 fill-current" /> : <EyeOff aria-hidden="true" className="size-3.5" />}
										{item.is_highlight ? "In highlights" : "Hidden from guests"}
									</span>
								)}
								<div className="grid gap-2">
									<button type="button" className={actionButton} onClick={() => onAction(item, item.is_highlight ? "unhighlight" : "highlight")}>
										<Star aria-hidden="true" className="size-4 text-auth-muted" />
										{item.is_highlight ? "Remove from highlights" : "Add to highlights"}
									</button>
									<button type="button" className={actionButton} onClick={() => onAction(item, item.is_hidden ? "unhide" : "hide")}>
										{item.is_hidden ? <Eye aria-hidden="true" className="size-4 text-auth-muted" /> : <EyeOff aria-hidden="true" className="size-4 text-auth-muted" />}
										{item.is_hidden ? "Show to guests" : "Hide from guests"}
									</button>
									<button type="button" className={actionButton} onClick={() => onDownload(item)}>
										<Download aria-hidden="true" className="size-4 text-auth-muted" />
										Download
									</button>
									<button type="button" onClick={() => onDelete(item)} className="flex h-11 items-center gap-3 rounded-lg px-3.5 text-[14px] font-semibold text-auth-error hover:bg-auth-error-soft">
										<Trash2 aria-hidden="true" className="size-4" />
										Delete
									</button>
								</div>
								<p className="text-[13px] text-auth-muted">Hidden photos stay here for you. Guests don’t see them.</p>
								<div className="flex items-center gap-4 border-t border-auth-line pt-4 text-[13px] text-auth-muted">
									<span className="inline-flex items-center gap-1.5">
										<Heart aria-hidden="true" className="size-4" />
										<strong className="font-bold text-auth-ink">{item.likes}</strong> {item.likes === 1 ? "like" : "likes"}
									</span>
									<span className="inline-flex items-center gap-1.5">
										<MessageCircle aria-hidden="true" className="size-4" />
										<strong className="font-bold text-auth-ink">{item.comments}</strong> {item.comments === 1 ? "comment" : "comments"}
									</span>
								</div>
								{(comments.data ?? []).length > 0 && (
									<ul className="grid gap-3">
										{comments.data!.map((comment) => (
											<li key={comment.id} className="grid gap-0.5">
												<p className="text-[13px]">
													<strong className="font-bold">{comment.name}</strong>
													<span className="text-auth-muted"> · {commentWhen(comment.created_at)}</span>
												</p>
												<p className="text-[14px]">{comment.content}</p>
											</li>
										))}
									</ul>
								)}
							</aside>
						</>
					)}
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}
