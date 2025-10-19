import InfiniteScroll from "@/components/app/container/infinite-scroll";
import { getEvents } from "@/services/events";
import { Event, EventsFilterParams } from "@/types/event.types";
import { PaginatedResponse } from "@/types/global.types";
import * as React from "react";
import EventCard from "../event-card";
import EmptyEvent from "./empty-event";

type EventsCardsViewProps = {
	filters: EventsFilterParams;
};

export default React.memo(function EventsCardsView({ filters }: EventsCardsViewProps) {
	const fetchEvents = async (page: number): Promise<PaginatedResponse<Event>> => {
		return getEvents({ ...filters, page, limit: 10 });
	};

	return (
		<InfiniteScroll<Event>
			queryKey={["events", "cards", filters]}
			fetchData={fetchEvents}
			renderItem={(event) => <EventCard key={event.id} event={event} />}
			emptyData={<EmptyEvent filters={filters} />}
			containerClassName="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
		/>
	);
});
