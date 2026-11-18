"use client";
import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import classNames from "classnames";
import {
	DndContext,
	DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowLeft, ArrowRight, GripVertical, ImageIcon, Info, MoreHorizontal, Plus, RefreshCw, Trash2, Video } from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/app/confirm-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvent } from "@/features/events/manage-event/context";
import { DashboardError } from "@/features/home/dashboard/states";
import ensureError from "@/lib/ensure-error";
import { listMedia, makeCover, removeMedia, reorderPhotos, replaceMediaFile } from "@/services/media";
import { EventMedia } from "@/types/event-media.types";
import { MAX_PHOTOS, PhotosPanel, VideoPanel, formatSize } from "./upload-panel";

const TIME_ZONE = "Africa/Lagos";
const shortDay = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: TIME_ZONE });
const addedOn = (iso: string) => shortDay.format(new Date(iso)).replace(",", "");
const duration = (seconds: number) => (seconds >= 60 ? `${Math.floor(seconds / 60)} min ${Math.round(seconds % 60)} s` : `${Math.round(seconds)} seconds`);

const menuItem = "flex h-9 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-[14px] font-semibold text-auth-ink focus:bg-auth-page";
const tileClass = "relative aspect-[3/2] overflow-hidden rounded-xl bg-auth-info-soft";
const secondaryButton =
	"inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-auth-field bg-white px-3.5 text-[14px] font-semibold text-auth-ink transition-colors duration-150 hover:border-auth-field-hover disabled:cursor-not-allowed disabled:border-auth-line disabled:text-[#8E8DB0]";

type PhotoActions = {
	onCover: (photo: EventMedia) => void;
	onReplace: (photo: EventMedia, file: File) => void;
	onMove: (photo: EventMedia, by: -1 | 1) => void;
	onRemove: (photo: EventMedia) => void;
};

function PhotoTile({ photo, index, count, actions, replacing }: { photo: EventMedia; index: number; count: number; actions: PhotoActions; replacing?: number }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id });
	const input = React.useRef<HTMLInputElement>(null);
	return (
		<li
			ref={setNodeRef}
			style={{ transform: CSS.Transform.toString(transform), transition }}
			className={classNames(tileClass, "group", isDragging && "z-10 shadow-[0_16px_40px_-16px_rgba(25,24,55,0.45)] ring-2 ring-primary-500")}
		>
			<Image src={photo.url} alt={`Photo ${index + 1}`} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
			<button
				type="button"
				{...attributes}
				{...listeners}
				aria-label={`Photo ${index + 1}. Drag to change the order`}
				className="absolute left-2 top-2 inline-flex h-7 cursor-grab items-center gap-1 rounded-full bg-[rgba(25,24,55,0.82)] px-2 text-[12px] font-bold text-white active:cursor-grabbing"
			>
				<GripVertical aria-hidden="true" className="size-3.5" />
				{index + 1}
			</button>
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger
					aria-label={`More actions for photo ${index + 1}`}
					className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white/95 text-auth-ink shadow-sm hover:bg-white data-[state=open]:bg-primary-500 data-[state=open]:text-white"
				>
					<MoreHorizontal aria-hidden="true" className="size-4" />
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="min-w-[200px] rounded-xl border-auth-line bg-white p-1.5 font-manrope shadow-[0_16px_40px_-16px_rgba(25,24,55,0.35)]">
					<DropdownMenuItem className={menuItem} onSelect={() => actions.onCover(photo)}>
						<ImageIcon aria-hidden="true" className="size-4 text-auth-muted" />
						Use as cover
					</DropdownMenuItem>
					<DropdownMenuItem className={menuItem} onSelect={() => input.current?.click()}>
						<RefreshCw aria-hidden="true" className="size-4 text-auth-muted" />
						Replace photo
					</DropdownMenuItem>
					{index > 0 && (
						<DropdownMenuItem className={menuItem} onSelect={() => actions.onMove(photo, -1)}>
							<ArrowLeft aria-hidden="true" className="size-4 text-auth-muted" />
							Move earlier
						</DropdownMenuItem>
					)}
					{index < count - 1 && (
						<DropdownMenuItem className={menuItem} onSelect={() => actions.onMove(photo, 1)}>
							<ArrowRight aria-hidden="true" className="size-4 text-auth-muted" />
							Move later
						</DropdownMenuItem>
					)}
					<DropdownMenuSeparator className="mx-1 my-1.5 bg-auth-line" />
					<DropdownMenuItem className={classNames(menuItem, "text-auth-error focus:text-auth-error")} onSelect={() => actions.onRemove(photo)}>
						<Trash2 aria-hidden="true" className="size-4" />
						Remove
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<input
				ref={input}
				type="file"
				hidden
				accept="image/jpeg,image/png,image/gif,image/webp"
				onChange={(e) => {
					const file = e.target.files?.[0];
					if (file) actions.onReplace(photo, file);
					e.target.value = "";
				}}
			/>
			{replacing !== undefined && (
				<div className="absolute inset-x-0 bottom-0 grid gap-1.5 bg-gradient-to-t from-[rgba(25,24,55,0.85)] to-transparent px-3 pb-3 pt-8">
					<span className="text-[12px] font-bold text-white">Uploading {replacing}%</span>
					<span className="h-1 overflow-hidden rounded-full bg-white/30">
						<span className="block h-full rounded-full bg-white" style={{ width: `${replacing}%` }} />
					</span>
				</div>
			)}
		</li>
	);
}

function VideoSection({ video, onAdd, onRemove }: { video?: EventMedia; onAdd: () => void; onRemove: () => void }) {
	const [seconds, setSeconds] = React.useState<number | null>(null);
	return (
		<section aria-labelledby="video-title" className="grid gap-4 border-t border-auth-line pt-8">
			<div className="grid gap-1">
				<h2 id="video-title" className="text-[18px] font-bold text-auth-ink">
					Video
				</h2>
				<p className="text-[14px] text-auth-muted">One short video about your event.</p>
			</div>
			{video ? (
				<div className="flex flex-wrap items-start gap-x-6 gap-y-4">
					<video
						src={video.url}
						controls
						preload="metadata"
						onLoadedMetadata={(e) => setSeconds(e.currentTarget.duration)}
						className="aspect-video w-full max-w-[576px] rounded-xl bg-[#191837] object-contain"
					/>
					<div className="grid min-w-[220px] flex-1 content-start gap-1">
						<p className="truncate text-[15px] font-bold text-auth-ink">{video.file_name}</p>
						<p className="text-[13px] text-auth-muted">
							{[formatSize(video.file_size), seconds && Number.isFinite(seconds) ? duration(seconds) : "", `added ${addedOn(video.created_at)}`].filter(Boolean).join(" · ")}
						</p>
						<div className="mt-3 flex flex-wrap items-center gap-3">
							<button type="button" onClick={onAdd} className={secondaryButton}>
								<RefreshCw aria-hidden="true" className="size-4" />
								Replace video
							</button>
							<button type="button" onClick={onRemove} className="px-2 text-[14px] font-semibold text-auth-error hover:text-auth-error-ink">
								Remove
							</button>
						</div>
					</div>
				</div>
			) : (
				<div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-xl border border-dashed border-auth-field px-5 py-[18px]">
					<div>
						<p className="text-[14px] font-bold text-auth-ink">No video yet</p>
						<p className="mt-0.5 text-[13px] text-auth-muted">MP4, MOV or WebM, up to 100 MB.</p>
					</div>
					<button type="button" onClick={onAdd} className={secondaryButton}>
						<Video aria-hidden="true" className="size-4" />
						Add a video
					</button>
				</div>
			)}
		</section>
	);
}

function MediaEmpty({ onPhotos, onVideo }: { onPhotos: () => void; onVideo: () => void }) {
	return (
		<section aria-labelledby="media-empty" className="flex flex-wrap items-center gap-x-9 gap-y-6 rounded-2xl border border-dashed border-auth-field bg-auth-page p-6 sm:p-8">
			<span aria-hidden="true" className="grid w-[184px] shrink-0 gap-2 rounded-2xl border border-auth-line bg-white p-3">
				<span className="grid h-14 place-items-center rounded-lg bg-auth-line text-primary-500">
					<ImageIcon className="size-4" />
				</span>
				<span className="h-1.5 w-3/4 rounded bg-auth-line" />
				<span className="h-1.5 w-1/2 rounded bg-auth-info-soft" />
				<span className="grid grid-cols-3 gap-1.5">
					{Array.from({ length: 6 }, (_, index) => (
						<span key={index} className="h-8 rounded bg-auth-info-soft" />
					))}
				</span>
				<span className="grid h-20 place-items-center rounded-lg bg-auth-info-soft text-primary-500">
					<span className="size-0 border-y-[6px] border-l-[9px] border-y-transparent border-l-current" />
				</span>
			</span>
			<div className="grid min-w-0 flex-[1_1_320px] justify-items-start gap-2">
				<h2 id="media-empty" className="text-[18px] font-bold text-auth-ink">
					Add photos and a video
				</h2>
				<p className="max-w-[56ch] text-[15px] text-auth-muted">Up to 6 photos and one short video that show what the night is like.</p>
				<div className="mt-2 flex flex-wrap gap-2">
					<button type="button" onClick={onPhotos} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-500 px-4 text-[14px] font-semibold text-white hover:bg-primary-600">
						<Plus aria-hidden="true" className="size-4" />
						Add photos
					</button>
					<button type="button" onClick={onVideo} className={secondaryButton}>
						<Video aria-hidden="true" className="size-4" />
						Add a video
					</button>
				</div>
			</div>
		</section>
	);
}

export default function MediaTab({ eventId }: { eventId: string }) {
	const { event } = useEvent();
	const router = useRouter();
	const queryClient = useQueryClient();
	const [panel, setPanel] = React.useState<"photos" | "video" | null>(null);
	const [removing, setRemoving] = React.useState<EventMedia | null>(null);
	const [replacing, setReplacing] = React.useState<Record<string, number>>({});
	const [order, setOrder] = React.useState<string[] | null>(null);

	const query = useQuery({ queryKey: ["event-media", eventId], queryFn: () => listMedia(eventId) });
	const refresh = React.useCallback(() => {
		for (const key of [["event-media", eventId], ["event-medias-cover", eventId], ["event-summary", eventId], ["event-details", eventId], ["manager-events"]]) {
			queryClient.invalidateQueries({ queryKey: key });
		}
	}, [eventId, queryClient]);

	const media = React.useMemo(() => query.data ?? [], [query.data]);
	const cover = media.find((item) => item.media_type === "cover");
	const video = media.find((item) => item.media_type === "video");
	const serverPhotos = React.useMemo(
		() => media.filter((item) => item.media_type === "image").sort((a, b) => a.order - b.order || a.created_at.localeCompare(b.created_at)),
		[media]
	);
	// While a new order saves, show it straight away.
	const photos = order ? (order.map((id) => serverPhotos.find((photo) => photo.id === id)).filter(Boolean) as EventMedia[]) : serverPhotos;
	React.useEffect(() => setOrder(null), [serverPhotos]);

	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

	const saveOrder = async (ids: string[]) => {
		setOrder(ids);
		try {
			await reorderPhotos(eventId, ids);
			refresh();
		} catch (error) {
			setOrder(null);
			toast.error(ensureError(error).message || "We couldn’t save the new order.");
		}
	};
	const onDragEnd = ({ active, over }: DragEndEvent) => {
		if (!over || active.id === over.id) return;
		const ids = photos.map((photo) => photo.id);
		saveOrder(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))));
	};

	const actions: PhotoActions = {
		onCover: async (photo) => {
			try {
				await makeCover(eventId, photo.id);
				toast.success(cover ? "That photo is the cover now. The old cover took its place." : "That photo is the cover now.");
				refresh();
			} catch (error) {
				toast.error(ensureError(error).message);
			}
		},
		onReplace: async (photo, file) => {
			setReplacing((current) => ({ ...current, [photo.id]: 0 }));
			try {
				await replaceMediaFile(eventId, photo.id, file, { onProgress: (percent) => setReplacing((current) => ({ ...current, [photo.id]: percent })) });
				toast.success("Photo replaced.");
				refresh();
			} catch (error) {
				toast.error(ensureError(error).message || "That photo didn’t upload. The old one is still there.");
			} finally {
				setReplacing((current) => {
					const next = { ...current };
					delete next[photo.id];
					return next;
				});
			}
		},
		onMove: (photo, by) => {
			const ids = photos.map((item) => item.id);
			const from = ids.indexOf(photo.id);
			saveOrder(arrayMove(ids, from, from + by));
		},
		onRemove: (photo) => setRemoving(photo),
	};

	if (query.isError) return <DashboardError onRetry={() => query.refetch()} isRetrying={query.isFetching} />;
	if (query.isLoading) {
		return (
			<div className="grid gap-4" aria-hidden="true">
				<Skeleton className="h-6 w-40" />
				<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
					{[0, 1, 2, 3].map((tile) => (
						<Skeleton key={tile} className="aspect-[3/2] rounded-xl" />
					))}
				</div>
			</div>
		);
	}

	const title = event?.title ?? "this event";
	const toDetails = () => router.push(`/events/${eventId}?tab=details#cover`);
	const full = photos.length >= MAX_PHOTOS;

	return (
		<div className="grid max-w-[1000px] grid-cols-[minmax(0,1fr)] gap-8">
			{!photos.length && !video ? (
				<MediaEmpty onPhotos={() => setPanel("photos")} onVideo={() => setPanel("video")} />
			) : (
				<>
					<section aria-labelledby="photos-title" className="grid gap-4">
						<div className="flex flex-wrap items-start justify-between gap-4">
							<div className="grid gap-1">
								<h2 id="photos-title" className="text-[18px] font-bold text-auth-ink">
									Photos <span className="font-medium text-auth-muted">{photos.length} of {MAX_PHOTOS}</span>
								</h2>
								<p className="text-[14px] text-auth-muted">Drag them into the order you want.</p>
							</div>
							<button type="button" onClick={() => setPanel("photos")} disabled={full} className={secondaryButton}>
								<Plus aria-hidden="true" className="size-4" />
								Add photos
							</button>
						</div>
						<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
							<SortableContext items={photos.map((photo) => photo.id)} strategy={rectSortingStrategy}>
								<ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
									{cover && (
										<li className={tileClass}>
											<Image src={cover.url} alt="Cover" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
											<span className="absolute left-2 top-2 inline-flex h-7 items-center rounded-full bg-[rgba(25,24,55,0.82)] px-2.5 text-[12px] font-bold text-white">Cover</span>
											<button
												type="button"
												onClick={toDetails}
												className="absolute bottom-2 left-2 inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-2.5 text-[13px] font-semibold text-auth-ink shadow-sm hover:bg-auth-page"
											>
												Change it in Details
												<ArrowRight aria-hidden="true" className="size-3.5" />
											</button>
										</li>
									)}
									{photos.map((photo, index) => (
										<PhotoTile key={photo.id} photo={photo} index={index} count={photos.length} actions={actions} replacing={replacing[photo.id]} />
									))}
									<li>
										{full ? (
											<div className="grid aspect-[3/2] place-content-center gap-1 rounded-xl border border-dashed border-auth-field px-4 text-center">
												<p className="text-[14px] font-bold text-auth-ink">All 6 photos added</p>
												<p className="text-[13px] text-auth-muted">Remove one to add another.</p>
											</div>
										) : (
											<button
												type="button"
												onClick={() => setPanel("photos")}
												className="grid aspect-[3/2] w-full place-content-center justify-items-center gap-2 rounded-xl border border-dashed border-auth-field text-[14px] font-semibold text-auth-link hover:border-primary-500 hover:bg-auth-page"
											>
												<Plus aria-hidden="true" className="size-5" />
												Add photos
											</button>
										)}
									</li>
								</ul>
							</SortableContext>
						</DndContext>
					</section>
					<VideoSection video={video} onAdd={() => setPanel("video")} onRemove={() => video && setRemoving(video)} />
				</>
			)}

			{!cover && (
				<p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-auth-muted">
					<Info aria-hidden="true" className="size-4" />
					No cover yet. It’s the first thing guests see, and you add it in Details.
					<button type="button" onClick={toDetails} className="font-semibold text-auth-link hover:text-primary-500">
						Add a cover
					</button>
				</p>
			)}

			<PhotosPanel open={panel === "photos"} onClose={() => setPanel(null)} eventId={eventId} eventTitle={title} onUploaded={refresh} photosNow={photos.length} />
			<VideoPanel open={panel === "video"} onClose={() => setPanel(null)} eventId={eventId} eventTitle={title} onUploaded={refresh} current={video} />
			<ConfirmDialog
				open={Boolean(removing)}
				onOpenChange={(open) => !open && setRemoving(null)}
				title={removing?.media_type === "video" ? "Remove the video?" : "Remove this photo?"}
				text={removing?.media_type === "video" ? "It comes off your event straight away. You can add another later." : "It comes off your event straight away, and the photos after it move up."}
				confirmLabel="Remove"
				icon={<Trash2 />}
				onConfirm={async () => {
					if (!removing) return;
					await removeMedia(eventId, removing.id);
					refresh();
				}}
			/>
		</div>
	);
}
