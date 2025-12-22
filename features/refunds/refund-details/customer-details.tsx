"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Refund } from "@/types/refund.types";

type Props = {
	refund: Refund;
};

export default function CustomerDetails({ refund }: Props) {
	const user = refund.user;
	const requestedBy = refund.requested_by;

	const getInitials = (name?: string) => {
		if (!name) return "?";
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<div className="space-y-4">
			<h3 className="body-1 font-semibold text-neutral-900">Customer Information</h3>

			{user && (
				<div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
					<Avatar className="h-10 w-10">
						<AvatarImage src={user.avatar_url || undefined} alt={user.name || ""} />
						<AvatarFallback className="bg-primary-100 text-primary-600 text-sm font-medium">
							{getInitials(user.name)}
						</AvatarFallback>
					</Avatar>
					<div className="flex-1 min-w-0">
						<p className="body-2 font-medium text-neutral-900 truncate">{user.name}</p>
						<p className="body-3 text-neutral-500 truncate">{user.email}</p>
						{user.phone && (
							<p className="body-3 text-neutral-500">{user.phone}</p>
						)}
					</div>
				</div>
			)}

			{requestedBy && requestedBy.id !== user?.id && (
				<div>
					<p className="body-3 text-neutral-500 mb-2">Requested By</p>
					<div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
						<Avatar className="h-8 w-8">
							<AvatarFallback className="bg-neutral-200 text-neutral-600 text-xs font-medium">
								{getInitials(requestedBy.name)}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0">
							<p className="body-3 font-medium text-neutral-900 truncate">{requestedBy.name}</p>
							<p className="body-3 text-neutral-500 truncate">{requestedBy.email}</p>
						</div>
					</div>
				</div>
			)}

			{refund.ticket_payment && (
				<div>
					<p className="body-3 text-neutral-500">Payment Reference</p>
					<p className="body-2 font-medium text-neutral-900 font-mono">
						{refund.ticket_payment.payment_reference || refund.ticket_payment.id}
					</p>
				</div>
			)}

			{refund.vendor_payment && (
				<div>
					<p className="body-3 text-neutral-500">Vendor Payment Reference</p>
					<p className="body-2 font-medium text-neutral-900 font-mono">
						{refund.vendor_payment.paystack_reference || refund.vendor_payment.id}
					</p>
				</div>
			)}
		</div>
	);
}
