"use client";

import { UserTicket } from "@/types/user-ticket.types";
import { Badge } from "@/components/ui/badge";
import useAppSelector from "@/store/hooks";
import { amountSeparator } from "@/lib/amount-separator";
import Image from "next/image";
import capitalize from "@/lib/capitalize";
import { Ticket } from "lucide-react";

type TicketInformationProps = {
	ticket: UserTicket;
};

export default function TicketInformation({ ticket }: TicketInformationProps) {
	const { activeCurrency } = useAppSelector("init");
	const currency = activeCurrency?.symbol;

	const info = [
		{ label: "Ticket Type", value: ticket.ticket?.name || "N/A" },
		{ label: "Ticket Code", value: ticket.ticket_code || "N/A" },
		{
			label: "Price",
			value: ticket.ticket?.price
				? `${currency}${amountSeparator(ticket.ticket.price)}`
				: capitalize(ticket.ticket?.type ?? ""),
		},
		{
			label: "Status",
			value: (
				<Badge
					variant="outline"
					className={
						ticket.ticket_status === "paid"
							? "bg-success-100 text-success-500 border-success-200"
							: ticket.ticket_status === "pending"
							? "bg-warning-100 text-warning-500 border-warning-200"
							: "bg-error-100 text-error-500 border-error-200"
					}
				>
					{ticket.ticket_status === "failed" ? "Revoked" : ticket.ticket_status}
				</Badge>
			),
		},
	];

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<Ticket className="w-5 h-5 text-accent-500" />
				<h3 className="body-1 font-semibold text-neutral-900">Ticket Information</h3>
			</div>

			<div className="space-y-3 bg-neutral-50 p-4 rounded-lg">
				{/* QR Code */}
				{ticket.qr_code && (
					<div className="flex justify-center p-4 bg-neutral-50 rounded-lg">
						<Image
							src={ticket.qr_code}
							alt="Ticket QR Code"
							width={200}
							height={200}
							className="rounded"
						/>
					</div>
				)}

				{/* Ticket Details */}
				<div className="space-y-3">
					{info.map((item, index) => (
						<div key={index} className="flex justify-between items-start">
							<span className="text-sm text-neutral-500">{item.label}</span>
							<span className="text-sm font-medium text-neutral-900 text-right">
								{typeof item.value === "string" ? item.value : item.value}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
