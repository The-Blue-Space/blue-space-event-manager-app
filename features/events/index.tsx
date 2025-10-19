"use client";
import AppContainer from "@/components/app/container/container";
import ErrorBoundary from "@/components/app/error-boundary";
import useCustomNavigation from "@/hooks/use-navigation";
import useStorage from "@/hooks/use-storage";
import { EventsFilterParams } from "@/types/event.types";
import * as React from "react";
import EventsFilters from "./events-filters";
import EventsHeader from "./events-header";
import EventsOverview from "./events-overview";
import EventsCardsView from "./events-views/events-cards-view";
import EventsListView from "./events-views/events-list-view";
import EventsTableView from "./events-views/events-table-view";

type ViewMode = "cards" | "list" | "table";

const VIEW_MODE_STORAGE_KEY = "events-view-mode";

export default function Events() {
	const { queryParams } = useCustomNavigation();
	const storage = useStorage();

	// Load view mode from localStorage, default to "cards"
	const [viewMode, setViewMode] = React.useState<ViewMode>(() => {
		const stored = storage.get(VIEW_MODE_STORAGE_KEY);
		return (stored as ViewMode) || "cards";
	});

	// Get filters from URL params
	const filters = React.useMemo((): EventsFilterParams => {
		return {
			search: queryParams.get("search") || undefined,
			category: queryParams.get("category") || undefined,
			access_type: (queryParams.get("access_type") as any) || undefined,
			published: queryParams.get("published") || undefined,
			start_date: queryParams.get("start_date") || undefined,
			end_date: queryParams.get("end_date") || undefined,
			sort_by: queryParams.get("sort_by") || undefined,
			sort_order: (queryParams.get("sort_order") as "asc" | "desc") || undefined,
		};
	}, [queryParams]);

	// Persist view mode to localStorage
	const handleViewChange = (mode: ViewMode) => {
		setViewMode(mode);
		storage.set(VIEW_MODE_STORAGE_KEY, mode);
	};

	// Render the active view
	const renderView = () => {
		switch (viewMode) {
			case "list":
				return <EventsListView filters={filters} />;
			case "table":
				return <EventsTableView filters={filters} />;
			case "cards":
			default:
				return <EventsCardsView filters={filters} />;
		}
	};

	return (
		<ErrorBoundary>
			<AppContainer className="flex flex-col gap-5 overflow-hidden w-full">
				{/* Header */}
				<EventsHeader />

				{/* Overview Cards */}
				<EventsOverview />

				{/* Filters & View Toggle */}
				<EventsFilters viewMode={viewMode} onViewChange={handleViewChange} />

				{/* Events View */}
				<div className="flex-1 overflow-auto h-full">{renderView()}</div>
			</AppContainer>
		</ErrorBoundary>
	);
}
