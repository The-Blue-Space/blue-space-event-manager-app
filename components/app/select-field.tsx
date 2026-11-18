"use client";
import { controlClass } from "@/components/app/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SelectFieldOption = { value: string; label: string };

type SelectFieldProps = {
	/** Spread `controlProps(id, …)` here so the Field's label and message point at the trigger. */
	id: string;
	"aria-invalid"?: boolean;
	"aria-describedby"?: string;
	value: string;
	options: SelectFieldOption[];
	onChange: (value: string) => void;
	placeholder: string;
	disabled?: boolean;
};

/** A short list of options in the shadcn Select, styled like the other form fields. */
export default function SelectField({ value, options, onChange, placeholder, disabled, ...trigger }: SelectFieldProps) {
	return (
		<Select value={value} onValueChange={onChange} disabled={disabled}>
			<SelectTrigger
				{...trigger}
				className={cn(
					controlClass(Boolean(trigger["aria-invalid"])),
					"h-11 shadow-none data-[size=default]:h-11 data-[placeholder]:font-normal data-[placeholder]:text-auth-placeholder focus-visible:ring-0",
					"[&_svg:not([class*='text-'])]:text-auth-muted [&>svg]:size-[18px] [&>svg]:opacity-100 [&>span]:truncate"
				)}
			>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent className="max-h-[min(320px,var(--radix-select-content-available-height))] rounded-xl border-auth-line bg-white font-manrope text-auth-ink shadow-[0_16px_40px_-16px_rgba(25,24,55,0.35)]">
				{options.map((option) => (
					<SelectItem
						key={option.value}
						value={option.value}
						className="h-10 cursor-pointer rounded-lg pl-2.5 pr-9 text-[14px] font-medium text-auth-ink outline-none focus:bg-auth-info-soft focus:text-auth-ink [&_svg:not([class*='text-'])]:text-auth-link"
					>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
