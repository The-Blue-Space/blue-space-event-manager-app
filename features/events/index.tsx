"use client";
import ErrorBoundary from "@/components/app/error-boundary";
import EventsList from "./list";

export default function Events() {
	return (
		<ErrorBoundary>
			<EventsList />
		</ErrorBoundary>
	);
}
