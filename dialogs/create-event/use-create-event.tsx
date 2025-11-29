import useCustomNavigation from "@/hooks/use-navigation";
import useAppSelector from "@/store/hooks";
import React, { useMemo } from "react";
import ensureError, { formatZodErrors } from "@/lib/ensure-error";
import { toast } from "sonner";
import { newEventInitial, newEventSchema } from "./schema";
import useActions from "@/store/actions";
import { useQuery } from "@tanstack/react-query";
import { ZodError } from "zod";
import getEventCategories from "@/services/extras/get-event-categories";
import createEvent from "@/services/events/create-event";
import getCountries from "@/services/extras/get-countries";
import invalidateQuery from "@/lib/invalidate-query";

export default function useCreateEvent() {
	const { dialog } = useAppSelector("ui");
	const { managerProfile } = useAppSelector("manager_profile");
	const [formData, setFormData] = React.useState(newEventInitial);
	const [errors, setErrors] = React.useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = React.useState(false);
	const { navigate } = useCustomNavigation();

	const { ui } = useActions();

	const open = React.useMemo(() => {
		return dialog.show && dialog.type === "create_event";
	}, [dialog.show, dialog.type]);

	const { isFetching: fetchingEventCategories, data: eventCategories } = useQuery({
		queryKey: ["event-categories", open],
		queryFn: getEventCategories,
		enabled: open,
	});

	const { isFetching: fetchingLocations, data: locations } = useQuery({
		queryKey: ["locations", open],
		queryFn: getCountries,
		enabled: open,
	});

	const updateForm = (name: keyof typeof formData, value: string | boolean) => {
		setErrors({});
		setFormData((prev) => ({
			...prev,
			[name]: typeof value === "string" ? value : value,
		}));
	};

	const submit = async () => {
		if (!managerProfile?.id) {
			toast.error("Manager Profile not found, try refreshing the page");
			return;
		}
		setErrors({});
		setIsLoading(true);
		try {
			const formValues = newEventSchema.parse({
				...formData,
			});
			const response = await createEvent({
				...formValues,
				tags: formValues.tags.split(","),
				manager_id: managerProfile.id,
			});

			if (response) {
				toast.success("Event created successfully, you can now proceed to setup your event", {
					description: "You can now proceed to setup your event",
				});
				invalidateQuery(["events"]);
				navigate(`/events/${response.event.id}/manage`);
			}
		} catch (err) {
			if (err instanceof ZodError) {
				const errors = formatZodErrors(err);
				setErrors(errors);
				return;
			}
			const errMsg = ensureError(err).message;
			toast.error(errMsg);
		} finally {
			setIsLoading(false);
		}
	};

	const showSuccessDialog = (id: string) => {
		const dismiss = () => {
			invalidateQuery(["events"]);
			close();
		};
		ui.changeDialog({
			show: true,
			type: "success",
			data: {
				title: "Event created successfully",
				text: "You can now proceed to setup your event",
			},
			action: () => navigate(`/events/${id}/manage`),
			dismiss,
		});
	};

	const close = () => {
		if (isLoading) return;

		setFormData(newEventInitial);
		setErrors({});
		ui.resetDialog();
	};

	const eventCategoryOptions = useMemo(() => {
		if (!eventCategories) return [];
		return eventCategories?.map((item) => ({
			value: item.id,
			title: item.name,
		}));
	}, [eventCategories]);

	const locationOptions = useMemo(() => {
		if (!locations) return [];
		return locations?.map((item) => ({
			value: item.id,
			title: item.country_name,
		}));
	}, [locations]);

	return {
		isLoading,
		eventCategoryOptions,
		formData,
		updateForm,
		submit,
		errors,
		fetchingEventCategories,
		showSuccessDialog,
		open,
		close,
		locationOptions,
		fetchingLocations,
	};
}
