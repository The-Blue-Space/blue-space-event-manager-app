"use client";
import * as React from "react";
import classNames from "classnames";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { controlClass } from "@/components/app/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
	atLagos,
	dayLabel,
	dayOf,
	fullLabel,
	monthGrid,
	monthOfDay,
	monthTitle,
	shortDuration,
	timeLabel,
	todayDay,
} from "./lagos-time";

const SLOT = 30 * 60 * 1000;
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

type Slot = { at: number; sub: string };

type DateTimeFieldProps = {
	/** Spread `controlProps(id, …)` here so the Field's label and message point at the trigger. */
	id: string;
	"aria-invalid"?: boolean;
	"aria-describedby"?: string;
	value: number | null;
	onChange: (value: number) => void;
	/** "end" lists times after `start`, with how long the event runs. */
	kind: "start" | "end";
	start?: number | null;
	placeholder: string;
	disabled?: boolean;
};

function usePhone() {
	const [phone, setPhone] = React.useState(false);
	React.useEffect(() => {
		const query = window.matchMedia("(max-width: 639px)");
		const update = () => setPhone(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);
	return phone;
}

/** A date and a time in one field: a calendar beside a list of times, in Lagos time. */
export default function DateTimeField({
	value,
	onChange,
	kind,
	start = null,
	placeholder,
	disabled,
	...trigger
}: DateTimeFieldProps) {
	const phone = usePhone();
	const [open, setOpen] = React.useState(false);
	const [view, setView] = React.useState(() => monthOfDay(todayDay()));
	const [pickedDay, setPickedDay] = React.useState<number | null>(null);

	const show = () => {
		const anchor = value !== null ? dayOf(value) : kind === "end" && start !== null ? dayOf(start) : null;
		setPickedDay(anchor);
		setView(monthOfDay(anchor ?? todayDay()));
		setOpen(true);
	};
	const choose = (at: number) => {
		onChange(at);
		setOpen(false);
	};

	const button = (
		<button
			type="button"
			aria-haspopup="dialog"
			aria-expanded={open}
			disabled={disabled}
			{...trigger}
			onClick={() => (open ? setOpen(false) : show())}
			className={controlClass(
				Boolean(trigger["aria-invalid"]),
				classNames("flex h-11 items-center gap-2.5 text-left", open && "border-auth-link")
			)}
		>
			<Calendar aria-hidden="true" className="size-[18px] shrink-0 text-auth-muted" />
			<span className={classNames("min-w-0 flex-1 truncate", value === null && "font-normal text-auth-placeholder")}>
				{value !== null ? fullLabel(value) : placeholder}
			</span>
			<ChevronDown
				aria-hidden="true"
				className={classNames(
					"size-[18px] shrink-0 text-auth-muted transition-transform duration-150",
					open && "rotate-180"
				)}
			/>
		</button>
	);

	const picker = (
		<Picker
			kind={kind}
			start={start}
			value={value}
			view={view}
			onView={setView}
			pickedDay={pickedDay}
			onPickDay={setPickedDay}
			onChoose={choose}
			onClose={() => setOpen(false)}
			phone={phone}
		/>
	);

	if (phone) {
		return (
			<DialogPrimitive.Root open={open} onOpenChange={(next) => (next ? show() : setOpen(false))}>
				{button}
				<DialogPrimitive.Portal>
					<DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[rgba(25,24,55,0.45)]" />
					<DialogPrimitive.Content
						aria-describedby={undefined}
						className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92vh] flex-col gap-2.5 overflow-y-auto rounded-t-2xl bg-white px-4 pb-5 pt-2 font-manrope text-auth-ink shadow-[0_-12px_32px_-16px_rgba(25,24,55,0.35)] focus:outline-none"
					>
						<span aria-hidden="true" className="h-1 w-10 self-center rounded-full bg-auth-line" />
						<div className="flex items-center justify-between">
							<DialogPrimitive.Title className="text-[17px] font-bold">
								{kind === "start" ? "When does it start?" : "When does it end?"}
							</DialogPrimitive.Title>
							<DialogPrimitive.Close
								aria-label="Close"
								className="-mr-2.5 grid size-11 place-items-center rounded-lg text-auth-muted"
							>
								<X aria-hidden="true" className="size-[22px]" />
							</DialogPrimitive.Close>
						</div>
						{picker}
					</DialogPrimitive.Content>
				</DialogPrimitive.Portal>
			</DialogPrimitive.Root>
		);
	}

	return (
		<Popover open={open} onOpenChange={(next) => (next ? show() : setOpen(false))}>
			<PopoverTrigger asChild>{button}</PopoverTrigger>
			<PopoverContent
				align="start"
				sideOffset={6}
				collisionPadding={16}
				aria-label={kind === "start" ? "Pick when it starts" : "Pick when it ends"}
				onOpenAutoFocus={(event) => {
					// Start keyboard users on the calendar's current day rather than the month buttons.
					event.preventDefault();
					const content = event.currentTarget as HTMLElement;
					requestAnimationFrame(() => content.querySelector<HTMLElement>("[data-day][tabindex='0']")?.focus());
				}}
				className="w-[540px] max-w-[calc(100vw-32px)] rounded-xl border-auth-line bg-white p-0 font-manrope text-auth-ink shadow-[0_16px_40px_-16px_rgba(25,24,55,0.35)]"
			>
				{picker}
			</PopoverContent>
		</Popover>
	);
}

type PickerProps = {
	kind: "start" | "end";
	start: number | null;
	value: number | null;
	view: number;
	onView: (view: number) => void;
	pickedDay: number | null;
	onPickDay: (day: number) => void;
	onChoose: (at: number) => void;
	onClose: () => void;
	phone: boolean;
};

function Picker({ kind, start, value, view, onView, pickedDay, onPickDay, onChoose, onClose, phone }: PickerProps) {
	const today = todayDay();
	const startDay = start !== null ? dayOf(start) : null;
	// Ends can't fall before the day it starts; a start can't be moved into the past.
	const minDay =
		kind === "end" && startDay !== null ? startDay : Math.min(today, value !== null ? dayOf(value) : today);

	const slots: Slot[] = [];
	let timesTitle: string;
	const relative = kind === "end" && start !== null && (pickedDay === null || pickedDay <= startDay! + 1);
	if (relative) {
		// Times after the start, rolling past midnight, so an overnight event is one pick.
		timesTitle = "Time, and how long it runs";
		for (let step = 1; step <= 48; step++) {
			const at = start + step * SLOT;
			slots.push({ at, sub: `${shortDuration(at - start)}${dayOf(at) > startDay! ? " · next day" : ""}` });
		}
	} else {
		timesTitle =
			pickedDay === null ? "Pick a day, then a time" : phone ? `Time on ${dayLabel(pickedDay)}` : dayLabel(pickedDay);
		if (pickedDay !== null) {
			for (let step = 0; step < 48; step++) {
				const at = atLagos(pickedDay, step * 30);
				slots.push({ at, sub: kind === "end" && start !== null ? shortDuration(at - start) : "" });
			}
		}
	}

	return (
		<div className={classNames(!phone && "grid")}>
			<div className={classNames("flex", phone ? "flex-col gap-2.5" : "gap-5 p-4")}>
				<CalendarGrid
					view={view}
					onView={onView}
					selected={pickedDay}
					minDay={minDay}
					today={today}
					onPick={onPickDay}
					phone={phone}
				/>
				<div className="flex min-w-0 flex-1 flex-col gap-2">
					<span
						className={classNames(
							"flex items-center text-[13px] font-semibold text-auth-muted",
							phone ? "mt-1.5" : "h-8"
						)}
					>
						{timesTitle}
					</span>
					<TimeList
						slots={slots}
						value={value}
						onChoose={onChoose}
						phone={phone}
						defaultMinute={relative ? null : 18 * 60}
					/>
				</div>
			</div>
			{phone ? (
				<p className="text-[12px] text-auth-muted">Lagos time (WAT). Tap a time to set it.</p>
			) : (
				<div className="flex items-center justify-between gap-3 border-t border-auth-info-soft px-4 py-2.5">
					<span className="text-[12px] text-auth-muted">Lagos time (WAT)</span>
					<button
						type="button"
						onClick={onClose}
						className="h-8 rounded-lg px-3 text-[14px] font-semibold text-auth-link hover:bg-auth-page"
					>
						Close
					</button>
				</div>
			)}
		</div>
	);
}

type CalendarGridProps = {
	view: number;
	onView: (view: number) => void;
	selected: number | null;
	minDay: number;
	today: number;
	onPick: (day: number) => void;
	phone: boolean;
};

function CalendarGrid({ view, onView, selected, minDay, today, onPick, phone }: CalendarGridProps) {
	const cells = monthGrid(view);
	const days = cells.filter((cell): cell is number => cell !== null);
	const [focusDay, setFocusDay] = React.useState<number>(() => selected ?? Math.max(today, minDay));
	const refs = React.useRef(new Map<number, HTMLButtonElement>());
	const moved = React.useRef(false);

	// The day that takes Tab focus: the focused one if it's on screen, else the selected one or the first open day.
	const tabDay = days.includes(focusDay)
		? focusDay
		: selected !== null && days.includes(selected)
			? selected
			: (days.find((day) => day >= minDay) ?? days[0]);

	React.useEffect(() => {
		if (!moved.current) return;
		moved.current = false;
		refs.current.get(focusDay)?.focus();
	}, [focusDay, view]);

	const moveTo = (day: number) => {
		const next = Math.max(day, minDay);
		moved.current = true;
		setFocusDay(next);
		if (monthOfDay(next) !== view) onView(monthOfDay(next));
	};

	const onKeyDown = (event: React.KeyboardEvent, day: number) => {
		const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
		if (event.key in step) {
			event.preventDefault();
			moveTo(day + step[event.key]);
		} else if (event.key === "PageUp" || event.key === "PageDown") {
			event.preventDefault();
			moveTo(day + (event.key === "PageUp" ? -30 : 30));
		}
	};

	const rows: (number | null)[][] = [];
	for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

	return (
		<div className={classNames("flex flex-col gap-2", phone ? "w-full" : "w-[266px] shrink-0")}>
			<div className="flex items-center justify-between">
				<button
					type="button"
					aria-label="Previous month"
					onClick={() => onView(view - 1)}
					disabled={view <= monthOfDay(minDay)}
					className={classNames(
						"grid place-items-center rounded-lg text-auth-muted hover:bg-auth-page disabled:opacity-40",
						phone ? "size-11" : "size-8"
					)}
				>
					<ChevronLeft aria-hidden="true" className="size-[18px]" />
				</button>
				<span aria-live="polite" className={classNames("font-bold", phone ? "text-[15px]" : "text-[14px]")}>
					{monthTitle(view)}
				</span>
				<button
					type="button"
					aria-label="Next month"
					onClick={() => onView(view + 1)}
					className={classNames(
						"grid place-items-center rounded-lg text-auth-muted hover:bg-auth-page",
						phone ? "size-11" : "size-8"
					)}
				>
					<ChevronRight aria-hidden="true" className="size-[18px]" />
				</button>
			</div>
			<div aria-hidden="true" className="grid grid-cols-7 text-center text-[12px] font-semibold text-auth-muted">
				{WEEKDAYS.map((name) => (
					<span key={name}>{name}</span>
				))}
			</div>
			<div className="grid gap-0.5">
				{rows.map((row, index) => (
					<div key={index} className="grid grid-cols-7 gap-0.5">
						{row.map((day, cell) =>
							day === null ? (
								<span key={`blank-${cell}`} />
							) : (
								<button
									key={day}
									ref={(node) => {
										if (node) refs.current.set(day, node);
										else refs.current.delete(day);
									}}
									type="button"
									data-day=""
									tabIndex={day === tabDay ? 0 : -1}
									disabled={day < minDay}
									aria-pressed={day === selected}
									aria-label={dayLabel(day, true)}
									onClick={() => {
										setFocusDay(day);
										onPick(day);
									}}
									onKeyDown={(event) => onKeyDown(event, day)}
									className={classNames(
										"rounded-lg font-medium transition-colors duration-100 disabled:cursor-default disabled:text-auth-field",
										phone ? "h-10 text-[15px]" : "h-9 text-[13px]",
										day === selected ? "bg-primary-500 font-bold text-white" : "text-auth-ink hover:bg-auth-info-soft",
										day === today && day !== selected && "shadow-[inset_0_0_0_1px_#B4BAD6]"
									)}
								>
									{new Date(day * 86400000).getUTCDate()}
								</button>
							)
						)}
					</div>
				))}
			</div>
		</div>
	);
}

type TimeListProps = {
	slots: Slot[];
	value: number | null;
	onChoose: (at: number) => void;
	phone: boolean;
	/** Where a list with nothing chosen opens (minutes after midnight); null opens at the top. */
	defaultMinute: number | null;
};

function TimeList({ slots, value, onChoose, phone, defaultMinute }: TimeListProps) {
	const listRef = React.useRef<HTMLDivElement>(null);
	const first = slots[0]?.at;

	// Bring the chosen time (or early evening) into view whenever the list changes.
	React.useEffect(() => {
		const list = listRef.current;
		if (!list) return;
		const target =
			list.querySelector<HTMLElement>("[aria-selected=true]") ??
			list.querySelector<HTMLElement>(`[data-minute="${defaultMinute}"]`);
		list.scrollTop = target ? target.offsetTop - list.offsetTop - list.clientHeight / 2 + target.clientHeight / 2 : 0;
	}, [first, value, defaultMinute]);

	const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
		const options = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>("[role=option]") ?? []);
		if (!options.length) return;
		event.preventDefault();
		const index = options.indexOf(document.activeElement as HTMLButtonElement);
		const next =
			event.key === "Home"
				? 0
				: event.key === "End"
					? options.length - 1
					: Math.min(options.length - 1, Math.max(0, index + (event.key === "ArrowDown" ? 1 : -1)));
		options[next].focus();
		options[next].scrollIntoView({ block: "nearest" });
	};

	// Tab lands on the chosen time, else on early evening where the list opens.
	const selectedIndex = slots.findIndex((slot) => slot.at === value);
	const fallbackIndex = Math.max(
		0,
		slots.findIndex((slot) => Math.round(((slot.at + 3600000) % 86400000) / 60000) === defaultMinute)
	);

	if (!slots.length) {
		return (
			<div
				className={classNames(
					"grid place-items-center rounded-lg bg-auth-page px-4 text-center text-[13px] text-auth-muted",
					phone ? "h-[184px]" : "h-[268px]"
				)}
			>
				Times show up once you pick a day.
			</div>
		);
	}

	return (
		<div
			ref={listRef}
			role="listbox"
			aria-label="Time"
			onKeyDown={onKeyDown}
			className={classNames(
				"flex flex-col gap-0.5 overflow-y-auto pr-1",
				phone ? "h-[184px] border-y border-auth-info-soft py-1" : "max-h-[268px]"
			)}
		>
			{slots.map((slot, index) => {
				const selected = slot.at === value;
				const tabbable = index === (selectedIndex === -1 ? fallbackIndex : selectedIndex);
				const minute = Math.round(((slot.at + 3600000) % 86400000) / 60000);
				return (
					<button
						key={slot.at}
						type="button"
						role="option"
						aria-selected={selected}
						data-minute={minute}
						tabIndex={tabbable ? 0 : -1}
						onClick={() => onChoose(slot.at)}
						className={classNames(
							"flex shrink-0 items-center justify-between gap-2 rounded-lg px-2.5 text-left font-semibold transition-colors duration-100",
							phone ? "min-h-11 text-[16px]" : "min-h-9 text-[14px]",
							selected ? "bg-primary-500 text-white" : "text-auth-ink hover:bg-auth-info-soft focus:bg-auth-info-soft"
						)}
					>
						<span>{timeLabel(slot.at)}</span>
						{slot.sub && (
							<span className={classNames("text-[12px] font-medium", selected ? "text-auth-line" : "text-auth-muted")}>
								{slot.sub}
							</span>
						)}
					</button>
				);
			})}
		</div>
	);
}
