import { cn } from "@/lib/utils";
import { SetupValues } from "./data";
import { TabsContent } from "@/components/ui/tabs";

type Props = {
	children: React.ReactNode;
	value: SetupValues;
	className?: string;
};
export default function TabContainer({ children, value, className }: Props) {
	const containerCn = cn("w-full h-full mt-0 p-5 space-y-5 max-w-4xl", className);
	return (
		<TabsContent value={value} className={containerCn}>
			{children}
			<div className="py-2" />
		</TabsContent>
	);
}
