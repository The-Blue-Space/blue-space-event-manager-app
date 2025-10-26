import React from "react";
import "./index.css";
import classNames from "classnames";

type ButtonNativeAttributes = React.ComponentPropsWithoutRef<"button">;

// define the ref type
type Ref = HTMLButtonElement;

type LoaderType = "simple" | "spinner" | "bars" | "dots" | "bars-dots" | "none";
type Variant =
	| "default"
	| "primary"
	| "muted"
	| "secondary"
	| "outline"
	| "ghost"
	| "destructive"
	| "black";

interface ButtonProps extends ButtonNativeAttributes {
	isLoading?: boolean;
	disabled?: boolean;
	className?: string;
	loaderType?: LoaderType;
	variant?: Variant;
	leftIcon?: React.ReactElement;
	rightIcon?: React.ReactElement;
	buttonType?: "icon" | "text";
}
const AppButton = React.forwardRef<Ref, ButtonProps>((props: ButtonProps, ref) => {
	const {
		type,
		rightIcon,
		loaderType = "spinner",
		leftIcon,
		isLoading,
		disabled,
		className,
		variant = "default",
		children,
		buttonType = "text",

		...rest
	} = props;
	const { newIcon: icon, iconPlacement } = React.useMemo(() => {
		const newIcon = rightIcon || leftIcon;

		return {
			newIcon,
			iconPlacement: rightIcon ? ("right" as const) : leftIcon ? ("left" as const) : "middle",
		};
	}, [rightIcon, leftIcon]);

	const loadingIcon = React.useMemo(() => {
		if (isLoading && loaderType !== "none") {
			return (
				<div
					data-testid={loaderType}
					className={`w-4 h-4 mx-auto ${loaderType}`}
				/>
			);
		}
		return null;
	}, [loaderType, isLoading]);

	const cn = classNames(className, {
		"button-default": variant === "default",
		"button-primary text-white": variant === "primary",
		"button-secondary": variant === "secondary",
		"button-destructive ": variant === "destructive",
		"button-outline": variant === "outline",
		"button-muted": variant === "muted",
		"button-ghost": variant === "ghost",
		"button-black": variant === "black",
		"flex items-center": leftIcon || rightIcon,
		"min-w-20": buttonType === "text",
		"p-0": buttonType === "icon",
	});
	return (
		<button
			type={type ? "submit" : "button"}
			ref={ref}
			className={cn}
			disabled={isLoading || disabled}
			{...rest}
		>
			{/** render icon before */}
			{ !isLoading && icon && iconPlacement === "left" ? (
				<span
					className={`inline-flex shrink-0 self-center items-center ${
						children && !isLoading && "mr-2"
					}`}
				>
					{icon}
				</span>
			) : null}

			{/** hide button text during loading state */}
			{!isLoading || loaderType === "none" ? children : null}
			{loadingIcon}

			{/** render icon after */}
			{ !isLoading && icon && iconPlacement === "right" ? (
				<span className={`inline-flex shrink-0 self-center  ${children && !isLoading && "ml-2"}`}>
					{icon}
				</span>
			) : null}
		</button>
	);
});

AppButton.displayName = "AppButton";

export default AppButton;
