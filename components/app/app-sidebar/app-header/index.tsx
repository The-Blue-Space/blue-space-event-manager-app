import * as React from "react";
import Breadcrumbs from "./breadcrumbs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Notifications from "./notifications";
import UserIcon from "./user-icon";
import { CalendarPlus } from "lucide-react";
import useActions from "@/store/actions";
import AppButton from "../../app-button";

export default function AppHeader() {
	const { ui } = useActions();

	const createEvent = () => {
			ui.changeDialog({
				show: true,
				type: "create_event",
			});
	};

	return (
		<header className="">
			<div className="flex items-center justify-between h-full border-b p-2 lg:p-4 px-5 lg:px-10">
				<SidebarTrigger className="lg:hidden" />
				<Breadcrumbs />
				<div className="flex items-center justify-center gap-5">
					<AppButton
						variant="primary"
						className="flex gap-1 items-center text-white p-2 rounded-lg hover:text-white"
						onClick={createEvent}
						
					>
						<CalendarPlus className="size-4" />
						<span className="hidden lg:block text-nowrap">Create Event</span>
					</AppButton>
					<Notifications />
					<UserIcon />
				</div>
			</div>
		</header>
	);
}
