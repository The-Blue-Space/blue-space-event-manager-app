"use client";

import { useQuery } from "@tanstack/react-query";
import LineupList from "./lineup-list";
import getLineups from "@/services/events/event-lineup/get-lineups";
import addLineup from "@/services/events/event-lineup/add-lineup";
import updateLineup from "@/services/events/event-lineup/update-lineup";
import deleteLineup from "@/services/events/event-lineup/delete-lineup";
import reorderLineup from "@/services/events/event-lineup/reorder-lineup";
import { useEvent } from "../../../context";
import { toast } from "sonner";
import ensureError from "@/lib/ensure-error";
import invalidateQuery from "@/lib/invalidate-query";

export default function Lineup() {
	const { event } = useEvent();

	const { data: lineups = [], isLoading } = useQuery({
		queryKey: ["event-lineups", event?.id],
		queryFn: () => getLineups({ eventId: event?.id || "" }),
		enabled: !!event?.id,
	});

	const handleAddLineup = async (data: {
		artist_name: string;
		artist_image?: File;
		start_time?: string;
		end_time?: string;
		is_headliner: boolean;
		notes?: string;
		socials: string[];
	}) => {
		try {
			await addLineup({
				eventId: event?.id || "",
				...data,
			});

			toast.success("Artist added successfully");
			invalidateQuery(["event-lineups"]);
		} catch (error) {
			const errMsg = ensureError(error).message;
			toast.error(errMsg);
			throw error;
		}
	};

	const handleUpdateLineup = async (
		lineupId: string,
		data: {
			artist_name: string;
			artist_image?: File;
			start_time?: string;
			end_time?: string;
			is_headliner: boolean;
			notes?: string;
			socials: string[];
		}
	) => {
		try {
			await updateLineup({
				lineupId,
				...data,
			});

			toast.success("Artist updated successfully");
			invalidateQuery(["event-lineups"]);
		} catch (error) {
			const errMsg = ensureError(error).message;
			toast.error(errMsg);
			throw error;
		}
	};

	const handleDeleteLineup = async (lineupId: string) => {
		try {
			await deleteLineup({ lineupId });

			toast.success("Artist deleted successfully");
			invalidateQuery(["event-lineups"]);
		} catch (error) {
			const errMsg = ensureError(error).message;
			toast.error(errMsg);
			throw error;
		}
	};

	const handleReorderLineup = async (lineupId: string, newOrder: number) => {
		try {
			await reorderLineup({ lineupId, order: newOrder });
			invalidateQuery(["event-lineups"]);
		} catch (error) {
			const errMsg = ensureError(error).message;
			toast.error(errMsg);
			throw error;
		}
	};

	return (
		<LineupList
			lineups={lineups}
			onAddLineup={handleAddLineup}
			onUpdateLineup={handleUpdateLineup}
			onDeleteLineup={handleDeleteLineup}
			onReorderLineup={handleReorderLineup}
			isLoading={isLoading}
		/>
	);
}
