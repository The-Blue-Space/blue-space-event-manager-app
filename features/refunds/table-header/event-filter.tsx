import * as React from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { FilterFormProps } from "./use-refunds-filter";

type Props = FilterFormProps;

export default function EventFilter(props: Props) {
	const { formData, change, isLoading, events = [] } = props;

	return (
		<div className="flex flex-col gap-2">
			<label className="body-3 font-medium text-neutral-700">Event</label>
			<Select
				value={formData.event_id}
				onValueChange={(value) => change("event_id", value === "all" ? "" : value)}
				disabled={isLoading}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Select event" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All Events</SelectItem>
					{events.map((event) => (
						<SelectItem key={event.id} value={event.id}>
							{event.title}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
