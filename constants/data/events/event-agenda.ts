import { EventAgenda } from "@/types/event-agenda.types";

export const eventAgendas: EventAgenda[] = [
	// Summer Music Festival Agenda
	{
		id: "agenda_001",
		event_id: "evt_001",
		title: "Registration & Check-in",
		description:
			"Welcome all attendees, distribute badges and event materials. Information desk available for any questions.",
		start_time: "09:00 AM",
		end_time: "09:30 AM",
		hosts: [
			{
				id: "host_001",
				event_id: "evt_001",
				host_name: "John Doe",
				host_image_url: "https://i.pravatar.cc/150?img=7",
				created_at: "2024-11-01T10:00:00.000Z",
				updated_at: "2024-11-01T10:00:00.000Z",
			},
			{
				id: "host_002",
				event_id: "evt_001",
				host_name: "Jane Smith",
				host_image_url: "https://i.pravatar.cc/150?img=9",
				created_at: "2024-11-01T10:00:00.000Z",
				updated_at: "2024-11-01T10:00:00.000Z",
			},
		],
		created_at: "2024-11-01T10:00:00.000Z",
		updated_at: "2024-11-01T10:00:00.000Z",
	},
	{
		id: "agenda_002",
		event_id: "evt_001",
		title: "Opening Keynote Speech",
		description:
			"CEO welcomes everyone and shares the vision for this year's event. Overview of what to expect throughout the day.",
		start_time: "09:30 AM",
		end_time: "10:30 AM",
		hosts: [
			{
				id: "host_003",
				event_id: "evt_001",
				host_name: "Sarah Johnson",
				host_image_url: "https://i.pravatar.cc/150?img=8",
				created_at: "2024-11-01T10:00:00.000Z",
				updated_at: "2024-11-01T10:00:00.000Z",
			},
		],
		created_at: "2024-11-01T10:00:00.000Z",
		updated_at: "2024-11-01T10:00:00.000Z",
	},
	{
		id: "agenda_003",
		event_id: "evt_001",
		title: "Coffee Break & Networking",
		description:
			"Take a break, enjoy refreshments, and network with other attendees. Food trucks available in the main courtyard.",
		start_time: "10:30 AM",
		end_time: "11:00 AM",
		hosts: [],
		created_at: "2024-11-01T10:00:00.000Z",
		updated_at: "2024-11-01T10:00:00.000Z",
	},
	{
		id: "agenda_004",
		event_id: "evt_001",
		title: "Panel Discussion: Future of Technology",
		description:
			"Industry leaders discuss emerging trends and what the future holds. Moderated Q&A session with audience participation.",
		start_time: "11:00 AM",
		end_time: "12:30 PM",
		hosts: [
			{
				id: "host_004",
				event_id: "evt_001",
				host_name: "Michael Chen",
				host_image_url: "https://i.pravatar.cc/150?img=10",
				created_at: "2024-11-01T10:00:00.000Z",
				updated_at: "2024-11-01T10:00:00.000Z",
			},
			{
				id: "host_005",
				event_id: "evt_001",
				host_name: "Emily Davis",
				host_image_url: "https://i.pravatar.cc/150?img=11",
				created_at: "2024-11-01T10:00:00.000Z",
				updated_at: "2024-11-01T10:00:00.000Z",
			},
		],
		created_at: "2024-11-01T10:00:00.000Z",
		updated_at: "2024-11-01T10:00:00.000Z",
	},
	{
		id: "agenda_005",
		event_id: "evt_001",
		title: "Lunch Break",
		description:
			"Enjoy a variety of food options from our partner vendors. Vegetarian and vegan options available.",
		start_time: "12:30 PM",
		end_time: "01:30 PM",
		hosts: [],
		created_at: "2024-11-01T10:00:00.000Z",
		updated_at: "2024-11-01T10:00:00.000Z",
	},
	{
		id: "agenda_006",
		event_id: "evt_001",
		title: "Closing Remarks",
		description:
			"Thank you for attending! Final announcements and next steps for continued engagement.",
		start_time: "01:30 PM",
		end_time: "02:00 PM",
		hosts: [
			{
				id: "host_006",
				event_id: "evt_001",
				host_name: "Robert Martinez",
				host_image_url: "https://i.pravatar.cc/150?img=12",
				created_at: "2024-11-01T10:00:00.000Z",
				updated_at: "2024-11-01T10:00:00.000Z",
			},
		],
		created_at: "2024-11-01T10:00:00.000Z",
		updated_at: "2024-11-01T10:00:00.000Z",
	},

	// Tech Conference Agenda (Event 2)
	{
		id: "agenda_007",
		event_id: "evt_002",
		title: "Welcome & Registration",
		description:
			"Check-in, collect badges, and get oriented with the conference layout and schedule.",
		start_time: "08:00 AM",
		end_time: "08:30 AM",
		hosts: [
			{
				id: "host_007",
				event_id: "evt_002",
				host_name: "Alex Thompson",
				host_image_url: "https://i.pravatar.cc/150?img=13",
				created_at: "2024-11-01T10:00:00.000Z",
				updated_at: "2024-11-01T10:00:00.000Z",
			},
		],
		created_at: "2024-11-01T10:00:00.000Z",
		updated_at: "2024-11-01T10:00:00.000Z",
	},
	{
		id: "agenda_008",
		event_id: "evt_002",
		title: "Keynote: AI Revolution",
		description:
			"Exploring the latest developments in artificial intelligence and machine learning technologies.",
		start_time: "08:30 AM",
		end_time: "09:30 AM",
		hosts: [
			{
				id: "host_008",
				event_id: "evt_002",
				host_name: "Dr. Lisa Wang",
				host_image_url: "https://i.pravatar.cc/150?img=14",
				created_at: "2024-11-01T10:00:00.000Z",
				updated_at: "2024-11-01T10:00:00.000Z",
			},
		],
		created_at: "2024-11-01T10:00:00.000Z",
		updated_at: "2024-11-01T10:00:00.000Z",
	},
	{
		id: "agenda_009",
		event_id: "evt_002",
		title: "Break & Networking",
		description: "Coffee, light refreshments, and networking opportunities with fellow attendees.",
		start_time: "09:30 AM",
		end_time: "10:00 AM",
		hosts: [],
		created_at: "2024-11-01T10:00:00.000Z",
		updated_at: "2024-11-01T10:00:00.000Z",
	},
	{
		id: "agenda_010",
		event_id: "evt_002",
		title: "Workshop: Cloud Computing",
		description:
			"Hands-on workshop covering cloud infrastructure, deployment strategies, and best practices.",
		start_time: "10:00 AM",
		end_time: "11:30 AM",
		hosts: [
			{
				id: "host_009",
				event_id: "evt_002",
				host_name: "Mark Rodriguez",
				host_image_url: "https://i.pravatar.cc/150?img=15",
				created_at: "2024-11-01T10:00:00.000Z",
				updated_at: "2024-11-01T10:00:00.000Z",
			},
			{
				id: "host_010",
				event_id: "evt_002",
				host_name: "Jennifer Lee",
				host_image_url: "https://i.pravatar.cc/150?img=16",
				created_at: "2024-11-01T10:00:00.000Z",
				updated_at: "2024-11-01T10:00:00.000Z",
			},
		],
		created_at: "2024-11-01T10:00:00.000Z",
		updated_at: "2024-11-01T10:00:00.000Z",
	},
];
