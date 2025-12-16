"use client";

import { MoreVertical, User } from "lucide-react";
import Image from "next/image";
import AppDropdown from "@/components/app/app-dropdown";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { EventAgenda } from "@/types/event-agenda.types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type AgendaItemCardProps = {
	agenda: EventAgenda;
	onEdit: (agenda: EventAgenda) => void;
	onDelete: (agendaId: string) => void;
};

export default function AgendaItemCard({ agenda, onEdit, onDelete }: AgendaItemCardProps) {
	return (
		<Card className="relative bg-badge/10 border border-neutral-200 rounded-lg overflow-hidden transition-shadow group">
			{/* Left Accent Border */}
			<div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />

			{/* Content */}
			<div className="p-4">
				{/* Header with Time and Actions */}
				<div className="flex items-start justify-between">
					<div className="body-3 text-neutral-500">
						{agenda.start_time} - {agenda.end_time}
					</div>
					<div className="opacity-0 group-hover:opacity-100 transition-opacity">
						<AppDropdown
							trigger={
								<button className="p-1 hover:bg-neutral-100 rounded transition-colors">
									<MoreVertical className="w-4 h-4 text-neutral-600" />
								</button>
							}
							align="end"
						>
							<DropdownMenuItem onClick={() => onEdit(agenda)}>Edit</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onDelete(agenda.id)}
								className="text-red-600 focus:text-red-600"
							>
								Delete
							</DropdownMenuItem>
						</AppDropdown>
					</div>
				</div>

				{/* Title */}
				<h3 className="body-2 font-semibold text-neutral-900">{agenda.title}</h3>

				{/* Hosts */}
				{agenda.hosts.length > 0 && (
					<div className="mt-2">
						<div className="flex flex-wrap gap-2">
							{agenda.hosts.map((host) => (
								<Badge
									key={host.id}
									variant="outline"
									className="flex items-center gap-2 rounded-full px-3 py-1"
								>
									{host.host_image_url ? (
										<div className="relative w-6 h-6 rounded-full overflow-hidden">
											<Image
												src={host.host_image_url}
												alt={host.host_name}
												fill
												className="object-cover"
											/>
										</div>
									) : (
										<User className="w-4 h-4 text-neutral-500" />
									)}
									<span className="text-sm text-neutral-700">{host.host_name}</span>
								</Badge>
							))}
						</div>
					</div>
				)}

				{/* Divider */}
				{agenda.description && <div className="border-t border-neutral-200 my-2" />}

				{/* Description */}
				{agenda.description && <p className="text-sm text-neutral-600">{agenda.description}</p>}
			</div>
		</Card>
	);
}
