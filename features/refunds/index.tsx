"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRefunds, approveRefund, rejectRefund } from "@/services/refunds";
import { getEvents } from "@/services/events";
import RefundsTable from "./refunds-table";
import RefundDetailsDrawer from "./refund-details";
import TableSearchBar from "./table-header/table-search-bar";
import Filters from "./table-header/filters";
import OverviewCards from "./overview-cards";
import Pagination from "@/components/app/pagination";
import useCustomNavigation from "@/hooks/use-navigation";
import AppContainer from "@/components/app/container/container";
import useRefundsFilter from "./table-header/use-refunds-filter";
import Render from "@/components/app/render";
import ApproveDialog from "./dialogs/approve-dialog";
import RejectDialog from "./dialogs/reject-dialog";
import { toast } from "sonner";
import { RefundStatus, RefundType } from "@/types/refund.types";

export default function Refunds() {
	const queryClient = useQueryClient();
	const [selectedRefundId, setSelectedRefundId] = useState<string | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [approveDialogOpen, setApproveDialogOpen] = useState(false);
	const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
	const [actionRefundId, setActionRefundId] = useState<string | null>(null);

	const { queryParams } = useCustomNavigation();
	const filter = useRefundsFilter();

	// Get query params
	const page = queryParams.get("page");
	const search = queryParams.get("search");
	const eventId = queryParams.get("event_id");
	const status = queryParams.get("status");
	const refundType = queryParams.get("refund_type");

	// Fetch refunds
	const { data, isFetching, isError, error } = useQuery({
		queryKey: ["refunds", page, search, eventId, status, refundType],
		queryFn: () =>
			getRefunds({
				page: page ? Number(page) : 1,
				limit: 10,
				search: search || undefined,
				event_id: eventId || undefined,
				status: status as RefundStatus | undefined,
				type: refundType as RefundType | undefined,
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

	// Approve mutation
	const approveMutation = useMutation({
		mutationFn: (refundId: string) => approveRefund({ refundId }),
		onSuccess: () => {
			toast.success("Refund approved successfully");
			queryClient.invalidateQueries({ queryKey: ["refunds"] });
			queryClient.invalidateQueries({ queryKey: ["refunds-stats"] });
			queryClient.invalidateQueries({ queryKey: ["refund-details", actionRefundId] });
			setApproveDialogOpen(false);
			setActionRefundId(null);
			setDrawerOpen(false);
		},
		onError: () => {
			toast.error("Failed to approve refund");
		},
	});

	// Reject mutation
	const rejectMutation = useMutation({
		mutationFn: ({ refundId, note }: { refundId: string; note: string }) =>
			rejectRefund({ refundId, rejection_note: note }),
		onSuccess: () => {
			toast.success("Refund rejected successfully");
			queryClient.invalidateQueries({ queryKey: ["refunds"] });
			queryClient.invalidateQueries({ queryKey: ["refunds-stats"] });
			queryClient.invalidateQueries({ queryKey: ["refund-details", actionRefundId] });
			setRejectDialogOpen(false);
			setActionRefundId(null);
			setDrawerOpen(false);
		},
		onError: () => {
			toast.error("Failed to reject refund");
		},
	});

	const refunds = data?.docs || [];
	const events = eventsData?.docs || [];

	const handleViewDetails = (refundId: string) => {
		setSelectedRefundId(refundId);
		setDrawerOpen(true);
	};

	const handleDrawerClose = (open: boolean) => {
		setDrawerOpen(open);
		if (!open) {
			setTimeout(() => setSelectedRefundId(null), 300);
		}
	};

	const handleSearchChange = (value: string) => {
		filter.change("search", value);
		filter.submit();
	};

	const handleApprove = (refundId: string) => {
		setActionRefundId(refundId);
		setApproveDialogOpen(true);
	};

	const handleReject = (refundId: string) => {
		setActionRefundId(refundId);
		setRejectDialogOpen(true);
	};

	const handleConfirmApprove = () => {
		if (actionRefundId) {
			approveMutation.mutate(actionRefundId);
		}
	};

	const handleConfirmReject = (note: string) => {
		if (actionRefundId) {
			rejectMutation.mutate({ refundId: actionRefundId, note });
		}
	};

	return (
		<AppContainer>
			<div className="space-y-6">
				{/* Page Header */}
				<div>
					<h1 className="heading-6 font-bold text-neutral-900">Refunds</h1>
					<p className="body-3 text-neutral-600 mt-1">View and manage refund requests</p>
				</div>

				{/* Overview Cards */}
				<OverviewCards />

				{/* Filters & Search */}
				<div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
					<TableSearchBar
						value={search || ""}
						onChange={handleSearchChange}
						placeholder="Search by customer name or email..."
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

				{/* Refunds Table */}
				<Render isLoading={isFetching} isError={isError} error={error} loadType="spinner">
					<div className="flex flex-col h-screen border rounded-lg">
						<div className="overflow-auto grow w-full">
							<RefundsTable
								data={refunds}
								isEmpty={!isFetching && (!refunds || refunds.length === 0)}
								onViewDetails={handleViewDetails}
								onApprove={handleApprove}
								onReject={handleReject}
							/>
						</div>
						{data && data.totalPages > 1 && <Pagination {...data} />}
					</div>
				</Render>
			</div>

			{/* Refund Details Drawer */}
			<RefundDetailsDrawer
				refundId={selectedRefundId}
				open={drawerOpen}
				onOpenChange={handleDrawerClose}
				onApprove={handleApprove}
				onReject={handleReject}
			/>

			{/* Approve Dialog */}
			<ApproveDialog
				open={approveDialogOpen}
				onOpenChange={setApproveDialogOpen}
				onConfirm={handleConfirmApprove}
				isLoading={approveMutation.isPending}
			/>

			{/* Reject Dialog */}
			<RejectDialog
				open={rejectDialogOpen}
				onOpenChange={setRejectDialogOpen}
				onConfirm={handleConfirmReject}
				isLoading={rejectMutation.isPending}
			/>
		</AppContainer>
	);
}
