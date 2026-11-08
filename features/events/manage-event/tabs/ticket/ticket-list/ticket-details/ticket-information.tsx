import { Badge } from "@/components/ui/badge";
import { EventTicket } from "@/types/event-ticket.types";
import { CheckCircle2, Copy, Check, XCircle } from "lucide-react";
import { ticketTypes } from "../../data";
import { cn } from "@/lib/utils";
import React from "react";

type TicketInformationProps = {
	ticket: EventTicket;
};

export default function TicketInformation({ ticket }: TicketInformationProps) {
	const [copied, setCopied] = React.useState(false);

	const ticketType = ticketTypes.find((t) => t.value === ticket.type);

	const statusConfig = ticket.is_active
		? {
				icon: <CheckCircle2 className="h-3.5 w-3.5" />,
				className: "bg-success-100 text-success-600 border-success-200",
				label: "Active",
		  }
		: {
				icon: <XCircle className="h-3.5 w-3.5" />,
				className: "bg-error-100 text-error-500 border-error-200",
				label: "Inactive",
		  };

	const copyId = () => {
		navigator.clipboard.writeText(ticket.id);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};

	const shortId = `${ticket.id.slice(0, 8)}…${ticket.id.slice(-4)}`;

	return (
		<div className="space-y-3">
			{/* ── Hero ── */}
			<div
				className={cn(
					"rounded-xl border p-4 space-y-3",
					ticket.type === "paid"
						? "border-green-200 bg-green-500/5"
						: ticket.type === "free"
						? "border-blue-200 bg-blue-500/5"
						: "border-purple-200 bg-purple-500/5"
				)}
			>
				{/* Type + Status row */}
				<div className="flex items-center gap-2 flex-wrap">
					{ticketType && (
						<span
							className={cn(
								"inline-flex items-center gap-1.5 body-3 font-medium rounded-full px-2.5 py-0.5 border",
								ticket.type === "paid"
									? "bg-green-500/10 text-green-700 border-green-500/20"
									: ticket.type === "free"
									? "bg-blue-500/10 text-blue-700 border-blue-500/20"
									: "bg-purple-500/10 text-purple-700 border-purple-500/20"
							)}
						>
							<span className="w-3.5 h-3.5 shrink-0">{ticketType.smallIcon}</span>
							{ticketType.name}
						</span>
					)}
					<Badge
						className={cn(
							"body-3 inline-flex items-center gap-1 border",
							statusConfig.className
						)}
					>
						{statusConfig.icon}
						{statusConfig.label}
					</Badge>
				</div>

				{/* Name */}
				<h2 className="text-lg font-bold text-neutral-900 leading-tight">{ticket.name}</h2>

				{/* Description */}
				{ticket.description && (
					<p className="body-3 text-neutral-500 leading-relaxed">{ticket.description}</p>
				)}
			</div>

			{/* ── Perks ── */}
			{ticket.perks.length > 0 && (
				<div className="space-y-2">
					<span className="body-3 font-medium text-neutral-500">Perks</span>
					<div className="flex flex-wrap gap-1.5">
						{ticket.perks.map((perk, idx) => (
							<span
								key={idx}
								className="inline-flex items-center body-3 bg-primary-500/8 text-primary-600 border border-primary-200 rounded-full px-2.5 py-0.5"
							>
								{perk}
							</span>
						))}
					</div>
				</div>
			)}

			{/* ── Ticket ID ── */}
			<div className="flex items-center justify-between px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-200">
				<span className="body-3 text-neutral-500">Ticket ID</span>
				<div className="flex items-center gap-2">
					<span className="body-3 font-mono text-neutral-700">{shortId}</span>
					<button
						type="button"
						onClick={copyId}
						className="flex items-center justify-center w-6 h-6 rounded hover:bg-neutral-200 transition-colors text-neutral-400 hover:text-neutral-700"
						aria-label="Copy ticket ID"
					>
						{copied ? (
							<Check className="w-3.5 h-3.5 text-success-500" />
						) : (
							<Copy className="w-3.5 h-3.5" />
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
