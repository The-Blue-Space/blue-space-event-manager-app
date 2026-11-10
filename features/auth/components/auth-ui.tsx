import * as React from "react";
import Link, { LinkProps } from "next/link";
import classNames from "classnames";
import { Check, LucideIcon, TriangleAlert } from "lucide-react";

export function AuthHeading({ title, description }: { title: string; description?: React.ReactNode }) {
	return (
		<div>
			<h1 className="text-[26px] font-bold leading-[1.25] tracking-[-0.015em] text-auth-ink [text-wrap:balance]">
				{title}
			</h1>
			{description && (
				<p className="mt-2 text-[15px] leading-[1.6] text-auth-muted [text-wrap:pretty] [&_strong]:break-words [&_strong]:font-semibold [&_strong]:text-auth-ink">
					{description}
				</p>
			)}
		</div>
	);
}

type AuthTextLinkProps = LinkProps & {
	children: React.ReactNode;
	className?: string;
};

export function AuthTextLink({ className, children, ...rest }: AuthTextLinkProps) {
	return (
		<Link
			className={classNames(
				"rounded font-semibold text-auth-link underline-offset-[3px] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auth-link",
				className
			)}
			{...rest}
		>
			{children}
		</Link>
	);
}

export function AuthBackLink({ href = "/", children = "Back to log in" }: { href?: string; children?: React.ReactNode }) {
	return (
		<AuthTextLink href={href} className="inline-flex items-center gap-1.5 justify-self-start text-[14px]">
			<svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]">
				<path d="M19 12H5M11 6l-6 6 6 6" />
			</svg>
			{children}
		</AuthTextLink>
	);
}

export function AuthAlert({ children }: { children: React.ReactNode }) {
	return (
		<div
			role="alert"
			className="flex items-start gap-2.5 rounded-lg border border-auth-error-line bg-auth-error-soft px-3.5 py-3 text-[14px] leading-[1.5] text-auth-error-ink"
		>
			<TriangleAlert aria-hidden="true" className="mt-px size-[18px] shrink-0 text-auth-error" />
			<div className="min-w-0">{children}</div>
		</div>
	);
}

type StatusKind = "info" | "success" | "error";

const statusStyles: Record<StatusKind, string> = {
	info: "bg-auth-info-soft text-primary-500",
	success: "bg-auth-success-soft text-auth-success",
	error: "bg-auth-error-soft text-auth-error",
};

export function StatusTile({ kind, icon: Icon = kind === "success" ? Check : TriangleAlert, spin }: { kind: StatusKind; icon?: LucideIcon; spin?: boolean }) {
	return (
		<div className={classNames("grid size-12 place-items-center rounded-xl", statusStyles[kind])}>
			<Icon aria-hidden="true" strokeWidth={1.8} className={classNames("size-6", spin && "animate-spin motion-reduce:animate-none")} />
		</div>
	);
}

/** Muted helper copy under a form. */
export function AuthMeta({ children }: { children: React.ReactNode }) {
	return <p className="text-[13px] leading-[1.55] text-auth-muted">{children}</p>;
}

/** The divided footer line, e.g. "New to Blue Space? Create an account". */
export function AuthSwitch({ children }: { children: React.ReactNode }) {
	return <p className="border-t border-auth-line pt-5 text-center text-[14px] text-auth-muted">{children}</p>;
}

/** A short ordered list for flows where the order is real. */
export function AuthSteps({ steps, current }: { steps: string[]; current: number }) {
	return (
		<ol aria-label="What happens next" className="grid gap-3 rounded-[10px] border border-auth-line bg-white p-4">
			{steps.map((step, index) => {
				const isCurrent = index === current;
				return (
					<li
						key={step}
						aria-current={isCurrent ? "step" : undefined}
						className={classNames("flex items-center gap-3 text-[14px]", isCurrent ? "font-semibold text-auth-ink" : "text-auth-muted")}
					>
						<span
							className={classNames(
								"grid size-6 shrink-0 place-items-center rounded-full border text-[12px] font-bold tabular-nums",
								isCurrent ? "border-primary-500 bg-primary-500 text-white" : "border-auth-field text-auth-muted"
							)}
						>
							{index + 1}
						</span>
						{step}
					</li>
				);
			})}
		</ol>
	);
}
