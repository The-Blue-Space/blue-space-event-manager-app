import * as React from "react";
import useAppSelector from "@/store/hooks";
import { ChevronRight } from "lucide-react";
import useCustomNavigation from "@/hooks/use-navigation";

export default React.memo(function Breadcrumbs() {
	const { pathname } = useCustomNavigation();
	const { pageTitle } = useAppSelector("ui");
	
	const splittedTitle = React.useMemo(
		() => (pageTitle ? pageTitle.split(",") : pathname.slice(1).split("/")),
		[pageTitle, pathname]
	);
	return (
		<div className="flex overflow-x-auto gap-1 items-center w-full xl:overflow-x-hidden hide-scrollbar">
			{splittedTitle.map((title, idx) => {
				return (
					<div key={title} className="flex gap-1 items-center">
						<h3 key={title} className="!font-semibold body-2 capitalize">
							{title.trim().replace(/[_-]/g, " ")}
						</h3>
						{idx !== splittedTitle.length - 1 && <ChevronRight className="w-4 h-4" />}
					</div>
				);
			})}
		</div>
	);
});
