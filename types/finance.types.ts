export const PAYOUT_STATUS = ["pending", "requested", "paid", "rejected"] as const;
export type PayoutRequestStatus = (typeof PAYOUT_STATUS)[number];

export type BankDetails = {
	id: string;
	event_manager_id: string;
	bank_name: string;
	bank_code?: string;
	account_number: string;
	account_name: string;
	is_default: boolean;
	created_at: string;
	updated_at: string;
};

export type FinanceDashboard = {
	total_inflow: number;
	withdrawable_inflow: number;
	total_outflow: number;
	pending_payouts: number;
	pending_payout_amount: number;
	bank_details: BankDetails[];
};

export type Payout = {
	id: string;
	event_id: string;
	event_name: string;
	event_manager_id: string;
	event_manager_name: string;
	bank_id: string;
	bank_name: string;
	amount: number;
	currency_id: string;
	currency_name: string;
	currency_symbol: string;
	currency_code: string;
	status: PayoutRequestStatus;
	requested_at: string | null;
	paid_at: string | null;
	total_revenue: number;
	collection_fee: number;
	payout_amount: number;
	payment_reference: string | null;
	created_at: string;
	updated_at: string;
};
