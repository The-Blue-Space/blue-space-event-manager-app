"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEvent } from "../../../context";
import AgendaList from "./agenda-list";
import getAgendas from "@/services/events/event-agenda/get-agendas";
import addAgenda from "@/services/events/event-agenda/add-agenda";
import updateAgenda from "@/services/events/event-agenda/update-agenda";
import deleteAgenda from "@/services/events/event-agenda/delete-agenda";
import ensureError from "@/lib/ensure-error";
import invalidateQuery from "@/lib/invalidate-query";

export default function Agenda() {
	const { event } = useEvent();

	// Fetch agendas
	const { data: agendas = [], isFetching } = useQuery({
		queryKey: ["event-agendas", event?.id],
		queryFn: () => getAgendas({ event_Id: event!.id }),
		enabled: !!event?.id,
	});

	// Invalidate queries helper
	const invalidateAgendaQueries = () => {
		invalidateQuery(["event-agendas"]);
	};

	// Add agenda handler
	const handleAddAgenda = async (data: {
		title: string;
		description?: string;
		start_time: string;
		end_time: string;
		hosts: Array<{ name: string; image?: File }>;
	}) => {
		if (!event?.id) {
			toast.error("Event ID is required");
			return;
		}

		try {
			await addAgenda({
				event_Id: event.id,
				title: data.title,
				description: data.description || "",
				start_time: data.start_time,
				end_time: data.end_time,
				hosts: data.hosts,
			});

			invalidateAgendaQueries();
		} catch (error) {
			const errMsg = ensureError(error).message;
			toast.error(errMsg || "Failed to add agenda");
			throw error;
		}
	};

	// Update agenda handler
	const handleUpdateAgenda = async (
		agendaId: string,
		data: {
			title: string;
			description?: string;
			start_time: string;
			end_time: string;
			hosts: Array<{ name: string; image?: File }>;
		}
	) => {
		if (!event?.id) {
			toast.error("Event ID is required");
			return;
		}

		try {
			await updateAgenda({
				event_Id: event.id,
				agenda_id: agendaId,
				title: data.title,
				description: data.description || "",
				start_time: data.start_time,
				end_time: data.end_time,
				hosts: data.hosts,
			});

			invalidateAgendaQueries();
		} catch (error) {
			const errMsg = ensureError(error).message;
			toast.error(errMsg || "Failed to update agenda");
			throw error;
		}
	};

	// Delete agenda handler
	const handleDeleteAgenda = async (agendaId: string) => {
		if (!event?.id) {
			toast.error("Event ID is required");
			return;
		}

		try {
			await deleteAgenda({
				event_Id: event.id,
				agenda_id: agendaId,
			});

			invalidateAgendaQueries();
		} catch (error) {
			const errMsg = ensureError(error).message;
			toast.error(errMsg || "Failed to delete agenda");
			throw error;
		}
	};

	return (
		<AgendaList
			agendas={agendas}
			onAddAgenda={handleAddAgenda}
			onUpdateAgenda={handleUpdateAgenda}
			onDeleteAgenda={handleDeleteAgenda}
			isLoading={isFetching}
		/>
	);
}
