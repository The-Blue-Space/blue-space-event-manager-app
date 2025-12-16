"use client";

import { useQuery } from "@tanstack/react-query";
import AppDrawer from "@/components/app/app-drawer";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { XCircle } from "lucide-react";
import getEventAddons from "@/services/events/event-addons/get-event-addons";
import getEventTickets from "@/services/events/event-tickets/get-event-tickets";
import AddonInformation from "./addon-information";
import PricingDetails from "./pricing-details";
import SalesDetails from "./sales-details";
import AttachedTickets from "./attached-tickets";

type AddonDetailsDrawerProps = {
	addonId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	eventId: string;
};

export default function AddonDetailsDrawer({
	addonId,
	open,
	onOpenChange,
	eventId,
}: AddonDetailsDrawerProps) {
	const {
		data: addons,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["event-addons", eventId],
		queryFn: () => getEventAddons({ event_Id: eventId }),
		enabled: !!eventId && open,
	});

	const { data: tickets = [] } = useQuery({
		queryKey: ["event-tickets", eventId],
		queryFn: () => getEventTickets({ event_Id: eventId }),
		enabled: !!eventId && open,
	});

	const addon = addons?.find((a) => a.id === addonId);
	const attachedTickets = addon?.ticket_ids
		? tickets.filter((t) => addon.ticket_ids?.includes(t.id))
		: [];

	return (
		<AppDrawer
			title="Addon Details"
			open={open}
			direction="right"
			handleChange={onOpenChange}
			className="hide-scrollbar"
			showLogo={false}
		>
			{isLoading ? (
				<div className="space-y-6 p-6">
					<Skeleton className="h-24 w-full" />
					<Skeleton className="h-32 w-full" />
					<Skeleton className="h-32 w-full" />
					<Skeleton className="h-24 w-full" />
				</div>
			) : error ? (
				<div className="flex flex-col items-center justify-center py-12 text-center px-6">
					<XCircle className="h-12 w-12 text-error-500 mb-4" />
					<p className="text-sm text-neutral-600">Failed to load addon details</p>
				</div>
			) : addon ? (
				<div className="space-y-6 p-6">
					{/* Addon Information */}
					<AddonInformation addon={addon} />
					<Separator />

					{/* Pricing Details */}
					<PricingDetails addon={addon} />
					<Separator />

					{/* Sales Details */}
					<SalesDetails addon={addon} />
					<Separator />

					{/* Attached Tickets */}
					<AttachedTickets tickets={attachedTickets} />
				</div>
			) : null}
		</AppDrawer>
	);
}
