"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import AppButton from "@/components/app/app-button";
import AppTooltip from "@/components/app/app-tooltip";
import EmptyData from "@/components/app/empty-data";
import Render from "@/components/app/render";
import AppDialog from "@/components/app/app-dialog";
import { Textarea } from "@/components/app/form-input";
import { Check, X, Clock, Store } from "lucide-react";
import getEventVendorApplications from "@/services/events/vendor-applications/get-event-vendor-applications";
import approveVendorApplication from "@/services/events/vendor-applications/approve-vendor-application";
import rejectVendorApplication from "@/services/events/vendor-applications/reject-vendor-application";
import waitlistVendorApplication from "@/services/events/vendor-applications/waitlist-vendor-application";
import { VendorApplicationStatus } from "@/types/vendor.types";
import { getDateAndTime } from "@/lib/format-date";
import { toast } from "sonner";
import ensureError from "@/lib/ensure-error";
import { amountSeparator } from "@/lib/amount-separator";

type VendorApplicationsTabProps = {
	eventId: string;
};

export default function VendorApplicationsTab({ eventId }: VendorApplicationsTabProps) {
	const [filter, setFilter] = useState<"all" | "pending">("pending");
	const [loadingAction, setLoadingAction] = useState<string | null>(null);
	const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
	const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
	const [rejectReason, setRejectReason] = useState("");
	const queryClient = useQueryClient();

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["vendor-applications", eventId, filter],
		queryFn: () =>
			getEventVendorApplications({
				event_id: eventId,
				status: filter === "pending" ? "pending" : undefined,
			}),
		enabled: !!eventId,
	});

	const handleApprove = async (applicationId: string) => {
		setLoadingAction(applicationId);
		try {
			await approveVendorApplication({ id: applicationId, event_id: eventId });
			toast.success("Application approved successfully");
			queryClient.invalidateQueries({ queryKey: ["vendor-applications", eventId] });
		} catch (err) {
			const errMsg = ensureError(err).message;
			toast.error(errMsg);
		} finally {
			setLoadingAction(null);
		}
	};

	const handleRejectClick = (applicationId: string) => {
		setSelectedApplicationId(applicationId);
		setRejectReason("");
		setRejectDialogOpen(true);
	};

	const handleRejectConfirm = async () => {
		if (!selectedApplicationId) return;

		setLoadingAction(selectedApplicationId);
		try {
			await rejectVendorApplication({
				id: selectedApplicationId,
				event_id: eventId,
				reason: rejectReason || "Application rejected",
			});
			toast.success("Application rejected successfully");
			queryClient.invalidateQueries({ queryKey: ["vendor-applications", eventId] });
			setRejectDialogOpen(false);
		} catch (err) {
			const errMsg = ensureError(err).message;
			toast.error(errMsg);
		} finally {
			setLoadingAction(null);
		}
	};

	const handleWaitlist = async (applicationId: string) => {
		setLoadingAction(applicationId);
		try {
			await waitlistVendorApplication({ id: applicationId, event_id: eventId });
			toast.success("Application added to waitlist");
			queryClient.invalidateQueries({ queryKey: ["vendor-applications", eventId] });
		} catch (err) {
			const errMsg = ensureError(err).message;
			toast.error(errMsg);
		} finally {
			setLoadingAction(null);
		}
	};

	const getStatusBadge = (status: VendorApplicationStatus) => {
		const statusConfig = {
			pending: { label: "Pending", variant: "secondary" as const, icon: Clock },
			approved: { label: "Approved", variant: "default" as const, icon: Check },
			rejected: { label: "Rejected", variant: "destructive" as const, icon: X },
			waitlisted: { label: "Waitlisted", variant: "outline" as const, icon: Clock },
			cancelled: { label: "Cancelled", variant: "secondary" as const, icon: X },
		};

		const config = statusConfig[status];
		const Icon = config.icon;
		return (
			<Badge variant={config.variant} className="gap-1">
				<Icon className="w-3 h-3" />
				{config.label}
			</Badge>
		);
	};

	const renderActions = (applicationId: string, status: VendorApplicationStatus) => {
		const isActionLoading = loadingAction === applicationId;

		if (status !== "pending") {
			return <span className="text-sm text-neutral-400">-</span>;
		}

		return (
			<div className="flex gap-2">
				<AppTooltip
					trigger={
						<AppButton
							variant="outline"
							buttonType="icon"
							onClick={() => handleApprove(applicationId)}
							isLoading={isActionLoading}
							disabled={isActionLoading}
							className="flex justify-center items-center h-8 w-8 p-0 text-success-600 hover:bg-success-50"
						>
							<Check className="w-4 h-4" />
						</AppButton>
					}
				>
					Approve
				</AppTooltip>

				<AppTooltip
					trigger={
						<AppButton
							variant="outline"
							buttonType="icon"
							onClick={() => handleRejectClick(applicationId)}
							isLoading={isActionLoading}
							disabled={isActionLoading}
							className="flex justify-center items-center h-8 w-8 p-0 text-error-600 hover:bg-error-50"
						>
							<X className="w-4 h-4" />
						</AppButton>
					}
				>
					Reject
				</AppTooltip>

				<AppTooltip
					trigger={
						<AppButton
							variant="outline"
							buttonType="icon"
							onClick={() => handleWaitlist(applicationId)}
							isLoading={isActionLoading}
							disabled={isActionLoading}
							className="flex justify-center items-center h-8 w-8 p-0 text-warning-600 hover:bg-warning-50"
						>
							<Clock className="w-4 h-4" />
						</AppButton>
					}
				>
					Add to Waitlist
				</AppTooltip>
			</div>
		);
	};

	return (
		<div className="space-y-4">
			{/* Filter Tabs */}
			<div className="flex gap-2">
				<Badge
					variant={filter === "pending" ? "default" : "outline"}
					className="cursor-pointer px-4 py-2"
					onClick={() => setFilter("pending")}
				>
					Pending
				</Badge>
				<Badge
					variant={filter === "all" ? "default" : "outline"}
					className="cursor-pointer px-4 py-2"
					onClick={() => setFilter("all")}
				>
					All
				</Badge>
			</div>

			{/* Applications Table */}
			<Render isLoading={isLoading} isError={isError} error={error}>
				{data && data.data.length > 0 ? (
					<div className="w-full overflow-x-auto rounded-lg border border-neutral-200">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Vendor</TableHead>
									<TableHead>Package</TableHead>
									<TableHead>Quantity</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Applied On</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.data.map((application) => {
									const appliedDate = getDateAndTime(application.created_at);
									const totalAmount = application.package
										? application.package.price * application.quantity
										: 0;

									return (
										<TableRow key={application.id}>
											<TableCell>
												<div className="flex items-center gap-3">
													<div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
														<Store className="w-4 h-4 text-primary-600" />
													</div>
													<div>
														<p className="font-medium text-neutral-900">
															{application.vendor_profile?.business_name || "Unknown Vendor"}
														</p>
														{application.vendor_profile?.business_category && (
															<p className="text-sm text-neutral-500">
																{application.vendor_profile.business_category}
															</p>
														)}
													</div>
												</div>
											</TableCell>

											<TableCell>
												<span className="text-sm text-neutral-700">
													{application.package?.name || "Unknown Package"}
												</span>
											</TableCell>

											<TableCell>
												<span className="text-sm text-neutral-700">
													{application.quantity}
												</span>
											</TableCell>

											<TableCell>
												{totalAmount > 0 ? (
													<span className="text-sm font-medium text-neutral-900">
														{application.package?.currency?.symbol || ""}{" "}
														{amountSeparator(totalAmount)}
													</span>
												) : (
													<span className="text-sm text-neutral-500">Free</span>
												)}
											</TableCell>

											<TableCell>
												<div className="flex flex-col">
													<span className="text-sm text-neutral-700">{appliedDate.date}</span>
													<span className="text-xs text-neutral-500">{appliedDate.time}</span>
												</div>
											</TableCell>

											<TableCell>{getStatusBadge(application.status)}</TableCell>

											<TableCell onClick={(e) => e.stopPropagation()}>
												{renderActions(application.id, application.status)}
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>
				) : (
					<EmptyData
						showIcon={true}
						title="No Vendor Applications"
						text={
							filter === "pending"
								? "No pending vendor applications at the moment"
								: "No vendors have applied for this event yet"
						}
					/>
				)}
			</Render>

			{/* Reject Dialog */}
			<AppDialog
				open={rejectDialogOpen}
				onOpenChange={setRejectDialogOpen}
				title="Reject Application"
				description="Please provide a reason for rejecting this vendor application."
				confirmText="Reject"
				confirmVariant="destructive"
				onConfirm={handleRejectConfirm}
				isLoading={loadingAction === selectedApplicationId}
			>
				<div className="py-4">
					<Textarea
						label="Rejection Reason"
						placeholder="Enter the reason for rejection..."
						value={rejectReason}
						onChange={(e) => setRejectReason(e.target.value)}
						rows={3}
						floatingLabel
					/>
				</div>
			</AppDialog>
		</div>
	);
}
