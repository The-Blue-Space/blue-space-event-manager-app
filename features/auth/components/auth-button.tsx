import * as React from "react";
import classNames from "classnames";

type Variant = "primary" | "secondary";

const base =
	"inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border text-[15px] font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auth-link";

const variants: Record<Variant, string> = {
	primary:
		"border-transparent bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 disabled:cursor-default disabled:bg-[#8E8DB0]",
	secondary:
		"border-auth-field bg-white text-auth-ink hover:bg-[#F1F2F9] active:bg-[#E7E9F4] disabled:cursor-default disabled:border-auth-line disabled:bg-auth-page disabled:text-auth-muted",
};

/** Class names for links that should look like auth buttons. */
export function authButtonClass(variant: Variant = "primary", className?: string) {
	return classNames(base, variants[variant], className);
}

type AuthButtonProps = React.ComponentPropsWithoutRef<"button"> & {
	variant?: Variant;
	isLoading?: boolean;
	/** Label while loading, e.g. "Logging in…". */
	loadingText?: string;
};

export default function AuthButton({
	variant = "primary",
	isLoading = false,
	loadingText,
	type = "button",
	disabled,
	className,
	children,
	...rest
}: AuthButtonProps) {
	return (
		<button
			type={type}
			disabled={disabled || isLoading}
			aria-busy={isLoading || undefined}
			className={classNames(
				base,
				variants[variant],
				isLoading && variant === "primary" && "!cursor-progress !bg-primary-600",
				isLoading && variant === "secondary" && "!cursor-progress",
				className
			)}
			{...rest}
		>
			{isLoading && (
				<span
					aria-hidden="true"
					className={classNames(
						"size-4 animate-spin rounded-full border-2 motion-reduce:animate-none",
						variant === "primary" ? "border-white/35 border-t-white" : "border-primary-500/25 border-t-primary-500"
					)}
				/>
			)}
			<span>{isLoading && loadingText ? loadingText : children}</span>
		</button>
	);
}
