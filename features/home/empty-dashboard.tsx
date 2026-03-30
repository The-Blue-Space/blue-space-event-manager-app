"use client";

import Link from "next/link";
import {
	CalendarPlus,
	Ticket,
	Users,
	TrendingUp,
	ArrowRight,
	Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
	{
		icon: Ticket,
		color: "text-primary-500",
		bgColor: "bg-primary-500/10",
		title: "Sell Tickets",
		description: "Create ticket tiers, set prices, apply promo codes and add-ons.",
	},
	{
		icon: Users,
		color: "text-accent-500",
		bgColor: "bg-accent-500/10",
		title: "Manage Guests",
		description: "Track RSVPs, check-ins, and your attendee list in real time.",
	},
	{
		icon: TrendingUp,
		color: "text-success-500",
		bgColor: "bg-success-500/10",
		title: "Track Revenue",
		description: "Monitor ticket sales, payouts, and refunds from one place.",
	},
];

export default function EmptyDashboard() {
	return (
		<div className="flex flex-col gap-5 w-full">
			{/* Hero card */}
			<Card className="w-full overflow-hidden border border-neutral-200">
				<CardContent className="p-0">
					{/* Top gradient strip */}
					<div className="h-1 w-full bg-gradient-to-r from-primary-500 via-primary-300 to-accent-500" />

					<div className="flex flex-col items-center justify-center text-center px-8 py-16 gap-6">
						{/* Icon */}
						<div className="relative">
							<div className="w-20 h-20 rounded-2xl bg-primary-500/10 flex items-center justify-center">
								<CalendarPlus className="w-10 h-10 text-primary-500" />
							</div>
							
						</div>

						{/* Text */}
						<div className="space-y-2 max-w-md">
							<h2 className="heading-6 text-primary-500">
								Launch your first event
							</h2>
							<p className="body-2 text-neutral-500 leading-relaxed">
								Everything you need to create memorable experiences — from ticket sales to
								guest management and real-time analytics.
							</p>
						</div>

						{/* CTA */}
						<Link href="/events/create">
							<button className="button-primary flex items-center gap-2 px-6 py-2.5 text-sm">
								Create an Event
								<ArrowRight className="w-4 h-4" />
							</button>
						</Link>
					</div>
				</CardContent>
			</Card>

			{/* Feature highlight cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
				{features.map((feat) => {
					const Icon = feat.icon;
					return (
						<Card
							key={feat.title}
							className="border border-neutral-200 hover:shadow-md transition-shadow"
						>
							<CardContent className="p-5 flex flex-col gap-3">
								<div className={`w-10 h-10 rounded-lg ${feat.bgColor} flex items-center justify-center`}>
									<Icon className={`w-5 h-5 ${feat.color}`} />
								</div>
								<div className="space-y-1">
									<p className="body-2 font-semibold text-primary-500">{feat.title}</p>
									<p className="body-3 text-neutral-500">{feat.description}</p>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
