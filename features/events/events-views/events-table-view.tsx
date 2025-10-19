import Pagination from "@/components/app/pagination";
import Render from "@/components/app/render";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import useCustomNavigation from "@/hooks/use-navigation";
import { getEvents } from "@/services/events";
import { EventsFilterParams } from "@/types/event.types";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import EventActions from "../event-card/event-actions";
import EmptyEvent from "./empty-event";

type EventsTableViewProps = {
	filters: EventsFilterParams;
};

export default React.memo(function EventsTableView({ filters }: EventsTableViewProps) {
	const { queryParams } = useCustomNavigation();

	const page = parseInt(queryParams.get("page") || "1");

	const {
		data: response,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["events", "table", filters, page],
		queryFn: () => getEvents({ ...filters, page, limit: 10 }),
	});

	const formatDate = (dateString?: string | null) => {
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	return (
		<div className="space-y-">
			<Render isLoading={isLoading} isError={isError} error={error}>
				{response && response.docs.length > 0 ? (
					<>
						<div className="border rounded-lg overflow-hidden">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-16">Image</TableHead>
										<TableHead>Title</TableHead>
										<TableHead>Date</TableHead>
										<TableHead>Location</TableHead>
										<TableHead className="text-center">Type</TableHead>
										<TableHead className="text-center">Status</TableHead>
										<TableHead className="text-right">Participants</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{response.docs.map((event) => {
										const coverImage = event.event_media?.find(
											(media) => media.media_type === "cover"
										)?.url;

										return (
											<TableRow
												key={event.id}
												className="hover:bg-neutral-50"
												// onClick={() => navigate(`/events/${event.id}`)}
											>
												<TableCell>
													<div className="relative w-12 h-12 bg-neutral-200 rounded overflow-hidden">
														{coverImage ? (
															<Image
																src={coverImage}
																alt={event.title}
																fill
																className="object-cover"
															/>
														) : (
															<div className="w-full h-full flex items-center justify-center text-neutral-400">
																<Calendar className="w-5 h-5" />
															</div>
														)}
													</div>
												</TableCell>
												<TableCell className="font-medium">
													<div className="max-w-xs">
														<p className="line-clamp-1">{event.title}</p>
														{event.event_category && (
															<Badge
																variant="outline"
																className="mt-1 bg-accent-50 text-accent-700 border-accent-200 text-xs"
															>
																{event.event_category.name}
															</Badge>
														)}
													</div>
												</TableCell>
												<TableCell className="text-sm text-neutral-600">
													{formatDate(event.event_start_date)}
												</TableCell>
												<TableCell className="text-sm text-neutral-600">
													<div className="max-w-xs line-clamp-1">{event.city}</div>
												</TableCell>
												<TableCell className="text-center">
													<Badge variant="outline" className="capitalize text-xs">
														{event.access_type.replace("-", " ")}
													</Badge>
												</TableCell>
												<TableCell className="text-center">
													<Badge
														variant={event.published ? "default" : "secondary"}
														className={
															event.published
																? "bg-green-500 hover:bg-green-600 text-white text-xs"
																: "bg-orange-500 hover:bg-orange-600 text-white text-xs"
														}
													>
														{event.published ? "Published" : "Unpublished"}
													</Badge>
												</TableCell>
												<TableCell className="text-right font-medium">
													{(event.total_participants || 0).toLocaleString()}
												</TableCell>
												<TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
													<div className="flex justify-end">
														<EventActions eventId={event.id} eventTitle={event.title} isTableView />
													</div>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
							{/* Pagination */}
							<Pagination {...response} />
						</div>
					</>
				) : (
					<EmptyEvent filters={filters} />
				)}
			</Render>
		</div>
	);
});
