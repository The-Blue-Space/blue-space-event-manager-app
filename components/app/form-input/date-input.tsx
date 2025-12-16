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
	floatingLabel?: boolean;
	notePlacement?: "top" | "bottom";
	note?: string | React.ReactNode;
	noteStyle?: string;
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
	floatingLabel = false,
	notePlacement = "bottom",
	note,
	noteStyle,
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

	const hasValue = React.useMemo(() => {
		return !!value;
	}, [value]);
	const shouldFloat = floatingLabel && (open || hasValue);

	// const daySelectedCn = classNames(
	// 	"bg-primary text-stone-50 hover:bg-primary hover:text-stone-50 focus:bg-primary focus:text-stone-50",
	// 	props.daySelectedStyle
	// );

	const triggerCn = classNames(
		"w-full flex justify-between text-left font-normal body-3",
		props.triggerStyle,
		{
			"text-muted-foreground": !value,
			invalid: isInvalid,
		}
	);

	const labelCn = classNames({
		"floating-label !top-5": floatingLabel,
		floated: shouldFloat,
		"has-error": isInvalid || props.errorMessage,
		capitalize: !floatingLabel,
	});
	const container = classNames("input-container", containerStyle);
	const errorCn = classNames("text-red-500 text-xs ", props.errorStyle, {
		hidden: !props.errorMessage,
	});

	const noteCn = classNames("text-neutral-500 body-3", noteStyle);

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

	const sanitizeDate = (date?: Date) => {
		logger.log("date", date);
		try {
			if (typeof date === "string") {
				logger.log("date is string", date);

				if (date === "invalid date") return undefined;
				logger.log("date is not invalid date", date);
				return new Date(date);
			}
			// Return true for valid Date objects
			if (date instanceof Date && !isNaN(date.getTime())) {
				return true;
			}
			return undefined;
		} catch (error) {
			throw error;
			return undefined;
		}
	};

	return (
		<React.Fragment>
			<div className={container}>
				{label && !floatingLabel && (
					<label htmlFor={name} className="capitalize">
						{label} {props.required && <span className="text-red-500">*</span>}
					</label>
				)}
				{note && notePlacement === "top" && <small className={noteCn}>{note}</small>}
				<Popover modal={true} open={open} onOpenChange={handleOpenChange}>
					<PopoverTrigger asChild>
						{/* <> */}

						<Button
							type="button"
							name={name}
							variant={"outline"}
							className={triggerCn}
							onClick={toggleOpen}
							disabled={disabled}
						>
							{icon_placement === "left" && floatingLabel
								? shouldFloat
									? icon ?? <CalendarIcon className="mr-2 w-4 h-4" />
									: null
								: icon_placement === "left" && !floatingLabel
								? icon ?? <CalendarIcon className="mr-2 w-4 h-4" />
								: null}

							{floatingLabel ? (
								!shouldFloat ? (
									""
								) : sanitizeDate(value) && value ? (
									format(value, "PPP")
								) : (
									<span> {placeholder ?? "Pick a date"}</span>
								)
							) : sanitizeDate(value) && value ? (
								format(value, "PPP")
							) : (
								<span> {placeholder ?? "Pick a date"}</span>
							)}
							{icon_placement === "right" && floatingLabel
								? shouldFloat
									? icon ?? <CalendarIcon className="mr-2 w-4 h-4" />
									: null
								: icon_placement === "right" && !floatingLabel
								? icon ?? <CalendarIcon className="mr-2 w-4 h-4" />
								: null}
						</Button>
						{/* </> */}
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

				{note && notePlacement === "bottom" && <small className={noteCn}>{note}</small>}
				{label && floatingLabel && (
					<label htmlFor={name} className={labelCn}>
						{label} {props.required && shouldFloat ? "*" : ""}
					</label>
				)}
				<small className={errorCn}>{props.errorMessage}</small>
			</div>
		</React.Fragment>
	);
}
