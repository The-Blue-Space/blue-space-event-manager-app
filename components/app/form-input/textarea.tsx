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
			...rest
		}: TextareaProps,
		ref
	) => {
		const { isInvalid } = React.useMemo(() => {
			let isInvalid = false;
			const userInput = rest.value?.toString();
			if (invalid && !userInput && rest.required) {
				isInvalid = true;
			}
			return { isInvalid };
		}, [invalid, rest.value, rest.required]);

		const container = classNames("input-container", containerStyle);
		const cn = classNames(className, {
			invalid: isInvalid || errorMessage,
		});
		const errorCn = classNames("text-red-500 text-xs", errorStyle, {
			hidden: !errorMessage,
		});

		return (
			<React.Fragment>
				<div className={container}>
					{label && (
						<label htmlFor={name} className="capitalize">
							{label}
						</label>
					)}
					<textarea
						ref={ref}
						className={cn}
						id={name}
						name={name}
						placeholder={placeholder}
						disabled={disabled}
						{...rest}
					/>
					<small className={errorCn}>{errorMessage}</small>
				</div>
			</React.Fragment>
		);
	}
);

Textarea.displayName = "Textarea";

export default Textarea;
