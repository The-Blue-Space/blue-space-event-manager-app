"use client";
import * as React from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import classNames from "classnames";
import { Check, EyeOff, Loader2, Play, Star, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/app/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvent } from "@/features/events/manage-event/context";
import { DashboardError } from "@/features/home/dashboard/states";
import ensureError from "@/lib/ensure-error";
import { AlbumAction, AlbumFilter, AlbumItem, actOnAlbum, getAlbum } from "@/services/album";
import SettingsCard from "./settings-card";
import UploadPanel from "./upload-panel";
import Viewer from "./viewer";

const PAGE = 24;
const FILTERS: { id: AlbumFilter; label: string }[] = [
	{ id: "all", label: "All" },
	{ id: "highlights", label: "Highlights" },
	{ id: "videos", label: "Videos" },
	{ id: "hidden", label: "Hidden" },
];
const EMPTY: Record<AlbumFilter, { title: string; text: string }> = {
	all: { title: "", text: "" },
	highlights: { title: "No highlights yet", text: "Open a photo and add it to highlights. Up to 10 show first in the album." },
	videos: { title: "No videos yet", text: "Videos guests add from the app show here." },
	hidden: { title: "Nothing hidden", text: "Photos you hide stay here for you. Guests don’t see them." },
};
const TILES = [false, true, false, true, "lit", true, false, true, false] as const;
const TIME_ZONE = "Africa/Lagos";
const caption = new Intl.DateTimeFormat("en-GB", { weekday: "short", hour: "numeric", minute: "2-digit", hour12: true, timeZone: TIME_ZONE });

async function downloadFile(item: AlbumItem) {
	try {
		const blob = await (await fetch(item.file_url)).blob();
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = item.file_name || `${item.id}.${item.media_type === "video" ? "mp4" : "jpg"}`;
		link.click();
		URL.revokeObjectURL(link.href);
	} catch {
		window.open(item.file_url, "_blank", "noopener");
	}
}

function Tile({ item, selecting, selected, onOpen, onToggle }: { item: AlbumItem; selecting: boolean; selected: boolean; onOpen: () => void; onToggle: () => void }) {
	return (
		<li className="grid gap-1.5">
			<button
				type="button"
				onClick={selecting ? onToggle : onOpen}
				aria-pressed={selecting ? selected : undefined}
				aria-label={`${item.media_type === "video" ? "Video" : "Photo"} added by ${item.uploader}${item.is_hidden ? ", hidden" : ""}${item.is_highlight ? ", in highlights" : ""}`}
				className={classNames("relative aspect-square overflow-hidden rounded-xl bg-auth-info-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auth-link", selected && "ring-[3px] ring-primary-500")}
			>
				{item.media_type === "video" ? (
					<video src={`${item.file_url}#t=0.5`} preload="metadata" muted className="size-full object-cover" />
				) : (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={item.file_url} alt="" loading="lazy" className="size-full object-cover" />
				)}
				{item.is_hidden && (
					<span className="absolute inset-0 grid place-items-center bg-[rgba(25,24,55,0.55)]">
						<span className="inline-flex items-center gap-1.5 rounded-full bg-[#191837] px-2.5 py-1 text-[12px] font-bold text-white">
							<EyeOff aria-hidden="true" className="size-3.5" />
							Hidden
						</span>
					</span>
				)}
				{item.is_highlight && (
					<span aria-hidden="true" className="absolute left-2 top-2 grid size-7 place-items-center rounded-full bg-[rgba(25,24,55,0.82)] text-accent-1000">
						<Star className="size-3.5 fill-current" />
					</span>
				)}
				{item.media_type === "video" && (
					<span aria-hidden="true" className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-[rgba(25,24,55,0.82)] px-2 py-0.5 text-[12px] font-bold text-white">
						<Play className="size-3 fill-current" />
						Video
					</span>
				)}
				{selecting && (
					<span aria-hidden="true" className={classNames("absolute right-2 top-2 grid size-6 place-items-center rounded-full border-2", selected ? "border-primary-500 bg-primary-500 text-white" : "border-white bg-black/20")}>
						{selected && <Check className="size-3.5" strokeWidth={3} />}
					</span>
				)}
			</button>
			<p className="truncate text-[12px] text-auth-muted">
				{item.by_organizer ? "You" : item.uploader} · {caption.format(new Date(item.uploaded_at)).replace(" am", " AM").replace(" pm", " PM")}
			</p>
		</li>
	);
}

export default function AlbumTab({ eventId }: { eventId: string }) {
	const { event } = useEvent();
	const queryClient = useQueryClient();
	const [filter, setFilter] = React.useState<AlbumFilter>("all");
	const [oldestFirst, setOldestFirst] = React.useState(false);
	const [selecting, setSelecting] = React.useState(false);
	const [selected, setSelected] = React.useState<Set<string>>(new Set());
	const [viewing, setViewing] = React.useState<number | null>(null);
	const [uploading, setUploading] = React.useState(false);
	const [deleting, setDeleting] = React.useState<string[] | null>(null);
	const sentinel = React.useRef<HTMLDivElement>(null);

	const query = useInfiniteQuery({
		queryKey: ["album", eventId, filter, oldestFirst],
		queryFn: ({ pageParam }) => getAlbum(eventId, filter, oldestFirst, pageParam, PAGE),
		initialPageParam: 1,
		getNextPageParam: (last) => (last.page * last.limit < last.total ? last.page + 1 : undefined),
	});
	const refresh = React.useCallback(() => {
		queryClient.invalidateQueries({ queryKey: ["album", eventId] });
		queryClient.invalidateQueries({ queryKey: ["event-summary", eventId] });
	}, [eventId, queryClient]);

	const first = query.data?.pages[0];
	const items = React.useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data]);

	// More load as the organizer scrolls near the end; there's no Show more button.
	const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
	React.useEffect(() => {
		const target = sentinel.current;
		if (!target || !hasNextPage) return;
		const observer = new IntersectionObserver((entries) => entries[0]?.isIntersecting && !isFetchingNextPage && fetchNextPage(), { rootMargin: "600px" });
		observer.observe(target);
		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage, items.length]);

	const act = async (ids: string[], action: AlbumAction, done: string) => {
		try {
			await actOnAlbum(eventId, ids, action);
			toast.success(done);
			setSelected(new Set());
			refresh();
		} catch (error) {
			toast.error(ensureError(error).message);
		}
	};
	const toggle = (id: string) =>
		setSelected((current) => {
			const next = new Set(current);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});

	if (query.isError) return <DashboardError onRetry={() => query.refetch()} isRetrying={query.isFetching} />;
	if (!first) {
		return (
			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]" aria-hidden="true">
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
					{Array.from({ length: 8 }, (_, i) => (
						<Skeleton key={i} className="aspect-square rounded-xl" />
					))}
				</div>
				<Skeleton className="h-80 rounded-[14px]" />
			</div>
		);
	}

	const counts = first.counts;
	const title = event?.title ?? "this event";
	const room = Math.max(0, first.settings.limit - first.settings.used);
	const summary = counts.all ? `${counts.all} from ${first.contributors === 1 ? "1 person" : `${first.contributors} people`}` : "None yet";
	const picked = items.filter((item) => selected.has(item.id));
	const allHighlighted = picked.length > 0 && picked.every((item) => item.is_highlight);
	const allHidden = picked.length > 0 && picked.every((item) => item.is_hidden);

	return (
		<div className="grid min-w-0 items-start gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_320px]">
			<section aria-labelledby="album-title" className="grid min-w-0 gap-5">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div className="grid gap-1">
						<h2 id="album-title" className="text-[20px] font-bold text-auth-ink">
							Photos and videos
						</h2>
						<p className="text-[14px] text-auth-muted">{summary}</p>
					</div>
					<div className="flex gap-2">
						{counts.all > 0 && (
							<button
								type="button"
								onClick={() => {
									setSelecting(!selecting);
									setSelected(new Set());
								}}
								aria-pressed={selecting}
								className="inline-flex h-10 items-center rounded-lg border border-auth-field bg-white px-3.5 text-[14px] font-semibold text-auth-ink hover:border-auth-field-hover"
							>
								{selecting ? "Done" : "Select"}
							</button>
						)}
						<button type="button" onClick={() => setUploading(true)} disabled={room === 0} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-500 px-4 text-[14px] font-semibold text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-[#8E8DB0]">
							<Upload aria-hidden="true" className="size-4" />
							Upload
						</button>
					</div>
				</div>

				{counts.all === 0 ? (
					<div className="flex flex-wrap items-center gap-x-8 gap-y-6 rounded-2xl border border-dashed border-auth-field bg-auth-page p-6 sm:p-8">
						<span aria-hidden="true" className="grid w-[168px] shrink-0 grid-cols-3 gap-1.5">
							{TILES.map((tile, i) => (
								<span key={i} className={classNames("aspect-square rounded-lg", tile === "lit" ? "bg-accent-1000" : tile ? "bg-auth-line" : "bg-auth-info-soft")} />
							))}
						</span>
						<div className="grid min-w-0 flex-[1_1_300px] gap-2">
							<h3 className="text-[18px] font-bold text-auth-ink">The album fills up at the event</h3>
							<p className="text-[15px] text-auth-muted">Guests add photos and videos from the Blue Space app, so everyone ends up with the whole night in one place.</p>
							<p className="text-[15px] text-auth-muted">You can upload your own any time, like photos from setup.</p>
						</div>
					</div>
				) : (
					<>
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div role="radiogroup" aria-label="Show" className="flex gap-2 overflow-x-auto pb-0.5">
								{FILTERS.map((item) => {
									const on = item.id === filter;
									return (
										<button
											key={item.id}
											type="button"
											role="radio"
											aria-checked={on}
											onClick={() => {
												setFilter(item.id);
												setSelected(new Set());
											}}
											className={classNames("inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-bold", on ? "border-primary-500 bg-primary-500 text-white" : "border-auth-line bg-white text-auth-ink hover:border-auth-field")}
										>
											{item.label}
											<span className={on ? "font-semibold text-white/75" : "font-semibold text-auth-muted"}>{counts[item.id]}</span>
										</button>
									);
								})}
							</div>
							<label className="flex items-center gap-2 text-[13px] font-semibold text-auth-ink">
								<span className="sr-only">Order</span>
								<select value={oldestFirst ? "oldest" : "newest"} onChange={(e) => setOldestFirst(e.target.value === "oldest")} className="h-9 rounded-lg border border-auth-line bg-white px-3 text-[13px] font-semibold text-auth-ink hover:border-auth-field">
									<option value="newest">Newest first</option>
									<option value="oldest">Oldest first</option>
								</select>
							</label>
						</div>

						{filter === "all" && (
							<section aria-labelledby="highlights" className="grid gap-3 rounded-[14px] bg-auth-page p-4">
								<div className="flex flex-wrap items-baseline justify-between gap-2">
									<h3 id="highlights" className="text-[15px] font-bold text-auth-ink">
										Highlights <span className="font-medium text-auth-muted">{counts.highlights} of 10</span>
									</h3>
									<p className="text-[13px] text-auth-muted">Your favourites. They show first in the album.</p>
								</div>
								{first.highlights.length ? (
									<ul className="flex gap-2 overflow-x-auto pb-1">
										{first.highlights.map((item) => (
											<li key={item.id} className="shrink-0">
												<button
													type="button"
													onClick={() => {
														const at = items.findIndex((entry) => entry.id === item.id);
														if (at >= 0) setViewing(at);
													}}
													aria-label={`Highlight added by ${item.uploader}`}
													className="block size-20 overflow-hidden rounded-lg bg-white sm:size-24"
												>
													{item.media_type === "video" ? (
														<video src={`${item.file_url}#t=0.5`} preload="metadata" muted className="size-full object-cover" />
													) : (
														// eslint-disable-next-line @next/next/no-img-element
														<img src={item.file_url} alt="" className="size-full object-cover" />
													)}
												</button>
											</li>
										))}
									</ul>
								) : (
									<p className="text-[13px] text-auth-muted">None yet. Open a photo and add it to highlights.</p>
								)}
							</section>
						)}

						{items.length === 0 ? (
							<div className="grid justify-items-center gap-1 rounded-[14px] border border-dashed border-auth-field px-6 py-10 text-center">
								<p className="text-[15px] font-bold text-auth-ink">{EMPTY[filter].title}</p>
								<p className="text-[14px] text-auth-muted">{EMPTY[filter].text}</p>
							</div>
						) : (
							<ul className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 xl:grid-cols-4">
								{items.map((item, i) => (
									<Tile key={item.id} item={item} selecting={selecting} selected={selected.has(item.id)} onOpen={() => setViewing(i)} onToggle={() => toggle(item.id)} />
								))}
							</ul>
						)}

						<div ref={sentinel} />
						{query.isFetchingNextPage && (
							<>
								<ul aria-hidden="true" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
									{Array.from({ length: 4 }, (_, i) => (
										<Skeleton key={i} className="aspect-square rounded-xl" />
									))}
								</ul>
								<p role="status" className="flex items-center justify-center gap-2 text-[13px] text-auth-muted">
									<Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
									Loading more as you scroll
								</p>
							</>
						)}
					</>
				)}

				{selecting && selected.size > 0 && (
					<div className="sticky bottom-4 z-20 flex flex-wrap items-center gap-2 rounded-[14px] bg-[#191837] px-4 py-3 text-white shadow-[0_24px_48px_-24px_rgba(25,24,55,0.6)]">
						<p className="mr-auto text-[14px] font-bold">{selected.size} selected</p>
						<button type="button" onClick={() => act([...selected], allHighlighted ? "unhighlight" : "highlight", allHighlighted ? "Taken out of highlights." : "Added to highlights.")} className="h-9 rounded-lg border border-white/25 px-3 text-[13px] font-semibold hover:bg-white/10">
							{allHighlighted ? "Remove from highlights" : "Add to highlights"}
						</button>
						<button type="button" onClick={() => act([...selected], allHidden ? "unhide" : "hide", allHidden ? "Guests can see them again." : "Hidden from guests.")} className="h-9 rounded-lg border border-white/25 px-3 text-[13px] font-semibold hover:bg-white/10">
							{allHidden ? "Show to guests" : "Hide from guests"}
						</button>
						<button
							type="button"
							onClick={async () => {
								for (const item of picked) await downloadFile(item);
							}}
							className="h-9 rounded-lg border border-white/25 px-3 text-[13px] font-semibold hover:bg-white/10"
						>
							Download
						</button>
						<button type="button" onClick={() => setDeleting([...selected])} className="h-9 rounded-lg px-3 text-[13px] font-semibold text-[#F2A7A7] hover:bg-white/10">
							Delete
						</button>
					</div>
				)}
			</section>

			<SettingsCard eventId={eventId} settings={first.settings} onSaved={refresh} />

			<Viewer
				eventId={eventId}
				items={items}
				index={viewing}
				total={first.total}
				onIndex={(next) => {
					setViewing(next);
					if (next !== null && next >= items.length - 3 && hasNextPage) fetchNextPage();
				}}
				onAction={(item, action) =>
					act([item.id], action, { highlight: "Added to highlights.", unhighlight: "Taken out of highlights.", hide: "Hidden from guests.", unhide: "Guests can see it again." }[action])
				}
				onDownload={downloadFile}
				onDelete={(item) => setDeleting([item.id])}
			/>
			<UploadPanel open={uploading} onClose={() => setUploading(false)} eventId={eventId} eventTitle={title} room={room} onUploaded={refresh} />
			<ConfirmDialog
				open={Boolean(deleting)}
				onOpenChange={(open) => !open && setDeleting(null)}
				title={deleting && deleting.length > 1 ? `Delete ${deleting.length} photos and videos?` : "Delete this from the album?"}
				text="They go for good, with their likes and comments. Guests won’t see them, and you can’t undo this."
				confirmLabel="Delete"
				icon={<Trash2 />}
				onConfirm={async () => {
					if (!deleting) return;
					await actOnAlbum(eventId, deleting, "delete");
					toast.success(deleting.length > 1 ? `${deleting.length} deleted.` : "Deleted.");
					setSelected(new Set());
					setViewing(null);
					refresh();
				}}
			/>
		</div>
	);
}
