import { variables } from "@/constants";
import axios from "@/lib/axios";
import buildQueryString from "@/lib/build-query-string";
import { PaginatedResponse } from "@/types/global.types";
import { Refund, RefundStatus, RefundType } from "@/types/refund.types";

type Parameters = {
	page: number;
	limit?: number;
	event_id?: string;
	status?: RefundStatus;
	type?: RefundType;
	search?: string;
};

type Response = PaginatedResponse<Refund>;

export async function production(params: Parameters): Promise<Response> {
	const query_string = buildQueryString(params);
	const response = await axios.get(`/v1/refunds?${query_string}`);
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	// Mock data for development
	const mockRefunds: Refund[] = [
		{
			id: "ref-001",
			refund_type: "ticket",
			ticket_payment_id: "pay-001",
			event_id: "evt-001",
			user_id: "usr-001",
			requested_by_id: "usr-001",
			original_amount: 5000000,
			refund_amount: 5000000,
			refund_fee: 0,
			net_refund_amount: 5000000,
			status: "pending",
			reason: "user_requested",
			requested_at: new Date().toISOString(),
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			user: {
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
				event_start_date: new Date().toISOString(),
			},
		},
		{
			id: "ref-002",
			refund_type: "ticket",
			ticket_payment_id: "pay-002",
			event_id: "evt-001",
			user_id: "usr-002",
			requested_by_id: "usr-002",
			original_amount: 3500000,
			refund_amount: 1750000,
			refund_fee: 0,
			net_refund_amount: 1750000,
			refund_policy_type: "partial-refund",
			refund_policy_percentage: 50,
			status: "completed",
			reason: "event_cancelled",
			requested_at: new Date(Date.now() - 86400000).toISOString(),
			approved_at: new Date(Date.now() - 43200000).toISOString(),
			completed_at: new Date().toISOString(),
			created_at: new Date(Date.now() - 86400000).toISOString(),
			updated_at: new Date().toISOString(),
			user: {
				id: "usr-002",
				name: "Jane Smith",
				email: "jane@example.com",
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
				event_start_date: new Date().toISOString(),
			},
		},
		{
			id: "ref-003",
			refund_type: "vendor",
			vendor_payment_id: "vpay-001",
			event_id: "evt-002",
			user_id: "usr-003",
			requested_by_id: "usr-003",
			original_amount: 15000000,
			refund_amount: 15000000,
			refund_fee: 0,
			net_refund_amount: 15000000,
			status: "rejected",
			reason: "vendor_rejected",
			rejection_note: "Vendor application was already processed",
			requested_at: new Date(Date.now() - 172800000).toISOString(),
			rejected_at: new Date(Date.now() - 86400000).toISOString(),
			created_at: new Date(Date.now() - 172800000).toISOString(),
			updated_at: new Date(Date.now() - 86400000).toISOString(),
			user: {
				id: "usr-003",
				name: "Bob Wilson",
				email: "bob@example.com",
				is_verified: true,
				is_admin: false,
				account_status: "active",
				status_changed_at: new Date().toISOString(),
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			},
			event: {
				id: "evt-002",
				title: "Tech Conference 2024",
				event_start_date: new Date().toISOString(),
			},
		},
	];

	return new Promise((resolve) => {
		setTimeout(() => {
			let filtered = [...mockRefunds];

			if (params.status) {
				filtered = filtered.filter((r) => r.status === params.status);
			}
			if (params.type) {
				filtered = filtered.filter((r) => r.refund_type === params.type);
			}
			if (params.search) {
				const search = params.search.toLowerCase();
				filtered = filtered.filter(
					(r) =>
						r.user?.name?.toLowerCase().includes(search) ||
						r.user?.email?.toLowerCase().includes(search) ||
						r.event?.title?.toLowerCase().includes(search)
				);
			}

			resolve({
				docs: filtered,
				totalDocs: filtered.length,
				limit: params.limit || 10,
				page: params.page || 1,
				totalPages: 1,
				hasNextPage: false,
				nextPage: null,
				hasPrevPage: false,
				prevPage: null,
				pagingCounter: 1,
			});
		}, 800);
	});
}

export default async function getRefunds(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
