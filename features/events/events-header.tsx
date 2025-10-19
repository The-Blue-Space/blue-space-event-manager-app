import AppButton from "@/components/app/app-button";
import useCustomNavigation from "@/hooks/use-navigation";
import { CalendarPlus } from "lucide-react";
import * as React from "react";

export default React.memo(function EventsHeader() {
	const { navigate } = useCustomNavigation();

	const handleCreateEvent = () => {
		navigate("/events/create");
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
