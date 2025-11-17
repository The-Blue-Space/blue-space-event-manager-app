import { variables } from "@/constants";
import { userTickets } from "@/constants/data/user-ticket";
import axios from "@/lib/axios";
import { UserTicket } from "@/types/user-ticket.types";

type Parameters = {
	id: string;
};

type Response = UserTicket;

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.get(`/v1/user-tickets/${params.id}`);
	return response.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve(userTickets[0]), 1500);
	});
}

export default async function getUserTicketsDetails(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();

	return production(params);
}
