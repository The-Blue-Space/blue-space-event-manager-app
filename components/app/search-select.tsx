"use client";
import * as React from "react";
import classNames from "classnames";
import { Check, ChevronDown } from "lucide-react";
import { controlClass } from "@/components/app/field";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type SearchSelectOption = { value: string; label: string };

type SearchSelectProps = {
	/** Spread `controlProps(id, …)` here so the Field's label and message point at the trigger. */
	id: string;
	"aria-invalid"?: boolean;
	"aria-describedby"?: string;
	value: string;
	options: SearchSelectOption[];
	onChange: (value: string) => void;
	/** Quick picks shown above the search. The list under the search holds everything else. */
	common?: string[];
	commonLabel?: string;
	restLabel?: string;
	placeholder: string;
	searchPlaceholder: string;
	/** Used in the no-results message, e.g. "category". */
	noun: string;
	disabled?: boolean;
};

const headingClass =
	"[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-1 [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-auth-muted";

/** A select with quick picks, a search box and the full list, for option lists too long to scan. */
export default function SearchSelect({
	value,
	options,
	onChange,
	common = [],
	commonLabel = "Common",
	restLabel = "More",
	placeholder,
	searchPlaceholder,
	noun,
	disabled,
	...trigger
}: SearchSelectProps) {
	const [open, setOpen] = React.useState(false);
	const [search, setSearch] = React.useState("");
	const [active, setActive] = React.useState("");
	const inputRef = React.useRef<HTMLInputElement>(null);
	const listRef = React.useRef<HTMLDivElement>(null);
	const commonId = `${trigger.id}-common`;
	const contentId = `${trigger.id}-options`;

	const selected = options.find((option) => option.value === value);
	const query = search.trim().toLowerCase();
	// While searching, quick picks step aside and every option is searchable.
	const quickPicks = query ? [] : common.flatMap((pick) => options.filter((option) => option.value === pick));
	const listed = query
		? options.filter((option) => option.label.toLowerCase().includes(query))
		: options.filter((option) => !quickPicks.includes(option));

	const show = (initialSearch = "") => {
		setSearch(initialSearch);
		setActive(listed.some((option) => option.value === value) ? value : "");
		setOpen(true);
	};
	const hide = () => {
		setOpen(false);
		setSearch("");
	};
	const choose = (next: string) => {
		onChange(next);
		hide();
	};

	return (
		<Popover open={open} onOpenChange={(next) => (next ? show() : hide())} modal>
			<PopoverTrigger asChild disabled={disabled}>
				<button
					type="button"
					role="combobox"
					aria-expanded={open}
					aria-controls={contentId}
					{...trigger}
					onKeyDown={(event) => {
						if (event.key === "ArrowDown" || event.key === "ArrowUp") {
							event.preventDefault();
							show();
						} else if (
							event.key.length === 1 &&
							event.key !== " " &&
							!event.metaKey &&
							!event.ctrlKey &&
							!event.altKey
						) {
							// Typing on the closed field starts a search, like a native select jumps to a match.
							event.preventDefault();
							show(event.key);
						}
					}}
					className={controlClass(Boolean(trigger["aria-invalid"]), "flex h-11 items-center gap-2 text-left")}
				>
					<span className={classNames("min-w-0 flex-1 truncate", !selected && "font-normal text-auth-placeholder")}>
						{selected?.label ?? placeholder}
					</span>
					<ChevronDown
						aria-hidden="true"
						className={classNames(
							"size-[18px] shrink-0 text-auth-muted transition-transform duration-150",
							open && "rotate-180"
						)}
					/>
				</button>
			</PopoverTrigger>

			<PopoverContent
				id={contentId}
				align="start"
				sideOffset={6}
				collisionPadding={16}
				onOpenAutoFocus={(event) => {
					event.preventDefault();
					// On touch screens, focusing the search would raise the keyboard over the quick picks.
					if (!window.matchMedia("(pointer: coarse)").matches) inputRef.current?.focus();
					requestAnimationFrame(() =>
						listRef.current?.querySelector("[data-selected=true]")?.scrollIntoView({ block: "nearest" })
					);
				}}
				className="flex max-h-[min(440px,var(--radix-popover-content-available-height))] w-[var(--radix-popover-trigger-width)] min-w-[260px] flex-col overflow-hidden rounded-xl border-auth-line bg-white p-0 font-manrope text-auth-ink shadow-[0_16px_40px_-16px_rgba(25,24,55,0.35)]"
			>
				{/* Outside <Command>, which treats Enter anywhere inside it as "pick the highlighted row". */}
				{quickPicks.length > 0 && (
					<div className="grid shrink-0 gap-2 p-3">
						<p id={commonId} className="text-[12px] font-semibold text-auth-muted">
							{commonLabel}
						</p>
						<div role="group" aria-labelledby={commonId} className="flex flex-wrap gap-1.5">
							{quickPicks.map((option) => {
								const isSelected = option.value === value;
								return (
									<button
										key={option.value}
										type="button"
										aria-pressed={isSelected}
										onClick={() => choose(option.value)}
										className={classNames(
											"inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-link focus-visible:ring-offset-1",
											isSelected
												? "border-auth-link bg-auth-info-soft text-auth-link"
												: "border-auth-line text-auth-ink hover:border-auth-field hover:bg-auth-page"
										)}
									>
										{isSelected && <Check aria-hidden="true" className="size-3.5" strokeWidth={2.5} />}
										{option.label}
									</button>
								);
							})}
						</div>
					</div>
				)}

				<Command
					shouldFilter={false}
					loop
					value={active}
					onValueChange={setActive}
					className="h-auto min-h-0 flex-1 rounded-none bg-transparent text-auth-ink"
				>
					<CommandInput
						ref={inputRef}
						value={search}
						onValueChange={setSearch}
						placeholder={searchPlaceholder}
						wrapperClassName={classNames(
							"h-11 shrink-0 gap-2.5 border-auth-line px-3.5 [&>svg]:size-[18px] [&>svg]:text-auth-muted [&>svg]:opacity-100",
							quickPicks.length > 0 && "border-t"
						)}
						className="h-11 text-[14px] font-medium text-auth-ink placeholder:font-normal placeholder:text-auth-placeholder"
					/>

					<CommandList ref={listRef} className="max-h-none min-h-0 flex-1 p-1.5">
						<CommandEmpty className="px-4 py-6 text-[14px] text-auth-muted">
							No {noun} matches “{search.trim()}”.
						</CommandEmpty>
						{listed.length > 0 && (
							<CommandGroup
								heading={!query && quickPicks.length > 0 ? restLabel : undefined}
								className={classNames("p-0", headingClass)}
							>
								{listed.map((option) => (
									<CommandItem
										key={option.value}
										value={option.value}
										onSelect={() => choose(option.value)}
										className="h-10 cursor-pointer rounded-lg px-2.5 text-[14px] font-medium text-auth-ink data-[selected=true]:bg-auth-info-soft data-[selected=true]:text-auth-ink"
									>
										<span className="min-w-0 flex-1 truncate">{option.label}</span>
										{option.value === value && (
											<>
												<Check aria-hidden="true" className="size-4 text-auth-link" strokeWidth={2.5} />
												<span className="sr-only">(selected)</span>
											</>
										)}
									</CommandItem>
								))}
							</CommandGroup>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
