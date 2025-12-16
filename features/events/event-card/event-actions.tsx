import AppButton from "@/components/app/app-button";
import AppDropdown from "@/components/app/app-dropdown";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import useActions from "@/store/actions";
import { Copy, Eye, MoreVertical, Settings, Trash2 } from "lucide-react";
import * as React from "react";
import useCustomNavigation from "@/hooks/use-navigation";
import { deleteEvent } from "@/services/events";
import invalidateQuery from "@/lib/invalidate-query";
import { toast } from "sonner";
import ensureError from "@/lib/ensure-error";
import AppTooltip from "@/components/app/app-tooltip";
import { cn } from "@/lib/utils";

type EventActionsProps = {
	eventId: string;
	eventTitle: string;
	isTableView?: boolean;
	isListView?: boolean;
};

export default React.memo(function EventActions({
	eventId,
	eventTitle,
	isTableView,
	isListView,
}: EventActionsProps) {
	const { ui } = useActions();

	const { navigate } = useCustomNavigation();
	const handleManage = (e: React.MouseEvent) => {
		e.stopPropagation();
		navigate(`/events/${eventId}/manage`);
	};

	const handleView = (e: React.MouseEvent) => {
		e.stopPropagation();
		navigate(`/events/${eventId}`);
	};

	const handleDuplicate = (e: React.MouseEvent) => {
		e.stopPropagation();
		ui.changeDialog({
			show: true,
			type: "duplicate_event",
			data: { eventId, eventTitle },
		});
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		ui.changeDialog({
			show: true,
			type: "delete_dialog",
			staticData: {
				title: "Delete Event",
				text: `Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`,
				showTitle: true,
				showText: true,
				showActionButton: true,
				showDismissButton: true,
				actionButtonText: "Delete",
				dismissButtonText: "Cancel",
				actionButtonVariant: "destructive",
				dismissAfterAction: true,
			},
			action: async () => {
				try {
					await deleteEvent({ eventId: eventId });

					invalidateQuery(["events", "events-overview"]);
					toast.success("Event deleted successfully!");
				} catch (error) {
					const errMsg = ensureError(error).message;
					toast.error(errMsg || "Failed to delete event");
				}
			},
		});
	};

	const actions = [
		{
			text: "View",
			icon: (
				<Eye
					className={cn("w-4 h-4", {
						"text-neutral-500": isListView,
						"text-white": !isListView,
					})}
				/>
			),
			action: handleView,
			hide: !isListView,
		},
		{
			text: "Manage",
			icon: (
				<Settings
					className={cn("w-4 h-4", {
						"text-neutral-500": isListView,
						"text-white": !isListView,
					})}
				/>
			),
			action: handleManage,
		},
		{
			text: "Duplicate",
			icon: (
				<Copy
					className={cn("w-4 h-4", {
						"text-neutral-500": isListView,
						"text-white": !isListView,
					})}
				/>
			),
			action: handleDuplicate,
		},
		{
			text: "Delete",
			icon: (
				<Trash2
					className={cn("w-4 h-4", {
						"text-error-500": isListView,
						"text-white": !isListView,
					})}
				/>
			),
			action: handleDelete,
		},
	];

	if (isTableView) {
		return (
			<AppDropdown
				trigger={
					<button onClick={(e) => e.stopPropagation()} className="!w-fit  transition-colors">
						<MoreVertical className="w-5 h-5" />
					</button>
				}
				contentStyle="!w-fit  "
				position="bottom"
				align="end"
				modal
			>
				<DropdownMenuItem onClick={handleManage} className="gap-2 cursor-pointer">
					<Settings className="w-4 h-4" />
					<span>Manage</span>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={handleDuplicate} className="gap-2 cursor-pointer">
					<Copy className="w-4 h-4" />
					<span>Duplicate</span>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={handleDelete} className="gap-2 cursor-pointer text-error-500">
					<Trash2 className="w-4 h-4" />
					<span>Delete</span>
				</DropdownMenuItem>
			</AppDropdown>
		);
	}

	if (isListView) {
		return (
			<div
				className="hidden lg:flex gap-4 
			
			"
			>
				{actions.map((item) => (
					<AppButton
						key={item.text}
						variant="ghost"
						buttonType="icon"
						onClick={item.action}
						className=""
					>
						<AppTooltip trigger={item.icon} side="top">
							{item.text}
						</AppTooltip>
					</AppButton>
				))}
			</div>
		);
	}

	return (
		<div className="absolute top-3 right-3 lg:right-3 z-10">
			{/* // Mobile: 3-dot dropdown */}
			<AppDropdown
				trigger={
					<button
						onClick={(e) => e.stopPropagation()}
						className="lg:hidden  p-2 rounded-lg bg-black/25 border border-neutral-400 !w-fit  transition-colors"
					>
						<MoreVertical className="w-4 h-4 text-neutral-100" />
					</button>
				}
				contentStyle="!w-fit lg:hidden "
				position="bottom"
				align="end"
				modal
			>
				<DropdownMenuItem onClick={handleManage} className="gap-2 cursor-pointer">
					<Settings className="w-4 h-4" />
					<span>Manage</span>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={handleDuplicate} className="gap-2 cursor-pointer">
					<Copy className="w-4 h-4" />
					<span>Duplicate</span>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={handleDelete} className="gap-2 cursor-pointer text-error-500">
					<Trash2 className="w-4 h-4" />
					<span>Delete</span>
				</DropdownMenuItem>
			</AppDropdown>

			{/* // Desktop: Hover buttons */}
			<div
				className="hidden lg:flex gap-2 flex-col bg-black/25 border border-neutral-400 rounded-lg p-2 [&_button]:text-white
			 translate-x-[100%] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200 ease-in-out delay-300
			"
			>
				{actions.filter((item) => !item.hide).map((item) => (
					<AppButton
						key={item.text}
						variant="ghost"
						buttonType="icon"
						onClick={item.action}
						className=""
					>
						<AppTooltip trigger={item.icon} side="left">
							{item.text}
						</AppTooltip>
					</AppButton>
				))}
			</div>
		</div>
	);
});
