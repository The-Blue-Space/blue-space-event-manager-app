import classNames from "classnames";
import React from "react";
import {  CalendarCheck2, CreditCard, Home, Megaphone, Recycle, Settings, TicketPlus } from "lucide-react";
export type SidebarLink = {
	name: string;
	path: string;
	icon?: React.ReactNode;
	activeIcon?: React.ReactNode;
	relativePaths?: string[];
	subLinks?: SidebarLink[];
};

// Sidebar links
// home
// events
// orders
// marketing
// refunds
// finance
// settings

const IconContainer = (node: any, isActiveIcon?: boolean) => {
	const cn = classNames("size-full text-neutral-200/50", {
		"text-neutral-200/50": !isActiveIcon,
		"!text-accent-500": isActiveIcon,
	});
	return React.createElement(node, { className: cn });
};

export const sidebarLinks: SidebarLink[] = [
	{
		name: "home",
		path: "/home",
		icon: IconContainer(Home),
		activeIcon: IconContainer(Home, true),
		relativePaths: [],
	},
	{
		name: "events",
		path: "/events",
		icon: IconContainer(CalendarCheck2),
		activeIcon: IconContainer(CalendarCheck2, true),
		relativePaths: [],
	},
	{
		name: "orders",
		path: "/orders",
		icon: IconContainer(TicketPlus),
		activeIcon: IconContainer(TicketPlus, true),
		relativePaths: [],
	},
	{
		name: "marketing",
		path: "/marketing",
		icon: IconContainer(Megaphone),
		activeIcon: IconContainer(Megaphone, true),
		relativePaths: [],
	},
	{
		name: "refunds",
		path: "/refunds",
		icon: IconContainer(Recycle),
		activeIcon: IconContainer(Recycle, true),
		relativePaths: [],
	},
	{
		name: "finance",
		path: "/finance",
		icon: IconContainer(CreditCard),
		activeIcon: IconContainer(CreditCard, true),
		relativePaths: [],
	},
	{
		name: "settings",
		path: "/settings",
		icon: IconContainer(Settings),
		activeIcon: IconContainer(Settings, true),
		relativePaths: [],
	},
];
