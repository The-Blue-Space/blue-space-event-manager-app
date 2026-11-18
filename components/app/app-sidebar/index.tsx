"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import classNames from "classnames";
import { LogOut, Menu, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarInset,
	SidebarProvider,
	useSidebar,
} from "@/components/ui/sidebar";
import { assets } from "@/constants";
import useCustomNavigation from "@/hooks/use-navigation";
import { getRefundsStats } from "@/services/refunds";
import useActions from "@/store/actions";
import useAppSelector from "@/store/hooks";
import { navLinks } from "./data";

const shellStyle = { "--sidebar-width": "15.5rem" } as React.CSSProperties;

function useOpenCreateEvent() {
	const { ui } = useActions();
	return () => ui.changeDialog({ show: true, type: "create_event" });
}

function OrganizerAvatar({ size }: { size: number }) {
	const { managerProfile } = useAppSelector("manager_profile");
	const style = { width: size, height: size };
	if (managerProfile?.logo) {
		return <Image src={managerProfile.logo} alt="" width={size} height={size} style={style} className="shrink-0 rounded-full object-cover" />;
	}
	return (
		<span style={style} className="grid shrink-0 place-items-center rounded-full border border-auth-line bg-white">
			<Image src={assets.logo_blue} alt="" className="h-auto w-3/5" />
		</span>
	);
}

function Identity() {
	const { managerProfile } = useAppSelector("manager_profile");
	return (
		<Link href="/settings" className="flex items-center gap-2.5 rounded-[10px] p-1.5 transition-colors duration-150 hover:bg-auth-info-soft">
			<OrganizerAvatar size={36} />
			<span className="grid min-w-0">
				<span className="truncate text-[14px] font-bold leading-tight text-auth-ink">{managerProfile?.name ?? "Blue Space"}</span>
				<span className="text-[12px] text-auth-muted">{managerProfile ? "Organizer profile" : "Profile not set up yet"}</span>
			</span>
		</Link>
	);
}

function Navigation() {
	const { pathname } = useCustomNavigation();
	const { managerProfile } = useAppSelector("manager_profile");
	const { setOpenMobile } = useSidebar();
	const { data: refundStats } = useQuery({
		queryKey: ["refunds-stats"],
		queryFn: getRefundsStats,
		enabled: Boolean(managerProfile),
	});
	const refundsWaiting = refundStats?.pending_refunds ?? 0;

	return (
		<nav aria-label="Main" className="grid gap-0.5">
			{navLinks.map(({ label, href, icon: Icon }) => {
				const active = pathname === href || pathname.startsWith(`${href}/`);
				return (
					<Link
						key={href}
						href={href}
						aria-current={active ? "page" : undefined}
						onClick={() => setOpenMobile(false)}
						className={classNames(
							"flex h-[38px] items-center gap-2.5 rounded-lg px-2.5 text-[14px] transition-colors duration-150",
							active ? "bg-auth-info-soft font-bold text-primary-500" : "font-semibold text-auth-muted hover:bg-white hover:text-auth-ink"
						)}
					>
						<Icon aria-hidden="true" className="size-[18px] shrink-0" />
						<span className="flex-1">{label}</span>
						{href === "/refunds" && refundsWaiting > 0 && (
							<span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary-500 px-1.5 text-[12px] font-bold text-white">
								{refundsWaiting}
								<span className="sr-only"> waiting</span>
							</span>
						)}
					</Link>
				);
			})}
		</nav>
	);
}

function Account() {
	const { account } = useAppSelector("account");
	const { ui } = useActions();
	const displayName = account?.username || account?.name || "";

	return (
		<div className="flex items-center gap-2.5">
			<span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-500 text-[13px] font-bold uppercase text-white">
				{displayName.charAt(0)}
			</span>
			<span className="grid min-w-0 flex-1">
				<span className="truncate text-[13px] font-bold text-auth-ink">{displayName}</span>
				<span className="truncate text-[12px] text-auth-muted">{account?.email}</span>
			</span>
			<button
				type="button"
				aria-label="Log out"
				onClick={() => ui.changeDialog({ show: true, type: "logout" })}
				className="grid size-8 shrink-0 place-items-center rounded-lg text-auth-muted transition-colors duration-150 hover:bg-auth-info-soft hover:text-auth-ink"
			>
				<LogOut aria-hidden="true" className="size-[18px]" />
			</button>
		</div>
	);
}

function MobileBar() {
	const { toggleSidebar } = useSidebar();
	const { managerProfile } = useAppSelector("manager_profile");
	const openCreateEvent = useOpenCreateEvent();

	return (
		<header className="sticky top-0 z-20 flex h-[60px] items-center gap-2.5 border-b border-auth-line bg-auth-page pl-4 pr-3 md:hidden">
			<OrganizerAvatar size={32} />
			<span className="min-w-0 flex-1 truncate text-[15px] font-bold text-auth-ink">{managerProfile?.name ?? "Blue Space"}</span>
			{managerProfile && (
				<button type="button" aria-label="Create event" onClick={openCreateEvent} className="grid size-11 place-items-center rounded-[10px] bg-primary-500 text-white">
					<Plus aria-hidden="true" className="size-5" />
				</button>
			)}
			<button type="button" aria-label="Open menu" onClick={toggleSidebar} className="grid size-11 place-items-center rounded-[10px] text-auth-ink hover:bg-auth-info-soft">
				<Menu aria-hidden="true" className="size-[22px]" />
			</button>
		</header>
	);
}

export default function AppSidebar({ children }: { children: React.ReactNode }) {
	const { managerProfile } = useAppSelector("manager_profile");
	const openCreateEvent = useOpenCreateEvent();

	return (
		<SidebarProvider style={shellStyle}>
			<Sidebar className="border-auth-line">
				<SidebarHeader className="gap-5 px-4 pb-2 pt-5">
					<Identity />
					{managerProfile && (
						<button
							type="button"
							onClick={openCreateEvent}
							className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary-500 text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-primary-600 active:bg-primary-700"
						>
							<Plus aria-hidden="true" className="size-[18px]" />
							Create event
						</button>
					)}
				</SidebarHeader>
				<SidebarContent className="px-4 py-3">
					<Navigation />
				</SidebarContent>
				<SidebarFooter className="gap-3 border-t border-auth-line px-4 pb-5 pt-4">
					<Account />
					<p className="flex items-center gap-2 text-[12px] text-auth-muted">
						<Image src={assets.logo_blue} alt="" className="h-3.5 w-6 object-contain" />
						Blue Space organizer portal
					</p>
				</SidebarFooter>
			</Sidebar>
			<SidebarInset className="min-w-0 bg-white">
				<MobileBar />
				{children}
			</SidebarInset>
		</SidebarProvider>
	);
}
