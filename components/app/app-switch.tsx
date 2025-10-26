import { cn } from "@/lib/utils";
import { Switch } from "../ui/switch";

type Props = {
	checked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	className?: string;
	id?: string;
	name?: string;
	disabled?: boolean;
};

export default function AppSwitch({ checked, onCheckedChange, className, id, name, disabled }: Props) {
	const container = cn("data-[state=checked]:bg-primary-500", className);
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
