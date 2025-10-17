"use client";

import { useState } from "react";
import Render from "@/components/app/render";
import Link from "next/link";
import { HomeProps } from "..";
import OrdersTable from "./orders-table";
import OrderDetailsDrawer from "./order-details";

export default function RecentOrders({ isLoading, data }: HomeProps) {
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const handleViewDetails = (orderId: string) => {
		setSelectedOrderId(orderId);
		setDrawerOpen(true);
	};

	const handleDrawerClose = (open: boolean) => {
		setDrawerOpen(open);
		if (!open) {
			// Delay clearing the ID to allow drawer animation to complete
			setTimeout(() => setSelectedOrderId(null), 300);
		}
	};

	return (
		<>
			<div className="flex flex-col gap-3 w-full">
				<div className="flex justify-between items-center">
					<h2 className="font-semibold text-neutral-700">Recent Orders</h2>
					<Link href="/orders" className="body-3 text-secondary-500 hover:underline">
						View all orders
					</Link>
				</div>
				<div className="flex flex-col max-h-96">
					<Render isLoading={isLoading}>
						<div className="overflow-auto border rounded-lg">
							<OrdersTable
								data={data?.recent_orders ?? []}
								isEmpty={!isLoading && data?.recent_orders.length === 0}
								onViewDetails={handleViewDetails}
							/>
						</div>
					</Render>
				</div>
			</div>

			<OrderDetailsDrawer
				orderId={selectedOrderId}
				open={drawerOpen}
				onOpenChange={handleDrawerClose}
			/>
		</>
	);
}
