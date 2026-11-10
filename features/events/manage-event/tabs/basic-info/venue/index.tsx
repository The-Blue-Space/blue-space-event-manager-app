"use client";
import * as React from "react";
import classNames from "classnames";
import { MapPin, Search } from "lucide-react";
import Field, { controlClass, controlProps } from "@/components/app/field";
import { DetailsFormApi } from "../use-details-form";
import geocodeAddress, { GeocodeRefused } from "./geocode";
import { useMapsState, useReportMapsBroken } from "./maps-health";
import usePlaceSearch, { PlaceSuggestion } from "./place-search";
import VenueMap from "./venue-map";

const linkButton = "text-[14px] font-semibold text-auth-link hover:text-primary-500";

export default function VenueSection({ api }: { api: DetailsFormApi }) {
	const { form, patch, errors, venueQuery, setVenueQuery, countryName } = api;
	const maps = useMapsState();
	const search = usePlaceSearch(form?.venueMode === "search" ? venueQuery : "");
	const searchDown = maps === "failed" || search.status === "unavailable";
	const [moving, setMoving] = React.useState(false);
	const reportBroken = useReportMapsBroken();
	React.useEffect(() => {
		if (search.status === "unavailable") reportBroken();
	}, [search.status, reportBroken]);

	// Without Google, the typed address is the only way in.
	React.useEffect(() => {
		if (searchDown && form?.venueMode === "search") {
			patch({ venueMode: "manual", venueName: form.venueName || venueQuery.trim() });
			setVenueQuery("");
		}
	}, [searchDown, form?.venueMode]); // eslint-disable-line react-hooks/exhaustive-deps

	if (!form) return null;

	const choose = async (suggestion: PlaceSuggestion) => {
		try {
			const place = await suggestion.resolve();
			patch({
				venueMode: "chosen",
				venueName: place.name,
				street: place.street,
				city: place.city,
				state: place.state,
				postalCode: place.postalCode,
				country: place.country,
				lat: place.lat,
				lng: place.lng,
			});
			setVenueQuery("");
			setMoving(false);
		} catch {
			patch({ venueMode: "manual", venueName: suggestion.name });
			setVenueQuery("");
		}
	};

	const toManual = (venueName?: string) => {
		patch({ venueMode: "manual", ...(venueName !== undefined && { venueName }) });
		setVenueQuery("");
		setMoving(false);
	};
	const toSearch = () => {
		patch({
			venueMode: "search",
			venueName: "",
			street: "",
			city: "",
			state: "",
			postalCode: "",
			lat: "",
			lng: "",
		});
		setMoving(false);
	};
	const movePin = (lat: string, lng: string) => patch({ lat, lng });
	const hasPin = Boolean(form.lat && form.lng);
	const addressLine = [form.street, form.city].filter((part) => part.trim()).join(", ");

	return (
		<section id="where" aria-labelledby="where-title" className="grid gap-5 border-b border-auth-line pb-8">
			<div>
				<h2 id="where-title" className="text-[16px] font-bold text-auth-ink">
					Venue
				</h2>
				<p className="mt-1 text-[14px] text-auth-muted">Where guests should go.</p>
			</div>

			{form.venueMode === "search" && (
				<PlaceSearchField
					query={venueQuery}
					onQuery={setVenueQuery}
					status={search.status}
					suggestions={search.suggestions}
					onChoose={choose}
					onTypeInstead={() => toManual(venueQuery.trim())}
					error={errors.venue}
				/>
			)}

			{form.venueMode === "chosen" && (
				<div className="grid gap-3">
					<PinArea
						maps={maps}
						hasPin={hasPin}
						lat={form.lat}
						lng={form.lng}
						moving={moving}
						onMove={movePin}
						onStartMoving={() => setMoving(true)}
						onDone={() => setMoving(false)}
						label={form.venueName || form.street}
					/>
					<div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
						<div className="grid gap-0.5">
							<p className="text-[15px] font-bold text-auth-ink">{form.venueName || form.street}</p>
							<p className="text-[14px] text-auth-muted">
								{[form.venueName ? form.street : "", form.city].filter((part) => part.trim()).join(", ")}
							</p>
						</div>
						<div className="flex flex-wrap gap-x-4 gap-y-1">
							{maps === "ready" && hasPin && (
								<button type="button" onClick={() => setMoving(true)} className={linkButton}>
									Move the pin
								</button>
							)}
							<button type="button" onClick={() => toManual()} className={linkButton}>
								Edit address
							</button>
							{!searchDown && (
								<button type="button" onClick={toSearch} className={linkButton}>
									Change venue
								</button>
							)}
						</div>
					</div>
					{errors.venue && <ErrorLine id="venue-message" text={errors.venue} />}
				</div>
			)}

			{form.venueMode === "manual" && (
				<ManualAddress
					api={api}
					maps={maps}
					moving={moving}
					setMoving={setMoving}
					onMove={movePin}
					countryName={countryName}
					searchDown={searchDown}
					onSearchInstead={toSearch}
					addressLine={addressLine}
				/>
			)}
		</section>
	);
}

function ErrorLine({ id, text }: { id: string; text: string }) {
	return (
		<p id={id} className="flex items-start gap-1.5 text-[13px] leading-[1.45] text-auth-error">
			<svg
				aria-hidden="true"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
				className="mt-px size-[15px] shrink-0"
			>
				<circle cx="12" cy="12" r="10" />
				<line x1="12" x2="12" y1="8" y2="12" />
				<line x1="12" x2="12.01" y1="16" y2="16" />
			</svg>
			<span>{text}</span>
		</p>
	);
}

type PlaceSearchFieldProps = {
	query: string;
	onQuery: (value: string) => void;
	status: ReturnType<typeof usePlaceSearch>["status"];
	suggestions: PlaceSuggestion[];
	onChoose: (suggestion: PlaceSuggestion) => void;
	onTypeInstead: () => void;
	error?: string;
};

function PlaceSearchField({
	query,
	onQuery,
	status,
	suggestions,
	onChoose,
	onTypeInstead,
	error,
}: PlaceSearchFieldProps) {
	const [active, setActive] = React.useState(0);
	const [dismissed, setDismissed] = React.useState(false);
	const open = query.trim().length >= 2 && !dismissed;
	const empty = status === "ready" && suggestions.length === 0;

	React.useEffect(() => setActive(0), [suggestions]);

	const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (!open) return;
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			const count = suggestions.length;
			if (count) setActive((index) => (index + (event.key === "ArrowDown" ? 1 : count - 1)) % count);
		} else if (event.key === "Enter") {
			event.preventDefault();
			if (suggestions[active]) onChoose(suggestions[active]);
		} else if (event.key === "Escape") {
			event.preventDefault();
			setDismissed(true);
		}
	};

	return (
		<Field id="venue-search" label="Venue or address" error={error}>
			<div className="relative">
				<Search
					aria-hidden="true"
					className="pointer-events-none absolute left-3.5 top-[13px] size-[18px] text-auth-muted"
				/>
				<input
					{...controlProps("venue-search", { error })}
					type="text"
					role="combobox"
					aria-expanded={open}
					aria-controls="venue-results"
					aria-autocomplete="list"
					aria-activedescendant={open && suggestions[active] ? `venue-option-${active}` : undefined}
					autoComplete="off"
					placeholder="Search for a venue or address"
					value={query}
					onChange={(event) => {
						onQuery(event.target.value);
						setDismissed(false);
					}}
					onKeyDown={onKeyDown}
					onBlur={() => window.setTimeout(() => setDismissed(true), 150)}
					onFocus={() => setDismissed(false)}
					className={controlClass(Boolean(error), "h-11 pl-[42px]")}
				/>
				{open && (
					<div
						id="venue-results"
						role="listbox"
						aria-label="Places"
						className="absolute inset-x-0 top-[50px] z-20 grid gap-0.5 rounded-xl border border-auth-line bg-white p-1.5 shadow-[0_16px_40px_-16px_rgba(25,24,55,0.35)]"
					>
						{suggestions.map((suggestion, index) => (
							<button
								key={suggestion.id}
								id={`venue-option-${index}`}
								type="button"
								role="option"
								aria-selected={index === active}
								tabIndex={-1}
								onMouseDown={(event) => event.preventDefault()}
								onMouseEnter={() => setActive(index)}
								onClick={() => onChoose(suggestion)}
								className={classNames(
									"flex items-start gap-2.5 rounded-lg p-2.5 text-left",
									index === active && "bg-auth-info-soft"
								)}
							>
								<MapPin aria-hidden="true" className="mt-px size-[18px] shrink-0 text-auth-muted" />
								<span className="grid gap-px">
									<span className="text-[14px] font-bold text-auth-ink">{suggestion.name}</span>
									{suggestion.line && <span className="text-[13px] text-auth-muted">{suggestion.line}</span>}
								</span>
							</button>
						))}
						{status === "loading" && !suggestions.length && (
							<p className="px-2.5 py-3 text-[14px] text-auth-muted">Searching…</p>
						)}
						{empty && <p className="px-2.5 py-3 text-[14px] text-auth-muted">No places match “{query.trim()}”.</p>}
						<div className="mt-1 border-t border-auth-info-soft px-2.5 pb-1 pt-2.5">
							<button
								type="button"
								onMouseDown={(event) => event.preventDefault()}
								onClick={onTypeInstead}
								className={linkButton}
							>
								Can’t find it? Type the address
							</button>
						</div>
					</div>
				)}
			</div>
			{!open && (
				<p className="text-[13px] text-auth-muted">
					Can’t find it?{" "}
					<button type="button" onClick={onTypeInstead} className="text-[13px] font-semibold text-auth-link">
						Type the address
					</button>
				</p>
			)}
		</Field>
	);
}

type PinAreaProps = {
	maps: ReturnType<typeof useMapsState>;
	hasPin: boolean;
	lat: string;
	lng: string;
	moving: boolean;
	onMove: (lat: string, lng: string) => void;
	onStartMoving: () => void;
	onDone: () => void;
	label: string;
};

/** The map with the venue's pin, or what guests will get when there's no pin. */
function PinArea({ maps, hasPin, lat, lng, moving, onMove, onStartMoving, onDone, label }: PinAreaProps) {
	if (maps === "ready" && (hasPin || moving)) {
		return (
			<VenueMap
				lat={lat}
				lng={lng}
				moving={moving}
				onMove={onMove}
				onDone={onDone}
				className="h-[220px]"
				label={`Map around ${label}`}
			/>
		);
	}
	// A pin exists but the map can't load here: the card keeps the name and address.
	if (maps === "failed" && hasPin) return null;
	if (maps === "pending") {
		return <div aria-hidden="true" className="h-[220px] animate-pulse rounded-xl bg-auth-page" />;
	}
	return <NoPin canMove={maps === "ready"} onStartMoving={onStartMoving} />;
}

function NoPin({ canMove, onStartMoving }: { canMove: boolean; onStartMoving: () => void }) {
	return (
		<div className="grid gap-1 rounded-xl border border-dashed border-auth-field bg-auth-page px-4 py-3.5 text-[13px] leading-[1.45] text-auth-muted">
			<p>
				We couldn’t find this address on the map. Guests will see the address without a map.
				{canMove && (
					<>
						{" "}
						<button type="button" onClick={onStartMoving} className="text-[13px] font-semibold text-auth-link">
							Move the pin
						</button>{" "}
						to place it yourself.
					</>
				)}
			</p>
		</div>
	);
}

type ManualAddressProps = {
	api: DetailsFormApi;
	maps: ReturnType<typeof useMapsState>;
	moving: boolean;
	setMoving: (moving: boolean) => void;
	onMove: (lat: string, lng: string) => void;
	countryName: string;
	searchDown: boolean;
	onSearchInstead: () => void;
	addressLine: string;
};

function ManualAddress({
	api,
	maps,
	moving,
	setMoving,
	onMove,
	countryName,
	searchDown,
	onSearchInstead,
	addressLine,
}: ManualAddressProps) {
	const { form, set, patch, errors } = api;
	const [lookup, setLookup] = React.useState<"idle" | "found" | "missing">("idle");
	const placedByHand = React.useRef(false);
	const reportBroken = useReportMapsBroken();
	const street = form?.street.trim() ?? "";
	const city = form?.city.trim() ?? "";

	// Put the pin where the typed address points, unless the organizer placed it by hand.
	React.useEffect(() => {
		if (!street || !city || placedByHand.current) return;
		if (maps === "failed") {
			setLookup("missing");
			return;
		}
		if (maps !== "ready") return;
		let cancelled = false;
		const timer = window.setTimeout(async () => {
			try {
				const point = await geocodeAddress([street, city, form?.state, countryName].filter(Boolean).join(", "));
				if (cancelled) return;
				patch({ lat: point.lat, lng: point.lng });
				setLookup("found");
			} catch (error) {
				if (cancelled) return;
				if (error instanceof GeocodeRefused) reportBroken();
				patch({ lat: "", lng: "" });
				setLookup("missing");
			}
		}, 700);
		return () => {
			cancelled = true;
			window.clearTimeout(timer);
		};
	}, [street, city, maps]); // eslint-disable-line react-hooks/exhaustive-deps

	if (!form) return null;
	const hasPin = Boolean(form.lat && form.lng);
	const movePin = (lat: string, lng: string) => {
		placedByHand.current = true;
		onMove(lat, lng);
	};

	return (
		<div className="grid gap-[18px]">
			<Field id="venue-name" label="Venue name" optional>
				<input
					{...controlProps("venue-name", {})}
					type="text"
					placeholder="The name guests will look for"
					value={form.venueName}
					onChange={(event) => set("venueName", event.target.value)}
					className={controlClass(false, "h-11")}
				/>
			</Field>
			<Field id="venue-street" label="Street address" error={errors.street}>
				<input
					{...controlProps("venue-street", { error: errors.street })}
					type="text"
					autoComplete="street-address"
					placeholder="House number and street"
					value={form.street}
					onChange={(event) => set("street", event.target.value)}
					className={controlClass(Boolean(errors.street), "h-11")}
				/>
			</Field>
			<Field id="venue-city" label="City" error={errors.city}>
				<input
					{...controlProps("venue-city", { error: errors.city })}
					type="text"
					autoComplete="address-level2"
					placeholder="City or town"
					value={form.city}
					onChange={(event) => set("city", event.target.value)}
					className={controlClass(Boolean(errors.city), "h-11")}
				/>
			</Field>
			<Field id="venue-state" label="State" optional>
				<input
					{...controlProps("venue-state", {})}
					type="text"
					autoComplete="address-level1"
					placeholder="State"
					value={form.state}
					onChange={(event) => set("state", event.target.value)}
					className={controlClass(false, "h-11")}
				/>
			</Field>
			{countryName && <p className="text-[13px] text-auth-muted">In {countryName}, your operating country.</p>}

			{street && city && (
				<div className="grid gap-2">
					{maps === "ready" && (hasPin || moving) ? (
						<>
							<VenueMap
								lat={form.lat}
								lng={form.lng}
								moving={moving}
								onMove={movePin}
								onDone={() => setMoving(false)}
								className="h-[220px]"
								label={`Map around ${addressLine}`}
							/>
							{hasPin && (
								<p className="text-[13px] leading-[1.45] text-auth-muted">
									{placedByHand.current ? "You placed the pin." : "We put the pin where the address points."}{" "}
									<button
										type="button"
										onClick={() => setMoving(true)}
										className="text-[13px] font-semibold text-auth-link"
									>
										Move the pin
									</button>{" "}
									if the entrance is somewhere else.
								</p>
							)}
						</>
					) : lookup === "missing" || maps === "failed" ? (
						<NoPin canMove={maps === "ready"} onStartMoving={() => setMoving(true)} />
					) : (
						<div aria-hidden="true" className="h-[220px] animate-pulse rounded-xl bg-auth-page" />
					)}
				</div>
			)}

			{!searchDown && (
				<p>
					<button type="button" onClick={onSearchInstead} className={linkButton}>
						Search for the venue instead
					</button>
				</p>
			)}
		</div>
	);
}
