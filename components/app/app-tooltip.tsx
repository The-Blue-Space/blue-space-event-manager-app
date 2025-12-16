import classNames from "classnames";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type Props = {
	children: React.ReactNode;
	trigger: React.ReactNode | string;
	contentClass?: string;
	triggerClass?: string;
	side?: "top" | "bottom" | "left" | "right";
};

export default function AppTooltip({ children, trigger, ...props }: Props) {
	const contentClass = classNames("max-w-xs w-fit text-white", props.contentClass);
	const triggerClass = classNames("", props.triggerClass);

	return (
		<Tooltip>
			{typeof trigger === "string" ? (
				<TooltipTrigger className={triggerClass}>{trigger}</TooltipTrigger>
			) : (
				<TooltipTrigger asChild className={triggerClass}>
					{trigger}
				</TooltipTrigger>
			)}
			<TooltipContent className={contentClass} side={props.side}>{children}</TooltipContent>
		</Tooltip>
	);
}
