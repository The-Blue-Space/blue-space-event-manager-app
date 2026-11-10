import { HomeOrder } from "@/types/home.types";
import { formatNaira, formatWhen } from "./format";
import { Pill, SectionHeader } from "./ui";

const STATUS = {
	paid: { label: "Paid", tone: "success" },
	pending: { label: "Pending", tone: "warning" },
	refunded: { label: "Refunded", tone: "neutral" },
	failed: { label: "Failed", tone: "error" },
} as const;

const buyerName = (order: HomeOrder) => order.buyer_name || order.buyer_username || "Guest";
const initials = (name: string) =>
	name
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part.charAt(0))
		.join("")
		.toUpperCase();
const when = (order: HomeOrder) => {
	const at = order.status === "refunded" ? order.refunded_at : order.paid_at;
	return at ? formatWhen(at) : "";
};

function Avatar({ name }: { name: string }) {
	return (
		<span aria-hidden="true" className="grid size-[30px] shrink-0 place-items-center rounded-full bg-auth-info-soft text-[12px] font-bold text-primary-500">
			{initials(name)}
		</span>
	);
}

export default function RecentOrders({ orders }: { orders: HomeOrder[] }) {
	return (
		<section aria-labelledby="recent-orders" className="grid gap-3">
			<SectionHeader id="recent-orders" title="Recent orders" href="/orders" linkLabel="View all orders" />

			{!orders.length ? (
				<p className="rounded-xl border border-auth-line px-4 py-6 text-center text-[14px] text-auth-muted">
					No orders yet. They show up here as soon as guests buy tickets.
				</p>
			) : (
				<>
					<div className="hidden overflow-hidden rounded-xl border border-auth-line md:block">
						<table className="w-full border-collapse text-[14px]">
							<thead>
								<tr className="text-left text-[12px] text-auth-muted">
									<th scope="col" className="border-b border-auth-line px-4 py-2.5 font-semibold">Buyer</th>
									<th scope="col" className="border-b border-auth-line px-3 py-2.5 font-semibold">Event</th>
									<th scope="col" className="border-b border-auth-line px-3 py-2.5 text-right font-semibold">Tickets</th>
									<th scope="col" className="border-b border-auth-line px-3 py-2.5 text-right font-semibold">Amount</th>
									<th scope="col" className="border-b border-auth-line px-3 py-2.5 font-semibold">Status</th>
									<th scope="col" className="border-b border-auth-line px-4 py-2.5 text-right font-semibold">When</th>
								</tr>
							</thead>
							<tbody>
								{orders.map((order) => {
									const name = buyerName(order);
									const status = STATUS[order.status];
									return (
										<tr key={order.id} className="border-b border-auth-info-soft last:border-0">
											<td className="px-4 py-3">
												<div className="flex items-center gap-2.5">
													<Avatar name={name} />
													<span className="grid">
														<span className="font-semibold text-auth-ink">{name}</span>
														{order.buyer_username && <span className="text-[12px] text-auth-muted">@{order.buyer_username}</span>}
													</span>
												</div>
											</td>
											<td className="px-3 py-3 text-auth-muted">{order.event_title}</td>
											<td className="px-3 py-3 text-right tabular-nums">{order.quantity}</td>
											<td className="px-3 py-3 text-right font-semibold tabular-nums text-auth-ink">{formatNaira(order.amount_kobo)}</td>
											<td className="px-3 py-3">
												<Pill tone={status.tone}>{status.label}</Pill>
											</td>
											<td className="whitespace-nowrap px-4 py-3 text-right text-auth-muted">{when(order)}</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>

					<ul className="divide-y divide-auth-line border-y border-auth-line md:hidden">
						{orders.map((order) => {
							const name = buyerName(order);
							const status = STATUS[order.status];
							const detail = [order.event_title, `${order.quantity} ${order.quantity === 1 ? "ticket" : "tickets"}`, when(order)]
								.filter(Boolean)
								.join(" · ");
							return (
								<li key={order.id} className="flex items-center gap-3 py-3">
									<Avatar name={name} />
									<div className="grid min-w-0 flex-1 gap-0.5">
										<span className="text-[14px] font-semibold text-auth-ink">{name}</span>
										<span className="truncate text-[12px] text-auth-muted">{detail}</span>
									</div>
									<div className="grid justify-items-end gap-1">
										<span className="text-[14px] font-bold tabular-nums text-auth-ink">{formatNaira(order.amount_kobo)}</span>
										<Pill tone={status.tone}>{status.label}</Pill>
									</div>
								</li>
							);
						})}
					</ul>
				</>
			)}
		</section>
	);
}
