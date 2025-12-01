"use client";

import React, { useState } from "react";
import AppDialog from "@/components/app/app-dialog";
import AppButton from "@/components/app/app-button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, X } from "lucide-react";
import searchUsers from "@/services/participants/search-users";
import sendInvites from "@/services/participants/send-invites";
import { User } from "@/types/user.types";
import { toast } from "sonner";
import ensureError from "@/lib/ensure-error";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import AppCheckbox from "@/components/app/app-checkbox";

type InviteDialogProps = {
	open: boolean;
	onClose: (state: boolean) => void;
	eventId: string;
};

export default function InviteDialog({ open, onClose, eventId }: InviteDialogProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<User[]>([]);
	const [allSearchedUsers, setAllSearchedUsers] = useState<User[]>([]);
	const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
	const [isSearching, setIsSearching] = useState(false);
	const [isSending, setIsSending] = useState(false);
	const queryClient = useQueryClient();

	const handleSearch = async () => {
		if (!searchQuery.trim()) {
			toast.error("Please enter a search query");
			return;
		}

		setIsSearching(true);
		try {
			// Automatically detect search type based on presence of @
			const searchBy = searchQuery.includes("@") ? "email" : "username";

			const results = await searchUsers({
				query: searchQuery.trim(),
				searchBy,
			});

			const resultArray = Array.isArray(results) ? results : [results];

			setSearchResults(resultArray);

			// Merge new results with existing cached users (avoid duplicates)
			setAllSearchedUsers((prev) => {
				const newUsers = resultArray.filter(
					(newUser) => !prev.some((existingUser) => existingUser.id === newUser.id)
				);
				return [...prev, ...newUsers];
			});

			if (resultArray.length === 0) {
				toast.info(`No users found for "${searchQuery}"`);
			}
		} catch (error) {
			const errMsg = ensureError(error).message;
			toast.error(errMsg);
		} finally {
			setIsSearching(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleSearch();
		}
	};

	const toggleUserSelection = (userId: string) => {
		setSelectedUsers((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(userId)) {
				newSet.delete(userId);
			} else {
				newSet.add(userId);
			}
			return newSet;
		});
	};

	const handleSendInvites = async () => {
		if (selectedUsers.size === 0) {
			toast.error("Please select at least one user to invite");
			return;
		}

		setIsSending(true);
		try {
			const response = await sendInvites({
				event_id: eventId,
				user_ids: Array.from(selectedUsers),
			});

			toast.success(response.message, {
				description: `${response.invited_count} user(s) invited successfully`,
			});

			// Invalidate participants query to refresh the list
			queryClient.invalidateQueries({ queryKey: ["event-participants", eventId] });

			// Reset and close
			handleClose();
		} catch (error) {
			const errMsg = ensureError(error).message;
			toast.error(errMsg);
		} finally {
			setIsSending(false);
		}
	};

	const handleClose = () => {
		setSearchQuery("");
		setSearchResults([]);
		setAllSearchedUsers([]);
		setSelectedUsers(new Set());
		onClose(false);
	};

	const updateSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (searchResults.length > 0) {
			setSearchResults([]);
		}
		setSearchQuery(e.target.value);
	};

	return (
		<AppDialog
			preventCloseOnClickOutside={true}
			open={open}
			onClose={handleClose}
			title="Invite Participants"
			description="Search for users by email or username and send them event invitations"
			footer={
				<div className="flex justify-between gap-3 w-full">
					<AppButton variant="outline" onClick={handleClose}>
						Cancel
					</AppButton>
					<AppButton
						variant="primary"
						onClick={handleSendInvites}
						isLoading={isSending}
						disabled={selectedUsers.size === 0}
						leftIcon={<UserPlus className="w-4 h-4" />}
					>
						Send Invites ({selectedUsers.size})
					</AppButton>
				</div>
			}
		>
			<div className="space-y-4">
				{/* Search Section */}
				<div className="space-y-3">
					<div className="flex gap-2">
						<Input
							placeholder="Search by email or username..."
							value={searchQuery}
							onChange={updateSearch}
							onKeyDown={handleKeyPress}
							className="flex-1"
						/>
						<AppButton
							variant="outline"
							onClick={handleSearch}
							isLoading={isSearching}
							leftIcon={<Search className="w-4 h-4" />}
						>
							Search
						</AppButton>
					</div>
				</div>

				{/* Search Results */}
				<div className="space-y-2 max-h-96 overflow-y-auto">
					{searchResults.length > 0 ? (
						<>
							<p className="text-sm text-neutral-600">{searchResults.length} user(s) found</p>
							{searchResults.map((user) => (
								<div
									key={user.id}
									className="flex items-center gap-3 p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
									onClick={() => toggleUserSelection(user.id)}
								>
									<AppCheckbox
										id={user.id}
										checked={selectedUsers.has(user.id)}
										onCheckedChange={() => toggleUserSelection(user.id)}
									/>
									{user.avatar_url && (
										<Image
											src={user.avatar_url}
											alt={user.name}
											width={40}
											height={40}
											className="rounded-full"
										/>
									)}
									<div className="flex-1">
										<p className="body-2 font-medium text-neutral-900">{user.name}</p>
										<p className="body-3 text-neutral-600">{user.email}</p>
									</div>
									{user.is_verified && (
										<Badge variant="secondary" className="text-xs">
											Verified
										</Badge>
									)}
								</div>
							))}
						</>
					) : (
						<div className="text-center py-8 text-neutral-500">
							<Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
							<p className="text-sm">Search for users by email or username to send invitations</p>
						</div>
					)}
				</div>

				{/* Selected Users Summary */}
				{selectedUsers.size > 0 && (
					<div className="border-t border-neutral-200 pt-4">
						<div className="flex items-center justify-between mb-2">
							<p className="text-sm font-medium text-neutral-900">
								Selected Users ({selectedUsers.size})
							</p>
							<AppButton
								variant="ghost"
								buttonType="text"
								onClick={() => setSelectedUsers(new Set())}
								className="text-xs"
							>
								Clear All
							</AppButton>
						</div>
						<div className="flex flex-wrap gap-2">
							{Array.from(selectedUsers).map((userId) => {
								const user = allSearchedUsers.find((u) => u.id === userId);
								if (!user) return null;
								return (
									<Badge key={userId} variant="secondary" className="gap-1">
										{user.name}
										<X
											className="w-3 h-3 cursor-pointer hover:text-destructive-500"
											onClick={(e) => {
												e.stopPropagation();
												toggleUserSelection(userId);
											}}
										/>
									</Badge>
								);
							})}
						</div>
					</div>
				)}
			</div>
		</AppDialog>
	);
}
