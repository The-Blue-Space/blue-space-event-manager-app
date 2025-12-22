import * as React from "react";
import { Eye, Check, X, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppTooltip from "@/components/app/app-tooltip";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RefundStatus } from "@/types/refund.types";

type TableActionsProps = {
	id: string;
	status: RefundStatus;
	onViewDetails?: (refundId: string) => void;
	onApprove?: (refundId: string) => void;
	onReject?: (refundId: string) => void;
};

export default React.memo(function TableActions(props: TableActionsProps) {
	const isPending = props.status === "pending";

	if (!isPending) {
		return (
			<AppTooltip
				trigger={
					<Button
						variant="ghost"
						size="sm"
						onClick={() => props.onViewDetails?.(props.id)}
						className="h-8 w-8 p-0"
					>
						<Eye className="h-4 w-4" />
					</Button>
				}
			>
				View Details
			</AppTooltip>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => props.onViewDetails?.(props.id)}>
					<Eye className="mr-2 h-4 w-4" />
					View Details
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => props.onApprove?.(props.id)}
					className="text-success-600"
				>
					<Check className="mr-2 h-4 w-4" />
					Approve
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => props.onReject?.(props.id)}
					className="text-error-600"
				>
					<X className="mr-2 h-4 w-4" />
					Reject
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
});
