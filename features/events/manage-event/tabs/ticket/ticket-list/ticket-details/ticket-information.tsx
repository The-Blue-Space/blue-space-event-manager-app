import { Badge } from "@/components/ui/badge";
import { EventTicket } from "@/types/event-ticket.types";
import classNames from "classnames";
import { Ticket, CheckCircle2, XCircle } from "lucide-react";

type TicketInformationProps = {
	ticket: EventTicket;
};

export default function TicketInformation({ ticket }: TicketInformationProps) {
	const getTypeBadgeColor = (type: EventTicket["type"]) => {
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

	const statusConfig = ticket.is_active
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
		ticket_name: ticket.name,
		ticket_type: (
			<Badge
				variant="outline"
				className={classNames(
					"body-3 flex items-center gap-1 border",
					getTypeBadgeColor(ticket.type)
				)}
			>
				{ticket.type === "free" ? "Free" : ticket.type === "donation" ? "Donation" : "Paid"}
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
		description: ticket.description || undefined,
		ticket_id: ticket.id,
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 text-neutral-900">
				<Ticket className="h-4 w-4 text-accent-500" />
				<h3 className="font-semibold text-sm">Ticket Information</h3>
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
				{ticket.perks.length > 0 && (
					<div className="pt-2 border-t border-neutral-200">
						<span className="body-3 text-neutral-600 block mb-2">Perks</span>
						<div className="flex flex-wrap gap-2">
							{ticket.perks.map((perk, idx) => (
								<Badge key={idx} variant="outline" className="text-xs">
									{perk}
								</Badge>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
