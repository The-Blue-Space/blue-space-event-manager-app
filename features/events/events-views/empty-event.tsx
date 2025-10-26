import AppButton from "@/components/app/app-button";
import EmptyData from "@/components/app/empty-data";
import useCustomNavigation from "@/hooks/use-navigation";
import useActions from "@/store/actions";

import { CalendarPlus2 } from "lucide-react";
import React from "react";

type Props = {
	filters: Record<string, any>;
};

export default function EmptyEvent({ filters }: Props) {
	const { navigate } = useCustomNavigation();
	const { ui } = useActions();

	const createEvent = () => {
		ui.changeDialog({
			show: true,
			type: "create_event",
		});
	};
	const hasFilters = React.useMemo(() => {
		return Object.values(filters).some((value) => value !== undefined && value !== "");
	}, [filters]);
	return (
		<EmptyData
			title="No events found"
			text={
				hasFilters
					? "Try adjusting your filters or create a new event"
					: "No events found, create a new event"
			}
			iconType="event"
			action={
				<div>
					{hasFilters ? (
						<AppButton variant="muted" onClick={() => navigate("?")}>
							Reset Filters
						</AppButton>
					) : (
						<AppButton
							variant="black"
							onClick={createEvent}
							leftIcon={<CalendarPlus2 className="w-4 h-4" />}
						>
							Create Event
						</AppButton>
					)}
				</div>
			}
		/>
	);
}
