import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import classNames from "classnames";
import * as React from "react";

type DatePickerProps = {
	name?: string;
	value?: Date;
	onChange: (value: Date) => void;
	disabled?: boolean;
	triggerStyle?: string;
	disableMonthNavigation?: boolean;
	daySelectedStyle?: string;
	showOutsideDays?: boolean;
};

export function DatePicker({
	value: date,
	onChange,
	showOutsideDays = true,
	...props
}: DatePickerProps) {
	const [open, setOpen] = React.useState(false);

	const daySelectedCn = classNames(
		"bg-primary text-stone-50 hover:bg-primary hover:text-stone-50 focus:bg-primary focus:text-stone-50",
		props.daySelectedStyle
	);

	const triggerCn = classNames(
		"w-[280px] justify-start text-left font-normal",
		props.triggerStyle,
		{
			"text-muted-foreground": !date,
		}
	);

	const handleOpenChange = (open: boolean) => {
		setOpen(open);
	};

	const toggleOpen = () => {
		setOpen(!open);
	};

	const handleSelect = (selected: Date) => {
		if (onChange) {
			onChange(selected);
			setOpen(false);
		}
	};

	return (
		<Popover modal={true} open={open} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				<Button name={props.name} variant={"outline"} className={triggerCn} onClick={toggleOpen}>
					<CalendarIcon className="w-4 h-4 mr-2" />
					{date ? format(date, "PPP") : <span>Pick a date</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="z-50 w-auto p-0">
				<Calendar
					className="w-full"
					mode="single"
					selected={date}
					onSelect={(selected) => {
						if (selected) {
							handleSelect(selected);
						}
					}}
					initialFocus
					showOutsideDays={showOutsideDays}
					month={showOutsideDays ? undefined : new Date()}
					classNames={{
						day_selected: daySelectedCn,
						caption: "flex flex-col gap-3 text-center",
					}}
					disableNavigation={!showOutsideDays && true}
				/>
			</PopoverContent>
		</Popover>
	);
}
