import * as React from "react";
import Breadcrumbs from "./breadcrumbs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Notifications from "./notifications";
import UserIcon from "./user-icon";
import { CalendarPlus } from "lucide-react";
import Link from "next/link";

export default function AppHeader() {
	return (
		<header className="">
			<div className="flex items-center justify-between h-full border-b p-2 lg:p-4 px-5 lg:px-10">
				<SidebarTrigger className="lg:hidden" />
				<Breadcrumbs />
				<div className="flex items-center justify-center gap-5">
					<Link
						href="/events/create"
						className="button-primary flex items-center gap-2  text-white p-2 rounded-lg hover:text-white"
					>
						<CalendarPlus className="size-4" />
						<span className="hidden lg:block text-nowrap">Create Event</span>
					</Link>
					<Notifications />
					<UserIcon />
				</div>
			</div>
		</header>
	);
}
