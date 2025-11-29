/**
 * Request browser geolocation with timeout
 * @param timeout - Timeout in milliseconds (default: 5000ms)
 * @returns Promise resolving to GeolocationPosition or null
 */
function getGeolocation(timeout: number = 5000): Promise<GeolocationPosition | null> {
	return new Promise((resolve) => {
		const timeoutId = setTimeout(() => {
			resolve(null);
		}, timeout);

		navigator.geolocation.getCurrentPosition(
			(position) => {
				clearTimeout(timeoutId);
				resolve(position);
			},
			(error) => {
				clearTimeout(timeoutId);
				console.log("Geolocation error:", error.message);
				resolve(null);
			},
			{
				enableHighAccuracy: true, // Faster, less battery drain
				timeout: timeout,
				maximumAge: 300000, // Cache for 5 minutes
			}
		);
	});
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lng1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lng2 - Longitude of second point
 * @returns Distance in kilometers
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
	const R = 6371; // Earth's radius in kilometers
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLng = ((lng2 - lng1) * Math.PI) / 180;

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLng / 2) *
			Math.sin(dLng / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

/**
 * Snap coordinates to the nearest known city/region
 * @param lat - Precise latitude
 * @param lng - Precise longitude
 * @param cities - Map of city names to coordinates
 * @returns Coordinates of nearest city
 */
function snapToNearestCity(
	lat: number,
	lng: number,
	cities: Record<string, { lat: number; lng: number }>
): { lat: number; lng: number } {
	let nearestCity = { lat, lng };
	let minDistance = Infinity;

	for (const cityCoords of Object.values(cities)) {
		const distance = calculateDistance(lat, lng, cityCoords.lat, cityCoords.lng);

		if (distance < minDistance) {
			minDistance = distance;
			nearestCity = cityCoords;
		}
	}

	console.log(`Snapped to nearest city (${minDistance.toFixed(2)}km away)`);
	return nearestCity;
}

/**
 * Get approximate or precise coordinates
 * Tries in order:
 * 1. Browser geolocation (requires permission, most accurate)
 * 2. Timezone-based approximation (no permission needed)
 * 3. Language-based approximation (fallback)
 * 4. Default coordinates (last resort)
 *
 * @param tryGeolocation - Whether to attempt browser geolocation (default: true)
 * @returns Promise resolving to latitude and longitude
 */
export async function getApproximateCoordinates(
	tryGeolocation: boolean = true
): Promise<{ lat: number; lng: number }> {
	let coords = { lat: 9.082, lng: 8.6753 };

	// Map timezones to approximate coordinates (major cities)
	const timezoneCoordinates: Record<string, { lat: number; lng: number }> = {
		// Africa
		"Africa/Lagos": { lat: 6.5244, lng: 3.3792 }, // Lagos, Nigeria
		"Africa/Abuja": { lat: 9.082, lng: 8.6753 }, // Abuja, Nigeria
		"Africa/Johannesburg": { lat: -26.2041, lng: 28.0473 }, // Johannesburg, SA
		"Africa/Cairo": { lat: 30.0444, lng: 31.2357 }, // Cairo, Egypt
		"Africa/Nairobi": { lat: -1.2864, lng: 36.8172 }, // Nairobi, Kenya
		"Africa/Casablanca": { lat: 33.5731, lng: -7.5898 }, // Casablanca, Morocco

		// Europe
		"Europe/London": { lat: 51.5074, lng: -0.1278 }, // London, UK
		"Europe/Paris": { lat: 48.8566, lng: 2.3522 }, // Paris, France
		"Europe/Berlin": { lat: 52.52, lng: 13.405 }, // Berlin, Germany
		"Europe/Madrid": { lat: 40.4168, lng: -3.7038 }, // Madrid, Spain
		"Europe/Rome": { lat: 41.9028, lng: 12.4964 }, // Rome, Italy
		"Europe/Amsterdam": { lat: 52.3676, lng: 4.9041 }, // Amsterdam, Netherlands
		"Europe/Brussels": { lat: 50.8503, lng: 4.3517 }, // Brussels, Belgium
		"Europe/Vienna": { lat: 48.2082, lng: 16.3738 }, // Vienna, Austria
		"Europe/Stockholm": { lat: 59.3293, lng: 18.0686 }, // Stockholm, Sweden
		"Europe/Warsaw": { lat: 52.2297, lng: 21.0122 }, // Warsaw, Poland

		// Americas
		"America/New_York": { lat: 40.7128, lng: -74.006 }, // New York, USA
		"America/Los_Angeles": { lat: 34.0522, lng: -118.2437 }, // Los Angeles, USA
		"America/Chicago": { lat: 41.8781, lng: -87.6298 }, // Chicago, USA
		"America/Toronto": { lat: 43.6532, lng: -79.3832 }, // Toronto, Canada
		"America/Mexico_City": { lat: 19.4326, lng: -99.1332 }, // Mexico City, Mexico
		"America/Sao_Paulo": { lat: -23.5505, lng: -46.6333 }, // São Paulo, Brazil
		"America/Buenos_Aires": { lat: -34.6037, lng: -58.3816 }, // Buenos Aires, Argentina
		"America/Bogota": { lat: 4.711, lng: -74.0721 }, // Bogotá, Colombia
		"America/Lima": { lat: -12.0464, lng: -77.0428 }, // Lima, Peru
		"America/Vancouver": { lat: 49.2827, lng: -123.1207 }, // Vancouver, Canada

		// Asia
		"Asia/Dubai": { lat: 25.2048, lng: 55.2708 }, // Dubai, UAE
		"Asia/Tokyo": { lat: 35.6762, lng: 139.6503 }, // Tokyo, Japan
		"Asia/Shanghai": { lat: 31.2304, lng: 121.4737 }, // Shanghai, China
		"Asia/Singapore": { lat: 1.3521, lng: 103.8198 }, // Singapore
		"Asia/Hong_Kong": { lat: 22.3193, lng: 114.1694 }, // Hong Kong
		"Asia/Seoul": { lat: 37.5665, lng: 126.978 }, // Seoul, South Korea
		"Asia/Mumbai": { lat: 19.076, lng: 72.8777 }, // Mumbai, India
		"Asia/Kolkata": { lat: 22.5726, lng: 88.3639 }, // Kolkata, India
		"Asia/Bangkok": { lat: 13.7563, lng: 100.5018 }, // Bangkok, Thailand
		"Asia/Jakarta": { lat: -6.2088, lng: 106.8456 }, // Jakarta, Indonesia
		"Asia/Manila": { lat: 14.5995, lng: 120.9842 }, // Manila, Philippines
		"Asia/Riyadh": { lat: 24.7136, lng: 46.6753 }, // Riyadh, Saudi Arabia
		"Asia/Tel_Aviv": { lat: 32.0853, lng: 34.7818 }, // Tel Aviv, Israel

		// Australia/Oceania
		"Australia/Sydney": { lat: -33.8688, lng: 151.2093 }, // Sydney, Australia
		"Australia/Melbourne": { lat: -37.8136, lng: 144.9631 }, // Melbourne, Australia
		"Australia/Brisbane": { lat: -27.4698, lng: 153.0251 }, // Brisbane, Australia
		"Pacific/Auckland": { lat: -36.8485, lng: 174.7633 }, // Auckland, New Zealand
	};

	// Map language codes to default country coordinates
	const languageCoordinates: Record<string, { lat: number; lng: number }> = {
		en: { lat: 51.5074, lng: -0.1278 }, // English -> London
		fr: { lat: 48.8566, lng: 2.3522 }, // French -> Paris
		es: { lat: 40.4168, lng: -3.7038 }, // Spanish -> Madrid
		de: { lat: 52.52, lng: 13.405 }, // German -> Berlin
		pt: { lat: -23.5505, lng: -46.6333 }, // Portuguese -> São Paulo
		ar: { lat: 25.2048, lng: 55.2708 }, // Arabic -> Dubai
		zh: { lat: 31.2304, lng: 121.4737 }, // Chinese -> Shanghai
		ja: { lat: 35.6762, lng: 139.6503 }, // Japanese -> Tokyo
		ko: { lat: 37.5665, lng: 126.978 }, // Korean -> Seoul
		it: { lat: 41.9028, lng: 12.4964 }, // Italian -> Rome
		nl: { lat: 52.3676, lng: 4.9041 }, // Dutch -> Amsterdam
		pl: { lat: 52.2297, lng: 21.0122 }, // Polish -> Warsaw
		ru: { lat: 55.7558, lng: 37.6173 }, // Russian -> Moscow
		tr: { lat: 41.0082, lng: 28.9784 }, // Turkish -> Istanbul
	};

	// Try precise geolocation first (if enabled)
	if (tryGeolocation && typeof navigator !== "undefined" && navigator.geolocation) {
		try {
			const position = await getGeolocation();
			if (position) {
				const preciseLat = position.coords.latitude;
				const preciseLng = position.coords.longitude;

				console.log("Precise geolocation:", { lat: preciseLat, lng: preciseLng });

				// Snap to nearest known city/region
				coords = snapToNearestCity(preciseLat, preciseLng, timezoneCoordinates);
				console.log("Snapped to region:", coords);

				return coords;
			}
		} catch (error) {
			console.log("Geolocation denied or failed, falling back to timezone", error);
			// Continue to timezone/language fallback
		}
	}

	try {
		// Try timezone-based approximation
		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		console.log("timezone", timezone);
		if (timezoneCoordinates[timezone]) {
			coords = timezoneCoordinates[timezone];
			return coords;
		}

		// Try language-based approximation
		const language = navigator.language.split("-")[0]; // Extract 'en' from 'en-US'
		if (languageCoordinates[language]) {
			coords = languageCoordinates[language];
			return coords;
		}
	} catch (error) {
		console.warn("Could not determine approximate location:", error);
	}

	return coords;
}
