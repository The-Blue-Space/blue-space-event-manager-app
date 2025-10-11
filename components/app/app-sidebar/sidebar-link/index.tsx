import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { type SidebarLink } from "../data";
import classNames from "classnames";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";

export const linkStyle =
	"flex items-center capitalize !py-5 transition-all duration-300 body-2 hover:bg-[#CCE9FE] hover:text-primary-800";

export type SidebarLinkProps = SidebarLink & {
	currentPath: string;
	activeLink: string;
	setActiveLink: React.Dispatch<React.SetStateAction<string>>;
	
};
export default React.memo(function SidebarLink(link: SidebarLinkProps) {
	const {
		icon,
		name,
		activeIcon,
		path,
		relativePaths,
		currentPath,
		activeLink,
		setActiveLink,
		
	} = link;

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
		"bg-[#CCE9FE] font-semibold text-primary-800": isActive,
		"font-normal text-[#CCE9FE]": !isActive,
	});

	return (
		<SidebarMenuItem
			className="!p-0 list-none"
			onMouseOver={() => setActiveLink(path)}
			onMouseLeave={() => setActiveLink("")}
		>
			<SidebarMenuButton asChild className={cn}>
				<Link href={path} className="flex items-center">
					{icon && activeIcon && (
						<Image
							src={isActive ? activeIcon : icon}
							alt={name}
							className="size-4 object-contain"
							style={{ width: "auto", height: "auto" }}
						/>
					)}
					<span>{name}</span>
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
});
