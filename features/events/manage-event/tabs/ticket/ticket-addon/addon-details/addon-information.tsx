import { Badge } from "@/components/ui/badge";
import { EventTicketAddon } from "@/types/event-ticket.types";
import { CheckCircle2, Copy, Check, XCircle, Link2, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

type AddonInformationProps = {
	addon: EventTicketAddon;
};

export default function AddonInformation({ addon }: AddonInformationProps) {
	const [copied, setCopied] = React.useState(false);

	const typeColors = {
		paid: {
			border: "border-green-200",
			bg: "bg-green-500/5",
			badge: "bg-green-500/10 text-green-700 border-green-500/20",
		},
		free: {
			border: "border-blue-200",
			bg: "bg-blue-500/5",
			badge: "bg-blue-500/10 text-blue-700 border-blue-500/20",
		},
		donation: {
			border: "border-purple-200",
			bg: "bg-purple-500/5",
			badge: "bg-purple-500/10 text-purple-700 border-purple-500/20",
		},
	};

	const colors = typeColors[addon.type as keyof typeof typeColors] ?? typeColors.free;

	const statusConfig = addon.is_active
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

	const isStandalone = !addon.ticket_ids || addon.ticket_ids.length === 0;

	const copyId = () => {
		navigator.clipboard.writeText(addon.id);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};

	const shortId = `${addon.id.slice(0, 8)}…${addon.id.slice(-4)}`;

	return (
		<div className="space-y-3">
			{/* Hero */}
			<div className={cn("rounded-xl border p-4 space-y-3", colors.border, colors.bg)}>
				<div className="flex items-center gap-2 flex-wrap">
					<span
						className={cn(
							"inline-flex items-center gap-1.5 body-3 font-medium rounded-full px-2.5 py-0.5 border",
							colors.badge
						)}
					>
						<Package className="w-3 h-3" />
						{addon.type.charAt(0).toUpperCase() + addon.type.slice(1)}
					</span>
					<Badge
						className={cn(
							"body-3 inline-flex items-center gap-1 border",
							statusConfig.className
						)}
					>
						{statusConfig.icon}
						{statusConfig.label}
					</Badge>
					<span
						className={cn(
							"inline-flex items-center gap-1 body-3 font-medium rounded-full px-2.5 py-0.5 border ml-auto",
							isStandalone
								? "bg-neutral-100 text-neutral-500 border-neutral-200"
								: "bg-primary-500/8 text-primary-600 border-primary-200"
						)}
					>
						<Link2 className="w-3 h-3" />
						{isStandalone ? "Standalone" : `${addon.ticket_ids!.length} ticket${addon.ticket_ids!.length > 1 ? "s" : ""}`}
					</span>
				</div>

				<h2 className="text-lg font-bold text-neutral-900 leading-tight">{addon.name}</h2>

				{addon.description && (
					<p className="body-3 text-neutral-500 leading-relaxed">{addon.description}</p>
				)}
			</div>

			{/* Addon ID */}
			<div className="flex items-center justify-between px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-200">
				<span className="body-3 text-neutral-500">Addon ID</span>
				<div className="flex items-center gap-2">
					<span className="body-3 font-mono text-neutral-700">{shortId}</span>
					<button
						type="button"
						onClick={copyId}
						className="flex items-center justify-center w-6 h-6 rounded hover:bg-neutral-200 transition-colors text-neutral-400 hover:text-neutral-700"
						aria-label="Copy addon ID"
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
