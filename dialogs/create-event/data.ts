import { FORM_FIELDS } from "@/components/app/form-input/form.types";
import { ACCESS_TYPES } from "@/types/event.types";

export const formFields: FORM_FIELDS[] = [
	{
		name: "title",
		type: "text",
		label: "Event Title",
		placeholder: "e.g., Summer Music Festival 2025",
		required: true,
	},
	{
		name: "description",
		type: "textarea",
		label: "Event Description",
		placeholder: "Brief description of your event (5-150 characters)",
		required: true,
		note: "This is a short description that appears in listings. You'll add full details later.",
	},
	{
		name: "event_category_id",
		type: "select",
		label: "Category",
		placeholder: "Select Category",
		required: true,
		options: [],
	},
	{
		name: "location_id",
		type: "select",
		label: "Location",
		placeholder: "Select Location",
		required: true,
		options: [],
	},
	{
		name: "tags",
		type: "text",
		label: "Tags",
		placeholder: "e.g., music, festival, outdoor",
		note: "Separate multiple tags with commas",
		required: true,
	},
	{
		name: "access_type",
		type: "select",
		label: "Access Type",
		placeholder: "Select Access Type",
		required: true,
		options: ACCESS_TYPES.map((type) => ({
			title: type,
			value: type,
		})),
	},
	{
		name: "is_private",
		type: "switch",
		label: "Event Visibility",
		placeholder: "",
		note: "When enabled, this event will be private and hidden from public listings. Only people with invites can see and access it.",
		required: true,
	},
];

// Access type descriptions for hover cards
export const ACCESS_TYPE_INFO = {
	individual: {
		title: "Individual Access",
		description:
			"The event is open to all but with an access code. The event will come with an access code and anyone who wishes to attend would be sent the access code. A participant can either be sent an invite or request an invite.",
		icon: "👤",
	},
	general: {
		title: "General Access  (Default)",
		description:
			"The event is open to all but with an access code. The event will come with an access code and anyone who wishes to attend would be sent the access code.",
		icon: "👥",
	},
	"ticket-based": {
		title: "Ticket-Based Access",
		description:
			"This event type is some what like Individual only that this event type is tied to a ticket. For a participant to attend, they must buy a ticket, the ticket would be sent to them and that would be their access to the event.",
		icon: "🎟️",
	},
	none: {
		title: "Public Access",
		description:
			"These events are open to everyone and can be accessed by anyone. No access code or ticket required.",
		icon: "🌐",
	},
};
