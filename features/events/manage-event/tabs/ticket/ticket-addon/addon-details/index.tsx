"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import AppDrawer from "@/components/app/app-drawer";
import AppButton from "@/components/app/app-button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { XCircle } from "lucide-react";
import getEventAddons from "@/services/events/event-addons/get-event-addons";
import getEventTickets from "@/services/events/event-tickets/get-event-tickets";
import AddonInformation from "./addon-information";
import PricingDetails from "./pricing-details";
import SalesDetails from "./sales-details";
import AttachedTickets from "./attached-tickets";
import { EventTicketAddon } from "@/types/event-ticket.types";

type AddonDetailsDrawerProps = {
	addonId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	eventId: string;
	onEdit: (addon: EventTicketAddon) => void;
	onToggleStatus: (addonId: string, isActive: boolean) => Promise<void>;
};

export default function AddonDetailsDrawer({
	addonId,
	open,
	onOpenChange,
	eventId,
	onEdit,
	onToggleStatus,
}: AddonDetailsDrawerProps) {
	const [isToggling, setIsToggling] = React.useState(false);

	const { data: addons, isLoading, error } = useQuery({
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

	const handleToggle = async () => {
		if (!addon) return;
		setIsToggling(true);
		try {
			await onToggleStatus(addon.id, !addon.is_active);
		} finally {
			setIsToggling(false);
		}
	};

	return (
		<AppDrawer
			title="Addon Details"
			open={open}
			direction="right"
			handleChange={onOpenChange}
			className="hide-scrollbar"
			showLogo={false}
			footer={
				addon ? (
					<div className="flex items-center justify-between border-t border-neutral-200 pt-2">
						<AppButton
							variant="outline"
							onClick={() => {
								onOpenChange(false);
								onEdit(addon);
							}}
						>
							Edit Addon
						</AppButton>
						<AppButton
							variant={addon.is_active ? "outline" : "primary"}
							isLoading={isToggling}
							onClick={handleToggle}
						>
							{addon.is_active ? "Deactivate" : "Activate"}
						</AppButton>
					</div>
				) : undefined
			}
		>
			{isLoading ? (
				<div className="space-y-6 p-6">
					<Skeleton className="h-28 w-full rounded-xl" />
					<Skeleton className="h-10 w-full rounded-lg" />
					<Skeleton className="h-24 w-full rounded-xl" />
					<Skeleton className="h-20 w-full rounded-xl" />
					<Skeleton className="h-24 w-full rounded-xl" />
				</div>
			) : error ? (
				<div className="flex flex-col items-center justify-center py-12 text-center px-6">
					<XCircle className="h-12 w-12 text-error-500 mb-4" />
					<p className="text-sm text-neutral-600">Failed to load addon details</p>
				</div>
			) : addon ? (
				<div className="space-y-6 p-6">
					<AddonInformation addon={addon} />
					<Separator />
					<PricingDetails addon={addon} />
					<Separator />
					<SalesDetails addon={addon} />
					<Separator />
					<AttachedTickets tickets={attachedTickets} />
				</div>
			) : null}
		</AppDrawer>
	);
}
