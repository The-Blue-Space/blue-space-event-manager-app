import classNames from "classnames";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";

type Props = {
	id: string;
	checked: boolean;
	label?: string;
	onCheckedChange: (checked: boolean) => void;
	disabled?: boolean;
	className?: string;
	containerClassName?: string;
	labelClassName?: string;
	placement?: "left" | "right";
	checkIconStyle?: string;
};

export default function AppCheckbox({ placement = "left", ...props }: Props) {
	const containerCn = classNames("flex items-center gap-2", props.containerClassName);
	const checkboxCn = classNames(
		"data-[state=checked]:bg-accent-500 data-[state=checked]:border-neutral-100",
		props.className
	);

	const labelCn = cn("body-3", props.labelClassName);

	const checkIconStyle = classNames("text-white", props.checkIconStyle);
	return (
		<div className={containerCn}>
			{props.label && placement === "left" && (
				<label htmlFor={props.id} className={labelCn}>
					{props.label}
				</label>
			)}
			<Checkbox
				id={props.id}
				checked={props.checked}
				onCheckedChange={props.onCheckedChange}
				className={checkboxCn}
				checkIconStyle={checkIconStyle}
				disabled={props.disabled}
			/>
			{props.label && placement === "right" && (
				<label htmlFor={props.id} className={labelCn}>
					{props.label}
				</label>
			)}
		</div>
	);
}
