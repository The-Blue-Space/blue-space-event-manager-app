import EmptyData from "@/components/app/empty-data";
import Render from "@/components/app/render";
import useCustomNavigation from "@/hooks/use-navigation";
import getEventAddons from "@/services/events/event-addons/get-event-addons";
import getEventTickets from "@/services/events/event-tickets/get-event-tickets";
import deleteEventAddon from "@/services/events/event-addons/delete-event-addon";
import toggleAddonStatus from "@/services/events/event-addons/toggle-addon-status";
import useActions from "@/store/actions";
import { useQuery } from "@tanstack/react-query";
import { EventTicketAddon } from "@/types/event-ticket.types";
import { toast } from "sonner";
import ensureError from "@/lib/ensure-error";
import invalidateQuery from "@/lib/invalidate-query";
import AddonsTable from "./addons-table";
import AddonDetailsDrawer from "./addon-details";
import { useState } from "react";

export default function AddonList() {
	const { params } = useCustomNavigation();
	const { ui } = useActions();
	const event_id = params.event_id as string;
	const [selectedAddonId, setSelectedAddonId] = useState<string | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const {
		data: addons = [],
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["event-addons", event_id],
		queryFn: () => getEventAddons({ event_Id: event_id }),
		enabled: !!event_id,
	});

	const { data: tickets = [] } = useQuery({
		queryKey: ["event-tickets", event_id],
		queryFn: () => getEventTickets({ event_Id: event_id }),
		enabled: !!event_id,
	});

	const handleEditAddon = (addon: EventTicketAddon) => {
		ui.changeDialog({
			show: true,
			type: "edit_event_addon",
			data: addon,
		});
	};

	const handleDeleteAddon = async (addonId: string) => {
		try {
			await deleteEventAddon({ id: addonId });
			toast.success("Addon deleted successfully");
			invalidateQuery(["event-addons"]);
		} catch (err) {
			const errMsg = ensureError(err).message;
			toast.error(errMsg);
		}
	};

	const handleViewAddon = (addonId: string) => {
		setSelectedAddonId(addonId);
		setDrawerOpen(true);
	};

	const handleToggleStatus = async (addonId: string, isActive: boolean) => {
		try {
			await toggleAddonStatus({
				id: addonId,
				is_active: isActive,
			});
			toast.success(`Addon ${isActive ? "activated" : "deactivated"} successfully`);
			invalidateQuery(["event-addons"]);
		} catch (err) {
			const errMsg = ensureError(err).message;
			toast.error(errMsg);
		}
	};

	return (
		<div>
			<Render isLoading={isLoading} isError={isError} error={error}>
				{addons && addons.length > 0 ? (
					<div className="w-full max-h-screen overflow-y-auto rounded-lg border border-neutral-200">
						<AddonsTable
							data={addons}
							tickets={tickets}
							isEmpty={false}
							onViewDetails={handleViewAddon}
							onEdit={handleEditAddon}
							onToggleStatus={handleToggleStatus}
							onDelete={handleDeleteAddon}
						/>
					</div>
				) : (
					<EmptyData
						showIcon={false}
						text="Create addons to sell additional items or services. Click Add Addon to get started."
					/>
				)}
			</Render>

			{/* Addon Details Drawer */}
			<AddonDetailsDrawer
				addonId={selectedAddonId}
				open={drawerOpen}
				onOpenChange={setDrawerOpen}
				eventId={event_id}
			/>
		</div>
	);
}
