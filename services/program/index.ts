import axios from "@/lib/axios";

// The organizer's Agenda tab: GET /v1/events/:id/program and the session and lineup endpoints.

export type LineupPerson = {
	id: string;
	artist_name: string;
	artist_image_url: string | null;
	notes: string | null;
	/** "HH:MM", Lagos time */
	start_time: string | null;
	end_time: string | null;
	is_headliner: boolean;
	socials: string[] | null;
	order: number;
};

export type SessionHost = { lineup_id: string | null; name: string; image_url: string | null };

export type Session = {
	id: string;
	title: string;
	description: string | null;
	starts_at: string | null;
	ends_at: string | null;
	hosts: SessionHost[];
	outside_event?: boolean;
};

export type Program = { starts_at: string | null; ends_at: string | null; sessions: Session[]; lineup: LineupPerson[] };

export type SessionInput = { title: string; description: string; starts_at: string; ends_at: string; lineup_ids: string[] };

export type PersonInput = {
	name: string;
	about: string;
	start_time: string;
	end_time: string;
	links: string[];
	headliner: boolean;
	photo: File | null;
};

export async function getProgram(eventId: string): Promise<Program> {
	const response = await axios.get<{ data: Program }>(`/v1/events/${eventId}/program`);
	return response.data.data;
}

export async function saveSession(eventId: string, sessionId: string | null, input: SessionInput): Promise<Session> {
	const body = { ...input, description: input.description.trim() || null };
	const response = sessionId
		? await axios.put<{ data: Session }>(`/v1/events/${eventId}/sessions/${sessionId}`, body)
		: await axios.post<{ data: Session }>(`/v1/events/${eventId}/sessions`, body);
	return response.data.data;
}

export const deleteSession = (eventId: string, sessionId: string) => axios.delete(`/v1/events/${eventId}/sessions/${sessionId}`);

function personForm(input: PersonInput) {
	const form = new FormData();
	form.append("artist_name", input.name.trim());
	form.append("notes", input.about.trim());
	form.append("start_time", input.start_time);
	form.append("end_time", input.end_time);
	form.append("is_headliner", String(input.headliner));
	// Sent as JSON so an empty list clears every link.
	form.append("socials", JSON.stringify(input.links.map((link) => link.trim()).filter(Boolean)));
	if (input.photo) form.append("artist_image", input.photo);
	return form;
}

export async function savePerson(eventId: string, personId: string | null, input: PersonInput): Promise<LineupPerson> {
	const config = { headers: { "Content-Type": "multipart/form-data" }, timeout: 60000 };
	const response = personId
		? await axios.put<LineupPerson>(`/v1/lineup/${personId}`, personForm(input), config)
		: await axios.post<LineupPerson>(`/v1/events/${eventId}/lineup`, personForm(input), config);
	return response.data;
}

export const removePerson = (personId: string) => axios.delete(`/v1/lineup/${personId}`);

export async function reorderLineup(eventId: string, ids: string[]): Promise<LineupPerson[]> {
	const response = await axios.post<{ data: LineupPerson[] }>(`/v1/events/${eventId}/lineup/reorder`, { ids });
	return response.data.data;
}
