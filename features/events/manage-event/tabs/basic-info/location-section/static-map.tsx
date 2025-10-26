import { variables } from "@/constants";
import { MapPin } from "lucide-react";
import Image from "next/image";

const GOOGLE_MAPS_API_KEY = variables.GOOGLE_MAPS_API_KEY;
type Props = {
	latitude: string;
	longitude: string;
	venue_name?: string | null;
};

/**
 * Static map component for view mode
 * Uses Google Static Maps API - no JavaScript, just an image URL
 * This is more performant and doesn't count against Maps JavaScript API usage
 */
export default function StaticMap({ latitude, longitude, venue_name }: Props) {
	// Parse coordinates
	const lat = parseFloat(latitude);
	const lng = parseFloat(longitude);

	// Check if coordinates are valid
	if (isNaN(lat) || isNaN(lng)) {
		return (
			<div className="w-full h-64 bg-neutral-100 rounded-lg flex flex-col items-center justify-center gap-2">
				<MapPin className="w-8 h-8 text-neutral-400" />
				<p className="body-3 text-neutral-500">No location set</p>
			</div>
		);
	}

	// Generate Google Static Maps URL
	// https://developers.google.com/maps/documentation/maps-static/start
	const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=800x400&scale=2&markers=color:red%7C${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&style=feature:poi%7Celement:labels%7Cvisibility:off`;

	return (
		<div className="w-full h-64 rounded-lg overflow-hidden border border-neutral-200 relative">
			<Image
				src={staticMapUrl}
				alt={venue_name || "Event location"}
				fill
				className="object-cover"
				unoptimized // Static Maps API generates dynamic images
			/>
		</div>
	);
}
