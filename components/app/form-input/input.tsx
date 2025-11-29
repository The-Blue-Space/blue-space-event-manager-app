import React from "react";
import eye from "./assets/eye.svg";
import eyeSlash from "./assets/eye-slash.svg";
import classNames from "classnames";
import Image from "next/image";

type InputNativeAttributes = React.ComponentPropsWithRef<"input">;

type Ref = HTMLInputElement;

interface InputProps extends InputNativeAttributes {
	label?: string;
	disabled?: boolean;
	containerStyle?: string;
	hideIcon?: boolean;
	invalid?: boolean;
	errorMessage?: string;
	overrideInvalid?: boolean;
	errorStyle?: string;
	note?: string;
	noteStyle?: string;
	notePlacement?: "top" | "bottom";
	floatingComponent?: React.ReactNode | string;
	hideOutline?: boolean;
	hideBorder?: boolean;
	floatingComponentStyle?: string;
	floatingLabel?: boolean;
}

const Input = React.forwardRef<Ref, InputProps>((props: InputProps, ref) => {
	const {
		name,
		type,
		label,
		className,
		placeholder,
		disabled,
		containerStyle,
		hideIcon,
		invalid,
		overrideInvalid: override_invalid,
		errorMessage,
		errorStyle,
		note,
		noteStyle,
		floatingComponent,
		floatingComponentStyle,
		hideOutline = false,
		hideBorder = false,
		floatingLabel = false,
		notePlacement = "bottom",
		...rest
	} = props;
	const [togglePassword, setTogglePassword] = React.useState(false);
	const [isFocused, setIsFocused] = React.useState(false);

	const showPassword = type === "password" && !hideIcon && togglePassword;
	const unChecked = type === "checkbox" && !rest.checked;

	const { isInvalid } = React.useMemo(() => {
		let isInvalid = false;
		const userInput = rest.value?.toString();
		if (override_invalid) {
			isInvalid = true;
		} else if (invalid && !userInput && rest.required) {
			isInvalid = true;
		}
		return { isInvalid };
	}, [invalid, rest.value, rest.required, override_invalid]);

	const hasValue = React.useMemo(() => {
		const userInput = rest.value?.toString();
		return !!userInput && userInput.length > 0;
	}, [rest.value]);

	const shouldFloat = floatingLabel && (isFocused || hasValue);

	const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
		if (floatingLabel) {
			setIsFocused(true);
		}
		if (rest.onFocus) {
			rest.onFocus(e);
		}
	};

	const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		if (floatingLabel) {
			setIsFocused(false);
		}
		if (rest.onBlur) {
			rest.onBlur(e);
		}
	};

	const container = classNames("input-container z-50", containerStyle, {
		"floating-label-container": floatingLabel,
	});

	const cn = classNames("relative peer", className, {
		invalid: isInvalid || unChecked || errorMessage,
		"!outline-none !ring-0": hideOutline,
		"!border-transparent": hideBorder,
	});

	const errorCn = classNames("text-red-500 text-xs", errorStyle, {
		hidden: !errorMessage,
	});

	const noteCn = classNames("text-neutral-500 body-3", noteStyle);
	const floatingComponentCn = classNames(
		`absolute right-0 top-1/2 -translate-y-1/2 flex items-center  justify-center 
		bg-neutral-200 h-full px-2 rounded-r-lg border-2 border-l-0 border-transparent
		 peer-focus:border-neutral-400 peer-focus:border-r-2 peer-focus:border-y-2`,
		floatingComponentStyle,
		{
			"!border-transparent": hideBorder,
			"!outline-none !ring-0": hideOutline,
		}
	);

	const labelCn = classNames({
		"floating-label": floatingLabel,
		floated: shouldFloat,
		"has-error": isInvalid || errorMessage,
		capitalize: !floatingLabel,
		"!top-5": notePlacement=="bottom"
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
				<input
					ref={ref}
					className={cn}
					type={showPassword ? "text" : type}
					id={name}
					name={name}
					placeholder={floatingLabel ? (!shouldFloat ? "" : placeholder) : placeholder}
					disabled={disabled}
					min={rest.min?? 1}
					onFocus={handleFocus}
					onBlur={handleBlur}
					{...rest}
				/>

				{label && floatingLabel && (
					<label htmlFor={name} className={labelCn}>
						{label}
						{rest.required && (isFocused || hasValue) ? (
							<span className="ml-1 text-red-500">*</span>
						) : (
							""
						)}
					</label>
				)}
				{type === "password" && !hideIcon ? (
					<div
						id="toggleBtn"
						onClick={() => setTogglePassword(!togglePassword)}
						className="absolute right-3 top-1/2 -translate-y-1/2"
					>
						<Image src={togglePassword ? eyeSlash : eye} alt="eye icon" className="w-5" />
					</div>
				) : null}
				{floatingComponent && <div className={floatingComponentCn}>{floatingComponent}</div>}
			{note && notePlacement === "bottom" && <small className={noteCn}>{note}</small>}
			</div>

			<small className={errorCn}>{errorMessage}</small>
		</React.Fragment>
	);
});

Input.displayName = "Input";

export default Input;
