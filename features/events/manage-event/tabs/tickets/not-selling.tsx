"use client";
import * as React from "react";
import { toast } from "sonner";
import ensureError from "@/lib/ensure-error";
import updateEventAccessType from "@/services/events/update-event-access-type";
import { EventAccessType } from "@/types/event-summary.types";
import { outlineButton } from "./ui";

const HOW_GUESTS_GET_IN: Record<Exclude<EventAccessType, "ticket-based">, string> = {
	general: "Guests get in with one code for everyone.",
	individual: "Every guest gets their own code, and you approve who joins.",
	none: "There are no tickets or codes. Anyone can join.",
};

type NotSellingProps = {
	eventId: string;
	accessType: Exclude<EventAccessType, "ticket-based">;
	published: boolean;
	onGuests: () => void;
	onChanged: () => void;
};

/** The Tickets tab of an event that lets guests in another way. */
export default function NotSelling({ eventId, accessType, published, onGuests, onChanged }: NotSellingProps) {
	const [isSaving, setIsSaving] = React.useState(false);

	const sellTickets = async () => {
		setIsSaving(true);
		try {
			await updateEventAccessType({ event_id: eventId, access_type: "ticket-based" });
			toast.success("This event sells tickets now. Add your first ticket type.");
			onChanged();
		} catch (error) {
			toast.error(ensureError(error).message);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<section
			aria-labelledby="no-tickets"
			className="mt-4 grid max-w-[620px] justify-items-start gap-3.5 rounded-[14px] border border-auth-line p-7 max-sm:p-5"
		>
			<div>
				<h2 id="no-tickets" className="text-[18px] font-bold text-auth-ink">
					This event doesn’t sell tickets
				</h2>
				<p className="mt-1.5 text-[15px] leading-[1.55] text-auth-muted">
					{HOW_GUESTS_GET_IN[accessType]} See who has joined on the Guests tab.
				</p>
			</div>
			<div className="flex flex-wrap gap-2.5">
				<button
					type="button"
					onClick={onGuests}
					className="inline-flex h-10 items-center rounded-lg bg-primary-500 px-4 text-[14px] font-semibold text-white transition-colors hover:bg-primary-600"
				>
					Go to Guests
				</button>
				{!published && (
					<button type="button" onClick={sellTickets} disabled={isSaving} className={outlineButton}>
						{isSaving ? "Switching…" : "Sell tickets instead"}
					</button>
				)}
			</div>
			{!published && <p className="text-[13px] text-auth-muted">You can change how guests get in until you publish.</p>}
		</section>
	);
}
