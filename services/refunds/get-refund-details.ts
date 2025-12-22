import { variables } from "@/constants";
import axios from "@/lib/axios";
import { Refund } from "@/types/refund.types";

type Parameters = {
	refundId: string;
};

type Response = Refund;

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.get(`/v1/refunds/${params.refundId}`);
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				id: params.refundId,
				refund_type: "ticket",
				ticket_payment_id: "pay-001",
				event_id: "evt-001",
				user_id: "usr-001",
				requested_by_id: "usr-001",
				original_amount: 5000000,
				refund_amount: 5000000,
				refund_fee: 0,
				net_refund_amount: 5000000,
				refund_policy_type: "full-refund",
				status: "pending",
				reason: "user_requested",
				notes: "Customer requested refund due to schedule conflict",
				requested_at: new Date().toISOString(),
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				user: {
					id: "usr-001",
					name: "John Doe",
					email: "john@example.com",
					phone: "+234 800 000 0000",
					avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
					is_verified: true,
					is_admin: false,
					account_status: "active",
					status_changed_at: new Date().toISOString(),
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				},
				requested_by: {
					id: "usr-001",
					name: "John Doe",
					email: "john@example.com",
					is_verified: true,
					is_admin: false,
					account_status: "active",
					status_changed_at: new Date().toISOString(),
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				},
				event: {
					id: "evt-001",
					title: "Summer Music Festival",
					event_start_date: new Date(Date.now() + 604800000).toISOString(),
				},
				ticket_payment: {
					id: "pay-001",
					payment_reference: "PAY_abc123xyz",
				},
			});
		}, 500);
	});
}

export default async function getRefundDetails(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
