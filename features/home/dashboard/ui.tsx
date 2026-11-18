import Link from "next/link";
import classNames from "classnames";

export function SectionHeader({ id, title, href, linkLabel }: { id: string; title: string; href?: string; linkLabel?: string }) {
	return (
		<div className="flex items-baseline justify-between gap-4">
			<h2 id={id} className="text-[15px] font-bold text-auth-ink">
				{title}
			</h2>
			{href && (
				<Link href={href} className="text-[14px] font-semibold text-auth-link hover:text-primary-500">
					{linkLabel}
				</Link>
			)}
		</div>
	);
}

const PILL_TONES = {
	success: "bg-auth-success-soft text-auth-success",
	warning: "bg-auth-warning-soft text-auth-warning",
	neutral: "bg-auth-info-soft text-primary-500",
	error: "bg-auth-error-soft text-auth-error",
};

export function Pill({ tone, children }: { tone: keyof typeof PILL_TONES; children: React.ReactNode }) {
	return (
		<span className={classNames("inline-flex h-[22px] items-center gap-1.5 rounded-full px-2 text-[12px] font-bold", PILL_TONES[tone])}>
			<span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
			{children}
		</span>
	);
}

type ProgressProps = { value: number; max: number; label?: string; className?: string; barClassName?: string };

export function Progress({ value, max, label, className = "h-2", barClassName = "bg-primary-500" }: ProgressProps) {
	const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
	return (
		<div
			role={label ? "progressbar" : undefined}
			aria-label={label}
			aria-valuemin={label ? 0 : undefined}
			aria-valuemax={label ? max : undefined}
			aria-valuenow={label ? value : undefined}
			aria-hidden={label ? undefined : true}
			className={classNames("overflow-hidden rounded-full bg-auth-info-soft", className)}
		>
			<div className={classNames("h-full rounded-full", barClassName)} style={{ width: `${percent}%` }} />
		</div>
	);
}

export function IconCircle({ children }: { children: React.ReactNode }) {
	return (
		<span aria-hidden="true" className="grid size-[34px] shrink-0 place-items-center rounded-full bg-auth-info-soft text-primary-500">
			{children}
		</span>
	);
}
