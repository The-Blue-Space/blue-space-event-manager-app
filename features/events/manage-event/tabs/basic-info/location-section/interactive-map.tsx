"use client";
import { Map, Marker, MapMouseEvent, useMap } from "@vis.gl/react-google-maps";
import { Loader2, MapPin } from "lucide-react";
import { useState, useCallback, useEffect } from "react";

type Props = {
	latitude: string;
	longitude: string;
	onLocationChange: (lat: string, lng: string) => void;
	isLoading?: boolean;
};

/**
 * Interactive map component for edit mode
 * Allows clicking to set location and dragging marker
 * Uses @vis.gl/react-google-maps for better performance
 */
export default function InteractiveMap({
	latitude,
	longitude,
	onLocationChange,
	isLoading,
}: Props) {
	const map = useMap(); // Get map instance for manual control
	const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);

	// Parse coordinates
	const lat = parseFloat(latitude);
	const lng = parseFloat(longitude);

	// Initialize marker position
	useEffect(() => {
		if (!isNaN(lat) && !isNaN(lng)) {
			setMarkerPosition({ lat, lng });
		}
	}, [lat, lng]);

	// Pan map to marker position when it changes (smooth animation)
	useEffect(() => {
		if (map && markerPosition) {
			map.panTo(markerPosition);
		}
	}, [map, markerPosition]);

	// Handle map click to set new location
	const handleMapClick = useCallback(
		(event: MapMouseEvent) => {
			if (isLoading) return;

			const clickedLat = event.detail.latLng?.lat;
			const clickedLng = event.detail.latLng?.lng;

			if (clickedLat && clickedLng) {
				const newPosition = { lat: clickedLat, lng: clickedLng };
				setMarkerPosition(newPosition);
				onLocationChange(clickedLat.toString(), clickedLng.toString());
			}
		},
		[onLocationChange, isLoading]
	);

	// Handle marker drag
	const handleMarkerDrag = useCallback(
		(event: google.maps.MapMouseEvent) => {
			if (isLoading) return;

			const draggedLat = event.latLng?.lat();
			const draggedLng = event.latLng?.lng();

			if (draggedLat && draggedLng) {
				const newPosition = { lat: draggedLat, lng: draggedLng };
				setMarkerPosition(newPosition);
				onLocationChange(draggedLat.toString(), draggedLng.toString());
			}
		},
		[onLocationChange, isLoading]
	);

	// Check if coordinates are valid
	if (!markerPosition) {
		return (
			<div className="w-full h-64 bg-neutral-100 rounded-lg flex flex-col items-center justify-center gap-2 border border-neutral-200">
				<MapPin className="w-8 h-8 text-neutral-400" />
				<p className="body-3 text-neutral-500">Click on the map to set a location</p>
				<p className="body-3 text-neutral-400">or use the address search above</p>
			</div>
		);
	}

	return (
		<div className="w-full h-64 rounded-lg overflow-hidden border border-neutral-200 relative">
			{isLoading && (
				<div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
					<Loader2 className="animate-spin  text-primary-500" />
				</div>
			)}
			<Map
				defaultCenter={markerPosition}
				defaultZoom={15}
				gestureHandling="greedy"
				disableDefaultUI={false}
				onClick={handleMapClick}
				mapTypeControl={false}
				streetViewControl={false}
				fullscreenControl={false}
			>
				<Marker position={markerPosition} draggable={!isLoading} onDragEnd={handleMarkerDrag} />
			</Map>
		</div>
	);
}
