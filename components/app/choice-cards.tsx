import classNames from "classnames";

export type Choice<T extends string | boolean> = { value: T; title: string; detail: string };

type ChoiceCardsProps<T extends string | boolean> = {
	name: string;
	legend: string;
	hint?: string;
	value: T;
	choices: Choice<T>[];
	onChange: (value: T) => void;
	className?: string;
};

/** A labelled group of radio cards: a title and one-line explanation per choice. */
export default function ChoiceCards<T extends string | boolean>({ name, legend, hint, value, choices, onChange, className }: ChoiceCardsProps<T>) {
	return (
		<fieldset className="grid gap-2">
			<legend className="mb-2 text-[13px] font-semibold text-auth-ink">{legend}</legend>
			<div className={classNames("grid gap-2.5", className)}>
				{choices.map((choice) => {
					const checked = choice.value === value;
					return (
						<label
							key={String(choice.value)}
							className={classNames(
								"flex cursor-pointer items-start gap-2.5 rounded-xl border px-3.5 py-3 transition-[border-color,box-shadow,background-color] duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-auth-link has-[:focus-visible]:ring-offset-2",
								checked ? "border-primary-500 bg-auth-page shadow-[0_0_0_1px_#29285C]" : "border-auth-line bg-white hover:border-auth-field"
							)}
						>
							<input
								type="radio"
								name={name}
								value={String(choice.value)}
								checked={checked}
								onChange={() => onChange(choice.value)}
								className="sr-only"
							/>
							<span
								aria-hidden="true"
								className={classNames(
									"mt-0.5 size-4 shrink-0 rounded-full border bg-white",
									checked ? "border-[5px] border-primary-500" : "border-auth-field"
								)}
							/>
							<span className="grid gap-0.5">
								<span className="text-[14px] font-bold text-auth-ink">{choice.title}</span>
								<span className="text-[12.5px] leading-[1.45] text-auth-muted">{choice.detail}</span>
							</span>
						</label>
					);
				})}
			</div>
			{hint && <p className="text-[12.5px] text-auth-muted">{hint}</p>}
		</fieldset>
	);
}
