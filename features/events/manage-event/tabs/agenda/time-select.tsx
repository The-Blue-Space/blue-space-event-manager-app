import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as React from "react";

type TimeSelectProps = {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	placeholder?: string;
};

const generateTimeOptions = () => {
	const times: { label: string; value: string }[] = [];
	for (let h = 0; h < 24; h++) {
		for (let m = 0; m < 60; m += 30) {
			const hour = h.toString().padStart(2, "0");
			const minute = m.toString().padStart(2, "0");
			const time24 = `${hour}:${minute}`;

			const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
			const ampm = h < 12 ? "AM" : "PM";
			const displayTime = `${displayHour}:${minute} ${ampm}`;

			times.push({ label: displayTime, value: time24 });
		}
	}
	return times;
};

const timeOptions = generateTimeOptions();

// Export timeOptions for sorting in other components
export { timeOptions };

export default React.memo(function TimeSelect({
	value,
	onChange,
	disabled = false,
	placeholder = "Select time",
}: TimeSelectProps) {
	const selectedOption = timeOptions.find((option) => option.value === value);
	const displayValue = selectedOption ? selectedOption.label : placeholder;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						" min-w-28 justify-start text-left font-normal px-2 body-3",
						!value && "text-muted-foreground"
					)}
					disabled={disabled}
				>
					<Clock className="h-4 w-4" />
					{displayValue}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
				{timeOptions.map((option) => (
					<DropdownMenuItem
						key={option.value}
						onClick={() => onChange(option.value)}
						className="cursor-pointer"
					>
						{option.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
});
