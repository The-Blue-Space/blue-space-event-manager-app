import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import * as React from "react";

type OverviewCardProps = {
	title: string;
	value: string | number;
	icon: LucideIcon;
	iconColor?: string;
	iconBgColor?: string;
};

export default React.memo(function OverviewCard({
	title,
	value,
	icon: Icon,
	iconColor = "text-primary-600",
	iconBgColor = "bg-primary-100",
}: OverviewCardProps) {
	return (
		<Card className="overflow-hidden hover:shadow-md transition-all duration-300  w-full min-w-[280px]  lg:min-w-0 snap-start">
			<CardContent className="p-5">
				<div className="flex items-center justify-between gap-3">
					<div className="flex-1">
						<p className="body-2 font-medium text-primary-500 mb-1">{title}</p>
						<h3 className="heading-7 font-bold text-primary-500">{value}</h3>
					</div>
					<div className={`p-3 rounded-lg ${iconBgColor}`}>
						<Icon className={`w-6 h-6 ${iconColor}`} />
					</div>
				</div>
			</CardContent>
		</Card>
	);
});
