import Render from "@/components/app/render";
import { Badge } from "@/components/ui/badge";
import { SkeletonList } from "@/components/ui/skeleton";

import useAppSelector from "@/store/hooks";
import { CalendarCheck, TicketPlus, TrendingUp, Users } from "lucide-react";
import { useMemo } from "react";
import { HomeProps } from ".";
import classNames from "classnames";

type AccountOverview = {
	icon: any;
	title: string;
	amount: string;
	footer: string;
};

export default function AccountOverview({ isLoading, data }: HomeProps) {
	const { activeCurrency } = useAppSelector("init");

	const overview = data?.overview;
	const iconCn = classNames("size-full text-primary-500", {});

	const getPercentage = (value: number, total: number) => {
		return ((value / total) * 100).toFixed(2);
	};

	const accountOverview: AccountOverview[] = useMemo(() => {
		return [
			{
				icon: <CalendarCheck className={iconCn} />,
				title: "Total Events",
				amount: overview?.total_events?.total_events.toLocaleString() ?? "0",
				footer: `Upcoming Events: ${
					overview?.total_events?.upcoming_events.toLocaleString() ?? "0"
				}`,
			},

			{
				icon: <Users className={iconCn} />,
				title: "Total Attendees",
				amount: overview?.total_attendees?.total_attendees.toLocaleString() ?? "0",
				footer: `+${getPercentage(
					overview?.total_attendees?.attendees_this_month ?? 0,
					overview?.total_attendees?.total_attendees ?? 0
				)}% this month`,
			},
			{
				icon: <TicketPlus className={iconCn} />,
				title: "Ticket Sales",
				amount: overview?.ticket_sales?.ticket_sales.toLocaleString() ?? "0",
				footer: `+${getPercentage(
					overview?.ticket_sales?.ticket_sales_this_month ?? 0,
					overview?.ticket_sales?.ticket_sales ?? 0
				)}% this month`,
			},

			{
				icon: <TrendingUp className={iconCn} />,
				title: "Revenue",
				amount: `${activeCurrency.symbol} ${
					overview?.revenue?.total_revenue.toLocaleString() ?? "0"
				}`,
				footer: `+${getPercentage(
					overview?.revenue?.revenue_this_month ?? 0,
					overview?.revenue?.total_revenue ?? 0
				)}% this month`,
			},
		];
	}, [overview]);

	return (
		<div className="body-1  font-bold  space-y-3  w-full">
			{/* <div className="flex items-center justify-between body-2">
				<h5 className=" font-semibold text-black">Account Overview</h5>
				<Link href="" className="text-secondary-500 flex items-center gap-2">
					Account Statement <ChevronRight className="size-4" />
				</Link>
			</div> */}
			<div className="flex gap-5 py-1 overflow-auto snap-x snap-mandatory hide-scrollbar">
				<Render isLoading={isLoading} loadingComponent={<LoadingComponent />}>
					{accountOverview.map((item) => (
						<div
							key={item.title}
							className="flex flex-col gap-2 rounded-lg p-4 w-full min-w-[280px]  lg:min-w-0 snap-start border border-neutral-200 shadow"
						>
							<div className="flex items-start">
								<div className="flex-1">
									<h6 className="body-2 ">{item.title}</h6>
									<h6 className="heading-7 font-bold ">{item.amount}</h6>
									<small className="body-3 font-medium text-neutral-500">{item.footer}</small>
								</div>
								<Badge className="primary-badge rounded-full p-2 h-10 w-10">{item.icon}</Badge>
							</div>
						</div>
					))}
				</Render>
			</div>
		</div>
	);
}

function LoadingComponent() {
	return <SkeletonList count={4} className="w-full h-28 rounded-lg" />;
}
