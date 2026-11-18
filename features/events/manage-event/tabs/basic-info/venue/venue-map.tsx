"use client";
import * as React from "react";
import classNames from "classnames";
import { Map, MapMouseEvent, Marker, useMap } from "@vis.gl/react-google-maps";
import { useReportMapsBroken } from "./maps-health";

// Lagos Island, for a map that has no pin yet.
const LAGOS = { lat: 6.4541, lng: 3.3947 };

type VenueMapProps = {
	lat: string;
	lng: string;
	/** While moving, a click on the map (or a drag of the pin) moves the pin. */
	moving?: boolean;
	onMove?: (lat: string, lng: string) => void;
	onDone?: () => void;
	className?: string;
	/** The small read-only map in the preview. */
	compact?: boolean;
	label?: string;
};

function Follow({ position }: { position: google.maps.LatLngLiteral | null }) {
	const map = useMap();
	React.useEffect(() => {
		if (map && position) map.panTo(position);
	}, [map, position]);
	return null;
}

export default function VenueMap({
	lat,
	lng,
	moving = false,
	onMove,
	onDone,
	className,
	compact,
	label,
}: VenueMapProps) {
	const position = React.useMemo(() => {
		const latitude = parseFloat(lat);
		const longitude = parseFloat(lng);
		return Number.isFinite(latitude) && Number.isFinite(longitude) ? { lat: latitude, lng: longitude } : null;
	}, [lat, lng]);

	// Google draws an error box inside the map when it won't serve this key; stop showing maps if it does.
	const boxRef = React.useRef<HTMLDivElement>(null);
	const reportBroken = useReportMapsBroken();
	React.useEffect(() => {
		const box = boxRef.current;
		if (!box) return;
		const check = () => {
			if (box.querySelector(".gm-err-container, .dismissButton")) reportBroken();
		};
		const observer = new MutationObserver(check);
		observer.observe(box, { childList: true, subtree: true });
		check();
		return () => observer.disconnect();
	}, [reportBroken]);

	const place = (event: MapMouseEvent) => {
		const point = event.detail.latLng;
		if (moving && point) onMove?.(String(point.lat), String(point.lng));
	};

	return (
		<div
			ref={boxRef}
			role={label ? "region" : undefined}
			aria-label={label}
			className={classNames("relative overflow-hidden rounded-xl border border-auth-line bg-auth-page", className)}
		>
			<Map
				defaultCenter={position ?? LAGOS}
				defaultZoom={position ? 16 : 12}
				gestureHandling={moving ? "greedy" : "none"}
				disableDefaultUI
				keyboardShortcuts={false}
				clickableIcons={false}
				onClick={place}
				className="size-full"
			>
				{position && (
					<Marker
						position={position}
						draggable={moving}
						onDragEnd={(event) => {
							const point = event.latLng;
							if (point) onMove?.(String(point.lat()), String(point.lng()));
						}}
					/>
				)}
				<Follow position={position} />
			</Map>
			{moving && !compact && (
				<div className="pointer-events-none absolute inset-x-3 top-3 flex items-center justify-between gap-3">
					<span className="rounded-lg bg-white px-2.5 py-[7px] text-[13px] font-semibold text-auth-ink shadow-[0_2px_8px_rgba(25,24,55,0.18)]">
						Click where guests should go in
					</span>
					<button
						type="button"
						onClick={onDone}
						className="pointer-events-auto h-[34px] rounded-lg bg-primary-500 px-3.5 text-[14px] font-semibold text-white"
					>
						Done
					</button>
				</div>
			)}
		</div>
	);
}
