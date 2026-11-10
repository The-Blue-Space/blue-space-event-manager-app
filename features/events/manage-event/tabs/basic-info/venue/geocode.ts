import { variables } from "@/constants";

/** Google refused the request itself (bad key, billing off), rather than not knowing the address. */
export class GeocodeRefused extends Error {}

/** Coordinates for a typed address, from the Google Geocoding API. Throws when Google can't place it. */
export default async function geocodeAddress(address: string): Promise<{ lat: string; lng: string }> {
	if (!variables.GOOGLE_MAPS_API_KEY) throw new GeocodeRefused("No Google Maps key");
	const response = await fetch(
		`https://maps.googleapis.com/maps/api/geocode/json?region=ng&address=${encodeURIComponent(address)}&key=${variables.GOOGLE_MAPS_API_KEY}`
	);
	if (!response.ok) throw new Error("Geocoding request failed");
	const data = await response.json();
	if (data?.status === "REQUEST_DENIED" || data?.status === "OVER_QUERY_LIMIT") throw new GeocodeRefused(data.status);
	const location = data?.status === "OK" ? data.results?.[0]?.geometry?.location : null;
	if (!location) throw new Error("Address not found on the map");
	return { lat: String(location.lat), lng: String(location.lng) };
}
