import * as React from "react";
import classNames from "classnames";
import { CircleAlert } from "lucide-react";

type FieldProps = {
	id: string;
	label: string;
	hint?: string;
	error?: string;
	optional?: boolean;
	/** Shown at the end of the label row, e.g. a link or a character count. */
	aside?: React.ReactNode;
	children: React.ReactNode;
};

/** A label above its control, with an error or hint below. Give the control `controlProps(id, …)`. */
export default function Field({ id, label, hint, error, optional, aside, children }: FieldProps) {
	return (
		<div className="grid min-w-0 gap-1.5">
			<div className="flex items-baseline justify-between gap-3">
				<label htmlFor={id} className="text-[13px] font-semibold text-auth-ink">
					{label}
					{optional && <span className="font-medium text-auth-muted"> (optional)</span>}
				</label>
				{aside}
			</div>

			{children}

			{error ? (
				<p id={`${id}-message`} className="flex items-start gap-1.5 text-[13px] leading-[1.45] text-auth-error">
					<CircleAlert aria-hidden="true" className="mt-px size-[15px] shrink-0" />
					<span>{error}</span>
				</p>
			) : hint ? (
				<p id={`${id}-message`} className="text-[13px] leading-[1.45] text-auth-muted">
					{hint}
				</p>
			) : null}
		</div>
	);
}

/** Ties a control to its Field's label and message. */
export function controlProps(id: string, { error, hint, invalid }: { error?: string; hint?: string; invalid?: boolean }) {
	return {
		id,
		"aria-invalid": Boolean(error) || Boolean(invalid) || undefined,
		"aria-describedby": error || hint ? `${id}-message` : undefined,
	};
}

/** Shared look for inputs, textareas and selects. Callers add height or padding. */
export function controlClass(invalid: boolean, className?: string) {
	return classNames(
		"w-full rounded-lg border bg-white px-3.5 text-[15px] font-medium text-auth-ink transition-[border-color,box-shadow] duration-150",
		"placeholder:font-normal placeholder:text-auth-placeholder focus:outline-none",
		"disabled:cursor-not-allowed disabled:bg-auth-page disabled:text-auth-muted",
		invalid
			? "border-auth-error focus:shadow-[0_0_0_3px_rgba(175,55,55,0.18)]"
			: "border-auth-field hover:border-auth-field-hover focus:border-auth-link focus:shadow-[0_0_0_3px_rgba(79,77,177,0.2)]",
		className
	);
}
