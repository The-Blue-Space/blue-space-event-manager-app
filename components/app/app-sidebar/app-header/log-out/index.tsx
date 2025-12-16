import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import useActions from "@/store/actions";
import * as icons from "../../icons";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { linkStyle } from "../../sidebar-link";
import { useState } from "react";

type Props = {
	scope?:"header" |"sidebar"
}

export default function Logout(props:Props) {
	const { ui } = useActions();
	const [isActive, setIsActive] = useState(false);

	const click = () => {
		ui.changeDialog({
			show: true,
			type: "logout",
		});
	};

	return (
		<SidebarMenuItem
			className="!p-0 list-none"
			onMouseOver={() => setIsActive(true)}
			onMouseLeave={() => setIsActive(false)}
		>
			<SidebarMenuButton
				asChild
				className={cn(
					linkStyle,
					"group-data-[collapsible=icon]:justify-center font-semibold text-primary-800 "
				)}
				tooltip={{
					asChild: true,
					children: (
						<span className="body-2 capitalize !bg-neutral-800 text-neutral-200">Log out</span>
					),
				}}
			>
				<button onClick={click} className="p-0">
					<Image
						// src={isActive ? icons.logoutIcon02 : icons.logoutIcon}
						src={props.scope === "header" ? icons.logoutIcon02 : icons.logoutIcon}
						alt="sign out"
						className="size-4 object-contain"
						style={{ width: "auto", height: "auto" }}
					/>
					<span className="">Log out</span>
				</button>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}
