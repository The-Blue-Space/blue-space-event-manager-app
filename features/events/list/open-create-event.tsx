"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import useActions from "@/store/actions";

/** /events/create opens the create dialog over the events list, so old links keep working. */
export default function OpenCreateEvent() {
	const router = useRouter();
	const { ui } = useActions();
	React.useEffect(() => {
		router.replace("/events");
		ui.changeDialog({ show: true, type: "create_event" });
	}, [router, ui]);
	return null;
}
