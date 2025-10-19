/* eslint-disable @typescript-eslint/no-unused-vars */
import InfiniteScroll from "@/components/app/container/infinite-scroll";
import { getEvents } from "@/services/events";
import { Event, EventsFilterParams } from "@/types/event.types";
import { PaginatedResponse } from "@/types/global.types";
import * as React from "react";
import EmptyEvent from "./empty-event";

// Import all hybrid list item variants (only one is used at a time for testing)
import EventListItemHybridC from "./list-items/event-list-item-hybrid-c";

type EventsListViewProps = {
	filters: EventsFilterParams;
};

// 🔧 SWITCH BETWEEN HYBRID LIST STYLES HERE:
// Uncomment ONE of the following lines to test different hybrid designs:

// Hybrid A: Timeline + Compact Card (Large date badge, timeline connector, dense card)
// const ListItemComponent = EventListItemHybridA;

// Hybrid B: Mini Timeline + Dense Card (Small date badge, shorter connector, thumbnail top-left)
// const ListItemComponent = EventListItemHybridB;

// Hybrid C: Vertical Date Strip (Date as colored strip on left edge, modern look)
const ListItemComponent = EventListItemHybridC;

// Hybrid D: Floating Date Badge (Date badge overlaid on card, thumbnail aligned with title)
// const ListItemComponent = EventListItemHybridD;

export default React.memo(function EventsListView({ filters }: EventsListViewProps) {
	const fetchEvents = async (page: number): Promise<PaginatedResponse<Event>> => {
		return getEvents({ ...filters, page, limit: 10 });
	};

	const renderEvent = (event: Event) => {
		return <ListItemComponent key={event.id} event={event} />;
	};

	return (
		<InfiniteScroll<Event>
			queryKey={["events", "list", filters]}
			fetchData={fetchEvents}
			renderItem={renderEvent}
			emptyData={<EmptyEvent filters={filters} />}
			containerClassName="space-y-4 max-h-96 overflow-y-auto pr-1"
		/>
	);
});
