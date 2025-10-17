import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { type SidebarLink } from "../data";
import classNames from "classnames";
import * as React from "react";
import Link from "next/link";
import capitalize from "@/lib/capitalize";

export const linkStyle =
	"flex items-center w-full capitalize !py-5 transition-all duration-300 body-2 hover:bg-bg-neutral-200 hover:text-primary-800";

export type SidebarLinkProps = SidebarLink & {
	currentPath: string;
	activeLink: string;
	setActiveLink: React.Dispatch<React.SetStateAction<string>>;
};
export default React.memo(function SidebarLink(link: SidebarLinkProps) {
	const { icon, activeIcon, name, path, relativePaths, currentPath, activeLink, setActiveLink } =
		link;

	const isActive = React.useMemo(() => {
		const allPaths = [path, ...(relativePaths || [])];
		const formattedCurrentPath = currentPath.split("/");
		return (
			allPaths.some((pathPrefix) => {
				const formattedPath = pathPrefix ? pathPrefix.split("/") : [];
				return formattedCurrentPath.slice(1).includes(formattedPath[formattedPath.length - 1]);
			}) || activeLink == path
		);
	}, [activeLink, currentPath, path, relativePaths]);

	const cn = classNames(linkStyle, {
		"bg-neutral-200/20 font-semibold text-accent-500 w-full ": isActive,
		"font-normal text-white": !isActive,
	});

	return (
		<SidebarMenuItem
			className="!p-0 list-none"
			onMouseOver={() => setActiveLink(path)}
			onMouseLeave={() => setActiveLink("")}
		>
			<SidebarMenuButton
				asChild
				className={cn}
				tooltip={{
					asChild: true,
					children: (
						<span className="body-2 capitalize !bg-neutral-800 text-neutral-200">
							{capitalize(name)}
						</span>
					),
				}}
			>
				<Link
					href={path}
					className="flex items-center justify-start group-data-[collapsible=icon]:justify-center"
				>
					{/* <div>{icon}</div> */}
					<div>{icon && activeIcon && (isActive ? activeIcon : icon)}</div>
					{/* <Image src={assets.temp_image_01} alt="temp"/> */}
					<span className="group-data-[collapsible=icon]:hidden">{name}</span>
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
});
