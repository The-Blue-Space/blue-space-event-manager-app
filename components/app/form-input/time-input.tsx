import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as React from "react";
import classNames from "classnames";

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

import { normalizeTimeValue } from "@/lib/date-time";

type TimeSelectProps = {
	name?: string;
	value?: string | null;
	onChange: (value: string) => void;
	disabled?: boolean;
	placeholder?: string;
	label?: string;
	note?: string;
	notePlacement?: "top" | "bottom";
	noteStyle?: string;
	floatingLabel?: boolean;
	required?: boolean;
	errorMessage?: string;
	errorStyle?: string;
	icon_placement?: "left" | "right";
	icon?: React.ReactNode;
	containerStyle?: string;
	triggerStyle?: string;
	modal?: boolean;
};

export default React.memo(function TimeInput({
	name,
	value = "",
	onChange,
	disabled = false,
	placeholder = "Select time",
	note,
	notePlacement = "bottom",
	noteStyle,
	label,
	floatingLabel = false,
	required = false,
	errorMessage,
	errorStyle,
	icon_placement = "right",
	icon,
	containerStyle,
	triggerStyle,
	modal = false,
}: TimeSelectProps) {
	const [open, setOpen] = React.useState(false);
	const normalizedValue = React.useMemo(() => normalizeTimeValue(value), [value]);
	const selectedOption = timeOptions.find((option) => option.value === normalizedValue);
	const displayValue = selectedOption ? selectedOption.label : placeholder;

	const { isInvalid } = React.useMemo(() => {
		let isInvalid = false;
		const userInput = value?.toString();
		if (!userInput && required) {
			isInvalid = true;
		}
		return { isInvalid };
	}, [value, required]);

	const hasValue = React.useMemo(() => {
		return !!normalizedValue;
	}, [normalizedValue]);
	const shouldFloat = floatingLabel && (open || hasValue);

	const triggerCn = classNames(
		"min-w-28 justify-between text-left font-normal px-2 body-3",
		triggerStyle,
		{
			"text-muted-foreground": !value,
			invalid: isInvalid,
		}
	);

	const labelCn = classNames({
		"floating-label !top-5": floatingLabel,
		floated: shouldFloat,
		"has-error": errorMessage,
		capitalize: !floatingLabel,
	});
	const container = classNames("input-container", containerStyle);
	const errorCn = classNames("text-red-500 text-xs ", errorStyle, {
		hidden: !errorMessage,
	});

	const noteCn = classNames("text-neutral-700 body-3", noteStyle);

	const handleOpenChange = (open: boolean) => {
		setOpen(open);
	};

	const toggleOpen = () => {
		setOpen(!open);
	};

	const handleSelect = (selected: string) => {
		if (onChange) {
			onChange(selected);
			setOpen(false);
		}
	};

	return (
		<div className={container}>
			{label && !floatingLabel && (
				<label htmlFor={name} className="capitalize">
					{label} {required && <span className="text-red-500">*</span>}
				</label>
			)}

			{note && notePlacement === "top" && <small className={noteCn}>{note}</small>}
			<DropdownMenu open={open} onOpenChange={handleOpenChange} modal={modal}>
				<DropdownMenuTrigger asChild>
					<Button
						type="button"
						variant="outline"
						className={triggerCn}
						disabled={disabled}
						onClick={toggleOpen}
					>
						{icon_placement === "left" && floatingLabel
							? shouldFloat
								? icon ?? <Clock className="h-4 w-4" />
								: null
							: icon_placement === "left" && !floatingLabel
							? icon ?? <Clock className="h-4 w-4" />
							: null}
						{floatingLabel ? (!shouldFloat ? "" : displayValue) : displayValue}
						{icon_placement === "right"
							? floatingLabel && shouldFloat
								? icon ?? <Clock className="h-4 w-4" />
								: null
							: icon_placement === "left"
							? icon ?? <Clock className="h-4 w-4" />
							: null}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
					{timeOptions.map((option) => (
						<DropdownMenuItem
							key={option.value}
							onClick={() => handleSelect(option.value)}
							className="cursor-pointer"
						>
							{option.label}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
				{note && notePlacement === "bottom" && <small className={noteCn}>{note}</small>}
				{label && floatingLabel && (
					<label htmlFor={name} className={labelCn}>
						{label} {required && shouldFloat ? "*" : ""}
					</label>
				)}
				<small className={errorCn}>{errorMessage}</small>
			</DropdownMenu>
		</div>
	);
});

// import { format } from "date-fns";
// import { Calendar as CalendarIcon } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import classNames from "classnames";

// import * as React from "react";
// import logger from "@/lib/app-logger";

// type DatePickerProps = {
// 	name?: string;
// 	value: Date | undefined;
// 	onChange: (value: Date) => void;
// 	disabled?: boolean;
// 	triggerStyle?: string;
// 	disableMonthNavigation?: boolean;
// 	daySelectedStyle?: string;
// 	showOutsideDays?: boolean;

// 	label?: string;
// 	placeholder?: string;
// 	containerStyle?: string;
// 	hideIcon?: boolean;
// 	invalid?: boolean;
// 	overrideInvalid?: boolean;
// 	required?: boolean;
// 	errorMessage?: string;
// 	errorStyle?: string;
// 	icon_placement?: "left" | "right";
// 	icon?: React.ReactNode;
// 	floatingLabel?: boolean;
// 	notePlacement?: "top" | "bottom";
// 	note?: string;
// 	noteStyle?: string;
// };

// export default function DateInput({
// 	name,
// 	value,
// 	onChange,
// 	// showOutsideDays = true,
// 	label,
// 	placeholder,
// 	disabled,
// 	containerStyle,
// 	invalid,
// 	icon_placement = "right",
// 	icon,
// 	floatingLabel = false,
// 	notePlacement = "bottom",
// 	note,
// 	noteStyle,
// 	...props
// }: DatePickerProps) {
// 	const [open, setOpen] = React.useState(false);
// 	const [dropdown] =
// 		React.useState<React.ComponentProps<typeof Calendar>["captionLayout"]>("dropdown");

// 	const { isInvalid } = React.useMemo(() => {
// 		let isInvalid = false;
// 		const userInput = value?.toString();
// 		if (props.overrideInvalid) {
// 			isInvalid = true;
// 		} else if (invalid && !userInput && props.required) {
// 			isInvalid = true;
// 		}
// 		return { isInvalid };
// 	}, [invalid, value, props.required, props.overrideInvalid]);

// 	const hasValue = React.useMemo(() => {
// 		return !!value;
// 	}, [value]);
// 	const shouldFloat = floatingLabel && (open || hasValue);

// 	// const daySelectedCn = classNames(
// 	// 	"bg-primary text-stone-50 hover:bg-primary hover:text-stone-50 focus:bg-primary focus:text-stone-50",
// 	// 	props.daySelectedStyle
// 	// );

// 	const triggerCn = classNames(
// 		"w-full flex justify-between text-left font-normal",
// 		props.triggerStyle,
// 		{
// 			"text-muted-foreground": !value,
// 			invalid: isInvalid,
// 		}
// 	);

// 	const labelCn = classNames({
// 		"floating-label !top-5": floatingLabel,
// 		floated: shouldFloat,
// 		"has-error": isInvalid || props.errorMessage,
// 		capitalize: !floatingLabel,
// 	});
// 	const container = classNames("input-container", containerStyle);
// 	const errorCn = classNames("text-red-500 text-xs ", props.errorStyle, {
// 		hidden: !props.errorMessage,
// 	});

// 	const noteCn = classNames("text-neutral-700 body-3", noteStyle);

// 	const handleOpenChange = (open: boolean) => {
// 		setOpen(open);
// 	};

// 	const toggleOpen = () => {
// 		setOpen(!open);
// 	};

// 	const handleSelect = (selected: Date) => {
// 		if (onChange) {
// 			onChange(selected);
// 			setOpen(false);
// 		}
// 	};

// 	const sanitizeData = (date?: Date) => {
// 		logger.log("date", date);
// 		try {
// 			if (typeof date === "string") {
// 				logger.log("date is string", date);

// 				if (date === "invalid date") return undefined;
// 				logger.log("date is not invalid date", date);
// 				return new Date(date);
// 			}
// 		} catch (error) {
// 			throw error;
// 			return undefined;
// 		}
// 	};

// 	return (
// 		<React.Fragment>
// 			<div className={container}>
// 				{label && !floatingLabel && (
// 					<label htmlFor={name} className="capitalize">
// 						{label} {props.required && <span className="text-red-500">*</span>}
// 					</label>
// 				)}
// 				<Popover modal={true} open={open} onOpenChange={handleOpenChange}>
// 					<PopoverTrigger asChild>
// 						<>
// 							{note && notePlacement === "top" && <small className={noteCn}>{note}</small>}

// 							<Button
// 								name={name}
// 								variant={"outline"}
// 								className={triggerCn}
// 								onClick={toggleOpen}
// 								disabled={disabled}
// 							>
// 								{!floatingLabel && icon_placement === "left"
// 									? icon ?? <CalendarIcon className="mr-2 w-4 h-4" />
// 									: null}

// 								{!floatingLabel ? (
// 									sanitizeData(value) && value ? (
// 										format(value, "PPP")
// 									) : (
// 										<span> {placeholder ?? "Pick a date"}</span>
// 									)
// 								) : null}
// 								{!floatingLabel && icon_placement === "right"
// 									? icon ?? <CalendarIcon className="mr-2 w-4 h-4" />
// 									: null}
// 							</Button>
// 							{note && notePlacement === "bottom" && <small className={noteCn}>{note}</small>}
// 						</>
// 					</PopoverTrigger>
// 					<PopoverContent className="z-50 p-0 w-auto">
// 						<Calendar
// 							mode="single"
// 							selected={value}
// 							onSelect={(selected) => {
// 								if (selected) {
// 									handleSelect(selected);
// 								}
// 							}}
// 							captionLayout={dropdown}
// 							disabled={props.disableMonthNavigation ? true : disabled}
// 							// month={showOutsideDays ? undefined : new Date()}
// 							classNames={
// 								{
// 									// day_selected: daySelectedCn,
// 									// caption: "flex flex-col gap-2 text-center",
// 								}
// 							}
// 						/>
// 					</PopoverContent>
// 				</Popover>
// 				{label && floatingLabel && (
// 					<label htmlFor={name} className={labelCn}>
// 						{label} {props.required && shouldFloat ? "*" : ""}
// 					</label>
// 				)}
// 				<small className={errorCn}>{props.errorMessage}</small>
// 			</div>
// 		</React.Fragment>
// 	);
// }
