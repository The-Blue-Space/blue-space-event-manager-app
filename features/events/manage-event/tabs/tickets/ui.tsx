"use client";
import * as React from "react";
import classNames from "classnames";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { MoreHorizontal, Plus, X } from "lucide-react";
import AppButton from "@/components/app/app-button";
import { controlClass } from "@/components/app/field";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { commas, digits } from "./format";

export const sectionClass = "grid gap-3.5 border-t border-auth-line pt-8";
export const outlineButton =
	"inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-auth-field bg-white px-3.5 text-[14px] font-semibold text-auth-ink transition-colors duration-150 hover:border-auth-field-hover disabled:cursor-not-allowed disabled:border-auth-line disabled:text-[#8E8DB0]";

export function SectionTitle({
	id,
	title,
	optional,
	text,
}: {
	id: string;
	title: string;
	optional?: boolean;
	text?: string;
}) {
	return (
		<div>
			<h2 id={id} className="text-[16px] font-bold text-auth-ink">
				{title}
				{optional && <span className="font-medium text-auth-muted"> (optional)</span>}
			</h2>
			{text && <p className="mt-1 text-[14px] text-auth-muted">{text}</p>}
		</div>
	);
}

export function AddButton({
	onClick,
	children,
	disabled,
}: {
	onClick: () => void;
	children: React.ReactNode;
	disabled?: boolean;
}) {
	return (
		<button type="button" onClick={onClick} disabled={disabled} className={outlineButton}>
			<Plus aria-hidden="true" className="size-4" />
			{children}
		</button>
	);
}

/**
 * The dashed box a section shows while it's empty. With `phoneButton`, phones show just the action as a
 * full-width button under the section's own description.
 */
export function EmptyBox({
	title,
	text,
	action,
	phoneButton,
}: {
	title: string;
	text: string;
	action?: React.ReactNode;
	phoneButton?: boolean;
}) {
	return (
		<div
			className={classNames(
				"flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-xl border border-dashed border-auth-field px-5 py-[18px]",
				phoneButton &&
					"max-sm:border-0 max-sm:p-0 max-sm:[&>*:last-child]:w-full max-sm:[&>*:last-child]:justify-center"
			)}
		>
			<div className={classNames(phoneButton && "max-sm:hidden")}>
				<p className="text-[14px] font-bold text-auth-ink">{title}</p>
				<p className="mt-0.5 text-[13px] text-auth-muted">{text}</p>
			</div>
			{action}
		</div>
	);
}

const PILL = {
	success: "bg-auth-success-soft text-auth-success",
	neutral: "bg-auth-info-soft text-primary-500",
	off: "bg-auth-page text-auth-muted",
	warning: "bg-auth-warning-soft text-auth-warning",
	error: "bg-auth-error-soft text-auth-error",
};
export type PillTone = keyof typeof PILL;

export function StatusPill({
	tone,
	children,
	dot = true,
}: {
	tone: PillTone;
	children: React.ReactNode;
	dot?: boolean;
}) {
	return (
		<span
			className={classNames(
				"inline-flex h-[22px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2 text-[12px] font-bold",
				PILL[tone]
			)}
		>
			{dot && <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />}
			{children}
		</span>
	);
}

/** An on/off switch. */
export function Toggle({
	on,
	onChange,
	label,
	labelledBy,
	disabled,
}: {
	on: boolean;
	onChange: () => void;
	label?: string;
	labelledBy?: string;
	disabled?: boolean;
}) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={on}
			aria-label={label}
			aria-labelledby={labelledBy}
			disabled={disabled}
			onClick={onChange}
			className={classNames(
				"flex h-[26px] w-11 shrink-0 rounded-full p-[3px] transition-colors duration-150 disabled:cursor-wait disabled:opacity-60",
				on ? "justify-end bg-primary-500" : "justify-start bg-auth-field"
			)}
		>
			<span className="size-5 rounded-full bg-white shadow-[0_1px_2px_rgba(25,24,55,0.25)]" />
		</button>
	);
}

export function Bar({ value, max }: { value: number; max: number | null }) {
	const percent = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
	return (
		<div aria-hidden="true" className="h-1 overflow-hidden rounded-full bg-auth-info-soft">
			<div className="h-full rounded-full bg-primary-500" style={{ width: `${percent}%` }} />
		</div>
	);
}

export type MenuItem = { label: string; onSelect: () => void; danger?: boolean };

export function RowMenu({ label, items }: { label: string; items: MenuItem[] }) {
	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger
				aria-label={label}
				className="grid size-9 place-items-center rounded-lg text-auth-muted transition-colors hover:bg-auth-page hover:text-auth-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-link"
			>
				<MoreHorizontal aria-hidden="true" className="size-[18px]" />
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="min-w-[180px] rounded-xl border-auth-line bg-white p-1 font-manrope text-auth-ink shadow-[0_16px_40px_-16px_rgba(25,24,55,0.35)]"
			>
				{items.map((item) => (
					<DropdownMenuItem
						key={item.label}
						onSelect={item.onSelect}
						className={classNames(
							"h-9 cursor-pointer rounded-lg px-2.5 text-[14px] font-semibold focus:bg-auth-page",
							item.danger ? "text-auth-error focus:text-auth-error" : "text-auth-ink"
						)}
					>
						{item.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

type SheetProps = {
	open: boolean;
	onClose: () => void;
	title: string;
	subtitle: string;
	/** Shown in the footer after a save attempt, e.g. "Fix 2 things above to save." */
	footNote?: string;
	submitLabel: string;
	isSaving?: boolean;
	onSubmit?: () => void;
	children: React.ReactNode;
};

/** The panel on the right that adds or changes one thing: header, a scrolling form, and Cancel / Save. */
export function Sheet({
	open,
	onClose,
	title,
	subtitle,
	footNote,
	submitLabel,
	isSaving,
	onSubmit,
	children,
}: SheetProps) {
	return (
		<DialogPrimitive.Root open={open} onOpenChange={(next) => !next && !isSaving && onClose()}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[rgba(25,24,55,0.35)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none" />
				<DialogPrimitive.Content
					aria-describedby={undefined}
					className="fixed inset-y-0 right-0 z-50 flex w-[480px] max-w-full flex-col bg-white font-manrope text-auth-ink shadow-[-24px_0_64px_-24px_rgba(25,24,55,0.45)] duration-200 ease-out data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right focus:outline-none motion-reduce:animate-none"
				>
					<form
						noValidate
						className="flex min-h-0 flex-1 flex-col"
						onSubmit={(event) => {
							event.preventDefault();
							onSubmit?.();
						}}
					>
						<header className="flex items-start gap-4 border-b border-auth-info-soft px-6 pb-4 pt-5">
							<div className="min-w-0 flex-1">
								<DialogPrimitive.Title className="text-[18px] font-bold">{title}</DialogPrimitive.Title>
								<p className="mt-1 truncate text-[14px] text-auth-muted">{subtitle}</p>
							</div>
							<DialogPrimitive.Close
								aria-label="Close"
								disabled={isSaving}
								className="-mr-2 grid size-9 shrink-0 place-items-center rounded-lg text-auth-muted hover:bg-auth-page hover:text-auth-ink"
							>
								<X aria-hidden="true" className="size-5" />
							</DialogPrimitive.Close>
						</header>

						<div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-7 pt-5">{children}</div>

						{onSubmit && (
							<footer className="flex flex-wrap items-center gap-3 border-t border-auth-line bg-white px-6 py-4">
								<p role="status" className="min-w-[160px] flex-1 text-[13px] text-auth-error">
									{footNote}
								</p>
								<button
									type="button"
									onClick={onClose}
									disabled={isSaving}
									className="h-11 rounded-lg px-4 text-[15px] font-semibold text-auth-muted hover:bg-auth-page hover:text-auth-ink"
								>
									Cancel
								</button>
								<AppButton
									type="submit"
									variant="primary"
									isLoading={isSaving}
									className="h-11 rounded-lg px-5 !text-[15px] font-semibold"
								>
									{submitLabel}
								</AppButton>
							</footer>
						)}
					</form>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}

type NumberInputProps = {
	id: string;
	"aria-invalid"?: boolean;
	"aria-describedby"?: string;
	"aria-label"?: string;
	value: string;
	onChange: (digits: string) => void;
	placeholder: string;
	/** "₦" before the number or "%" after it. */
	prefix?: string;
	suffix?: string;
	disabled?: boolean;
};

/** Whole numbers only, shown with thousands commas. */
export function NumberInput({ value, onChange, placeholder, prefix, suffix, disabled, ...input }: NumberInputProps) {
	return (
		<div className="relative">
			{prefix && (
				<span aria-hidden="true" className="absolute left-3.5 top-3 text-[15px] font-semibold text-auth-muted">
					{prefix}
				</span>
			)}
			<input
				{...input}
				type="text"
				inputMode="numeric"
				autoComplete="off"
				placeholder={placeholder}
				disabled={disabled}
				value={value ? commas(value) : ""}
				onChange={(event) => onChange(digits(event.target.value).slice(0, 9))}
				className={controlClass(
					Boolean(input["aria-invalid"]),
					classNames("h-11 tabular-nums", prefix && "pl-[34px]", suffix && "pr-9")
				)}
			/>
			{suffix && (
				<span aria-hidden="true" className="absolute right-3.5 top-3 text-[15px] font-semibold text-auth-muted">
					{suffix}
				</span>
			)}
		</div>
	);
}

/** The grey panel with a switch: "Sell this ticket type". */
export function SwitchRow({
	id,
	title,
	detail,
	on,
	onChange,
}: {
	id: string;
	title: string;
	detail: string;
	on: boolean;
	onChange: () => void;
}) {
	return (
		<div className="flex items-start gap-4 rounded-xl bg-auth-page px-4 py-3.5">
			<div className="flex-1">
				<p id={id} className="text-[15px] font-semibold">
					{title}
				</p>
				<p className="mt-0.5 text-[13px] leading-[1.45] text-auth-muted">{detail}</p>
			</div>
			<Toggle on={on} onChange={onChange} labelledBy={id} />
		</div>
	);
}

/** A "No limit" checkbox under a quantity. */
export function CheckRow({
	checked,
	onChange,
	children,
}: {
	checked: boolean;
	onChange: () => void;
	children: React.ReactNode;
}) {
	return (
		<label className="flex cursor-pointer items-center gap-2 text-[14px] text-auth-ink">
			<input type="checkbox" checked={checked} onChange={onChange} className="size-[18px] accent-primary-500" />
			{children}
		</label>
	);
}

export const fixMessage = (count: number) =>
	count ? `Fix ${count} ${count === 1 ? "thing" : "things"} above to save.` : "";

export type Kind<T extends string> = { value: T; title: string; detail: string };

/** Side-by-side radio cards: a dot and title on one line, the detail under them. */
export function KindCards<T extends string>({
	name,
	legend,
	value,
	choices,
	onChange,
}: {
	name: string;
	legend: string;
	value: T;
	choices: Kind<T>[];
	onChange: (value: T) => void;
}) {
	return (
		<fieldset className="grid gap-2">
			<legend className="mb-2 text-[13px] font-semibold text-auth-ink">{legend}</legend>
			<div
				className={classNames(
					"grid grid-cols-1 gap-2",
					choices.length === 3 ? "min-[400px]:grid-cols-3" : "min-[400px]:grid-cols-2"
				)}
			>
				{choices.map((choice) => {
					const checked = choice.value === value;
					return (
						<label
							key={choice.value}
							className={classNames(
								"grid cursor-pointer content-start gap-1 rounded-xl border p-3 transition-[border-color,box-shadow,background-color] duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-auth-link has-[:focus-visible]:ring-offset-2",
								checked
									? "border-primary-500 bg-auth-page shadow-[0_0_0_1px_#29285C]"
									: "border-auth-line bg-white hover:border-auth-field"
							)}
						>
							<input
								type="radio"
								name={name}
								value={choice.value}
								checked={checked}
								onChange={() => onChange(choice.value)}
								className="sr-only"
							/>
							<span className="flex items-center gap-2">
								<span
									aria-hidden="true"
									className={classNames(
										"size-3.5 shrink-0 rounded-full border bg-white",
										checked ? "border-4 border-primary-500" : "border-auth-field"
									)}
								/>
								<span className="text-[14px] font-bold text-auth-ink">{choice.title}</span>
							</span>
							<span className="text-[12.5px] leading-[1.4] text-auth-muted">{choice.detail}</span>
						</label>
					);
				})}
			</div>
		</fieldset>
	);
}
