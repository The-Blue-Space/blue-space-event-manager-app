"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrders } from "@/services/orders";
import { getEvents } from "@/services/events";
import OrdersTable from "./orders-table";
import OrderDetailsDrawer from "./order-details";
import TableSearchBar from "./table-header/table-search-bar";
import Filters from "./table-header/filters";
import OverviewCards from "./overview-cards";
import Pagination from "@/components/app/pagination";
import useCustomNavigation from "@/hooks/use-navigation";
import AppContainer from "@/components/app/container/container";
import useOrdersFilter from "./table-header/use-orders-filter";
import Render from "@/components/app/render";

export default function Orders() {
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const { queryParams } = useCustomNavigation();
	const filter = useOrdersFilter();

	// Get query params
	const page = queryParams.get("page");
	const search = queryParams.get("search");
	const eventId = queryParams.get("event_id");
	const paymentStatus = queryParams.get("payment_status");

	// Fetch orders
	const { data, isFetching, isError, error } = useQuery({
		queryKey: ["orders", page, search, eventId, paymentStatus],
		queryFn: () =>
			getOrders({
				page: page ? Number(page) : 1,
				limit: 10,
				search: search || undefined,
				event_id: eventId || undefined,
				payment_status: paymentStatus as any,
			}),
	});

	// Fetch events for filter dropdown
	const { data: eventsData } = useQuery({
		queryKey: ["events-list"],
		queryFn: () =>
			getEvents({
				page: 1,
				limit: 100,
			}),
	});

	const orders = data?.docs || [];
	const events = eventsData?.docs || [];

	const handleViewDetails = (orderId: string) => {
		setSelectedOrderId(orderId);
		setDrawerOpen(true);
	};

	const handleDrawerClose = (open: boolean) => {
		setDrawerOpen(open);
		if (!open) {
			setTimeout(() => setSelectedOrderId(null), 300);
		}
	};

	const handleSearchChange = (value: string) => {
		filter.change("search", value);
		filter.submit();
	};

	return (
		<AppContainer>
			<div className="space-y-6">
				{/* Page Header */}
				<div>
					<h1 className="heading-6 font-bold text-neutral-900">Orders</h1>
					<p className="body-3 text-neutral-600 mt-1">View and manage all your event orders</p>
				</div>

				{/* Overview Cards */}
				<OverviewCards />

				{/* Filters & Search */}
				<div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
					<TableSearchBar
						value={search || ""}
						onChange={handleSearchChange}
						placeholder="Search by username or reference..."
						disabled={isFetching}
					/>
					<Filters
						formData={filter.formData}
						change={filter.change}
						submit={filter.submit}
						reset={filter.reset}
						isLoading={filter.isLoading || isFetching}
						events={events}
					/>
				</div>

				{/* <Render isLoading={isFetching} isError={isError} error={error}>
					<div className="flex flex-col h-screen border rounded-lg">
						<div className="overflow-auto grow w-full">
							<TransactionTable
								data={data?.docs ?? []}
								isEmpty={!isFetching && (!data?.docs || data.docs.length === 0)}
							/>
						</div>
						{data && data.docs.length > 0 && <Pagination {...data} />}
					</div>
				</Render> */}

				{/* Orders Table */}
				<Render isLoading={isFetching} isError={isError} error={error} loadType="spinner">
					<div className="flex flex-col h-screen border rounded-lg">
						<div className="overflow-auto grow w-full">
							<OrdersTable
								data={orders}
								isEmpty={!isFetching && (!orders || orders.length === 0)}
								onViewDetails={handleViewDetails}
							/>
						</div>
						{data && data.totalPages > 1 && <Pagination {...data} />}
					</div>
				</Render>
			</div>

			{/* Order Details Drawer */}
			<OrderDetailsDrawer
				orderId={selectedOrderId}
				open={drawerOpen}
				onOpenChange={handleDrawerClose}
			/>
		</AppContainer>
	);
}
