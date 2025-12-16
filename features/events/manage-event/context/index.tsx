import useCustomNavigation from "@/hooks/use-navigation";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useActions from "@/store/actions";
import { DeepPartial } from "@/types/global.types";
import { toast } from "sonner";
import { AccessType, Event } from "@/types/event.types";
import getEventDetails from "@/services/events/get-event-details";
import updateEventDetails from "@/services/events/update-event";
import { EventMediaType } from "@/types/event-media.types";
import addMedia from "@/services/events/event-media/add-media";
import useAppSelector from "@/store/hooks";

interface EventContextType {
	open: boolean;
	handleExit: () => void;
	isLoading: boolean;
	isFetching: boolean;
	isError: boolean;
	error: unknown;
	published: boolean;
	updateEvent: (type: "local" | "server", data: DeepPartial<Event>) => Promise<void>;
	updateEventLocation: (locationData: {
		venue_name?: string | null;
		address: string;
		city: string;
		state?: string | null;
		country?: string | null;
		postal_code?: string | null;
		latitude: string;
		longitude: string;
	}) => Promise<void>;
	uploadImages: (images: { file: File; type: EventMediaType }[]) => Promise<void>;
	publishEvent: () => Promise<void>;
	changeTab: (slug: string) => void;
	accessType: AccessType;
	event: Event | null;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEvent = () => {
	const context = useContext(EventContext);
	if (context === undefined) {
		throw new Error("useEvent must be used within a EventProvider");
	}
	return context;
};

interface EventProviderProps {
	children: React.ReactNode;
}

export const EventProvider: React.FC<EventProviderProps> = ({ children }) => {
	const {account}= useAppSelector("account")
	const [event, setEvent] = useState<Event | null>(null);

	const [isLoading, setIsLoading] = useState(false);

	const { navigate, params, queryParams } = useCustomNavigation();

	const event_id = params.event_id as string;

	const open = useMemo(() => {
		return !!event_id;
	}, [event_id]);

	const { ui } = useActions();

	function updateQueryParams(slug: string) {
		queryParams.set("tab", slug);
	}

	const { data, isFetching, isError, error } = useQuery({
		queryKey: ["event-details", event_id],
		queryFn: () => getEventDetails({ id: event_id }),
		enabled: open,
	});

	useEffect(() => {
		if (data) {
			setEvent(data);
		}
	}, [data]);

	const updateEvent = async (type: "local" | "server", data: DeepPartial<Event>) => {
		if (!event) return;
		if (type === "local") {
			setEvent((prev) => {
				if (!prev) return null;
				return {
					...prev,
					...data,
				} as Event;
			});
			return;
		}
		setIsLoading(true);
		try {
			const response = await updateEventDetails({ event_id, ...data });
			if (response) {
				setEvent(response);
				toast.success("Event details updated successfully");
			}
		} catch (err) {
			toast.error("Failed to update event details");
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	const updateEventLocation = async (locationData: {
		venue_name?: string | null;
		address: string;
		city: string;
		state?: string | null;
		country?: string | null;
		postal_code?: string | null;
		latitude: string;
		longitude: string;
	}) => {
		return updateEvent("server", locationData);
	};

	const uploadImages = async (images: { file: File; type: EventMediaType }[]) => {
		setIsLoading(true);
		try {
			// TODO: Implement image upload
			await addMedia({
				event_Id: event_id,
				file: images[0].file,
				media_type: images[0].type,
				is_active: true,
				order: 1,
				user_id: account.id,
			});
			
		} catch (err) {
			toast.error("Failed to upload images");
			throw err;
		}
	};

	const publishEvent = async () => {
		// if (!merchandise) return;
		// setIsLoading(true);
		// try {
		// 	const response = await updateMerchandiseDetails({
		// 		...merchandise,
		// 		merchandise_status: "published",
		// 	});
		// 	if (response) {
		// 		setMerchandise(response);
		// 		toast.success("Merchandise published successfully");
		// 		nextStep("product_dashboard");
		// 	}
		// } catch (err) {
		// 	toast.error("Failed to publish merchandise");
		// 	throw err;
		// } finally {
		// 	setIsLoading(false);
		// }
	};

	const handleExit = () => {
		ui.changeDialog({
			show: true,
			type: "info_dialog",
			data: {
				title: "Exit Event Manager?",
				text: "Are you sure you want to exit event manager? \n ensure all your settings has been saved.",
			},
			action: () => {
				navigate("/events");
			},
		});
	};

	const value: EventContextType = {
		open,
		handleExit,
		isLoading,
		isFetching,
		isError,
		error,
		event,
		accessType: event?.access_type ?? ("" as any),
		published: event?.published ?? false,
		updateEvent,
		updateEventLocation,
		uploadImages,
		changeTab: updateQueryParams,
		publishEvent,
	};

	return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};
