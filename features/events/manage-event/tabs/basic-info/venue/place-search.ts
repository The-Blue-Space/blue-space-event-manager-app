"use client";
import * as React from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

export type Place = {
	name: string;
	street: string;
	city: string;
	state: string;
	country: string;
	postalCode: string;
	lat: string;
	lng: string;
};

export type PlaceSuggestion = { id: string; name: string; line: string; resolve: () => Promise<Place> };

export type PlaceSearchStatus = "idle" | "loading" | "ready" | "unavailable";

type Component = { types: string[]; long: string };

function toPlace(name: string, address: string, components: Component[], lat?: number, lng?: number): Place {
	const find = (...types: string[]) =>
		types.map((type) => components.find((component) => component.types.includes(type))?.long).find(Boolean) ?? "";
	const street = [find("street_number"), find("route")].filter(Boolean).join(" ") || address.split(",")[0] || "";
	return {
		name,
		street,
		city: find("locality", "postal_town", "administrative_area_level_2", "sublocality"),
		state: find("administrative_area_level_1"),
		country: find("country"),
		postalCode: find("postal_code"),
		lat: lat !== undefined ? String(lat) : "",
		lng: lng !== undefined ? String(lng) : "",
	};
}

/**
 * Venue suggestions from Google Places, limited to Nigeria. Uses the current Places API and falls back to the
 * legacy AutocompleteService; when neither answers (no key, billing off) the status becomes "unavailable".
 */
export default function usePlaceSearch(query: string) {
	const places = useMapsLibrary("places");
	const [status, setStatus] = React.useState<PlaceSearchStatus>("idle");
	const [suggestions, setSuggestions] = React.useState<PlaceSuggestion[]>([]);
	const sessionRef = React.useRef<google.maps.places.AutocompleteSessionToken | null>(null);
	const term = query.trim();

	React.useEffect(() => {
		if (!places || term.length < 2) {
			setSuggestions([]);
			if (term.length < 2) setStatus((current) => (current === "unavailable" ? current : "idle"));
			return;
		}
		let cancelled = false;
		setStatus((current) => (current === "unavailable" ? current : "loading"));
		const timer = window.setTimeout(async () => {
			sessionRef.current ??= new places.AutocompleteSessionToken();
			const sessionToken = sessionRef.current;
			try {
				const { suggestions: found } = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
					input: term,
					sessionToken,
					includedRegionCodes: ["ng"],
				});
				if (cancelled) return;
				setSuggestions(
					found.flatMap(({ placePrediction: prediction }) =>
						prediction
							? [
									{
										id: prediction.placeId,
										name: prediction.mainText?.text ?? prediction.text.text,
										line: prediction.secondaryText?.text ?? "",
										resolve: async () => {
											const place = prediction.toPlace();
											await place.fetchFields({
												fields: ["displayName", "formattedAddress", "addressComponents", "location"],
											});
											sessionRef.current = null;
											return toPlace(
												place.displayName ?? "",
												place.formattedAddress ?? "",
												(place.addressComponents ?? []).map((c) => ({ types: c.types, long: c.longText ?? "" })),
												place.location?.lat(),
												place.location?.lng()
											);
										},
									},
								]
							: []
					)
				);
				setStatus("ready");
			} catch {
				try {
					const legacy = new places.AutocompleteService();
					const { predictions } = await legacy.getPlacePredictions({
						input: term,
						sessionToken,
						componentRestrictions: { country: "ng" },
					});
					if (cancelled) return;
					const details = new places.PlacesService(document.createElement("div"));
					setSuggestions(
						predictions.map((prediction) => ({
							id: prediction.place_id,
							name: prediction.structured_formatting.main_text,
							line: prediction.structured_formatting.secondary_text ?? "",
							resolve: () =>
								new Promise<Place>((resolve, reject) =>
									details.getDetails(
										{
											placeId: prediction.place_id,
											sessionToken,
											fields: ["name", "formatted_address", "address_components", "geometry"],
										},
										(result, detailsStatus) => {
											sessionRef.current = null;
											if (detailsStatus !== places.PlacesServiceStatus.OK || !result)
												return reject(new Error(detailsStatus));
											resolve(
												toPlace(
													result.name ?? "",
													result.formatted_address ?? "",
													(result.address_components ?? []).map((c) => ({ types: c.types, long: c.long_name })),
													result.geometry?.location?.lat(),
													result.geometry?.location?.lng()
												)
											);
										}
									)
								),
						}))
					);
					setStatus("ready");
				} catch {
					if (cancelled) return;
					setSuggestions([]);
					setStatus("unavailable");
				}
			}
		}, 250);
		return () => {
			cancelled = true;
			window.clearTimeout(timer);
		};
	}, [places, term]);

	return { status, suggestions };
}
