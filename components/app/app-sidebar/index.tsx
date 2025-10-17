'use client';
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarProvider,
} from "@/components/ui/sidebar";
import { sidebarLinks } from "./data";
import SidebarLink from "./sidebar-link";
import * as React from "react";
import useCustomNavigation from "@/hooks/use-navigation";
import AppHeader from "./app-header";
import { Separator } from "@/components/ui/separator";
import AppLogo from "../app-logo";
import Logout from "./app-header/log-out";


export default function AppSidebar({ children }: { children: React.ReactNode }) {
	const [activeLink, setActiveLink] = React.useState("");
	const [currentPath, setCurrentPath] = React.useState("");
	const { pathname } = useCustomNavigation();

	React.useEffect(() => {
		setCurrentPath(pathname);
	}, [pathname]);
	const props = {
		activeLink,
		setActiveLink,
		currentPath,
	};
	return (
		<SidebarProvider defaultOpen={false} className="">
			<Sidebar collapsible="icon" className=" bg-primary-800">
				<SidebarHeader className="pt-10 px-4 xl:px-0 xl:py-8  xl:mx-auto ">
					<AppLogo scope="logo_white" size={50} className="hidden xl:block" />
					<AppLogo scope="logo_text_white" size={150} className="block xl:hidden" />
				</SidebarHeader>
				<SidebarContent className="px-2  justify-start py-5 gap-1 group-data-[collapsible=icon]:px-0">
					<SidebarGroup>
						<SidebarGroupContent>
							<SidebarMenu className="space-y-3">
								{sidebarLinks.map((item) => {
									return <SidebarLink key={item.name} {...item} {...props} />;
								})}
							</SidebarMenu>
							<Separator className="h-px bg-gray-500 my-2" />
							<Logout />
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
			</Sidebar>

			<div className="flex flex-col w-full">
				<AppHeader />
				{children}
			</div>
		</SidebarProvider>
	);
}


//EXPANDED SIDEBAR
// {/* <SidebarGroup>
// 	<SidebarGroupContent>
// 		{/* <SidebarMenu>
// 								<SidebarMenuItem className="!p-0 list-none">
// 									<SidebarMenuButton asChild>
// 										<SidebarTrigger asChild className="size-fit hover:bg-transparent">
// 											<button>
// 												<Image
// 													src={icons.backwardIcon}
// 													alt="backward"
// 													className="size-4 object-contain"
// 													style={{ width: "auto", height: "auto" }}
// 												/>
// 												<span className="text-white group-data-[collapsible=icon]:opacity-0 transition-all duration-200">
// 													Collapse Menu
// 												</span>
// 											</button>
// 										</SidebarTrigger>
// 									</SidebarMenuButton>
// 								</SidebarMenuItem>
// 							</SidebarMenu> */}
// 	</SidebarGroupContent>
// </SidebarGroup>; */}