import { RefundPolicyType } from "./event.types";
import { Country } from "./global.types";
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
	phone: string | null;
	email: string | null;
	operating_country_id: string;
	operating_country: Country;
	user_id: string;
	user: User;
	// event settings
	refund_policy_type?: RefundPolicyType;
	refund_policy_days?: number | null;
	automate_refunds: boolean;
	enable_downloads: boolean;
	allow_individual_upload: boolean;
	allow_professional_upload: boolean;

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
