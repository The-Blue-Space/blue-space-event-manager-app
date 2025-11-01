import { Badge } from "@/components/ui/badge";
import { EventTicketAddon } from "@/types/event-ticket.types";
import classNames from "classnames";
import { Package, CheckCircle2, XCircle } from "lucide-react";

type AddonInformationProps = {
	addon: EventTicketAddon;
};

export default function AddonInformation({ addon }: AddonInformationProps) {
	const getTypeBadgeColor = (type: EventTicketAddon["type"]) => {
		switch (type) {
			case "paid":
				return "bg-green-500/10 text-green-700 border-green-500/20";
			case "free":
				return "bg-blue-500/10 text-blue-700 border-blue-500/20";
			case "donation":
				return "bg-purple-500/10 text-purple-700 border-purple-500/20";
			default:
				return "bg-neutral-500/10 text-neutral-700 border-neutral-500/20";
		}
	};

	const statusConfig = addon.is_active
		? {
				icon: <CheckCircle2 className="h-4 w-4" />,
				className: "bg-success-100 text-success-500 border-success-200",
				label: "Active",
		  }
		: {
				icon: <XCircle className="h-4 w-4" />,
				className: "bg-error-100 text-error-500 border-error-200",
				label: "Inactive",
		  };

	const info = {
		addon_name: addon.name,
		addon_type: (
			<Badge
				variant="outline"
				className={classNames(
					"body-3 flex items-center gap-1 border",
					getTypeBadgeColor(addon.type)
				)}
			>
				{addon.type === "free" ? "Free" : addon.type === "donation" ? "Donation" : "Paid"}
			</Badge>
		),
		status: (
			<Badge
				className={classNames("body-3 flex items-center gap-1 border", statusConfig.className)}
			>
				{statusConfig.icon}
				{statusConfig.label}
			</Badge>
		),
		description: addon.description || undefined,
		addon_id: addon.id,
		attachment_type:
			addon.ticket_ids && addon.ticket_ids.length > 0 ? "Attached to Tickets" : "Standalone Addon",
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 text-neutral-900">
				<Package className="h-4 w-4 text-accent-500" />
				<h3 className="font-semibold text-sm">Addon Information</h3>
			</div>
			<div className="bg-neutral-50 rounded-lg p-4 space-y-3">
				{Object.entries(info)
					.filter((item) => item[1] !== undefined && item[1] !== null)
					.map(([key, value]) => (
						<div className="flex items-center justify-between" key={key}>
							<span className="body-3 text-neutral-600 capitalize">{key.split("_").join(" ")}</span>
							{typeof value === "string" ? (
								<span className="body-3 font-medium text-neutral-900 max-w-[60%] text-right break-words">
									{value}
								</span>
							) : (
								<span>{value}</span>
							)}
						</div>
					))}
			</div>
		</div>
	);
}
