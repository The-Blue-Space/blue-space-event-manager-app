import { Order } from "./order.types";

export const ACCOUNT_STATUS = [
	"pending_verification",
	"active",
	"deactivated",
	"deleted",
	"suspended",
] as const;
export type AccountStatus = (typeof ACCOUNT_STATUS)[number];

export type User = {
	id: string;
	username?: string;
	name: string;
	email: string;
	phone?: string;
	avatar_url?: string;
	is_verified: boolean;
	is_admin: boolean;
	account_status: AccountStatus;
	status_changed_at: string;
	deleted_at?: string | null;
	created_at: string;
	updated_at: string;
};

export type ManagerProfile = {
	id: string;
	name: string;
	logo: string | null;
	display_image: string | null;
	bio: string | null;
	user_id: string;
	user: User;
	created_at: string;
	updated_at: string;
};

export type UserDashboardData = {
	overview: {
		total_events: {
			total_events: number;
			upcoming_events: number;
		};
		total_attendees: {
			total_attendees: number;
			attendees_this_month: number;
		};
		ticket_sales: {
			ticket_sales: number;
			ticket_sales_this_month: number;
		};
		revenue: {
			total_revenue: number;
			revenue_this_month: number;
		};
	};
	recent_orders: Order[];
};
