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
import { Check, X, Ban, Undo2, MailPlus } from "lucide-react";
import getEventParticipants from "@/services/participants/get-event-participants";
import approveParticipant from "@/services/participants/approve-participant";
import rejectParticipant from "@/services/participants/reject-participant";
import blockParticipant from "@/services/participants/block-participant";
import retractParticipant from "@/services/participants/retract-participant";
import reinviteParticipant from "@/services/participants/reinvite-participant";
import { ParticipantStatus } from "@/types/participant.types";
import { getDateAndTime } from "@/lib/format-date";
import { toast } from "sonner";
import ensureError from "@/lib/ensure-error";
import Image from "next/image";
import Pagination from "@/components/app/pagination";

type ParticipantsTabProps = {
	eventId: string;
};

export default function ParticipantsTab({ eventId }: ParticipantsTabProps) {
	const [filter, setFilter] = useState<"all" | "pending">("pending");
	const [loadingAction, setLoadingAction] = useState<string | null>(null);
	const queryClient = useQueryClient();

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["event-participants", eventId, filter],
		queryFn: () =>
			getEventParticipants({
				event_id: eventId,
				status: filter === "pending" ? "pending" : undefined,
			}),
		enabled: !!eventId,
	});

	const handleApprove = async (participantId: string) => {
		setLoadingAction(participantId);
		try {
			await approveParticipant({ participant_id: participantId });
			toast.success("Participant approved successfully");
			queryClient.invalidateQueries({ queryKey: ["event-participants", eventId] });
		} catch (err) {
			const errMsg = ensureError(err).message;
			toast.error(errMsg);
		} finally {
			setLoadingAction(null);
		}
	};

	const handleReject = async (participantId: string) => {
		setLoadingAction(participantId);
		try {
			await rejectParticipant({ participant_id: participantId });
			toast.success("Participant rejected successfully");
			queryClient.invalidateQueries({ queryKey: ["event-participants", eventId] });
		} catch (err) {
			const errMsg = ensureError(err).message;
			toast.error(errMsg);
		} finally {
			setLoadingAction(null);
		}
	};

	const handleBlock = async (participantId: string) => {
		setLoadingAction(participantId);
		try {
			await blockParticipant({ participant_id: participantId });
			toast.success("Participant blocked successfully");
			queryClient.invalidateQueries({ queryKey: ["event-participants", eventId] });
		} catch (err) {
			const errMsg = ensureError(err).message;
			toast.error(errMsg);
		} finally {
			setLoadingAction(null);
		}
	};

	const handleRetract = async (participantId: string) => {
		setLoadingAction(participantId);
		try {
			await retractParticipant({ participant_id: participantId });
			toast.success("Invitation retracted successfully");
			queryClient.invalidateQueries({ queryKey: ["event-participants", eventId] });
		} catch (err) {
			const errMsg = ensureError(err).message;
			toast.error(errMsg);
		} finally {
			setLoadingAction(null);
		}
	};

	const handleReinvite = async (participantId: string) => {
		setLoadingAction(participantId);
		try {
			await reinviteParticipant({ participant_id: participantId });
			toast.success("Participant reinvited successfully");
			queryClient.invalidateQueries({ queryKey: ["event-participants", eventId] });
		} catch (err) {
			const errMsg = ensureError(err).message;
			toast.error(errMsg);
		} finally {
			setLoadingAction(null);
		}
	};

	const getStatusBadge = (status: ParticipantStatus, isBlocked: boolean) => {
		if (isBlocked) {
			return (
				<Badge variant="destructive" className="gap-1">
					<Ban className="w-3 h-3" />
					Blocked
				</Badge>
			);
		}

		const statusConfig = {
			pending: { label: "Pending", variant: "secondary" as const },
			invited: { label: "Invited", variant: "default" as const },
			joined: { label: "Joined", variant: "outline" as const },
			rejected: { label: "Rejected", variant: "destructive" as const },
			retracted: { label: "Retracted", variant: "secondary" as const },
		};

		const config = statusConfig[status];
		return <Badge variant={config.variant}>{config.label}</Badge>;
	};

	const getRoleLabel = (role: string) => {
		return role.charAt(0).toUpperCase() + role.slice(1);
	};

	const renderActions = (participantId: string, status: ParticipantStatus, isBlocked: boolean) => {
		const isActionLoading = loadingAction === participantId;

		if (isBlocked) {
			return <span className="text-sm text-neutral-400">No actions available</span>;
		}

		return (
			<div className="flex gap-2">
				{status === "pending" && (
					<>
						<AppTooltip
							trigger={
								<AppButton
									variant="outline"
									buttonType="icon"
									onClick={() => handleApprove(participantId)}
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
									onClick={() => handleReject(participantId)}
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
					</>
				)}

				{status === "invited" && (
					<AppTooltip
						trigger={
							<AppButton
								variant="outline"
								buttonType="icon"
								onClick={() => handleRetract(participantId)}
								isLoading={isActionLoading}
								disabled={isActionLoading}
								className="flex justify-center items-center h-8 w-8 p-0 text-error-600 hover:bg-error-50"
							>
								<Undo2 className="w-4 h-4" />
							</AppButton>
						}
					>
					Retract Invite
					</AppTooltip>
				)}

				{status === "retracted" && (
					<AppTooltip
						trigger={
							<AppButton
								variant="outline"
								buttonType="icon"
								onClick={() => handleReinvite(participantId)}
								isLoading={isActionLoading}
								disabled={isActionLoading}
								className="flex justify-center items-center h-8 w-8 p-0 text-primary-600 hover:bg-primary-50"
							>
								<MailPlus className="w-4 h-4" />
							</AppButton>
						}
					>
					Reinvite
					</AppTooltip>
				)}

				{status === "rejected" && (
					<AppTooltip
						trigger={
							<AppButton
								variant="outline"
								buttonType="icon"
								onClick={() => handleApprove(participantId)}
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
				)}

				{status === "joined" && (
					<AppTooltip
						trigger={
							<AppButton
								variant="outline"
								buttonType="icon"
								onClick={() => handleBlock(participantId)}
								isLoading={isActionLoading}
								disabled={isActionLoading}
								className="flex justify-center items-center h-8 w-8 p-0 text-error-600 hover:bg-error-50"
							>
								<Ban className="w-4 h-4" />
							</AppButton>
						}
					>
						Block User
					</AppTooltip>
				)}
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

			{/* Participants Table */}
			<Render isLoading={isLoading} isError={isError} error={error}>
				{data && data.docs.length > 0 ? (
					<div className="w-full overflow-x-auto rounded-lg border border-neutral-200">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Participant</TableHead>
									<TableHead>Role</TableHead>
									<TableHead>Joined Date</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.docs.map((participant) => {
									const joinedDate = participant.joined_at
										? getDateAndTime(participant.joined_at)
										: null;

									return (
										<TableRow key={participant.id}>
											<TableCell>
												<div className="flex items-center gap-3">
													{participant.user.avatar_url && (
														<Image
															src={participant.user.avatar_url}
															alt={participant.user.name}
															width={32}
															height={32}
															className="rounded-full"
														/>
													)}
													<div>
														<p className="font-medium text-neutral-900">{participant.user.name}</p>
														{participant.user.username && (
															<p className="text-sm text-neutral-500">
																@{participant.user.username}
															</p>
														)}
													</div>
												</div>
											</TableCell>

											<TableCell>
												<span className="text-sm text-neutral-700">
													{getRoleLabel(participant.role)}
												</span>
											</TableCell>

											<TableCell>
												{joinedDate ? (
													<div className="flex flex-col">
														<span className="text-sm text-neutral-700">{joinedDate.date}</span>
														<span className="text-xs text-neutral-500">{joinedDate.time}</span>
													</div>
												) : (
													<span className="text-sm text-neutral-400">-</span>
												)}
											</TableCell>

											<TableCell>
												{getStatusBadge(participant.status, participant.is_blocked)}
											</TableCell>

											<TableCell onClick={(e) => e.stopPropagation()}>
												{renderActions(participant.id, participant.status, participant.is_blocked)}
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
						title="No Participants"
						text={
							filter === "pending"
								? "No pending participant requests at the moment"
								: "No participants have joined this event yet"
						}
					/>
				)}

				{ data && data.totalPages  > 1 && <Pagination {...data} />}
			</Render>
		</div>
	);
}

