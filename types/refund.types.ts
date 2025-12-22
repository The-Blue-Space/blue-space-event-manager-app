import { User } from "./user.types";
import { RefundPolicyType } from "./event.types";

export const REFUND_STATUS = [
	"pending",
	"approved",
	"processing",
	"completed",
	"failed",
	"rejected",
] as const;

export type RefundStatus = (typeof REFUND_STATUS)[number];

export const REFUND_TYPE = ["ticket", "vendor"] as const;

export type RefundType = (typeof REFUND_TYPE)[number];

export const REFUND_REASON = [
	"event_cancelled",
	"user_requested",
	"duplicate_payment",
	"vendor_rejected",
	"event_postponed",
	"other",
] as const;

export type RefundReason = (typeof REFUND_REASON)[number];

export type Refund = {
	id: string;
	refund_type: RefundType;
	ticket_payment_id?: string | null;
	vendor_payment_id?: string | null;
	event_id: string;
	user_id: string;
	requested_by_id: string;

	// Amount details (in kobo/cents)
	original_amount: number;
	refund_amount: number;
	refund_fee: number;
	net_refund_amount: number;

	// Policy applied
	refund_policy_type?: RefundPolicyType | null;
	refund_policy_percentage?: number | null;

	status: RefundStatus;
	reason: RefundReason;
	notes?: string | null;

	// Rejection details
	rejected_by_id?: string | null;
	rejection_note?: string | null;

	// Paystack integration
	paystack_refund_ref?: string | null;
	paystack_status?: string | null;

	// Timestamps
	requested_at: string;
	approved_at?: string | null;
	approved_by_id?: string | null;
	processed_at?: string | null;
	completed_at?: string | null;
	rejected_at?: string | null;
	created_at: string;
	updated_at: string;

	// Relationships
	user?: User;
	requested_by?: User;
	approved_by?: User;
	rejected_by?: User;
	event?: {
		id: string;
		title: string;
		event_start_date?: string | null;
	};
	ticket_payment?: {
		id: string;
		payment_reference?: string | null;
	};
	vendor_payment?: {
		id: string;
		paystack_reference?: string;
	};
};

export type RefundStats = {
	total_refunds: number;
	pending_refunds: number;
	completed_refunds: number;
	rejected_refunds: number;
	total_refunded_amount: number;
	pending_refund_amount: number;
};
