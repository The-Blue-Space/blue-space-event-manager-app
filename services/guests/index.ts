import axios from "@/lib/axios";
import buildQueryString from "@/lib/build-query-string";
import { GuestFilter, GuestsPage, Invitee } from "@/types/guests.types";

export type GuestsParams = { eventId: string; filter: GuestFilter; search?: string; page?: number; limit?: number };

/** The event's guests for the organizer: counts, who's waiting, and one page of a filter. */
export async function getGuests({ eventId, ...params }: GuestsParams): Promise<GuestsPage> {
	const query = buildQueryString({ ...params, search: params.search?.trim() || undefined });
	const response = await axios.get<{ data: GuestsPage }>(`/v1/events/${eventId}/guests?${query}`);
	return response.data.data;
}

/** Finds one person by their exact email, or username with or without the @. Resolves null when nobody has it. */
export async function findPerson(value: string): Promise<Invitee | null> {
	const trimmed = value.trim();
	const query = trimmed.includes("@") && !trimmed.startsWith("@") ? { email: trimmed.toLowerCase() } : { username: trimmed.replace(/^@/, "").toLowerCase() };
	try {
		const response = await axios.get<Invitee>(`/v1/users?${buildQueryString(query)}`);
		return response.data;
	} catch (error) {
		if ((error as { response?: { status?: number } }).response?.status === 404) return null;
		throw error;
	}
}

type InviteResult = { user_id: string; email: string; error?: string; participant_id?: string; status?: string };

export async function invitePeople(eventId: string, userIds: string[]): Promise<InviteResult[]> {
	const response = await axios.post<{ results: InviteResult[] }>("/v1/participants/invite", {
		event_id: eventId,
		users: userIds.map((id) => ({ id })),
	});
	return response.data.results ?? [];
}

export const approveGuest = (participantId: string) => axios.patch(`/v1/participants/${participantId}/approve`);
export const declineGuest = (participantId: string) => axios.patch(`/v1/participants/${participantId}/reject`);
export const withdrawInvite = (participantId: string) => axios.patch(`/v1/participants/${participantId}/retract`);
export const inviteAgain = (participantId: string) => axios.post(`/v1/participants/${participantId}/reinvite`);
export const blockGuest = (participantId: string) => axios.patch(`/v1/participants/${participantId}/block`);
export const unblockGuest = (participantId: string) => axios.patch(`/v1/participants/${participantId}/unblock`);
export const resetEventCode = (eventId: string) => axios.post(`/v1/events/${eventId}/reset-access-code`, {});
