"use client";
import { useQuery } from "@tanstack/react-query";
import { CalendarPlus } from "lucide-react";
import getHomeDashboard from "@/services/account/get-home-dashboard";
import useActions from "@/store/actions";
import useAppSelector from "@/store/hooks";
import { HomeDashboard } from "@/types/home.types";
import AttentionList from "./attention-list";
import { formatLongDate } from "./format";
import GetStarted from "./get-started";
import RecentOrders from "./recent-orders";
import SalesChart from "./sales-chart";
import { ComingUp, LastThirtyDays, TonightSoFar, Withdrawable } from "./side-column";
import Spotlight from "./spotlight";
import { DashboardError, DashboardSkeleton } from "./states";

function NoUpcomingEvent() {
	const { ui } = useActions();
	return (
		<section aria-labelledby="no-upcoming" className="grid justify-items-start gap-2 rounded-[14px] border border-auth-line p-6">
			<h2 id="no-upcoming" className="text-[18px] font-bold text-auth-ink">
				No upcoming events
			</h2>
			<p className="text-[14px] text-auth-muted">Your published events will show here, starting with the next one.</p>
			<button
				type="button"
				onClick={() => ui.changeDialog({ show: true, type: "create_event" })}
				className="mt-2 inline-flex h-10 items-center gap-2 rounded-lg bg-primary-500 px-4 text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-primary-600"
			>
				<CalendarPlus aria-hidden="true" className="size-4" />
				Create event
			</button>
		</section>
	);
}

function Overview({ data }: { data: HomeDashboard }) {
	const { spotlight } = data;
	const live = spotlight?.status === "live";

	return (
		<>
			{!live && <AttentionList attention={data.attention} />}
			<div className="flex flex-wrap items-start gap-8">
				<div className="grid min-w-0 flex-[999_1_560px] gap-8">
					{spotlight ? <Spotlight spotlight={spotlight} /> : <NoUpcomingEvent />}
					{!live && <SalesChart days={data.daily_tickets} />}
					<RecentOrders orders={data.recent_orders} />
				</div>
				<div className="grid min-w-0 max-w-[360px] flex-[1_1_300px] gap-7">
					{live && spotlight ? (
						<TonightSoFar
							ticketsSold={spotlight.tickets_sold}
							capacity={spotlight.event.capacity}
							photos={spotlight.photos.count}
							refundsWaiting={data.attention.pending_refunds}
						/>
					) : (
						<>
							<LastThirtyDays stats={data.last_30_days} />
							<Withdrawable kobo={data.withdrawable_kobo} />
						</>
					)}
					<ComingUp events={data.coming_up} title={!spotlight ? "Coming up" : live ? "Coming up next" : "Also coming up"} />
				</div>
			</div>
		</>
	);
}

export default function Dashboard() {
	const { account } = useAppSelector("account");
	const { data, isPending, isError, isFetching, refetch } = useQuery({ queryKey: ["home-dashboard"], queryFn: getHomeDashboard });
	const name = account?.username || account?.name || "";
	const firstRun = data ? !data.has_events : false;

	return (
		<div className="mx-auto grid w-full max-w-[1200px] gap-7 px-4 pb-16 pt-6 sm:px-8 sm:pt-8 lg:px-10">
			<header className="grid gap-1">
				<h1 className="text-[22px] font-bold leading-tight tracking-[-0.01em] text-auth-ink sm:text-[26px]">
					{firstRun ? `Welcome, ${name}` : `Welcome back, ${name}`}
				</h1>
				<p className="text-[15px] text-auth-muted">{firstRun ? "Let's get your first event on sale." : formatLongDate(new Date())}</p>
			</header>

			{isPending ? (
				<DashboardSkeleton />
			) : isError ? (
				<DashboardError onRetry={() => refetch()} isRetrying={isFetching} />
			) : firstRun ? (
				<GetStarted hasBankAccount={data.attention.has_bank_account} />
			) : (
				<Overview data={data} />
			)}
		</div>
	);
}
