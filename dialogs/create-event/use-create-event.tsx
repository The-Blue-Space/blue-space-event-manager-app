"use client";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ZodError } from "zod";
import useCustomNavigation from "@/hooks/use-navigation";
import ensureError from "@/lib/ensure-error";
import invalidateQuery from "@/lib/invalidate-query";
import { profileQueryKey } from "@/features/settings/use-save-profile";
import getManagerProfile from "@/services/account/get-manager-profile";
import createEvent from "@/services/events/create-event";
import getCountries from "@/services/extras/get-countries";
import getEventCategories from "@/services/extras/get-event-categories";
import useActions from "@/store/actions";
import useAppSelector from "@/store/hooks";
import { COMMON_CATEGORIES, newEventInitial, newEventSchema, NewEventForm } from "./schema";

type FieldErrors = Partial<Record<keyof NewEventForm, string>>;

function firstErrors(error: ZodError): FieldErrors {
	const errors: FieldErrors = {};
	for (const issue of error.issues) {
		const field = issue.path[0] as keyof NewEventForm;
		errors[field] ??= issue.message;
	}
	return errors;
}

export default function useCreateEvent() {
	const { dialog } = useAppSelector("ui");
	const { managerProfile } = useAppSelector("manager_profile");
	const { ui } = useActions();
	const { navigate } = useCustomNavigation();
	const open = dialog.show && dialog.type === "create_event";

	const [form, setForm] = React.useState<NewEventForm>(newEventInitial);
	const [attempted, setAttempted] = React.useState(false);
	const [isLoading, setIsLoading] = React.useState(false);

	const { data: categories = [], isLoading: loadingCategories } = useQuery({
		queryKey: ["event-categories"],
		queryFn: getEventCategories,
		enabled: open,
	});
	const { data: countries = [] } = useQuery({ queryKey: ["countries"], queryFn: getCountries, enabled: open });
	const profileId = managerProfile?.id ?? "";
	const { data: profile } = useQuery({
		queryKey: profileQueryKey(profileId),
		queryFn: () => getManagerProfile(profileId),
		enabled: open && Boolean(profileId),
	});

	// Alphabetical, with the catch-all "Other" at the end.
	const categoryOptions = React.useMemo(
		() =>
			categories
				.map((category) => ({ value: category.id, label: category.name }))
				.sort((a, b) => Number(a.label === "Other") - Number(b.label === "Other") || a.label.localeCompare(b.label)),
		[categories]
	);
	const commonCategories = COMMON_CATEGORIES.flatMap((name) =>
		categoryOptions.filter((option) => option.label === name).map((option) => option.value)
	);

	// Events take place in the organizer's operating country (the profile cached at login doesn't include it).
	const locationId = profile?.operating_country_id || countries[0]?.id || "";
	const countryName = countries.find((country) => country.id === locationId)?.country_name;

	const errors = React.useMemo<FieldErrors>(() => {
		if (!attempted) return {};
		const result = newEventSchema.safeParse(form);
		return result.success ? {} : firstErrors(result.error);
	}, [attempted, form]);

	const set = <K extends keyof NewEventForm>(field: K, value: NewEventForm[K]) =>
		setForm((prev) => ({ ...prev, [field]: value }));

	const close = () => {
		if (isLoading) return;
		setForm(newEventInitial);
		setAttempted(false);
		ui.resetDialog();
	};

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setAttempted(true);
		const result = newEventSchema.safeParse(form);
		if (!result.success || !locationId) return;

		setIsLoading(true);
		try {
			const { event } = await createEvent({ ...result.data, location_id: locationId });
			invalidateQuery(["events"]);
			invalidateQuery(["home-dashboard"]);
			toast.success("Draft created");
			setForm(newEventInitial);
			setAttempted(false);
			ui.resetDialog();
			navigate(`/events/${event.id}`);
		} catch (error) {
			toast.error(ensureError(error).message);
		} finally {
			setIsLoading(false);
		}
	};

	return {
		open,
		form,
		errors,
		isLoading,
		categoryOptions,
		commonCategories,
		loadingCategories,
		countryName,
		set,
		close,
		submit,
	};
}
