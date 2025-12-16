"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { APIProvider } from "@vis.gl/react-google-maps";
import { MapPin, MapPinned, Navigation, Search } from "lucide-react";
import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useEvent } from "../../../context";
import SectionWrapper from "../../../section-wrapper";
import StaticMap from "./static-map";
import { formatZodErrors } from "@/lib/ensure-error";
import AppButton from "@/components/app/app-button";
import { reverseGeocode, forwardGeocode } from "./geocoding-utils";
import LoadingBox from "@/components/app/loading-box";
import { variables } from "@/constants";
const GOOGLE_MAPS_API_KEY = variables.GOOGLE_MAPS_API_KEY;

// Lazy load interactive components (optimization)
const InteractiveMap = lazy(() => import("./interactive-map"));
const LocationAutocomplete = lazy(() => import("./location-autocomplete"));

// Zod validation schema
const locationSchema = z.object({
	venue_name: z.string().optional().nullable(),
	address: z.string().min(1, "Address is required"),
	city: z.string().min(1, "City is required"),
	state: z.string().optional().nullable(),
	country: z.string().optional().nullable(),
	postal_code: z.string().optional().nullable(),
	latitude: z
		.string()
		.min(1, "Latitude is required")
		.refine((val) => !isNaN(parseFloat(val)), {
			message: "Invalid latitude",
		}),
	longitude: z
		.string()
		.min(1, "Longitude is required")
		.refine((val) => !isNaN(parseFloat(val)), {
			message: "Invalid longitude",
		}),
});

type LocationFormData = z.infer<typeof locationSchema>;

export default function LocationSection() {
	const { event, updateEventLocation } = useEvent();
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [showCoordinateInputs, setShowCoordinateInputs] = useState(false);
	const [geocodingLoading, setGeocodingLoading] = useState(false);
	const [isManualLocation, setIsManualLocation] = useState(false);

	const toggleManualLocation = () => {
		setIsManualLocation(!isManualLocation);
	};

	// Initialize form data from event
	const initialFormData = useMemo<LocationFormData>(
		() => ({
			venue_name: event?.venue_name || null,
			address: event?.address || "",
			city: event?.city || "",
			state: event?.state || null,
			country: event?.country || null,
			postal_code: event?.postal_code || null,
			latitude: event?.latitude || "",
			longitude: event?.longitude || "",
		}),
		[event]
	);

	const [formData, setFormData] = useState<LocationFormData>(initialFormData);

	// Sync form data when event changes
	useEffect(() => {
		setFormData(initialFormData);
	}, [initialFormData]);

	// Handle field change
	const handleChange = (field: keyof LocationFormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error for this field
		if (errors[field]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}
	};

	// Handle autocomplete place selection
	const handlePlaceSelect = (place: {
		venue_name: string;
		address: string;
		city: string;
		state: string;
		country: string;
		postal_code: string;
		latitude: string;
		longitude: string;
	}) => {
		if (isManualLocation) {
			setIsManualLocation(false);
		}
		setFormData({
			venue_name: place.venue_name || null,
			address: place.address,
			city: place.city,
			state: place.state || null,
			country: place.country || null,
			postal_code: place.postal_code || null,
			latitude: place.latitude,
			longitude: place.longitude,
		});
		setErrors({});
		toast.success("Location selected from map");
	};

	// Handle map location change
	const handleMapLocationChange = (lat: string, lng: string) => {
		setFormData((prev) => ({
			...prev,
			latitude: lat,
			longitude: lng,
		}));

		// Note: User can click "Get Address from Map" button to reverse geocode
	};

	// Reverse geocoding handler - Get address from coordinates
	const handleReverseGeocode = async () => {
		if (!formData.latitude || !formData.longitude) {
			toast.error("Please set a location on the map first");
			return;
		}

		setGeocodingLoading(true);
		try {
			const result = await reverseGeocode(formData.latitude, formData.longitude);

			// Update fields with geocoded address
			setFormData((prev) => ({
				...prev,
				address: result.address || prev.address,
				city: result.city || prev.city,
				state: result.state || prev.state,
				country: result.country || prev.country,
				postal_code: result.postal_code || prev.postal_code,
			}));

			toast.success("Address retrieved from map location");
		} catch (error) {
			toast.error("Could not find address for this location");
			console.error("Reverse geocoding error:", error);
		} finally {
			setGeocodingLoading(false);
		}
	};

	// Forward geocoding handler - Find location from address
	const handleForwardGeocode = async () => {
		if (!formData.address || !formData.city) {
			toast.error("Please enter at least an address and city");
			return;
		}

		const searchAddress = `${formData.address}, ${formData.city}, ${formData.state || ""} ${
			formData.country || ""
		}`.trim();

		setGeocodingLoading(true);
		try {
			const result = await forwardGeocode(searchAddress);

			setFormData((prev) => ({
				...prev,
				latitude: result.latitude,
				longitude: result.longitude,
			}));

			toast.success("Location found on map");
		} catch (error) {
			toast.error("Could not find this address on the map");
			console.error("Forward geocoding error:", error);
		} finally {
			setGeocodingLoading(false);
		}
	};

	// Handle save
	const handleSave = async () => {
		setIsLoading(true);
		setErrors({});

		try {
			// Validate form data
			const validated = locationSchema.parse(formData);

			// Call context update function (to be implemented)
			await updateEventLocation(validated);

			toast.success("Location updated successfully");
		} catch (error) {
			if (error instanceof z.ZodError) {
				const formattedErrors = formatZodErrors(error);
				setErrors(formattedErrors);
				toast.error("Please fix the errors in the form");
			} else {
				toast.error("Failed to update location");
				console.error(error);
			}
		} finally {
			setIsLoading(false);
		}
	};

	// Handle cancel
	const handleCancel = () => {
		setFormData(initialFormData);
		setErrors({});
	};

	// Check if location is set
	const hasLocation = formData.latitude && formData.longitude;

	return (
		<APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
			<SectionWrapper
				title="Location"
				icon={<MapPin className="w-5 h-5 text-primary-500" />}
				onSave={handleSave}
				onCancel={handleCancel}
				isLoading={isLoading}
			>
				{(mode) => (
					<div className="space-y-4">
						{mode === "view" ? (
							// View Mode
							<>
								{hasLocation ? (
									<>
										{/* Location Details */}
										<div className="space-y-3">
											{formData.venue_name && (
												<div>
													<Label className="body-3 text-neutral-500">Venue</Label>
													<p className="body-2 text-neutral-900 font-medium">
														{formData.venue_name}
													</p>
												</div>
											)}

											<div>
												<Label className="body-3 text-neutral-500">Address</Label>
												<p className="body-2 text-neutral-700">
													{formData.address}
													{formData.city && `, ${formData.city}`}
													{formData.state && `, ${formData.state}`}
													{formData.postal_code && ` ${formData.postal_code}`}
												</p>
												{formData.country && (
													<p className="body-3 text-neutral-500 mt-1">{formData.country}</p>
												)}
											</div>

											<div>
												<Label className="body-3 text-neutral-500">Coordinates</Label>
												<Badge variant="outline" className="font-mono text-xs">
													{parseFloat(formData.latitude).toFixed(6)}°,{" "}
													{parseFloat(formData.longitude).toFixed(6)}°
												</Badge>
											</div>
										</div>

										{/* Static Map */}
										<div className="pt-2">
											<StaticMap
												latitude={formData.latitude}
												longitude={formData.longitude}
												venue_name={formData.venue_name}
											/>
										</div>
									</>
								) : (
									<div className="flex flex-col items-center justify-center py-8 text-center">
										<MapPinned className="w-12 h-12 text-neutral-300 mb-3" />
										<p className="body-2 text-neutral-600">No location set</p>
										<p className="body-3 text-neutral-400">Click edit to add event location</p>
									</div>
								)}
							</>
						) : (
							// Edit Mode
							<>
								{/* Help Text - Multiple Ways to Set Location */}
								<div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
									<p className="text-xs text-blue-800">
										<strong className="font-semibold">Multiple ways to set location:</strong> Search
										for known places • Click anywhere on map • Type address and click &quot;Find on
										Map&quot; • Enter coordinates directly
									</p>
								</div>

								{/* Address Search */}
								<div className="space-y-1">
									<Label htmlFor="address-search">Search Address or Venue</Label>
									<p className="body-3 text-neutral-500 mt-1">
										Search for a venue or address to auto-fill the form
									</p>
									<Suspense
										fallback={
											<Input placeholder="Loading map library..." disabled className="pl-10" />
										}
									>
										<LocationAutocomplete onPlaceSelect={handlePlaceSelect} isLoading={isLoading} />
									</Suspense>
									{!isManualLocation ? (
										<p className="body-3 text-neutral-500">
											Can&apos;t find your location?{" "}
											<button className="text-blue-500 underline" onClick={toggleManualLocation}>
												Enter manually
											</button>
										</p>
									) : (
										<p className="body-3 text-neutral-500">
											<button className="text-blue-500 underline" onClick={toggleManualLocation}>
												Back to auto-fill
											</button>
										</p>
									)}
								</div>

								{isManualLocation && (
									<>
										{/* Header with Back Link and Find on Map Button */}
										<div className="flex items-center justify-end">
											<AppButton
												variant="outline"
												onClick={handleForwardGeocode}
												isLoading={geocodingLoading}
												disabled={!formData.address || !formData.city || isLoading}
												leftIcon={<Search className="w-4 h-4" />}
												loaderType="simple"
											>
												Find on Map
											</AppButton>
										</div>

										{/* Venue Name */}
										<div>
											<Label htmlFor="venue_name">Venue Name (Optional)</Label>
											<Input
												id="venue_name"
												value={formData.venue_name || ""}
												onChange={(e) => handleChange("venue_name", e.target.value)}
												placeholder="e.g., Madison Square Garden"
												disabled={isLoading}
											/>
											{errors.venue_name && (
												<p className="text-xs text-red-600 mt-1">{errors.venue_name}</p>
											)}
										</div>

										{/* Address Fields */}
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div className="md:col-span-2">
												<Label htmlFor="address">
													Street Address <span className="text-red-500">*</span>
												</Label>
												<Input
													id="address"
													value={formData.address}
													onChange={(e) => handleChange("address", e.target.value)}
													placeholder="e.g., 123 Main Street"
													disabled={isLoading}
												/>
												{errors.address && (
													<p className="text-xs text-red-600 mt-1">{errors.address}</p>
												)}
											</div>

											<div>
												<Label htmlFor="city">
													City <span className="text-red-500">*</span>
												</Label>
												<Input
													id="city"
													value={formData.city}
													onChange={(e) => handleChange("city", e.target.value)}
													placeholder="e.g., New York"
													disabled={isLoading}
												/>
												{errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
											</div>

											<div>
												<Label htmlFor="state">State/Province</Label>
												<Input
													id="state"
													value={formData.state || ""}
													onChange={(e) => handleChange("state", e.target.value)}
													placeholder="e.g., California"
													disabled={isLoading}
												/>
											</div>

											<div>
												<Label htmlFor="postal_code">Postal Code</Label>
												<Input
													id="postal_code"
													value={formData.postal_code || ""}
													onChange={(e) => handleChange("postal_code", e.target.value)}
													placeholder="e.g., 90210"
													disabled={isLoading}
												/>
											</div>

											<div>
												<Label htmlFor="country">Country</Label>
												<Input
													id="country"
													value={formData.country || ""}
													onChange={(e) => handleChange("country", e.target.value)}
													placeholder="e.g., United States"
													disabled={isLoading}
												/>
											</div>
										</div>

										{/* Action Buttons - Above Map (Only in Manual Mode when location is set) */}
										{hasLocation && (
											<div className="flex gap-2 mt-4">
												<AppButton
													variant="muted"
													onClick={handleReverseGeocode}
													isLoading={geocodingLoading}
													disabled={isLoading}
													leftIcon={<MapPin className="w-4 h-4" />}
													loaderType="simple"
													className=""
												>
													Set Address from Map Pin
												</AppButton>
												<AppButton
													variant="ghost"
													onClick={() => setShowCoordinateInputs(!showCoordinateInputs)}
													leftIcon={<Navigation className="w-4 h-4" />}
													disabled={isLoading}
												>
													{showCoordinateInputs ? "Hide" : "Enter"} Coordinates
												</AppButton>
											</div>
										)}

										{/* Manual Coordinate Entry - Collapsible */}
										{showCoordinateInputs && (
											<div className="grid grid-cols-2 gap-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200 mt-2">
												<div>
													<Label htmlFor="manual-lat">Latitude</Label>
													<Input
														id="manual-lat"
														type="number"
														step="any"
														value={formData.latitude}
														onChange={(e) => handleChange("latitude", e.target.value)}
														placeholder="e.g., 40.7128"
														disabled={isLoading}
													/>
													<p className="text-xs text-neutral-500 mt-1">Range: -90 to 90</p>
												</div>
												<div>
													<Label htmlFor="manual-lng">Longitude</Label>
													<Input
														id="manual-lng"
														type="number"
														step="any"
														value={formData.longitude}
														onChange={(e) => handleChange("longitude", e.target.value)}
														placeholder="e.g., -74.0060"
														disabled={isLoading}
													/>
													<p className="text-xs text-neutral-500 mt-1">Range: -180 to 180</p>
												</div>
											</div>
										)}
									</>
								)}

								{/* Interactive Map - Clean */}
								<div className="mt-4">
									<Label className="mb-2 block">
										Location Map <span className="text-red-500">*</span>
										<p className="text-xs text-neutral-500 mt-2">
											Click on the map to set location
										</p>
									</Label>
									<Suspense
										fallback={
											<LoadingBox  load_type="simple"/>
										}
									>
										<InteractiveMap
											latitude={formData.latitude}
											longitude={formData.longitude}
											onLocationChange={handleMapLocationChange}
											isLoading={isLoading}
										/>
									</Suspense>
									{(errors.latitude || errors.longitude) && (
										<p className="text-xs text-red-600 mt-1">
											{errors.latitude || errors.longitude}
										</p>
									)}
								</div>

								{/* Coordinates Display */}
								{hasLocation && (
									<div className="flex items-center gap-2 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
										<MapPin className="w-4 h-4 text-neutral-400" />
										<span className="body-3 text-neutral-600">
											Coordinates:{" "}
											<code className="font-mono text-neutral-900">
												{parseFloat(formData.latitude).toFixed(6)}°,{" "}
												{parseFloat(formData.longitude).toFixed(6)}°
											</code>
										</span>
									</div>
								)}
							</>
						)}
					</div>
				)}
			</SectionWrapper>
		</APIProvider>
	);
}
