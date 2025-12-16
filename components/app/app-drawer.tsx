import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import classNames from "classnames";
import { X } from "lucide-react";
import React from "react";
import ErrorBoundary from "./error-boundary";
import AppLogo, { LogoScope } from "./app-logo";

type DrawerProps = {
	direction: "left" | "right" | "top" | "bottom";
	children: React.ReactNode;
	footer?: React.ReactNode;
	open: boolean;
	handleChange(state: boolean): void;
	title?: string;
	className?: string;
	showLogo?: boolean;
	logoSize?:number
	logoScope?:LogoScope;
	sticky?: boolean;
	headerClassName?: string;
	drawerTitleClassName?: string;
	handleOnly?: boolean;
	showCloseButton?: boolean;
	showHeader?: boolean;
	closeComponent?: React.ReactNode;
	closeButtonClassName?: string;
};
export default function AppDrawer({
	handleOnly = true,
	showHeader = true,
	showCloseButton = true,
	showLogo = false,
	...props
}: DrawerProps) {
	const headerClx = classNames(
		"flex justify-between items-center border-b border-neutral-200 text-primary-500",
		props.headerClassName,
		{
			"sticky top-0 z-10 bg-white": props.sticky,
		}
	);

	const drawerTitleClx = classNames(
		"flex gap-2 items-center font-semibold body-1 text-neutral-1000",
		props.drawerTitleClassName
	);

	const cn = classNames("h-full  outline-none", props.className, {
		"lg:ml-[60%] !overflow-x-hidden rounded-none": props.direction === "right",
		"lg:mr-[68%] !overflow-x-hidden": props.direction === "left",
		"overflow-hidden border-none ": props.direction === "bottom",
	});

	const closeButtonClx = classNames("p-1 rounded-full bg-neutral-300", props.closeButtonClassName);

	return (
		<Drawer
			direction={props.direction}
			onOpenChange={props.handleChange}
			open={props.open}
			handleOnly={handleOnly}
			
		>
			<DrawerContent className={cn} draggable={false}>
				<div className="flex overflow-y-auto flex-col h-screen">
					<DrawerDescription />
					{showHeader && (
						<DrawerHeader className={headerClx}>
							{props.title && (
								<DrawerTitle className={drawerTitleClx}>
									{showLogo && <AppLogo scope={props.logoScope ?? "logo_black"} size={props.logoSize} />}
									{props.title}
								</DrawerTitle>
							)}
							{showCloseButton && (
								<DrawerClose
									onClick={() => props.handleChange(false)}
									className={closeButtonClx}
									asChild={!!props.closeComponent}
								>
									{props.closeComponent ?? <X className="w-5 h-5 text-primary-500" />}
								</DrawerClose>		
							)}
						</DrawerHeader>
					)}
					<ErrorBoundary>{props.children}</ErrorBoundary>
					{props.footer && <DrawerFooter>{props.footer}</DrawerFooter>}
				</div>
			</DrawerContent>
		</Drawer>
	);
}
