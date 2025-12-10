"use client";

import InfiniteScroll from "@/components/app/container/infinite-scroll";
import { getEventUploads } from "@/services/events/event-uploads";
import { EventUpload } from "@/types/event-upload.types";
import EmptyData from "@/components/app/empty-data";
import { Skeleton } from "@/components/ui/skeleton";
import MediaCard from "./media-card";

type MediaGridProps = {
	eventId: string;
	selectedMediaIds: string[];
	onToggleSelection: (mediaId: string) => void;
	onClickMedia: (media: EventUpload) => void;
	onSetHighlight: (mediaId: string, currentOrder: number) => void;
	onToggleVisibility: (mediaId: string, isActive: boolean) => void;
	onDelete: (mediaId: string) => void;
	showCheckbox: boolean;
};

export default function MediaGrid({
	eventId,
	selectedMediaIds,
	onToggleSelection,
	onClickMedia,
	onSetHighlight,
	onToggleVisibility,
	onDelete,
	showCheckbox,
}: MediaGridProps) {
	return (
		<InfiniteScroll<EventUpload>
			queryKey={["event-uploads", eventId]}
			fetchData={(page) => getEventUploads({ eventId, page, limit: 20 })}
			renderItem={(media) => (
				<MediaCard
					media={media}
					isSelected={selectedMediaIds.includes(media.id)}
					onSelect={() => onToggleSelection(media.id)}
					onClick={onClickMedia}
					onSetHighlight={() => onSetHighlight(media.id, media.order || 0)}
					onToggleVisibility={() => onToggleVisibility(media.id, media.is_active || false)}
					onDelete={() => onDelete(media.id)}
					showCheckbox={showCheckbox}
				/>
			)}
			emptyData={
				<EmptyData title="No Media Found" text="Upload media to see it here" className="py-12" />
			}
			containerClassName="grid grid-cols-2 md:grid-cols-4 gap-4"
			loadingComponent={<MediaGridSkeleton />}
		/>
	);
}

function MediaGridSkeleton() {
	return (
		<>
			{[1, 2, 3, 4].map((i) => (
				<div key={i} className="col-span-1">
					<Skeleton className="aspect-square rounded-lg" />
				</div>
			))}
		</>
	);
}
