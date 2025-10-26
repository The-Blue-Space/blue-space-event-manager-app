
import { variables } from "@/constants";
import { getCachedGeocoding, setCachedGeocoding } from "./geocoding-cache";

const GOOGLE_MAPS_API_KEY = variables.GOOGLE_MAPS_API_KEY;

type GeocodingResult = {
	address: string;
	city: string;
	state: string;
	country: string;
	postal_code: string;
	latitude: string;
	longitude: string;
};

type ForwardGeocodeResult = {
	latitude: string;
	longitude: string;
	formatted_address: string;
};

/**
 * Reverse geocode: Convert coordinates to address
 * Uses Google Geocoding API with caching
 */
export async function reverseGeocode(lat: string, lng: string): Promise<GeocodingResult> {
	// Check cache first
	const cached = getCachedGeocoding(lat, lng);
	if (cached) return cached;

	// Call Google Geocoding API
	const response = await fetch(
		`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
	);

	if (!response.ok) {
		throw new Error("Geocoding request failed");
	}

	const data = await response.json();

	if (data.status !== "OK" || !data.results || data.results.length === 0) {
		throw new Error("No address found for these coordinates");
	}

	// Parse address components
	const result = data.results[0];
	let address = "";
	let city = "";
	let state = "";
	let country = "";
	let postal_code = "";

	result.address_components.forEach((component: any) => {
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

	// If no street address found, use formatted address
	if (!address && result.formatted_address) {
		address = result.formatted_address.split(",")[0];
	}

	const geocodingResult: GeocodingResult = {
		address: address || "",
		city,
		state,
		country,
		postal_code,
		latitude: lat,
		longitude: lng,
	};

	// Cache the result
	setCachedGeocoding(lat, lng, geocodingResult);

	return geocodingResult;
}

/**
 * Forward geocode: Convert address to coordinates
 * Uses Google Geocoding API
 */
export async function forwardGeocode(address: string): Promise<ForwardGeocodeResult> {
	const response = await fetch(
		`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
			address
		)}&key=${GOOGLE_MAPS_API_KEY}`
	);

	if (!response.ok) {
		throw new Error("Geocoding request failed");
	}

	const data = await response.json();

	if (data.status !== "OK" || !data.results || data.results.length === 0) {
		throw new Error("Address not found on map");
	}

	const result = data.results[0];
	const location = result.geometry.location;

	return {
		latitude: location.lat.toString(),
		longitude: location.lng.toString(),
		formatted_address: result.formatted_address,
	};
}

/**
 * Validate coordinate values
 */
export function isValidCoordinate(lat: string, lng: string): boolean {
	const latNum = parseFloat(lat);
	const lngNum = parseFloat(lng);

	return (
		!isNaN(latNum) &&
		!isNaN(lngNum) &&
		latNum >= -90 &&
		latNum <= 90 &&
		lngNum >= -180 &&
		lngNum <= 180
	);
}
