import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import useActions from "@/store/actions";
import { EyeIcon, SquareArrowOutUpRight } from "lucide-react";

type ViewDetailsProps = {
	id: string;
};
export default function ViewDetails(props: ViewDetailsProps) {
	const { ui } = useActions();

	const toggleShow = () => {
		ui.changeDialog({ show: true, type: "order_details", id: props.id });
	};

	return (
		<DropdownMenuItem>
			<button onClick={toggleShow} className="flex gap-2 items-center">
				<EyeIcon className="w-4 h-4" /> <SquareArrowOutUpRight />
			</button>
		</DropdownMenuItem>
	);
}
