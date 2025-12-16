import AppButton from "@/components/app/app-button";
import useActions from "@/store/actions";
import { CalendarPlus } from "lucide-react";
import * as React from "react";

export default React.memo(function EventsHeader() {
	const { ui } = useActions();

	const handleCreateEvent = () => {
		ui.changeDialog({
			show: true,
			type: "create_event",
		});
	};

	return (
		<div className="flex items-center justify-between gap-4">
			<div>
				<h1 className="heading-6 font-bold text-primary-500">All Events</h1>
				<p className="body-2 font-medium text-primary-500 mt-1">Manage and organize your events</p>
			</div>
			<AppButton
				variant="black"
				onClick={handleCreateEvent}
				className="hidden lg:flex"
				leftIcon={<CalendarPlus className="w-4 h-4" />}
			>
				<span className="">Create Event</span>

				{/* <span className="hidden sm:inline">Create Event</span> */}
			</AppButton>
		</div>
	);
});
