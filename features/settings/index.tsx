"use client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useCustomNavigation from "@/hooks/use-navigation";
import getManagerProfile from "@/services/account/get-manager-profile";
import useAppSelector from "@/store/hooks";
import EventDefaults from "./event-defaults";
import OrganizerProfile from "./profile";
import { NoProfile, SettingsError, SettingsSkeleton } from "./states";
import { profileQueryKey } from "./use-save-profile";

const TABS = [
	{ value: "profile", label: "Organizer profile" },
	{ value: "events", label: "Event defaults" },
];

const listClass =
	"grid h-auto grid-cols-2 items-stretch justify-start rounded-none border-b border-auth-line bg-transparent p-0 " +
	"sm:flex sm:gap-7";

const triggerClass =
	"-mb-px rounded-none border-b-2 border-transparent px-0 py-3 text-[14px] font-semibold text-auth-muted shadow-none " +
	"transition-colors duration-150 hover:text-auth-ink focus-visible:ring-auth-link sm:py-2.5 " +
	"data-[state=active]:border-primary-500 data-[state=active]:bg-transparent data-[state=active]:font-bold " +
	"data-[state=active]:text-auth-ink data-[state=active]:shadow-none";

// Both panels stay mounted so switching tabs keeps unsaved edits.
const panelClass = "mt-0 focus-visible:ring-auth-link data-[state=inactive]:hidden";

export default function Settings() {
	const { managerProfile } = useAppSelector("manager_profile");
	const { queryParams } = useCustomNavigation();
	const tab = queryParams.get("tab") === "events" ? "events" : "profile";

	// The profile kept after login is trimmed, so load the full one here.
	const profileId = managerProfile?.id ?? "";
	const { data: profile, isError, isFetching, refetch } = useQuery({
		queryKey: profileQueryKey(profileId),
		queryFn: () => getManagerProfile(profileId),
		enabled: Boolean(profileId),
	});

	return (
		<div className="mx-auto grid w-full max-w-[1200px] gap-[22px] px-4 pb-12 pt-6 sm:gap-6 sm:px-8 sm:pb-16 sm:pt-8 lg:px-10">
			<header className="grid gap-1">
				<h1 className="text-[22px] font-bold leading-tight tracking-[-0.01em] text-auth-ink sm:text-[26px]">Settings</h1>
				<p className="text-[15px] leading-normal text-auth-muted">
					Your organizer profile, and the defaults your events start with.
				</p>
			</header>

			{!managerProfile ? (
				<NoProfile />
			) : (
				<Tabs value={tab} onValueChange={(value) => queryParams.set("tab", value)} className="grid gap-[22px] sm:gap-6">
					<TabsList aria-label="Settings" className={listClass}>
						{TABS.map(({ value, label }) => (
							<TabsTrigger key={value} value={value} className={triggerClass}>
								{label}
							</TabsTrigger>
						))}
					</TabsList>

					{profile ? (
						<>
							<TabsContent value="profile" forceMount className={panelClass}>
								<OrganizerProfile profile={profile} />
							</TabsContent>
							<TabsContent value="events" forceMount className={panelClass}>
								<EventDefaults profile={profile} />
							</TabsContent>
						</>
					) : isError ? (
						<SettingsError onRetry={() => refetch()} isRetrying={isFetching} />
					) : (
						<SettingsSkeleton />
					)}
				</Tabs>
			)}
		</div>
	);
}
