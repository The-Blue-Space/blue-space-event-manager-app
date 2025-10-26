"use client";

import { Input } from "@/components/ui/input";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { Search } from "lucide-react";
import { useEffect, useRef, useCallback } from "react";
import { setCachedGeocoding } from "./geocoding-cache";

type PlaceResult = {
	venue_name: string;
	address: string;
	city: string;
	state: string;
	country: string;
	postal_code: string;
	latitude: string;
	longitude: string;
};

type Props = {
	onPlaceSelect: (place: PlaceResult) => void;
	isLoading?: boolean;
};

/**
 * Google Places Autocomplete component
 * Uses Places API for address search and autocomplete
 * Implements throttling to avoid excessive API calls
 */
export default function LocationAutocomplete({ onPlaceSelect, isLoading }: Props) {
	const inputRef = useRef<HTMLInputElement>(null);
	const places = useMapsLibrary("places");
	const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

	// Throttle place changed event
	const throttleTimeout = useRef<NodeJS.Timeout | null>(null);

	const handlePlaceChanged = useCallback(() => {
		// Clear existing timeout
		if (throttleTimeout.current) {
			clearTimeout(throttleTimeout.current);
		}

		// Throttle to 500ms
		throttleTimeout.current = setTimeout(() => {
			if (!autocompleteRef.current) return;

			const place = autocompleteRef.current.getPlace();

			// Extract place details
			if (place.geometry?.location && place.address_components) {
				const lat = place.geometry.location.lat().toString();
				const lng = place.geometry.location.lng().toString();

				// Parse address components
				let address = "";
				let city = "";
				let state = "";
				let country = "";
				let postal_code = "";

				place.address_components.forEach((component) => {
					const types = component.types;

					if (types.includes("street_number")) {
						address = component.long_name;
					}
					if (types.includes("route")) {
						address = address ? `${address} ${component.long_name}` : component.long_name;
					}
					if (types.includes("locality")) {
						city = component.long_name;
					}
					if (types.includes("administrative_area_level_1")) {
						state = component.long_name;
					}
					if (types.includes("country")) {
						country = component.long_name;
					}
					if (types.includes("postal_code")) {
						postal_code = component.long_name;
					}
				});

				const result: PlaceResult = {
					venue_name: place.name || "",
					address: address || place.formatted_address || "",
					city,
					state,
					country,
					postal_code,
					latitude: lat,
					longitude: lng,
				};

				// Cache the geocoding result
				setCachedGeocoding(lat, lng, result);

				// Call the callback
				onPlaceSelect(result);

				// Clear input after selection
				if (inputRef.current) {
					inputRef.current.value = "";
				}
			}
		}, 500);
	}, [onPlaceSelect]);

	// Initialize autocomplete
	useEffect(() => {
		if (!places || !inputRef.current) return;

		// Create autocomplete instance
		autocompleteRef.current = new places.Autocomplete(inputRef.current, {
			fields: ["address_components", "geometry", "name", "formatted_address"],
			types: ["establishment", "geocode"], // Allow both venues and addresses
		});

		// Add place changed listener
		autocompleteRef.current.addListener("place_changed", handlePlaceChanged);

		// Cleanup
		return () => {
			if (autocompleteRef.current) {
				google.maps.event.clearInstanceListeners(autocompleteRef.current);
			}
			if (throttleTimeout.current) {
				clearTimeout(throttleTimeout.current);
			}
		};
	}, [places, handlePlaceChanged]);

	return (
		<div className="relative">
			<Input
				ref={inputRef}
				type="text"
				placeholder="Search for address or venue..."
				disabled={isLoading}
				className="pl-10"
			/>
			<Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
		</div>
	);
}
