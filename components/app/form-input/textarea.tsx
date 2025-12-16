import classNames from "classnames";
import React from "react";

type TextareaNativeAttributes = React.ComponentPropsWithRef<"textarea">;

type Ref = HTMLTextAreaElement;

interface TextareaProps extends TextareaNativeAttributes {
	label?: string;
	disabled?: boolean;
	containerStyle?: string;
	invalid?: boolean;
	errorMessage?: string;
	errorStyle?: string;
	floatingLabel?: boolean;
	note?: string;
	notePlacement?: "top" | "bottom";
	noteStyle?: string;
}

const Textarea = React.forwardRef<Ref, TextareaProps>(
	(
		{
			name,
			label = undefined,
			className = "",
			placeholder,
			disabled = false,
			containerStyle = "",
			invalid = false,
			errorStyle,
			errorMessage,
			floatingLabel = false,
			notePlacement = "bottom",
			note,
			noteStyle,
			...rest
		}: TextareaProps,
		ref
	) => {
		const [isFocused, setIsFocused] = React.useState(false);
		const { isInvalid } = React.useMemo(() => {
			let isInvalid = false;
			const userInput = rest.value?.toString();
			if (invalid && !userInput && rest.required) {
				isInvalid = true;
			}
			return { isInvalid };
		}, [invalid, rest.value, rest.required]);

		const hasValue = React.useMemo(() => {
			const userInput = rest.value?.toString();
			return !!userInput && userInput.trim().length > 0;
		}, [rest.value]);

		const shouldFloat = floatingLabel && (isFocused || hasValue);

		const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
			if (floatingLabel) {
				setIsFocused(true);
			}
			if (rest.onFocus) {
				rest.onFocus(e);
			}
		};

		const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
			if (floatingLabel) {
				setIsFocused(false);
			}
			if (rest.onBlur) {
				rest.onBlur(e);
			}
		};

		const container = classNames("input-container", containerStyle, {
			"floating-label-container": floatingLabel,
		});
		const cn = classNames(className, {
			invalid: isInvalid || errorMessage,
		});
		const errorCn = classNames("text-red-500 text-xs", errorStyle, {
			hidden: !errorMessage,
		});

		const labelCn = classNames({
			"floating-label !top-3": floatingLabel,
			floated: shouldFloat,
			"has-error": isInvalid || errorMessage,
			capitalize: !floatingLabel,
		});

		const noteCn = classNames("text-neutral-500 body-3", noteStyle, {
			hidden: !note,
		});

		return (
			<React.Fragment>
				<div className={container}>
					{label && !floatingLabel && (
						<label htmlFor={name} className="capitalize">
							{label}
						</label>
					)}
					{note && notePlacement === "top" && <small className={noteCn}>{note}</small>}
					<textarea
						ref={ref}
						className={cn}
						id={name}
						name={name}
						placeholder={floatingLabel ? (!shouldFloat ? "" : placeholder) : placeholder}
						disabled={disabled}
						onFocus={handleFocus}
						onBlur={handleBlur}
						{...rest}
					/>
					{note && notePlacement === "bottom" && <small className={noteCn}>{note}</small>}
					{label && floatingLabel && (
						<label htmlFor={name} className={labelCn}>
							{label} {rest.required && shouldFloat ? "*" : ""}
						</label>
					)}
					<small className={errorCn}>{errorMessage}</small>
				</div>
			</React.Fragment>
		);
	}
);

Textarea.displayName = "Textarea";

export default Textarea;
