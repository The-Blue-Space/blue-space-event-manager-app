import { FinanceDashboard } from "@/types/finance.types";
import { bankDetails } from "./bank-details";

export const financeDashboard: FinanceDashboard = {
	total_inflow: 125000,
	withdrawable_inflow: 20000,
	total_outflow: 45000,
	pending_payouts: 3,
	pending_payout_amount: 20000,
	bank_details: bankDetails,
};

