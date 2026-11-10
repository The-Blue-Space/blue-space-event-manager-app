import { variables } from "@/constants";
import axios from "@/lib/axios";
import { HomeDashboard } from "@/types/home.types";

export async function production(): Promise<HomeDashboard> {
	const response = await axios.get<{ data: HomeDashboard }>("/v1/dashboard/home");
	return response.data.data;
}

const at = (days: number, hour = 12) => {
	const date = new Date();
	date.setDate(date.getDate() + days);
	date.setHours(hour, 0, 0, 0);
	return date.toISOString();
};

const DAILY = [4, 6, 3, 8, 12, 9, 7, 5, 10, 14, 11, 9, 6, 8, 13, 18, 15, 12, 9, 7, 10, 16, 26, 17, 12, 8, 6, 11, 9, 11];

// Mirrors the "selling" board in the design file so local development looks like the design.
export async function development(): Promise<HomeDashboard> {
	const mock: HomeDashboard = {
		has_events: true,
		spotlight: {
			status: "upcoming",
			event: {
				id: "evt-candlelight",
				title: "Candlelight Supper Club",
				venue_name: "The Glasshouse",
				address: "Ikoyi",
				city: "Lagos",
				starts_at: at(12, 19),
				ends_at: at(12, 23),
				doors_open_at: at(12, 19),
				cover_url: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=1200&h=400&fit=crop&q=70",
				published: true,
				capacity: 300,
			},
			tickets_sold: 214,
			revenue_kobo: 398_800_000,
			tiers: [
				{ id: "t1", name: "Early bird", price_kobo: 1_200_000, sold: 100, total: 100 },
				{ id: "t2", name: "Regular", price_kobo: 1_800_000, sold: 98, total: 150 },
				{ id: "t3", name: "Table for four", price_kobo: 6_400_000, sold: 16, total: 50 },
			],
			checked_in: 0,
			photos: { count: 0, recent: [] },
		},
		coming_up: [
			{
				id: "evt-vinyl",
				title: "Vinyl Night: Afrobeats Listening Party",
				starts_at: at(25, 20),
				cover_url: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=240&h=240&fit=crop&q=70",
				published: true,
				tickets_sold: 61,
				capacity: 120,
			},
			{
				id: "evt-rooftop",
				title: "Rooftop Sessions Vol. 4",
				starts_at: at(40, 18),
				cover_url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=240&h=240&fit=crop&q=70",
				published: false,
				tickets_sold: 0,
				capacity: 250,
			},
		],
		last_30_days: {
			tickets_sold: { current: 312, previous: 264, change_pct: 18.2 },
			revenue_kobo: { current: 527_300_000, previous: 470_800_000, change_pct: 12 },
			attendees: { current: 291, previous: 267, change_pct: 9 },
		},
		daily_tickets: DAILY.map((value, index) => ({ date: at(index - 29).slice(0, 10), value })),
		attention: {
			pending_refunds: 2,
			drafts: [{ id: "evt-rooftop", title: "Rooftop Sessions Vol. 4", starts_at: at(40, 18) }],
			has_bank_account: true,
		},
		withdrawable_kobo: 35_150_000,
		recent_orders: [
			{ id: "o1", reference: "BS-1042", buyer_name: "Temi Adeyemi", buyer_username: "temi.a", buyer_avatar: null, event_title: "Candlelight Supper Club", quantity: 2, amount_kobo: 3_600_000, status: "paid", paid_at: at(0, 9), refunded_at: null, created_at: at(0, 9) },
			{ id: "o2", reference: "BS-1041", buyer_name: "Chidi Okafor", buyer_username: "chidi.o", buyer_avatar: null, event_title: "Vinyl Night: Afrobeats Listening Party", quantity: 1, amount_kobo: 1_500_000, status: "paid", paid_at: at(0, 8), refunded_at: null, created_at: at(0, 8) },
			{ id: "o3", reference: "BS-1040", buyer_name: "Kunle Adebayo", buyer_username: "kunle.a", buyer_avatar: null, event_title: "Vinyl Night: Afrobeats Listening Party", quantity: 2, amount_kobo: 3_000_000, status: "pending", paid_at: null, refunded_at: null, created_at: at(0, 7) },
			{ id: "o4", reference: "BS-1039", buyer_name: "Seun Bello", buyer_username: "seunb", buyer_avatar: null, event_title: "Candlelight Supper Club", quantity: 2, amount_kobo: 3_600_000, status: "refunded", paid_at: at(-3, 15), refunded_at: at(-1, 11), created_at: at(-3, 15) },
			{ id: "o5", reference: "BS-1038", buyer_name: "Halima Yusuf", buyer_username: "halima.y", buyer_avatar: null, event_title: "Vinyl Night: Afrobeats Listening Party", quantity: 3, amount_kobo: 4_500_000, status: "paid", paid_at: at(-2, 18), refunded_at: null, created_at: at(-2, 18) },
		],
	};
	return new Promise((resolve) => setTimeout(() => resolve(mock), 600));
}

export default async function getHomeDashboard(): Promise<HomeDashboard> {
	if (variables.SERVICE_ENV === "development") return development();
	return production();
}
