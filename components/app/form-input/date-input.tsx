import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import classNames from "classnames";

import * as React from "react";
import logger from "@/lib/app-logger";

type DatePickerProps = {
	name?: string;
	value: Date | undefined;
	onChange: (value: Date) => void;
	disabled?: boolean;
	triggerStyle?: string;
	disableMonthNavigation?: boolean;
	daySelectedStyle?: string;
	showOutsideDays?: boolean;

	label?: string;
	placeholder?: string;
	containerStyle?: string;
	hideIcon?: boolean;
	invalid?: boolean;
	overrideInvalid?: boolean;
	required?: boolean;
	errorMessage?: string;
	errorStyle?: string;
	icon_placement?: "left" | "right";
	icon?: React.ReactNode;
};

export default function DateInput({
	name,
	value,
	onChange,
	// showOutsideDays = true,
	label,
	placeholder,
	disabled,
	containerStyle,
	invalid,
	icon_placement = "right",
	icon,

	...props
}: DatePickerProps) {
	const [open, setOpen] = React.useState(false);
	const [dropdown] =
		React.useState<React.ComponentProps<typeof Calendar>["captionLayout"]>("dropdown");

	const { isInvalid } = React.useMemo(() => {
		let isInvalid = false;
		const userInput = value?.toString();
		if (props.overrideInvalid) {
			isInvalid = true;
		} else if (invalid && !userInput && props.required) {
			isInvalid = true;
		}
		return { isInvalid };
	}, [invalid, value, props.required, props.overrideInvalid]);

	// const daySelectedCn = classNames(
	// 	"bg-primary text-stone-50 hover:bg-primary hover:text-stone-50 focus:bg-primary focus:text-stone-50",
	// 	props.daySelectedStyle
	// );

	const triggerCn = classNames("w-full flex justify-between text-left font-normal", props.triggerStyle, {
		"text-muted-foreground": !value,
		invalid: isInvalid,
	});

	const container = classNames("input-container", containerStyle);
	const errorCn = classNames("text-red-500 text-xs ", props.errorStyle, {
		hidden: !props.errorMessage,
	});

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

	const sanitizeData = (date?: Date) => {
		logger.log("date", date);
		try {
			if (typeof date === "string") {
				logger.log("date is string", date);

				if (date === "invalid date") return undefined;
				logger.log("date is not invalid date", date);
				return new Date(date);
			}
		} catch (error) {
			throw error;
			return undefined;
		}
	
		
	};

	return (
		<React.Fragment>
			<div className={container}>
				{label && (
					<label htmlFor={name} className="capitalize">
						{label} {props.required && <span className="text-red-500">*</span>}
					</label>
				)}
				<Popover modal={true} open={open} onOpenChange={handleOpenChange}>
					<PopoverTrigger asChild>
						<Button
							name={name}
							variant={"outline"}
							className={triggerCn}
							onClick={toggleOpen}
							disabled={disabled}
						>
							{icon_placement === "left" ? icon ?? <CalendarIcon className="mr-2 w-4 h-4" /> : null}

							{sanitizeData(value) && value ? (
								format(value, "PPP")
							) : (
								<span> {placeholder ?? "Pick a date"}</span>
							)}
							{icon_placement === "right"
								? icon ?? <CalendarIcon className="mr-2 w-4 h-4" />
								: null}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="z-50 p-0 w-auto">
						<Calendar
							mode="single"
							selected={value}
							onSelect={(selected) => {
								if (selected) {
									handleSelect(selected);
								}
							}}
							captionLayout={dropdown}
							disabled={props.disableMonthNavigation ? true : disabled}
							// month={showOutsideDays ? undefined : new Date()}
							classNames={
								{
									// day_selected: daySelectedCn,
									// caption: "flex flex-col gap-2 text-center",
								}
							}
						/>
					</PopoverContent>
				</Popover>
				<small className={errorCn}>{props.errorMessage}</small>
			</div>
		</React.Fragment>
	);
}
