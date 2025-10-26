/**
 * Geocoding cache utility
 * Caches geocoding results to avoid unnecessary API calls
 */

type GeocodingResult = {
	address: string;
	city: string;
	state: string;
	country: string;
	postal_code: string;
	latitude: string;
	longitude: string;
};

// In-memory cache for geocoding results
const geocodingCache = new Map<string, GeocodingResult>();

// Cache key generator (lat,lng)
const generateKey = (lat: string, lng: string): string => {
	return `${parseFloat(lat).toFixed(6)},${parseFloat(lng).toFixed(6)}`;
};

export const getCachedGeocoding = (lat: string, lng: string): GeocodingResult | null => {
	const key = generateKey(lat, lng);
	return geocodingCache.get(key) || null;
};

export const setCachedGeocoding = (lat: string, lng: string, result: GeocodingResult): void => {
	const key = generateKey(lat, lng);
	geocodingCache.set(key, result);
};

export const clearGeocodingCache = (): void => {
	geocodingCache.clear();
};
