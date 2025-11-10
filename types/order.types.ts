import { User } from "./user.types";

export const PAYMENT_STATUS = ["pending", "paid", "failed", "refunded", "cancelled"] as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[number];

export type Order = {
	id: string;
	user_ticket_id: string;
	amount: number;
	discount_amount: number | null;
	free_ticket_quantity: number | null;
	quantity: number;
	payment_method?: string | null;
	payment_status: PaymentStatus;
	payment_reference?: string | null;
	event_name?: string;
	paid_at?: string | null;
	refunded_at?: string | null;
	created_at: string;
	updated_at: string;
	user: User;
	event_id: string;
};
