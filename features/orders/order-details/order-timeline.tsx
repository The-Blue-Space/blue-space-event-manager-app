import { getDateAndTime } from "@/lib/format-date";
import { Order } from "@/types/order.types";
import { Calendar } from "lucide-react";

type Prop = {
	order: Order;
};
export default function OrderTimeline({ order }: Prop) {
	const mergeTimeAndDate = (data: string) => {
		const date = getDateAndTime(data, {
			dateOptions: { dateStyle: "medium" },
			timeOptions: { hour: "2-digit", minute: "2-digit", hour12: true },
		});

		return `${date.date} | ${date.time}`;
	};
	const info = {
		created: mergeTimeAndDate(order.created_at),
		paid: order.paid_at ? mergeTimeAndDate(order.paid_at) : null,
		refunded: order.refunded_at ? mergeTimeAndDate(order.refunded_at) : null,
		last_updated: mergeTimeAndDate(order.updated_at),
	};
	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 text-neutral-900">
				<Calendar className="h-4 w-4 text-accent-500" />
				<h3 className="font-semibold text-sm">Timeline</h3>
			</div>
			<div className="bg-neutral-50 rounded-lg p-4 space-y-3">
				{Object.entries(info)
					.filter((item) => item[1] !== undefined && item[1] !== null)
					.map(([key, value]) => (
						<div className="flex items-center justify-between" key={key}>
							<span className="body-3 text-neutral-600 capitalize">{key.split("_").join(" ")}</span>
							<span className="body-3 font-medium text-neutral-900">{value}</span>
						</div>
					))}
			</div>
		</div>
	);
}
