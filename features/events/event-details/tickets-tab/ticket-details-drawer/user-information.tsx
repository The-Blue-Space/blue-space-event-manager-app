"use client";

import { UserTicket } from "@/types/user-ticket.types";
import Image from "next/image";
import { Mail, Phone, User, User as UserIcon } from "lucide-react";

type UserInformationProps = {
	ticket: UserTicket;
};

export default function UserInformation({ ticket }: UserInformationProps) {
	const user = ticket.user;

	if (!user) {
		return (
			<div className="space-y-4">
				<h3 className="font-semibold text-neutral-900">User Information</h3>
				<p className="text-sm text-neutral-500">No user information available</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<User className="w-5 h-5 text-accent-500" />
				<h3 className="body-1 font-semibold text-neutral-900">User Information</h3>
			</div>
			<div className="space-y-4 bg-neutral-50 p-4 rounded-lg">
				{/* User Avatar & Name */}
				<div className="flex items-center gap-3">
					{user.avatar_url ? (
						<Image
							src={user.avatar_url}
							alt={user.name}
							width={48}
							height={48}
							className="rounded-full object-cover"
						/>
					) : (
						<div className="w-12 h-12 rounded-full bg-primary-300 flex items-center justify-center text-white font-semibold">
							{user.name.charAt(0)}
						</div>
					)}
					<div>
						<p className="font-medium text-neutral-900">{user.name}</p>
						<p className="text-xs text-neutral-500">Customer</p>
					</div>
				</div>

				{/* Contact Details */}
				<div className="space-y-3">
					<div className="flex items-center gap-3">
						<Mail className="w-4 h-4 text-neutral-500" />
						<div className="flex-1">
							<p className="text-xs text-neutral-500">Email</p>
							<p className="text-sm text-neutral-900">{user.email}</p>
						</div>
					</div>

					{user.phone && (
						<div className="flex items-center gap-3">
							<Phone className="w-4 h-4 text-neutral-500" />
							<div className="flex-1">
								<p className="text-xs text-neutral-500">Phone</p>
								<p className="text-sm text-neutral-900">{user.phone}</p>
							</div>
						</div>
					)}

					<div className="flex items-center gap-3">
						<UserIcon className="w-4 h-4 text-neutral-500" />
						<div className="flex-1">
							<p className="text-xs text-neutral-500">User ID</p>
							<p className="text-sm text-neutral-900 font-mono">{user.id}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
