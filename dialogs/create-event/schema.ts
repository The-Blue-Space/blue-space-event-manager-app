import { ACCESS_TYPES } from "@/types/event.types";
import { z } from "zod";

export const newEventSchema = z.object({
	title: z.string().trim().min(3, "Event title is required"),
	description: z
		.string()
		.trim()
		.min(5, "Event description is required, at least 5 characters")
		.max(150, "Event description must be less than 150 characters"),
	location_id: z.string().trim().min(1, "Location is required"),
	access_type: z.enum(ACCESS_TYPES, { message: "Access type is required" }),
	event_category_id: z.string().trim().min(1, "Event category is required"),
	tags: z.string().trim().min(1, "At least one tag is required"),
	is_private: z.boolean().default(false),
});

export type NewEventFormData = z.infer<typeof newEventSchema>;

export const newEventInitial: NewEventFormData = {
	title: "",
	description: "",
	location_id: "",
	access_type: "general",
	event_category_id: "",
	tags: "",
	is_private: false,
};
