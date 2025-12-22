import { variables } from "@/constants";
import axios from "@/lib/axios";
import { Refund } from "@/types/refund.types";

type Parameters = {
	refundId: string;
};

type Response = Refund;

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.patch(`/v1/refunds/${params.refundId}/approve`);
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
				status: "approved",
				reason: "user_requested",
				requested_at: new Date(Date.now() - 86400000).toISOString(),
				approved_at: new Date().toISOString(),
				created_at: new Date(Date.now() - 86400000).toISOString(),
				updated_at: new Date().toISOString(),
			});
		}, 800);
	});
}

export default async function approveRefund(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
