import { Input } from "@/components/app/form-input";
import classNames from "classnames";
import * as React from "react";

export const passwordValidations = [
	{
		check: (t: string) => t.length >= 8,
		message: "Minimum of 8 characters",
	},

	{
		check: (t: string) => /[A-Z]/.test(t) && /[a-z]/.test(t),
		message: "uppercase and lowercase",
	},
	{
		check: (t: string) => /\d/.test(t) && /[!@#$%^&*(),.?":{}|<>]/.test(t),
		message: "must contain number and special character e.g @#$%^&)",
	},
];

type PasswordProps = {
	value: string;
	onChange(e: React.ChangeEvent<HTMLInputElement>): void;
	isLoading: boolean;
	name: string;
	label: string;
	placeholder: string;
};

export default React.memo(function Password({
	value,
	onChange,
	isLoading,
	name,
	label,
	placeholder,
}: PasswordProps) {
	const checks = React.useMemo(() => passwordValidations, []);

	const validations = React.useMemo(() => checks.map((item) => item.check(value)), [value, checks]);

	const isValid = React.useMemo(() => {
		return validations.some((val) => val === false) && value.length > 0;
	}, [value, validations]);

	return (
		<div className="space-y-2 col-span-full">
			<Input
				name={name}
				type="password"
				label={label}
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				disabled={isLoading}
				overrideInvalid={isValid}
				invalid={isValid}
				required
			/>
			<div className="flex flex-wrap gap-2">
				{checks.map((item, idx) => {
					const cn = classNames("px-3 py-1 rounded-lg body-4 font-medium border", {
						"bg-neutral-200/50 text-neutral-900": value.length === 0, // Neutral state
						"bg-success-200/10 text-success-200": validations[idx], // Valid state
						"bg-error-100/20 border-error-200 text-error-300 shake-animation":
							!validations[idx] && value.length > 0, // Invalid state
					});

					if (validations[idx]) return;
					return (
						<small key={idx} className={cn}>
							{item.message}
						</small>
					);
				})}
			</div>
		</div>
	);
});
