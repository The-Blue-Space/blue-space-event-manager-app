"use client";
import AppContainer from "@/components/app/container/container";
import Welcome from "./welcome";
import OverviewCards from "./overview-cards";
import { useQuery } from "@tanstack/react-query";
import getDashboardData from "@/services/account/get-manager-dashboard";
import Render from "@/components/app/render";
import { UserDashboardData } from "@/types/user.types";
import { Activities } from "./activities";
import RecentOrders from "./recent-orders";
import useAppSelector from "@/store/hooks";
import React from "react";
import SetUpProfile from "./set-up-profile";
import EmptyDashboard from "./empty-dashboard";

export type HomeProps = {
	isLoading: boolean;
	data: UserDashboardData | undefined;
};

export default function Home() {
	const { managerProfile } = useAppSelector("manager_profile");
	const hasManagerProfile = React.useMemo(() => managerProfile !== null, [managerProfile]);

	const { data, isFetching, isError, error } = useQuery({
		queryKey: ["dashboard-data"],
		queryFn: () => getDashboardData(),
		enabled: hasManagerProfile,
	});

	const hasNoEvents = React.useMemo(
		() => !isFetching && (data?.overview?.total_events?.total_events ?? 0) === 0,
		[isFetching, data]
	);

	return (
		<AppContainer className="flex flex-col gap-5 overflow-hidden w-full">
			{/* Welcome Banner */}
			<Welcome />

			{hasManagerProfile ? (
				<Render error={error} isError={isError}>
					{/* Overview Cards - 4 metrics (always visible) */}
					<OverviewCards isLoading={isFetching} data={data} />

					{hasNoEvents ? (
						<EmptyDashboard />
					) : (
						<>
							{/* Main Content - Chart (2 cols) + Active Event (1 col) */}
							<Activities />

							{/* Recent Orders - Full width */}
							<RecentOrders isLoading={isFetching} data={data} />
						</>
					)}
				</Render>
			) : (
				<SetUpProfile />
			)}
		</AppContainer>
	);
}
