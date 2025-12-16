import { DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import classNames from "classnames";
import * as React from "react";

type AppDropdownProps = {
	trigger: React.ReactNode;
	children: React.ReactNode;
	triggerStyle?: string;
	contentStyle?: string;
	disabled?: boolean;
	modal?: boolean;
	position?: "top" | "right" | "bottom" | "left";
	align?: "start" | "center" | "end";
	sideOffset?: number;
	open?: boolean;
};

//  each dropdown  item should be wrapped in the DropdownMenuItem component

export default React.memo(function AppDropdown(props: AppDropdownProps) {
	const [open, setOpen] = React.useState(props.open || false);

	const triggerClx = classNames("w-full cursor-pointer", props.triggerStyle);
	const contentClx = classNames("w-auto", props.contentStyle);

	React.useEffect(() => {
		setOpen(props.open || false);
	}, [props.open]);

	return (
		<DropdownMenu
			open={open}
			onOpenChange={(isOpen) => {
				if (props.open === undefined) {
					setOpen(isOpen);
				}
			}}
			modal={props.modal || false}
			
		>
			<DropdownMenuTrigger
				asChild
				className={triggerClx}
				// onClick={() => setOpen(!open)}
				disabled={props.disabled}
			>
				{props.trigger}
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className={contentClx}
				side={props.position}
				sideOffset={props.sideOffset}
				align={props.align}
			>
				{props.children}
			</DropdownMenuContent>
		</DropdownMenu>
	);
});
