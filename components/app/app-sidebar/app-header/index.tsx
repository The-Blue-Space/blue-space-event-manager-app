import * as React from "react";
import Breadcrumbs from "./breadcrumbs";

export default function AppHeader() {
	return (
		<header className="flex items-end gap-5 px-3 lg:pt-10 pb-3.5 border-b lg:px-5">
			<div className="flex items-center justify-between h-full gap-3 grow">
				<Breadcrumbs />
			</div>
		</header>
	);
}
