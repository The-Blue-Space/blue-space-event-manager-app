"use client";
import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { profileQueryKey } from "@/features/settings/use-save-profile";
import useSavedForm, { SaveMode } from "@/hooks/use-saved-form";
import ensureError from "@/lib/ensure-error";
import getManagerProfile from "@/services/account/get-manager-profile";
import addMedia from "@/services/events/event-media/add-media";
import deleteMedia from "@/services/events/event-media/delete-media";
import getMedias from "@/services/events/event-media/get-medias";
import updateEventDetails from "@/services/events/update-event";
import getCountries from "@/services/extras/get-countries";
import getEventCategories from "@/services/extras/get-event-categories";
import useAppSelector from "@/store/hooks";
import { AgeRestriction, Event, EventFaq, ParkingType } from "@/types/event.types";
import { DeepPartial } from "@/types/global.types";
import { COMMON_CATEGORIES } from "@/dialogs/create-event/schema";
import { useReportUnsavedChanges } from "@/features/events/event-page/unsaved-changes";
import { useEvent } from "../../context";
import { lagosDateString, lagosInstantString, parseInstant } from "./lagos-time";

export type VenueMode = "search" | "chosen" | "manual";

export type DetailsForm = {
	start: number | null;
	end: number | null;
	/** Minutes before the start that doors open; "" when not set. */
	doors: string;
	venueMode: VenueMode;
	venueName: string;
	street: string;
	city: string;
	state: string;
	country: string;
	postalCode: string;
	lat: string;
	lng: string;
	title: string;
	description: string;
	categoryId: string;
	tags: string[];
	overview: string;
	/** "none" for all ages, else an age restriction such as "18+". */
	age: string;
	parking: string;
	faqs: EventFaq[];
};

export type DetailsErrors = Partial<Record<"title" | "description" | "venue" | "street" | "city", string>> & {
	faqs?: Record<number, { question?: string; answer?: string }>;
};

export const DOOR_OFFSETS = [0, 15, 30, 45, 60, 90, 120];
export const DESCRIPTION_LIMIT = 150;

function parseFaqs(faq: Event["faq"]): EventFaq[] {
	if (!faq) return [];
	try {
		const parsed = typeof faq === "string" ? JSON.parse(faq) : faq;
		return Array.isArray(parsed)
			? parsed.map((item) => ({ question: String(item?.question ?? ""), answer: String(item?.answer ?? "") }))
			: [];
	} catch {
		return [];
	}
}

function fromEvent(event: Event): DetailsForm {
	const start = parseInstant(event.event_start_time) ?? parseInstant(event.event_start_date);
	const end = parseInstant(event.event_end_time) ?? parseInstant(event.event_end_date);
	const doorsAt = parseInstant(event.doors_open_at);
	const doorsBefore = start !== null && doorsAt !== null ? Math.round((start - doorsAt) / 60000) : null;
	const hasVenue = Boolean(event.venue_name?.trim() || event.address?.trim());
	return {
		start,
		end,
		doors: doorsBefore !== null && doorsBefore >= 0 ? String(doorsBefore) : "",
		venueMode: hasVenue ? "chosen" : "search",
		venueName: event.venue_name ?? "",
		street: event.address ?? "",
		city: event.city ?? "",
		state: event.state ?? "",
		country: event.country ?? "",
		postalCode: event.postal_code ?? "",
		lat: event.latitude ?? "",
		lng: event.longitude ?? "",
		title: event.title ?? "",
		description: event.description ?? "",
		categoryId: event.event_category_id ?? "",
		tags: event.tags?.filter(Boolean) ?? [],
		overview: event.overview ?? "",
		age: event.age_restriction_type === "age-restricted" && event.age_restriction ? event.age_restriction : "none",
		parking: event.parking_type ?? "",
		faqs: parseFaqs(event.faq),
	};
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const VENUE_KEYS = ["venueName", "street", "city", "state", "country", "postalCode", "lat", "lng"] as const;

/** Fields that only make sense saved together: doors is worked out from the start, and the venue goes as one. */
const GROUPS: (keyof DetailsForm)[][] = [["start", "end", "doors"], ["venueMode", ...VENUE_KEYS], ["faqs"]];

/** Which fields can't be saved as they are. The same rules decide the error messages. */
function invalidFields(form: DetailsForm, published: boolean, venueQuery: string): (keyof DetailsForm)[] {
	const invalid: (keyof DetailsForm)[] = [];
	if (!form.title.trim() || form.title.trim().length > 100) invalid.push("title");
	if (form.description.length > DESCRIPTION_LIMIT) invalid.push("description");
	const typedVenue = Boolean(form.venueName.trim() || form.street.trim() || form.city.trim());
	if (
		(form.venueMode === "manual" && typedVenue && (!form.street.trim() || !form.city.trim())) ||
		(form.venueMode === "search" && venueQuery.trim()) ||
		(published && !form.street.trim() && !form.venueName.trim() && form.venueMode !== "manual")
	) {
		invalid.push("venueName");
	}
	if (form.faqs.some((faq) => Boolean(faq.question.trim()) !== Boolean(faq.answer.trim()))) invalid.push("faqs");
	return invalid;
}

export default function useDetailsForm() {
	const { event, published, updateEvent } = useEvent();
	const { account } = useAppSelector("account");
	const { managerProfile } = useAppSelector("manager_profile");
	const queryClient = useQueryClient();
	const eventId = event?.id ?? "";

	// The server's copy in the form's shape; it only changes when the saved event does, not on every refetch.
	const savedKey = `${eventId}:${event?.updated_at ?? ""}`;
	const server = React.useMemo(() => (event ? fromEvent(event) : null), [savedKey]); // eslint-disable-line react-hooks/exhaustive-deps

	// Guests can't see a draft, so it saves itself. A published event's changes go live, so you press Save.
	const mode: SaveMode = published ? "manual" : "auto";

	const [cover, setCover] = React.useState<{ file: File; preview: string } | null>(null);
	const [coverRemoved, setCoverRemoved] = React.useState(false);
	// What's typed in the venue search; a search left unpicked blocks saving.
	const [venueQuery, setVenueQuery] = React.useState("");

	const { data: media = [], refetch: refetchMedia } = useQuery({
		queryKey: ["event-medias-cover", eventId],
		queryFn: () => getMedias({ event_Id: eventId }),
		enabled: Boolean(eventId),
	});
	const covers = media.filter((item) => item.media_type === "cover");
	const coverUrl = cover?.preview ?? (coverRemoved ? undefined : covers[0]?.url);

	const { data: categories = [], isLoading: loadingCategories } = useQuery({
		queryKey: ["event-categories"],
		queryFn: getEventCategories,
	});
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

	// Events take place in the organizer's operating country.
	const profileId = managerProfile?.id ?? "";
	const { data: profile } = useQuery({
		queryKey: profileQueryKey(profileId),
		queryFn: () => getManagerProfile(profileId),
		enabled: Boolean(profileId),
	});
	const { data: countries = [] } = useQuery({ queryKey: ["countries"], queryFn: getCountries });
	const profileCountry = countries.find((country) => country.id === profile?.operating_country_id)?.country_name;
	const countryName = profileCountry || server?.country || countries[0]?.country_name || "";

	const uploadCover = async (file: File) => {
		await addMedia({
			event_Id: eventId,
			file,
			media_type: "cover",
			is_active: true,
			order: 1,
			user_id: account.id,
		});
	};
	const deleteCovers = async () => {
		for (const item of covers) {
			await deleteMedia({ event_Id: eventId, media_id: item.id, user_id: account.id });
		}
	};

	const saving = useSavedForm<DetailsForm>({
		server,
		resetKey: eventId,
		mode,
		backup: eventId ? `event-details:${eventId}` : null,
		ignore: ["venueMode"],
		groups: GROUPS,
		invalid: (values) => invalidFields(values, published, venueQuery),
		// A draft's cover saves through its own queued job (pickCover), so only Save on a published event carries it.
		unsavedFiles: mode === "manual" && Boolean(cover || coverRemoved),
		save: async (next, base) => {
			const payload = buildPayload(next, base);
			if (Object.keys(payload).length) {
				const saved = await updateEventDetails({ event_id: eventId, ...(payload as DeepPartial<Event>) });
				if (saved) await updateEvent("local", saved);
			}
			if (mode === "manual" && (cover || coverRemoved)) {
				if (coverRemoved) await deleteCovers();
				if (cover) await uploadCover(cover.file);
				setCover(null);
				setCoverRemoved(false);
				await refetchMedia();
			}
		},
		onSettled: () => {
			for (const key of [["event-summary", eventId], ["events"], ["home-dashboard"]]) {
				queryClient.invalidateQueries({ queryKey: key });
			}
		},
	});
	const form = saving.values;
	const setForm = saving.setValues;
	const dirty = saving.dirty || Boolean(cover || coverRemoved);

	const set = React.useCallback(
		<K extends keyof DetailsForm>(field: K, value: DetailsForm[K]) => setForm((prev) => ({ ...prev, [field]: value })),
		[setForm]
	);
	const patch = React.useCallback(
		(values: Partial<DetailsForm>) => setForm((prev) => ({ ...prev, ...values })),
		[setForm]
	);

	/** A new start keeps the event's length. */
	const setStart = (start: number) =>
		setForm((prev) => {
			const end = prev.end !== null && prev.start !== null ? start + (prev.end - prev.start) : prev.end;
			return { ...prev, start, end };
		});

	const errors = React.useMemo<DetailsErrors>(() => {
		if (!saving.showErrors || !form) return {};
		const found: DetailsErrors = {};
		if (!form.title.trim()) found.title = "Give your event a name.";
		else if (form.title.trim().length > 100) found.title = "Keep the name under 100 characters.";
		if (form.description.length > DESCRIPTION_LIMIT) found.description = `Keep it to ${DESCRIPTION_LIMIT} characters.`;
		if (form.venueMode === "manual") {
			const started = Boolean(form.venueName.trim() || form.street.trim() || form.city.trim());
			if (started && !form.street.trim()) found.street = "Enter the street address.";
			if (started && !form.city.trim()) found.city = "Enter the city.";
		}
		if (form.venueMode === "search" && venueQuery.trim()) {
			found.venue = "Pick a place from the list, or type the address.";
		} else if (published && !form.street.trim() && !form.venueName.trim() && form.venueMode !== "manual") {
			found.venue = "A published event needs a venue. Pick a place from the list, or type the address.";
		}
		const faqErrors: NonNullable<DetailsErrors["faqs"]> = {};
		form.faqs.forEach((faq, index) => {
			const question = faq.question.trim();
			const answer = faq.answer.trim();
			if (question && !answer) faqErrors[index] = { answer: "Add an answer, or remove this question." };
			if (!question && answer) faqErrors[index] = { question: "Add the question, or remove it." };
		});
		if (Object.keys(faqErrors).length) found.faqs = faqErrors;
		return found;
	}, [saving.showErrors, form, published, venueQuery]);

	const errorCount =
		Object.keys(errors).filter((key) => key !== "faqs").length +
		Object.values(errors.faqs ?? {}).reduce((total, item) => total + Object.keys(item).length, 0);

	// On a draft, a picked cover uploads straight away, queued behind the field saves.
	const pickCover = (file: File) => {
		setCoverRemoved(false);
		const reader = new FileReader();
		reader.onloadend = () => {
			setCover({ file, preview: reader.result as string });
			// Start after the preview is set, so a quick upload can't finish first and leave the preview behind.
			if (mode !== "auto") return;
			saving
				.run(async () => {
					if (covers.length) await deleteCovers();
					await uploadCover(file);
					await refetchMedia();
					setCover(null);
				})
				.catch((error) => {
					setCover(null);
					toast.error(ensureError(error).message || "We couldn’t upload the cover. Try again.");
				});
		};
		reader.readAsDataURL(file);
	};
	const removeCover = () => {
		setCover(null);
		setCoverRemoved(covers.length > 0);
		if (mode !== "auto" || !covers.length) return;
		saving
			.run(async () => {
				await deleteCovers();
				await refetchMedia();
				setCoverRemoved(false);
			})
			.catch((error) => {
				setCoverRemoved(false);
				toast.error(ensureError(error).message || "We couldn’t remove the cover. Try again.");
			});
	};

	/** Only what changed goes to the server. */
	function buildPayload(values: DetailsForm, base: DetailsForm) {
		const payload: Record<string, unknown> = {};
		if (values.start !== base.start && values.start !== null) {
			payload.event_start_date = lagosDateString(values.start);
			payload.event_start_time = lagosInstantString(values.start);
		}
		if (values.end !== base.end && values.end !== null) {
			payload.event_end_date = lagosDateString(values.end);
			payload.event_end_time = lagosInstantString(values.end);
		}
		if (values.doors !== base.doors || (values.start !== base.start && values.doors !== "")) {
			if (values.doors !== "" && values.start !== null) {
				payload.doors_open_at = lagosInstantString(values.start - Number(values.doors) * 60000);
			} else if (base.doors !== "") {
				payload.doors_open_at = null;
			}
		}
		if (VENUE_KEYS.some((key) => values[key] !== base[key]) || values.venueMode !== base.venueMode) {
			const hasVenue = Boolean(values.street.trim() || values.venueName.trim());
			payload.venue_name = values.venueName.trim();
			payload.address = values.street.trim();
			payload.city = values.city.trim();
			payload.state = values.state.trim();
			payload.postal_code = values.postalCode.trim();
			payload.country = hasVenue ? countryName || values.country : values.country;
			payload.latitude = hasVenue ? values.lat : "";
			payload.longitude = hasVenue ? values.lng : "";
		}
		if (values.title !== base.title) payload.title = values.title.trim();
		if (values.description !== base.description) payload.description = values.description.trim();
		if (values.categoryId !== base.categoryId && values.categoryId) payload.event_category_id = values.categoryId;
		if (!same(values.tags, base.tags)) payload.tags = values.tags;
		if (values.overview !== base.overview) payload.overview = values.overview;
		if (values.age !== base.age) {
			payload.age_restriction_type = values.age === "none" ? "no-age-restriction" : "age-restricted";
			payload.age_restriction = values.age === "none" ? "" : (values.age as AgeRestriction);
		}
		if (values.parking !== base.parking && values.parking) payload.parking_type = values.parking as ParkingType;
		const faqs = values.faqs.filter((faq) => faq.question.trim() && faq.answer.trim());
		if (!same(faqs, base.faqs)) {
			payload.faq = JSON.stringify(faqs.map((faq) => ({ question: faq.question.trim(), answer: faq.answer.trim() })));
		}
		return payload;
	}

	/** The form's submit: Save on a published event; on a draft, Enter just saves what's pending now. */
	const save = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (mode === "auto") {
			await saving.flush();
			return;
		}
		try {
			if (await saving.submit()) toast.success("Saved.");
		} catch (error) {
			toast.error(ensureError(error).message || "We couldn't save your changes. Try again.");
		}
	};

	useReportUnsavedChanges({ unsafeToLeave: saving.unsafeToLeave, flush: saving.flush });

	return {
		event,
		published,
		form,
		set,
		patch,
		setStart,
		errors,
		errorCount,
		attempted: saving.showErrors,
		dirty,
		isSaving: saving.isSaving,
		save,
		mode,
		saving,
		coverUrl,
		pickCover,
		removeCover,
		hasCover: Boolean(coverUrl),
		venueQuery,
		setVenueQuery,
		categoryOptions,
		commonCategories,
		loadingCategories,
		countryName,
	};
}

export type DetailsFormApi = ReturnType<typeof useDetailsForm>;
