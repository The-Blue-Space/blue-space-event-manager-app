import { Mail, Phone, User } from "lucide-react";
import { Order } from "@/types/order.types";
import Image from "next/image";

type Prop = {
	order: Order;
};
export default function CustomerDetails({ order }: Prop) {
	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 text-neutral-900">
				<User className="h-4 w-4 text-accent-500" />
				<h3 className="font-semibold text-sm">Customer Information</h3>
			</div>
			<div className="bg-neutral-50 rounded-lg p-4 space-y-3">
				<div className="flex items-center gap-3">
					{order?.user?.avatar_url ? (
						<Image
							src={order?.user?.avatar_url}
							alt={order?.user?.name}
							className="w-10 h-10 rounded-full object-cover"
							width={40}
							height={40}
						/>
					) : (
						<div className="w-10 h-10 rounded-full bg-primary-300 flex items-center justify-center text-white font-semibold">
							{order?.user?.name?.charAt(0).toUpperCase()}
						</div>
					)}
					<div className="flex-1 min-w-0">
						<p className="text-sm font-semibold text-neutral-900">{order?.user?.name}</p>
						{order?.user?.username && (
							<p className="text-xs text-neutral-500">@{order?.user?.username}</p>
						)}
					</div>
				</div>
				{order?.user?.email && (
					<div className="flex items-center gap-2">
						<Mail className="h-3.5 w-3.5 text-neutral-500" />
						<span className="text-xs text-neutral-600">{order?.user?.email}</span>
					</div>
				)}
				{order?.user?.phone && (
					<div className="flex items-center gap-2">
						<Phone className="h-3.5 w-3.5 text-neutral-500" />
						<span className="text-xs text-neutral-600">{order?.user?.phone}</span>
					</div>
				)}
			</div>
		</div>
	);
}
