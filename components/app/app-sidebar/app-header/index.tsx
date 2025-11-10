import * as React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Notifications from "./notifications";
import UserIcon from "./user-icon";
import { CalendarPlus } from "lucide-react";
import useActions from "@/store/actions";
import AppButton from "../../app-button";
import AppLogo from "../../app-logo";

export default function AppHeader() {
	const { ui } = useActions();

	const createEvent = () => {
		ui.changeDialog({
			show: true,
			type: "create_event",
		});
	};

	return (
		<header className="bg-white xl:shadow-sm">
			<div className="flex items-center justify-between h-full border-b p-2 xl:p-4 px-5 xl:py-3 xl:px-10 xl:pl-5">
				<AppLogo scope="logo_blue" size={40} className="hidden xl:block" />
				<SidebarTrigger className="lg:hidden" />
				{/* <Breadcrumbs /> */}
				<div className="flex items-center justify-center gap-5">
					<AppButton
						variant="primary"
						buttonType="icon"
						className="flex gap-1 items-center text-white p-2 rounded-lg hover:text-white w-fit"
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
