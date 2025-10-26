import ErrorBoundary from "@/components/app/error-boundary";
import Render from "@/components/app/render";
import { getEventsOverview } from "@/services/events";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck2, CalendarDays, CalendarX2, DollarSign } from "lucide-react";
import * as React from "react";
import OverviewCard from "./overview-card";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import useAppSelector from "@/store/hooks";
import { amountSeparator } from "@/lib/amount-separator";

export default React.memo(function EventsOverview() {
	const { activeCurrency } = useAppSelector("init");
	const currency = activeCurrency?.symbol;
	const {
		data: overview,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["events-overview"],
		queryFn: () => getEventsOverview(),
	});

	return (
		<ErrorBoundary>
			<div className="flex gap-5 py-1 overflow-auto snap-x snap-mandatory hide-scrollbar w-full">
				<Render
					isLoading={isLoading}
					isError={isError}
					error={error}
					loadingComponent={<LoadingComponent />}
				>
					{overview && (
						<>
							<OverviewCard
								title="Total Events"
								value={overview.total_events.toLocaleString()}
								icon={CalendarDays}
								iconColor="text-primary-600"
								iconBgColor="bg-badge"
							/>
							<OverviewCard
								title="Published Events"
								value={overview.published_events.toLocaleString()}
								icon={CalendarCheck2}
								iconColor="text-green-600"
								iconBgColor="bg-green-100"
							/>
							<OverviewCard
								title="Unpublished Events"
								value={overview.unpublished_events.toLocaleString()}
								icon={CalendarX2}
								iconColor="text-orange-600"
								iconBgColor="bg-orange-100"
							/>
							<OverviewCard
								title="Total Revenue"
								value={`${currency}${amountSeparator(overview.total_revenue, "kobo")}`}
								icon={DollarSign}
								iconColor="text-emerald-600"
								iconBgColor="bg-emerald-100"
							/>
						</>
					)}
				</Render>
			</div>
		</ErrorBoundary>
	);
});

function LoadingComponent() {
	return (
		<>
			{[...Array(4)].map((_, index) => (
				<Card key={index} className="overflow-hidden w-full min-w-[280px]  lg:min-w-0 snap-start">
					<CardContent className="p-5">
						<div className="flex items-center justify-between gap-3">
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-8 w-16" />
							</div>
							<Skeleton className="w-12 h-12 rounded-lg" />
						</div>
					</CardContent>
				</Card>
			))}
		</>
	);
}
