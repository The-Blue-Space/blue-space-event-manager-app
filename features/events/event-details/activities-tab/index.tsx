"use client";

import AppCheckbox from "@/components/app/app-checkbox";
import EmptyData from "@/components/app/empty-data";
import Render from "@/components/app/render";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getEventActivities } from "@/services/events";
import {
	ACTIVITY_TYPE_LABELS,
	ACTIVITY_TYPES,
	ActivityType,
	EventActivity,
} from "@/types/event.types";
import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Ticket, Users } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type ActivitiesTabProps = {
	eventId: string;
};

export default function ActivitiesTab({ eventId }: ActivitiesTabProps) {
	const [showFilters, setShowFilters] = useState(false);
	const [filters, setFilters] = useState<ActivityType[]>([...ACTIVITY_TYPES]);

	const { data: activities, isLoading } = useQuery({
		queryKey: ["event-activities", eventId],
		queryFn: () => getEventActivities({ eventId }),
		enabled: !!eventId,
	});

	const filteredActivities = activities?.filter((activity) => filters.includes(activity.type));

	const toggleFilter = (type: ActivityType) => {
		setFilters((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
	};

	return (
		<div className="space-y-4 border rounded-lg shadow-sm p-2">
			{/* Filters */}
			<div className="border-b border-neutral-200 pb-3">
				<div className="flex justify-between items-center">
					<h4 className="body-2 text-neutral-700">Activity Feed</h4>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setShowFilters(!showFilters)}
						className="text-xs"
					>
						Filter Activities ({filters.length})
					</Button>
				</div>
				{showFilters && (
					<div className="mt-3 grid grid-cols-2 gap-2">
						{ACTIVITY_TYPES.map((type) => (
							<div key={type} className="flex items-center space-x-2">
								<AppCheckbox
									id={type}
									checked={filters.includes(type)}
									onCheckedChange={() => toggleFilter(type)}
								/>
								<label
									htmlFor={type}
									className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
								>
									{ACTIVITY_TYPE_LABELS[type]}
								</label>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Activity Feed */}
			<div className="space-y-3 lg:max-h-[600px] overflow-y-auto hide-scrollbar">
				<Render isLoading={isLoading} loadingComponent={<LoadingComponent />}>
					{filteredActivities && filteredActivities.length === 0 ? (
						<EmptyData
							showIcon={false}
							text="No activities feed yet."
							className="!justify-start py-8"
						/>
					) : (
						filteredActivities?.map((activity) => (
							<ActivityItem key={activity.id} activity={activity} />
						))
					)}
				</Render>
			</div>
		</div>
	);
}

function LoadingComponent() {
	return (
		<div className="space-y-3">
			{[1, 2, 3, 4].map((i) => (
				<div key={i} className="flex gap-3">
					<Skeleton className="h-10 w-10 rounded-full" />
					<div className="flex-1 space-y-2">
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-3 w-1/2" />
					</div>
				</div>
			))}
		</div>
	);
}

type ActivityItemProps = {
	activity: EventActivity;
};

function ActivityItem({ activity }: ActivityItemProps) {
	const getActivityIcon = (type: ActivityType) => {
		switch (type) {
			case "ticket_purchase":
				return <Ticket className="w-4 h-4 text-accent-500" />;
			case "check_in":
				return <Users className="w-4 h-4 text-success-500" />;
			case "event_update":
				return <Calendar className="w-4 h-4 text-primary-500" />;
			case "comment":
				return <MapPin className="w-4 h-4 text-neutral-500" />;
			case "refund":
				return <Ticket className="w-4 h-4 text-error-500" />;
		}
	};

	const formatTimestamp = (timestamp: string) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (minutes < 60) return `${minutes}m ago`;
		if (hours < 24) return `${hours}h ago`;
		return `${days}d ago`;
	};

	return (
		<div className="flex gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors">
			{/* User Avatar */}
			<div className="relative flex-shrink-0">
				{activity.user.avatar_url ? (
					<Image
						src={activity.user.avatar_url}
						alt={activity.user.name}
						width={40}
						height={40}
						loading="lazy"
						className="w-10 h-10 rounded-full object-cover"
					/>
				) : (
					<div className="w-10 h-10 rounded-full bg-primary-300 flex items-center justify-center text-white font-semibold text-sm">
						{activity.user.name.charAt(0)}
					</div>
				)}
				{/* Activity Icon Badge */}
				<div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white border border-neutral-200">
					{getActivityIcon(activity.type)}
				</div>
			</div>

			{/* Activity Info */}
			<div className="flex-1 min-w-0">
				<div className="flex items-start justify-between gap-2">
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium text-neutral-900">{activity.user.name}</p>
						<p className="text-xs text-neutral-600">{activity.action}</p>
					</div>
					<span className="text-xs text-neutral-400 whitespace-nowrap">
						{formatTimestamp(activity.timestamp)}
					</span>
				</div>
				<p className="text-xs text-neutral-500 mt-1">{activity.details}</p>
			</div>
		</div>
	);
}
