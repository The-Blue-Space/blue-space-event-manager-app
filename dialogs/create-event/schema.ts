import { z } from "zod";
import { ACCESS_TYPES } from "@/types/event.types";

export const DESCRIPTION_MAX_LENGTH = 150;

/** Shown as quick picks above the category search. Matched by name against the categories the server returns. */
export const COMMON_CATEGORIES = [
	"Music & Concerts",
	"Nightlife & Parties",
	"Food & Drink",
	"Arts & Culture",
	"Business & Professional",
	"Community & Social",
];

// Messages are listed in the order they should win: the form shows the first problem per field.
export const newEventSchema = z.object({
	title: z.string().trim().min(1, "Enter the event name.").min(3, "Use at least 3 characters."),
	description: z
		.string()
		.trim()
		.min(1, "Add a short description.")
		.min(5, "Use at least 5 characters.")
		.max(DESCRIPTION_MAX_LENGTH, `Keep it to ${DESCRIPTION_MAX_LENGTH} characters or fewer.`),
	event_category_id: z.string().min(1, "Choose a category."),
	access_type: z.enum(ACCESS_TYPES),
	is_private: z.boolean(),
});

export type NewEventForm = z.infer<typeof newEventSchema>;

export const newEventInitial: NewEventForm = {
	title: "",
	description: "",
	event_category_id: "",
	access_type: "ticket-based",
	is_private: false,
};

export const ACCESS_CHOICES: { value: NewEventForm["access_type"]; title: string; detail: string }[] = [
	{ value: "ticket-based", title: "Sell tickets", detail: "Guests buy a ticket. You set the ticket types and prices." },
	{
		value: "general",
		title: "One code for everyone",
		detail: "Guests join with a shared code or QR. Public events let them straight in.",
	},
	{
		value: "individual",
		title: "Invite each guest",
		detail: "Every guest gets their own code, and you approve who joins.",
	},
	{ value: "none", title: "Open to everyone", detail: "No tickets or codes. Anyone can join." },
];

export const VISIBILITY_CHOICES: { value: boolean; title: string; detail: string }[] = [
	{ value: false, title: "Public", detail: "Listed on Blue Space for anyone to find." },
	{ value: true, title: "Private", detail: "Only people you share it with can see it." },
];
