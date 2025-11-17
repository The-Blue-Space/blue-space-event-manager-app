import { variables } from "@/constants";
import { events } from "@/constants/data/events/events";
import axios from "@/lib/axios";
import { Event } from "@/types/event.types";
import { RefundPolicyType } from "@/types/event.types";

type Parameters = {
	event_id: string;
	is_private: boolean;
	allow_individual_upload: boolean;
	allow_professional_upload: boolean;
	refund_policy_type: RefundPolicyType;
	refund_policy_days?: number | null;
	automate_refunds: boolean;
	published_at?: string | null;
};

type Response = Event;

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.put(`/v1/events/${params.event_id}/publish`, {
		is_private: params.is_private,
		allow_individual_upload: params.allow_individual_upload,
		allow_professional_upload: params.allow_professional_upload,
		refund_policy_type: params.refund_policy_type,
		refund_policy_days: params.refund_policy_days,
		automate_refunds: params.automate_refunds,
		published_at: params.published_at || new Date().toISOString(),
	});
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	return new Promise((resolve) => {
		const event = events.find((e) => e.id === params.event_id);
		if (!event) {
			throw new Error("Event not found");
		}

		const updated: Event = {
			...event,
			is_private: params.is_private,
			allow_individual_upload: params.allow_individual_upload,
			allow_professional_upload: params.allow_professional_upload,
			refund_policy_type: params.refund_policy_type,
			refund_policy_days: params.refund_policy_days ?? null,
			automate_refunds: params.automate_refunds,
			published: true,
			published_at: params.published_at || new Date().toISOString(),
		};

		setTimeout(() => resolve(updated), 900);
	});
}

export default async function publishEvent(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
