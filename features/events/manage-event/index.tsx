"use client";
import { Skeleton } from "@/components/ui/skeleton";
import AppContainer from "@/components/app/container/container";
import Render from "@/components/app/render";
import React from "react";
import useCustomNavigation from "@/hooks/use-navigation";
import { EventProvider, useEvent } from "./context";
import AppDrawer from "@/components/app/app-drawer";
import { Badge } from "@/components/ui/badge";
import { PanelLeftClose } from "lucide-react";
import Minimum from "@/components/app/container/minimum";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { eventSetupTabs } from "./data";
import Maximum from "@/components/app/container/maximum";
import { cn } from "@/lib/utils";
import AppSwitch from "@/components/app/app-switch";
import EventSetupTabs from "./tabs";

function Details() {
	const { isFetching, isError, error, open, handleExit, event } = useEvent();
	const { queryParams, navigate } = useCustomNavigation();
	const activeTab = React.useMemo(() => queryParams.get("tab"), [queryParams]);

	const click = (value: string) => {
		navigate(`?tab=${value}`);
	};

	const triggerCn = cn(
		`w-full justify-start  p-2 rounded-none body-2 border-b last:border-b-0 border-neutral-200
		hover:bg-neutral-200/50 hover:text-primary-500 transition-all duration-300 !shadow-none

		first:rounded-t-lg
		last:rounded-b-lg

		data-[state=active]:bg-neutral-200/50 data-[state=active]:text-primary-500
		`
	);

	return (
		<AppDrawer
			title="Event Manager"
			showLogo
			sticky
			logoSize={30}
			logoScope="logo_blue"
			direction="bottom"
			open={open}
			handleChange={handleExit}
			closeComponent={
				<Badge
					variant={"outline"}
					className="bg-white rounded gap-1 p-2 cursor-pointer text-neutral-500 hover:bg-neutral-200 hover:text-neutral-500 transition-all duration-300"
				>
					<PanelLeftClose className="w-4 h-4 " />
					<span className="body-2 ">Exit Event Manager</span>
				</Badge>
			}
		>
			<Tabs
				asChild
				defaultValue={activeTab ?? "basic-information"}
				value={activeTab ?? "basic-information"}
			>
				<AppContainer className="!p-0 h-full lg:flex w-full">
					<Render
						isLoading={isFetching}
						error={error}
						isError={isError}
						loadingComponent={<LoadingComponent />}
					>
						<Minimum className="max-w-60 p-5 space-y-5 xl:fixed  xl:h-fit">
							<div className="rounded-lg border border-neutral-200 p-2 shadow-sm">
								<h4 className="body-3 font-semibold text-primary-500">{event?.title}</h4>
								<div className="flex items-center justify-between gap-2">
									<span className="body-3 text-neutral-500">
										{event?.published ? "Published" : "Unpublished"}
									</span>
									<AppSwitch checked={event?.published} onCheckedChange={() => {}} />
								</div>
							</div>
							<TabsList className="flex flex-row lg:flex-col items-start p-0  gap-0 w-full bg-transparent border border-neutral-200 h-fit shadow-sm">
								{eventSetupTabs.map((tab) => (
									<TabsTrigger
										key={tab.value}
										value={tab.value}
										onClick={() => click(tab.value)}
										className={triggerCn}
									>
										<span className="">{tab.title}</span>
									</TabsTrigger>
								))}
							</TabsList>
						</Minimum>
						<Maximum className="xl:ml-60">
							<EventSetupTabs />
						</Maximum>
					</Render>
				</AppContainer>
			</Tabs>
		</AppDrawer>
	);
}

function LoadingComponent() {
	return (
		<div className="space-y-10">
			<div className="flex flex-col gap-3">
				<Skeleton className="w-full h-24 bg-white/25" />
				<Skeleton className="w-full h-10 bg-white/25" />
			</div>

			<div className="flex flex-col gap-10">
				<Skeleton className="w-full h-8 bg-white/25" />
				<Skeleton className="w-full h-8 bg-white/25" />
				<Skeleton className="w-full h-8 bg-white/25" />
				<Skeleton className="w-full h-8 bg-white/25" />
			</div>
		</div>
	);
}

export default function ManageEvent() {
	return (
		<EventProvider>
			<Details />
			{/* <EventDialogs /> */}
		</EventProvider>
	);
}
