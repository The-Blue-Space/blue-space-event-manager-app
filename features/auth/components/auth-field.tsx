"use client";
import * as React from "react";
import classNames from "classnames";
import Field, { controlClass, controlProps } from "@/components/app/field";

type AuthFieldProps = Omit<React.ComponentPropsWithoutRef<"input">, "id"> & {
	id: string;
	label: string;
	hint?: string;
	error?: string;
	/** Mark the field invalid without a message of its own (e.g. a form-level alert explains it). */
	invalid?: boolean;
	optional?: boolean;
	/** Shown at the end of the label row, e.g. a "Forgot password?" link. */
	aside?: React.ReactNode;
};

export default function AuthField({
	id,
	label,
	hint,
	error,
	invalid,
	optional,
	aside,
	type = "text",
	className,
	name,
	...rest
}: AuthFieldProps) {
	const [visible, setVisible] = React.useState(false);
	const isPassword = type === "password";

	return (
		<Field id={id} label={label} hint={hint} error={error} optional={optional} aside={aside}>
			<div className="relative">
				<input
					{...controlProps(id, { error, hint, invalid })}
					name={name ?? id}
					type={isPassword && visible ? "text" : type}
					className={controlClass(Boolean(error) || Boolean(invalid), classNames("h-11", isPassword && "pr-[68px]", className))}
					{...rest}
				/>
				{isPassword && (
					<button
						type="button"
						onClick={() => setVisible((value) => !value)}
						aria-pressed={visible}
						aria-label={visible ? "Hide password" : "Show password"}
						className="absolute right-1.5 top-1.5 h-8 rounded-md px-2.5 text-[13px] font-semibold text-auth-link transition-colors duration-150 hover:bg-auth-info-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-link"
					>
						{visible ? "Hide" : "Show"}
					</button>
				)}
			</div>
		</Field>
	);
}
