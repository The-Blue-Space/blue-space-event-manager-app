import * as icons from "./icons";
export type SidebarLink = {
	name: string;
	path: string;
	icon?: string;
	activeIcon?: string;
	relativePaths?: string[];
	subLinks?: SidebarLink[];
};

export const sidebarLinks: SidebarLink[] = [
	{
		name: "home",
		path: "/home",
		icon: icons.homeIcon,
		activeIcon: icons.homeIcon02,
		relativePaths: [],
	},
	{
		name: "transfers",
		path: "/transfers",
		icon: icons.transfersIcon,
		activeIcon: icons.transfersIcon02,
		relativePaths: [],
	},
	{
		name: "placement",
		path: "/placements",
		icon: icons.placementIcon,
		activeIcon: icons.placementIcon02,
		relativePaths: [],
	},
	{
		name: "beneficiaries",
		path: "/beneficiaries",
		icon: icons.beneficiariesIcon,
		activeIcon: icons.beneficiariesIcon02,
		relativePaths: [],
	},
	{
		name: "transactions",
		path: "/transactions",
		icon: icons.transactionsIcon,
		activeIcon: icons.transactionsIcon02,
		relativePaths: [],
	},
	{
		name: "my account",
		path: "/account",
		icon: icons.myAccountIcon,
		activeIcon: icons.myAccountIcon02,
		relativePaths: [],
	},
];
