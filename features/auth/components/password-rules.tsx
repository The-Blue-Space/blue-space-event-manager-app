import classNames from "classnames";
import { Check } from "lucide-react";
import { PASSWORD_RULES } from "../lib/password";

type PasswordRulesProps = {
	/** Point the password input's aria-describedby at this id. */
	id: string;
	password: string;
	/** After a submit attempt, rules that still aren't met turn red. */
	attempted: boolean;
};

export default function PasswordRules({ id, password, attempted }: PasswordRulesProps) {
	return (
		<ul id={id} aria-label="Your password needs" className="-mt-1 flex flex-wrap gap-x-4 gap-y-1.5" aria-live="polite">
			{PASSWORD_RULES.map((rule) => {
				const met = rule.test(password);
				return (
					<li
						key={rule.id}
						className={classNames(
							"flex items-center gap-1.5 text-[13px]",
							met ? "text-auth-success" : attempted ? "font-semibold text-auth-error" : "text-auth-muted"
						)}
					>
						<span
							className={classNames(
								"grid size-4 shrink-0 place-items-center rounded-full border transition-colors duration-150",
								met ? "border-auth-success bg-auth-success" : attempted ? "border-auth-error" : "border-auth-field"
							)}
						>
							{met && <Check aria-hidden="true" strokeWidth={3} className="size-2.5 text-white" />}
						</span>
						{rule.label}
						<span className="sr-only">{met ? "(done)" : "(not yet)"}</span>
					</li>
				);
			})}
		</ul>
	);
}
