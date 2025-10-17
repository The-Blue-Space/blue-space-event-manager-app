"use client";
import AppContainer from "@/components/app/container/container";
import Welcome from "./welcome";
import OverviewCards from "./overview-cards";
import { useQuery } from "@tanstack/react-query";
import getDashboardData from "@/services/account/get-user-dashboard";
import Render from "@/components/app/render";
import { UserDashboardData } from "@/types/user.types";
import { Activities } from "./activities";
import RecentOrders from "./recent-orders";

export type HomeProps = {
	isLoading: boolean;
	data: UserDashboardData | undefined;
};

export default function Home() {
	const { data, isFetching, isError, error } = useQuery({
		queryKey: ["dashboard-data"],
		queryFn: () => getDashboardData(),
	});

	return (
		<AppContainer className="flex flex-col gap-5 overflow-hidden w-full">
			{/* Welcome Banner */}
			<Welcome />

			<Render error={error} isError={isError}>
				{/* Overview Cards - 4 metrics */}
				<OverviewCards isLoading={isFetching} data={data} />

				{/* Main Content - Chart (2 cols) + Active Event (1 col) */}
				<Activities />

				{/* Recent Orders - Full width */}
				<RecentOrders isLoading={isFetching} data={data} />
			</Render>
		</AppContainer>
	);
}
