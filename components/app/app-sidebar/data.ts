import { CalendarCheck2, Home, Landmark, RotateCcw, ScrollText, Settings, type LucideIcon } from "lucide-react";

export type NavLink = { label: string; href: string; icon: LucideIcon };

// Marketing is left out until its page exists (it still says "Coming soon").
export const navLinks: NavLink[] = [
	{ label: "Home", href: "/home", icon: Home },
	{ label: "Events", href: "/events", icon: CalendarCheck2 },
	{ label: "Orders", href: "/orders", icon: ScrollText },
	{ label: "Refunds", href: "/refunds", icon: RotateCcw },
	{ label: "Finance", href: "/finance", icon: Landmark },
	{ label: "Settings", href: "/settings", icon: Settings },
];
