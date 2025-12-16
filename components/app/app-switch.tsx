import { cn } from "@/lib/utils";
import { Switch } from "../ui/switch";

type Props = {
	checked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	className?: string;
	id?: string;
	name?: string;
	disabled?: boolean;
	variant?: "primary" | "accent";
};

export default function AppSwitch({ checked, onCheckedChange, className, id, name, disabled, variant = "primary" }: Props) {
	const container = cn("data-[state=checked]:bg-primary-500", className, {
		"data-[state=checked]:bg-primary-500": variant === "primary",
		"data-[state=checked]:bg-accent-500": variant === "accent",
	});
	return (
		<Switch
			id={id}
			name={name}
			checked={checked}
			disabled={disabled}
			className={container}
			onCheckedChange={onCheckedChange}
		/>
	);
}
