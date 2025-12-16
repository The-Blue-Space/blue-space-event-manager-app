import * as React from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppTooltip from "@/components/app/app-tooltip";

type TableActionsProps = {
	id: string;
	onViewDetails?: (orderId: string) => void;
};

export default React.memo(function TableActions(props: TableActionsProps) {
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
});
